/**
 * Edge Function: send-streak-notification
 *
 * Sends celebratory push notifications when user reaches streak milestones.
 * Called from useGamification hook when streak reaches 3, 7, 14, or 30 days.
 *
 * Uses COPY_BANK from copy-utils.ts (Sprint 3) for message selection.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

interface StreakNotificationPayload {
  userId: string;
  milestone: 3 | 7 | 14 | 30;
}

interface CopyMessage {
  key: string;
  title: string;
  body: string;
  personalized: boolean;
}

interface CopyContext {
  contextType: string;
  generic: CopyMessage[];
  personalized: CopyMessage[];
}

// ============================================================================
// QUIET HOURS - Respect user sleep/do-not-disturb preferences
// ============================================================================

/**
 * Get current time in Brazil timezone (UTC-3)
 */
function getBrazilTime(): Date {
  const now = new Date();
  const brazilOffset = -3 * 60; // minutes
  const utcOffset = now.getTimezoneOffset(); // minutes from UTC
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
    // Overnight range (e.g., 22:00 → 07:00)
    return current >= start || current < end;
  }
}

/**
 * Copy bank for streak celebrations (from Sprint 1)
 */
const STREAK_COPY_BANK: Record<number, CopyContext> = {
  3: {
    contextType: "streak_3",
    generic: [
      { key: "streak3_g1", title: "Opa!", body: "3 dias seguidos! ta virando rotina ein 👀", personalized: false },
      { key: "streak3_g2", title: "3 dias! 🔥", body: "o comeco de um habito nasce em 3 dias. parabens!", personalized: false },
      { key: "streak3_g3", title: "Olha quem ta firme!", body: "3 dias sem parar. isso e consistencia!", personalized: false },
    ],
    personalized: [
      { key: "streak3_p1", title: "Olha so!", body: "{habitEmoji} {habitName} - 3 dias firme! 🔥", personalized: true },
      { key: "streak3_p2", title: "Triiiico! 🎯", body: "3 dias de {habitEmoji} {habitName}! to orgulhoso!", personalized: true },
      { key: "streak3_p3", title: "Vai que vai!", body: "{habitEmoji} {habitName} por 3 dias! continue assim!", personalized: true },
    ],
  },
  7: {
    contextType: "streak_7",
    generic: [
      { key: "streak7_g1", title: "UMA SEMANA! 🎉", body: "7 dias mantendo o habito! respeito total", personalized: false },
      { key: "streak7_g2", title: "7 dias! 🏆", body: "uma semana inteira! voce e mais disciplinado que 90% das pessoas", personalized: false },
      { key: "streak7_g3", title: "Streak de 7!", body: "1 semana firme. isso ja e um habito formado!", personalized: false },
    ],
    personalized: [
      { key: "streak7_p1", title: "SEMANA COMPLETA!", body: "{habitEmoji} {habitName} - 7 dias! 🏆", personalized: true },
      { key: "streak7_p2", title: "Impressionante!", body: "{habitEmoji} {habitName} por 7 dias direto! 🎉", personalized: true },
      { key: "streak7_p3", title: "Uma semana de {habitEmoji}!", body: "{habitName} virou rotina. lindo de ver!", personalized: true },
    ],
  },
  14: {
    contextType: "streak_14",
    generic: [
      { key: "streak14_g1", title: "DUAS SEMANAS! 💪", body: "14 dias! o habito ja faz parte de voce", personalized: false },
      { key: "streak14_g2", title: "14 dias!", body: "2 semanas sem falhar. voce e uma maquina!", personalized: false },
      { key: "streak14_g3", title: "Streak de 14! 🔥🔥", body: "metade de um mes. quem te para?", personalized: false },
    ],
    personalized: [
      { key: "streak14_p1", title: "IMPARAVEL!", body: "{habitEmoji} {habitName} - 14 dias! 💪", personalized: true },
      { key: "streak14_p2", title: "2 semanas de {habitEmoji}!", body: "{habitName} por 14 dias. ta no automatico!", personalized: true },
      { key: "streak14_p3", title: "Firme e forte!", body: "{habitEmoji} {habitName} - 2 semanas. impressionante!", personalized: true },
    ],
  },
  30: {
    contextType: "streak_30",
    generic: [
      { key: "streak30_g1", title: "LENDA!", body: "1 mes completo! to chorando de orgulho 🥹", personalized: false },
      { key: "streak30_g2", title: "30 DIAS! 🏅", body: "um mes inteiro. voce provou que consegue!", personalized: false },
      { key: "streak30_g3", title: "UM MES! 🎊", body: "30 dias mantendo o habito. isso e transformacao real!", personalized: false },
    ],
    personalized: [
      { key: "streak30_p1", title: "MONSTRO!", body: "{habitEmoji} {habitName} - 30 dias! respeito", personalized: true },
      { key: "streak30_p2", title: "LENDARIO!", body: "{habitEmoji} {habitName} por 1 mes inteiro! 🥹", personalized: true },
      { key: "streak30_p3", title: "30 dias de {habitEmoji}!", body: "{habitName} virou parte de quem voce e. incrivel!", personalized: true },
    ],
  },
};

