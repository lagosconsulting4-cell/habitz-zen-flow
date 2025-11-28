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

// Filled icon factory for solid/filled style icons
const createFilledIcon = (paths: JSX.Element[], viewBox = "0 0 24 24") => (props: IconProps) => (
  <svg viewBox={viewBox} fill="currentColor" {...props}>
    {paths}
  </svg>
);

export const HabitIcons: Record<HabitIconKey, (props: IconProps) => JSX.Element> = {
  // REDESIGNED: Running person - Filled style (Heroicons-inspired)
  run: createFilledIcon([
    <path key="1" d="M15 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />,
    <path key="2" d="M14 8c-.6 0-1 .4-1 1v3l-2 1c-.5.2-.7.8-.5 1.2.2.5.8.7 1.2.5l2.3-1V19c0 .6.4 1 1 1s1-.4 1-1v-6l2 3c.3.4.9.5 1.3.2.4-.3.5-.9.2-1.3l-3-4.5c-.2-.3-.5-.4-.8-.4H14Z" />,
    <path key="3" d="M10 14c-.3-.4-.9-.5-1.3-.2-.4.3-.5.9-.2 1.3L10 17v3c0 .6.4 1 1 1s1-.4 1-1v-3.4c0-.2 0-.4-.1-.6L10 14Z" />,
  ]),
  // REDESIGNED: Cycling - Filled style (Heroicons-inspired)
  cycle: createFilledIcon([
    <circle key="1" cx="7" cy="17" r="3" />,
    <circle key="2" cx="17" cy="17" r="3" />,
    <circle key="3" cx="13" cy="6" r="2" />,
    <path key="4" d="M12 9c-.3 0-.5.1-.7.3l-3 4c-.3.4-.2 1 .2 1.3.4.3 1 .2 1.3-.2l2.2-2.9V17c0 .6.4 1 1 1s1-.4 1-1v-6.5l1.8 2.7c.3.4.9.5 1.3.2.4-.3.5-.9.2-1.3l-3-4.5c-.2-.2-.5-.3-.8-.3h-1.5Z" />,
  ]),
  // REDESIGNED: Swimming - Filled style (Heroicons-inspired)
  swim: createFilledIcon([
    <circle key="1" cx="9" cy="6" r="2" />,
    <path key="2" d="M7 9c-.3 0-.6.2-.8.4-.2.3-.2.7 0 1l3 4c.2.3.5.4.8.4h4c.3 0 .6-.1.8-.4l2-2.7c.3-.4.2-1-.2-1.3-.4-.3-1-.2-1.3.2L13.6 13H11l-2.2-2.9c-.2-.3-.5-.4-.8-.4H7Z" />,
    <path key="3" d="M3.5 16c-.3 0-.5.2-.5.5s.2.5.5.5c.8 0 1.5.3 2.2.7.7.4 1.5.8 2.3.8s1.6-.4 2.3-.8c.7-.4 1.4-.7 2.2-.7s1.5.3 2.2.7c.7.4 1.5.8 2.3.8s1.6-.4 2.3-.8c.7-.4 1.4-.7 2.2-.7.3 0 .5-.2.5-.5s-.2-.5-.5-.5c-.8 0-1.6.4-2.3.8-.7.4-1.4.7-2.2.7s-1.5-.3-2.2-.7c-.7-.4-1.5-.8-2.3-.8s-1.6.4-2.3.8c-.7.4-1.4.7-2.2.7s-1.5-.3-2.2-.7c-.7-.4-1.5-.8-2.3-.8Z" />,
    <path key="4" d="M3.5 19c-.3 0-.5.2-.5.5s.2.5.5.5c.8 0 1.5.3 2.2.7.7.4 1.5.8 2.3.8s1.6-.4 2.3-.8c.7-.4 1.4-.7 2.2-.7s1.5.3 2.2.7c.7.4 1.5.8 2.3.8s1.6-.4 2.3-.8c.7-.4 1.4-.7 2.2-.7.3 0 .5-.2.5-.5s-.2-.5-.5-.5c-.8 0-1.6.4-2.3.8-.7.4-1.4.7-2.2.7s-1.5-.3-2.2-.7c-.7-.4-1.5-.8-2.3-.8s-1.6.4-2.3.8c-.7.4-1.4.7-2.2.7s-1.5-.3-2.2-.7c-.7-.4-1.5-.8-2.3-.8Z" />,
  ]),
  // REDESIGNED: Stairs - cleaner steps
  stairs: createIcon([
    <path key="1" d="M6 18h3v-4h3v-4h3v-4h3" />,
  ]),
  // REDESIGNED: Meditation - Filled lotus position (Heroicons-inspired)
  meditate: createFilledIcon([
    <circle key="1" cx="12" cy="5" r="2" />,
    <path key="2" d="M10 8c-.6 0-1 .4-1 1v4c0 .4.2.7.5.9l2 1.3V19c0 .6.4 1 1 1s1-.4 1-1v-3.8l2-1.3c.3-.2.5-.5.5-.9V9c0-.6-.4-1-1-1h-4Z" />,
    <path key="3" d="M7 15c-.3 0-.6.2-.8.4-.2.3-.2.7 0 1 .2.3.5.4.8.4h2.5c.3 0 .5-.2.5-.5v-1c0-.2-.1-.3-.3-.4L7 15ZM17 15l-2.7.9c-.2.1-.3.2-.3.4v1c0 .3.2.5.5.5H17c.3 0 .6-.1.8-.4.2-.3.2-.7 0-1-.2-.2-.5-.4-.8-.4Z" />,
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
  // REDESIGNED: No fast food - Filled style with slash (Heroicons-inspired)
  no_fast_food: createFilledIcon([
    <path key="1" fillRule="evenodd" d="M6 3h6v2H9v2h3a4 4 0 0 1 0 8H6V3Zm3 10h3a2 2 0 1 0 0-4H9v4Z" clipRule="evenodd" />,
    <path key="2" d="M15 6h3v9h-3V6Z" />,
    <path key="3" fillRule="evenodd" d="M3.3 2.3c.4-.4 1-.4 1.4 0l16 16c.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0l-16-16c-.4-.4-.4-1 0-1.4Z" clipRule="evenodd" />,
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
  // REDESIGNED: Deep work - Head with headphones and brain (inspired by AI-generated design)
  deep_work: createFilledIcon([
    <path key="1" fillRule="evenodd" d="M12 2C8.7 2 6 4.7 6 8v3c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2v1c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4v-1c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2V8c0-3.3-2.7-6-6-6Zm-2 6c0-.6.4-1 1-1s1 .4 1 1v2c0 .6-.4 1-1 1s-1-.4-1-1V8Zm4 0c0-.6.4-1 1-1s1 .4 1 1v2c0 .6-.4 1-1 1s-1-.4-1-1V8Z" clipRule="evenodd" />,
  ]),
  // REDESIGNED: Phone call - simple geometric phone
  call_family: createIcon([
    <path key="1" d="M6 3h12v18H6z" rx="2" />,
    <circle key="2" cx="12" cy="17" r="1" />,
    <path key="3" d="M9 7h6" />,
  ]),
  // REDESIGNED: Detox - Leaves with droplet (inspired by AI-generated design)
  detox: createFilledIcon([
    <path key="1" d="M7 3c-.3 0-.5.2-.5.5 0 2.5 1 4.5 2.5 5.5-1.5 1-2.5 3-2.5 5.5 0 .3.2.5.5.5s.5-.2.5-.5c0-2 .8-3.8 2-4.8.5-.4 1-.9 1.3-1.4.3.5.8 1 1.3 1.4 1.2 1 2 2.8 2 4.8 0 .3.2.5.5.5s.5-.2.5-.5c0-2.5-1-4.5-2.5-5.5C13.5 8 14.5 6 14.5 3.5c0-.3-.2-.5-.5-.5s-.5.2-.5.5c0 2-.8 3.8-2 4.8-1.2-1-2-2.8-2-4.8 0-.3-.2-.5-.5-.5Z" />,
    <path key="2" d="M10 17c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2Z" />,
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
  // REDESIGNED: Burn energy - Dumbbell (inspired by AI-generated design)
  burn_energy: createFilledIcon([
    <path key="1" d="M4 10h2v4H4c-1.1 0-2-.9-2-2s.9-2 2-2ZM18 10h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2v-4Z" />,
    <rect key="2" x="6" y="11" width="12" height="2" rx="1" />,
    <rect key="3" x="6" y="9" width="2" height="6" rx="1" />,
    <rect key="4" x="16" y="9" width="2" height="6" rx="1" />,
  ]),
  // REDESIGNED: Stretch - Filled arms up (Heroicons-inspired)
  stretch: createFilledIcon([
    <circle key="1" cx="12" cy="5" r="2" />,
    <path key="2" d="M10 8c-.6 0-1 .4-1 1v10c0 .6.4 1 1 1s1-.4 1-1v-9h2v9c0 .6.4 1 1 1s1-.4 1-1V9c0-.6-.4-1-1-1h-4Z" />,
    <path key="3" d="M7.3 9.3c-.4.4-.4 1 0 1.4l2 2c.4.4 1 .4 1.4 0 .4-.4.4-1 0-1.4l-2-2c-.4-.4-1-.4-1.4 0ZM16.7 9.3c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l2 2c.4.4 1 .4 1.4 0 .4-.4.4-1 0-1.4l-2-2Z" />,
  ]),
  // REDESIGNED: Yoga - Filled lotus pose (Heroicons-inspired)
  yoga: createFilledIcon([
    <circle key="1" cx="12" cy="5" r="2" />,
    <path key="2" d="M10 8c-.6 0-1 .4-1 1v3c0 .3.1.5.3.7l2 2c.2.2.4.3.7.3s.5-.1.7-.3l2-2c.2-.2.3-.4.3-.7V9c0-.6-.4-1-1-1h-4Z" />,
    <path key="3" d="M6 15c-.3 0-.6.1-.7.3l-2 2c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l1.6-1.6c.2-.2.3-.4.3-.7v-.9c0-.3-.3-.5-.6-.5ZM18 15c-.3 0-.6.2-.6.5v.9c0 .3.1.5.3.7l1.6 1.6c.4.4 1 .4 1.4 0 .4-.4.4-1 0-1.4l-2-2c-.1-.2-.4-.3-.7-.3Z" />,
    <path key="4" d="M11 16c0-.6-.4-1-1-1s-1 .4-1 1v3c0 .6.4 1 1 1s1-.4 1-1v-3ZM15 16c0-.6-.4-1-1-1s-1 .4-1 1v3c0 .6.4 1 1 1s1-.4 1-1v-3Z" />,
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
  // REDESIGNED: Fruits - Grapes filled (inspired by AI-generated design)
  fruits: createFilledIcon([
    <circle key="1" cx="8" cy="10" r="2.5" />,
    <circle key="2" cx="13" cy="10" r="2.5" />,
    <circle key="3" cx="10.5" cy="14" r="2.5" />,
    <circle key="4" cx="8" cy="18" r="2" />,
    <circle key="5" cx="13" cy="18" r="2" />,
    <path key="6" d="M10.5 3c-.6 0-1 .4-1 1v3.5c0 .3.2.5.5.5s.5-.2.5-.5V4.5c.3-.3.6-.5 1-.5h.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-1Z" />,
  ]),
  // REDESIGNED: Vegetables - Carrot, broccoli, tomato (inspired by AI-generated design)
  vegetables: createFilledIcon([
    <path key="1" d="M6 3c-.6 0-1 .4-1 1v2c0 1.7 1.3 3 3 3V3H6ZM10 3v6c1.7 0 3-1.3 3-3V4c0-.6-.4-1-1-1h-2Z" />,
    <path key="2" d="M7.5 10c-.3 0-.5.2-.5.5V16l1.5 4c.2.5.6.8 1.1.8h1.8c.5 0 .9-.3 1.1-.8L14 16v-5.5c0-.3-.2-.5-.5-.5h-6Z" />,
    <circle key="3" cx="18" cy="15" r="3" />,
    <path key="4" d="M18 11c-.3 0-.5.2-.5.5v1c0 .3.2.5.5.5s.5-.2.5-.5v-1c0-.3-.2-.5-.5-.5Z" />,
  ]),
  // REDESIGNED: Protein - Steak/meat (inspired by AI-generated design)
  protein: createFilledIcon([
    <path key="1" fillRule="evenodd" d="M8 6c-2.2 0-4 1.8-4 4v4c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4v-4c0-2.2-1.8-4-4-4H8Zm2 4c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1Zm4 2c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1Z" clipRule="evenodd" />,
  ]),
  // REDESIGNED: Vitamins - Filled pill (Heroicons-inspired)
  vitamins: createFilledIcon([
    <path key="1" fillRule="evenodd" d="M15.6 3.6c2.3 2.3 2.3 6.1 0 8.5l-4.2 4.2c-2.3 2.3-6.1 2.3-8.5 0-2.3-2.3-2.3-6.1 0-8.5l4.2-4.2c2.3-2.3 6.1-2.3 8.5 0ZM7 7v10l-2.8-2.8c-1.6-1.6-1.6-4.1 0-5.7L7 7Zm10 10V7l2.8 2.8c1.6 1.6 1.6 4.1 0 5.7L17 17Z" clipRule="evenodd" />,
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
  // REDESIGNED: Make bed - Filled bed (Heroicons-inspired)
  make_bed: createFilledIcon([
    <path key="1" d="M3 11c0-.6.4-1 1-1h2V9c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v1h2V9c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1h1c.6 0 1 .4 1 1v6c0 .6-.4 1-1 1h-1v2c0 .6-.4 1-1 1s-1-.4-1-1v-2H5v2c0 .6-.4 1-1 1s-1-.4-1-1v-2H3c-.6 0-1-.4-1-1v-6Z" />,
  ]),
  // REDESIGNED: Review - document with checkmark
  review: createIcon([
    <rect key="1" x="6" y="4" width="12" height="16" rx="1" />,
    <path key="2" d="M9 10l2 2 4-4" />,
  ]),
  // REDESIGNED: No sugar - Filled style with slash (Heroicons-inspired)
  no_sugar: createFilledIcon([
    <path key="1" d="M8 4h8v8H8V4Zm2 2v4h4V6h-4Z" />,
    <path key="2" d="M10 14h4l1 4c.2.8-.3 1.5-1 1.7-.8.2-1.5-.3-1.7-1L11 15l-1.3 3.7c-.2.7-.9 1.2-1.7 1-.7-.2-1.2-.9-1-1.7l1-4Z" />,
    <path key="3" fillRule="evenodd" d="M3.3 2.3c.4-.4 1-.4 1.4 0l16 16c.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0l-16-16c-.4-.4-.4-1 0-1.4Z" clipRule="evenodd" />,
  ]),
  // REDESIGNED: No procrastination - consistent slash pattern
  no_procrastination: createIcon([
    <circle key="1" cx="12" cy="12" r="8" />,
    <path key="2" d="M12 8v4l3 2" />,
    <path key="3" d="M5 5l14 14" />,
  ]),
  // REDESIGNED: No skip meals - Filled style with slash (Heroicons-inspired)
  no_skip_meals: createFilledIcon([
    <path key="1" d="M7 4v8c0 .6.4 1 1 1s1-.4 1-1V4c0-.6-.4-1-1-1s-1 .4-1 1ZM4 4v5c0 1.1.9 2 2 2V4c0-.6-.4-1-1-1s-1 .4-1 1Z" />,
    <path key="2" d="M11 4v8c0 .6.4 1 1 1s1-.4 1-1V4c0-.6-.4-1-1-1s-1 .4-1 1Z" />,
    <path key="3" d="M15 4h3c.6 0 1 .4 1 1v6l-2 8c-.1.5-.6.8-1.1.8s-1-.4-1.1-.8l-2-8V5c0-.6.4-1 1-1h1.2Z" />,
    <path key="4" fillRule="evenodd" d="M3.3 2.3c.4-.4 1-.4 1.4 0l16 16c.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0l-16-16c-.4-.4-.4-1 0-1.4Z" clipRule="evenodd" />,
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
  // REDESIGNED: Social media - Thumbs up with chat (Heroicons-inspired)
  social_media: createFilledIcon([
    <path key="1" d="M7 22V11H4c-.6 0-1-.4-1-1V8c0-.6.4-1 1-1h4.4l1.4-3.5c.2-.5.8-.8 1.3-.6.5.2.8.8.6 1.3L10.6 7H15c1.7 0 3 1.3 3 3v1c0 .4-.1.8-.3 1.1L15.3 18c-.3.6-.9 1-1.6 1H8c-.6 0-1-.4-1-1Z" />,
    <path key="2" d="M16 2h3c.6 0 1 .4 1 1v3c0 .6-.4 1-1 1h-3c-.6 0-1-.4-1-1V3c0-.6.4-1 1-1Z" />,
  ]),
  // REDESIGNED: No late sleep - consistent slash pattern
  no_late_sleep: createIcon([
    <path key="1" d="M12 4a6 6 0 0 0 8 8 8 8 0 1 1-8-8Z" />,
    <path key="2" d="M5 5l14 14" />,
  ]),
  // REDESIGNED: Active - Weightlifting (inspired by AI-generated design)
  active: createFilledIcon([
    <circle key="1" cx="12" cy="5" r="2" />,
    <path key="2" d="M7 8c-.6 0-1 .4-1 1s.4 1 1 1h10c.6 0 1-.4 1-1s-.4-1-1-1H7Z" />,
    <rect key="3" x="3" y="8" width="2" height="2" rx="1" />,
    <rect key="4" x="19" y="8" width="2" height="2" rx="1" />,
    <path key="5" d="M10 11c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1s1-.4 1-1v-7c0-.6-.4-1-1-1ZM14 11c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1s1-.4 1-1v-7c0-.6-.4-1-1-1Z" />,
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
