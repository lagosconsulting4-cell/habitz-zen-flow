import { motion } from "motion/react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitGlyph } from "@/components/icons/HabitGlyph";

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  icon_key?: string | null;
  color?: string | null;
  streak: number;
  is_favorite?: boolean;
  category?: string;
  goal_value?: number | null;
  unit?: string | null;
  times_per_day?: number | null;
  source?: string | null;
  frequency_type?: string | null;
  reminder_time?: string | null;
}

interface DashboardHabitCardProps {
  habit: Habit;
  progress: number; // 0-100
  completed: boolean;
  onToggle: () => void;
  streakDays?: number;
  className?: string;
  isTimedHabit?: boolean;
  onTimerClick?: () => void;
  completionCount?: number;
  timesPerDay?: number;
  journeyThemeSlug?: string | null;
}

// Progress ring constants - defined outside to avoid recalculation
const RING_SIZE = 116;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Mini ring constants for streak badge
const MINI_RING_RADIUS = 11;
const MINI_RING_CIRCUMFERENCE = 2 * Math.PI * MINI_RING_RADIUS;

// Dash pattern for journey habit rings (segmented look)
const DASH_LENGTH = 14;
const DASH_GAP = 5;
const MINI_DASH_LENGTH = 4;
const MINI_DASH_GAP = 2;

