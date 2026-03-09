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
  totalDays?: number;
  habitName?: string;
  phaseName?: string;
  badgeName?: string;
  inactiveDays?: number;
}

// ============================================================================
// QUIET HOURS - Respect user sleep/do-not-disturb preferences
// ============================================================================

/**
 * Get current time in Brazil timezone (UTC-3)
 */
function getBrazilTime(): Date {
  const now = new Date();
  const brazilOffset = -3 * 60;
  const utcOffset = now.getTimezoneOffset();
  return new Date(now.getTime() + (utcOffset + brazilOffset) * 60 * 1000);
}

/**
 * Check if current time falls within user's quiet hours.
 * Handles overnight ranges (e.g., 22:00 → 07:00).
 */
function isInQuietHours(
  brazilTime: Date,
  quietStart: string | null | undefined,
  quietEnd: string | null | undefined
): boolean {
  if (!quietStart || !quietEnd) return false;

  const [startH, startM] = quietStart.split(":").map(Number);
  const [endH, endM] = quietEnd.split(":").map(Number);
  const currentH = brazilTime.getHours();
  const currentM = brazilTime.getMinutes();

  const current = currentH * 60 + currentM;
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;

  if (start <= end) {
    return current >= start && current < end;
  } else {
    return current >= start || current < end;
  }
}

interface JourneyCopyMessage {
  key: string;
  title: string;
  body: string;
}

const COPY_BANK: Record<NotificationType, JourneyCopyMessage[]> = {
  daily_reminder: [
    { key: "jdr_1", title: "Bora! 💪", body: "Dia {day} de {journey} te espera. So faltam {remaining} dias!" },
    { key: "jdr_2", title: "Sua jornada continua", body: "{journey} — Dia {day}. Cada dia conta." },
    { key: "jdr_3", title: "Nao quebre a sequencia", body: "Dia {day} de {journey}. Ta indo demais!" },
    { key: "jdr_4", title: "Dia {day}! 🗓️", body: "{journey} te espera. Bora manter o ritmo?" },
    { key: "jdr_5", title: "Falta pouco!", body: "Dia {day} de {total}. {remaining} dias pra completar {journey}!" },
  ],
  new_habit: [
    { key: "jnh_1", title: "Novo habito! 🆕", body: "Amanha comeca {habit} na sua jornada {journey}" },
    { key: "jnh_2", title: "Desbloqueado!", body: "{habit} foi adicionado a sua rotina de {journey}" },
    { key: "jnh_3", title: "Novidade! ✨", body: "{habit} entra amanha na sua jornada. Preparado(a)?" },
    { key: "jnh_4", title: "Habito novo! 🎯", body: "{journey} evolui: {habit} comeca amanha!" },
  ],
  phase_complete: [
    { key: "jpc_1", title: "Fase completa! 🏅", body: "Voce completou {phase} de {journey}!" },
    { key: "jpc_2", title: "Mandou bem!", body: "Badge desbloqueado: {badge}! Continue com {journey}" },
    { key: "jpc_3", title: "Fase concluida! 🎉", body: "{phase} finalizada! Proxima fase te espera em {journey}" },
    { key: "jpc_4", title: "Parabens! 🏆", body: "Voce zerou {phase}. Bora pra proxima etapa de {journey}!" },
  ],
  cliff_support: [
    { key: "jcs_1", title: "A maioria desiste aqui.", body: "Dias 10-14 sao os mais dificeis. Voce e diferente." },
    { key: "jcs_2", title: "O dificil passa.", body: "Dia {day}. Todo mundo tropeca aqui. O segredo e nao parar." },
    { key: "jcs_3", title: "Fase crucial!", body: "Dia {day} de {journey}. Quem passa do dia 14 completa a jornada." },
    { key: "jcs_4", title: "To aqui com voce 💙", body: "Dia {day}. Sei que ta dificil. Faz so 1 hoje?" },
    { key: "jcs_5", title: "Aguenta firme!", body: "Dia {day}. A resistencia que voce sente agora e o habito se formando." },
  ],
  inactivity: [
    { key: "jin_1", title: "Sua jornada ta pausada", body: "Faz {days} dias que voce nao completa {journey}." },
    { key: "jin_2", title: "Volte quando puder", body: "{journey} te espera. Sem pressa, mas nao desista." },
    { key: "jin_3", title: "Sinto sua falta! 😢", body: "{journey} parada ha {days} dias. Bora retomar?" },
    { key: "jin_4", title: "Ainda da tempo!", body: "{days} dias sem {journey}. Que tal recomecar hoje?" },
  ],
  journey_complete: [
    { key: "jjc_1", title: "JORNADA COMPLETA! 🏆", body: "Voce completou {journey}! Parabens pela transformacao!" },
    { key: "jjc_2", title: "INCRIVEL! 🎊", body: "30 dias de {journey} concluidos. Voce e inspiracao!" },
    { key: "jjc_3", title: "MISSAO CUMPRIDA! 🥇", body: "{journey} finalizada! Seu esforco valeu cada dia." },
  ],
};

