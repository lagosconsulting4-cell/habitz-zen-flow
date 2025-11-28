import { SVGProps } from "react";

export type HabitIconKey =
  | "run"
  | "cycle"
  | "swim"
  | "stairs"
  | "meditate"
  | "journal"
  | "gratitude"
  | "meal"
  | "water"
  | "no_fast_food"
  | "sleep"
  | "no_screens"
  | "plan"
  | "deep_work"
  | "call_family"
  | "detox"
  | "heart"
  | "activity_rings"
  | "stand_hours"
  | "exercise_minutes"
  | "burn_energy"
  | "stretch"
  | "yoga"
  | "strength"
  | "book"
  | "study"
  | "organize"
  | "checklist"
  | "target"
  | "fruits"
  | "vegetables"
  | "protein"
  | "vitamins"
  | "clock"
  | "bed"
  | "family"
  | "no_smoke"
  | "no_alcohol"
  | "focus"
  | "pause"
  | "ban"
  | "sunrise"
  | "make_bed"
  | "review"
  | "no_sugar"
  | "no_procrastination"
  | "no_skip_meals"
  | "leisure"
  | "alarm"
  | "breakfast"
  | "social_media"
  | "no_late_sleep"
  | "active";

type IconProps = SVGProps<SVGSVGElement>;

const createIcon = (paths: JSX.Element[], viewBox = "0 0 24 24") => (props: IconProps) => (
  <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    {paths}
  </svg>
);

