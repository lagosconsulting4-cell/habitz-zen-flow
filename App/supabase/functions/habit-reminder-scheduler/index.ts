/**
 * Edge Function: habit-reminder-scheduler
 *
 * Sends push notifications for individual habit reminders at user-configured times.
 * Runs every 5 minutes via pg_cron and checks which habits need reminders NOW.
 *
 * Logic:
 * 1. Get current time in Brazil timezone (UTC-3)
 * 2. Find habits with reminder_time within current 5-minute window
 * 3. Check if habit is scheduled for today (days_of_week)
 * 4. Check if habit wasn't completed today
 * 5. Send individual push notification for each habit
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
  dryRun?: boolean;
  testTime?: string; // For testing: "HH:mm" format
}

interface Habit {
  id: string;
  name: string;
  emoji: string;
  period: string;
  user_id: string;
  reminder_time: string | null;
  days_of_week: number[] | null;
  notification_pref: {
    reminder_enabled?: boolean;
  } | null;
}

/**
 * Get current time in Brazil timezone (UTC-3)
 */
function getBrazilTime(): Date {
  const now = new Date();
  // Brazil is UTC-3
  const brazilOffset = -3 * 60; // minutes
  const utcOffset = now.getTimezoneOffset(); // minutes from UTC
  const brazilTime = new Date(now.getTime() + (utcOffset + brazilOffset) * 60 * 1000);
  return brazilTime;
}

/**
 * Check if a time string (HH:mm) is within the current 5-minute window
 */
function isTimeInWindow(reminderTime: string, currentTime: Date): boolean {
  const [hours, minutes] = reminderTime.split(":").map(Number);
  const reminderMinutes = hours * 60 + minutes;

  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  // Check if reminder is within current 5-minute window
  // e.g., if current time is 14:32, window is 14:30-14:34
  const windowStart = Math.floor(currentTotalMinutes / 5) * 5;
  const windowEnd = windowStart + 4;

  return reminderMinutes >= windowStart && reminderMinutes <= windowEnd;
}

/**
 * Check if habit is scheduled for today based on days_of_week
 */
function isScheduledForToday(daysOfWeek: number[] | null, currentTime: Date): boolean {
  if (!daysOfWeek || daysOfWeek.length === 0) {
    return true; // No restriction = every day
  }
  const today = currentTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
  return daysOfWeek.includes(today);
}

/**
 * Get greeting based on time of day
 */