/**
 * Get habit with longest streak for personalization
 */
async function getHabitWithLongestStreak(
  supabase: any,
  userId: string
): Promise<{ id: string; name: string; emoji: string } | null> {
  try {
    // Get the habit with the current streak
    const { data, error } = await supabase
      .from("habits")
      .select("id, name, emoji")
      .eq("user_id", userId)
      .gt("current_streak", 0)
      .order("current_streak", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[StreakNotif] Error fetching habit:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[StreakNotif] Failed to fetch habit:", error);
    return null;
  }
}

/**
 * Select copy message for streak milestone with rotation.
 * Gets last 5 message_keys from notification_history, filters them out.
 */
async function selectStreakCopy(
  supabase: any,
  userId: string,
  milestone: 3 | 7 | 14 | 30,
  habit: { id: string; name: string; emoji: string } | null
): Promise<{
  key: string;
  title: string;
  body: string;
  contextType: string;
}> {
  const copyContext = STREAK_COPY_BANK[milestone];

  if (!copyContext) {
    return {
      key: "fallback",
      title: "Parabéns!",
      body: `Você está indo muito bem com seus hábitos! ${milestone} dias é incrível`,
      contextType: "streak_fallback",
    };
  }

  // Get recent messages for rotation
  const { data: recentMessages } = await supabase
    .from("notification_history")
    .select("message_key")
    .eq("user_id", userId)
    .eq("context_type", copyContext.contextType)
    .order("sent_at", { ascending: false })
    .limit(5);

  const recentKeys = new Set((recentMessages || []).map((m: any) => m.message_key));

  // Prefer personalized if we have habit info
  const usePersonalized = habit !== null && copyContext.personalized.length > 0;
  const copyPool = usePersonalized ? copyContext.personalized : copyContext.generic;

  // Filter out recently used copies (rotation)
  let availableCopies = copyPool.filter(c => !recentKeys.has(c.key));
  if (availableCopies.length === 0) {
    availableCopies = copyPool; // Reset if all used
  }

  const selected = availableCopies[Math.floor(Math.random() * availableCopies.length)];

  // Personalize the copy
  let title = selected.title;
  let body = selected.body;

  if (habit && selected.personalized) {
    title = title.replace("{habitEmoji}", habit.emoji || "");
    body = body
      .replace(/{habitEmoji}/g, habit.emoji || "")
      .replace(/{habitName}/g, habit.name);
  }

  return {
    key: selected.key,
    title,
    body,
    contextType: copyContext.contextType,
  };
}

/**
 * Check if a notification of this type was already sent today for this user.
 * Prevents duplicate notifications from React re-renders.
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
 * Send streak notification via send-push-notification function
 */
async function sendStreakPush(
  supabase: any,
  userId: string,
  milestone: 3 | 7 | 14 | 30,
  copyMessage: { key: string; title: string; body: string; contextType: string }
): Promise<boolean> {
  try {
    const pushResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        userId,
        title: copyMessage.title,
        body: copyMessage.body,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
        tag: `streak-${milestone}-${userId}`,
        data: {
          type: "streak-milestone",
          milestone,
          messageKey: copyMessage.key,
          url: "/app/dashboard",
        },
        actions: [
          { action: "dismiss", title: "Muito bom!" },
        ],
      }),
    });

    const result = await pushResponse.json();
    const isSuccess = pushResponse.ok && result.sent > 0;

    return isSuccess;
  } catch (error) {
    console.error("[StreakNotif] Failed to send push:", error);
    return false;
  }
}

