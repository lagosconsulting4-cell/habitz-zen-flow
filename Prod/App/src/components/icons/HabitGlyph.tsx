import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { HabitIconKey, getHabitIconWithFallback } from "@/components/icons/HabitIcons";

const SIZE_CLASSES = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
} as const;

const TONE_CLASSES = {
  lime: "text-lime-500 dark:text-lime-300",
  gray: "text-muted-foreground dark:text-white/60",
  contrast: "text-foreground",
  inverse: "text-background",
  black: "text-black",
  white: "text-white",
  inherit: "",
} as const;

export type HabitGlyphSize = keyof typeof SIZE_CLASSES;
export type HabitGlyphTone = keyof typeof TONE_CLASSES;

interface HabitGlyphProps {
  iconKey?: HabitIconKey | string | null;
  category?: string | null;
  size?: HabitGlyphSize;
  tone?: HabitGlyphTone;
  className?: string;
  style?: CSSProperties;
  /** Emoji/text fallback when no SVG is available */
  fallbackLabel?: string;
}

export function HabitGlyph({
  iconKey,
  category,
  size = "md",
  tone = "contrast",
  className,
  style,
  fallbackLabel,
}: HabitGlyphProps) {
  const IconComponent = getHabitIconWithFallback(iconKey as HabitIconKey | null, category);

  if (!IconComponent) {
    if (fallbackLabel) {
      return (
        <span className={cn("text-base font-semibold", SIZE_CLASSES[size], className)} aria-hidden style={style}>
          {fallbackLabel}
        </span>
      );
    }
    return null;
  }

  return (
    <IconComponent
      className={cn(SIZE_CLASSES[size], TONE_CLASSES[tone], className)}
      aria-hidden="true"
      style={style}
    />
  );
}

export default HabitGlyph;
