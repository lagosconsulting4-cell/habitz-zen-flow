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

/**
 * Copy bank for streak celebrations (from Sprint 1)
 */
const STREAK_COPY_BANK: Record<number, CopyContext> = {
  3: {
    contextType: "streak_3",
    generic: [
      { key: "streak3_g1", title: "Opa!", body: "3 dias seguidos! ta virando rotina ein 👀", personalized: false },
    ],
    personalized: [
      { key: "streak3_p1", title: "Olha so!", body: "{habitEmoji} {habitName} - 3 dias firme! 🔥", personalized: true },
    ],
  },
  7: {
    contextType: "streak_7",
    generic: [
      { key: "streak7_g1", title: "Serio?!", body: "1 semana direto?! to orgulhoso de voce 🥹", personalized: false },
    ],
    personalized: [
      { key: "streak7_p1", title: "Caramba!", body: "{habitName} - 7 dias seguidos! voce e brabo", personalized: true },
    ],
  },
  14: {
    contextType: "streak_14",
    generic: [
      { key: "streak14_g1", title: "UAU!", body: "2 semanas! ta virando maquina 💪", personalized: false },
    ],
    personalized: [
      { key: "streak14_p1", title: "Incrivel!", body: "{habitEmoji} {habitName} - 14 dias! lenda", personalized: true },
    ],
  },
  30: {
    contextType: "streak_30",
    generic: [
      { key: "streak30_g1", title: "LENDA!", body: "1 mes completo! to chorando de orgulho 🥹", personalized: false },
    ],
    personalized: [
      { key: "streak30_p1", title: "MONSTRO!", body: "{habitEmoji} {habitName} - 30 dias! respeito", personalized: true },
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
 * Select copy message for streak milestone
 */
function selectStreakCopy(milestone: 3 | 7 | 14 | 30, habit: { id: string; name: string; emoji: string } | null): {
  key: string;
  title: string;
  body: string;
  contextType: string;
} {
  const copyContext = STREAK_COPY_BANK[milestone];

  if (!copyContext) {
    return {
      key: "fallback",
      title: "Parabéns!",
      body: `Você está indo muito bem com seus hábitos! ${milestone} dias é incrível`,
      contextType: "streak_fallback",
    };
  }

  // Prefer personalized if we have habit info
  const usePersonalized = habit !== null && copyContext.personalized.length > 0;
  const copyPool = usePersonalized ? copyContext.personalized : copyContext.generic;
  const selected = copyPool[Math.floor(Math.random() * copyPool.length)];

  // Personalize the copy
  let title = selected.title;
  let body = selected.body;

  if (habit && selected.personalized) {
    body = body
      .replace("{habitEmoji}", habit.emoji || "")
      .replace("{habitName}", habit.name);
  }

  return {
    key: selected.key,
    title,
    body,
    contextType: copyContext.contextType,
  };
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

    // Get habit with longest streak for personalization
    const habit = await getHabitWithLongestStreak(supabase, userId);

    // Select copy message
    const copyMessage = selectStreakCopy(milestone, habit);

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
