import { SVGProps } from "react";
import {
  // Core icons from Lucide (we'll wrap them for consistency)
  Heart,
  Moon,
  Droplets,
  Clock,
  Target,
  Pause,
  Ban,
  Phone,
  Sunrise,
  Coffee,
  AlarmClock,
  Timer,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  ListChecks,
  Armchair,
  FileCheck,
  ClipboardCheck,
  Users,
  Bed,
  Dumbbell,
  Pill,
  Sparkles,
  Focus,
  Utensils,
  type LucideIcon,
} from "lucide-react";

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

// Wrapper for Lucide icons to ensure consistent props
const wrapLucideIcon = (LucideComponent: LucideIcon) => (props: IconProps) => (
  <LucideComponent
    strokeWidth={2}
    fill="none"
    stroke="currentColor"
    {...props}
  />
);

// Factory for custom filled icons (solid style)
const createFilledIcon = (paths: JSX.Element[], viewBox = "0 0 24 24") => (props: IconProps) => (
  <svg viewBox={viewBox} fill="currentColor" data-style="filled" {...props}>
    {paths}
  </svg>
);

// Factory for prohibition icons (base icon + diagonal slash)
const createProhibitionIcon = (baseIcon: JSX.Element[], viewBox = "0 0 24 24") => (props: IconProps) => (
  <svg viewBox={viewBox} fill="currentColor" data-style="filled" {...props}>
    {baseIcon}
    <path
      d="M4.93 4.93a1 1 0 0 1 1.41 0l12.73 12.73a1 1 0 0 1-1.41 1.41L4.93 6.34a1 1 0 0 1 0-1.41Z"
      fillRule="evenodd"
    />
  </svg>
);

// ============================================
// CUSTOM FILLED ICONS (Premium Design)
// Based on Gemini AI references and professional icon standards
// ============================================

// Running person - Dynamic filled silhouette
const runIcon = createFilledIcon([
  <circle key="head" cx="14" cy="4" r="2.5" />,
  <path key="body" d="M11.5 8.5c-.4-.3-1-.2-1.3.2l-3 4c-.3.4-.2 1 .2 1.3l3.5 2.5-1.5 4c-.2.5 0 1.1.5 1.3.5.2 1.1 0 1.3-.5l2-5c.1-.3 0-.7-.2-.9L11 13.5l1.5-2 2 2c.2.2.5.3.8.3l3-.5c.5-.1.9-.6.8-1.1-.1-.5-.6-.9-1.1-.8l-2.5.4-2.5-2.5c-.2-.2-.4-.3-.5-.3Z" />,
  <path key="leg" d="M8 17c-.3-.4-.9-.5-1.3-.2l-2.5 2c-.4.3-.5.9-.2 1.3.3.4.9.5 1.3.2l2.5-2c.4-.3.5-.9.2-1.3Z" />,
]);

// Cycling - Person on bike (Based on Gemini pedalar reference)
const cycleIcon = createFilledIcon([
  <circle key="head" cx="12" cy="4" r="2" />,
  <circle key="wheel1" cx="5" cy="17" r="3" />,
  <circle key="wheel1-inner" cx="5" cy="17" r="1.5" fill="none" stroke="currentColor" strokeWidth="1" />,
  <circle key="wheel2" cx="19" cy="17" r="3" />,
  <circle key="wheel2-inner" cx="19" cy="17" r="1.5" fill="none" stroke="currentColor" strokeWidth="1" />,
  <path key="frame" d="M12 17V9l-4 4 4 4h3l2-5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
]);

// Swimming - Person in water
const swimIcon = createFilledIcon([
  <circle key="head" cx="6" cy="8" r="2" />,
  <path key="body" d="M8 9c0-.3.1-.5.3-.7l6-5c.4-.3 1-.3 1.4.1.3.4.3 1-.1 1.4L10.5 9H18c.6 0 1 .4 1 1s-.4 1-1 1H8.5c-.3 0-.5-.3-.5-.6V9Z" />,
  <path key="wave1" d="M2 15c.8 0 1.5.5 2 1s1.2 1 2 1 1.5-.5 2-1 1.2-1 2-1 1.5.5 2 1 1.2 1 2 1 1.5-.5 2-1 1.2-1 2-1 1.5.5 2 1 1.2 1 2 1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  <path key="wave2" d="M2 19c.8 0 1.5.5 2 1s1.2 1 2 1 1.5-.5 2-1 1.2-1 2-1 1.5.5 2 1 1.2 1 2 1 1.5-.5 2-1 1.2-1 2-1 1.5.5 2 1 1.2 1 2 1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
]);

