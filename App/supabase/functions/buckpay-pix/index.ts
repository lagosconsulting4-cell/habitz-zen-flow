import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BUCKPAY_API_URL = "https://api.realtechdev.com.br";
const BUCKPAY_TOKEN = Deno.env.get("BUCKPAY_API_TOKEN");
const BUCKPAY_USER_AGENT = Deno.env.get("BUCKPAY_USER_AGENT") || "Habitz/1.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL") ?? "https://n8n-evo-n8n.harxon.easypanel.host/webhook/bora-welcome";

interface BuyerData {
  name: string;
  email: string;
  document?: string;
  phone?: string;
}

interface TrackingData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ref?: string;
  src?: string;
  sck?: string;
}

interface CreatePixRequest {
  action: "create";
  external_id: string;
  amount: number;
  buyer: BuyerData;
  product?: { name: string };
  tracking?: TrackingData;
}

interface StatusRequest {
  action: "status";
  external_id: string;
}

interface WebhookRequest {
  event: string;
  data: {
    id: string;
    external_id?: string;
    status: string;
    buyer?: BuyerData;
    total_amount?: number;
    offer?: { name: string };
    payment_method?: string;
  };
}

type RequestPayload = CreatePixRequest | StatusRequest | WebhookRequest;

serve(async (req) => {
  console.log("[buckpay-pix] === REQUEST START ===");
  console.log("[buckpay-pix] Method:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!BUCKPAY_TOKEN) {
    console.error("[buckpay-pix] Missing BUCKPAY_API_TOKEN");
    return new Response(JSON.stringify({ error: "Service misconfigured - missing API token" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Read body as text first
    const rawBody = await req.text();
    const parsedBody = JSON.parse(rawBody);

    // Detect if it's a webhook (has "event" instead of "action")
    if (parsedBody.event && !parsedBody.action) {
      console.log("[buckpay-pix] Detected webhook request");
      return await handleBuckPayWebhook(req, parsedBody as WebhookRequest);
    }

    // Otherwise, it's a regular API call
    const payload: RequestPayload = parsedBody;
    console.log("[buckpay-pix] Action:", (payload as any).action);

    if ((payload as CreatePixRequest).action === "create") {
      return await handleCreateTransaction(payload as CreatePixRequest);
    } else if ((payload as StatusRequest).action === "status") {
      return await handleCheckStatus(payload as StatusRequest);
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("[buckpay-pix] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleBuckPayWebhook(req: Request, payload: WebhookRequest) {
  console.log("[buckpay-pix] 🎯 Webhook BuckPay recebido");
  console.log("[buckpay-pix] Event:", payload.event);

  // 1. VALIDAR TOKEN
  // Try both X-Webhook-Token and Authorization headers for flexibility
  const webhookToken = req.headers.get("x-webhook-token") || req.headers.get("authorization");
  const expectedToken = Deno.env.get("BUCK_WEBHOOK_TOKEN");

  if (!webhookToken || webhookToken !== expectedToken) {
    console.error("[buckpay-pix] ❌ Token inválido");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("[buckpay-pix] ✅ Token validado");

  // 2. PROCESSAR APENAS PAGAMENTOS APROVADOS
  if (payload.event !== "transaction.processed" || payload.data?.status !== "paid") {
    console.log(`[buckpay-pix] ⏭️ Evento ignorado: ${payload.event} (status: ${payload.data?.status})`);
    return new Response(JSON.stringify({ message: "Event not processed" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 3. EXTRAIR EXTERNAL_ID
  const externalId = payload.data.external_id;

  if (!externalId) {
    console.error("[buckpay-pix] ❌ external_id ausente no webhook");
    return new Response(JSON.stringify({ error: "Missing external_id" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`[buckpay-pix] 💳 Processing payment for external_id: ${externalId}`);

  // 4. VERIFICAR SE JÁ FOI PROCESSADO (idempotência)
  if (supabaseUrl && serviceRoleKey) {
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: existingTx } = await adminClient
      .from("pix_transactions")
      .select("status")
      .eq("external_id", externalId)
      .single();

    if (existingTx && existingTx.status === "paid") {
      console.log("[buckpay-pix] ⏭️ Transação já processada anteriormente (via polling)");
      return new Response(JSON.stringify({
        success: true,
        message: "Already processed"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // 5. PROCESSAR PAGAMENTO (mesma lógica do polling)
  await handlePaidTransaction(externalId, payload.data);

  console.log("[buckpay-pix] ✅ Webhook processado com sucesso");

  return new Response(JSON.stringify({
    success: true,
    external_id: externalId
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleCreateTransaction(payload: CreatePixRequest) {
  console.log("[buckpay-pix] Creating PIX transaction");
  console.log("[buckpay-pix] Buyer email:", payload.buyer.email);
  console.log("[buckpay-pix] Amount:", payload.amount);

  // Build request body for BuckPay
  const buckpayBody = {
    external_id: payload.external_id,
    payment_method: "pix",
    amount: payload.amount,
    buyer: {
      name: payload.buyer.name,
      email: payload.buyer.email,
      ...(payload.buyer.document && { document: payload.buyer.document }),
      ...(payload.buyer.phone && { phone: payload.buyer.phone }),
    },
    ...(payload.product && {
      product: {
        id: "bora-premium",
        name: payload.product.name
      }
    }),
    ...(payload.tracking && {
      tracking: {
        utm_source: payload.tracking.utm_source || null,
        utm_medium: payload.tracking.utm_medium || null,
        utm_campaign: payload.tracking.utm_campaign || null,
        utm_content: payload.tracking.utm_content || null,
        utm_term: payload.tracking.utm_term || null,
        ref: payload.tracking.ref || null,
        src: payload.tracking.src || null,
        sck: payload.tracking.sck || null,
      }
    }),
  };

  console.log("[buckpay-pix] Calling BuckPay API...");

  const response = await fetch(`${BUCKPAY_API_URL}/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${BUCKPAY_TOKEN}`,
      "User-Agent": BUCKPAY_USER_AGENT,
    },
    body: JSON.stringify(buckpayBody),
  });

  const responseText = await response.text();
  console.log("[buckpay-pix] BuckPay response status:", response.status);
  console.log("[buckpay-pix] BuckPay response:", responseText.substring(0, 500));

  if (!response.ok) {
    let errorMessage = "Failed to create PIX transaction";
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error?.message || errorData.message || errorMessage;
      if (errorData.error?.detail) {
        console.error("[buckpay-pix] Validation errors:", errorData.error.detail);
      }
    } catch {
      // Use default message
    }
    throw new Error(errorMessage);
  }

  const data = JSON.parse(responseText);

  // Store transaction in Supabase for tracking
  if (supabaseUrl && serviceRoleKey) {
    try {
      const adminClient = createClient(supabaseUrl, serviceRoleKey);

      // Check if table exists by trying insert
      const { error: insertError } = await adminClient.from("pix_transactions").insert({
        external_id: payload.external_id,
        transaction_id: data.data?.id,
        email: payload.buyer.email,
        name: payload.buyer.name,
        amount_cents: payload.amount,
        status: "pending",
        tracking: payload.tracking || {},
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.warn("[buckpay-pix] DB insert warning:", insertError.message);
        // Table might not exist yet - that's ok
      } else {
        console.log("[buckpay-pix] Transaction stored in Supabase");
      }
    } catch (dbError) {
      console.error("[buckpay-pix] DB error:", dbError);
      // Don't fail the transaction if DB insert fails
    }
  }

  return new Response(JSON.stringify({ success: true, data: data.data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleCheckStatus(payload: StatusRequest) {
  console.log("[buckpay-pix] Checking status for:", payload.external_id);

  const response = await fetch(
    `${BUCKPAY_API_URL}/v1/transactions/external_id/${payload.external_id}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${BUCKPAY_TOKEN}`,
        "User-Agent": BUCKPAY_USER_AGENT,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[buckpay-pix] Status check failed:", errorText);
    throw new Error("Failed to check transaction status");
  }

  const data = await response.json();
  const status = data.data?.status;

  console.log("[buckpay-pix] Transaction status:", status);

  // If paid, trigger user creation flow
  if (status === "paid" || status === "processed") {
    await handlePaidTransaction(payload.external_id, data.data);
  }

  return new Response(JSON.stringify({ success: true, data: data.data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handlePaidTransaction(externalId: string, transactionData: any) {
  console.log("[buckpay-pix] Processing paid transaction:", externalId);

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[buckpay-pix] Missing Supabase credentials");
    return;
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Get stored transaction data
  const { data: txData, error: txError } = await adminClient
    .from("pix_transactions")
    .select("*")
    .eq("external_id", externalId)
    .single();

  if (txError || !txData) {
    console.warn("[buckpay-pix] Transaction not found in DB, using transaction data");
    // Use data from BuckPay response if not in our DB
    return;
  }

  // Check if already processed
  if (txData.status === "paid") {
    console.log("[buckpay-pix] Transaction already processed");
    return;
  }

  // Update transaction status
  await adminClient
    .from("pix_transactions")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("external_id", externalId);

  // Check if user exists
  const normalizedEmail = txData.email.trim().toLowerCase();
  const { data: existingUsers } = await adminClient.auth.admin.listUsers();
  let existingUser = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === normalizedEmail
  );

  let userId: string;
  let isNewUser = false;

  if (existingUser) {
    console.log("[buckpay-pix] Existing user found:", existingUser.id);
    userId = existingUser.id;
  } else {
    console.log("[buckpay-pix] Creating new user");
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: txData.email,
      email_confirm: true,
      user_metadata: {
        full_name: txData.name,
        created_via: "pix_checkout",
      },
    });

    if (createError || !newUser?.user) {
      console.error("[buckpay-pix] User creation error:", createError);
      return;
    }

    userId = newUser.user.id;
    isNewUser = true;
  }

  // Record purchase
  const { error: purchaseError } = await adminClient.from("purchases").upsert(
    {
      user_id: userId,
      provider: "buckpay_pix",
      provider_session_id: externalId,
      provider_payment_intent: transactionData?.id,
      amount_cents: txData.amount_cents,
      currency: "BRL",
      status: "paid",
      email: txData.email,
      product_names: "Bora Premium - Plano de Calma e Foco",
      payment_method: "pix",
    },
    { onConflict: "provider_session_id" }
  );

  if (purchaseError) {
    console.error("[buckpay-pix] Purchase record error:", purchaseError);
  }

  // Trigger N8N webhook for welcome email
  if (n8nWebhookUrl) {
    try {
      const firstName = txData.name.split(" ")[0];
      await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "SALE_APPROVED",
          Product: { name: "Bora Premium" },
          Customer: {
            email: txData.email,
            full_name: txData.name,
            first_name: firstName,
          },
          sale_id: externalId,
          total_price: `R$ ${(txData.amount_cents / 100).toFixed(2).replace(".", ",")}`,
          payment_method: "pix",
          user_id: userId,
          is_new_user: isNewUser,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log("[buckpay-pix] N8N webhook triggered");
    } catch (n8nError) {
      console.error("[buckpay-pix] N8N webhook error:", n8nError);
    }
  }

  console.log("[buckpay-pix] Payment processing complete for user:", userId);
}
