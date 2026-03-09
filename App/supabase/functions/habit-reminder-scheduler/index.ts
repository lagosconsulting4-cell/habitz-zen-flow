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
  category: string;
  streak: number;
  notification_pref: {
    reminder_enabled?: boolean;
  } | null;
  source?: string;
  template_id?: string;
}

// ============================================================================
// QUIET HOURS - Respect user sleep/do-not-disturb preferences
// ============================================================================

/**
 * Check if current time falls within user's quiet hours.
 * Handles overnight ranges (e.g., 22:00 → 07:00).
 * Returns true if notifications should be suppressed.
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
    // Same-day range (e.g., 08:00 → 18:00)
    return current >= start && current < end;
  } else {
    // Overnight range (e.g., 22:00 → 07:00)
    return current >= start || current < end;
  }
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

  // JOURNEY: Morning
  journey_morning: {
    contextType: "journey_morning",
    generic: [],
    personalized: [
      { key: "jm_p1", title: "Dia {journeyDay}!", body: "{habitEmoji} {habitName} — {journeyTitle} te espera", personalized: true },
      { key: "jm_p2", title: "Bom dia!", body: "{habitName} (Dia {journeyDay} de {journeyTitle})", personalized: true },
      { key: "jm_p3", title: "Bora!", body: "{habitEmoji} {habitName} — mais um dia na sua jornada", personalized: true },
      { key: "jm_p4", title: "Sua missao hoje", body: "{habitName} faz parte do Dia {journeyDay}. Vamos?", personalized: true },
    ],
  },

  // JOURNEY: Afternoon
  journey_afternoon: {
    contextType: "journey_afternoon",
    generic: [],
    personalized: [
      { key: "ja_p1", title: "Oi...", body: "{habitEmoji} {habitName} ta pendente (Dia {journeyDay}) 👀", personalized: true },
      { key: "ja_p2", title: "Lembrete!", body: "{habitName} — Dia {journeyDay} de {journeyTitle}", personalized: true },
      { key: "ja_p3", title: "Eai?", body: "{habitEmoji} {habitName} esperando... sua jornada precisa de voce", personalized: true },
      { key: "ja_p4", title: "Nao esquece!", body: "{habitName} (Dia {journeyDay}). So faltam {remainingDays} dias!", personalized: true },
    ],
  },

  // JOURNEY: Evening
  journey_evening: {
    contextType: "journey_evening",
    generic: [],
    personalized: [
      { key: "je_p1", title: "Boa noite!", body: "{habitEmoji} {habitName} antes de dormir? (Dia {journeyDay})", personalized: true },
      { key: "je_p2", title: "Ultimo lembrete", body: "{habitName} — feche o Dia {journeyDay} de {journeyTitle}", personalized: true },
      { key: "je_p3", title: "Quase la!", body: "{habitEmoji} {habitName} e o dia ta completo 🌙", personalized: true },
      { key: "je_p4", title: "Dia {journeyDay}", body: "{habitName} ainda ta pendente. Bora finalizar?", personalized: true },
    ],
  },

  // JOURNEY: Cliff day (dias 10-14 — maior dropout)
  journey_cliff_day: {
    contextType: "journey_cliff_day",
    generic: [],
    personalized: [
      { key: "jc_p1", title: "A maioria para aqui.", body: "Dia {journeyDay}. {habitName} te separa de quem desiste 💪", personalized: true },
      { key: "jc_p2", title: "Fase crucial!", body: "{habitEmoji} {habitName} (Dia {journeyDay}). Quem passa dos 14 dias vence.", personalized: true },
      { key: "jc_p3", title: "To aqui com voce", body: "Dia {journeyDay} de {journeyTitle}. So faz {habitName}. So isso.", personalized: true },
      { key: "jc_p4", title: "Aguenta firme!", body: "{habitName} no Dia {journeyDay}. O desconforto e o habito se formando.", personalized: true },
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
  | "first_of_day"
  | "on_fire"
  | "category_exercise"
  | "category_reading"
  | "category_meditation"
  | "category_hydration"
  | "streak_broken"
  | "journey_morning"
  | "journey_afternoon"
  | "journey_evening"
  | "journey_cliff_day";

/**
 * Detects the context for notification selection.
 * Priority: end_of_day > multiple_pending > delayed > category > on_fire > first_of_day > time_of_day
 */
