/**
 * JourneyBadge — Small indicator on habit cards showing journey membership
 * Uses journey theme color instead of generic primary.
 */

import { cn } from "@/lib/utils";
import { getJourneyTheme } from "@/components/JourneyIllustration";

interface JourneyBadgeProps {
  themeSlug?: string | null;
  className?: string;
}

export const JourneyBadge = ({ themeSlug, className }: JourneyBadgeProps) => {
  const theme = getJourneyTheme(themeSlug);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full",
        "text-[9px] font-semibold",
        theme.bgClass,
        theme.textClass,
        className
      )}
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          backgroundColor: theme.color,
          boxShadow: `0 0 4px ${theme.color}66`,
        }}
      />
      {theme.label}
    </span>
  );
};

export default JourneyBadge;
