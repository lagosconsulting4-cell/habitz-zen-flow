/**
 * Hubla Webhook Handler
 *
 * Handles Hubla payment events for Bora App and Foquinha AI products.
 * Creates user accounts, records purchases, activates premium, and notifies N8N.
 *
 * Based on patterns from stripe-webhook/index.ts and kirvano-webhook/index.ts.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const serviceRoleKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
const hublaToken = Deno.env.get("HUBLA_WEBHOOK_TOKEN");
const n8nBaseUrl =
  Deno.env.get("N8N_BASE_URL") ??
  "https://n8n-evo-n8n.harxon.easypanel.host/webhook";
const n8nWebhookUrl = `${n8nBaseUrl}/bora-welcome`;
const n8nPixPendingUrl = `${n8nBaseUrl}/pix-pending`;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("[hubla-webhook] Missing SUPABASE_URL or SERVICE_ROLE_KEY");
}

if (!hublaToken) {
  console.warn(
    "[hubla-webhook] ⚠️ HUBLA_WEBHOOK_TOKEN not set — skipping token validation"
  );
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "content-type, x-hubla-token, x-hubla-idempotency",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Misconfigured", {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Token validation
  if (hublaToken) {
    const requestToken = req.headers.get("x-hubla-token");
    if (!requestToken || requestToken !== hublaToken) {
      console.error("[hubla-webhook] Invalid or missing x-hubla-token");
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }
  }

  // Parse body
  const rawBody = await req.text();
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("[hubla-webhook] Invalid JSON body");
    return new Response("Bad Request", { status: 400, headers: corsHeaders });
  }

  const eventType: string = payload.type ?? "";
  const idempotencyKey = req.headers.get("x-hubla-idempotency");

  console.log(`[hubla-webhook] 📋 Event: ${eventType}`);
  if (idempotencyKey) {
    console.log(`[hubla-webhook] 🔑 Idempotency: ${idempotencyKey}`);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // ─── Helpers ───────────────────────────────────────────────────────

  // Normalize phone to digits only (pattern from stripe-webhook)
  const normalizePhone = (
    phone: string | null | undefined
  ): string | undefined => {
    if (!phone) return undefined;
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 ? digits : undefined;
  };

  const normalizeEmail = (
    email: string | null | undefined
  ): string | null => {
    return email ? email.trim().toLowerCase() : null;
  };

  // Find user by email — checks purchases then profiles (pattern from stripe-webhook)
  const findUserByEmail = async (
    email: string
  ): Promise<string | null> => {
    const normalized = email.toLowerCase();

    const { data: purchase } = await supabaseAdmin
      .from("purchases")
      .select("user_id")
      .eq("email", normalized)
      .not("user_id", "is", null)
      .limit(1)
      .maybeSingle();

    if (purchase?.user_id) {
      console.log(
        `[hubla-webhook] Found user via purchases for: ${email}`
      );
      return purchase.user_id;
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("email", normalized)
      .limit(1)
      .maybeSingle();

    if (profile?.user_id) {
      console.log(
        `[hubla-webhook] Found user via profiles for: ${email}`
      );
      return profile.user_id;
    }

    return null;
  };

  // Create user from Hubla data (pattern from stripe-webhook)
  const createUserFromHubla = async (
    email: string,
    displayName: string,
    phone?: string
  ): Promise<string | null> => {
    try {
      console.log(`[hubla-webhook] Creating user for: ${email}`);

      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email.toLowerCase(),
          email_confirm: true,
          user_metadata: {
            full_name: displayName,
            created_via: "hubla-webhook",
          },
        });

      if (authError) {
        if (authError.code === "email_exists") {
          console.log(
            `[hubla-webhook] User already exists for ${email}, looking up...`
          );

          // Try profiles table
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("user_id")
            .eq("email", email.toLowerCase())
            .limit(1)
            .maybeSingle();

          if (profile?.user_id) {
            console.log(
              `[hubla-webhook] ✅ Found existing user: ${profile.user_id}`
            );
            return profile.user_id;
          }

          // Fallback to RPC
          const { data: existingUserId, error: rpcError } =
            await supabaseAdmin.rpc("get_user_id_by_email", {
              p_email: email.toLowerCase(),
            });

          if (rpcError) {
            console.error(
              `[hubla-webhook] RPC error: ${rpcError.message}`
            );
          }

          if (existingUserId) {
            console.log(
              `[hubla-webhook] ✅ Found user via RPC: ${existingUserId}`
            );

            // Create missing profile
            await supabaseAdmin
              .from("profiles")
              .insert({
                user_id: existingUserId,
                email: email.toLowerCase(),
                display_name: displayName,
                phone,
              })
              .single();

            return existingUserId;
          }

          console.error(
            `[hubla-webhook] User exists but not found for ${email}`
          );
          return null;
        }

        console.error(
          `[hubla-webhook] Failed to create user: ${authError.message}`
        );
        return null;
      }

      if (!authData?.user) {
        console.error(`[hubla-webhook] No user data returned for ${email}`);
        return null;
      }

      const userId = authData.user.id;
      console.log(`[hubla-webhook] ✅ Auth user created: ${userId}`);

      // Create profile with phone
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          user_id: userId,
          email: email.toLowerCase(),
          display_name: displayName,
          phone,
        })
        .single();

      if (profileError) {
        console.warn(
          `[hubla-webhook] ⚠️ Profile insert failed (trigger may handle): ${profileError.message}`
        );
      } else {
        console.log(`[hubla-webhook] ✅ Profile created for: ${userId}`);
      }

      return userId;
    } catch (error) {
      console.error(`[hubla-webhook] Error creating user:`, error);
      return null;
    }
  };

  // Set or revoke premium on profile
  const setUserPremium = async (
    userId: string,
    isPremium: boolean
  ) => {
    const update: Record<string, unknown> = {
      is_premium: isPremium,
      updated_at: new Date().toISOString(),
    };
    if (isPremium) {
      update.premium_since = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(update)
      .eq("user_id", userId);

    if (error) {
      console.error(
        `[hubla-webhook] Failed to set premium for ${userId}: ${error.message}`
      );
    } else {
      console.log(
        `[hubla-webhook] ${isPremium ? "✅ Premium activated" : "❌ Premium revoked"} for: ${userId}`
      );
    }
  };

  // Notify N8N (pattern from stripe-webhook)
  const notifyN8N = async (data: {
    event: string;
    email: string;
    customerName: string;
    userId: string;
    isNewUser: boolean;
    productName?: string;
    amount?: number;
  }) => {
    try {
      const n8nPayload = {
        event: data.event,
        Product: { name: data.productName ?? "Habitz Premium (Hubla)" },
        Customer: {
          email: data.email,
          full_name: data.customerName,
          first_name: data.customerName.split(" ")[0],
        },
        user_id: data.userId,
        is_new_user: data.isNewUser,
        provider: "hubla",
        amount: data.amount,
        timestamp: new Date().toISOString(),
      };

      console.log(
        `[hubla-webhook] 📤 Sending to N8N: ${JSON.stringify(n8nPayload)}`
      );

      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
      });

      if (response.ok) {
        console.log(`[hubla-webhook] ✅ N8N webhook sent`);
      } else {
        console.warn(
          `[hubla-webhook] ⚠️ N8N error (${response.status})`
        );
      }
    } catch (error) {
      console.warn(`[hubla-webhook] ⚠️ N8N call failed:`, error);
    }
  };

  // ─── Extract helpers ──────────────────────────────────────────────

  const extractUserData = (event: any) => {
    const user = event?.user;
    if (!user?.email) return null;

    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";
    const displayName =
      `${firstName} ${lastName}`.trim() || "Cliente Hubla";

    return {
      email: normalizeEmail(user.email)!,
      displayName,
      phone: normalizePhone(user.phone),
      hublaUserId: user.id,
    };
  };

  const extractProductNames = (event: any): string => {
    const products = event?.products ?? [];
    const names = products
      .map((p: any) => p?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "Habitz Premium (Hubla)";
  };

  // ─── Event handlers ───────────────────────────────────────────────

  try {
    switch (eventType) {
      // ════════════════════════════════════════════════════════════════
      // SUBSCRIPTION CREATED — Full data, creates user + purchase
      // ════════════════════════════════════════════════════════════════
      case "subscription.created": {
        const event = payload.event;
        const userData = extractUserData(event);

        if (!userData) {
          console.error(
            "[hubla-webhook] No user email in subscription.created"
          );
          break;
        }

        const productNames = extractProductNames(event);
        const subscription = event?.subscription;
        const subscriptionId = subscription?.id;
        const lastInvoice = subscription?.lastInvoice;
        const amountCents = lastInvoice?.amount?.totalCents ?? 0;
        const currency = lastInvoice?.currency ?? "BRL";
        const paymentMethod = subscription?.paymentMethod ?? null;

        console.log(
          `[hubla-webhook] 👤 ${userData.displayName} <${userData.email}>`
        );
        console.log(
          `[hubla-webhook] 📦 Products: ${productNames}`
        );
        console.log(
          `[hubla-webhook] 💰 Amount: ${amountCents} cents`
        );

        // Find or create user
        let isNewUser = false;
        let userId = await findUserByEmail(userData.email);

        if (!userId) {
          userId = await createUserFromHubla(
            userData.email,
            userData.displayName,
            userData.phone
          );
          isNewUser = true;

          if (!userId) {
            console.error(
              `[hubla-webhook] Failed to create user for ${userData.email}`
            );
            break;
          }
        } else {
          // Update phone for existing user if not set
          if (userData.phone) {
            await supabaseAdmin
              .from("profiles")
              .update({ phone: userData.phone })
              .eq("user_id", userId)
              .is("phone", null);
          }
        }

        // Upsert purchase
        const { error: purchaseError } = await supabaseAdmin
          .from("purchases")
          .upsert(
            {
              user_id: userId,
              email: userData.email,
              provider: "hubla",
              provider_session_id: subscriptionId,
              provider_payment_intent: lastInvoice?.id,
              amount_cents: amountCents,
              currency: currency.toUpperCase(),
              status: "open",
              product_names: productNames,
              payment_method: paymentMethod,
            },
            { onConflict: "provider_session_id" }
          );

        if (purchaseError) {
          console.error(
            `[hubla-webhook] Purchase upsert failed:`,
            purchaseError
          );
        } else {
          console.log(
            `[hubla-webhook] ✅ Purchase recorded (status: open)`
          );
        }

        // Update user cohorts
        await supabaseAdmin
          .from("user_cohorts")
          .update({
            acquisition_source: "hubla",
            first_purchase_date: new Date().toISOString().split("T")[0],
          })
          .eq("user_id", userId)
          .is("first_purchase_date", null);

        // Notify N8N for welcome email
        if (userData.email && userId) {
          await notifyN8N({
            event: "SUBSCRIPTION_CREATED",
            email: userData.email,
            customerName: userData.displayName,
            userId,
            isNewUser,
            productName: productNames,
            amount: amountCents,
          });
        }

        console.log(
          `[hubla-webhook] ✅ subscription.created processed for ${userData.email}`
        );
        break;
      }

      // ════════════════════════════════════════════════════════════════
      // SUBSCRIPTION ACTIVATED — Limited data, confirms payment
      // ════════════════════════════════════════════════════════════════
      case "subscription.activated": {
        const subscriptionId = payload.event?.subscription?.id;

        if (!subscriptionId) {
          console.error(
            "[hubla-webhook] No subscription.id in subscription.activated"
          );
          break;
        }

        // Find purchase by subscription ID
        const { data: purchase } = await supabaseAdmin
          .from("purchases")
          .select("user_id, status")
          .eq("provider", "hubla")
          .eq("provider_session_id", subscriptionId)
          .maybeSingle();

        if (!purchase) {
          console.warn(
            `[hubla-webhook] ⚠️ No purchase found for subscription ${subscriptionId}`
          );
          break;
        }

        // Update purchase to paid
        if (purchase.status !== "paid") {
          await supabaseAdmin
            .from("purchases")
            .update({
              status: "paid",
              updated_at: new Date().toISOString(),
            })
            .eq("provider", "hubla")
            .eq("provider_session_id", subscriptionId);

          console.log(
            `[hubla-webhook] ✅ Purchase updated to paid`
          );
        }

        // Activate premium
        await setUserPremium(purchase.user_id, true);

        // Notify N8N — we need email for this, fetch from profile
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("email, display_name")
          .eq("user_id", purchase.user_id)
          .maybeSingle();

        if (profile?.email) {
          await notifyN8N({
            event: "SUBSCRIPTION_ACTIVATED",
            email: profile.email,
            customerName: profile.display_name ?? "Cliente Hubla",
            userId: purchase.user_id,
            isNewUser: false,
          });
        }

        console.log(
          `[hubla-webhook] ✅ subscription.activated processed`
        );
        break;
      }

      // ════════════════════════════════════════════════════════════════
      // INVOICE CREATED — Pix pending reminder (pre-sale)
      // ════════════════════════════════════════════════════════════════
      case "invoice.created": {
        const event = payload.event;
        const invoice = event?.invoice;
        const paymentMethod = invoice?.paymentMethod;

        // Log full payload to discover pix-specific fields
        console.log(
          `[hubla-webhook] 📋 invoice.created payload:`,
          JSON.stringify(event, null, 2)
        );

        // Only process Pix invoices
        if (paymentMethod !== "pix") {
          console.log(
            `[hubla-webhook] ℹ️ invoice.created paymentMethod=${paymentMethod}, skipping (not pix)`
          );
          break;
        }

        const userData = extractUserData(event);
        const productNames = extractProductNames(event);
        const invoiceId = invoice?.id;

        if (!userData?.email || !invoiceId) {
          console.log(
            `[hubla-webhook] ℹ️ invoice.created missing email or invoiceId, skipping`
          );
          break;
        }

        console.log(
          `[hubla-webhook] 💳 Pix invoice created for ${userData.email} - ${productNames}`
        );

        // Notify N8N for pix pending reminder (N8N handles 5-min delay)
        try {
          const n8nPayload = {
            event: "PIX_PENDING",
            Product: { name: productNames },
            Customer: {
              email: userData.email,
              full_name: userData.displayName,
              first_name: userData.displayName.split(" ")[0],
            },
            invoice_id: invoiceId,
            pix_emv: invoice?.pixEmv ?? invoice?.pix_emv ?? null,
            pix_qrcode_url:
              invoice?.pixQrCodeUrl ?? invoice?.pix_qrcode_url ?? null,
            provider: "hubla",
            timestamp: new Date().toISOString(),
          };

          console.log(
            `[hubla-webhook] 📤 Sending PIX_PENDING to N8N:`,
            JSON.stringify(n8nPayload)
          );

          const response = await fetch(n8nPixPendingUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(n8nPayload),
          });

          if (response.ok) {
            console.log(
              `[hubla-webhook] ✅ N8N pix-pending webhook ok`
            );
          } else {
            console.warn(
              `[hubla-webhook] ⚠️ N8N pix-pending error: ${response.status}`
            );
          }
        } catch (error) {
          console.warn(
            `[hubla-webhook] ⚠️ N8N pix-pending fetch error:`,
            error
          );
        }
        break;
      }

      // ════════════════════════════════════════════════════════════════
      // INVOICE PAYMENT SUCCEEDED — Limited data, fallback confirmation
      // ════════════════════════════════════════════════════════════════
      case "invoice.payment_succeeded": {
        const invoiceId = payload.event?.invoice?.id;

        if (!invoiceId) {
          console.error(
            "[hubla-webhook] No invoice.id in invoice.payment_succeeded"
          );
          break;
        }

        // Find purchase by invoice ID
        const { data: purchase } = await supabaseAdmin
          .from("purchases")
          .select("user_id, status")
          .eq("provider", "hubla")
          .eq("provider_payment_intent", invoiceId)
          .maybeSingle();

        if (!purchase) {
          console.log(
            `[hubla-webhook] ℹ️ No purchase found for invoice ${invoiceId} (may be recurring or already handled)`
          );
          break;
        }

        if (purchase.status !== "paid") {
          await supabaseAdmin
            .from("purchases")
            .update({
              status: "paid",
              updated_at: new Date().toISOString(),
            })
            .eq("provider", "hubla")
            .eq("provider_payment_intent", invoiceId);

          await setUserPremium(purchase.user_id, true);

          console.log(
            `[hubla-webhook] ✅ invoice.payment_succeeded processed`
          );
        } else {
          console.log(
            `[hubla-webhook] ℹ️ Purchase already paid, skipping`
          );
        }
        break;
      }

      // ════════════════════════════════════════════════════════════════
      // MEMBER ADDED — Full data, fallback for user creation + premium
      // ════════════════════════════════════════════════════════════════
      case "customer.member_added": {
        const event = payload.event;
        const userData = extractUserData(event);

        if (!userData) {
          console.error(
            "[hubla-webhook] No user email in customer.member_added"
          );
          break;
        }

        const productNames = extractProductNames(event);
        const subscription = event?.subscription;
        const subscriptionId = subscription?.id;

        console.log(
          `[hubla-webhook] 👤 Member added: ${userData.displayName} <${userData.email}>`
        );

        // Find or create user
        let isNewUser = false;
        let userId = await findUserByEmail(userData.email);

        if (!userId) {
          userId = await createUserFromHubla(
            userData.email,
            userData.displayName,
            userData.phone
          );
          isNewUser = true;

          if (!userId) {
            console.error(
              `[hubla-webhook] Failed to create user for ${userData.email}`
            );
            break;
          }
        } else {
          if (userData.phone) {
            await supabaseAdmin
              .from("profiles")
              .update({ phone: userData.phone })
              .eq("user_id", userId)
              .is("phone", null);
          }
        }

        // Upsert purchase as paid (member_added means access is granted)
        if (subscriptionId) {
          const { error: purchaseError } = await supabaseAdmin
            .from("purchases")
            .upsert(
              {
                user_id: userId,
                email: userData.email,
                provider: "hubla",
                provider_session_id: subscriptionId,
                amount_cents: 0, // Amount may not be available in this event
                currency: "BRL",
                status: "paid",
                product_names: productNames,
                payment_method: subscription?.paymentMethod ?? null,
              },
              { onConflict: "provider_session_id" }
            );

          if (purchaseError) {
            console.error(
              `[hubla-webhook] Purchase upsert failed:`,
              purchaseError
            );
          }
        }

        // Activate premium
        await setUserPremium(userId, true);

        // Update cohorts
        await supabaseAdmin
          .from("user_cohorts")
          .update({
            acquisition_source: "hubla",
            first_purchase_date: new Date().toISOString().split("T")[0],
          })
          .eq("user_id", userId)
          .is("first_purchase_date", null);

        // Notify N8N
        await notifyN8N({
          event: "MEMBER_ADDED",
          email: userData.email,
          customerName: userData.displayName,
          userId,
          isNewUser,
          productName: productNames,
        });

        console.log(
          `[hubla-webhook] ✅ customer.member_added processed`
        );
        break;
      }

      // ════════════════════════════════════════════════════════════════
      // SUBSCRIPTION DEACTIVATED — Revoke premium
      // ════════════════════════════════════════════════════════════════
      case "subscription.deactivated": {
        const subscriptionId = payload.event?.subscription?.id;

        if (!subscriptionId) {
          console.error(
            "[hubla-webhook] No subscription.id in subscription.deactivated"
          );
          break;
        }

        const { data: purchase } = await supabaseAdmin
          .from("purchases")
          .select("user_id")
          .eq("provider", "hubla")
          .eq("provider_session_id", subscriptionId)
          .maybeSingle();

        if (!purchase) {
          console.warn(
            `[hubla-webhook] ⚠️ No purchase found for subscription ${subscriptionId}`
          );
          break;
        }

        await supabaseAdmin
          .from("purchases")
          .update({
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("provider", "hubla")
          .eq("provider_session_id", subscriptionId);

        await setUserPremium(purchase.user_id, false);

        console.log(
          `[hubla-webhook] ✅ subscription.deactivated processed — premium revoked`
        );
        break;
      }

      // ════════════════════════════════════════════════════════════════
      // INVOICE REFUNDED — Revoke premium
      // ════════════════════════════════════════════════════════════════
      case "invoice.refunded": {
        const invoiceId = payload.event?.invoice?.id;

        if (!invoiceId) {
          console.error(
            "[hubla-webhook] No invoice.id in invoice.refunded"
          );
          break;
        }

        const { data: purchase } = await supabaseAdmin
          .from("purchases")
          .select("user_id")
          .eq("provider", "hubla")
          .eq("provider_payment_intent", invoiceId)
          .maybeSingle();

        if (!purchase) {
          console.warn(
            `[hubla-webhook] ⚠️ No purchase found for invoice ${invoiceId}`
          );
          break;
        }

        await supabaseAdmin
          .from("purchases")
          .update({
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("provider", "hubla")
          .eq("provider_payment_intent", invoiceId);

        await setUserPremium(purchase.user_id, false);

        console.log(
          `[hubla-webhook] ✅ invoice.refunded processed — premium revoked`
        );
        break;
      }

      default:
        console.log(
          `[hubla-webhook] ℹ️ Unhandled event: ${eventType}`
        );
        // Log full payload for unknown events to help debugging
        console.log(
          `[hubla-webhook] Payload: ${rawBody.substring(0, 500)}`
        );
        break;
    }
  } catch (error) {
    console.error("[hubla-webhook] Processing error:", error);
    return new Response("Webhook handler error", {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