// Stairs - Steps icon
const stairsIcon = createFilledIcon([
  <path key="stairs" d="M4 20h4v-4h4v-4h4v-4h4V4h-4v4h-4v4H8v4H4v4Z" />,
]);

// Meditation - Lotus position (Based on Gemini yoga reference)
const meditateIcon = createFilledIcon([
  <circle key="head" cx="12" cy="5" r="2.5" />,
  <path key="body" d="M9 10h6c.6 0 1 .4 1 1v2c0 .3-.1.6-.3.8l-3 3c-.4.4-1 .4-1.4 0l-3-3c-.2-.2-.3-.5-.3-.8v-2c0-.6.4-1 1-1Z" />,
  <path key="legs" d="M6 16c-.4 0-.8.2-1 .6-.2.4-.1.9.3 1.2l2.5 1.5c.3.2.7.2 1 0l3.2-2 3.2 2c.3.2.7.2 1 0l2.5-1.5c.4-.2.5-.8.3-1.2-.2-.4-.6-.6-1-.6h-12Z" />,
]);

// Journal - Book with lines
const journalIcon = createFilledIcon([
  <path key="cover" d="M6 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6Z" />,
  <path key="lines" d="M8 8h8M8 12h8M8 16h5" stroke="var(--icon-bg, #18181b)" strokeWidth="1.5" strokeLinecap="round" fill="none" />,
]);

// Deep work - Head with brain/focus (Based on Gemini deep_work reference)
const deepWorkIcon = createFilledIcon([
  <path key="head" d="M12 2C8.7 2 6 4.7 6 8c0 2 1 3.8 2.5 4.9V14c0 .6.4 1 1 1h5c.6 0 1-.4 1-1v-1.1C17 11.8 18 10 18 8c0-3.3-2.7-6-6-6Z" />,
  <path key="base" d="M9 16h6v2c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2v-2Z" />,
  <path key="headphones-left" d="M4 9c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h1V9H4Z" />,
  <path key="headphones-right" d="M20 9c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1h-1V9h1Z" />,
  <path key="band" d="M5 10c0-3.9 3.1-7 7-7s7 3.1 7 7" fill="none" stroke="currentColor" strokeWidth="2" />,
]);

// Detox - Leaf with droplet
const detoxIcon = createFilledIcon([
  <path key="leaf" d="M12 2C8 2 5 6 5 10c0 5 3.5 9 7 11 3.5-2 7-6 7-11 0-4-3-8-7-8Z" />,
  <path key="vein" d="M12 7v10M9 10c1.5 1 2 2 3 4M15 10c-1.5 1-2 2-3 4" fill="none" stroke="var(--icon-bg, #18181b)" strokeWidth="1.5" strokeLinecap="round" />,
]);

// Activity rings - Three concentric circles
const activityRingsIcon = createFilledIcon([
  <circle key="outer" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />,
  <circle key="middle" cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.5" />,
  <circle key="inner" cx="12" cy="12" r="3" />,
]);

// Stand hours - Standing person
const standHoursIcon = createFilledIcon([
  <circle key="head" cx="12" cy="4" r="2.5" />,
  <path key="body" d="M10 8h4c.6 0 1 .4 1 1v6c0 .6-.4 1-1 1h-4c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1Z" />,
  <path key="legs" d="M10 16h1.5v5c0 .6-.4 1-1 1s-1-.4-1-1v-4.5c0-.3.2-.5.5-.5ZM14 16h-1.5v5c0 .6.4 1 1 1s1-.4 1-1v-4.5c0-.3-.2-.5-.5-.5Z" />,
]);

