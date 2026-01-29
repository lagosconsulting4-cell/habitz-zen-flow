import { SVGProps } from "react";
import {
  Smile,
  Star,
  Glasses,
  Heart,
  Brain,
  Flame,
  Rocket,
  Trophy,
  Gem,
  Zap,
  Target,
  Crown,
  Sparkles,
  Wand2,
  Shield,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

export type AvatarIconKey =
  | "smile_basic"
  | "star_eyes"
  | "cool_shades"
  | "heart_eyes"
  | "thinking"
  | "fire_warrior"
  | "rocket_boost"
  | "trophy_winner"
  | "brain_power"
  | "diamond_flex"
  | "lightning_fast"
  | "target_locked"
  | "crown_royalty"
  | "unicorn_magic"
  | "dragon_master"
  | "ninja_stealth"
  | "wizard_sage"
  | "phoenix_rebirth"
  | "galaxy_brain"
  | "zen_master";

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

export const AvatarIcons: Record<AvatarIconKey, (props: IconProps) => JSX.Element> = {
  // ========== COMMON (5) ==========
  smile_basic: wrapLucideIcon(Smile),
  star_eyes: wrapLucideIcon(Star),
  cool_shades: wrapLucideIcon(Glasses),
  heart_eyes: wrapLucideIcon(Heart),
  thinking: wrapLucideIcon(Brain),

  // ========== RARE (7) ==========
  fire_warrior: wrapLucideIcon(Flame),
  rocket_boost: wrapLucideIcon(Rocket),
  trophy_winner: wrapLucideIcon(Trophy),
  brain_power: wrapLucideIcon(Brain),
  diamond_flex: wrapLucideIcon(Gem),
  lightning_fast: wrapLucideIcon(Zap),
  target_locked: wrapLucideIcon(Target),

  // ========== EPIC (5) ==========
  crown_royalty: wrapLucideIcon(Crown),
  unicorn_magic: wrapLucideIcon(Sparkles),
  dragon_master: wrapLucideIcon(Sparkles),
  ninja_stealth: wrapLucideIcon(Shield),
  wizard_sage: wrapLucideIcon(Wand2),

  // ========== LEGENDARY (3) ==========
  phoenix_rebirth: wrapLucideIcon(Flame),
  galaxy_brain: wrapLucideIcon(Sparkles),
  zen_master: wrapLucideIcon(Lightbulb),
};

export const DEFAULT_AVATAR_ICON: AvatarIconKey = "smile_basic";

export const getAvatarIcon = (key?: AvatarIconKey | null) => {
  if (!key) return null;
  return AvatarIcons[key] ?? null;
};