export const HabitIcons: Record<HabitIconKey, (props: IconProps) => JSX.Element> = {
  // REDESIGNED: Geometric running figure - Streaks style
  run: createIcon([
    <circle key="1" cx="12" cy="5" r="2" />,
    <path key="2" d="M12 7v7" />,
    <path key="3" d="M8 14l4-2 4 4" />,
  ]),
  // REDESIGNED: Geometric bicycle - Streaks style
  cycle: createIcon([
    <circle key="1" cx="7" cy="17" r="3" />,
    <circle key="2" cx="17" cy="17" r="3" />,
    <path key="3" d="M7 17h10" />,
    <path key="4" d="M12 8l-3 9M12 8l3 9" />,
  ]),
  // REDESIGNED: Geometric swimming - Streaks style
  swim: createIcon([
    <circle key="1" cx="8" cy="6" r="2" />,
    <path key="2" d="M8 8c2 2 6 2 8 0" />,
    <path key="3" d="M4 14c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />,
    <path key="4" d="M4 18c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />,
  ]),
  // REDESIGNED: Stairs - cleaner steps
  stairs: createIcon([
    <path key="1" d="M6 18h3v-4h3v-4h3v-4h3" />,
  ]),
  // REDESIGNED: Zen meditation - Streaks style
  meditate: createIcon([
    <circle key="1" cx="12" cy="7" r="2.5" />,
    <path key="2" d="M12 10v4" />,
    <path key="3" d="M7 15a5 5 0 0 1 10 0" />,
  ]),
  // REDESIGNED: Journal - book with pen
  journal: createIcon([
    <rect key="1" x="6" y="4" width="10" height="16" rx="1" />,
    <path key="2" d="M9 8h4M9 12h4" />,
  ]),
  // REDESIGNED: Gratitude - sparkle/star symbol
  gratitude: createIcon([
    <path key="1" d="M12 2v8M12 14v8M2 12h8M14 12h8" />,
    <path key="2" d="M5 5l3 3M16 5l-3 3M5 19l3-3M19 19l-3-3" />,
  ]),
  // REDESIGNED: Clean fork and knife - Streaks style
  meal: createIcon([
    <path key="1" d="M7 4v16" />,
    <path key="2" d="M4 4v7l3-1" />,
    <path key="3" d="M10 4v7l-3-1" />,
    <path key="4" d="M17 4v8l3 8h-6l3-8Z" />,
  ]),
  water: createIcon([
    <path key="1" d="M12 3s4 5 4 9a4 4 0 0 1-8 0c0-4 4-9 4-9Z" />,
  ]),
  // REDESIGNED: No fast food - consistent slash pattern
  no_fast_food: createIcon([
    <path key="1" d="M8 8h8v8H8z" />,
    <path key="2" d="M12 8v8" />,
    <path key="3" d="M5 5l14 14" />,
  ]),
  // REDESIGNED: Sleep - crescent moon clean
  sleep: createIcon([
    <path key="1" d="M12 4a7 7 0 1 0 8 8 9 9 0 0 1-8-8Z" />,
  ]),
  // REDESIGNED: No screens - consistent slash pattern
  no_screens: createIcon([
    <rect key="1" x="5" y="6" width="14" height="10" rx="1" />,
    <path key="2" d="M10 19h4" />,
    <path key="3" d="M5 5l14 14" />,
  ]),
  // REDESIGNED: Clipboard with checkmark - Streaks style
  plan: createIcon([
    <rect key="1" x="6" y="4" width="12" height="16" rx="2" />,
    <path key="2" d="M9 2h6v2H9Z" />,
    <path key="3" d="M9 10l2 2 4-4" />,
  ]),
  // REDESIGNED: Focus/deep work - target symbol
  deep_work: createIcon([
    <circle key="1" cx="12" cy="12" r="8" />,
    <circle key="2" cx="12" cy="12" r="3" />,
  ]),
  // REDESIGNED: Phone call - simple geometric phone
  call_family: createIcon([
    <path key="1" d="M6 3h12v18H6z" rx="2" />,
    <circle key="2" cx="12" cy="17" r="1" />,
    <path key="3" d="M9 7h6" />,
  ]),
  // REDESIGNED: Detox/cleanse - droplet with sparkle
  detox: createIcon([
    <path key="1" d="M12 3s4 5 4 9a4 4 0 0 1-8 0c0-4 4-9 4-9Z" />,
    <path key="2" d="M12 8l1 1-1 1-1-1z" />,
  ]),
  heart: createIcon([
    <path key="1" d="M12 21s-5-3.5-7-7a4 4 0 1 1 7-3 4 4 0 1 1 7 3c-2 3.5-7 7-7 7Z" />,
  ]),
  // REDESIGNED: Activity rings - consistent stroke weight
  activity_rings: createIcon([
    <circle key="1" cx="12" cy="12" r="9" />,
    <circle key="2" cx="12" cy="12" r="6" />,
    <circle key="3" cx="12" cy="12" r="3" />,
  ]),
  // REDESIGNED: Stand hours - standing person geometric
  stand_hours: createIcon([
    <circle key="1" cx="12" cy="5" r="2" />,
    <path key="2" d="M12 7v10" />,
    <path key="3" d="M9 21h6" />,
  ]),
  exercise_minutes: createIcon([
    <circle key="1" cx="12" cy="12" r="10" />,
    <path key="2" d="M12 6v6l4 2" />,
  ]),
  // REDESIGNED: Burn energy - flame simplified
  burn_energy: createIcon([
    <path key="1" d="M12 3s-4 4-4 8c0 3 2 6 4 6s4-3 4-6c0-4-4-8-4-8Z" />,
    <path key="2" d="M10 10a2 2 0 0 1 4 0" />,
  ]),
  // REDESIGNED: Geometric stretch - Streaks style
  stretch: createIcon([
    <circle key="1" cx="12" cy="5" r="2" />,
    <path key="2" d="M12 7v6" />,
    <path key="3" d="M6 10l6 3 6-3" />,
  ]),
  // REDESIGNED: Yoga balance pose - Streaks style
  yoga: createIcon([
    <circle key="1" cx="12" cy="5" r="2" />,
    <path key="2" d="M7 13h10" />,
    <path key="3" d="M12 7v6" />,
  ]),
  // REDESIGNED: Strength - dumbbell clean
  strength: createIcon([
    <rect key="1" x="4" y="7" width="3" height="10" rx="1" />,
    <rect key="2" x="17" y="7" width="3" height="10" rx="1" />,
    <path key="3" d="M7 12h10" />,
  ]),
  // REDESIGNED: Book - open book clean
  book: createIcon([
    <path key="1" d="M4 6h16v14H4z" rx="1" />,
    <path key="2" d="M12 6v14" />,
  ]),
  // REDESIGNED: Study - graduation cap
  study: createIcon([
    <path key="1" d="M3 10l9-4 9 4-9 4z" />,
    <path key="2" d="M6 12v4l6 3 6-3v-4" />,
  ]),
  organize: createIcon([
    <rect key="1" x="4" y="4" width="6" height="6" rx="1" />,
    <rect key="2" x="14" y="4" width="6" height="6" rx="1" />,
    <rect key="3" x="4" y="14" width="6" height="6" rx="1" />,
    <rect key="4" x="14" y="14" width="6" height="6" rx="1" />,
  ]),
  // REDESIGNED: Checklist - list with checks
  checklist: createIcon([
    <path key="1" d="M5 7l2 2 4-4M5 12l2 2 4-4M5 17l2 2 4-4" />,
    <path key="2" d="M14 7h6M14 12h6M14 17h6" />,
  ]),
  target: createIcon([
    <circle key="1" cx="12" cy="12" r="10" />,
    <circle key="2" cx="12" cy="12" r="6" />,
    <circle key="3" cx="12" cy="12" r="2" />,
  ]),
  // REDESIGNED: Fruits - apple simplified
  fruits: createIcon([
    <circle key="1" cx="12" cy="13" r="6" />,
    <path key="2" d="M12 7v2" />,
    <path key="3" d="M10 6c0-2 1-3 2-3s2 1 2 3" />,
  ]),
  // REDESIGNED: Vegetables - carrot simplified
  vegetables: createIcon([
    <path key="1" d="M12 4v2" />,
    <path key="2" d="M9 6l3-2 3 2c1 1 2 4 0 10l-3 4-3-4c-2-6-1-9 0-10Z" />,
  ]),
  // REDESIGNED: Protein - drumstick simplified
  protein: createIcon([
    <circle key="1" cx="15" cy="8" r="3" />,
    <path key="2" d="M12 11l-4 8c-1 2 0 3 2 3h4" />,
  ]),
  // REDESIGNED: Vitamins - pill simplified
  vitamins: createIcon([
    <rect key="1" x="7" y="7" width="10" height="10" rx="5" />,
    <path key="2" d="M7 12h10" />,
  ]),
  // IMPROVED: Clock with clearer 10:10 position - Streaks style
  clock: createIcon([
    <circle key="1" cx="12" cy="12" r="10" />,
    <path key="2" d="M12 6v6l3 3" />,
  ]),
  // REDESIGNED: Bed - simple bed icon
  bed: createIcon([
    <rect key="1" x="4" y="12" width="16" height="6" rx="1" />,
    <circle key="2" cx="8" cy="9" r="1.5" />,
  ]),
  // REDESIGNED: Family - two people simplified
  family: createIcon([
    <circle key="1" cx="9" cy="7" r="2" />,
    <circle key="2" cx="15" cy="7" r="2" />,
    <path key="3" d="M6 15a3 3 0 0 1 6 0M12 15a3 3 0 0 1 6 0" />,
  ]),
  // REDESIGNED: No smoke - cigarette with slash
  no_smoke: createIcon([
    <rect key="1" x="3" y="10" width="14" height="4" rx="1" />,
    <path key="2" d="M18 10v4M21 10v4" />,
    <path key="3" d="M5 5l14 14" />,
  ]),
  // REDESIGNED: No alcohol - wine glass with slash
  no_alcohol: createIcon([
    <path key="1" d="M8 3h8l-2 8h-4z" />,
    <path key="2" d="M12 11v8M10 19h4" />,
    <path key="3" d="M5 5l14 14" />,
  ]),
  // REDESIGNED: Focus - crosshair simplified
  focus: createIcon([
    <circle key="1" cx="12" cy="12" r="8" />,
    <path key="2" d="M12 4v4M12 16v4M4 12h4M16 12h4" />,
  ]),
  pause: createIcon([
    <rect key="1" x="6" y="4" width="4" height="16" rx="1" />,
    <rect key="2" x="14" y="4" width="4" height="16" rx="1" />,
  ]),
  // IMPROVED: Prohibition symbol - Streaks style
  ban: createIcon([
    <circle key="1" cx="12" cy="12" r="10" />,
    <path key="2" d="M5 5l14 14" />,
  ]),
  // REDESIGNED: Sunrise - sun above horizon
  sunrise: createIcon([
    <circle key="1" cx="12" cy="12" r="4" />,
    <path key="2" d="M12 2v4M12 16v4M2 12h4M18 12h4" />,
    <path key="3" d="M2 20h20" />,
  ]),
  // REDESIGNED: Make bed - bed with checkmark
  make_bed: createIcon([
    <rect key="1" x="4" y="10" width="16" height="8" rx="1" />,
    <path key="2" d="M8 6l2 2 4-4" />,
  ]),
  // REDESIGNED: Review - document with checkmark
  review: createIcon([
    <rect key="1" x="6" y="4" width="12" height="16" rx="1" />,
    <path key="2" d="M9 10l2 2 4-4" />,
  ]),
  // REDESIGNED: No sugar - consistent slash pattern
  no_sugar: createIcon([
    <rect key="1" x="9" y="6" width="6" height="8" rx="3" />,
    <path key="2" d="M10 16v2c0 1 1 2 2 2s2-1 2-2v-2" />,
    <path key="3" d="M5 5l14 14" />,
  ]),
  // REDESIGNED: No procrastination - consistent slash pattern
  no_procrastination: createIcon([
    <circle key="1" cx="12" cy="12" r="8" />,
    <path key="2" d="M12 8v4l3 2" />,
    <path key="3" d="M5 5l14 14" />,
  ]),
  // REDESIGNED: No skip meals - consistent slash pattern
  no_skip_meals: createIcon([
    <circle key="1" cx="12" cy="12" r="7" />,
    <path key="2" d="M9 10v4" />,
    <path key="3" d="M15 10v4" />,
    <path key="4" d="M5 5l14 14" />,
  ]),
  // REDESIGNED: Leisure/relaxation - couch simplified
  leisure: createIcon([
    <rect key="1" x="4" y="10" width="16" height="6" rx="2" />,
    <path key="2" d="M4 16v4M20 16v4" />,
  ]),
  // REDESIGNED: Alarm clock - clean alarm
  alarm: createIcon([
    <circle key="1" cx="12" cy="13" r="7" />,
    <path key="2" d="M12 10v3l2 2" />,
    <path key="3" d="M7 4L4 7M17 4l3 3" />,
  ]),
  // REDESIGNED: Breakfast - coffee cup simplified
  breakfast: createIcon([
    <path key="1" d="M6 10h10v6H6z" />,
    <path key="2" d="M16 12h2v2h-2" />,
    <path key="3" d="M8 16v2h6v-2" />,
  ]),
  // REDESIGNED: Social media - phone with notification
  social_media: createIcon([
    <rect key="1" x="6" y="3" width="12" height="18" rx="2" />,
    <circle key="2" cx="15" cy="6" r="2" />,
    <circle key="3" cx="12" cy="18" r="1" />,
  ]),
  // REDESIGNED: No late sleep - consistent slash pattern
  no_late_sleep: createIcon([
    <path key="1" d="M12 4a6 6 0 0 0 8 8 8 8 0 1 1-8-8Z" />,
    <path key="2" d="M5 5l14 14" />,
  ]),
  // REDESIGNED: Active movement - Streaks style
  active: createIcon([
    <circle key="1" cx="12" cy="5" r="2" />,
    <path key="2" d="M12 7v6" />,
    <path key="3" d="M9 13l3 8 3-8" />,
    <path key="4" d="M7 11l5 1 5-1" />,
  ]),
};

