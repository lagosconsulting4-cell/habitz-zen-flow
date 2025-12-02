import { SVGProps } from "react";
import {
  // Lucide icons - importing directly
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
  // New Lucide icons for replacements
  Bike,
  TrendingUp,
  Headphones,
  Leaf,
  Activity,
  PersonStanding,
  Apple,
  Carrot,
  Beef,
  Flame,
  Share2,
  // Prohibition base icons
  Monitor,
  Wine,
  Candy,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

// Tabler icons - physical activities
import {
  IconRun,
  IconSwimming,
  IconYoga,
  IconStretching,
  IconBarbell,
  IconBurger,
  IconSmoking,
} from "@tabler/icons-react";

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

// ============================================
// LUCIDE WRAPPER (for consistency)
// ============================================

const wrapLucideIcon = (LucideComponent: LucideIcon) => (props: IconProps) => (
  <LucideComponent
    strokeWidth={2}
    fill="none"
    stroke="currentColor"
    {...props}
  />
);

// ============================================
// TABLER WRAPPER (for consistency)
// ============================================

const wrapTablerIcon = (TablerComponent: React.FC<any>) => (props: IconProps) => (
  <TablerComponent
    stroke={2}
    fill="none"
    color="currentColor"
    {...props}
  />
);

// ============================================
// EXPORTED ICONS MAP
// ============================================

export const HabitIcons: Record<HabitIconKey, (props: IconProps) => JSX.Element> = {
  // ==========================================
  // TABLER ICONS (8) - Physical activities + Prohibition
  // ==========================================
  run: wrapTablerIcon(IconRun),
  swim: wrapTablerIcon(IconSwimming),
  meditate: wrapTablerIcon(IconYoga),
  stretch: wrapTablerIcon(IconStretching),
  yoga: wrapTablerIcon(IconYoga),
  active: wrapTablerIcon(IconBarbell),
  no_fast_food: wrapTablerIcon(IconBurger),
  no_smoke: wrapTablerIcon(IconSmoking),

  // ==========================================
  // LUCIDE ICONS - Direct replacements (14)
  // ==========================================
  cycle: wrapLucideIcon(Bike),
  stairs: wrapLucideIcon(TrendingUp),
  journal: wrapLucideIcon(BookOpen),
  deep_work: wrapLucideIcon(Headphones),
  detox: wrapLucideIcon(Leaf),
  activity_rings: wrapLucideIcon(Activity),
  stand_hours: wrapLucideIcon(PersonStanding),
  strength: wrapLucideIcon(Dumbbell),
  fruits: wrapLucideIcon(Apple),
  vegetables: wrapLucideIcon(Carrot),
  protein: wrapLucideIcon(Beef),
  make_bed: wrapLucideIcon(Bed),
  social_media: wrapLucideIcon(Share2),
  burn_energy: wrapLucideIcon(Flame),

  // ==========================================
  // PROHIBITION ICONS (6) - Just base icon, NO slash
  // ==========================================
  no_screens: wrapLucideIcon(Monitor),
  no_alcohol: wrapLucideIcon(Wine),
  no_sugar: wrapLucideIcon(Candy),
  no_procrastination: wrapLucideIcon(Clock),
  no_skip_meals: wrapLucideIcon(UtensilsCrossed),
  no_late_sleep: wrapLucideIcon(Moon),

  // ==========================================
  // LUCIDE ICONS - Original (18)
  // ==========================================
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
