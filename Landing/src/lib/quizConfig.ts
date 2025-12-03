/**
 * Quiz Configuration - Landing Page
 *
 * Adapted from App/src/components/onboarding/onboardingConfig.ts
 * Maps user selections to habit recommendations following the 4-layer algorithm:
 * - Layer 1 (40%): Objective → Core habits
 * - Layer 2 (30%): Challenges → Support habits
 * - Layer 3: Time Available → Quantity filter
 * - Layer 4: Work Schedule → Period assignment
 */

// ============================================================================
// TYPES (Self-contained for Landing)
// ============================================================================

export type AgeRange = "18-24" | "25-34" | "35-44" | "45-54" | "55+";
export type Profession = "student" | "employed" | "entrepreneur" | "freelancer" | "other";
export type WorkSchedule = "morning" | "commercial" | "evening" | "flexible";
export type EnergyPeak = "morning" | "afternoon" | "evening";
export type TimeAvailable = "15min" | "30min" | "1h" | "2h+";
export type Objective = "productivity" | "health" | "mental" | "routine" | "avoid";

export interface RecommendedHabit {
  id: string;
  template_id: string;
  name: string;
  category: string;
  icon: string;
  icon_key: string;
  color: string;
  period: "morning" | "afternoon" | "evening";
  suggested_time: string;
  duration: number;
  goal_value: number;
  goal_unit: string;
  frequency_type: string;
  frequency_days: number[];
  priority: number;
  recommendation_score: number;
  recommendation_sources: string[];
}

// ============================================================================
// LAYER 1: OBJECTIVE → CORE HABITS (40% of recommendations)
// ============================================================================

export const OBJECTIVE_HABITS: Record<Objective, string[]> = {
  productivity: [
    "wake_early",
    "plan_day",
    "deep_work",
    "inbox_zero",
    "weekly_review",
    "pomodoro",
    "no_multitask",
  ],
  health: [
    "exercise",
    "drink_water",
    "healthy_meal",
    "sleep_early",
    "stretch",
    "walk",
    "vitamins",
  ],
  mental: [
    "meditation",
    "journaling",
    "gratitude",
    "breathing",
    "digital_detox",
    "reading",
    "mindfulness",
  ],
  routine: [
    "make_bed",
    "clean_space",
    "meal_prep",
    "plan_week",
    "organize_desk",
    "evening_routine",
    "morning_routine",
  ],
  avoid: [
    "no_snooze",
    "no_social_media",
    "no_junk_food",
    "no_procrastination",
    "no_phone_bed",
    "no_alcohol",
    "limit_screen",
  ],
};

// ============================================================================
// LAYER 2: CHALLENGES → SUPPORT HABITS (30% of recommendations)
// ============================================================================

export const CHALLENGE_HABITS: Record<string, string[]> = {
  procrastination: [
    "pomodoro",
    "plan_day",
    "deep_work",
    "no_multitask",
    "morning_routine",
  ],
  focus: [
    "meditation",
    "digital_detox",
    "deep_work",
    "pomodoro",
    "no_social_media",
  ],
  forgetfulness: [
    "journaling",
    "plan_day",
    "weekly_review",
    "organize_desk",
    "calendar_check",
  ],
  tiredness: [
    "sleep_early",
    "exercise",
    "drink_water",
    "no_caffeine_afternoon",
    "power_nap",
  ],
  anxiety: [
    "meditation",
    "breathing",
    "journaling",
    "gratitude",
    "exercise",
  ],
  motivation: [
    "gratitude",
    "visualize_goals",
    "celebrate_wins",
    "accountability_partner",
    "morning_routine",
  ],
};

// ============================================================================
// LAYER 3: TIME AVAILABLE → QUANTITY
// ============================================================================

export const TIME_QUANTITY: Record<TimeAvailable, { min: number; max: number }> = {
  "15min": { min: 3, max: 3 },
  "30min": { min: 4, max: 5 },
  "1h": { min: 6, max: 7 },
  "2h+": { min: 8, max: 10 },
};

// ============================================================================
// LAYER 4: WORK SCHEDULE → PERIODS & TIME SLOTS
// ============================================================================

export interface PeriodSlot {
  start: string;
  end: string;
}

export interface WorkScheduleSlots {
  morning?: PeriodSlot;
  afternoon?: PeriodSlot;
  evening?: PeriodSlot;
}

