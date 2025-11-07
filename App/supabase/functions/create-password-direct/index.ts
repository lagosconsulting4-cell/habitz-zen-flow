import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("[create-password-direct] Missing Supabase credentials");
}

const adminClient = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  : null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  if (!adminClient) {
    return new Response("Misconfigured", { status: 500, headers: corsHeaders });
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch (error) {
    console.error("[create-password-direct] Invalid JSON", error);
    return new Response(
      JSON.stringify({ success: false, error: "INVALID_BODY" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email || !password) {
    return new Response(
      JSON.stringify({ success: false, error: "Informe email e senha." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (password.length < 6) {
    return new Response(
      JSON.stringify({ success: false, error: "A senha precisa ter pelo menos 6 caracteres." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ success: false, error: "E-mail inválido." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: userLookup, error: userLookupError } = await adminClient.auth.admin.getUserByEmail(email);
  if (userLookupError) {
    console.error("[create-password-direct] Erro ao buscar usuário", userLookupError);
    return new Response(
      JSON.stringify({ success: false, error: "Erro ao validar usuário." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const user = userLookup?.user;
  if (!user) {
    return new Response(
      JSON.stringify({ success: false, error: "Não encontramos uma compra ativa para este e-mail." }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: purchase, error: purchaseError } = await adminClient
    .from("purchases")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (purchaseError) {
    console.error("[create-password-direct] Erro ao consultar pagamentos", purchaseError);
    return new Response(
      JSON.stringify({ success: false, error: "Erro ao verificar pagamento." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!purchase) {
    return new Response(
      JSON.stringify({ success: false, error: "Ainda não identificamos o pagamento para este e-mail." }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
  });

  if (updateError) {
    console.error("[create-password-direct] Erro ao definir senha", updateError);
    return new Response(
      JSON.stringify({ success: false, error: updateError.message ?? "Erro ao definir senha." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ success: true, user_id: user.id, message: "Senha criada com sucesso!" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