// Stretch - Person with arms up
const stretchIcon = createFilledIcon([
  <circle key="head" cx="12" cy="4" r="2.5" />,
  <path key="body" d="M10 8h4c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1h-4c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1Z" />,
  <path key="arm-left" d="M9 9c-.3 0-.5.2-.5.5v.5l-3 3c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l3-3c.2-.2.3-.4.3-.7V9.5c0-.3-.2-.5-.5-.5h-.7Z" />,
  <path key="arm-right" d="M15 9c.3 0 .5.2.5.5v.5l3 3c.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0l-3-3c-.2-.2-.3-.4-.3-.7V9.5c0-.3.2-.5.5-.5h.7Z" />,
  <path key="legs" d="M10 17v4c0 .6.4 1 1 1s1-.4 1-1v-4ZM14 17v4c0 .6-.4 1-1 1s-1-.4-1-1v-4Z" />,
]);

// Yoga - Lotus pose (Based on Gemini yoga reference)
const yogaIcon = createFilledIcon([
  <circle key="head" cx="12" cy="4" r="2.5" />,
  <path key="torso" d="M10 8h4c.6 0 1 .4 1 1v4c0 .6-.4 1-1 1h-4c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1Z" />,
  <path key="left-leg" d="M5 16c-.4 0-.7.2-.9.5-.2.4-.1.9.3 1.1l3 2c.2.1.4.2.6.2h3c.3 0 .5-.1.7-.3l.3-.3V15h-2l-5 1Z" />,
  <path key="right-leg" d="M19 16c.4 0 .7.2.9.5.2.4.1.9-.3 1.1l-3 2c-.2.1-.4.2-.6.2h-3c-.3 0-.5-.1-.7-.3l-.3-.3V15h2l5 1Z" />,
]);

// Strength - Dumbbell (simple)
const strengthIcon = createFilledIcon([
  <rect key="left-weight" x="2" y="8" width="4" height="8" rx="1" />,
  <rect key="right-weight" x="18" y="8" width="4" height="8" rx="1" />,
  <rect key="bar" x="6" y="10" width="12" height="4" rx="1" />,
]);

// Fruits - Grapes (Based on Gemini fruits reference)
const fruitsIcon = createFilledIcon([
  <circle key="grape1" cx="9" cy="10" r="2.5" />,
  <circle key="grape2" cx="15" cy="10" r="2.5" />,
  <circle key="grape3" cx="12" cy="14" r="2.5" />,
  <circle key="grape4" cx="9" cy="18" r="2" />,
  <circle key="grape5" cx="15" cy="18" r="2" />,
  <path key="stem" d="M12 3v4M10 5c1.5 0 2.5-.5 3-1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  <path key="leaf" d="M14 4c1-1 2-1 3 0s0 2-1 2" fill="currentColor" />,
]);

// Vegetables - Carrot & Broccoli (Based on Gemini vegetables reference)
const vegetablesIcon = createFilledIcon([
  <path key="carrot" d="M4 8c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v2l-2 10c-.1.5-.5.8-1 .8s-.9-.3-1-.8L4 10V8Z" />,
  <path key="carrot-top" d="M5 7V5c0-.6.4-1 1-1s1 .4 1 1v2M8 7V4c0-.6.4-1 1-1s1 .4 1 1v3" fill="none" stroke="currentColor" strokeWidth="1.5" />,
  <circle key="broccoli1" cx="16" cy="8" r="3" />,
  <circle key="broccoli2" cx="19" cy="11" r="2.5" />,
  <circle key="broccoli3" cx="14" cy="12" r="2.5" />,
  <path key="stem" d="M16 14v6c0 .6.4 1 1 1s1-.4 1-1v-6" />,
]);

// Protein - Steak/meat
const proteinIcon = createFilledIcon([
  <path key="steak" d="M4 10c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6v4c0 3.3-2.7 6-6 6h-4c-3.3 0-6-2.7-6-6v-4Z" />,
  <path key="marbling" d="M8 10c.5-.5 1.5-.5 2 0s1.5.5 2 0M12 14c.5-.5 1.5-.5 2 0s1.5.5 2 0" fill="none" stroke="var(--icon-bg, #18181b)" strokeWidth="1.5" strokeLinecap="round" />,
]);