export const WORK_SCHEDULE_SLOTS: Record<WorkSchedule, WorkScheduleSlots> = {
  morning: {
    // Trabalha 6-14h
    morning: { start: "05:00", end: "06:00" },
    afternoon: { start: "14:30", end: "17:00" },
    evening: { start: "19:00", end: "23:00" },
  },
  commercial: {
    // Trabalha 8-18h
    morning: { start: "06:00", end: "07:30" },
    afternoon: { start: "12:00", end: "13:00" },
    evening: { start: "19:00", end: "23:00" },
  },
  evening: {
    // Trabalha 14-22h
    morning: { start: "06:00", end: "13:00" },
    afternoon: { start: "13:00", end: "14:00" },
    evening: { start: "22:30", end: "23:59" },
  },
  flexible: {
    morning: { start: "06:00", end: "09:00" },
    afternoon: { start: "12:00", end: "15:00" },
    evening: { start: "18:00", end: "23:00" },
  },
};

// ============================================================================
// HABIT METADATA
// ============================================================================

export interface HabitTemplate {
  id: string;
  name: string;
  category: string;
  icon: string;
  icon_key: string;
  color: string;
  preferredPeriod: "morning" | "afternoon" | "evening" | "any";
  defaultDuration?: number;
  defaultGoalValue?: number;
  defaultUnit?: "none" | "minutes" | "hours" | "times" | "pages" | "ml" | "steps";
  defaultFrequencyType?: "fixed_days" | "times_per_week" | "daily";
  priority: number;
}

