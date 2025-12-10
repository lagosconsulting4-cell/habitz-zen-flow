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
// Use SERVICE_ROLE_KEY first (manually configured) before SUPABASE_SERVICE_ROLE_KEY (auto-injected)
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

// ============================================================================
// COPY BANK - Duolingo-style messages (tom carente, divertido, informal)
// ============================================================================

interface CopyMessage {
  key: string;
  title: string;
  body: string;
  personalized: boolean; // true = uses {habitEmoji}, {habitName} variables
}

interface CopyContext {
  contextType: string;
  generic: CopyMessage[];
  personalized: CopyMessage[];
}

/**
 * Copy Bank with all notification message variations.
 * Each context has generic (no habit info) and personalized (with habit) versions.
 * Keys follow pattern: {context}_{g|p}{number} (e.g., morning_g1, delayed_p3)
 */
const COPY_BANK: Record<string, CopyContext> = {
  // -------------------------------------------------------------------------
  // CONTEXT 1: Morning reminders (5h-11h59)
  // -------------------------------------------------------------------------
  morning: {
    contextType: "morning",
    generic: [
      { key: "morning_g1", title: "Psiu...", body: "so passando pra lembrar do seu habito 👀", personalized: false },
      { key: "morning_g2", title: "Bom diaaa", body: "ja pensou em comecar o dia comigo?", personalized: false },
      { key: "morning_g3", title: "Eai...", body: "vai me deixar esperando ou bora fazer?", personalized: false },
      { key: "morning_g4", title: "Acordou?", body: "porque eu to aqui esperando voce 🥺", personalized: false },
      { key: "morning_g5", title: "Oi!", body: "bora comecar o dia bem hoje?", personalized: false },
      { key: "morning_g6", title: "Ola...", body: "seu habito ta te esperando aqui 👀", personalized: false },
    ],
    personalized: [
      { key: "morning_p1", title: "Psiu...", body: "{habitEmoji} {habitName}... ta na hora viu", personalized: true },
      { key: "morning_p2", title: "Bom dia!", body: "{habitEmoji} {habitName} - bora comecar bem?", personalized: true },
      { key: "morning_p3", title: "Eai...", body: "esqueceu de {habitName} hoje? 👀", personalized: true },
      { key: "morning_p4", title: "Acordou?", body: "{habitEmoji} {habitName} ta te esperando aqui", personalized: true },
      { key: "morning_p5", title: "Entao...", body: "bora fazer {habitName} antes que esqueca?", personalized: true },
      { key: "morning_p6", title: "Oi!", body: "{habitEmoji} {habitName} - me ajuda aqui?", personalized: true },
    ],
  },

  // -------------------------------------------------------------------------
  // CONTEXT 2: Afternoon reminders (12h-17h59)
  // -------------------------------------------------------------------------
  afternoon: {
    contextType: "afternoon",
    generic: [
      { key: "afternoon_g1", title: "Oi...", body: "nao esqueceu de mim ne? bora?", personalized: false },
      { key: "afternoon_g2", title: "Entao...", body: "ta na hora do seu habito viu", personalized: false },
      { key: "afternoon_g3", title: "Lembrando!", body: "aquele habito ta te esperando ainda 👀", personalized: false },
      { key: "afternoon_g4", title: "Serio?", body: "vai me deixar aqui sozinho o dia todo?", personalized: false },
      { key: "afternoon_g5", title: "Eai?", body: "me da so 5 minutos do seu tempo", personalized: false },
      { key: "afternoon_g6", title: "Psiu!", body: "ta ai? porque eu to aqui esperando 🥺", personalized: false },
    ],
    personalized: [
      { key: "afternoon_p1", title: "Oi...", body: "{habitEmoji} {habitName} nao vai se fazer sozinho", personalized: true },
      { key: "afternoon_p2", title: "Entao...", body: "hora de {habitName}... por mim? 🥺", personalized: true },
      { key: "afternoon_p3", title: "Serio?", body: "vai deixar {habitName} pra depois de novo?", personalized: true },
      { key: "afternoon_p4", title: "Eai?", body: "{habitEmoji} {habitName} - so uns minutinhos?", personalized: true },
      { key: "afternoon_p5", title: "Psiu!", body: "lembra de {habitName}? to esperando voce 👀", personalized: true },
      { key: "afternoon_p6", title: "Opa...", body: "{habitEmoji} {habitName} chamando... atende ai?", personalized: true },
    ],
  },

  // -------------------------------------------------------------------------
  // CONTEXT 3: Evening reminders (18h-4h59)
  // -------------------------------------------------------------------------
  evening: {
    contextType: "evening",
    generic: [
      { key: "evening_g1", title: "Boa noite!", body: "antes de dormir... bora fazer aquele habito?", personalized: false },
      { key: "evening_g2", title: "Ultimo aviso", body: "o dia ta acabando... me ajuda aqui?", personalized: false },
      { key: "evening_g3", title: "Oiee", body: "ainda da tempo de fazer hoje 🌙", personalized: false },
      { key: "evening_g4", title: "Cade voce?", body: "ja ia dormir sem fazer o habito?", personalized: false },
      { key: "evening_g5", title: "Psiu...", body: "ultima chance do dia... por mim? 🥺", personalized: false },
      { key: "evening_g6", title: "Entao...", body: "vai deixar o dia passar assim? bora", personalized: false },
    ],
    personalized: [
      { key: "evening_p1", title: "Boa noite!", body: "{habitEmoji} {habitName} antes de dormir?", personalized: true },
      { key: "evening_p2", title: "Ultimo aviso", body: "{habitName} ainda ta pendente... bora?", personalized: true },
      { key: "evening_p3", title: "Oiee", body: "{habitEmoji} {habitName} - ainda da tempo 🌙", personalized: true },
      { key: "evening_p4", title: "Cade?", body: "vai dormir sem fazer {habitName}?", personalized: true },
      { key: "evening_p5", title: "Psiu...", body: "{habitName} esperando voce... ultima chance viu", personalized: true },
      { key: "evening_p6", title: "Socorro!", body: "{habitEmoji} {habitName} - me salva antes da meia-noite?", personalized: true },
    ],
  },

  // -------------------------------------------------------------------------
  // CONTEXT 4: Delayed habits (not done X hours after reminder)
  // -------------------------------------------------------------------------
  delayed: {
    contextType: "delayed",
    generic: [
      { key: "delayed_g1", title: "Oi?", body: "ta me evitando ou esqueceu mesmo? 👀", personalized: false },
      { key: "delayed_g2", title: "Saudade...", body: "faz quanto tempo que nao se ve ne", personalized: false },
      { key: "delayed_g3", title: "Entao...", body: "vai fingir que nao viu a notificacao?", personalized: false },
      { key: "delayed_g4", title: "Ta ai?", body: "porque o habito ta aqui me olhando 🥺", personalized: false },
      { key: "delayed_g5", title: "Eai?", body: "me da so 5 minutos do seu tempo", personalized: false },
      { key: "delayed_g6", title: "Cade?", body: "sumiu... ta tudo bem ai? 👀", personalized: false },
    ],
    personalized: [
      { key: "delayed_p1", title: "Oi?", body: "cade {habitName}? ta sumido hoje viu", personalized: true },
      { key: "delayed_p2", title: "Saudade...", body: "{habitEmoji} {habitName} sentindo sua falta aqui", personalized: true },
      { key: "delayed_p3", title: "Entao...", body: "{habitName} ainda ta esperando... vai fazer?", personalized: true },
      { key: "delayed_p4", title: "Eai?", body: "esqueceu de {habitName} ou so procrastinando?", personalized: true },
      { key: "delayed_p5", title: "Psiu...", body: "{habitEmoji} {habitName} nao vai se fazer sozinho 👀", personalized: true },
      { key: "delayed_p6", title: "Socorro!", body: "{habitName} pedindo ajuda aqui... bora?", personalized: true },
    ],
  },

  // -------------------------------------------------------------------------
  // CONTEXT 5: End of day (last 2 hours before midnight)
  // -------------------------------------------------------------------------
  end_of_day: {
    contextType: "end_of_day",
    generic: [
      { key: "eod_g1", title: "Urgente!", body: "ultima chance de fazer hoje... me ajuda?", personalized: false },
      { key: "eod_g2", title: "Socorro!", body: "o dia ta acabando e voce sumiu 🥺", personalized: false },
      { key: "eod_g3", title: "Oieee", body: "ainda da tempo... por mim? 🥹", personalized: false },
      { key: "eod_g4", title: "Serio?", body: "vai deixar o dia passar em branco?", personalized: false },
      { key: "eod_g5", title: "Psiu!", body: "ultima chamada... literalmente a ultima viu", personalized: false },
      { key: "eod_g6", title: "Entao...", body: "2 horas pro dia acabar... bora?", personalized: false },
    ],
    personalized: [
      { key: "eod_p1", title: "Urgente!", body: "{habitEmoji} {habitName} - ultima chance hoje!", personalized: true },
      { key: "eod_p2", title: "Socorro!", body: "{habitName} nao vai rolar hoje? me ajuda 🥺", personalized: true },
      { key: "eod_p3", title: "Oieee", body: "{habitEmoji} {habitName} antes da meia-noite?", personalized: true },
      { key: "eod_p4", title: "Serio?", body: "vai deixar {habitName} pra amanha de novo?", personalized: true },
      { key: "eod_p5", title: "Entao...", body: "{habitName} esperando... faltam 2 horas so", personalized: true },
      { key: "eod_p6", title: "Psiu!", body: "{habitEmoji} {habitName} - ultima chamada viu", personalized: true },
    ],
  },

  // -------------------------------------------------------------------------
  // CONTEXT 6: Multiple pending habits (3+)
  // -------------------------------------------------------------------------
  multiple_pending: {
    contextType: "multiple_pending",
    generic: [
      { key: "mult_g1", title: "Psiu!", body: "tem {count} habitos esperando voce aqui 👀", personalized: false },
      { key: "mult_g2", title: "Eita...", body: "acumulou ein... bora fazer pelo menos um?", personalized: false },
      { key: "mult_g3", title: "Oi!", body: "seus habitos tao todos com saudade viu", personalized: false },
      { key: "mult_g4", title: "Socorro!", body: "{count} habitos pedindo atencao... me ajuda? 🥺", personalized: false },
      { key: "mult_g5", title: "Entao...", body: "tem uma fila de habitos aqui esperando", personalized: false },
      { key: "mult_g6", title: "Olha...", body: "varios habitos pendentes... bora resolver isso?", personalized: false },
    ],
    personalized: [], // Multiple pending uses generic with {count}
  },

  // -------------------------------------------------------------------------
  // CONTEXT 7: First habit of the day
  // -------------------------------------------------------------------------
  first_of_day: {
    contextType: "first_of_day",
    generic: [
      { key: "first_g1", title: "Bom dia!", body: "pronto pra comecar o dia comigo? 🚀", personalized: false },
      { key: "first_g2", title: "Eai!", body: "primeiro habito do dia, vamos junto?", personalized: false },
      { key: "first_g3", title: "Ola!", body: "que tal comecar bem o dia hoje?", personalized: false },
      { key: "first_g4", title: "Opa!", body: "bora dar aquele start no dia?", personalized: false },
      { key: "first_g5", title: "Psiu!", body: "primeiro de varios... vamos comecar? 👀", personalized: false },
    ],
    personalized: [
      { key: "first_p1", title: "Bom dia!", body: "{habitEmoji} {habitName} pra comecar bem?", personalized: true },
      { key: "first_p2", title: "Eai!", body: "primeiro do dia: {habitName}... bora?", personalized: true },
      { key: "first_p3", title: "Ola!", body: "{habitEmoji} {habitName} esperando pra comecar", personalized: true },
      { key: "first_p4", title: "Opa!", body: "que tal comecar com {habitName} hoje?", personalized: true },
      { key: "first_p5", title: "Psiu!", body: "{habitName} chamando pra dar o start 🚀", personalized: true },
    ],
  },

  // -------------------------------------------------------------------------
  // CONTEXT 8: Streak milestones
  // -------------------------------------------------------------------------
  streak_3: {
    contextType: "streak_3",
    generic: [
      { key: "streak3_g1", title: "Opa!", body: "3 dias seguidos! ta virando rotina ein 👀", personalized: false },
    ],
    personalized: [
      { key: "streak3_p1", title: "Olha so!", body: "{habitEmoji} {habitName} - 3 dias firme! 🔥", personalized: true },
    ],
  },
  streak_7: {
    contextType: "streak_7",
    generic: [
      { key: "streak7_g1", title: "Serio?!", body: "1 semana direto?! to orgulhoso de voce 🥹", personalized: false },
    ],
    personalized: [
      { key: "streak7_p1", title: "Caramba!", body: "{habitName} - 7 dias seguidos! voce e brabo", personalized: true },
    ],
  },
  streak_14: {
    contextType: "streak_14",
    generic: [
      { key: "streak14_g1", title: "UAU!", body: "2 semanas! ta virando maquina 💪", personalized: false },
    ],
    personalized: [
      { key: "streak14_p1", title: "Incrivel!", body: "{habitEmoji} {habitName} - 14 dias! lenda", personalized: true },
    ],
  },
  streak_30: {
    contextType: "streak_30",
    generic: [
      { key: "streak30_g1", title: "LENDA!", body: "1 mes completo! to chorando de orgulho 🥹", personalized: false },
    ],
    personalized: [
      { key: "streak30_p1", title: "MONSTRO!", body: "{habitEmoji} {habitName} - 30 dias! respeito", personalized: true },
    ],
  },

  // -------------------------------------------------------------------------
  // CONTEXT 9: Streak broken (came back after missing)
  // -------------------------------------------------------------------------
  streak_broken: {
    contextType: "streak_broken",
    generic: [
      { key: "broken_g1", title: "Voltou!", body: "senti sua falta... bora recomecar? 🥺", personalized: false },
      { key: "broken_g2", title: "Eai!", body: "tropecou mas levanta... te espero aqui", personalized: false },
    ],
    personalized: [
      { key: "broken_p1", title: "Oi...", body: "{habitEmoji} {habitName} te esperando... recomecar?", personalized: true },
      { key: "broken_p2", title: "Eai!", body: "tropecou mas levanta... {habitName} te espera", personalized: true },
    ],
  },

  // -------------------------------------------------------------------------
  // CONTEXT 10: On fire (completing everything)
  // -------------------------------------------------------------------------
  on_fire: {
    contextType: "on_fire",
    generic: [
      { key: "fire_g1", title: "Brabo!", body: "completando tudo hoje... ta voando! 🚀", personalized: false },
    ],
    personalized: [
      { key: "fire_p1", title: "Opa!", body: "{habitName} agora e fecha o dia perfeito?", personalized: true },
    ],
  },

  // -------------------------------------------------------------------------
  // CONTEXT 11: By habit category - Exercise
  // -------------------------------------------------------------------------
  category_exercise: {
    contextType: "category_exercise",
    generic: [],
    personalized: [
      { key: "exercise_p1", title: "Bora!", body: "{habitEmoji} {habitName} nao vai se fazer sozinho 💪", personalized: true },
      { key: "exercise_p2", title: "Eai!", body: "aquele treino ta te esperando... bora?", personalized: true },
      { key: "exercise_p3", title: "Opa!", body: "{habitName} chamando... partiu suar a camisa?", personalized: true },
    ],
  },

  // -------------------------------------------------------------------------
  // CONTEXT 12: By habit category - Reading
  // -------------------------------------------------------------------------
  category_reading: {
    contextType: "category_reading",
    generic: [],
    personalized: [
      { key: "reading_p1", title: "Psiu...", body: "{habitEmoji} {habitName} - que tal ler agora? 📚", personalized: true },
      { key: "reading_p2", title: "Oi!", body: "bora viajar nas paginas de {habitName}?", personalized: true },
      { key: "reading_p3", title: "Entao...", body: "{habitName} esperando... so uns minutinhos?", personalized: true },
    ],
  },

  // -------------------------------------------------------------------------
  // CONTEXT 13: By habit category - Meditation
  // -------------------------------------------------------------------------
  category_meditation: {
    contextType: "category_meditation",
    generic: [],
    personalized: [
      { key: "meditation_p1", title: "Calma...", body: "{habitEmoji} {habitName} - bora respirar uns minutos? 🧘", personalized: true },
      { key: "meditation_p2", title: "Psiu!", body: "hora de {habitName}... vamos desacelerar?", personalized: true },
      { key: "meditation_p3", title: "Oi...", body: "{habitName} chamando pra dar aquela relaxada", personalized: true },
    ],
  },

  // -------------------------------------------------------------------------
  // CONTEXT 14: By habit category - Hydration
  // -------------------------------------------------------------------------
  category_hydration: {
    contextType: "category_hydration",
    generic: [],
    personalized: [
      { key: "hydration_p1", title: "Psiu!", body: "{habitEmoji} {habitName} - ta hidratado ai? 💧", personalized: true },
      { key: "hydration_p2", title: "Oi!", body: "hora de {habitName}... seu corpo agradece", personalized: true },
      { key: "hydration_p3", title: "Eai!", body: "{habitName} lembrando voce de beber agua 👀", personalized: true },
    ],
  },
};

