import { SVGProps } from "react";
import {
  Footprints,
  Dumbbell,
  TrendingUp,
  CheckCircle2,
  Trophy,
  Flame,
  Calendar,
  Medal,
  Gem,
  Star,
  Award,
  Sun,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type AchievementIconKey =
  | "first_habit"
  | "habit_10"
  | "habit_50"
  | "habit_100"
  | "habit_500"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "streak_100"
  | "streak_365"
  | "level_5"
  | "level_7"
  | "level_10"
  | "perfect_week"
  | "early_bird";

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
// EXPORTED ICONS MAP
// ============================================

export const AchievementIcons: Record<AchievementIconKey, (props: IconProps) => JSX.Element> = {
  // ========== HABITS (5) ==========
  first_habit: wrapLucideIcon(Footprints),
  habit_10: wrapLucideIcon(Dumbbell),
  habit_50: wrapLucideIcon(TrendingUp),
  habit_100: wrapLucideIcon(CheckCircle2),
  habit_500: wrapLucideIcon(Trophy),

  // ========== STREAKS (5) ==========
  streak_3: wrapLucideIcon(Flame),
  streak_7: wrapLucideIcon(Calendar),
  streak_30: wrapLucideIcon(Flame),
  streak_100: wrapLucideIcon(Gem),
  streak_365: wrapLucideIcon(Star),

  // ========== LEVELS (3) ==========
  level_5: wrapLucideIcon(Award),
  level_7: wrapLucideIcon(Medal),
  level_10: wrapLucideIcon(Gem),

  // ========== SPECIAL (2) ==========
  perfect_week: wrapLucideIcon(Star),
  early_bird: wrapLucideIcon(Sun),
};

export const DEFAULT_ACHIEVEMENT_ICON: AchievementIconKey = "first_habit";

export const getAchievementIcon = (key?: AchievementIconKey | null) => {
  if (!key) return null;
  return AchievementIcons[key] ?? null;
};
