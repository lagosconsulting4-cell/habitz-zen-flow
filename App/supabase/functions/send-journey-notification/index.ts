/**
 * Edge Function: send-journey-notification
 *
 * Sends journey-related push notifications:
 * - daily_reminder: "Dia X do {journey} te espera!"
 * - new_habit: "Novo hábito desbloqueado: {habit}"
 * - phase_complete: "Fase {n} completa! Badge: {badge}"
 * - cliff_support: Motivational message for days 10-14
 * - inactivity: "Sua jornada está pausada há {n} dias"
 *
 * Triggered by client (useJourney hook) or by journey-day-transition cron.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, content-type, x-client-info, apikey",
};

type NotificationType =
  | "daily_reminder"
  | "new_habit"
  | "phase_complete"
  | "cliff_support"
  | "inactivity"
  | "journey_complete";

interface JourneyNotificationPayload {
  type: NotificationType;
  userId: string;
  journeyTitle?: string;
  currentDay?: number;
  habitName?: string;
  phaseName?: string;
  badgeName?: string;
  inactiveDays?: number;
}

const COPY_BANK: Record<NotificationType, Array<{ title: string; body: string }>> = {
  daily_reminder: [
    { title: "Bora! 💪", body: "Dia {day} de {journey} te espera. Só faltam {remaining} dias!" },
    { title: "Sua jornada continua", body: "{journey} — Dia {day}. Cada dia conta." },
    { title: "Não quebre a sequência", body: "Dia {day} de {journey}. Tá indo demais!" },
  ],
  new_habit: [
    { title: "Novo hábito! 🆕", body: "Amanhã começa: {habit}. Preparado?" },
    { title: "Desbloqueado!", body: "{habit} entra na sua rotina amanhã. Bora!" },
  ],
  phase_complete: [
    { title: "Fase completa! 🏅", body: "Você ganhou o badge \"{badge}\"! Próxima fase desbloqueada." },
    { title: "Mandou bem!", body: "Fase \"{phase}\" concluída. Continue assim!" },
  ],
  cliff_support: [
    { title: "A maioria desiste aqui.", body: "Dias 10-14 são os mais difíceis. Você é diferente. Continue." },
    { title: "Ei, ainda tá aqui?", body: "A maioria para no dia {day}. Você não é a maioria. 🔥" },
    { title: "O difícil passa.", body: "Dia {day}. Todo mundo tropeça aqui. O segredo é não parar." },
  ],
  inactivity: [
    { title: "Saudade de você 👀", body: "Sua jornada tá parada há {days} dias. Que tal retomar?" },
    { title: "Sua jornada te espera", body: "{journey} continua lá. {days} dias sem abrir. Bora voltar?" },
  ],
  journey_complete: [
    { title: "JORNADA COMPLETA! 🎓", body: "Você completou {journey}! Entre pra escolher quais hábitos manter." },
  ],
};

function selectCopy(
  type: NotificationType,
  vars: Record<string, string | number>
): { title: string; body: string } {
  const pool = COPY_BANK[type];
  const selected = pool[Math.floor(Math.random() * pool.length)];

  let title = selected.title;
  let body = selected.body;

  for (const [key, value] of Object.entries(vars)) {
    title = title.replaceAll(`{${key}}`, String(value));
    body = body.replaceAll(`{${key}}`, String(value));
  }

  return { title, body };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing env vars" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload: JourneyNotificationPayload = await req.json();
    const { type, userId, journeyTitle, currentDay, habitName, phaseName, badgeName, inactiveDays } = payload;

    if (!type || !userId) {
      return new Response(JSON.stringify({ error: "Missing type or userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build template vars
    const vars: Record<string, string | number> = {
      journey: journeyTitle || "sua jornada",
      day: currentDay || 0,
      remaining: 30 - (currentDay || 0),
      habit: habitName || "novo hábito",
      phase: phaseName || "",
      badge: badgeName || "",
      days: inactiveDays || 0,
    };

    const copy = selectCopy(type, vars);

    // Send via existing send-push-notification function
    const pushResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/send-push-notification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          userId,
          title: copy.title,
          body: copy.body,
          icon: "/icons/icon-192.png",
          badge: "/icons/badge-72.png",
          tag: `journey-${type}-${userId}`,
          data: {
            type: `journey-${type}`,
            journeyTitle,
            currentDay,
            url: "/app/dashboard",
          },
        }),
      }
    );

    const result = await pushResponse.json();
    const sent = pushResponse.ok && result.sent > 0;

    // Log to notification_history
    if (sent) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("notification_history").insert({
        user_id: userId,
        context_type: `journey_${type}`,
        message_key: `journey_${type}`,
        title: copy.title,
        body: copy.body,
        sent_at: new Date().toISOString(),
        notification_date: today,
      });
    }

    console.log(`[JourneyNotif] ${type} for user=${userId} sent=${sent}`);

    return new Response(
      JSON.stringify({ success: true, sent, type, title: copy.title }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[JourneyNotif] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
