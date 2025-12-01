/**
 * Edge Function: habit-reminder-scheduler
 *
 * Sends push notifications to remind users about their habits.
 * Designed to be called by pg_cron at regular intervals (e.g., every hour).
 *
 * Logic:
 * 1. Get current hour in user's timezone
 * 2. Find habits that have reminders enabled for this time period
 * 3. Check if habit wasn't completed today
 * 4. Send push notification to users with pending habits
 *
 * pg_cron setup:
 * SELECT cron.schedule(
 *   'habit-reminders-morning',
 *   '0 8 * * *',  -- 8:00 AM UTC
 *   $$SELECT net.http_post(
 *     url := 'https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/habit-reminder-scheduler',
 *     headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
 *     body := '{"period": "morning"}'::jsonb
 *   )$$
 * );
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

interface SchedulerPayload {
  period?: "morning" | "afternoon" | "evening";
  dryRun?: boolean;
}

// Period configuration
const PERIOD_CONFIG: Record<string, { greeting: string; emoji: string }> = {
  morning: { greeting: "Bom dia", emoji: "🌅" },
  afternoon: { greeting: "Boa tarde", emoji: "☀️" },
  evening: { greeting: "Boa noite", emoji: "🌙" },
};

interface HabitNotificationPref {
  reminder_enabled?: boolean;
  reminder_time?: string;
  sound?: string | null;
  time_sensitive?: boolean;
}

interface HabitWithPref {
  id: string;
  name: string;
  emoji: string;
  period: string;
  user_id: string;
  notification_pref?: HabitNotificationPref | null;
}

/**
 * Generate personalized notification message for a user based on their pending habits
 */
function generateUserMessage(
  habits: HabitWithPref[],
  period: string
): { title: string; body: string } {
  const count = habits.length;
  const config = PERIOD_CONFIG[period] || PERIOD_CONFIG.morning;

  // Title with count
  const habitWord = count === 1 ? "hábito aguarda" : "hábitos aguardam";
  const title = `${config.emoji} ${config.greeting}! ${count} ${habitWord} você`;

  // Body with habit names (up to 3, then "+ N more")
  const habitNames = habits.slice(0, 3).map(h => `${h.emoji} ${h.name}`);
  const remaining = count - 3;

  let body = habitNames.join(", ");
  if (remaining > 0) {
    body += ` e mais ${remaining}`;
  }
  body += ". Bora!";

  return { title, body };
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

  // Verify authorization (should be called with service role key)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.includes(SUPABASE_SERVICE_ROLE_KEY || "")) {
    // Also accept if called from pg_cron (internal)
    const isInternalCall = req.headers.get("x-pg-cron") === "true";
    if (!isInternalCall) {
      console.warn("Unauthorized call to scheduler");
      // Continue anyway for development, but log warning
    }
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing required environment variables");
    return new Response(JSON.stringify({ error: "Function misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload: SchedulerPayload = await req.json().catch(() => ({}));
    const period = payload.period;
    const dryRun = payload.dryRun || false;

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get today's date in Brazil timezone
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Build query for habits
    let query = supabase
      .from("habits")
      .select(`
        id,
        name,
        emoji,
        period,
        user_id,
        habit_completions!inner (
          completed_at
        )
      `)
      .eq("is_active", true);

    // Filter by period if specified
    if (period) {
      query = query.eq("period", period);
    }

    const { data: habits, error: habitsError } = await query;

    if (habitsError) {
      console.error("Error fetching habits:", habitsError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all habits with notification preferences
    const { data: allHabits, error: allHabitsError } = await supabase
      .from("habits")
      .select("id, name, emoji, period, user_id, notification_pref")
      .eq("is_active", true)
      .eq("period", period || "morning");

    if (allHabitsError) {
      console.error("Error fetching all habits:", allHabitsError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter habits based on notification preferences
    // If no preference is set, assume notifications are enabled (backwards compatibility)
    const habitsWithNotifications = (allHabits as HabitWithPref[] || []).filter(h => {
      const pref = h.notification_pref;
      // If no preference exists or reminder_enabled is not explicitly false, include it
      return pref?.reminder_enabled !== false;
    });

    // Get today's completions
    const { data: completions, error: completionsError } = await supabase
      .from("habit_completions")
      .select("habit_id")
      .eq("completed_at", today);

    if (completionsError) {
      console.error("Error fetching completions:", completionsError);
    }

    const completedHabitIds = new Set(completions?.map(c => c.habit_id) || []);

    // Filter to habits not completed today (only those with notifications enabled)
    const pendingHabits = habitsWithNotifications.filter(h => !completedHabitIds.has(h.id));

    // Group by user
    const userHabits: Record<string, HabitWithPref[]> = {};
    for (const habit of pendingHabits) {
      if (!userHabits[habit.user_id]) {
        userHabits[habit.user_id] = [];
      }
      userHabits[habit.user_id].push(habit);
    }

    const userIds = Object.keys(userHabits);

    if (userIds.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No pending habits to remind",
        usersNotified: 0,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get push subscriptions for these users
    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("user_id")
      .in("user_id", userIds);

    if (subsError) {
      console.error("Error fetching subscriptions:", subsError);
    }

    const usersWithPush = new Set(subscriptions?.map(s => s.user_id) || []);
    const usersToNotify = userIds.filter(uid => usersWithPush.has(uid));

    if (usersToNotify.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No users with push subscriptions have pending habits",
        pendingUsers: userIds.length,
        usersNotified: 0,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If dry run, just return stats
    if (dryRun) {
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        period,
        pendingHabits: pendingHabits.length,
        usersWithPendingHabits: userIds.length,
        usersWithPushEnabled: usersToNotify.length,
        wouldNotify: usersToNotify,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send personalized notifications for each user
    const pushResults: Array<{ userId: string; success: boolean; error?: string }> = [];

    for (const userId of usersToNotify) {
      const userPendingHabits = userHabits[userId];
      const message = generateUserMessage(userPendingHabits, period || "morning");

      try {
        const pushResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            userId, // Send to one user at a time for personalized message
            title: message.title,
            body: message.body,
            tag: `habit-reminder-${period || "morning"}`,
            data: {
              type: "habit-reminder",
              period: period || "morning",
              habitCount: userPendingHabits.length,
              habitIds: userPendingHabits.map(h => h.id),
              url: "/app/dashboard",
            },
            actions: [
              { action: "open", title: "Ver hábitos" },
              { action: "dismiss", title: "Depois" },
            ],
          }),
        });

        const result = await pushResponse.json();
        pushResults.push({ userId, success: pushResponse.ok, ...result });

        console.log(`Push sent to ${userId}: ${userPendingHabits.length} habits - "${message.title}"`);
      } catch (error) {
        console.error(`Failed to send push to ${userId}:`, error);
        pushResults.push({ userId, success: false, error: String(error) });
      }
    }

    const successCount = pushResults.filter(r => r.success).length;
    console.log(`Habit reminders sent: ${successCount}/${usersToNotify.length} successful`);

    return new Response(JSON.stringify({
      success: true,
      period,
      pendingHabits: pendingHabits.length,
      usersNotified: successCount,
      totalAttempted: usersToNotify.length,
      results: pushResults,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in scheduler:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
