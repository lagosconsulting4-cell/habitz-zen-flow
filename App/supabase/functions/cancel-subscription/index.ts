import Stripe from "npm:stripe";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("[cancel-subscription] 🚀 Request received");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { reason, rating, feedbackText } = await req.json();
    console.log("[cancel-subscription] 📋 Cancellation request:", { reason, rating });

    if (!reason || !rating) {
      throw new Error("Motivo e avaliação são obrigatórios");
    }

    if (rating < 1 || rating > 5) {
      throw new Error("Avaliação deve ser entre 1 e 5 estrelas");
    }

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Não autenticado");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !stripeSecret) {
      throw new Error("Configuração do servidor incompleta");
    }

    // Create client with user's auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Usuário não autenticado");
    }

    console.log("[cancel-subscription] 👤 User ID:", user.id);

    // Create admin client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Find active purchase
    const { data: purchase, error: purchaseError } = await adminClient
      .from("purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (purchaseError) {
      console.error("[cancel-subscription] ❌ Erro ao buscar purchase:", purchaseError);
      throw new Error("Erro ao buscar assinatura");
    }

    if (!purchase) {
      throw new Error("Nenhuma assinatura ativa encontrada");
    }

    if (!purchase.stripe_subscription_id) {
      throw new Error("Assinatura sem ID do Stripe");
    }

    console.log("[cancel-subscription] 💳 Subscription ID:", purchase.stripe_subscription_id);

    // Initialize Stripe
    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2024-06-20",
    });

    // Cancel subscription in Stripe
    try {
      await stripe.subscriptions.cancel(purchase.stripe_subscription_id);
      console.log("[cancel-subscription] ✅ Subscription canceled in Stripe");
    } catch (stripeError) {
      console.error("[cancel-subscription] ❌ Stripe error:", stripeError);
      throw new Error("Erro ao cancelar assinatura no Stripe");
    }

    // Update purchase status
    const { error: updateError } = await adminClient
      .from("purchases")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    if (updateError) {
      console.error("[cancel-subscription] ❌ Erro ao atualizar purchase:", updateError);
      // Don't throw - subscription is already canceled in Stripe
    }

    // Save feedback
    const { error: feedbackError } = await adminClient
      .from("cancellation_feedback")
      .insert({
        user_id: user.id,
        reason,
        rating,
        feedback_text: feedbackText || null,
        stripe_subscription_id: purchase.stripe_subscription_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (feedbackError) {
      console.error("[cancel-subscription] ⚠️ Erro ao salvar feedback:", feedbackError);
      // Don't throw - cancellation is already done
    }

    console.log("[cancel-subscription] ✅ Cancellation completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Assinatura cancelada com sucesso. Sentiremos sua falta!",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[cancel-subscription] 💥 Erro:", error);
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
