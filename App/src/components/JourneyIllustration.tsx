/**
 * JourneyIllustration — Resolves illustration_key to branded icon composition
 * Will be replaced by custom SVG illustrations from Supabase Storage in Phase 4.
 *
 * Also exports getJourneyTheme() — the single source of truth for journey theming.
 */

import {
  Smartphone, Sunrise, Dumbbell, Brain, Wallet, Compass,
  ShieldOff, Clock, Flame, Target, TrendingUp, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// Theme System
// ============================================

export interface JourneyTheme {
  /** Primary icon component for this journey */
  icon: React.ComponentType<{ className?: string }>;
  /** Secondary accent icon — creates a branded dual-icon composition */
  secondaryIcon: React.ComponentType<{ className?: string }>;
  /** Hex color for inline styles (rings, borders, etc.) */
  color: string;
  /** Tailwind text color class */
  textClass: string;
  /** Tailwind bg color class (10% opacity for backgrounds) */
  bgClass: string;
  /** Tailwind border color class */
  borderClass: string;
  /** Gradient classes for illustration backgrounds */
  gradientClass: string;
  /** Short display name for badges */
  label: string;
  /** Secondary accent color hex for gradients */
  accentColor: string;
  /** Emoji decorative glyph for visual personality */
  decorGlyph: string;
  /** CSS radial-gradient for ambient texture */
  ambientPattern: string;
  /** CSS radial glow for card headers */
  headerGlow: string;
}

const THEMES: Record<string, JourneyTheme> = {
  "digital-detox": {
    icon: Smartphone,
    secondaryIcon: ShieldOff,
    color: "#8B5CF6",
    accentColor: "#7C3AED",
    decorGlyph: "📵",
    ambientPattern: "radial-gradient(ellipse at 10% 90%, #8B5CF61A 0%, transparent 50%), radial-gradient(ellipse at 90% 10%, #7C3AED15 0%, transparent 50%)",
    headerGlow: "radial-gradient(ellipse at top, #8B5CF60D 0%, transparent 70%)",
    textClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
    borderClass: "border-violet-500/30",
    gradientClass: "from-violet-500/20 to-purple-600/20 text-violet-400",
    label: "Detox",
  },
  "own-mornings": {
    icon: Sunrise,
    secondaryIcon: Clock,
    color: "#F59E0B",
    accentColor: "#D97706",
    decorGlyph: "🌅",
    ambientPattern: "radial-gradient(ellipse at 15% 20%, #F59E0B1A 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #D9770615 0%, transparent 50%)",
    headerGlow: "radial-gradient(ellipse at top, #F59E0B0D 0%, transparent 70%)",
    textClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    gradientClass: "from-amber-500/20 to-orange-600/20 text-amber-400",
    label: "Manhãs",
  },
  "gym": {
    icon: Dumbbell,
    secondaryIcon: Flame,
    color: "#EF4444",
    accentColor: "#DC2626",
    decorGlyph: "💪",
    ambientPattern: "radial-gradient(ellipse at 50% 100%, #EF44441A 0%, transparent 50%), radial-gradient(ellipse at 50% 0%, #DC262615 0%, transparent 40%)",
    headerGlow: "radial-gradient(ellipse at top, #EF44440D 0%, transparent 70%)",
    textClass: "text-red-500",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
    gradientClass: "from-red-500/20 to-rose-600/20 text-red-400",
    label: "Gym",
  },
  "focus-protocol": {
    icon: Brain,
    secondaryIcon: Target,
    color: "#3B82F6",
    accentColor: "#2563EB",
    decorGlyph: "🧠",
    ambientPattern: "radial-gradient(ellipse at 50% 50%, #3B82F61A 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #2563EB15 0%, transparent 40%)",
    headerGlow: "radial-gradient(ellipse at top, #3B82F60D 0%, transparent 70%)",
    textClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    gradientClass: "from-blue-500/20 to-cyan-600/20 text-blue-400",
    label: "Foco",
  },
  "finances": {
    icon: Wallet,
    secondaryIcon: TrendingUp,
    color: "#10B981",
    accentColor: "#059669",
    decorGlyph: "📈",
    ambientPattern: "radial-gradient(ellipse at 80% 80%, #10B9811A 0%, transparent 50%), radial-gradient(ellipse at 20% 20%, #05966915 0%, transparent 40%)",
    headerGlow: "radial-gradient(ellipse at top, #10B9810D 0%, transparent 70%)",
    textClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    gradientClass: "from-emerald-500/20 to-green-600/20 text-emerald-400",
    label: "Finanças",
  },
};

const DEFAULT_THEME: JourneyTheme = {
  icon: Compass,
  secondaryIcon: Sparkles,
  color: "#A3E635",
  accentColor: "#84CC16",
  decorGlyph: "🧭",
  ambientPattern: "radial-gradient(ellipse at 50% 50%, #A3E6351A 0%, transparent 50%)",
  headerGlow: "radial-gradient(ellipse at top, #A3E6350D 0%, transparent 70%)",
  textClass: "text-primary",
  bgClass: "bg-primary/10",
  borderClass: "border-primary/30",
  gradientClass: "from-gray-500/20 to-gray-600/20 text-gray-400",
  label: "Jornada",
};

/**
 * Get the complete theme object for a journey.
 * Single source of truth — use this everywhere instead of hardcoding colors.
 */
export const getJourneyTheme = (themeSlug: string | undefined | null): JourneyTheme => {
  if (!themeSlug) return DEFAULT_THEME;
  return THEMES[themeSlug] || DEFAULT_THEME;
};

// ============================================
// Component
// ============================================

interface JourneyIllustrationProps {
  illustrationKey: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Size configs for the dual-icon composition
const primaryIconSizes = { sm: "w-[18px] h-[18px]", md: "w-7 h-7", lg: "w-10 h-10" };
const secondaryIconSizes = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };
const secondaryPositions = { sm: "bottom-1 right-1", md: "bottom-1.5 right-1.5", lg: "bottom-2 right-2" };
const secondaryOpacity = { sm: 0.4, md: 0.45, lg: 0.4 };
const glyphSizes = { sm: "text-[10px]", md: "text-xl", lg: "text-3xl" };
const glyphPositions = { sm: "top-0.5 right-0.5", md: "bottom-0.5 right-1", lg: "bottom-0.5 right-1" };
const glyphOpacity = { sm: 0.15, md: 0.25, lg: 0.25 };

export const JourneyIllustration = ({
  illustrationKey,
  size = "md",
  className,
}: JourneyIllustrationProps) => {
  const theme = getJourneyTheme(illustrationKey);
  const Icon = theme.icon;
  const SecondaryIcon = theme.secondaryIcon;

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div
      className={cn(
        "rounded-2xl flex items-center justify-center relative overflow-hidden",
        sizeClasses[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${theme.color}33, ${theme.accentColor}1A)`,
        boxShadow: `0 0 20px ${theme.color}1A, inset 0 1px 0 rgba(255,255,255,0.1)`,
        border: `1px solid ${theme.color}33`,
      }}
    >
      {/* Ambient pattern layer */}
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: theme.ambientPattern }}
      />
      {/* Top-down light gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
      {/* Primary icon */}
      <Icon className={cn(primaryIconSizes[size], "relative z-10")} style={{ color: theme.color }} />
      {/* Secondary accent icon — positioned bottom-right for branded composition */}
      <SecondaryIcon
        className={cn(secondaryIconSizes[size], "absolute z-10", secondaryPositions[size])}
        style={{ color: theme.accentColor, opacity: secondaryOpacity[size] }}
      />
      {/* Decorative glyph — visible at all sizes */}
      <span
        className={cn(
          "absolute select-none pointer-events-none",
          glyphSizes[size],
          glyphPositions[size]
        )}
        style={{ opacity: glyphOpacity[size] }}
        aria-hidden="true"
      >
        {theme.decorGlyph}
      </span>
    </div>
  );
};

/** @deprecated Use getJourneyTheme(key).gradientClass instead */
export const getJourneyThemeColor = (illustrationKey: string): string => {
  return getJourneyTheme(illustrationKey).gradientClass;
};

export default JourneyIllustration;