/**
 * Select copy message with rotation to avoid repetition.
 * Gets last 5 message_keys from notification_history, filters used ones.
 */
async function selectCopy(
  supabase: any,
  userId: string,
  type: NotificationType,
  vars: Record<string, string | number>
): Promise<{ key: string; title: string; body: string }> {
  const pool = COPY_BANK[type];
  const contextType = `journey_${type}`;

  // Get recent messages for rotation
  const { data: recentMessages } = await supabase
    .from("notification_history")
    .select("message_key")
    .eq("user_id", userId)
    .eq("context_type", contextType)
    .order("sent_at", { ascending: false })
    .limit(5);

  const recentKeys = new Set((recentMessages || []).map((m: any) => m.message_key));

  // Filter out recently used copies
  let availableCopies = pool.filter(c => !recentKeys.has(c.key));
  if (availableCopies.length === 0) {
    availableCopies = pool; // Reset if all used
  }

  const selected = availableCopies[Math.floor(Math.random() * availableCopies.length)];

  let title = selected.title;
  let body = selected.body;

  for (const [key, value] of Object.entries(vars)) {
    title = title.replaceAll(`{${key}}`, String(value));
    body = body.replaceAll(`{${key}}`, String(value));
  }

  return { key: selected.key, title, body };
}

/**
 * Check if a notification of this type was already sent today for this user.
 * Prevents duplicate notifications.
 */
async function checkAlreadySentToday(
  supabase: any,
  userId: string,
  contextType: string
): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("notification_history")
    .select("id")
    .eq("user_id", userId)
    .eq("context_type", contextType)
    .eq("notification_date", today)
    .limit(1);

  return (data || []).length > 0;
}

/**
 * Anti-burst: check if a push was sent to this user within the last N minutes.
 * Prevents multiple crons from sending pushes simultaneously.
 */
async function checkRecentlySent(
  supabase: any,
  userId: string,
  windowMinutes: number = 5
): Promise<boolean> {
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("notification_history")
    .select("id")
    .eq("user_id", userId)
    .gte("sent_at", cutoff)
    .limit(1);
  return (data || []).length > 0;
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
    const { type, userId, journeyTitle, currentDay, totalDays, habitName, phaseName, badgeName, inactiveDays } = payload;

    if (!type || !userId) {
      return new Response(JSON.stringify({ error: "Missing type or userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check quiet hours before sending
    const { data: userPrefs } = await supabase
      .from("user_progress")
      .select("notification_preferences")
      .eq("user_id", userId)
      .maybeSingle();

    const prefs = userPrefs?.notification_preferences || {};
    const brazilTime = getBrazilTime();

    if (isInQuietHours(brazilTime, prefs.quiet_hours_start, prefs.quiet_hours_end)) {
      console.log(`[JourneyNotif] Skipped: quiet hours for user ${userId}`);
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: "quiet_hours" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contextType = `journey_${type}`;

    // Check if already sent today (dedup)
    const alreadySent = await checkAlreadySentToday(supabase, userId, contextType);
    if (alreadySent) {
      console.log(`[JourneyNotif] Skipped: already sent ${contextType} today for user ${userId}`);
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: "already_sent_today" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Anti-burst: skip if push was sent < 5 min ago
    const recentlySent = await checkRecentlySent(supabase, userId, 5);
    if (recentlySent) {
      console.log(`[JourneyNotif] Skipped: push sent < 5min ago for user ${userId}`);
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: "anti_burst" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build template vars
    const effectiveTotalDays = totalDays || 30;
    const vars: Record<string, string | number> = {
      journey: journeyTitle || "sua jornada",
      day: currentDay || 0,
      total: effectiveTotalDays,
      remaining: effectiveTotalDays - (currentDay || 0),
      habit: habitName || "novo habito",
      phase: phaseName || "",
      badge: badgeName || "",
      days: inactiveDays || 0,
    };

    const copy = await selectCopy(supabase, userId, type, vars);

    // Insert history FIRST to get the ID for click tracking
    const today = new Date().toISOString().split("T")[0];
    const { data: historyRow } = await supabase
      .from("notification_history")
      .insert({
        user_id: userId,
        context_type: contextType,
        message_key: copy.key,
        title: copy.title,
        body: copy.body,
        sent_at: new Date().toISOString(),
        notification_date: today,
      })
      .select("id")
      .single();

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
            notificationHistoryId: historyRow?.id || undefined,
          },
        }),
      }
    );

    const result = await pushResponse.json();
    const sent = pushResponse.ok && result.sent > 0;

    console.log(`[JourneyNotif] ${type} for user=${userId} sent=${sent} [${copy.key}]`);

    return new Response(
      JSON.stringify({ success: true, sent, type, messageKey: copy.key, title: copy.title }),
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
