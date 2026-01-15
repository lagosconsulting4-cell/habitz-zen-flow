import Stripe from "npm:stripe";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
const n8nBaseUrl = Deno.env.get("N8N_BASE_URL") ?? "https://n8n-evo-n8n.harxon.easypanel.host/webhook";
const n8nWebhookUrl = `${n8nBaseUrl}/bora-welcome`; // Legacy welcome flow
const n8nTrialJourneyUrl = `${n8nBaseUrl}/trial-journey`;
const n8nPaymentFailedUrl = `${n8nBaseUrl}/payment-failed`;
const n8nSubscriptionCanceledUrl = `${n8nBaseUrl}/subscription-canceled`;

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
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Helper: Find user by email - check purchases and profiles tables (efficient)
  const findUserByEmail = async (email: string): Promise<string | null> => {
    const normalizedEmail = email.toLowerCase();

    // 1. Check purchases table first (has email index)
    const { data: purchase } = await supabaseAdmin
      .from("purchases")
      .select("user_id")
      .eq("email", normalizedEmail)
      .not("user_id", "is", null)
      .limit(1)
      .maybeSingle();

    if (purchase?.user_id) {
      console.log(`Found user via purchases table for: ${email}`);
      return purchase.user_id;
    }

    // 2. Check profiles table (has email column with index)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (profile?.user_id) {
      console.log(`Found user via profiles table for: ${email}`);
      return profile.user_id;
    }

    console.log(`User not found in purchases or profiles for: ${email}`);
    return null;
  };

  // Helper: Create user account from Stripe customer
  const createUserFromStripe = async (email: string, customerName?: string): Promise<string | null> => {
    try {
      console.log(`Creating user account for: ${email}`);

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        email_confirm: true,
        user_metadata: {
          full_name: customerName ?? "Cliente Stripe",
          created_via: "stripe-webhook"
        }
      });

      if (authError) {
        // Handle case where user already exists
        if (authError.code === "email_exists") {
          console.log(`User already exists for ${email}, fetching existing user...`);

          // Try to find in profiles table first
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("user_id")
            .eq("email", email.toLowerCase())
            .limit(1)
            .maybeSingle();

          if (profile?.user_id) {
            console.log(`✅ Found existing user: ${profile.user_id}`);
            return profile.user_id;
          }

          // Profile not found - fetch user_id from auth.users via RPC
          console.log(`Profile not found, fetching from auth.users via RPC for ${email}...`);

          const { data: existingUserId, error: rpcError } = await supabaseAdmin
            .rpc("get_user_id_by_email", { p_email: email.toLowerCase() });

          if (rpcError) {
            console.error(`RPC error fetching user: ${rpcError.message}`);
          }

          if (existingUserId) {
            console.log(`✅ Found user via RPC: ${existingUserId}`);

            // Create missing profile
            const { error: profileError } = await supabaseAdmin
              .from("profiles")
              .insert({
                user_id: existingUserId,
                email: email.toLowerCase(),
                display_name: customerName ?? "Cliente Stripe",
              })
              .single();

            if (profileError) {
              console.warn(`⚠️ Failed to create profile, but continuing: ${profileError.message}`);
            } else {
              console.log(`✅ Profile created for user: ${existingUserId}`);
            }

            return existingUserId;
          }

          console.error(`User exists but not found via RPC for ${email}`);
          return null;
        }

        console.error(`Failed to create auth user for ${email}:`, authError);
        return null;
      }

      if (!authData.user) {
        console.error(`No user data returned for ${email}`);
        return null;
      }

      const userId = authData.user.id;
      console.log(`✅ Auth user created: ${userId}`);
      // Profile will be created by handle_new_user() trigger automatically
      return userId;
    } catch (error) {
      console.error(`Error creating user from Stripe:`, error);
      return null;
    }
  };

  // Helper: Notify N8N for email workflows
  const notifyN8N = async (payload: {
    event: string;
    email: string;
    customerName: string;
    userId: string;
    isNewUser: boolean;
    productName?: string;
    amount?: number;
    trialEndDate?: string;
    isTrial?: boolean;
    subscriptionId?: string;
    failureCount?: number;
  }, webhookUrl?: string) => {
    try {
      const n8nPayload = {
        event: payload.event,
        Product: { name: payload.productName ?? "Habitz Premium (Stripe)" },
        Customer: {
          email: payload.email,
          full_name: payload.customerName,
          first_name: payload.customerName.split(" ")[0],
        },
        user_id: payload.userId,
        is_new_user: payload.isNewUser,
        is_trial: payload.isTrial ?? false,
        trial_end_date: payload.trialEndDate,
        subscription_id: payload.subscriptionId,
        failure_count: payload.failureCount,
        amount: payload.amount,
        provider: "stripe",
        timestamp: new Date().toISOString(),
      };

      const targetUrl = webhookUrl ?? n8nWebhookUrl;
      console.log(`📤 Sending to N8N (${targetUrl}):`, JSON.stringify(n8nPayload));

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
      });

      if (response.ok) {
        console.log(`✅ N8N webhook executado com sucesso: ${targetUrl}`);
      } else {
        console.warn(`⚠️ Erro N8N (${response.status}) em ${targetUrl}`);
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao chamar N8N (${webhookUrl ?? n8nWebhookUrl}):`, error);
      // Don't block the main webhook
    }
  };

  // Helper: Upsert purchase record
  const upsertPurchase = async (payload: {
    userId: string;
    email?: string;
    sessionId?: string;
    paymentIntentId?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    amount: number;
    currency: string;
    status: "paid" | "open" | "failed" | "refunded";
    billingInterval?: "month" | "year";
    trialEndDate?: string;
  }) => {
    // Determine the best conflict resolution key based on available data
    // For subscription events, use stripe_subscription_id
    // For checkout sessions, use provider_session_id
    const conflictKey = payload.stripeSubscriptionId
      ? "stripe_subscription_id"
      : "provider_session_id";

    const { error } = await supabaseAdmin
      .from("purchases")
      .upsert(
        {
          user_id: payload.userId,
          email: payload.email?.toLowerCase(),
          provider: "stripe",
          provider_session_id: payload.sessionId,
          provider_payment_intent: payload.paymentIntentId,
          stripe_customer_id: payload.stripeCustomerId,
          stripe_subscription_id: payload.stripeSubscriptionId,
          amount_cents: payload.amount,
          currency: payload.currency.toUpperCase(),
          status: payload.status,
          billing_interval: payload.billingInterval,
          trial_end_date: payload.trialEndDate,
        },
        { onConflict: conflictKey }
      );

    if (error) {
      console.error("Failed to upsert purchase:", error);
      throw error;
    }

    console.log(`Purchase upserted for user ${payload.userId}, status: ${payload.status} (conflict key: ${conflictKey})`);
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
        let userId = session.metadata?.user_id;
        const customerEmail = session.customer_details?.email;
        const customerName = session.customer_details?.name ?? "Cliente Stripe";
        let isNewUser = false;

        // If no user_id in metadata, try to find/create user by email
        if (!userId && customerEmail) {
          console.log(`No user_id in metadata, trying to find/create user for: ${customerEmail}`);

          userId = await findUserByEmail(customerEmail);

          if (!userId) {
            console.log(`User not found, creating account for: ${customerEmail}`);
            userId = await createUserFromStripe(customerEmail, customerName);
            isNewUser = true;

            if (!userId) {
              console.error(`Failed to create user for ${customerEmail}, skipping`);
              break;
            }

            console.log(`✅ User account created from checkout for ${customerEmail}`);
          } else {
            console.log(`✅ Found existing user for ${customerEmail}`);
          }
        }

        if (!userId) {
          console.log("No user_id and no email in session, skipping");
          break;
        }

        await upsertPurchase({
          userId,
          email: customerEmail,
          sessionId: session.id,
          paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "BRL",
          status: "paid",
        });

        // Update user_cohorts with acquisition_source and first_purchase_date
        if (userId) {
          const { error: cohortError } = await supabaseAdmin
            .from("user_cohorts")
            .update({
              acquisition_source: "stripe",
              first_purchase_date: new Date().toISOString().split("T")[0],
            })
            .eq("user_id", userId)
            .is("first_purchase_date", null); // Only update if not already set

          if (cohortError) {
            console.error("[stripe-webhook] User cohort update error:", cohortError);
          } else {
            console.log("[stripe-webhook] User cohort updated for:", userId);
          }
        }

        // Notify N8N for welcome email workflow
        if (customerEmail) {
          await notifyN8N({
            event: "CHECKOUT_COMPLETED",
            email: customerEmail,
            customerName,
            userId,
            isNewUser,
            amount: session.amount_total ?? 0,
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

        const customerEmail = customer.email;
        const customerName = customer.name ?? "Cliente Stripe";
        let isNewUser = false;

        // Try to find existing user, or create if doesn't exist
        let userId = await findUserByEmail(customerEmail);
        if (!userId) {
          console.log(`User not found for ${customerEmail}, creating account...`);
          userId = await createUserFromStripe(customerEmail, customerName);
          isNewUser = true;

          if (!userId) {
            console.error(`Failed to create user for ${customerEmail}, skipping purchase creation`);
            break;
          }

          console.log(`✅ User account created automatically for ${customerEmail}`);
        }

        const interval = subscription.items.data[0]?.price?.recurring?.interval;
        const amount = subscription.items.data[0]?.price?.unit_amount ?? 0;
        const isTrial = subscription.status === "trialing";
        const trialEndDate = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : undefined;

        await upsertPurchase({
          userId,
          email: customerEmail,
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          amount,
          currency: subscription.currency,
          status: subscription.status === "active" || subscription.status === "trialing" ? "paid" : "open",
          billingInterval: interval === "month" ? "month" : "year",
          trialEndDate,
        });

        // Notify N8N for welcome email workflow
        await notifyN8N({
          event: "SUBSCRIPTION_CREATED",
          email: customerEmail,
          customerName,
          userId,
          isNewUser,
          isTrial,
          trialEndDate,
          subscriptionId: subscription.id,
          amount,
        });

        // If this is a trial subscription, also trigger trial journey workflow
        if (isTrial) {
          console.log(`🎯 Trial subscription detected, triggering trial-journey workflow`);
          await notifyN8N({
            event: "SUBSCRIPTION_CREATED",
            email: customerEmail,
            customerName,
            userId,
            isNewUser,
            isTrial: true,
            trialEndDate,
            subscriptionId: subscription.id,
            amount,
          }, n8nTrialJourneyUrl);
        }
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
        const customer = await stripe.customers.retrieve(subscription.customer as string);

        // Mark purchase as refunded to deactivate premium
        await updatePurchaseBySubscription(subscription.id, "refunded");

        // Notify N8N for churn/winback email sequence
        if (!customer.deleted && customer.email) {
          const userId = await findUserByEmail(customer.email);

          // Send to dedicated churn-winback workflow
          await notifyN8N({
            event: "SUBSCRIPTION_CANCELED",
            email: customer.email,
            customerName: customer.name ?? "Cliente",
            userId: userId ?? "",
            isNewUser: false,
            subscriptionId: subscription.id,
          }, n8nSubscriptionCanceledUrl);
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        // Triggered 3 days before trial ends
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);

        if (customer.deleted || !customer.email) {
          console.log("Customer deleted or no email, skipping trial_will_end");
          break;
        }

        const trialEndDate = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : undefined;

        const userId = await findUserByEmail(customer.email);

        console.log(`📧 Trial ending in 3 days for ${customer.email}`);

        await notifyN8N({
          event: "TRIAL_ENDING_3D",
          email: customer.email,
          customerName: customer.name ?? "Cliente",
          userId: userId ?? "",
          isNewUser: false,
          isTrial: true,
          trialEndDate,
          subscriptionId: subscription.id,
        });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription || !invoice.customer_email) {
          break;
        }

        const subscriptionId = invoice.subscription as string;
        const userId = await findUserByEmail(invoice.customer_email);
        if (!userId) {
          console.log(`No user found for email ${invoice.customer_email}, skipping`);
          break;
        }

        // Check if this is a recovery from failed payment
        const { data: purchase } = await supabaseAdmin
          .from("purchases")
          .select("payment_failure_count")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        const wasInFailedState = (purchase?.payment_failure_count ?? 0) > 0;

        // Update purchase - reset failure tracking if recovered
        const { error: updateError } = await supabaseAdmin
          .from("purchases")
          .update({
            status: "paid",
            payment_failure_count: 0,
            last_payment_recovered_at: wasInFailedState ? new Date().toISOString() : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);

        if (updateError) {
          console.error(`Failed to update purchase for subscription ${subscriptionId}:`, updateError);
        }

        if (wasInFailedState) {
          console.log(`✅ Payment recovered for subscription ${subscriptionId}`);

          // Notify N8N that payment was recovered (to stop recovery sequence)
          await notifyN8N({
            event: "PAYMENT_RECOVERED",
            email: invoice.customer_email,
            customerName: invoice.customer_name ?? "Cliente",
            userId,
            isNewUser: false,
            subscriptionId,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription) {
          break;
        }

        const subscriptionId = invoice.subscription as string;

        // Get current failure count and increment
        const { data: purchase } = await supabaseAdmin
          .from("purchases")
          .select("payment_failure_count, user_id")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        const currentFailureCount = purchase?.payment_failure_count ?? 0;
        const newFailureCount = currentFailureCount + 1;

        // Update purchase with failure tracking
        const { error: updateError } = await supabaseAdmin
          .from("purchases")
          .update({
            status: "failed",
            payment_failure_count: newFailureCount,
            last_payment_failure_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);

        if (updateError) {
          console.error(`Failed to update payment failure for subscription ${subscriptionId}:`, updateError);
        }

        console.log(`💳 Payment failed (#${newFailureCount}) for subscription ${subscriptionId}`);

        // Notify N8N for payment recovery email sequence
        if (invoice.customer_email) {
          const userId = purchase?.user_id ?? await findUserByEmail(invoice.customer_email);

          // Send to dedicated payment-failed workflow for recovery sequence
          await notifyN8N({
            event: "PAYMENT_FAILED",
            email: invoice.customer_email,
            customerName: invoice.customer_name ?? "Cliente",
            userId: userId ?? "",
            isNewUser: false,
            subscriptionId,
            failureCount: newFailureCount,
            amount: invoice.amount_due ?? 0,
          }, n8nPaymentFailedUrl);
        }
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
