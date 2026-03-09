/**
 * Edge Function: journey-notification-scheduler
 *
 * Runs daily via pg_cron (09:00 BRT / 12:00 UTC) to send journey notifications
 * automatically for users who haven't opened the app.
 *
 * Notification types:
 * - daily_reminder: Daily journey progress reminder
 * - cliff_support: Motivational message for days 10-14 (highest dropout)
 * - inactivity: Re-engagement after 3+ days of no journey activity
 * - new_habit: Alert when a new habit is unlocked on current day
 *
 * Delegates actual sending to send-journey-notification (which handles
 * copy bank, rotation, dedup, and history logging).
 *
 * Respects quiet hours and daily limits.
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
 * Handles overnight ranges (e.g., 22:00 -> 07:00).
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

/**
 * Send a journey notification by delegating to send-journey-notification function.
 * That function handles copy bank, rotation, dedup, and history logging.
 */
async function sendJourneyNotification(
  payload: {
    type: string;
    userId: string;
    journeyTitle?: string;
    currentDay?: number;
    totalDays?: number;
    habitName?: string;
    inactiveDays?: number;
  }
): Promise<{ sent: boolean; reason?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-journey-notification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    return { sent: result.sent ?? false, reason: result.reason };
  } catch (error) {
    console.error(`[JourneyScheduler] Error sending ${payload.type}:`, error);
    return { sent: false, reason: "error" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing env vars" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const brazilTime = getBrazilTime();
    const today = brazilTime.toISOString().split("T")[0];

    console.log(`[JourneyScheduler] Running at ${brazilTime.toISOString()} (Brazil: ${brazilTime.getHours()}:${brazilTime.getMinutes().toString().padStart(2, "0")})`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all users with active journeys + journey metadata
    const { data: activeJourneys, error: journeyError } = await supabase
      .from("user_journey_state")
      .select(`
        user_id,
        current_day,
        status,
        updated_at,
        journey_id,
        journeys (
          title,
          duration_days
        )
      `)
      .eq("status", "active");

    if (journeyError) {
      console.error("[JourneyScheduler] Error fetching journeys:", journeyError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!activeJourneys || activeJourneys.length === 0) {
      console.log("[JourneyScheduler] No active journeys found");
      return new Response(JSON.stringify({
        success: true,
        message: "No active journeys",
        processed: 0,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get users with push subscriptions
    const userIds = [...new Set(activeJourneys.map((j: any) => j.user_id))];
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("user_id")
      .in("user_id", userIds);

    const usersWithPush = new Set(subscriptions?.map((s: any) => s.user_id) || []);

    // Cache quiet hours per user
    const quietHoursCache = new Map<string, boolean>();

    async function isUserInQuietHours(userId: string): Promise<boolean> {
      if (quietHoursCache.has(userId)) {
        return quietHoursCache.get(userId)!;
      }
      const { data: userPrefs } = await supabase
        .from("user_progress")
        .select("notification_preferences")
        .eq("user_id", userId)
        .maybeSingle();
      const prefs = userPrefs?.notification_preferences || {};
      const inQuiet = isInQuietHours(brazilTime, prefs.quiet_hours_start, prefs.quiet_hours_end);
      quietHoursCache.set(userId, inQuiet);
      return inQuiet;
    }

    // Get last day completions for inactivity detection
    const { data: recentCompletions } = await supabase
      .from("user_journey_day_completions")
      .select("user_id, completed_at")
      .in("user_id", userIds)
      .order("completed_at", { ascending: false });

    // Build map of last completion per user
    const lastCompletionByUser = new Map<string, string>();
    for (const c of recentCompletions || []) {
      if (!lastCompletionByUser.has(c.user_id)) {
        lastCompletionByUser.set(c.user_id, c.completed_at);
      }
    }

    // Get newly unlocked habits (introduced today)
    const { data: newHabits } = await supabase
      .from("user_journey_habits")
      .select(`
        user_id,
        journey_id,
        introduced_on_day,
        habits (name)
      `)
      .in("user_id", userIds)
      .eq("is_active", true);

    const results = {
      dailyReminder: 0,
      cliffSupport: 0,
      inactivity: 0,
      newHabit: 0,
      skipped: 0,
      failed: 0,
    };

    for (const journey of activeJourneys) {
      const userId = journey.user_id;
      const journeyData = (journey as any).journeys;
      const journeyTitle = journeyData?.title || "sua jornada";
      const totalDays = journeyData?.duration_days || 30;
      const currentDay = journey.current_day;

      // Skip users without push subscriptions
      if (!usersWithPush.has(userId)) {
        continue;
      }

      // Check quiet hours
      if (await isUserInQuietHours(userId)) {
        console.log(`[JourneyScheduler] Skipped: quiet hours for user ${userId}`);
        results.skipped++;
        continue;
      }

      // Calculate inactivity
      const lastCompletion = lastCompletionByUser.get(userId);
      let inactiveDays = 0;
      if (lastCompletion) {
        const lastDate = new Date(lastCompletion);
        const todayDate = new Date(today);
        inactiveDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Determine notification type based on journey state
      let notificationType: string;

      if (inactiveDays >= 3) {
        // Inactivity re-engagement
        notificationType = "inactivity";
        const result = await sendJourneyNotification({
          type: "inactivity",
          userId,
          journeyTitle,
          currentDay,
          totalDays,
          inactiveDays,
        });
        if (result.sent) results.inactivity++;
        else if (result.reason !== "already_sent_today" && result.reason !== "quiet_hours") results.failed++;
        else results.skipped++;
      } else if (currentDay >= 10 && currentDay <= 14) {
        // Cliff support (highest dropout period)
        notificationType = "cliff_support";
        const result = await sendJourneyNotification({
          type: "cliff_support",
          userId,
          journeyTitle,
          currentDay,
          totalDays,
        });
        if (result.sent) results.cliffSupport++;
        else if (result.reason !== "already_sent_today" && result.reason !== "quiet_hours") results.failed++;
        else results.skipped++;
      } else {
        // Regular daily reminder
        notificationType = "daily_reminder";
        const result = await sendJourneyNotification({
          type: "daily_reminder",
          userId,
          journeyTitle,
          currentDay,
          totalDays,
        });
        if (result.sent) results.dailyReminder++;
        else if (result.reason !== "already_sent_today" && result.reason !== "quiet_hours") results.failed++;
        else results.skipped++;
      }

      // Check for new habits unlocked on current day
      const userNewHabits = (newHabits || []).filter(
        (h: any) =>
          h.user_id === userId &&
          h.journey_id === journey.journey_id &&
          h.introduced_on_day === currentDay
      );

      for (const newHabit of userNewHabits) {
        const habitName = (newHabit as any).habits?.name;
        if (!habitName) continue;

        const result = await sendJourneyNotification({
          type: "new_habit",
          userId,
          journeyTitle,
          currentDay,
          totalDays,
          habitName,
        });
        if (result.sent) results.newHabit++;
        else if (result.reason !== "already_sent_today" && result.reason !== "quiet_hours") results.failed++;
        else results.skipped++;
      }
    }

    console.log(`[JourneyScheduler] Results:`, results);

    return new Response(JSON.stringify({
      success: true,
      activeJourneys: activeJourneys.length,
      usersWithPush: usersWithPush.size,
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[JourneyScheduler] Error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: String(error),
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