// Comprehensive habit templates library
export const HABIT_TEMPLATES: Record<string, HabitTemplate> = {
  // PRODUCTIVITY
  wake_early: {
    id: "wake_early",
    name: "Acordar Cedo",
    category: "productivity",
    icon: "🌅",
    icon_key: "sunrise",
    color: "bg-orange-500",
    preferredPeriod: "morning",
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 9,
  },
  plan_day: {
    id: "plan_day",
    name: "Planejar o Dia",
    category: "productivity",
    icon: "📋",
    icon_key: "plan",
    color: "bg-blue-500",
    preferredPeriod: "morning",
    defaultDuration: 10,
    defaultGoalValue: 10,
    defaultUnit: "minutes",
    priority: 8,
  },
  deep_work: {
    id: "deep_work",
    name: "Trabalho Focado",
    category: "productivity",
    icon: "🎯",
    icon_key: "deep_work",
    color: "bg-indigo-500",
    preferredPeriod: "any",
    defaultDuration: 90,
    defaultGoalValue: 90,
    defaultUnit: "minutes",
    priority: 7,
  },
  pomodoro: {
    id: "pomodoro",
    name: "Sessão Pomodoro",
    category: "productivity",
    icon: "🍅",
    icon_key: "clock",
    color: "bg-red-500",
    preferredPeriod: "any",
    defaultDuration: 25,
    defaultGoalValue: 4,
    defaultUnit: "times",
    priority: 7,
  },
  inbox_zero: {
    id: "inbox_zero",
    name: "Inbox Zero",
    category: "productivity",
    icon: "📧",
    icon_key: "checklist",
    color: "bg-cyan-500",
    preferredPeriod: "morning",
    defaultDuration: 15,
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 6,
  },
  weekly_review: {
    id: "weekly_review",
    name: "Revisão Semanal",
    category: "productivity",
    icon: "📊",
    icon_key: "review",
    color: "bg-purple-500",
    preferredPeriod: "evening",
    defaultDuration: 30,
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 6,
  },
  no_multitask: {
    id: "no_multitask",
    name: "Foco Único",
    category: "productivity",
    icon: "🎯",
    icon_key: "focus",
    color: "bg-teal-500",
    preferredPeriod: "any",
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 5,
  },

  // HEALTH
  exercise: {
    id: "exercise",
    name: "Exercício Físico",
    category: "health",
    icon: "💪",
    icon_key: "active",
    color: "bg-green-500",
    preferredPeriod: "morning",
    defaultDuration: 30,
    defaultGoalValue: 30,
    defaultUnit: "minutes",
    priority: 9,
  },
  drink_water: {
    id: "drink_water",
    name: "Beber Água",
    category: "health",
    icon: "💧",
    icon_key: "water",
    color: "bg-blue-400",
    preferredPeriod: "any",
    defaultGoalValue: 2000,
    defaultUnit: "ml",
    priority: 8,
  },
  healthy_meal: {
    id: "healthy_meal",
    name: "Refeição Saudável",
    category: "health",
    icon: "🥗",
    icon_key: "meal",
    color: "bg-green-400",
    preferredPeriod: "any",
    defaultGoalValue: 3,
    defaultUnit: "times",
    priority: 8,
  },
  sleep_early: {
    id: "sleep_early",
    name: "Dormir Cedo",
    category: "health",
    icon: "😴",
    icon_key: "sleep",
    color: "bg-indigo-400",
    preferredPeriod: "evening",
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 9,
  },
  stretch: {
    id: "stretch",
    name: "Alongamento",
    category: "health",
    icon: "🧘",
    icon_key: "stretch",
    color: "bg-pink-500",
    preferredPeriod: "morning",
    defaultDuration: 10,
    defaultGoalValue: 10,
    defaultUnit: "minutes",
    priority: 6,
  },
  walk: {
    id: "walk",
    name: "Caminhada",
    category: "health",
    icon: "🚶",
    icon_key: "stand_hours",
    color: "bg-yellow-500",
    preferredPeriod: "any",
    defaultDuration: 20,
    defaultGoalValue: 5000,
    defaultUnit: "steps",
    priority: 7,
  },
  vitamins: {
    id: "vitamins",
    name: "Tomar Vitaminas",
    category: "health",
    icon: "💊",
    icon_key: "vitamins",
    color: "bg-orange-400",
    preferredPeriod: "morning",
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 5,
  },

  // MENTAL WELLNESS
  meditation: {
    id: "meditation",
    name: "Meditação",
    category: "mental",
    icon: "🧘",
    icon_key: "meditate",
    color: "bg-purple-500",
    preferredPeriod: "morning",
    defaultDuration: 10,
    defaultGoalValue: 10,
    defaultUnit: "minutes",
    priority: 9,
  },
  journaling: {
    id: "journaling",
    name: "Diário",
    category: "mental",
    icon: "📔",
    icon_key: "journal",
    color: "bg-yellow-600",
    preferredPeriod: "evening",
    defaultDuration: 10,
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 8,
  },
  gratitude: {
    id: "gratitude",
    name: "Gratidão",
    category: "mental",
    icon: "🙏",
    icon_key: "gratitude",
    color: "bg-pink-400",
    preferredPeriod: "evening",
    defaultDuration: 5,
    defaultGoalValue: 3,
    defaultUnit: "times",
    priority: 7,
  },
  breathing: {
    id: "breathing",
    name: "Respiração",
    category: "mental",
    icon: "😮‍💨",
    icon_key: "pause",
    color: "bg-cyan-400",
    preferredPeriod: "any",
    defaultDuration: 5,
    defaultGoalValue: 5,
    defaultUnit: "minutes",
    priority: 7,
  },
  digital_detox: {
    id: "digital_detox",
    name: "Detox Digital",
    category: "mental",
    icon: "📵",
    icon_key: "detox",
    color: "bg-gray-500",
    preferredPeriod: "evening",
    defaultDuration: 60,
    defaultGoalValue: 60,
    defaultUnit: "minutes",
    priority: 6,
  },
  reading: {
    id: "reading",
    name: "Leitura",
    category: "mental",
    icon: "📖",
    icon_key: "book",
    color: "bg-amber-500",
    preferredPeriod: "evening",
    defaultDuration: 20,
    defaultGoalValue: 10,
    defaultUnit: "pages",
    priority: 6,
  },
  mindfulness: {
    id: "mindfulness",
    name: "Mindfulness",
    category: "mental",
    icon: "🌸",
    icon_key: "heart",
    color: "bg-rose-400",
    preferredPeriod: "any",
    defaultDuration: 5,
    defaultGoalValue: 5,
    defaultUnit: "minutes",
    priority: 5,
  },

  // ROUTINE
  make_bed: {
    id: "make_bed",
    name: "Arrumar a Cama",
    category: "routine",
    icon: "🛏️",
    icon_key: "make_bed",
    color: "bg-blue-300",
    preferredPeriod: "morning",
    defaultDuration: 2,
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 7,
  },
  clean_space: {
    id: "clean_space",
    name: "Organizar Espaço",
    category: "routine",
    icon: "🧹",
    icon_key: "organize",
    color: "bg-teal-400",
    preferredPeriod: "evening",
    defaultDuration: 15,
    defaultGoalValue: 15,
    defaultUnit: "minutes",
    priority: 6,
  },
  meal_prep: {
    id: "meal_prep",
    name: "Preparar Refeições",
    category: "routine",
    icon: "🍱",
    icon_key: "meal",
    color: "bg-green-300",
    preferredPeriod: "evening",
    defaultDuration: 30,
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 6,
  },
  plan_week: {
    id: "plan_week",
    name: "Planejar Semana",
    category: "routine",
    icon: "📅",
    icon_key: "plan",
    color: "bg-indigo-300",
    preferredPeriod: "evening",
    defaultDuration: 20,
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 5,
  },
  organize_desk: {
    id: "organize_desk",
    name: "Organizar Mesa",
    category: "routine",
    icon: "🗂️",
    icon_key: "organize",
    color: "bg-slate-400",
    preferredPeriod: "evening",
    defaultDuration: 10,
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 5,
  },
  evening_routine: {
    id: "evening_routine",
    name: "Rotina Noturna",
    category: "routine",
    icon: "🌙",
    icon_key: "sleep",
    color: "bg-violet-500",
    preferredPeriod: "evening",
    defaultDuration: 30,
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 7,
  },
  morning_routine: {
    id: "morning_routine",
    name: "Rotina Matinal",
    category: "routine",
    icon: "☀️",
    icon_key: "sunrise",
    color: "bg-amber-400",
    preferredPeriod: "morning",
    defaultDuration: 30,
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 8,
  },

  // AVOID BAD HABITS
  no_snooze: {
    id: "no_snooze",
    name: "Não Apertar Soneca",
    category: "avoid",
    icon: "⏰",
    icon_key: "alarm",
    color: "bg-red-400",
    preferredPeriod: "morning",
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 8,
  },
  no_social_media: {
    id: "no_social_media",
    name: "Evitar Redes Sociais",
    category: "avoid",
    icon: "📱",
    icon_key: "social_media",
    color: "bg-orange-600",
    preferredPeriod: "any",
    defaultDuration: 120,
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 7,
  },
  no_junk_food: {
    id: "no_junk_food",
    name: "Evitar Junk Food",
    category: "avoid",
    icon: "🍔",
    icon_key: "no_fast_food",
    color: "bg-red-600",
    preferredPeriod: "any",
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 7,
  },
  no_procrastination: {
    id: "no_procrastination",
    name: "Não Procrastinar",
    category: "avoid",
    icon: "⚡",
    icon_key: "no_procrastination",
    color: "bg-yellow-500",
    preferredPeriod: "any",
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 8,
  },
  no_phone_bed: {
    id: "no_phone_bed",
    name: "Celular Fora do Quarto",
    category: "avoid",
    icon: "🚫",
    icon_key: "no_screens",
    color: "bg-purple-600",
    preferredPeriod: "evening",
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 6,
  },
  no_alcohol: {
    id: "no_alcohol",
    name: "Evitar Álcool",
    category: "avoid",
    icon: "🍷",
    icon_key: "no_alcohol",
    color: "bg-red-700",
    preferredPeriod: "any",
    defaultGoalValue: 1,
    defaultUnit: "none",
    priority: 5,
  },
  limit_screen: {
    id: "limit_screen",
    name: "Limitar Tela",
    category: "avoid",
    icon: "📺",
    icon_key: "no_screens",
    color: "bg-gray-600",
    preferredPeriod: "evening",
    defaultDuration: 60,
    defaultGoalValue: 60,
    defaultUnit: "minutes",
    priority: 6,
  },
};

// ============================================================================
// HELPERS
// ============================================================================

export const getObjectiveHabits = (objective: Objective): string[] => {
  return OBJECTIVE_HABITS[objective] || [];
};

export const getChallengeHabits = (challenge: string): string[] => {
  return CHALLENGE_HABITS[challenge] || [];
};

export const getHabitTemplate = (habitId: string): HabitTemplate | null => {
  return HABIT_TEMPLATES[habitId] || null;
};

export const getQuantityForTime = (time: TimeAvailable): { min: number; max: number } => {
  return TIME_QUANTITY[time];
};

export const getTimeSlotsForSchedule = (schedule: WorkSchedule): WorkScheduleSlots => {
  return WORK_SCHEDULE_SLOTS[schedule];
};
