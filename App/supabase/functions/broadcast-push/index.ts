/**
 * Edge Function: broadcast-push
 *
 * Envia uma push notification para TODOS os usuários com subscription ativa.
 * Requer autenticação admin (profiles.is_admin = true).
 *
 * Payload esperado:
 * { title: string, body: string, tag?: string, data?: object }
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verificar autenticação admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Cliente com service role para queries internas
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar se é admin
    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .single();

    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Parse do payload
    const { title, body, tag = "bora-broadcast", data = { url: "/app/" } } = await req.json();

    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title e body são obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Buscar todos os user_ids distintos com subscription ativa
    const { data: subs, error: subsError } = await adminClient
      .from("push_subscriptions")
      .select("user_id");

    if (subsError) throw subsError;

    const uniqueUserIds = [...new Set((subs ?? []).map((s: { user_id: string }) => s.user_id))];

    if (uniqueUserIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, failed: 0, total: 0, userCount: 0 }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Enviar em batches de 50
    const BATCH_SIZE = 50;
    let totalSent = 0;
    let totalFailed = 0;

    for (let i = 0; i < uniqueUserIds.length; i += BATCH_SIZE) {
      const batch = uniqueUserIds.slice(i, i + BATCH_SIZE);
      try {
        const { data: result, error: invokeError } = await adminClient.functions.invoke(
          "send-push-notification",
          { body: { userIds: batch, title, body, tag, data } }
        );
        if (!invokeError && result) {
          totalSent += result.sent ?? 0;
          totalFailed += result.failed ?? 0;
        } else {
          totalFailed += batch.length;
        }
      } catch {
        totalFailed += batch.length;
      }
    }

    return new Response(
      JSON.stringify({
        sent: totalSent,
        failed: totalFailed,
        total: totalSent + totalFailed,
        userCount: uniqueUserIds.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
