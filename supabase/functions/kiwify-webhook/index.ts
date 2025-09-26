import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type JsonRecord = Record<string, unknown>;

type PurchaseStatus = "paid" | "failed" | "refunded" | "open";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
const webhookToken = Deno.env.get("KIWIFY_WEBHOOK_TOKEN") ?? Deno.env.get("KIWIFY_WEBHOOK_SECRET");

if (!supabaseUrl || !supabaseServiceRoleKey || !webhookToken) {
  console.error("Missing required environment variables for kiwify-webhook");
}

const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, x-kiwify-token, x-kiwify-signature",
};

const normalize = (value: unknown): string => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
};

const ensureRecord = (value: unknown): JsonRecord | null => {
  return value && typeof value === "object" ? (value as JsonRecord) : null;
};

const extractEmail = (payload: JsonRecord): string | null => {
  const directKeys = ["email", "customer_email", "cliente_email", "buyer_email", "usuario_email"];
  for (const key of directKeys) {
    const candidate = payload[key];
    if (typeof candidate === "string" && candidate.includes("@")) {
      return candidate.trim().toLowerCase();
    }
  }

  const nestedKeys = ["customer", "buyer", "cliente", "usuario", "dados_cliente"];
  for (const key of nestedKeys) {
    const nested = ensureRecord(payload[key]);
    if (nested) {
      const email = extractEmail(nested);
      if (email) {
        return email;
      }
    }
  }

  const data = ensureRecord(payload["data"]);
  if (data) {
    const email = extractEmail(data);
    if (email) {
      return email;
    }
  }

  for (const value of Object.values(payload)) {
    if (typeof value === "string" && value.includes("@")) {
      return value.trim().toLowerCase();
    }
    const nested = ensureRecord(value);
    if (nested) {
      const email = extractEmail(nested);
      if (email) {
        return email;
      }
    }
  }

  return null;
};

const extractAmountCents = (payload: JsonRecord): number => {
  const amountKeys = ["amount", "amount_total", "total", "valor", "valor_total", "price", "price_total"];
  for (const key of amountKeys) {
    const value = payload[key];
    if (typeof value === "number") {
      return Math.round(value * 100);
    }
    if (typeof value === "string") {
      const normalizedValue = value.replace(/[^0-9.,]/g, "").replace(",", ".");
      const parsed = Number.parseFloat(normalizedValue);
      if (!Number.isNaN(parsed)) {
        return Math.round(parsed * 100);
      }
    }
  }

  const data = ensureRecord(payload["data"]);
  if (data) {
    const nested = extractAmountCents(data);
    if (nested > 0) {
      return nested;
    }
  }

  return 0;
};

const extractCurrency = (payload: JsonRecord): string => {
  const currencyKeys = ["currency", "moeda"];
  for (const key of currencyKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.length >= 3) {
      return value.slice(0, 3).toUpperCase();
    }
  }

  const data = ensureRecord(payload["data"]);
  if (data) {
    return extractCurrency(data);
  }

  return "BRL";
};

const extractId = (payload: JsonRecord): string | null => {
  const idKeys = ["purchase_id", "pedido_id", "order_id", "sale_id", "id", "codigo", "uuid"];
  for (const key of idKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }

  const data = ensureRecord(payload["data"]);
  if (data) {
    return extractId(data);
  }

  return null;
};

const extractPaymentReference = (payload: JsonRecord): string | null => {
  const refKeys = ["payment_reference", "payment_intent", "transaction_id", "payment_id", "reference", "codigo_barras"];
  for (const key of refKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }

  const data = ensureRecord(payload["data"]);
  if (data) {
    const nested = extractPaymentReference(data);
    if (nested) {
      return nested;
    }
  }

  return null;
};

const mapStatus = (eventName: string): PurchaseStatus => {
  if (!eventName) {
    return "open";
  }

  if (eventName.includes("aprov") || eventName.includes("success") || eventName.includes("approved")) {
    return "paid";
  }

  if (eventName.includes("reembolso") || eventName.includes("refund") || eventName.includes("chargeback")) {
    return "refunded";
  }

  if (eventName.includes("recus") || eventName.includes("cancel") || eventName.includes("failed") || eventName.includes("falha")) {
    return "failed";
  }

  return "open";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  if (!supabaseAdmin || !webhookToken) {
    return new Response("Misconfigured", { status: 500, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const searchToken = url.searchParams.get("token");
  const headerToken = req.headers.get("x-kiwify-token") ?? req.headers.get("x-kiwify-signature");

  let payload: JsonRecord;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("Invalid JSON body", error);
    return new Response("Invalid body", { status: 400, headers: corsHeaders });
  }

  const data = ensureRecord(payload["data"]);
  const bodyTokenCandidate = (() => {
    const tokenValue = payload["token"] ?? payload["secret"];
    if (typeof tokenValue === "string") {
      return tokenValue;
    }
    if (data) {
      const nestedToken = data["token"] ?? data["secret"];
      if (typeof nestedToken === "string") {
        return nestedToken;
      }
    }
    return null;
  })();

  const providedToken = searchToken ?? headerToken ?? bodyTokenCandidate;

  if (!providedToken || providedToken !== webhookToken) {
    console.error("Unauthorized webhook call", { providedToken });
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  const eventCandidate = payload["event"] ?? payload["event_name"] ?? payload["type"] ?? payload["status"];
  const normalizedEvent = normalize(eventCandidate);
  const status = mapStatus(normalizedEvent);
  const email = extractEmail(payload);

  if (!email) {
    console.error("Webhook without email", payload);
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  const { data: userLookup, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
  if (userError) {
    console.error("Failed to fetch user by email", { email, userError });
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }

  const supabaseUser = userLookup?.user ?? null;
  if (!supabaseUser) {
    // No authenticated user yet for this email. Store as pending so we can
    // attach it automatically when the user signs up or logs in later.
    const amountCents = extractAmountCents(payload);
    const currency = extractCurrency(payload);
    const sessionId = extractId(payload);
    const paymentReference = extractPaymentReference(payload);
    const providerSessionId = sessionId ?? paymentReference ?? `kiwify-${crypto.randomUUID()}`;
    const providerPaymentIntent = paymentReference ?? null;

    const { error: pendingErr } = await supabaseAdmin
      .from("pending_purchases")
      .upsert(
        {
          email,
          provider: "kiwify",
          provider_session_id: providerSessionId,
          provider_payment_intent: providerPaymentIntent,
          amount_cents: amountCents,
          currency,
          status,
        },
        { onConflict: "provider_session_id" }
      );

    if (pendingErr) {
      console.error("Failed to upsert pending purchase", pendingErr);
      return new Response("Database error", { status: 500, headers: corsHeaders });
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  const amountCents = extractAmountCents(payload);
  const currency = extractCurrency(payload);
  const sessionId = extractId(payload);
  const paymentReference = extractPaymentReference(payload);
  const providerSessionId = sessionId ?? paymentReference ?? `kiwify-${crypto.randomUUID()}`;
  const providerPaymentIntent = paymentReference ?? null;

  const { error: upsertError } = await supabaseAdmin
    .from("purchases")
    .upsert(
      {
        user_id: supabaseUser.id,
        provider: "kiwify",
        provider_session_id: providerSessionId,
        provider_payment_intent: providerPaymentIntent,
        amount_cents: amountCents,
        currency,
        status,
      },
      { onConflict: "provider_session_id" }
    );

  if (upsertError) {
    console.error("Failed to upsert purchase", upsertError);
    return new Response("Database error", { status: 500, headers: corsHeaders });
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});
