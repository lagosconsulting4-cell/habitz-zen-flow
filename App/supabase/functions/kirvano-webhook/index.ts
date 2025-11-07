import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type KirvanoPayload = {
  event?: string;
  sale_id?: string;
  payment_method?: string;
  total_price?: string;
  products?: Array<{ name?: string }>;
  customer?: {
    id?: string;
    name?: string;
    email?: string;
  };
};

type JsonRecord = Record<string, unknown>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-kirvano-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const webhookToken = Deno.env.get("KIRVANO_WEBHOOK_TOKEN");
const appUrl = (Deno.env.get("APP_URL") ?? "https://habitz.life/app").replace(/\/$/, "");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("[kirvano-webhook] Missing SUPABASE_URL or SERVICE_ROLE_KEY environment variables.");
}

const createSupabaseAdmin = () =>
  createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

const createSupabasePublic = () =>
  anonKey
    ? createClient(supabaseUrl!, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

const parseAmountInCents = (value: unknown): number => {
  if (typeof value === "number") {
    return Math.round(value * 100);
  }
  if (typeof value === "string") {
    const normalized = value.replace(/R\$/i, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
    const parsed = Number.parseFloat(normalized);
    if (!Number.isNaN(parsed)) {
      return Math.round(parsed * 100);
    }
  }
  return 0;
};

const normalizeEmail = (email?: string | null): string | null =>
  email ? email.trim().toLowerCase() : null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Misconfigured", { status: 500, headers: corsHeaders });
  }

  if (!webhookToken) {
    console.warn("[kirvano-webhook] Missing KIRVANO_WEBHOOK_TOKEN secret; rejecting call");
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const providedToken = req.headers.get("x-kirvano-token") ?? url.searchParams.get("token");
  if (providedToken !== webhookToken) {
    console.error("[kirvano-webhook] Invalid token", { providedToken });
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  const rawBody = await req.text();
  let payload: KirvanoPayload;
  try {
    payload = JSON.parse(rawBody) as KirvanoPayload;
  } catch (error) {
    console.error("[kirvano-webhook] Invalid JSON", error);
    return new Response("Bad Request", { status: 400, headers: corsHeaders });
  }

  const eventType = payload.event?.toUpperCase() ?? "";
  if (eventType !== "SALE_APPROVED") {
    console.log(`[kirvano-webhook] Ignoring event ${payload.event}`);
    return new Response(JSON.stringify({ ignored: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const customerEmail = normalizeEmail(payload.customer?.email);
  if (!customerEmail) {
    console.error("[kirvano-webhook] Email ausente no payload", payload);
    return new Response(JSON.stringify({ error: "EMAIL_REQUIRED" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const adminClient = createSupabaseAdmin();
  const publicClient = createSupabasePublic();

  const { data: userLookup, error: userLookupError } = await adminClient.auth.admin.getUserByEmail(customerEmail);
  if (userLookupError) {
    console.error("[kirvano-webhook] Erro ao buscar usuário", userLookupError);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }

  let userId = userLookup?.user?.id ?? null;
  let isNewUser = false;

  if (!userId) {
    const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
      email: customerEmail,
      email_confirm: true,
      user_metadata: {
        full_name: payload.customer?.name ?? "Cliente Habitz",
        kirvano_customer_id: payload.customer?.id,
        created_via: "kirvano-webhook",
      },
    });

    if (createError || !createdUser?.user) {
      console.error("[kirvano-webhook] Erro ao criar usuário", createError);
      return new Response("Could not create user", { status: 500, headers: corsHeaders });
    }

    userId = createdUser.user.id;
    isNewUser = true;
  }

  const saleId = payload.sale_id ?? crypto.randomUUID();
  const amountInCents = parseAmountInCents(payload.total_price ?? "0");
  const currency = "BRL";
  const products = Array.isArray(payload.products) ? payload.products : [];
  const productNames = products.map((item) => item?.name).filter(Boolean).join(", ") || "Habitz Premium";

  const { error: purchaseError } = await adminClient
    .from("purchases")
    .upsert(
      {
        user_id: userId,
        provider: "kirvano",
        provider_session_id: saleId,
        provider_payment_intent: saleId,
        amount_cents: amountInCents || 0,
        currency,
        status: "paid",
      },
      { onConflict: "provider_session_id" }
    );

  if (purchaseError) {
    console.error("[kirvano-webhook] Erro ao registrar pagamento", purchaseError);
    return new Response("Database error", { status: 500, headers: corsHeaders });
  }

  if (publicClient) {
    const { error: emailError } = await publicClient.auth.resetPasswordForEmail(customerEmail, {
      redirectTo: `${appUrl}/auth?type=recovery`,
    });

    if (emailError) {
      console.warn("[kirvano-webhook] Não foi possível enviar email de acesso", emailError);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      user_id: userId,
      is_new_user: isNewUser,
      sale_id: saleId,
      product: productNames,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