// Export for use in other functions (Sprint 3)
export { COPY_BANK, CopyMessage, CopyContext };

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

// ============================================================================
// SPRINT 2: COPY ENGINE - Context Detection & Selection
// ============================================================================

type NotificationContext =
  | "morning"
  | "afternoon"
  | "evening"
  | "delayed"
  | "end_of_day"
  | "multiple_pending"
  | "first_of_day";

/**
 * Detects the context for notification selection.
 * Priority: end_of_day > multiple_pending > delayed > time_of_day
 */
function detectContext(
  currentHour: number,
  reminderTime: string | null,
  pendingCount: number,
  brazilTime: Date
): NotificationContext {
  const isEndOfDay = currentHour >= 22 || currentHour < 2; // Last 2 hours before midnight
  const isDelayed = reminderTime ? isHabitDelayed(reminderTime, brazilTime, 2) : false;

  // Priority logic
  if (isEndOfDay && pendingCount > 0) {
    return "end_of_day";
  } else if (pendingCount >= 3) {
    return "multiple_pending";
  } else if (isDelayed) {
    return "delayed";
  } else if (currentHour >= 5 && currentHour < 12) {
    return "morning";
  } else if (currentHour >= 12 && currentHour < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
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
 * Selects a copy message with rotation to avoid repetition.
 * Gets last message per context, filters it out from available copies.
 */
async function selectCopy(
  supabase: any,
  userId: string,
  context: NotificationContext,
  habit: Habit | null,
  pendingCount: number
): Promise<{ key: string; title: string; body: string; contextType: string }> {
  const copyContext = COPY_BANK[context];
  if (!copyContext) {
    // Fallback
    return {
      key: "fallback",
      title: "Oi!",
      body: "bora fazer seu habito?",
      contextType: "fallback",
    };
  }

  // Get recent messages for this user and context (last 5 to check rotation)
  const { data: recentMessages, error } = await supabase
    .from("notification_history")
    .select("message_key")
    .eq("user_id", userId)
    .eq("context_type", context)
    .order("sent_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("[Copy Engine] Error fetching recent messages:", error);
  }

  const recentKeys = new Set((recentMessages || []).map((m: any) => m.message_key));

  // Decide: personalized if habit is provided and copies exist
  const usePersonalized = habit !== null && copyContext.personalized.length > 0;
  const copyPool = usePersonalized ? copyContext.personalized : copyContext.generic;

  // Filter out recently used copies (rotation)
  let availableCopies = copyPool.filter(c => !recentKeys.has(c.key));

  // If all were used recently, reset and use full pool
  if (availableCopies.length === 0) {
    availableCopies = copyPool;
  }

  // Random selection
  const selected = availableCopies[Math.floor(Math.random() * availableCopies.length)];

  // Personalize the copy with variables
  let title = selected.title;
  let body = selected.body;

  if (habit && selected.personalized) {
    body = body
      .replace("{habitEmoji}", habit.emoji || "")
      .replace("{habitName}", habit.name)
      .replace("{count}", pendingCount.toString());
  } else if (context === "multiple_pending") {
    body = body.replace("{count}", pendingCount.toString());
  }

  return {
    key: selected.key,
    title,
    body,
    contextType: context,
  };
}

/**
 * Checks if sending a notification would exceed daily limits.
 * Limit: 1 per habit + 2 extras (can increase for streaks >= 7 days)
 */
async function checkDailyLimit(
  supabase: any,
  userId: string,
  habitId: string
): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];

  // Check if this specific habit already got a notification today
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

    // Send individual notifications for each habit (with Sprint 2: Copy Engine)
    const results: Array<{ habitId: string; userId: string; success: boolean; error?: string; context?: string; messageKey?: string }> = [];

    // Count pending habits per user for context detection
    const pendingByUser = new Map<string, number>();
    for (const habit of habitsWithPush) {
      const count = (pendingByUser.get(habit.user_id) || 0) + 1;
      pendingByUser.set(habit.user_id, count);
    }

    for (const habit of habitsWithPush) {
      try {
        // Check daily limit before sending
        const withinLimit = await checkDailyLimit(supabase, habit.user_id, habit.id);
        if (!withinLimit) {
          console.log(`[Scheduler] Habit "${habit.name}" (${habit.id}) exceeded daily limit for user ${habit.user_id}`);
          results.push({
            habitId: habit.id,
            userId: habit.user_id,
            success: false,
            error: "Daily limit exceeded",
          });
          continue;
        }

        // Detect notification context
        const pendingCount = pendingByUser.get(habit.user_id) || 1;
        const context = detectContext(currentHour, habit.reminder_time, pendingCount, brazilTime);

        // Select copy message with rotation
        const copyMessage = await selectCopy(supabase, habit.user_id, context as NotificationContext, habit, pendingCount);

        // Send push notification with selected copy
        const pushResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            userId: habit.user_id,
            title: copyMessage.title,
            body: copyMessage.body,
            icon: "/icons/icon-192.png",
            badge: "/icons/badge-72.png",
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
        const isSuccess = pushResponse.ok && result.sent > 0;

        console.log(`[Scheduler] Push response for "${habit.name}":`, {
          status: pushResponse.status,
          ok: pushResponse.ok,
          sent: result.sent,
          failed: result.failed,
          context,
          messageKey: copyMessage.key,
        });

        // Save to notification history if successful
        if (isSuccess) {
          const { error: historyError } = await supabase
            .from("notification_history")
            .insert({
              user_id: habit.user_id,
              habit_id: habit.id,
              context_type: context,
              message_key: copyMessage.key,
              title: copyMessage.title,
              body: copyMessage.body,
              sent_at: new Date().toISOString(),
              notification_date: today,
            });

          if (historyError) {
            console.error(`[Scheduler] Failed to save notification history for habit ${habit.id}:`, historyError);
          }
        }

        results.push({
          habitId: habit.id,
          userId: habit.user_id,
          success: isSuccess,
          context,
          messageKey: copyMessage.key,
          error: result.error || (!isSuccess ? `HTTP ${pushResponse.status}, sent: ${result.sent}` : undefined),
        });

        console.log(`[Scheduler] Sent reminder for "${habit.name}" to user ${habit.user_id} [${context}/${copyMessage.key}]: ${isSuccess ? "OK" : "FAILED"}`);
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