function detectContext(
  currentHour: number,
  reminderTime: string | null,
  pendingCount: number,
  brazilTime: Date,
  habit: Habit | null,
  completedToday: number,
  totalToday: number,
  delayHours: number,
  endOfDayEnabled: boolean
): NotificationContext {
  const isEndOfDay = currentHour >= 22 || currentHour < 2;
  const isDelayed = reminderTime ? isHabitDelayed(reminderTime, brazilTime, delayHours) : false;

  // Priority logic (high -> low)
  if (isEndOfDay && pendingCount > 0 && endOfDayEnabled) {
    return "end_of_day";
  } else if (pendingCount >= 3) {
    return "multiple_pending";
  } else if (isDelayed) {
    return "delayed";
  }

  // Category-specific context (personalized copy for habit type)
  if (habit) {
    const cat = (habit.category || "").toLowerCase();
    if (cat === "exercise" || cat === "exercicio" || cat === "treino") return "category_exercise";
    if (cat === "reading" || cat === "leitura") return "category_reading";
    if (cat === "meditation" || cat === "meditacao" || cat === "mindfulness") return "category_meditation";
    if (cat === "hydration" || cat === "hidratacao" || cat === "agua") return "category_hydration";
  }

  // Journey-specific: use journey copy if source is journey
  if (habit && habit.source === "journey") {
    if (currentHour >= 5 && currentHour < 12) return "journey_morning";
    if (currentHour >= 12 && currentHour < 18) return "journey_afternoon";
    return "journey_evening";
  }

  // On fire: user completed 70%+ of today's habits
  if (totalToday > 0 && completedToday / totalToday >= 0.7 && pendingCount <= 2) {
    return "on_fire";
  }

  // Streak broken: user lost their streak and hasn't completed anything today
  if (habit && habit.streak === 0 && completedToday === 0 && currentHour >= 5 && currentHour < 22) {
    return "streak_broken";
  }

  // First of day: no habits completed yet today and it's morning
  if (completedToday === 0 && currentHour >= 5 && currentHour < 12) {
    return "first_of_day";
  }

  // Time-of-day fallback
  if (currentHour >= 5 && currentHour < 12) return "morning";
  if (currentHour >= 12 && currentHour < 18) return "afternoon";
  return "evening";
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
 * Journey phase config for intensity modulation.
 * Phase 1 (Awareness): normal | Phase 2 (Friction): increased | Phase 3 (Replacement): normal | Phase 4 (Integration): reduced
 */
function getJourneyPhaseConfig(currentDay: number): { delayHours: number; skipIfStreakAbove: number | null } {
  if (currentDay <= 7) return { delayHours: 2, skipIfStreakAbove: null };
  if (currentDay <= 14) return { delayHours: 1.5, skipIfStreakAbove: null };
  if (currentDay <= 22) return { delayHours: 2, skipIfStreakAbove: null };
  return { delayHours: 3, skipIfStreakAbove: 5 };
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
  pendingCount: number,
  recentKeysCache?: Map<string, Set<string>>,
  journeyMeta?: { journeyTitle: string; currentDay: number; totalDays: number } | null
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

  // Use pre-loaded cache if available, otherwise query individually
  let recentKeys: Set<string>;
  const cacheKey = `${userId}:${context}`;
  if (recentKeysCache?.has(cacheKey)) {
    recentKeys = recentKeysCache.get(cacheKey)!;
  } else {
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

    recentKeys = new Set((recentMessages || []).map((m: any) => m.message_key));
  }

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
    const emoji = habit.emoji?.trim() || "";
    const name = habit.name?.length > 30 ? habit.name.substring(0, 27) + "..." : (habit.name || "seu habito");
    // Remove emoji placeholder + trailing space when emoji is empty
    if (!emoji) {
      body = body.replace("{habitEmoji} ", "");
    }
    body = body
      .replace("{habitEmoji}", emoji)
      .replace("{habitName}", name)
      .replace("{count}", pendingCount.toString());
    // Clean double spaces from any remaining edge cases
    body = body.replace(/  +/g, " ").trim();
  } else if (context === "multiple_pending") {
    body = body.replace("{count}", pendingCount.toString());
  }

  // Journey-specific variable replacement
  if (habit && habit.source === "journey" && journeyMeta) {
    body = body
      .replace("{journeyDay}", String(journeyMeta.currentDay))
      .replace("{journeyTitle}", journeyMeta.journeyTitle)
      .replace("{remainingDays}", String(journeyMeta.totalDays - journeyMeta.currentDay));
    title = title
      .replace("{journeyDay}", String(journeyMeta.currentDay))
      .replace("{journeyTitle}", journeyMeta.journeyTitle);
  }

  // Safety net: strip any unreplaced template vars (e.g. journey copy without metadata)
  title = title.replace(/\s*\{[a-zA-Z]+\}\s*/g, " ").replace(/  +/g, " ").trim();
  body = body.replace(/\s*\{[a-zA-Z]+\}\s*/g, " ").replace(/  +/g, " ").trim();

  return {
    key: selected.key,
    title,
    body,
    contextType: context,
  };
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
      .select("id, name, emoji, period, user_id, reminder_time, days_of_week, notification_pref, category, streak, source, template_id")
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

    // Count total/completed habits per user today (for on_fire and first_of_day detection)
    const totalHabitsByUser = new Map<string, number>();
    const completedHabitsByUser = new Map<string, number>();
    for (const habit of (habits as Habit[])) {
      if (!isScheduledForToday(habit.days_of_week, brazilTime)) continue;
      const uid = habit.user_id;
      totalHabitsByUser.set(uid, (totalHabitsByUser.get(uid) || 0) + 1);
      if (completedHabitIds.has(habit.id)) {
        completedHabitsByUser.set(uid, (completedHabitsByUser.get(uid) || 0) + 1);
      }
    }

    // Cache user notification preferences per user
    const userPrefsCache = new Map<string, any>();

    // Cache quiet hours check per user (avoid re-fetching for each habit)
    const quietHoursCache = new Map<string, boolean>();

    // Batch load recent message keys for copy rotation (avoids N+1 queries)
    const recentKeysCache = new Map<string, Set<string>>();
    const uniqueUserIds = [...new Set(habitsWithPush.map(h => h.user_id))];
    if (uniqueUserIds.length > 0) {
      const { data: allRecentMessages } = await supabase
        .from("notification_history")
        .select("user_id, context_type, message_key")
        .in("user_id", uniqueUserIds)
        .order("sent_at", { ascending: false })
        .limit(uniqueUserIds.length * 10);

      for (const msg of allRecentMessages || []) {
        const cacheKey = `${msg.user_id}:${msg.context_type}`;
        if (!recentKeysCache.has(cacheKey)) recentKeysCache.set(cacheKey, new Set());
        const keySet = recentKeysCache.get(cacheKey)!;
        if (keySet.size < 5) keySet.add(msg.message_key);
      }
    }

    // Cache journey metadata for journey-specific copy (Sprint 2)
    const journeyMetaCache = new Map<string, {
      journeyTitle: string;
      currentDay: number;
      totalDays: number;
    }>();

    const journeyUserIds = [...new Set(
      habitsWithPush.filter(h => h.source === "journey").map(h => h.user_id)
    )];

    if (journeyUserIds.length > 0) {
      const { data: journeyStates } = await supabase
        .from("user_journey_state")
        .select("user_id, current_day, journeys(title, duration_days)")
        .eq("status", "active")
        .in("user_id", journeyUserIds);

      for (const js of journeyStates || []) {
        const jData = (js as any).journeys;
        journeyMetaCache.set(js.user_id, {
          journeyTitle: jData?.title || "sua jornada",
          currentDay: js.current_day,
          totalDays: jData?.duration_days || 30,
        });
      }
    }

    for (const habit of habitsWithPush) {
      try {
        // Check quiet hours + cache user prefs (cached per user)
        if (!quietHoursCache.has(habit.user_id)) {
          const { data: userPrefs } = await supabase
            .from("user_progress")
            .select("notification_preferences")
            .eq("user_id", habit.user_id)
            .maybeSingle();
          const prefs = userPrefs?.notification_preferences || {};
          quietHoursCache.set(habit.user_id, isInQuietHours(brazilTime, prefs.quiet_hours_start, prefs.quiet_hours_end));
          userPrefsCache.set(habit.user_id, prefs);
        }

        if (quietHoursCache.get(habit.user_id)) {
          console.log(`[Scheduler] Skipped: quiet hours for user ${habit.user_id}`);
          results.push({
            habitId: habit.id,
            userId: habit.user_id,
            success: false,
            error: "Quiet hours",
          });
          continue;
        }

        // Anti-burst: skip if push was sent < 5 min ago to this user
        const recentlySent = await checkRecentlySent(supabase, habit.user_id, 5);
        if (recentlySent) {
          console.log(`[Scheduler] Skipped: push sent < 5min ago for user ${habit.user_id}`);
          results.push({
            habitId: habit.id,
            userId: habit.user_id,
            success: false,
            error: "Anti-burst: recent push",
          });
          continue;
        }

        // Detect notification context
        const pendingCount = pendingByUser.get(habit.user_id) || 1;
        const prefs = userPrefsCache.get(habit.user_id) || {};
        let delayHours = prefs.delayed_reminder_hours ?? 2;
        const endOfDayEnabled = prefs.end_of_day_enabled ?? true;

        // Phase-based intensity for journey habits (Sprint 2)
        const jMeta = habit.source === "journey" ? journeyMetaCache.get(habit.user_id) : undefined;
        if (habit.source === "journey" && jMeta) {
          const phaseConfig = getJourneyPhaseConfig(jMeta.currentDay);
          delayHours = phaseConfig.delayHours;

          // Phase 4: skip if user has strong streak (autonomy)
          if (phaseConfig.skipIfStreakAbove !== null && habit.streak > phaseConfig.skipIfStreakAbove) {
            console.log(`[Scheduler] Skip: Phase 4 autonomy, streak ${habit.streak}`);
            results.push({ habitId: habit.id, userId: habit.user_id, success: false, error: "Phase 4 autonomy" });
            continue;
          }
        }

        let context = detectContext(
          currentHour,
          habit.reminder_time,
          pendingCount,
          brazilTime,
          habit,
          completedHabitsByUser.get(habit.user_id) || 0,
          totalHabitsByUser.get(habit.user_id) || 0,
          delayHours,
          endOfDayEnabled
        );

        // Override: journey cliff day (days 10-14 — highest dropout)
        if (habit.source === "journey" && jMeta && jMeta.currentDay >= 10 && jMeta.currentDay <= 14) {
          context = "journey_cliff_day";
        }

        // Fallback: journey context without metadata → use generic time-of-day context
        if (context.startsWith("journey_") && !jMeta) {
          if (currentHour >= 5 && currentHour < 12) context = "morning";
          else if (currentHour >= 12 && currentHour < 18) context = "afternoon";
          else context = "evening";
        }

        // Select copy message with rotation (pass journey metadata)
        const copyMessage = await selectCopy(supabase, habit.user_id, context as NotificationContext, habit, pendingCount, recentKeysCache, jMeta || null);

        // Insert history FIRST to get the ID for click tracking
        const { data: historyRow, error: historyInsertError } = await supabase
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
          })
          .select("id")
          .single();

        if (historyInsertError) {
          console.error(`[Scheduler] Failed to save notification history for habit ${habit.id}:`, historyInsertError);
        }

        // Send push notification with selected copy
        let isSuccess = false;
        let pushError: string | undefined;
        try {
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
                notificationHistoryId: historyRow?.id || undefined,
              },
              actions: [
                { action: "complete", title: "Completar" },
                { action: "dismiss", title: "Depois" },
              ],
            }),
          });

          const result = await pushResponse.json();
          isSuccess = pushResponse.ok && result.sent > 0;
          pushError = result.error || (!isSuccess ? `HTTP ${pushResponse.status}, sent: ${result.sent}` : undefined);

          console.log(`[Scheduler] Push response for "${habit.name}":`, {
            status: pushResponse.status,
            ok: pushResponse.ok,
            sent: result.sent,
            failed: result.failed,
            context,
            messageKey: copyMessage.key,
          });
        } catch (fetchErr) {
          console.error(`[Scheduler] Push send failed for habit ${habit.id}:`, fetchErr);
          pushError = `fetch error: ${String(fetchErr)}`;
        }

        results.push({
          habitId: habit.id,
          userId: habit.user_id,
          success: isSuccess,
          context,
          messageKey: copyMessage.key,
          error: pushError,
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
