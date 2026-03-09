/**
 * Edge Function: notification-trigger-scheduler
 *
 * Sends push notifications for behavioral triggers:
 * 1. END_OF_DAY: Pending habits at 22:00-23:59 (last chance notification)
 * 2. MULTIPLE_PENDING: 3+ habits pending at 15:00-18:00 (afternoon catch-up)
 * 3. ONBOARDING: Day 0-7 sequence for new users (welcome, first habit, streaks)
 * 4. VALUE/RECAP: Weekly (Sunday 10h) and monthly (1st 10h) progress summaries
 * 5. INACTIVITY: Re-engagement at 3d, 7d, 14d of no activity (14h)
 *
 * NOTE: DELAYED notifications are handled by habit-reminder-scheduler (every 5 min)
 * via detectContext("delayed"). Removed here to avoid double-notifications.
 *
 * Respects user quiet hours (notification_preferences.quiet_hours_start/end).
 * Uses COPY_BANK with rotation to avoid message repetition.
 *
 * Runs hourly via pg_cron. Different from habit-reminder-scheduler which
 * runs every 5 minutes for time-based reminders.
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
 * Check if current time falls within user's quiet hours.
 * Handles overnight ranges (e.g., 22:00-07:00).
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
    // Overnight range (e.g., 22:00 - 07:00)
    return current >= start || current < end;
  }
}

// ============================================================================
// COPY BANK — Duolingo-style messages (tom carente, divertido, informal)
// ============================================================================

interface TriggerCopyMessage {
  key: string;
  title: string;
  body: string;
}

interface TriggerCopyContext {
  contextType: string;
  messages: TriggerCopyMessage[];
}

const TRIGGER_COPY_BANK: Record<string, TriggerCopyContext> = {
  // NOTE: "delayed" notifications removed — handled by habit-reminder-scheduler
  // via detectContext("delayed") with 12 copy variations (6g+6p).
  end_of_day: {
    contextType: "end_of_day",
    messages: [
      { key: "end_of_day_g1", title: "Ultima chance!", body: "o dia ta acabando... bora terminar seus habitos? ⏰" },
      { key: "end_of_day_g2", title: "Quase meia-noite!", body: "ainda da tempo! falta pouco pro dia acabar" },
      { key: "end_of_day_g3", title: "Vai dormir sem completar?", body: "seus habitos tao te esperando... nao deixa pra amanha!" },
    ],
  },
  multiple_pending: {
    contextType: "multiple_pending",
    messages: [
      { key: "multiple_pending_g1", title: "Ops!", body: "voce tem {pendingCount} habitos pendentes... bora se organizar?" },
      { key: "multiple_pending_g2", title: "Acumulou!", body: "{pendingCount} habitos esperando! que tal fazer 1 agora?" },
      { key: "multiple_pending_g3", title: "To preocupado...", body: "{pendingCount} pendentes? bora pelo menos um!" },
    ],
  },
  // --- Onboarding (Day 0-7) ---
  onboard_welcome: {
    contextType: "onboard_welcome",
    messages: [
      { key: "onboard_welcome_g1", title: "Bem-vindo ao Bora! 🚀", body: "sua jornada comeca agora. bora criar seu primeiro habito?" },
      { key: "onboard_welcome_g2", title: "E ai, pronto(a)? 💪", body: "o primeiro passo e o mais importante. bora comecar!" },
    ],
  },
  onboard_first_habit: {
    contextType: "onboard_first_habit",
    messages: [
      { key: "onboard_first_g1", title: "Habito criado! ✨", body: "agora e so completar. vai la, leva 5 segundos!" },
      { key: "onboard_first_g2", title: "Ja criou seu habito!", body: "falta so completar ele. bora?" },
    ],
  },
  onboard_day_1: {
    contextType: "onboard_day_1",
    messages: [
      { key: "onboard_d1_g1", title: "Dia 1! 🌟", body: "cria seu primeiro habito? leva 30 segundos!" },
      { key: "onboard_d1_g2", title: "Oi! Ainda ta ai?", body: "vi que voce nao criou nenhum habito ainda. bora?" },
    ],
  },
  onboard_day_2: {
    contextType: "onboard_day_2",
    messages: [
      { key: "onboard_d2_g1", title: "Dia 2! 🔥", body: "consistencia e tudo. bora manter o ritmo?" },
      { key: "onboard_d2_g2", title: "Segundo dia!", body: "quem completa 2 dias seguidos tem 3x mais chance de criar o habito!" },
    ],
  },
  onboard_streak_3: {
    contextType: "onboard_streak_3",
    messages: [
      { key: "onboard_s3_g1", title: "3 dias seguidos! 🔥🔥🔥", body: "voce ta formando um habito! nao para agora!" },
      { key: "onboard_s3_g2", title: "Streak de 3! 💪", body: "3 dias sem parar! voce ta no caminho certo!" },
    ],
  },
  onboard_day_5: {
    contextType: "onboard_day_5",
    messages: [
      { key: "onboard_d5_g1", title: "5 dias! 🏅", body: "ja completou {totalCompletions} habitos. imagina em 1 mes!" },
      { key: "onboard_d5_g2", title: "Quase 1 semana!", body: "5 dias e voce ja e mais consistente que a maioria!" },
    ],
  },
  onboard_week: {
    contextType: "onboard_week",
    messages: [
      { key: "onboard_w1_g1", title: "1 semana! 🎉", body: "7 dias completando habitos! voce e mais consistente que 80% dos usuarios!" },
      { key: "onboard_w1_g2", title: "Uma semana inteira! 🏆", body: "parabens! {totalCompletions} habitos completados em 7 dias!" },
    ],
  },
  // --- Value/Progress ---
  weekly_recap: {
    contextType: "weekly_recap",
    messages: [
      { key: "weekly_g1", title: "Sua semana em numeros 📊", body: "voce completou {weekCompletions} habitos! streak atual: {currentStreak} dias 🔥" },
      { key: "weekly_g2", title: "Recap semanal! 🗓️", body: "{weekCompletions} habitos essa semana. bora superar semana que vem?" },
    ],
  },
  monthly_recap: {
    contextType: "monthly_recap",
    messages: [
      { key: "monthly_g1", title: "Recap de {monthName} 📊", body: "{monthCompletions} habitos, melhor streak: {longestStreak} dias! 🏆" },
      { key: "monthly_g2", title: "Seu mes foi incrivel! 🎉", body: "em {monthName}: {monthCompletions} completados, {perfectDays} dias perfeitos!" },
    ],
  },
  // --- Inactivity Re-engagement ---
  inactive_3d: {
    contextType: "inactive_3d",
    messages: [
      { key: "inactive_3d_g1", title: "Faz 3 dias... 😢", body: "que nao te vejo por aqui. ta tudo bem?" },
      { key: "inactive_3d_g2", title: "Sinto sua falta!", body: "3 dias sem completar habitos. bora voltar devagar?" },
    ],
  },
  inactive_7d: {
    contextType: "inactive_7d",
    messages: [
      { key: "inactive_7d_g1", title: "Uma semana sem voce 💔", body: "seu streak zerou... mas da pra recomecar! que tal so 1 habito hoje?" },
      { key: "inactive_7d_g2", title: "Oi sumido(a)!", body: "faz 7 dias! recomecar e mais facil do que voce pensa" },
    ],
  },
  inactive_14d: {
    contextType: "inactive_14d",
    messages: [
      { key: "inactive_14d_g1", title: "Ainda to aqui...", body: "te esperando. que tal voltar com calma? so 1 habito." },
      { key: "inactive_14d_g2", title: "Ultima chamada 📢", body: "14 dias sem habitos. seus objetivos ainda importam?" },
    ],
  },
};

const MONTH_NAMES_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/**
 * Select a copy message from the COPY_BANK with rotation.
 * Avoids repeating the last 5 messages sent to this user for this context.
 * Replaces template variables like {pendingCount}, {weekCompletions}, etc.
 */
