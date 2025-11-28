import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-kirvano-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL") ?? "https://n8n-evo-n8n.harxon.easypanel.host/webhook/bora-welcome";

const parseAmountInCents = (input: unknown): number => {
  if (typeof input === "number") return Math.round(input * 100);
  if (typeof input === "string") {
    const normalized = input.replace(/R\$/i, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
    const parsed = Number.parseFloat(normalized);
    if (!Number.isNaN(parsed)) return Math.round(parsed * 100);
  }
  return 0;
};

serve(async (req) => {
  console.log("[kirvano-webhook] 🚀 === INÍCIO DA REQUISIÇÃO ===");
  console.log("[kirvano-webhook] 🔍 Method:", req.method);
  console.log("[kirvano-webhook] 🔍 URL:", req.url);

  if (req.method === "OPTIONS") {
    console.log("[kirvano-webhook] ⚙️ CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log("[kirvano-webhook] ❌ Method not allowed");
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[kirvano-webhook] ❌ Missing Supabase credentials");
    return new Response("Misconfigured", { status: 500, headers: corsHeaders });
  }

  try {
    console.log("[kirvano-webhook] 🔍 Headers recebidos:");
    req.headers.forEach((value, key) => console.log(`  ${key}: ${value}`));

    console.log("[kirvano-webhook] 📖 Lendo body raw...");
    const rawBody = await req.text();
    console.log("[kirvano-webhook] 📦 Body raw (primeiros 200 chars):", rawBody.substring(0, 200));

    const payload = JSON.parse(rawBody);
    console.log("[kirvano-webhook] 📋 Payload:", JSON.stringify(payload, null, 2));

    const eventType = payload.event?.toUpperCase?.();
    console.log("[kirvano-webhook] 🔍 Event type:", eventType);
    if (eventType !== "SALE_APPROVED") {
      console.log("[kirvano-webhook] ⏭️ Evento ignorado:", payload.event);
      return new Response(JSON.stringify({ message: "Event type not processed" }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    const customerEmail: string | undefined = payload.customer?.email;
    if (!customerEmail) {
      console.error("[kirvano-webhook] ❌ Email ausente no payload");
      throw new Error("Email do cliente ausente no payload");
    }

    const customerName: string = payload.customer?.name ?? "Cliente Habitz";
    const customerId: string | undefined = payload.customer?.id ?? undefined;
    const paymentMethod: string = payload.payment_method ?? "unknown";
    const saleId: string = payload.sale_id ?? crypto.randomUUID();

    const totalPriceStr = payload.total_price ?? "R$ 0,00";
    const amountInCents = parseAmountInCents(totalPriceStr);

    const products: Array<{ name?: string | null }> = Array.isArray(payload.products) ? payload.products : [];
    const productNames = products.map((p) => p?.name).filter(Boolean).join(", ") || "Habitz Premium";

    console.log("[kirvano-webhook] 👤 Cliente:", customerName, `(${customerEmail})`);
    console.log("[kirvano-webhook] 💰 Valor:", totalPriceStr, `(${amountInCents} centavos)`);
    console.log("[kirvano-webhook] 🎫 Sale ID:", saleId);
    console.log("[kirvano-webhook] 📦 Produtos:", productNames);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const {
      data: existingUsers,
      error: listError,
    } = await adminClient.auth.admin.listUsers();
    if (listError) {
      console.error("[kirvano-webhook] ❌ Erro ao listar usuários:", listError);
      throw listError;
    }

    const normalizedEmail = customerEmail.trim().toLowerCase();
    let existingUser = existingUsers?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      console.log("[kirvano-webhook] ✅ Usuário existente encontrado:", existingUser.id);
      userId = existingUser.id;
    } else {
      console.log("[kirvano-webhook] ✨ Criando novo usuário");
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true,
        user_metadata: {
          full_name: customerName,
          kirvano_customer_id: customerId,
          created_via: "kirvano_webhook",
        },
      });
      if (createError || !newUser?.user) {
        console.error("[kirvano-webhook] ❌ Erro ao criar usuário:", createError);
        throw createError ?? new Error("Erro ao criar usuário");
      }
      userId = newUser.user.id;
      isNewUser = true;
      existingUser = newUser.user;
    }

    // Chamar N8N webhook para enviar email de boas-vindas com token
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
      total_price: totalPriceStr,
      payment_method: paymentMethod,
      user_id: userId,
      is_new_user: isNewUser,
      timestamp: new Date().toISOString(),
    };

    console.log("[kirvano-webhook] 📤 Enviando para N8N webhook:", n8nWebhookUrl);
    console.log("[kirvano-webhook] 📦 Payload N8N:", JSON.stringify(n8nPayload, null, 2));

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

    const { error: purchaseError } = await adminClient.from("purchases").upsert(
      {
        user_id: userId,
        provider: "kirvano",
        provider_session_id: saleId,
        provider_payment_intent: saleId,
        amount_cents: amountInCents,
        currency: payload.currency ?? "BRL",
        status: "paid",
        email: customerEmail,
        product_names: productNames,
        payment_method: paymentMethod,
      },
      { onConflict: "provider_session_id" },
    );

    if (purchaseError) {
      console.error("[kirvano-webhook] ❌ Erro ao registrar pagamento:", purchaseError);
      throw purchaseError;
    }

    console.log("[kirvano-webhook] 💾 Pagamento registrado com sucesso");
    console.log("[kirvano-webhook] ✅ Processamento concluído!");

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        is_new_user: isNewUser,
        sale_id: saleId,
        product: productNames,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[kirvano-webhook] 💥 Erro fatal:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
