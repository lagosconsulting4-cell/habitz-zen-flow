/**
 * Edge Function: notification-trigger-scheduler
 *
 * Sends push notifications for behavioral triggers:
 * 1. DELAYED: Habit not completed 2+ hours after reminder time
 * 2. END_OF_DAY: Pending habits at 22:00-23:59 (last chance notification)
 * 3. MULTIPLE_PENDING: 3+ habits pending at 15:00-18:00 (afternoon catch-up)
 * 4. TRIAL_DAY_3: User on day 3 of trial with no habits created
 * 5. TRIAL_DAY_5: User on day 5 of trial with streak < 3
 * 6. TRIAL_ENDING: Trial ending in 3 days or 1 day
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
 * Checks if sending a notification would exceed daily limits.
 * Limit: daily_limit (default 3) + extra_for_streaks (default 2) if streak >= 7
 */
async function checkDailyLimit(
  supabase: any,
  userId: string,
  habitId: string | null
): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];

  // If habitId provided, check if this specific habit already got a notification today
  if (habitId) {
    const { data: habitNotif, error: habitError } = await supabase
      .from("notification_history")
      .select("id")
      .eq("user_id", userId)
      .eq("habit_id", habitId)
      .eq("notification_date", today)
      .maybeSingle();

    if (habitError) {
      console.error("[Daily Limit] Error checking habit notifications:", habitError);
      return true; // Allow on error
    }

    if (habitNotif) {
      // Habit already got a notification today
      return false;
    }
  }

  // Count today's notifications for this user
  const { data: todayNotifs, error: countError } = await supabase
    .from("notification_history")
    .select("id")
    .eq("user_id", userId)
    .eq("notification_date", today);

  if (countError) {
    console.error("[Daily Limit] Error counting notifications:", countError);
    return true; // Allow on error
  }

  // Get user preferences (default: 3 base + 2 for streaks)
  const { data: userProgress, error: prefError } = await supabase
    .from("user_progress")
    .select("notification_preferences, current_streak")
    .eq("user_id", userId)
    .maybeSingle();

  const prefs = userProgress?.notification_preferences || {
    daily_limit: 3,
    extra_for_streaks: 2,
  };

  // Calculate effective limit based on streak
  let effectiveLimit = prefs.daily_limit || 3;
  if (userProgress?.current_streak >= 7) {
    effectiveLimit += prefs.extra_for_streaks || 2;
  }

  const currentCount = (todayNotifs || []).length;
  return currentCount < effectiveLimit;
}

/**
 * Checks if we already sent a notification for this habit+context today.
 * Prevents duplicate notifications for the same trigger.
 */
async function checkAlreadySentToday(
  supabase: any,
  userId: string,
  habitId: string | null,
  contextType: string
): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("notification_history")
    .select("id")
    .eq("user_id", userId)
    .eq("context_type", contextType)
    .eq("notification_date", today);

  if (habitId) {
    query = query.eq("habit_id", habitId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("[AlreadySent] Error checking notification history:", error);
    return false; // Allow on error
  }

  return !!data;
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
 * TRIGGER 4: TRIAL DAY 3
 * Checks users on day 3 of trial who haven't created any habits
 */
async function checkTrialDay3(
  supabase: any,
  currentHour: number
): Promise<{ userId: string; email: string }[]> {
  // Only trigger at 10:00 AM (morning engagement time)
  if (currentHour !== 10) {
    return [];
  }

  // Get users in trial for exactly 3 days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const startOfDay = threeDaysAgo.toISOString().split("T")[0];
  const endOfDay = startOfDay + "T23:59:59Z";

  const { data: purchases, error } = await supabase
    .from("purchases")
    .select("user_id, email")
    .eq("status", "paid")
    .not("trial_end_date", "is", null)
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay);

  if (error) {
    console.error("[TrialDay3] Error fetching trial users:", error);
    return [];
  }

  const result: { userId: string; email: string }[] = [];

  for (const purchase of purchases || []) {
    // Check if user has any habits
    const { data: habits, error: habitsError } = await supabase
      .from("habits")
      .select("id")
      .eq("user_id", purchase.user_id)
      .eq("is_active", true)
      .limit(1);

    if (habitsError) {
      console.error(`[TrialDay3] Error checking habits for user ${purchase.user_id}:`, habitsError);
      continue;
    }

    if (!habits || habits.length === 0) {
      // User has no habits after 3 days
      result.push({ userId: purchase.user_id, email: purchase.email });
    }
  }

  return result;
}