// Make bed - Bed with person (Based on Gemini make_bed reference)
const makeBedIcon = createFilledIcon([
  <path key="mattress" d="M2 14c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v4c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1v-4Z" />,
  <path key="pillow1" d="M4 9c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v3H4V9Z" />,
  <path key="pillow2" d="M12 9c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v3h-8V9Z" />,
  <path key="legs" d="M4 19v2M20 19v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
]);

// Social media - Thumbs up + chat (Based on Gemini social_media reference)
const socialMediaIcon = createFilledIcon([
  <path key="chat" d="M3 6c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H8l-3 3v-3H5c-1.1 0-2-.9-2-2V6Z" />,
  <path key="thumb" d="M17 10h2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2v-3l2-4c.2-.3.5-.5.9-.5h.6c.8 0 1.5.7 1.5 1.5V10Z" />,
  <path key="like-inside" d="M7 8l1.5 1.5L11 7" fill="none" stroke="var(--icon-bg, #18181b)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
]);

// Active - Person with barbell (Based on Gemini se_exercitar reference)
const activeIcon = createFilledIcon([
  <circle key="head" cx="12" cy="3.5" r="2" />,
  <rect key="left-weight" x="2" y="7" width="3" height="5" rx="1" />,
  <rect key="right-weight" x="19" y="7" width="3" height="5" rx="1" />,
  <rect key="bar" x="5" y="8.5" width="14" height="2" rx="0.5" />,
  <path key="body" d="M10 12h4c.6 0 1 .4 1 1v4c0 .6-.4 1-1 1h-4c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1Z" />,
  <path key="legs" d="M10 18v3c0 .6.4 1 1 1s1-.4 1-1v-3M14 18v3c0 .6-.4 1-1 1s-1-.4-1-1v-3" />,
]);

// Burn energy - Dumbbell (Based on Gemini burn_energy reference)
const burnEnergyIcon = createFilledIcon([
  <rect key="left-outer" x="2" y="9" width="2" height="6" rx="1" />,
  <rect key="left-inner" x="4" y="7" width="3" height="10" rx="1" />,
  <rect key="bar" x="7" y="10" width="10" height="4" rx="1" />,
  <rect key="right-inner" x="17" y="7" width="3" height="10" rx="1" />,
  <rect key="right-outer" x="20" y="9" width="2" height="6" rx="1" />,
]);

// No fast food - Hamburger with slash
const noFastFoodIcon = createProhibitionIcon([
  <path key="bun-top" d="M4 10c0-3.3 2.7-5 8-5s8 1.7 8 5H4Z" />,
  <rect key="patty" x="4" y="11" width="16" height="3" rx="0.5" />,
  <path key="bun-bottom" d="M4 15h16v2c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-2Z" />,
]);

// No screens - Monitor with slash
const noScreensIcon = createProhibitionIcon([
  <rect key="screen" x="3" y="4" width="18" height="12" rx="2" />,
  <path key="stand" d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
]);

// No smoke - Cigarette with slash
const noSmokeIcon = createProhibitionIcon([
  <rect key="cig" x="2" y="10" width="14" height="4" rx="1" />,
  <rect key="filter" x="2" y="10" width="4" height="4" rx="1" fill="var(--icon-bg, #18181b)" stroke="currentColor" strokeWidth="1" />,
  <path key="smoke1" d="M18 8c0-2 2-2 2-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  <path key="smoke2" d="M21 8c0-2 2-2 2-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
]);

// No alcohol - Wine glass with slash
const noAlcoholIcon = createProhibitionIcon([
  <path key="glass" d="M8 3h8l-1 7c-.2 1.7-1.6 3-3.3 3h-1.4c-1.7 0-3.1-1.3-3.3-3L8 3Z" />,
  <path key="stem" d="M12 13v5M9 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
]);

// No sugar - Sugar cube with slash
const noSugarIcon = createProhibitionIcon([
  <rect key="cube" x="5" y="5" width="14" height="14" rx="2" />,
  <path key="lines" d="M8 9h2M8 12h4M8 15h2" stroke="var(--icon-bg, #18181b)" strokeWidth="1.5" strokeLinecap="round" />,
]);

