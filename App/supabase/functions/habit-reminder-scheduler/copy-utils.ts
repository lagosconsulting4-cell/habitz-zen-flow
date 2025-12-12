/**
 * Shared utilities for notification copy engine
 * Used by both habit-reminder-scheduler and notification-trigger-scheduler
 */

// ============================================================================
// COPY BANK - Duolingo-style messages (tom carente, divertido, informal)
// ============================================================================

export interface CopyMessage {
  key: string;
  title: string;
  body: string;
  personalized: boolean; // true = uses {habitEmoji}, {habitName} variables
}

export interface CopyContext {
  contextType: string;
  generic: CopyMessage[];
  personalized: CopyMessage[];
}

/**
 * Copy Bank with all notification message variations.
 * Each context has generic (no habit info) and personalized (with habit) versions.
 * Keys follow pattern: {context}_{g|p}{number} (e.g., morning_g1, delayed_p3)
 */
export const COPY_BANK: Record<string, CopyContext> = {
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

/**
 * Get current time in Brazil timezone (UTC-3)
 */
export function getBrazilTime(): Date {
  const now = new Date();
  const brazilOffset = -3 * 60; // minutes
  const utcOffset = now.getTimezoneOffset(); // minutes from UTC
  const brazilTime = new Date(now.getTime() + (utcOffset + brazilOffset) * 60 * 1000);
  return brazilTime;
}

/**
 * Check if a time string (HH:mm) is within the current 5-minute window
 */
export function isTimeInWindow(reminderTime: string, currentTime: Date): boolean {
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
export function isScheduledForToday(daysOfWeek: number[] | null, currentTime: Date): boolean {
  if (!daysOfWeek || daysOfWeek.length === 0) {
    return true; // No restriction = every day
  }
  const today = currentTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
  return daysOfWeek.includes(today);
}

/**
 * Check if habit is delayed (X+ hours after reminder time)
 */
export function isHabitDelayed(reminderTime: string, currentTime: Date, delayHours: number): boolean {
  const [hours, minutes] = reminderTime.split(":").map(Number);
  const reminderDate = new Date(currentTime);
  reminderDate.setHours(hours, minutes, 0, 0);

  const diffMs = currentTime.getTime() - reminderDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= delayHours;
}