/**
 * TRIGGER 5: TRIAL DAY 5
 * Checks users on day 5 of trial with streak < 3
 */
async function checkTrialDay5(
  supabase: any,
  currentHour: number
): Promise<{ userId: string; email: string; streak: number }[]> {
  // Only trigger at 10:00 AM
  if (currentHour !== 10) {
    return [];
  }

  // Get users in trial for exactly 5 days
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const startOfDay = fiveDaysAgo.toISOString().split("T")[0];
  const endOfDay = startOfDay + "T23:59:59Z";

  const { data: purchases, error } = await supabase
    .from("purchases")
    .select("user_id, email")
    .eq("status", "paid")
    .not("trial_end_date", "is", null)
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay);

  if (error) {
    console.error("[TrialDay5] Error fetching trial users:", error);
    return [];
  }

  const result: { userId: string; email: string; streak: number }[] = [];

  for (const purchase of purchases || []) {
    // Check user's current streak
    const { data: progress, error: progressError } = await supabase
      .from("user_progress")
      .select("current_streak")
      .eq("user_id", purchase.user_id)
      .maybeSingle();

    if (progressError) {
      console.error(`[TrialDay5] Error checking progress for user ${purchase.user_id}:`, progressError);
      continue;
    }

    const streak = progress?.current_streak ?? 0;
    if (streak < 3) {
      // User has low streak after 5 days
      result.push({ userId: purchase.user_id, email: purchase.email, streak });
    }
  }

  return result;
}

/**
 * TRIGGER 6: TRIAL ENDING
 * Checks users whose trial ends in 3 days or 1 day
 */
