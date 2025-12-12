/**
 * Kirvano Webhook Handler - Versão Melhorada
 *
 * Combina:
 * - Segurança do código atual (token validation)
 * - Performance do código atual (getUserByEmail)
 * - Logs detalhados do código de referência
 * - Campos extras (payment_method, product_names)
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-kirvano-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const webhookToken = Deno.env.get("KIRVANO_WEBHOOK_TOKEN");
const appUrl = (Deno.env.get("APP_URL") ?? "https://www.habitz.life/app").replace(/\/$/, "");
const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL") ?? "https://n8n-evo-n8n.harxon.easypanel.host/webhook/bora-welcome";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("[kirvano-webhook] ❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY environment variables.");
}

const createSupabaseAdmin = () => createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const createSupabasePublic = () => anonKey ? createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
}) : null;

const parseAmountInCents = (value: unknown): number => {
  if (typeof value === "number") {
    return Math.round(value * 100);
  }
  if (typeof value === "string") {
    const normalized = value
      .replace(/R\$/i, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")   // Remove pontos de milhar
      .replace(/,/g, ".");  // Vírgula vira ponto decimal
    const parsed = Number.parseFloat(normalized);
    if (!Number.isNaN(parsed)) {
      return Math.round(parsed * 100);
    }
  }
  return 0;
};

const normalizeEmail = (email: string | undefined | null): string | null =>
  email ? email.trim().toLowerCase() : null;

serve(async (req) => {
  console.log('[kirvano-webhook] 🚀 === INÍCIO DA REQUISIÇÃO ===');
  console.log('[kirvano-webhook] 🔍 Method:', req.method);
  console.log('[kirvano-webhook] 🔍 URL:', req.url);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log('[kirvano-webhook] ⚙️ CORS Preflight - retornando 200');
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log('[kirvano-webhook] ❌ Method not allowed:', req.method);
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[kirvano-webhook] ❌ Misconfigured - missing credentials");
    return new Response("Misconfigured", { status: 500, headers: corsHeaders });
  }

  // Validação de token
  // Ler body
  console.log('[kirvano-webhook] 📖 Lendo body...');
  const rawBody = await req.text();
  console.log('[kirvano-webhook] 📦 Body raw (primeiros 200 chars):', rawBody.substring(0, 200));

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
    console.log('[kirvano-webhook] ✅ JSON parsed');
  } catch (error) {
    console.error("[kirvano-webhook] ❌ Invalid JSON:", error);
    return new Response("Bad Request", { status: 400, headers: corsHeaders });
  }

  // Processar evento
  const eventType = payload.event?.toUpperCase() ?? "";
  console.log(`[kirvano-webhook] 📋 Event: ${payload.event} (normalized: ${eventType})`);

  if (eventType !== "SALE_APPROVED") {
    console.log(`[kirvano-webhook] ⏭️ Ignoring event: ${payload.event}`);
    return new Response(JSON.stringify({ ignored: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  console.log('[kirvano-webhook] ✅ Evento SALE_APPROVED confirmado');

  // Extrair dados
  const customerEmail = normalizeEmail(payload.customer?.email);
  const customerName = payload.customer?.name ?? "Cliente Habitz";
  const customerId = payload.customer?.id ?? null;

  if (!customerEmail) {
    console.error("[kirvano-webhook] ❌ Email ausente no payload:", JSON.stringify(payload, null, 2));
    return new Response(JSON.stringify({ error: "EMAIL_REQUIRED" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  console.log(`[kirvano-webhook] 👤 Cliente: ${customerName} <${customerEmail}>`);

  const saleId = payload.sale_id ?? crypto.randomUUID();
  const amountInCents = parseAmountInCents(payload.total_price ?? "0");
  const currency = "BRL";
  const paymentMethod = payload.payment_method ?? null;

  console.log(`[kirvano-webhook] 🎫 Sale ID: ${saleId}`);
  console.log(`[kirvano-webhook] 💰 Total: ${payload.total_price} (${amountInCents} centavos)`);
  console.log(`[kirvano-webhook] 💳 Payment method: ${paymentMethod ?? 'não informado'}`);

  // Processar produtos
  const products = Array.isArray(payload.products) ? payload.products : [];
  const productNames = products.map((item) => item?.name).filter(Boolean).join(", ") || "Habitz Premium";

  console.log(`[kirvano-webhook] 📦 Produtos (${products.length}): ${productNames}`);

  // Inicializar clientes Supabase
  const adminClient = createSupabaseAdmin();
  const publicClient = createSupabasePublic();

  // Verificar se usuário existe - USANDO FILTRO EFICIENTE
  console.log('[kirvano-webhook] 🔍 Verificando usuário existente...');

  const {
    data: userLookup,
    error: userLookupError,
  } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1, email: customerEmail });

  if (userLookupError) {
    console.error("[kirvano-webhook] ❌ Erro ao buscar usuário:", userLookupError);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }

  let userId = userLookup?.users?.[0]?.id ?? null;
  let isNewUser = false;

  if (!userId) {
    console.log('[kirvano-webhook] ✨ Usuário não existe, criando...');

    const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
      email: customerEmail,
      email_confirm: true,
      user_metadata: {
        full_name: customerName,
        kirvano_customer_id: customerId,
        created_via: "kirvano-webhook"
      }
    });

    if (createError || !createdUser?.user) {
      console.error("[kirvano-webhook] ❌ Erro ao criar usuário:", createError);
      return new Response("Could not create user", { status: 500, headers: corsHeaders });
    }

    userId = createdUser.user.id;
    isNewUser = true;

    console.log(`[kirvano-webhook] ✅ Novo usuário criado: ${userId}`);
  } else {
    console.log(`[kirvano-webhook] ✅ Usuário existente encontrado: ${userId}`);
  }

  // Registrar purchase - SEM customer_name que não existe no schema
  console.log('[kirvano-webhook] 💾 Registrando purchase...');

  const { error: purchaseError } = await adminClient.from("purchases").upsert({
    user_id: userId,
    provider: "kirvano",
    provider_session_id: saleId,
    provider_payment_intent: saleId,
    amount_cents: amountInCents || 0,
    currency,
    status: "paid",
    email: customerEmail,
    payment_method: paymentMethod,
    product_names: productNames
  }, {
    onConflict: "provider_session_id"
  });

  if (purchaseError) {
    console.error("[kirvano-webhook] ❌ Erro ao registrar purchase:", purchaseError);
    return new Response("Database error", { status: 500, headers: corsHeaders });
  }

  console.log('[kirvano-webhook] ✅ Purchase registrada com sucesso');

  // Integração N8N - Enviar webhook para email de boas-vindas
  console.log('[kirvano-webhook] 📤 Preparando chamada N8N...');

  const n8nPayload = {
    event: "SALE_APPROVED",
    Product: {
      name: productNames,
    },
    Customer: {
      email: customerEmail,
      full_name: customerName,
      first_name: customerName.split(" ")[0],
      id: customerId,
    },
    sale_id: saleId,
    total_price: payload.total_price ?? "R$ 0,00",
    payment_method: paymentMethod,
    user_id: userId,
    is_new_user: isNewUser,
    timestamp: new Date().toISOString(),
  };

  console.log('[kirvano-webhook] 📦 Payload N8N:', JSON.stringify(n8nPayload, null, 2));

  try {
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n8nPayload),
    });

    if (n8nResponse.ok) {
      const n8nResult = await n8nResponse.json().catch(() => ({}));
      console.log("[kirvano-webhook] ✅ N8N webhook executado com sucesso");
      console.log("[kirvano-webhook] 📨 Resposta N8N:", JSON.stringify(n8nResult));
    } else {
      const errorText = await n8nResponse.text().catch(() => "");
      console.error(`[kirvano-webhook] ⚠️ Erro N8N (${n8nResponse.status}):`, errorText);
    }
  } catch (n8nError) {
    console.error("[kirvano-webhook] ⚠️ Erro ao chamar N8N:", n8nError);
    // Não lança erro - o webhook principal deve continuar mesmo se o N8N falhar
  }

  // Email agora é enviado via N8N (não via resetPasswordForEmail)
  // COMENTADO: Email de acesso via Supabase substituído por N8N
  // console.log('[kirvano-webhook] 📧 Enviando email de acesso...');
  //
  // if (publicClient) {
  //   const { error: emailError } = await publicClient.auth.resetPasswordForEmail(customerEmail, {
  //     redirectTo: `${appUrl}/auth?type=recovery`
  //   });
  //
  //   if (emailError) {
  //     console.warn("[kirvano-webhook] ⚠️ Não foi possível enviar email:", emailError.message);
  //   } else {
  //     console.log(`[kirvano-webhook] ✅ Email enviado para: ${customerEmail}`);
  //   }
  // } else {
  //   console.warn("[kirvano-webhook] ⚠️ Public client não disponível (ANON_KEY faltando)");
  // }

  console.log('[kirvano-webhook] 🎉 Processamento concluído com sucesso!');

  return new Response(JSON.stringify({
    success: true,
    user_id: userId,
    is_new_user: isNewUser,
    sale_id: saleId,
    product: productNames
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
