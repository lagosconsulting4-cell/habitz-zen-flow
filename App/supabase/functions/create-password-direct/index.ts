import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("[create-password-direct] 🚀 Request received");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();
    console.log("[create-password-direct] 📧 Email:", email);

    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios");
    }
    if (password.length < 6) {
      throw new Error("Senha deve ter no mínimo 6 caracteres");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Email inválido");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase não configurado corretamente");
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: existingUsers, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) {
      console.error("[create-password-direct] ❌ Erro ao listar usuários:", listError);
      throw new Error("Erro ao validar usuário");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = existingUsers?.users?.find(
      (user) => user.email?.trim().toLowerCase() === normalizedEmail,
    );

    if (!existingUser) {
      console.log("[create-password-direct] ❌ Usuário não encontrado");
      throw new Error("Email não encontrado. Verifique se sua compra foi processada.");
    }

    console.log("[create-password-direct] ✅ Usuário encontrado:", existingUser.id);

    const { data: purchase, error: purchaseError } = await adminClient
      .from("purchases")
      .select("*")
      .eq("user_id", existingUser.id)
      .eq("status", "paid")
      .limit(1)
      .maybeSingle();

    if (purchaseError) {
      console.error("[create-password-direct] ❌ Erro ao buscar purchase:", purchaseError);
      throw new Error("Erro ao verificar pagamento");
    }

    if (!purchase) {
      console.log("[create-password-direct] ❌ Nenhuma purchase ativa para:", email);
      throw new Error("Nenhum pagamento ativo encontrado para este email. Entre em contato com o suporte.");
    }

    console.log("[create-password-direct] 💳 Pagamento ativo encontrado");
    console.log("[create-password-direct] 🔐 Atualizando senha para:", existingUser.id);

    const { error: updateError } = await adminClient.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
    });

    if (updateError) {
      console.error("[create-password-direct] ❌ Erro ao definir senha:", updateError);
      throw new Error(updateError.message ?? "Erro ao definir senha");
    }

    console.log("[create-password-direct] ✅ Senha atualizada com sucesso");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Senha criada com sucesso! Você já pode fazer login.",
        user_id: existingUser.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[create-password-direct] 💥 Erro:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
