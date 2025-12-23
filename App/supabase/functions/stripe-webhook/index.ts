import Stripe from "npm:stripe";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendUTMifyPurchase, sendUTMifyRefund } from "../_shared/utmify.ts";

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

  // Helper: Find user by email
  const findUserByEmail = async (email: string): Promise<string | null> => {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !data) {
      console.log(`User not found for email: ${email}`);
      return null;
    }

    return data.user_id;
  };

  // Helper: Create user account from Stripe customer
  const createUserFromStripe = async (email: string): Promise<string | null> => {
    try {
      console.log(`Creating user account for: ${email}`);

      // Create auth user (without password - will be set later)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        email_confirm: true, // Auto-confirm email
      });

      if (authError || !authData.user) {
        console.error(`Failed to create auth user for ${email}:`, authError);
        return null;
      }

      const userId = authData.user.id;
      console.log(`Auth user created: ${userId}`);

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          user_id: userId,
          email: email.toLowerCase(),
          is_premium: false, // Will be activated by trigger when purchase is created
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error(`Failed to create profile for ${email}:`, profileError);
        // Try to cleanup auth user
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return null;
      }

      console.log(`Profile created for user ${userId}`);
      return userId;
    } catch (error) {
      console.error(`Error creating user from Stripe:`, error);
      return null;
    }
  };

  // Helper: Upsert purchase record
  const upsertPurchase = async (payload: {
    userId: string;
    sessionId?: string;
    paymentIntentId?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    amount: number;
    currency: string;
    status: "paid" | "open" | "failed" | "refunded";
    billingInterval?: "month" | "year";
  }) => {
    const { error } = await supabaseAdmin
      .from("purchases")
      .upsert(
        {
          user_id: payload.userId,
          provider: "stripe",
          provider_session_id: payload.sessionId,
          provider_payment_intent: payload.paymentIntentId,
          stripe_customer_id: payload.stripeCustomerId,
          stripe_subscription_id: payload.stripeSubscriptionId,
          amount_cents: payload.amount,
          currency: payload.currency.toUpperCase(),
          status: payload.status,
          billing_interval: payload.billingInterval,
        },
        { onConflict: "provider_session_id" }
      );

    if (error) {
      console.error("Failed to upsert purchase:", error);
      throw error;
    }

    console.log(`Purchase upserted for user ${payload.userId}, status: ${payload.status}`);
  };

  // Helper: Update purchase by subscription ID
  const updatePurchaseBySubscription = async (
    subscriptionId: string,
    status: "paid" | "refunded" | "failed"
  ) => {
    const { error } = await supabaseAdmin
      .from("purchases")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error(`Failed to update purchase for subscription ${subscriptionId}:`, error);
      throw error;
    }

    console.log(`Purchase updated for subscription ${subscriptionId}, new status: ${status}`);
  };

  try {
    console.log(`Processing event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (!userId) {
          console.log("No user_id in session metadata, skipping");
          break;
        }

        await upsertPurchase({
          userId,
          sessionId: session.id,
          paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "BRL",
          status: "paid",
        });

        // Send Purchase event to UTMify → Meta Pixel
        if (session.customer_details?.email) {
          const nameParts = session.customer_details.name?.split(" ") || [];
          await sendUTMifyPurchase({
            email: session.customer_details.email,
            phone: session.customer_details.phone || undefined,
            firstName: nameParts[0] || undefined,
            lastName: nameParts.slice(1).join(" ") || undefined,
            value: (session.amount_total ?? 0) / 100, // Convert cents to dollars
            currency: session.currency ?? "BRL",
            transactionId: session.id,
            subscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
            status: "approved",
          });
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);

        if (customer.deleted || !customer.email) {
          console.log("Customer deleted or no email, skipping");
          break;
        }

        // Try to find existing user, or create if doesn't exist
        let userId = await findUserByEmail(customer.email);
        if (!userId) {
          console.log(`User not found for ${customer.email}, creating account...`);
          userId = await createUserFromStripe(customer.email);

          if (!userId) {
            console.error(`Failed to create user for ${customer.email}, skipping purchase creation`);
            break;
          }

          console.log(`✅ User account created automatically for ${customer.email}`);
        }

        const interval = subscription.items.data[0]?.price?.recurring?.interval;
        const amount = subscription.items.data[0]?.price?.unit_amount ?? 0;

        await upsertPurchase({
          userId,
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          amount,
          currency: subscription.currency,
          status: subscription.status === "active" || subscription.status === "trialing" ? "paid" : "open",
          billingInterval: interval === "month" ? "month" : "year",
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // If subscription is canceled or unpaid, mark as refunded
        if (subscription.status === "canceled" || subscription.status === "unpaid") {
          await updatePurchaseBySubscription(subscription.id, "refunded");
        }
        // If subscription is active or trialing, mark as paid
        else if (subscription.status === "active" || subscription.status === "trialing") {
          await updatePurchaseBySubscription(subscription.id, "paid");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Mark purchase as refunded to deactivate premium
        await updatePurchaseBySubscription(subscription.id, "refunded");
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription || !invoice.customer_email) {
          break;
        }

        const userId = await findUserByEmail(invoice.customer_email);
        if (!userId) {
          console.log(`No user found for email ${invoice.customer_email}, skipping`);
          break;
        }

        // For recurring payments, update existing purchase to paid
        await updatePurchaseBySubscription(invoice.subscription as string, "paid");
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription) {
          break;
        }

        // Mark purchase as failed (will deactivate premium if no other active purchases)
        await updatePurchaseBySubscription(invoice.subscription as string, "failed");
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
          paymentIntentId: intent.id,
          stripeCustomerId: typeof intent.customer === "string" ? intent.customer : undefined,
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
          paymentIntentId: charge.payment_intent ? String(charge.payment_intent) : undefined,
          amount: charge.amount_refunded ?? charge.amount ?? 0,
          currency: charge.currency ?? "BRL",
          status: "refunded",
        });

        // Send Refund event to UTMify
        if (charge.billing_details?.email) {
          const nameParts = charge.billing_details.name?.split(" ") || [];
          await sendUTMifyRefund({
            email: charge.billing_details.email,
            phone: charge.billing_details.phone || undefined,
            firstName: nameParts[0] || undefined,
            lastName: nameParts.slice(1).join(" ") || undefined,
            value: (charge.amount_refunded ?? charge.amount ?? 0) / 100,
            currency: charge.currency ?? "BRL",
            transactionId: charge.id,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }
  } catch (error) {
    console.error("Failed to process webhook:", error);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
});