async function selectTriggerCopy(
  supabase: any,
  userId: string,
  contextType: string,
  templateVars?: Record<string, string | number>
): Promise<{ title: string; body: string; messageKey: string }> {
  const bank = TRIGGER_COPY_BANK[contextType];
  if (!bank || bank.messages.length === 0) {
    return { title: "Bora!", body: "Voce tem habitos pendentes!", messageKey: `${contextType}_fallback` };
  }

  // Fetch last 5 message keys for this context to avoid repetition
  const { data: recentHistory } = await supabase
    .from("notification_history")
    .select("message_key")
    .eq("user_id", userId)
    .eq("context_type", contextType)
    .order("sent_at", { ascending: false })
    .limit(5);

  const recentKeys = new Set((recentHistory || []).map((h: any) => h.message_key));

  // Filter out recently used messages
  let available = bank.messages.filter(m => !recentKeys.has(m.key));

  // If all messages were used, reset (pick from all)
  if (available.length === 0) {
    available = bank.messages;
  }

  // Random selection
  const selected = available[Math.floor(Math.random() * available.length)];

  // Replace template variables
  let title = selected.title;
  let body = selected.body;
  if (templateVars) {
    for (const [key, value] of Object.entries(templateVars)) {
      title = title.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
      body = body.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }
  }

  return { title, body, messageKey: selected.key };
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

// NOTE: checkDelayedHabits removed — delayed detection handled by
// habit-reminder-scheduler via detectContext("delayed") with 12 copy variations.

/**
 * TRIGGER 1: END OF DAY
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

  // Filter to today's notifiable habits
  const todayHabits = (habits || []).filter((h: any) => {
    if (h.notification_pref?.reminder_enabled === false) return false;
    return isScheduledForToday(h.days_of_week, brazilTime);
  });

  if (todayHabits.length === 0) return [];

  // Batch query: get all completed habit IDs for today in one query
  const habitIds = todayHabits.map((h: any) => h.id);
  const { data: completions } = await supabase
    .from("habit_completions")
    .select("habit_id")
    .in("habit_id", habitIds)
    .eq("completed_at", today);
  const completedIds = new Set((completions || []).map((c: any) => c.habit_id));

  return todayHabits
    .filter((h: any) => !completedIds.has(h.id))
    .map((h: any) => ({ habitId: h.id, userId: h.user_id }));
}

/**
 * TRIGGER 2: MULTIPLE PENDING
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

  // Filter to today's notifiable habits
  const todayHabits = (habits || []).filter((h: any) => {
    if (h.notification_pref?.reminder_enabled === false) return false;
    return isScheduledForToday(h.days_of_week, brazilTime);
  });

  if (todayHabits.length === 0) return [];

  // Batch query: get all completed habit IDs for today in one query
  const habitIds = todayHabits.map((h: any) => h.id);
  const { data: completions } = await supabase
    .from("habit_completions")
    .select("habit_id")
    .in("habit_id", habitIds)
    .eq("completed_at", today);
  const completedIds = new Set((completions || []).map((c: any) => c.habit_id));

  // Count pending habits per user
  const pendingByUser = new Map<string, number>();
  for (const habit of todayHabits) {
    if (!completedIds.has(habit.id)) {
      const count = (pendingByUser.get(habit.user_id) || 0) + 1;
      pendingByUser.set(habit.user_id, count);
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
 * TRIGGER 3: ONBOARDING SEQUENCE (Day 0-7)
 * Sends targeted push notifications to new users during their first week.
 * Each day has a specific trigger with conditions.
 */
async function checkOnboardingTriggers(
  supabase: any,
  brazilTime: Date,
  currentHour: number
): Promise<{ userId: string; triggerType: string; templateVars: Record<string, string | number> }[]> {
  const triggers: { userId: string; triggerType: string; templateVars: Record<string, string | number> }[] = [];

  // Define which triggers fire at which hour
  const hourTriggerMap: Record<number, { day: number; type: string; condition?: string }[]> = {
    10: [
      { day: 1, type: "onboard_day_1", condition: "no_habits" },
      { day: 3, type: "onboard_streak_3", condition: "streak_3" },
      { day: 5, type: "onboard_day_5" },
      { day: 7, type: "onboard_week" },
    ],
    14: [
      { day: 1, type: "onboard_first_habit", condition: "has_habit_no_completion" },
      { day: 2, type: "onboard_day_2" },
    ],
    20: [
      { day: 0, type: "onboard_welcome" },
    ],
  };

  const triggersForHour = hourTriggerMap[currentHour];
  if (!triggersForHour || triggersForHour.length === 0) {
    return [];
  }

  // Fetch users who completed onboarding in last 8 days
  const eightDaysAgo = new Date(brazilTime);
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

  const { data: newUsers, error } = await supabase
    .from("profiles")
    .select("user_id, onboarding_completed_at")
    .eq("has_completed_onboarding", true)
    .not("onboarding_completed_at", "is", null)
    .gte("onboarding_completed_at", eightDaysAgo.toISOString());

  if (error) {
    console.error("[Onboarding] Error fetching new users:", error);
    return [];
  }

  if (!newUsers || newUsers.length === 0) return [];

  const today = brazilTime.toISOString().split("T")[0];
  const newUserIds = newUsers.map((u: any) => u.user_id);

  // ── Batch loads (replaces N+1 per-user queries) ──
  const onboardingContextTypes = triggersForHour.map((t: any) => t.type);

  const [habitsRes, completionsRes, progressRes, dedupRes] = await Promise.all([
    supabase.from("habits").select("user_id").in("user_id", newUserIds).eq("is_active", true),
    supabase.from("habit_completions").select("user_id").in("user_id", newUserIds),
    supabase.from("user_progress").select("user_id, current_streak, total_habits_completed").in("user_id", newUserIds),
    supabase.from("notification_history").select("user_id, context_type").in("user_id", newUserIds).in("context_type", onboardingContextTypes).eq("notification_date", today),
  ]);

  // Build lookup maps
  const usersWithHabits = new Set<string>((habitsRes.data || []).map((r: any) => r.user_id));
  const usersWithCompletions = new Set<string>((completionsRes.data || []).map((r: any) => r.user_id));
  const progressMap = new Map<string, any>();
  for (const p of (progressRes.data || [])) {
    progressMap.set(p.user_id, p);
  }
  const sentSet = new Set<string>();
  for (const d of (dedupRes.data || [])) {
    sentSet.add(`${d.user_id}:${d.context_type}`);
  }

  for (const user of newUsers) {
    // Use date-only comparison to avoid off-by-one for users created late at night
    const onboardStr = new Date(user.onboarding_completed_at).toISOString().split("T")[0];
    const daysSinceOnboarding = Math.round(
      (new Date(today).getTime() - new Date(onboardStr).getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const triggerDef of triggersForHour) {
      if (daysSinceOnboarding !== triggerDef.day) continue;

      // Check condition using batched data
      if (triggerDef.condition === "no_habits") {
        if (usersWithHabits.has(user.user_id)) continue;
      }

      if (triggerDef.condition === "has_habit_no_completion") {
        if (!usersWithHabits.has(user.user_id)) continue;
        if (usersWithCompletions.has(user.user_id)) continue;
      }

      if (triggerDef.condition === "streak_3") {
        const progress = progressMap.get(user.user_id);
        if (!progress || progress.current_streak < 3) continue;
      }

      // Check already sent using batched dedup
      if (sentSet.has(`${user.user_id}:${triggerDef.type}`)) continue;

      // Get template vars from batched progress
      const templateVars: Record<string, string | number> = {};
      if (triggerDef.type === "onboard_day_5" || triggerDef.type === "onboard_week") {
        const progress = progressMap.get(user.user_id);
        templateVars.totalCompletions = progress?.total_habits_completed || 0;
      }

      triggers.push({
        userId: user.user_id,
        triggerType: triggerDef.type,
        templateVars,
      });
    }
  }

  return triggers;
}

/**
 * TRIGGER 4: VALUE/PROGRESS RECAP
 * Weekly recap on Sunday 10h, Monthly recap on 1st of month 10h.
 * Only sends to users who had activity in the period.
 */
async function checkValueTriggers(
  supabase: any,
  brazilTime: Date,
  currentHour: number,
  usersWithPush: Set<string>
): Promise<{ userId: string; triggerType: string; templateVars: Record<string, string | number> }[]> {
  const triggers: { userId: string; triggerType: string; templateVars: Record<string, string | number> }[] = [];

  if (currentHour !== 10) return [];

  const dayOfWeek = brazilTime.getDay(); // 0 = Sunday
  const dayOfMonth = brazilTime.getDate();
  const today = brazilTime.toISOString().split("T")[0];
  const userIds = Array.from(usersWithPush);

  if (userIds.length === 0) return [];

  // WEEKLY RECAP — Sunday at 10h
  if (dayOfWeek === 0) {
    const sevenDaysAgo = new Date(brazilTime);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekStart = sevenDaysAgo.toISOString().split("T")[0];

    // ── Batch loads (replaces N+1 per-user queries) ──
    const [dedupRes, completionsRes, progressRes] = await Promise.all([
      supabase.from("notification_history").select("user_id").in("user_id", userIds).eq("context_type", "weekly_recap").eq("notification_date", today),
      supabase.from("habit_completions").select("user_id").in("user_id", userIds).gte("completed_at", weekStart).lte("completed_at", today),
      supabase.from("user_progress").select("user_id, current_streak").in("user_id", userIds),
    ]);

    const alreadySentUsers = new Set<string>((dedupRes.data || []).map((r: any) => r.user_id));
    // Count completions per user
    const completionCountMap = new Map<string, number>();
    for (const c of (completionsRes.data || [])) {
      completionCountMap.set(c.user_id, (completionCountMap.get(c.user_id) || 0) + 1);
    }
    const progressMap = new Map<string, any>();
    for (const p of (progressRes.data || [])) {
      progressMap.set(p.user_id, p);
    }

    for (const userId of userIds) {
      if (alreadySentUsers.has(userId)) continue;
      const weekCompletions = completionCountMap.get(userId) || 0;
      if (weekCompletions === 0) continue;

      triggers.push({
        userId,
        triggerType: "weekly_recap",
        templateVars: {
          weekCompletions,
          currentStreak: progressMap.get(userId)?.current_streak || 0,
        },
      });
    }
  }

  // MONTHLY RECAP — 1st of month at 10h
  if (dayOfMonth === 1) {
    const lastMonth = new Date(brazilTime);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthStart = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}-01`;
    const monthEnd = `${brazilTime.getFullYear()}-${String(brazilTime.getMonth() + 1).padStart(2, "0")}-01`;
    const monthName = MONTH_NAMES_PT[lastMonth.getMonth()];

    // ── Batch loads ──
    const [dedupRes, completionsRes, progressRes] = await Promise.all([
      supabase.from("notification_history").select("user_id").in("user_id", userIds).eq("context_type", "monthly_recap").eq("notification_date", today),
      supabase.from("habit_completions").select("user_id").in("user_id", userIds).gte("completed_at", monthStart).lt("completed_at", monthEnd),
      supabase.from("user_progress").select("user_id, longest_streak, perfect_days").in("user_id", userIds),
    ]);

    const alreadySentUsers = new Set<string>((dedupRes.data || []).map((r: any) => r.user_id));
    const completionCountMap = new Map<string, number>();
    for (const c of (completionsRes.data || [])) {
      completionCountMap.set(c.user_id, (completionCountMap.get(c.user_id) || 0) + 1);
    }
    const progressMap = new Map<string, any>();
    for (const p of (progressRes.data || [])) {
      progressMap.set(p.user_id, p);
    }

    for (const userId of userIds) {
      if (alreadySentUsers.has(userId)) continue;
      const monthCompletions = completionCountMap.get(userId) || 0;
      if (monthCompletions === 0) continue;

      triggers.push({
        userId,
        triggerType: "monthly_recap",
        templateVars: {
          monthName,
          monthCompletions,
          longestStreak: progressMap.get(userId)?.longest_streak || 0,
          perfectDays: progressMap.get(userId)?.perfect_days || 0,
        },
      });
    }
  }

  return triggers;
}

/**
 * TRIGGER 5: INACTIVITY RE-ENGAGEMENT
 * Sends push at 14h for users who haven't completed habits in 3, 7, or 14 days.
 * Stops after 14 days (avoids spam/reports).
 * Excludes users in first 8 days of onboarding (handled by onboarding triggers).
 */
async function checkInactivityTriggers(
  supabase: any,
  brazilTime: Date,
  currentHour: number,
  usersWithPush: Set<string>
): Promise<{ userId: string; triggerType: string }[]> {
  const triggers: { userId: string; triggerType: string }[] = [];

  if (currentHour !== 14) return [];

  const today = brazilTime.toISOString().split("T")[0];

  // Get users with last_activity_date who completed onboarding > 8 days ago
  const eightDaysAgo = new Date(brazilTime);
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

  // Fetch profiles that completed onboarding more than 8 days ago
  const { data: eligibleProfiles, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, onboarding_completed_at")
    .eq("has_completed_onboarding", true)
    .not("onboarding_completed_at", "is", null)
    .lte("onboarding_completed_at", eightDaysAgo.toISOString());

  if (profileError) {
    console.error("[Inactivity] Error fetching profiles:", profileError);
    return [];
  }

  if (!eligibleProfiles || eligibleProfiles.length === 0) return [];

  const eligibleUserIds = new Set(eligibleProfiles.map((p: any) => p.user_id));

  // Get user_progress with last_activity_date for eligible users with push
  for (const userId of usersWithPush) {
    if (!eligibleUserIds.has(userId)) continue;

    const { data: progress } = await supabase
      .from("user_progress")
      .select("last_activity_date")
      .eq("user_id", userId)
      .maybeSingle();

    if (!progress?.last_activity_date) continue;

    const lastActivity = new Date(progress.last_activity_date);
    const diffMs = brazilTime.getTime() - lastActivity.getTime();
    const daysSinceActivity = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let triggerType: string | null = null;
    if (daysSinceActivity === 3) triggerType = "inactive_3d";
    else if (daysSinceActivity === 7) triggerType = "inactive_7d";
    else if (daysSinceActivity === 14) triggerType = "inactive_14d";

    if (!triggerType) continue;

    const alreadySent = await checkAlreadySentToday(supabase, userId, null, triggerType);
    if (alreadySent) continue;

    triggers.push({ userId, triggerType });
  }

  return triggers;
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
    const today = new Date().toISOString().split("T")[0];

    // Insert history FIRST to get the ID for click tracking
    const { data: historyRow, error: historyError } = await supabase
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
      })
      .select("id")
      .single();

    if (historyError) {
      console.error(`[TriggerNotification] Failed to save history: ${historyError}`);
    }

    let isSuccess = false;
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
            habitId: habitId || undefined,
            notificationHistoryId: historyRow?.id || undefined,
          },
          actions: [
            { action: "dismiss", title: "Depois" },
          ],
        }),
      });
      const result = await pushResponse.json();
      isSuccess = pushResponse.ok && result.sent > 0;
      if (!isSuccess) {
        console.error(`[TriggerScheduler] Push not OK: HTTP ${pushResponse.status}`);
      }
    } catch (fetchErr) {
      console.error(`[TriggerScheduler] Push send failed for user ${userId}:`, fetchErr);
    }
    return isSuccess;
  } catch (error) {
    console.error(`[TriggerScheduler] Failed to send: ${error}`);
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

    // Cache quiet hours + user prefs per user to avoid repeated DB queries
    const quietHoursCache = new Map<string, boolean>();
    const userPrefsCache = new Map<string, any>();

    async function getUserPrefs(userId: string): Promise<any> {
      if (userPrefsCache.has(userId)) {
        return userPrefsCache.get(userId)!;
      }
      const { data: userPrefs } = await supabase
        .from("user_progress")
        .select("notification_preferences")
        .eq("user_id", userId)
        .maybeSingle();
      const prefs = userPrefs?.notification_preferences || {};
      userPrefsCache.set(userId, prefs);
      return prefs;
    }

    async function isUserInQuietHours(userId: string): Promise<boolean> {
      if (quietHoursCache.has(userId)) {
        return quietHoursCache.get(userId)!;
      }
      const prefs = await getUserPrefs(userId);
      const inQuiet = isInQuietHours(brazilTime, prefs.quiet_hours_start, prefs.quiet_hours_end);
      quietHoursCache.set(userId, inQuiet);
      return inQuiet;
    }

    // TRIGGER 1: Check end-of-day habits
    const endOfDayHabits = await checkEndOfDayHabits(supabase, brazilTime, currentHour);
    const endOfDayWithPush = endOfDayHabits.filter(h => usersWithPush.has(h.userId));

    // TRIGGER 2: Check multiple pending
    const multiplePendingUsers = await checkMultiplePendingHabits(supabase, brazilTime, currentHour);
    const multiplePendingWithPush = multiplePendingUsers.filter(u => usersWithPush.has(u.userId));

    // TRIGGER 3: Check onboarding sequence
    const onboardingTriggers = await checkOnboardingTriggers(supabase, brazilTime, currentHour);
    const onboardingWithPush = onboardingTriggers.filter(t => usersWithPush.has(t.userId));

    // TRIGGER 4: Check value/progress recaps
    const valueTriggers = await checkValueTriggers(supabase, brazilTime, currentHour, usersWithPush);

    // TRIGGER 5: Check inactivity re-engagement
    const inactivityTriggers = await checkInactivityTriggers(supabase, brazilTime, currentHour, usersWithPush);

    if (dryRun) {
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        currentTime: `${currentHour}:00`,
        triggers: {
          endOfDay: endOfDayWithPush.length,
          multiplePending: multiplePendingWithPush.length,
          onboarding: onboardingWithPush.length,
          value: valueTriggers.length,
          inactivity: inactivityTriggers.length,
        },
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = {
      endOfDay: 0,
      multiplePending: 0,
      onboarding: 0,
      value: 0,
      inactivity: 0,
      skipped: 0,
      failed: 0,
    };

    // Process TRIGGER 1: End of day
    for (const habit of endOfDayWithPush) {
      // Check if user has end-of-day notifications enabled
      const eodPrefs = await getUserPrefs(habit.userId);
      if (eodPrefs.end_of_day_enabled === false) {
        console.log(`[EndOfDay] Skipped: end_of_day_enabled=false for user ${habit.userId}`);
        results.skipped++;
        continue;
      }

      // Check quiet hours first
      if (await isUserInQuietHours(habit.userId)) {
        console.log(`[EndOfDay] Skipped: quiet hours for user ${habit.userId}`);
        results.skipped++;
        continue;
      }

      // Check if we already sent an end_of_day notification for this habit today
      const alreadySent = await checkAlreadySentToday(supabase, habit.userId, habit.habitId, "end_of_day");
      if (alreadySent) {
        console.log(`[EndOfDay] Skipping habit ${habit.habitId} - already sent today`);
        results.skipped++;
        continue;
      }

      // Anti-burst: skip if push was sent < 5 min ago
      const eodRecentlySent = await checkRecentlySent(supabase, habit.userId, 5);
      if (eodRecentlySent) {
        console.log(`[EndOfDay] Skipped: push sent < 5min ago for user ${habit.userId}`);
        results.skipped++;
        continue;
      }

      const eodCopy = await selectTriggerCopy(supabase, habit.userId, "end_of_day");
      const success = await sendTriggerNotification(
        supabase,
        habit.userId,
        eodCopy.title,
        eodCopy.body,
        "end_of_day",
        eodCopy.messageKey,
        habit.habitId
      );
      if (success) results.endOfDay++;
      else results.failed++;
    }

    // Process TRIGGER 2: Multiple pending
    for (const user of multiplePendingWithPush) {
      // Check quiet hours first
      if (await isUserInQuietHours(user.userId)) {
        console.log(`[MultiplePending] Skipped: quiet hours for user ${user.userId}`);
        results.skipped++;
        continue;
      }

      // Check if we already sent a multiple_pending notification for this user today
      const alreadySent = await checkAlreadySentToday(supabase, user.userId, null, "multiple_pending");
      if (alreadySent) {
        console.log(`[MultiplePending] Skipping user ${user.userId} - already sent today`);
        results.skipped++;
        continue;
      }

      // Dedup: skip if EOD was already sent today (EOD has priority over multiple_pending)
      const eodAlreadySent = await checkAlreadySentToday(supabase, user.userId, null, "end_of_day");
      if (eodAlreadySent) {
        console.log(`[MultiplePending] Skipped: EOD already sent today for user ${user.userId}`);
        results.skipped++;
        continue;
      }

      // Anti-burst: skip if push was sent < 5 min ago
      const mpRecentlySent = await checkRecentlySent(supabase, user.userId, 5);
      if (mpRecentlySent) {
        console.log(`[MultiplePending] Skipped: push sent < 5min ago for user ${user.userId}`);
        results.skipped++;
        continue;
      }

      const mpCopy = await selectTriggerCopy(supabase, user.userId, "multiple_pending", {
        pendingCount: user.pendingCount,
      });
      const success = await sendTriggerNotification(
        supabase,
        user.userId,
        mpCopy.title,
        mpCopy.body,
        "multiple_pending",
        mpCopy.messageKey
      );
      if (success) results.multiplePending++;
      else results.failed++;
    }

    // Process TRIGGER 3: Onboarding sequence (bypasses daily limit)
    for (const trigger of onboardingWithPush) {
      if (await isUserInQuietHours(trigger.userId)) {
        console.log(`[Onboarding] Skipped: quiet hours for user ${trigger.userId}`);
        results.skipped++;
        continue;
      }

      const obCopy = await selectTriggerCopy(supabase, trigger.userId, trigger.triggerType, trigger.templateVars);
      const success = await sendTriggerNotification(
        supabase,
        trigger.userId,
        obCopy.title,
        obCopy.body,
        trigger.triggerType,
        obCopy.messageKey
      );
      if (success) results.onboarding++;
      else results.failed++;
    }

    // Process TRIGGER 4: Value/progress recaps (bypasses daily limit)
    for (const trigger of valueTriggers) {
      if (await isUserInQuietHours(trigger.userId)) {
        console.log(`[Value] Skipped: quiet hours for user ${trigger.userId}`);
        results.skipped++;
        continue;
      }

      const valCopy = await selectTriggerCopy(supabase, trigger.userId, trigger.triggerType, trigger.templateVars);
      const success = await sendTriggerNotification(
        supabase,
        trigger.userId,
        valCopy.title,
        valCopy.body,
        trigger.triggerType,
        valCopy.messageKey
      );
      if (success) results.value++;
      else results.failed++;
    }

    // Process TRIGGER 5: Inactivity re-engagement (bypasses daily limit)
    for (const trigger of inactivityTriggers) {
      if (await isUserInQuietHours(trigger.userId)) {
        console.log(`[Inactivity] Skipped: quiet hours for user ${trigger.userId}`);
        results.skipped++;
        continue;
      }

      const inaCopy = await selectTriggerCopy(supabase, trigger.userId, trigger.triggerType);
      const success = await sendTriggerNotification(
        supabase,
        trigger.userId,
        inaCopy.title,
        inaCopy.body,
        trigger.triggerType,
        inaCopy.messageKey
      );
      if (success) results.inactivity++;
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