// Mapeamento de categoria para ícone padrão
export const CATEGORY_ICON_MAP: Record<string, HabitIconKey> = {
  // Categorias principais do app
  "productivity": "plan",
  "fitness": "run",
  "nutrition": "meal",
  "time_routine": "clock",
  "avoid": "ban",
  // Categorias alternativas/legadas
  "health": "activity_rings",
  "exercise": "run",
  "meditation": "meditate",
  "reading": "book",
  "sleep": "sleep",
  "water": "water",
  "social": "family",
  "work": "deep_work",
  "study": "study",
  "wellness": "heart",
  // Fallbacks por nome de categoria
  "Produtividade": "plan",
  "Saúde/Fitness": "run",
  "Alimentação": "meal",
  "Tempo/Rotina": "clock",
  "Evitar": "ban",
};

// Ícone padrão quando nenhum é encontrado (melhor que Target genérico)
export const DEFAULT_HABIT_ICON: HabitIconKey = "activity_rings";

export const getHabitIcon = (key?: HabitIconKey | null) => {
  if (!key) return null;
  return HabitIcons[key] ?? null;
};

// Nova função que considera categoria como fallback
export const getHabitIconWithFallback = (
  iconKey?: HabitIconKey | null,
  category?: string | null
): ((props: SVGProps<SVGSVGElement>) => JSX.Element) => {
  // Prioridade 1: icon_key específico
  if (iconKey && HabitIcons[iconKey]) {
    return HabitIcons[iconKey];
  }

  // Prioridade 2: baseado na categoria
  if (category) {
    const categoryIcon = CATEGORY_ICON_MAP[category];
    if (categoryIcon && HabitIcons[categoryIcon]) {
      return HabitIcons[categoryIcon];
    }
  }

  // Prioridade 3: ícone padrão (activity_rings é mais bonito que target)
  return HabitIcons[DEFAULT_HABIT_ICON];
};
