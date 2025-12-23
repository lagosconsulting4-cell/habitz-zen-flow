import Stripe from "npm:stripe";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");

if (!stripeSecret || !supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing environment variables for stripe-session-info function");
}

const stripe = new Stripe(stripeSecret ?? "", {
  apiVersion: "2024-06-20",
});

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  if (!stripeSecret || !supabaseUrl || !supabaseServiceRoleKey) {
    return new Response("Misconfigured", { status: 500, headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar sessão do Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.customer_email) {
      return new Response(
        JSON.stringify({ error: "No customer email in session" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar usuário no banco
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email, is_premium')
      .eq('email', session.customer_email.toLowerCase())
      .single();

    if (error || !profile) {
      return new Response(
        JSON.stringify({
          error: "User not found",
          email: session.customer_email
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Retornar dados para o cliente fazer login
    return new Response(
      JSON.stringify({
        email: session.customer_email,
        userId: profile.user_id,
        isPremium: profile.is_premium,
        paymentStatus: session.payment_status,
        customerId: session.customer,
        subscriptionId: session.subscription,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error processing session info:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