const DashboardHabitCardComponent = ({
  habit,
  progress,
  completed,
  onToggle,
  streakDays,
  className,
  isTimedHabit,
  onTimerClick,
  completionCount = 0,
  timesPerDay = 1,
  journeyThemeSlug,
}: DashboardHabitCardProps) => {
  const isJourney = !!journeyThemeSlug;

  // Memoized progress offset calculation
  const offset = useMemo(() => CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE, [progress]);
  const miniOffset = useMemo(() => MINI_RING_CIRCUMFERENCE - (progress / 100) * MINI_RING_CIRCUMFERENCE, [progress]);

  // Track completion changes for haptic feedback
  const [prevProgress, setPrevProgress] = useState(progress);

  useEffect(() => {
    if (progress !== prevProgress) {
      if (progress >= 100 && prevProgress < 100) {
        // Fully completed - triple haptic
        if ("vibrate" in navigator) {
          navigator.vibrate([15, 50, 25]);
        }
      } else if (progress > prevProgress) {
        // Incremented - light haptic
        if ("vibrate" in navigator) {
          navigator.vibrate(10);
        }
      } else if (progress < prevProgress) {
        // Decremented - light haptic
        if ("vibrate" in navigator) {
          navigator.vibrate(10);
        }
      }
      setPrevProgress(progress);
    }
  }, [progress, prevProgress]);

  const handleClick = useCallback(() => {
    onToggle();
  }, [onToggle]);

  const showCounter = timesPerDay > 1;

  return (
    <motion.button
      id={`habit-card-${habit.id}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2",
        // Layout circular puro - sem fundo retangular (estilo Streaks)
        "bg-transparent",
        "text-foreground",
        "focus-visible:outline-none focus-visible:ring-0",
        "transition-all duration-200",
        className
      )}
      type="button"
      aria-label={`${completed ? 'Desmarcar' : 'Marcar'} hábito ${habit.name}${showCounter ? ` (${completionCount}/${timesPerDay})` : ''}`}
      aria-pressed={completed}
    >
      {/* Main Progress Ring with Icon Inside */}
      <div className="relative mb-1 w-[116px] h-[116px] mx-auto">
        {/* Streak Badge - Inside ring container, z-20 to stay above fill */}
        {streakDays !== undefined && streakDays > 0 && (
          <div className="absolute -top-1 -right-1 z-20 flex items-center justify-center">
            <div className="relative bg-background rounded-full">
              {/* Mini progress ring around streak */}
              <svg width={28} height={28} className="transform -rotate-90">
                {isJourney && (
                  <defs>
                    <mask id={`mini-dash-mask-${habit.id}`}>
                      <circle
                        cx={14}
                        cy={14}
                        r={MINI_RING_RADIUS}
                        stroke="white"
                        strokeWidth={2}
                        fill="none"
                        strokeDasharray={`${MINI_DASH_LENGTH} ${MINI_DASH_GAP}`}
                      />
                    </mask>
                  </defs>
                )}
                <circle
                  cx={14}
                  cy={14}
                  r={MINI_RING_RADIUS}
                  className="stroke-primary/30"
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray={isJourney ? `${MINI_DASH_LENGTH} ${MINI_DASH_GAP}` : undefined}
                />
                <circle
                  cx={14}
                  cy={14}
                  r={MINI_RING_RADIUS}
                  className="stroke-primary"
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray={MINI_RING_CIRCUMFERENCE}
                  strokeDashoffset={miniOffset}
                  strokeLinecap={isJourney ? undefined : "round"}
                  mask={isJourney ? `url(#mini-dash-mask-${habit.id})` : undefined}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">
                {streakDays}
              </span>
            </div>
          </div>
        )}
        {/* Progress Ring SVG */}
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          className="transform -rotate-90 absolute inset-0"
        >
          {isJourney && (
            <defs>
              <mask id={`dash-mask-${habit.id}`}>
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke="white"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeDasharray={`${DASH_LENGTH} ${DASH_GAP}`}
                />
              </mask>
            </defs>
          )}
          {/* Background circle */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            className="stroke-border dark:stroke-primary/50"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={isJourney ? `${DASH_LENGTH} ${DASH_GAP}` : undefined}
          />
          {/* Progress circle */}
          <motion.circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            className="stroke-primary"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            strokeLinecap={isJourney ? undefined : "round"}
            mask={isJourney ? `url(#dash-mask-${habit.id})` : undefined}
          />
        </svg>

        {/* Icon Container - Centered inside ring, fills to ring edge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={cn(
              "flex items-center justify-center rounded-full w-[104px] h-[104px] transition-colors duration-200",
              completed
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground dark:text-white/70"
            )}
          >
            <HabitGlyph
              iconKey={habit.icon_key}
              category={habit.category}
              size="2xl"
              tone="inherit"
              className="shrink-0"
            />
          </div>
        </div>

        {/* Play Button - Bottom left (for timed habits only) */}
        {isTimedHabit && habit.goal_value && habit.goal_value > 0 && !completed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTimerClick?.();
            }}
            className={cn(
              "absolute bottom-0 left-0 z-10",
              "flex items-center justify-center",
              "w-7 h-7 rounded-full",
              "bg-white dark:bg-black/80",
              "text-black dark:text-white",
              "shadow-sm border border-border/30",
              "transition-transform hover:scale-110 active:scale-95"
            )}
            aria-label="Iniciar timer"
            type="button"
          >
            <Play size={12} fill="currentColor" />
          </button>
        )}

        {/* Completion Counter Badge - Bottom right (only when times_per_day > 1) */}
        {showCounter && (
          <div className="absolute -bottom-1 -right-1 z-20 flex items-center justify-center">
            <div
              className={cn(
                "rounded-full px-1.5 py-0.5 border-2 min-w-[32px] text-center",
                completed
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-primary/60 text-foreground"
              )}
            >
              <span className="text-[10px] font-bold leading-none">
                {completionCount}/{timesPerDay}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Habit Name */}
      <h3 className="text-[10px] font-semibold text-center leading-tight line-clamp-2 px-1 tracking-wide text-foreground">
        {habit.name.toUpperCase()}
      </h3>
      {habit.frequency_type === "once" ? (
        <span className="mt-0.5 text-[8px] font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full">
          {habit.reminder_time ? habit.reminder_time : "Tarefa única"}
        </span>
      ) : habit.reminder_time ? (
        <span className="mt-0.5 text-[8px] text-muted-foreground">
          {habit.reminder_time}
        </span>
      ) : null}
    </motion.button>
  );
};

// Memoized component to prevent unnecessary re-renders
export const DashboardHabitCard = React.memo(DashboardHabitCardComponent, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these props change
  return (
    prevProps.habit.id === nextProps.habit.id &&
    prevProps.progress === nextProps.progress &&
    prevProps.completed === nextProps.completed &&
    prevProps.streakDays === nextProps.streakDays &&
    prevProps.completionCount === nextProps.completionCount &&
    prevProps.timesPerDay === nextProps.timesPerDay &&
    prevProps.habit.icon_key === nextProps.habit.icon_key &&
    prevProps.habit.name === nextProps.habit.name &&
    prevProps.habit.goal_value === nextProps.habit.goal_value &&
    prevProps.habit.source === nextProps.habit.source &&
    prevProps.habit.frequency_type === nextProps.habit.frequency_type &&
    prevProps.habit.reminder_time === nextProps.habit.reminder_time &&
    prevProps.isTimedHabit === nextProps.isTimedHabit &&
    prevProps.journeyThemeSlug === nextProps.journeyThemeSlug
  );
});

export default DashboardHabitCard;