/**
 * Log notification to history for analytics
 */
async function logToHistory(
  supabase: any,
  userId: string,
  milestone: 3 | 7 | 14 | 30,
  copyMessage: { key: string; title: string; body: string; contextType: string }
): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];

    await supabase.from("notification_history").insert({
      user_id: userId,
      habit_id: null,
      context_type: copyMessage.contextType,
      message_key: copyMessage.key,
      title: copyMessage.title,
      body: copyMessage.body,
      sent_at: new Date().toISOString(),
      notification_date: today,
    });
  } catch (error) {
    console.error("[StreakNotif] Failed to log notification:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing required environment variables");
    return new Response(JSON.stringify({ error: "Function misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload: StreakNotificationPayload = await req.json();
    const { userId, milestone } = payload;

    if (!userId || ![3, 7, 14, 30].includes(milestone)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if user has push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (subsError || !subscriptions || subscriptions.length === 0) {
      console.log(`[StreakNotif] User ${userId} has no push subscriptions`);
      return new Response(JSON.stringify({
        success: true,
        message: "User has no push subscriptions",
        sent: false,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check quiet hours before sending
    const { data: userPrefs } = await supabase
      .from("user_progress")
      .select("notification_preferences")
      .eq("user_id", userId)
      .maybeSingle();

    const prefs = userPrefs?.notification_preferences || {};
    const brazilTime = getBrazilTime();

    if (isInQuietHours(brazilTime, prefs.quiet_hours_start, prefs.quiet_hours_end)) {
      console.log(`[StreakNotif] Skipped: quiet hours for user ${userId}`);
      return new Response(JSON.stringify({
        success: true,
        sent: false,
        reason: "quiet_hours",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check dedup - avoid sending same milestone notification twice (React re-renders)
    const copyContext = STREAK_COPY_BANK[milestone];
    if (copyContext) {
      const alreadySent = await checkAlreadySentToday(supabase, userId, copyContext.contextType);
      if (alreadySent) {
        console.log(`[StreakNotif] Skipped: already sent ${copyContext.contextType} today for user ${userId}`);
        return new Response(JSON.stringify({
          success: true,
          sent: false,
          reason: "already_sent_today",
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get habit with longest streak for personalization
    const habit = await getHabitWithLongestStreak(supabase, userId);

    // Select copy message with rotation
    const copyMessage = await selectStreakCopy(supabase, userId, milestone, habit);

    // Send push notification
    const pushSuccess = await sendStreakPush(supabase, userId, milestone, copyMessage);

    if (pushSuccess) {
      // Log to notification history
      await logToHistory(supabase, userId, milestone, copyMessage);

      console.log(`[StreakNotif] Streak ${milestone} notification sent for user ${userId} [${copyMessage.key}]`);
    }

    return new Response(JSON.stringify({
      success: true,
      sent: pushSuccess,
      milestone,
      messageKey: copyMessage.key,
      habitual: habit ? habit.name : null,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in streak notification:", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