async function checkTrialEnding(
  supabase: any,
  currentHour: number
): Promise<{ userId: string; email: string; daysLeft: number }[]> {
  // Only trigger at 10:00 AM
  if (currentHour !== 10) {
    return [];
  }

  const now = new Date();
  const result: { userId: string; email: string; daysLeft: number }[] = [];

  // Check for 3 days and 1 day before trial ends
  for (const daysLeft of [3, 1]) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysLeft);
    const startOfDay = targetDate.toISOString().split("T")[0];
    const endOfDay = startOfDay + "T23:59:59Z";

    const { data: purchases, error } = await supabase
      .from("purchases")
      .select("user_id, email")
      .eq("status", "paid")
      .gte("trial_end_date", startOfDay)
      .lte("trial_end_date", endOfDay);

    if (error) {
      console.error(`[TrialEnding] Error fetching trial users (${daysLeft}d):`, error);
      continue;
    }

    for (const purchase of purchases || []) {
      result.push({ userId: purchase.user_id, email: purchase.email, daysLeft });
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

    // TRIGGER 4: Check trial day 3 (no habits)
    const trialDay3Users = await checkTrialDay3(supabase, currentHour);
    const trialDay3WithPush = trialDay3Users.filter(u => usersWithPush.has(u.userId));

    // TRIGGER 5: Check trial day 5 (low streak)
    const trialDay5Users = await checkTrialDay5(supabase, currentHour);
    const trialDay5WithPush = trialDay5Users.filter(u => usersWithPush.has(u.userId));

    // TRIGGER 6: Check trial ending (3d and 1d)
    const trialEndingUsers = await checkTrialEnding(supabase, currentHour);
    const trialEndingWithPush = trialEndingUsers.filter(u => usersWithPush.has(u.userId));

    if (dryRun) {
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        currentTime: `${currentHour}:00`,
        triggers: {
          delayed: delayedWithPush.length,
          endOfDay: endOfDayWithPush.length,
          multiplePending: multiplePendingWithPush.length,
          trialDay3: trialDay3WithPush.length,
          trialDay5: trialDay5WithPush.length,
          trialEnding: trialEndingWithPush.length,
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
      trialDay3: 0,
      trialDay5: 0,
      trialEnding: 0,
      skipped: 0,
      failed: 0,
    };

    // Process TRIGGER 1: Delayed habits
    for (const habit of delayedWithPush) {
      // Check if we already sent a delayed notification for this habit today
      const alreadySent = await checkAlreadySentToday(supabase, habit.userId, habit.habitId, "delayed");
      if (alreadySent) {
        console.log(`[Delayed] Skipping habit ${habit.habitId} - already sent today`);
        results.skipped++;
        continue;
      }

      // Check daily limit
      const withinLimit = await checkDailyLimit(supabase, habit.userId, habit.habitId);
      if (!withinLimit) {
        console.log(`[Delayed] Skipping habit ${habit.habitId} - daily limit reached for user ${habit.userId}`);
        results.skipped++;
        continue;
      }

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
      // Check if we already sent an end_of_day notification for this habit today
      const alreadySent = await checkAlreadySentToday(supabase, habit.userId, habit.habitId, "end_of_day");
      if (alreadySent) {
        console.log(`[EndOfDay] Skipping habit ${habit.habitId} - already sent today`);
        results.skipped++;
        continue;
      }

      // Check daily limit
      const withinLimit = await checkDailyLimit(supabase, habit.userId, habit.habitId);
      if (!withinLimit) {
        console.log(`[EndOfDay] Skipping habit ${habit.habitId} - daily limit reached for user ${habit.userId}`);
        results.skipped++;
        continue;
      }

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
      // Check if we already sent a multiple_pending notification for this user today
      const alreadySent = await checkAlreadySentToday(supabase, user.userId, null, "multiple_pending");
      if (alreadySent) {
        console.log(`[MultiplePending] Skipping user ${user.userId} - already sent today`);
        results.skipped++;
        continue;
      }

      // Check daily limit
      const withinLimit = await checkDailyLimit(supabase, user.userId, null);
      if (!withinLimit) {
        console.log(`[MultiplePending] Skipping user ${user.userId} - daily limit reached`);
        results.skipped++;
        continue;
      }

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

    // Process TRIGGER 4: Trial Day 3 (no habits)
    for (const user of trialDay3WithPush) {
      const alreadySent = await checkAlreadySentToday(supabase, user.userId, null, "trial_day_3");
      if (alreadySent) {
        console.log(`[TrialDay3] Skipping user ${user.userId} - already sent today`);
        results.skipped++;
        continue;
      }

      const withinLimit = await checkDailyLimit(supabase, user.userId, null);
      if (!withinLimit) {
        console.log(`[TrialDay3] Skipping user ${user.userId} - daily limit reached`);
        results.skipped++;
        continue;
      }

      const success = await sendTriggerNotification(
        supabase,
        user.userId,
        "Voce criou seus habitos? 🌱",
        "Seu trial ta rolando mas voce ainda nao criou nenhum habito... bora comecar?",
        "trial_day_3",
        "trial_day_3_no_habits"
      );
      if (success) results.trialDay3++;
      else results.failed++;
    }

    // Process TRIGGER 5: Trial Day 5 (low streak)
    for (const user of trialDay5WithPush) {
      const alreadySent = await checkAlreadySentToday(supabase, user.userId, null, "trial_day_5");
      if (alreadySent) {
        console.log(`[TrialDay5] Skipping user ${user.userId} - already sent today`);
        results.skipped++;
        continue;
      }

      const withinLimit = await checkDailyLimit(supabase, user.userId, null);
      if (!withinLimit) {
        console.log(`[TrialDay5] Skipping user ${user.userId} - daily limit reached`);
        results.skipped++;
        continue;
      }

      const success = await sendTriggerNotification(
        supabase,
        user.userId,
        "Ja formou seu primeiro streak? 🔥",
        "Faltam poucos dias de trial... bora construir uma sequencia hoje!",
        "trial_day_5",
        "trial_day_5_low_streak"
      );
      if (success) results.trialDay5++;
      else results.failed++;
    }

    // Process TRIGGER 6: Trial Ending
    for (const user of trialEndingWithPush) {
      const contextKey = user.daysLeft === 3 ? "trial_ending_3d" : "trial_ending_1d";
      const alreadySent = await checkAlreadySentToday(supabase, user.userId, null, contextKey);
      if (alreadySent) {
        console.log(`[TrialEnding] Skipping user ${user.userId} - already sent today`);
        results.skipped++;
        continue;
      }

      const withinLimit = await checkDailyLimit(supabase, user.userId, null);
      if (!withinLimit) {
        console.log(`[TrialEnding] Skipping user ${user.userId} - daily limit reached`);
        results.skipped++;
        continue;
      }

      const title = user.daysLeft === 3
        ? "Seu trial termina em 3 dias ⏰"
        : "Ultima chance! Trial acaba amanha 🚨";
      const body = user.daysLeft === 3
        ? "Aproveita pra explorar tudo o que o Habitz oferece!"
        : "Garanta sua assinatura pra nao perder seu progresso!";

      const success = await sendTriggerNotification(
        supabase,
        user.userId,
        title,
        body,
        contextKey,
        contextKey
      );
      if (success) results.trialEnding++;
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
