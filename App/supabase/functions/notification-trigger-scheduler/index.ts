/**
 * Edge Function: notification-trigger-scheduler
 *
 * Sends push notifications for behavioral triggers:
 * 1. DELAYED: Habit not completed 2+ hours after reminder time
 * 2. END_OF_DAY: Pending habits at 22:00-23:59 (last chance notification)
 * 3. MULTIPLE_PENDING: 3+ habits pending at 15:00-18:00 (afternoon catch-up)
 *
 * Runs hourly via pg_cron. Different from habit-reminder-scheduler which
 * runs every 5 minutes for time-based reminders.
 *
 * Uses shared copy engine from habit-reminder-scheduler.
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

interface TriggerPayload {
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
  const brazilOffset = -3 * 60; // minutes
  const utcOffset = now.getTimezoneOffset(); // minutes from UTC
  const brazilTime = new Date(now.getTime() + (utcOffset + brazilOffset) * 60 * 1000);
  return brazilTime;
}

/**
 * Check if habit is delayed (X+ hours after reminder time)
 */
function isHabitDelayed(reminderTime: string, currentTime: Date, delayHours: number): boolean {
  const [hours, minutes] = reminderTime.split(":").map(Number);
  const reminderDate = new Date(currentTime);
  reminderDate.setHours(hours, minutes, 0, 0);

  const diffMs = currentTime.getTime() - reminderDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= delayHours;
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
 * TRIGGER 1: DELAYED HABIT
 * Checks if habit was not completed 2+ hours after reminder time
 */
async function checkDelayedHabits(
  supabase: any,
  brazilTime: Date,
  currentHour: number
): Promise<{ habitId: string; userId: string; reminderTime: string }[]> {
  // Only check during business hours (6-22h)
  if (currentHour < 6 || currentHour >= 22) {
    return [];
  }

  const today = brazilTime.toISOString().split("T")[0];

  // Get habits with reminder_time 2+ hours ago
  const { data: habits, error } = await supabase
    .from("habits")
    .select("id, name, emoji, user_id, reminder_time, days_of_week, notification_pref")
    .eq("is_active", true)
    .not("reminder_time", "is", null);

  if (error) {
    console.error("[Delayed] Error fetching habits:", error);
    return [];
  }

  const delayedHabits: { habitId: string; userId: string; reminderTime: string }[] = [];

  for (const habit of habits || []) {
    // Check if habit is scheduled for today
    if (!isScheduledForToday(habit.days_of_week, brazilTime)) {
      continue;
    }

    // Check if habit is delayed (2+ hours after reminder)
    if (!isHabitDelayed(habit.reminder_time, brazilTime, 2)) {
      continue;
    }

    // Check if habit NOT completed today
    const { data: completion, error: completionError } = await supabase
      .from("habit_completions")
      .select("id")
      .eq("habit_id", habit.id)
      .eq("completed_at", today)
      .maybeSingle();

    if (completionError) {
      console.error(`[Delayed] Error checking completion for habit ${habit.id}:`, completionError);
      continue;
    }

    if (!completion) {
      // Habit not completed today
      delayedHabits.push({
        habitId: habit.id,
        userId: habit.user_id,
        reminderTime: habit.reminder_time,
      });
    }
  }

  return delayedHabits;
}

/**
 * TRIGGER 2: END OF DAY
 * Checks at 22:00-23:59 for pending habits (last chance)
 */
async function checkEndOfDayHabits(
  supabase: any,
  brazilTime: Date,
  currentHour: number
): Promise<{ habitId: string; userId: string }[]> {
  // Only trigger at 22:00 (or between 22:00-23:59)
  if (currentHour < 22) {
    return [];
  }

  const today = brazilTime.toISOString().split("T")[0];

  // Get all habits (filtered by is_active and scheduled for today)
  const { data: habits, error } = await supabase
    .from("habits")
    .select("id, name, emoji, user_id, reminder_time, days_of_week, notification_pref")
    .eq("is_active", true);

  if (error) {
    console.error("[EndOfDay] Error fetching habits:", error);
    return [];
  }

  const endOfDayHabits: { habitId: string; userId: string }[] = [];

  for (const habit of habits || []) {
    // Check if notifications are enabled
    if (habit.notification_pref?.reminder_enabled === false) {
      continue;
    }

    // Check if habit is scheduled for today
    if (!isScheduledForToday(habit.days_of_week, brazilTime)) {
      continue;
    }

    // Check if habit NOT completed today
    const { data: completion, error: completionError } = await supabase
      .from("habit_completions")
      .select("id")
      .eq("habit_id", habit.id)
      .eq("completed_at", today)
      .maybeSingle();

    if (completionError) {
      console.error(`[EndOfDay] Error checking completion for habit ${habit.id}:`, completionError);
      continue;
    }

    if (!completion) {
      // Habit not completed today - last chance notification
      endOfDayHabits.push({
        habitId: habit.id,
        userId: habit.user_id,
      });
    }
  }

  return endOfDayHabits;
}

/**
 * TRIGGER 3: MULTIPLE PENDING
 * Checks at 15:00-18:00 for users with 3+ pending habits
 */
async function checkMultiplePendingHabits(
  supabase: any,
  brazilTime: Date,
  currentHour: number
): Promise<{ userId: string; pendingCount: number }[]> {
  // Only trigger at afternoon hours (15:00-18:00)
  if (currentHour < 15 || currentHour >= 18) {
    return [];
  }

  const today = brazilTime.toISOString().split("T")[0];

  // Get all active habits
  const { data: habits, error } = await supabase
    .from("habits")
    .select("id, user_id, reminder_time, days_of_week, notification_pref")
    .eq("is_active", true);

  if (error) {
    console.error("[MultiplePending] Error fetching habits:", error);
    return [];
  }

  // Count pending habits per user
  const pendingByUser = new Map<string, number>();

  for (const habit of habits || []) {
    // Check if notifications are enabled
    if (habit.notification_pref?.reminder_enabled === false) {
      continue;
    }

    // Check if habit is scheduled for today
    if (!isScheduledForToday(habit.days_of_week, brazilTime)) {
      continue;
    }

    // Check if habit NOT completed today
    const { data: completion, error: completionError } = await supabase
      .from("habit_completions")
      .select("id")
      .eq("habit_id", habit.id)
      .eq("completed_at", today)
      .maybeSingle();

    if (completionError) {
      console.error(`[MultiplePending] Error checking completion for habit ${habit.id}:`, completionError);
      continue;
    }

    if (!completion) {
      // Habit not completed
      const userId = habit.user_id;
      const count = (pendingByUser.get(userId) || 0) + 1;
      pendingByUser.set(userId, count);
    }
  }

  // Filter users with 3+ pending habits
  const result: { userId: string; pendingCount: number }[] = [];
  for (const [userId, count] of pendingByUser.entries()) {
    if (count >= 3) {
      result.push({ userId, pendingCount: count });
    }
  }

  return result;
}

/**
 * Send trigger notification via send-push-notification edge function
 */
async function sendTriggerNotification(
  supabase: any,
  userId: string,
  title: string,
  body: string,
  context: string,
  messageKey: string,
  habitId?: string
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
        title,
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
        tag: `trigger-${context}-${userId}`,
        data: {
          type: "trigger-notification",
          context,
          url: "/app/dashboard",
        },
        actions: [
          { action: "dismiss", title: "Depois" },
        ],
      }),
    });

    const result = await pushResponse.json();
    const isSuccess = pushResponse.ok && result.sent > 0;

    // Save to notification history
    if (isSuccess) {
      const today = new Date().toISOString().split("T")[0];
      const { error: historyError } = await supabase
        .from("notification_history")
        .insert({
          user_id: userId,
          habit_id: habitId || null,
          context_type: context,
          message_key: messageKey,
          title,
          body,
          sent_at: new Date().toISOString(),
          notification_date: today,
        });

      if (historyError) {
        console.error(`[TriggerNotification] Failed to save history: ${historyError}`);
      }
    }

    return isSuccess;
  } catch (error) {
    console.error(`[TriggerNotification] Failed to send: ${error}`);
    return false;
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
    const payload: TriggerPayload = await req.json().catch(() => ({}));
    const dryRun = payload.dryRun || false;

    // Get current time in Brazil timezone
    const brazilTime = getBrazilTime();

    // Allow override for testing
    if (payload.testTime) {
      const [h, m] = payload.testTime.split(":").map(Number);
      brazilTime.setHours(h, m, 0, 0);
    }

    const currentHour = brazilTime.getHours();
    const today = brazilTime.toISOString().split("T")[0];

    console.log(`[TriggerScheduler] Running at ${currentHour}:00 Brazil time`);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check for push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("user_id");

    if (subsError) {
      console.error("Error fetching subscriptions:", subsError);
    }

    const usersWithPush = new Set(subscriptions?.map((s: any) => s.user_id) || []);

    // TRIGGER 1: Check delayed habits
    const delayedHabits = await checkDelayedHabits(supabase, brazilTime, currentHour);
    const delayedWithPush = delayedHabits.filter(h => usersWithPush.has(h.userId));

    // TRIGGER 2: Check end-of-day habits
    const endOfDayHabits = await checkEndOfDayHabits(supabase, brazilTime, currentHour);
    const endOfDayWithPush = endOfDayHabits.filter(h => usersWithPush.has(h.userId));

    // TRIGGER 3: Check multiple pending
    const multiplePendingUsers = await checkMultiplePendingHabits(supabase, brazilTime, currentHour);
    const multiplePendingWithPush = multiplePendingUsers.filter(u => usersWithPush.has(u.userId));

    if (dryRun) {
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        currentTime: `${currentHour}:00`,
        triggers: {
          delayed: delayedWithPush.length,
          endOfDay: endOfDayWithPush.length,
          multiplePending: multiplePendingWithPush.length,
        },
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = {
      delayed: 0,
      endOfDay: 0,
      multiplePending: 0,
      failed: 0,
    };

    // Process TRIGGER 1: Delayed habits
    for (const habit of delayedWithPush) {
      const success = await sendTriggerNotification(
        supabase,
        habit.userId,
        "Saudade...",
        "ainda ta aqui esperando por voce... completa agora? 👀",
        "delayed",
        "delayed_g1",
        habit.habitId
      );
      if (success) results.delayed++;
      else results.failed++;
    }

    // Process TRIGGER 2: End of day
    for (const habit of endOfDayWithPush) {
      const success = await sendTriggerNotification(
        supabase,
        habit.userId,
        "Ultima chance!",
        "o dia ta acabando... bora terminar seus habitos? ⏰",
        "end_of_day",
        "end_of_day_g1",
        habit.habitId
      );
      if (success) results.endOfDay++;
      else results.failed++;
    }

    // Process TRIGGER 3: Multiple pending
    for (const user of multiplePendingWithPush) {
      const success = await sendTriggerNotification(
        supabase,
        user.userId,
        "Ops!",
        `voce tem ${user.pendingCount} habitos pendentes... bora se organizar?`,
        "multiple_pending",
        "multiple_pending_g1"
      );
      if (success) results.multiplePending++;
      else results.failed++;
    }

    console.log(`[TriggerScheduler] Results:`, results);

    return new Response(JSON.stringify({
      success: true,
      currentTime: `${currentHour}:00`,
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in trigger scheduler:", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
