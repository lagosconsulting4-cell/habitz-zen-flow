/**
 * JourneyIllustration — Resolves illustration_key to branded icon composition
 * Will be replaced by custom SVG illustrations from Supabase Storage in Phase 4.
 *
 * Also exports getJourneyTheme() — the single source of truth for journey theming.
 */

import {
  Smartphone, Sunrise, Dumbbell, Brain, Wallet, Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// Theme System
// ============================================

export interface JourneyTheme {
  /** Primary icon component for this journey */
  icon: React.ComponentType<{ className?: string }>;
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
}

const THEMES: Record<string, JourneyTheme> = {
  "digital-detox": {
    icon: Smartphone,
    color: "#8B5CF6",
    textClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
    borderClass: "border-violet-500/30",
    gradientClass: "from-violet-500/20 to-purple-600/20 text-violet-400",
    label: "Detox",
  },
  "own-mornings": {
    icon: Sunrise,
    color: "#F59E0B",
    textClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    gradientClass: "from-amber-500/20 to-orange-600/20 text-amber-400",
    label: "Manhãs",
  },
  "gym": {
    icon: Dumbbell,
    color: "#EF4444",
    textClass: "text-red-500",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
    gradientClass: "from-red-500/20 to-rose-600/20 text-red-400",
    label: "Gym",
  },
  "focus-protocol": {
    icon: Brain,
    color: "#3B82F6",
    textClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    gradientClass: "from-blue-500/20 to-cyan-600/20 text-blue-400",
    label: "Foco",
  },
  "finances": {
    icon: Wallet,
    color: "#10B981",
    textClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    gradientClass: "from-emerald-500/20 to-green-600/20 text-emerald-400",
    label: "Finanças",
  },
};

const DEFAULT_THEME: JourneyTheme = {
  icon: Compass,
  color: "#A3E635",
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

const primaryIconSizes = { sm: "w-[18px] h-[18px]", md: "w-7 h-7", lg: "w-10 h-10" };

export const JourneyIllustration = ({
  illustrationKey,
  size = "md",
  className,
}: JourneyIllustrationProps) => {
  const theme = getJourneyTheme(illustrationKey);
  const Icon = theme.icon;

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
        background: `linear-gradient(135deg, ${theme.color}33, ${theme.color}1A)`,
        boxShadow: `0 0 20px ${theme.color}1A, inset 0 1px 0 rgba(255,255,255,0.1)`,
        border: `1px solid ${theme.color}33`,
      }}
    >
      {/* Top-down light gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
      {/* Primary icon */}
      <Icon className={cn(primaryIconSizes[size], "relative z-10")} style={{ color: theme.color }} />
    </div>
  );
};

/** @deprecated Use getJourneyTheme(key).gradientClass instead */
export const getJourneyThemeColor = (illustrationKey: string): string => {
  return getJourneyTheme(illustrationKey).gradientClass;
};

export default JourneyIllustration;
