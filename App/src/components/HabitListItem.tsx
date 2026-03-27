import { motion } from "motion/react";
import { Check, Play, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitGlyph } from "@/components/icons/HabitGlyph";
import type { Habit } from "@/components/DashboardHabitCard";

interface HabitListItemProps {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
  streakDays?: number;
  journeyTitle?: string;
  isTimedHabit?: boolean;
  onTimerClick?: () => void;
  /** Journey theme color hex — only set for journey habits */
  themeColor?: string;
}

const DEFAULT_COLOR = "#A3E635";

export function HabitListItem({
  habit,
  completed,
  onToggle,
  streakDays = 0,
  journeyTitle,
  isTimedHabit,
  onTimerClick,
  themeColor,
}: HabitListItemProps) {
  const isJourney = !!themeColor;
  const fillColor = themeColor || DEFAULT_COLOR;

  const handleClick = () => {
    if (isTimedHabit && !completed && onTimerClick) {
      onTimerClick();
    } else {
      onToggle();
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-3.5 p-4 rounded-2xl border transition-all duration-200 text-left",
        completed
          ? "border-transparent shadow-md"
          : "bg-card border-border/40 card-premium hover:border-border/60"
      )}
      style={
        completed
          ? {
              backgroundColor: fillColor,
              boxShadow: `0 4px 12px ${fillColor}20`,
            }
          : isJourney
            ? { borderLeftWidth: 3, borderLeftColor: themeColor }
            : undefined
      }
    >
      {/* Icon circle */}
      <div
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
          completed && "bg-white/15 dark:bg-black/10",
          !completed && "bg-muted/30 dark:bg-white/5"
        )}
      >
        <HabitGlyph
          iconKey={habit.icon_key}
          category={habit.category}
          size="lg"
          tone={completed ? "inherit" : isJourney ? "inherit" : "gray"}
          fallbackLabel={habit.emoji}
          className={completed ? "text-white dark:text-black" : undefined}
          style={completed ? undefined : isJourney ? { color: themeColor } : undefined}
        />
      </div>

      {/* Center: name + subtitle */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-semibold truncate",
            completed ? "text-white dark:text-black" : "text-foreground"
          )}
        >
          {habit.name}
        </p>
        {journeyTitle && (
          <p
            className={cn(
              "text-[10px] uppercase tracking-wider truncate mt-0.5",
              completed ? "text-white/60 dark:text-black/50" : "text-muted-foreground"
            )}
          >
            {journeyTitle}
          </p>
        )}
      </div>

      {/* Right side: streak + check/play */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Streak */}
        {streakDays > 0 && (
          <span
            className={cn(
              "flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap",
              completed ? "text-white/70 dark:text-black/60" : "text-muted-foreground"
            )}
          >
            <Flame className="w-3 h-3" />
            {streakDays} {streakDays === 1 ? "dia" : "dias"}
          </span>
        )}

        {/* Completion indicator */}
        {completed ? (
          <div className="w-7 h-7 rounded-full bg-white/20 dark:bg-black/15 flex items-center justify-center">
            <Check className="w-4 h-4 text-white dark:text-black/70" strokeWidth={3} />
          </div>
        ) : isTimedHabit ? (
          <div className="w-7 h-7 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center">
            <Play className="w-3 h-3 text-muted-foreground/40 ml-0.5" />
          </div>
        ) : null}
      </div>
    </motion.button>
  );
}
