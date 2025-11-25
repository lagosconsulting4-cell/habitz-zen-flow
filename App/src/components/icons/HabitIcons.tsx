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
  run: createIcon([
    <path key="1" d="M13.5 5.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />,
    <path key="2" d="m10 20 2-6 3-2 2 3" />,
    <path key="3" d="m6.5 16 3.5 1 2-6-3-1-1.5 3" />,
  ]),
  cycle: createIcon([
    <circle key="1" cx="6" cy="18" r="3" />,
    <circle key="2" cx="18" cy="18" r="3" />,
    <path key="3" d="M6 18h6l-3-8 6 2 3 6" />,
    <path key="4" d="M12 10h4" />,
  ]),
  swim: createIcon([
    <path key="1" d="M2 16s2-2 6-2 6 2 8 2 4-2 4-2" />,
    <path key="2" d="M10 12c1.5-1 2.5-1 4 0s2.5 1 4 0" />,
    <path key="3" d="m9 8 2 2 2-2" />,
  ]),
  stairs: createIcon([
    <path key="1" d="M4 18h4v-4h4v-4h4V6" />,
    <path key="2" d="M4 22h16" />,
  ]),
  meditate: createIcon([
    <circle key="1" cx="12" cy="6" r="2" />,
    <path key="2" d="M9 10.5s1.5 1 3 1 3-1 3-1" />,
    <path key="3" d="M10 13 8 16l2 2" />,
    <path key="4" d="M14 13l2 3-2 2" />,
    <path key="5" d="M11 18h2" />,
  ]),
  journal: createIcon([
    <rect key="1" x="5" y="4" width="12" height="16" rx="2" />,
    <path key="2" d="M9 8h6" />,
    <path key="3" d="M9 12h6" />,
    <path key="4" d="M9 16h3" />,
  ]),
  gratitude: createIcon([
    <path key="1" d="M12 21s-5-3.5-7-7a4 4 0 1 1 7-3 4 4 0 1 1 7 3c-2 3.5-7 7-7 7Z" />,
  ]),
  meal: createIcon([
    <path key="1" d="M7 4v16" />,
    <path key="2" d="M11 4v5" />,
    <path key="3" d="M11 15v5" />,
    <path key="4" d="M17 4c0 4-2 4-2 8 0 2 2 2 2 4" />,
    <path key="5" d="M15 4h4" />,
  ]),
  water: createIcon([
    <path key="1" d="M12 3s4 5 4 9a4 4 0 0 1-8 0c0-4 4-9 4-9Z" />,
  ]),
  no_fast_food: createIcon([
    <path key="1" d="M4 14h12" />,
    <path key="2" d="M6 18h8" />,
    <path key="3" d="M10 6h4l1 8H9Z" />,
    <path key="4" d="M3 3 21 21" />,
  ]),
  sleep: createIcon([
    <path key="1" d="M8 5a6 6 0 1 0 8 8" />,
    <path key="2" d="M15 5h3l-2 2h2" />,
    <path key="3" d="M17 9h2l-1.5 1.5H19" />,
  ]),
  no_screens: createIcon([
    <rect key="1" x="4" y="5" width="16" height="12" rx="2" />,
    <path key="2" d="M8 19h8" />,
    <path key="3" d="M3 3 21 21" />,
  ]),
  plan: createIcon([
    <rect key="1" x="6" y="4" width="12" height="16" rx="2" />,
    <path key="2" d="M9 8h6" />,
    <path key="3" d="M9 12h6" />,
    <path key="4" d="M9 16h4" />,
  ]),
  deep_work: createIcon([
    <path key="1" d="M4 8h16" />,
    <path key="2" d="M4 16h10" />,
    <path key="3" d="M10 12h10" />,
    <path key="4" d="M6 4v4" />,
    <path key="5" d="M12 4v4" />,
  ]),
  call_family: createIcon([
    <path key="1" d="M6 5a3 3 0 1 1 6 0v2H6Z" />,
    <path key="2" d="M15 19c-2 0-4-1-4-3v-2c0-1 1-2 2-2h4c1 0 2 1 2 2v2c0 2-2 3-4 3Z" />,
    <path key="3" d="M3 11s2 1 5 1" />,
  ]),
  detox: createIcon([
    <path key="1" d="M6 5h12" />,
    <path key="2" d="M9 5v14" />,
    <path key="3" d="M15 5v10" />,
    <path key="4" d="M6 19h8" />,
    <path key="5" d="M11 9h4" />,
  ]),
  heart: createIcon([
    <path key="1" d="M12 21s-5-3.5-7-7a4 4 0 1 1 7-3 4 4 0 1 1 7 3c-2 3.5-7 7-7 7Z" />,
  ]),
  activity_rings: createIcon([
    <circle key="1" cx="12" cy="12" r="8" strokeWidth="2.5" />,
    <circle key="2" cx="12" cy="12" r="5" strokeWidth="2.5" />,
    <circle key="3" cx="12" cy="12" r="2" strokeWidth="2.5" />,
  ]),
  stand_hours: createIcon([
    <path key="1" d="M12 2v4" />,
    <path key="2" d="M12 18v4" />,
    <circle key="3" cx="12" cy="12" r="4" />,
    <path key="4" d="M9 16l-3 3" />,
    <path key="5" d="M15 16l3 3" />,
  ]),
  exercise_minutes: createIcon([
    <circle key="1" cx="12" cy="12" r="10" />,
    <path key="2" d="M12 6v6l4 2" />,
  ]),
  burn_energy: createIcon([
    <path key="1" d="M8.5 14.5a2.5 2.5 0 0 0 0-5l5-5a2.5 2.5 0 0 1 0 5l-5 5Z" />,
    <path key="2" d="M16 16 12 20l-4-4" />,
  ]),
  stretch: createIcon([
    <path key="1" d="M12 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />,
    <path key="2" d="M4 13l5-3 3 8" />,
    <path key="3" d="M12 10l8 2-2 8" />,
  ]),
  yoga: createIcon([
    <circle key="1" cx="12" cy="5" r="2" />,
    <path key="2" d="M8 11h8" />,
    <path key="3" d="M12 11v10" />,
    <path key="4" d="M8 21l4-4 4 4" />,
  ]),
  strength: createIcon([
    <path key="1" d="M6 8h12M6 16h12" />,
    <path key="2" d="M7 8v8M17 8v8" />,
    <rect key="3" x="4" y="6" width="3" height="12" rx="1" />,
    <rect key="4" x="17" y="6" width="3" height="12" rx="1" />,
  ]),
  book: createIcon([
    <path key="1" d="M4 4h16v16H4z" />,
    <path key="2" d="M12 4v16" />,
    <path key="3" d="M8 8h8" />,
    <path key="4" d="M8 12h8" />,
  ]),
  study: createIcon([
    <path key="1" d="M4 8h16" />,
    <path key="2" d="M4 12h16" />,
    <path key="3" d="M4 16h10" />,
    <path key="4" d="M18 14l2 2-2 2" />,
  ]),
  organize: createIcon([
    <rect key="1" x="4" y="4" width="6" height="6" rx="1" />,
    <rect key="2" x="14" y="4" width="6" height="6" rx="1" />,
    <rect key="3" x="4" y="14" width="6" height="6" rx="1" />,
    <rect key="4" x="14" y="14" width="6" height="6" rx="1" />,
  ]),
  checklist: createIcon([
    <path key="1" d="M9 11l3 3L22 4" />,
    <path key="2" d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  ]),
  target: createIcon([
    <circle key="1" cx="12" cy="12" r="10" />,
    <circle key="2" cx="12" cy="12" r="6" />,
    <circle key="3" cx="12" cy="12" r="2" />,
  ]),
  fruits: createIcon([
    <path key="1" d="M12 3a6 6 0 0 0-6 6c0 3 2 6 6 6s6-3 6-6a6 6 0 0 0-6-6Z" />,
    <path key="2" d="M12 3v3" />,
    <path key="3" d="M10 15c0 3 1 6 2 6s2-3 2-6" />,
  ]),
  vegetables: createIcon([
    <path key="1" d="M12 2v4" />,
    <path key="2" d="M8 6c-2 2-2 6 0 8l4 4 4-4c2-2 2-6 0-8l-4-4-4 4Z" />,
    <path key="3" d="M10 10l4 4" />,
  ]),
  protein: createIcon([
    <path key="1" d="M12 2l-4 7h8l-4-7Z" />,
    <path key="2" d="M8 9v6a4 4 0 0 0 8 0V9" />,
  ]),
  vitamins: createIcon([
    <circle key="1" cx="12" cy="12" r="10" />,
    <path key="2" d="M12 8v8" />,
    <path key="3" d="M8 12h8" />,
  ]),
  clock: createIcon([
    <circle key="1" cx="12" cy="12" r="10" />,
    <path key="2" d="M12 6v6l4 2" />,
  ]),
  bed: createIcon([
    <path key="1" d="M3 18v4" />,
    <path key="2" d="M21 18v4" />,
    <path key="3" d="M3 14h18" />,
    <path key="4" d="M5 14V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" />,
  ]),
  family: createIcon([
    <circle key="1" cx="9" cy="7" r="2" />,
    <circle key="2" cx="15" cy="7" r="2" />,
    <path key="3" d="M9 13v5" />,
    <path key="4" d="M15 13v5" />,
    <path key="5" d="M6 18h12" />,
  ]),
  no_smoke: createIcon([
    <path key="1" d="M18 9v6" />,
    <path key="2" d="M21 9v6" />,
    <path key="3" d="M3 9h12" />,
    <path key="4" d="M3 15h12" />,
    <path key="5" d="M3 3l18 18" />,
  ]),
  no_alcohol: createIcon([
    <path key="1" d="M8 2h8" />,
    <path key="2" d="M9 2v5.5c0 2 1 3.5 3 3.5s3-1.5 3-3.5V2" />,
    <path key="3" d="M12 11v11" />,
    <path key="4" d="M3 3l18 18" />,
  ]),
  focus: createIcon([
    <circle key="1" cx="12" cy="12" r="3" />,
    <path key="2" d="M3 12h3" />,
    <path key="3" d="M18 12h3" />,
    <path key="4" d="M12 3v3" />,
    <path key="5" d="M12 18v3" />,
  ]),
  pause: createIcon([
    <rect key="1" x="6" y="4" width="4" height="16" rx="1" />,
    <rect key="2" x="14" y="4" width="4" height="16" rx="1" />,
  ]),
  // Ícone de proibido (círculo com barra diagonal) - para categoria "Evitar"
  ban: createIcon([
    <circle key="1" cx="12" cy="12" r="10" />,
    <path key="2" d="M4.93 4.93l14.14 14.14" />,
  ]),
  // Nascer do sol - para acordar cedo
  sunrise: createIcon([
    <path key="1" d="M12 2v4" />,
    <path key="2" d="M4.93 10.93l2.83-2.83" />,
    <path key="3" d="M2 18h20" />,
    <path key="4" d="M19.07 10.93l-2.83-2.83" />,
    <path key="5" d="M6 18a6 6 0 0 1 12 0" />,
  ]),
  // Cama arrumada - para fazer a cama
  make_bed: createIcon([
    <path key="1" d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />,
    <path key="2" d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />,
    <path key="3" d="M3 16h18" />,
  ]),
  // Lupa/documento - para revisar objetivos
  review: createIcon([
    <circle key="1" cx="11" cy="11" r="6" />,
    <path key="2" d="M21 21l-4.35-4.35" />,
    <path key="3" d="M8 11h6" />,
  ]),
  // Doce/açúcar com X - para evitar açúcar/doces
  no_sugar: createIcon([
    <path key="1" d="M12 3c-3 0-5 2-5 5v2c0 3 2 5 5 5s5-2 5-5V8c0-3-2-5-5-5Z" />,
    <path key="2" d="M9 17v2c0 1 1 2 3 2s3-1 3-2v-2" />,
    <path key="3" d="M4 4l16 16" />,
  ]),
  // Relógio com X - para não procrastinar
  no_procrastination: createIcon([
    <circle key="1" cx="12" cy="12" r="10" />,
    <path key="2" d="M12 6v4l2 2" />,
    <path key="3" d="M4 4l16 16" />,
  ]),
  // Prato com garfo e X - para não pular refeições
  no_skip_meals: createIcon([
    <circle key="1" cx="12" cy="12" r="8" />,
    <path key="2" d="M8 9v6" />,
    <path key="3" d="M16 9v2c0 1-1 2-2 2h-2" />,
    <path key="4" d="M4 4l16 16" />,
  ]),
  // Poltrona/relaxar - para tempo de lazer
  leisure: createIcon([
    <path key="1" d="M4 16V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8" />,
    <path key="2" d="M2 14h20" />,
    <path key="3" d="M6 14v6" />,
    <path key="4" d="M18 14v6" />,
    <path key="5" d="M8 10h8" />,
  ]),
  // Despertador - para acordar no horário
  alarm: createIcon([
    <circle key="1" cx="12" cy="13" r="8" />,
    <path key="2" d="M12 9v4l2 2" />,
    <path key="3" d="M5 3L2 6" />,
    <path key="4" d="M22 6l-3-3" />,
  ]),
  // Café da manhã - para café da manhã saudável
  breakfast: createIcon([
    <path key="1" d="M6 8h8" />,
    <path key="2" d="M6 8c0 4 2 6 4 6s4-2 4-6" />,
    <path key="3" d="M14 8c2 0 4 1 4 3s-2 3-4 3" />,
    <path key="4" d="M10 14v4" />,
    <path key="5" d="M6 18h8" />,
  ]),
  // Celular/redes sociais - para limitar redes sociais
  social_media: createIcon([
    <rect key="1" x="5" y="2" width="14" height="20" rx="2" />,
    <path key="2" d="M12 18h.01" />,
    <path key="3" d="M9 6h6" />,
  ]),
  // Lua com X - para não dormir tarde
  no_late_sleep: createIcon([
    <path key="1" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
    <path key="2" d="M4 4l16 16" />,
  ]),
  // Pessoa ativa/em movimento - para não ficar sedentário
  active: createIcon([
    <circle key="1" cx="12" cy="5" r="2" />,
    <path key="2" d="M12 7v5" />,
    <path key="3" d="M9 20l3-8 3 8" />,
    <path key="4" d="M7 11l5 1 5-1" />,
  ]),
};

export const getHabitIcon = (key?: HabitIconKey | null) => {
  if (!key) return null;
  return HabitIcons[key] ?? null;
};
