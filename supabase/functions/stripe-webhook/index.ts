import Stripe from "npm:stripe";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");

if (!stripeSecret || !webhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing environment variables for stripe-webhook function");
}

const stripe = new Stripe(stripeSecret ?? "", {
  apiVersion: "2024-06-20",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Not allowed", { status: 405 });
  }

  if (!stripeSecret || !webhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
    return new Response("Misconfigured", { status: 500 });
  }

  const signature = req.headers.get("Stripe-Signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  const upsertPurchase = async (payload: {
    userId: string;
    sessionId?: string;
    paymentIntentId?: string;
    amount: number;
    currency: string;
    status: "paid" | "open" | "failed" | "refunded";
  }) => {
    const { error } = await supabaseAdmin
      .from("purchases")
      .upsert(
        {
          user_id: payload.userId,
          provider: "stripe",
          provider_session_id: payload.sessionId,
          provider_payment_intent: payload.paymentIntentId,
          amount_cents: payload.amount,
          currency: payload.currency.toUpperCase(),
          status: payload.status,
        },
        { onConflict: "provider_session_id" }
      );

    if (error) {
      throw error;
    }
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        if (!userId) {
          break;
        }
        await upsertPurchase({
          userId,
          sessionId: session.id,
          paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "BRL",
          status: "paid",
        });
        break;
      }
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const userId = intent.metadata?.user_id;
        if (!userId) {
          break;
        }
        await upsertPurchase({
          userId,
          sessionId: undefined,
          paymentIntentId: intent.id,
          amount: intent.amount_received ?? intent.amount ?? 0,
          currency: intent.currency ?? "BRL",
          status: "paid",
        });
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const userId = charge.metadata?.user_id;
        if (!userId) {
          break;
        }
        await upsertPurchase({
          userId,
          sessionId: undefined,
          paymentIntentId: charge.payment_intent ? String(charge.payment_intent) : undefined,
          amount: charge.amount_refunded ?? charge.amount ?? 0,
          currency: charge.currency ?? "BRL",
          status: "refunded",
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Failed to process webhook", error);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
});