// No procrastination - Clock with slash
const noProcrastinationIcon = createProhibitionIcon([
  <circle key="clock" cx="12" cy="12" r="9" />,
  <path key="hands" d="M12 7v5l3 3" stroke="var(--icon-bg, #18181b)" strokeWidth="2" strokeLinecap="round" />,
]);

// No skip meals - Utensils with slash
const noSkipMealsIcon = createProhibitionIcon([
  <path key="fork" d="M7 3v5c0 1.7 1.3 3 3 3v9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />,
  <path key="fork-prongs" d="M5 3v4M7 3v4M9 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  <path key="knife" d="M17 3v17M17 3c2 0 3 2 3 5s-1 4-3 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />,
]);

// No late sleep - Moon with slash
const noLateSleepIcon = createProhibitionIcon([
  <path key="moon" d="M12 3c-4.4 0-8 3.6-8 8s3.6 8 8 8c1.8 0 3.5-.6 4.9-1.6-4.3-.8-7.4-4.6-7.4-9 0-1.8.5-3.5 1.4-4.9C10.3 3.2 11.1 3 12 3Z" />,
]);

// ============================================
// EXPORTED ICONS MAP
// ============================================

export const HabitIcons: Record<HabitIconKey, (props: IconProps) => JSX.Element> = {
  // Custom filled icons (professional design)
  run: runIcon,
  cycle: cycleIcon,
  swim: swimIcon,
  stairs: stairsIcon,
  meditate: meditateIcon,
  journal: journalIcon,
  deep_work: deepWorkIcon,
  detox: detoxIcon,
  activity_rings: activityRingsIcon,
  stand_hours: standHoursIcon,
  stretch: stretchIcon,
  yoga: yogaIcon,
  strength: strengthIcon,
  fruits: fruitsIcon,
  vegetables: vegetablesIcon,
  protein: proteinIcon,
  make_bed: makeBedIcon,
  social_media: socialMediaIcon,
  active: activeIcon,
  burn_energy: burnEnergyIcon,

  // Prohibition icons (custom base + slash)
  no_fast_food: noFastFoodIcon,
  no_screens: noScreensIcon,
  no_smoke: noSmokeIcon,
  no_alcohol: noAlcoholIcon,
  no_sugar: noSugarIcon,
  no_procrastination: noProcrastinationIcon,
  no_skip_meals: noSkipMealsIcon,
  no_late_sleep: noLateSleepIcon,

  // Lucide-based icons (wrapped for consistency)
  gratitude: wrapLucideIcon(Sparkles),
  meal: wrapLucideIcon(Utensils),
  water: wrapLucideIcon(Droplets),
  sleep: wrapLucideIcon(Moon),
  plan: wrapLucideIcon(ClipboardCheck),
  call_family: wrapLucideIcon(Phone),
  heart: wrapLucideIcon(Heart),
  exercise_minutes: wrapLucideIcon(Timer),
  book: wrapLucideIcon(BookOpen),
  study: wrapLucideIcon(GraduationCap),
  organize: wrapLucideIcon(LayoutGrid),
  checklist: wrapLucideIcon(ListChecks),
  target: wrapLucideIcon(Target),
  vitamins: wrapLucideIcon(Pill),
  clock: wrapLucideIcon(Clock),
  bed: wrapLucideIcon(Bed),
  family: wrapLucideIcon(Users),
  focus: wrapLucideIcon(Focus),
  pause: wrapLucideIcon(Pause),
  ban: wrapLucideIcon(Ban),
  sunrise: wrapLucideIcon(Sunrise),
  review: wrapLucideIcon(FileCheck),
  leisure: wrapLucideIcon(Armchair),
  alarm: wrapLucideIcon(AlarmClock),
  breakfast: wrapLucideIcon(Coffee),
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

// Ícone padrão quando nenhum é encontrado
export const DEFAULT_HABIT_ICON: HabitIconKey = "activity_rings";

export const getHabitIcon = (key?: HabitIconKey | null) => {
  if (!key) return null;
  return HabitIcons[key] ?? null;
};

// Função que considera categoria como fallback
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

  // Prioridade 3: ícone padrão
  return HabitIcons[DEFAULT_HABIT_ICON];
};