function getGreeting(hour: number): { greeting: string; emoji: string } {
  if (hour >= 5 && hour < 12) {
    return { greeting: "Bom dia", emoji: "🌅" };
  } else if (hour >= 12 && hour < 18) {
    return { greeting: "Boa tarde", emoji: "☀️" };
  } else {
    return { greeting: "Boa noite", emoji: "🌙" };
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
    const payload: SchedulerPayload = await req.json().catch(() => ({}));
    const dryRun = payload.dryRun || false;

    // Get current time in Brazil timezone
    const brazilTime = getBrazilTime();

    // Allow override for testing
    if (payload.testTime) {
      const [h, m] = payload.testTime.split(":").map(Number);
      brazilTime.setHours(h, m, 0, 0);
    }

    const currentHour = brazilTime.getHours();
    const currentMinute = brazilTime.getMinutes();
    const today = brazilTime.toISOString().split("T")[0];

    console.log(`[Scheduler] Running at ${currentHour}:${currentMinute.toString().padStart(2, "0")} Brazil time`);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all active habits with reminder_time set
    const { data: habits, error: habitsError } = await supabase
      .from("habits")
      .select("id, name, emoji, period, user_id, reminder_time, days_of_week, notification_pref")
      .eq("is_active", true)
      .not("reminder_time", "is", null);

    if (habitsError) {
      console.error("Error fetching habits:", habitsError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!habits || habits.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No habits with reminders configured",
        habitsChecked: 0,
        notificationsSent: 0,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter habits that should receive notification NOW
    const habitsToNotify = (habits as Habit[]).filter(habit => {
      // Check if notifications are enabled
      if (habit.notification_pref?.reminder_enabled === false) {
        return false;
      }

      // Check if reminder_time is in current window
      if (!habit.reminder_time || !isTimeInWindow(habit.reminder_time, brazilTime)) {
        return false;
      }

      // Check if habit is scheduled for today
      if (!isScheduledForToday(habit.days_of_week, brazilTime)) {
        return false;
      }

      return true;
    });

    if (habitsToNotify.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No habits need reminders right now",
        habitsChecked: habits.length,
        currentTime: `${currentHour}:${currentMinute.toString().padStart(2, "0")}`,
        notificationsSent: 0,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get today's completions
    const habitIds = habitsToNotify.map(h => h.id);
    const { data: completions, error: completionsError } = await supabase
      .from("habit_completions")
      .select("habit_id")
      .in("habit_id", habitIds)
      .eq("completed_at", today);

    if (completionsError) {
      console.error("Error fetching completions:", completionsError);
    }

    const completedHabitIds = new Set(completions?.map(c => c.habit_id) || []);

    // Filter to habits not completed today
    const pendingHabits = habitsToNotify.filter(h => !completedHabitIds.has(h.id));

    if (pendingHabits.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "All habits in this window already completed",
        habitsChecked: habits.length,
        habitsInWindow: habitsToNotify.length,
        notificationsSent: 0,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get users with push subscriptions
    const userIds = [...new Set(pendingHabits.map(h => h.user_id))];
    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("user_id")
      .in("user_id", userIds);

    if (subsError) {
      console.error("Error fetching subscriptions:", subsError);
    }

    const usersWithPush = new Set(subscriptions?.map(s => s.user_id) || []);

    // Filter to habits where user has push enabled
    const habitsWithPush = pendingHabits.filter(h => usersWithPush.has(h.user_id));

    if (habitsWithPush.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No users with push subscriptions for pending habits",
        habitsChecked: habits.length,
        pendingHabits: pendingHabits.length,
        notificationsSent: 0,
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
        currentTime: `${currentHour}:${currentMinute.toString().padStart(2, "0")}`,
        habitsChecked: habits.length,
        habitsInWindow: habitsToNotify.length,
        pendingHabits: pendingHabits.length,
        habitsWithPush: habitsWithPush.length,
        wouldNotify: habitsWithPush.map(h => ({
          habitId: h.id,
          name: h.name,
          userId: h.user_id,
          reminderTime: h.reminder_time,
        })),
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send individual notifications for each habit
    const { greeting, emoji } = getGreeting(currentHour);
    const results: Array<{ habitId: string; userId: string; success: boolean; error?: string }> = [];

    for (const habit of habitsWithPush) {
      try {
        const pushResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            userId: habit.user_id,
            title: `${emoji} ${greeting}! Hora do seu hábito`,
            body: `${habit.emoji} ${habit.name} - Bora!`,
            tag: `habit-${habit.id}`,
            data: {
              type: "habit-reminder",
              habitId: habit.id,
              habitName: habit.name,
              url: "/app/dashboard",
            },
            actions: [
              { action: "complete", title: "Completar" },
              { action: "dismiss", title: "Depois" },
            ],
          }),
        });

        const result = await pushResponse.json();
        results.push({
          habitId: habit.id,
          userId: habit.user_id,
          success: pushResponse.ok && result.sent > 0,
          error: result.error,
        });

        console.log(`[Scheduler] Sent reminder for "${habit.name}" to user ${habit.user_id}`);
      } catch (error) {
        console.error(`[Scheduler] Failed to send reminder for habit ${habit.id}:`, error);
        results.push({
          habitId: habit.id,
          userId: habit.user_id,
          success: false,
          error: String(error),
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[Scheduler] Sent ${successCount}/${habitsWithPush.length} reminders`);

    return new Response(JSON.stringify({
      success: true,
      currentTime: `${currentHour}:${currentMinute.toString().padStart(2, "0")}`,
      habitsChecked: habits.length,
      habitsInWindow: habitsToNotify.length,
      notificationsSent: successCount,
      totalAttempted: habitsWithPush.length,
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in scheduler:", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
