import { motion } from "motion/react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getHabitIconWithFallback } from "@/components/icons/HabitIcons";
import { cn } from "@/lib/utils";

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
}

interface DashboardHabitCardProps {
  habit: Habit;
  progress: number; // 0-100
  completed: boolean;
  onToggle: () => void;
  streakDays?: number;
  className?: string;
}

// Progress ring constants - defined outside to avoid recalculation
const RING_SIZE = 116;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Mini ring constants for streak badge
const MINI_RING_RADIUS = 11;
const MINI_RING_CIRCUMFERENCE = 2 * Math.PI * MINI_RING_RADIUS;

const DashboardHabitCardComponent = ({
  habit,
  progress,
  completed,
  onToggle,
  streakDays,
  className,
}: DashboardHabitCardProps) => {
  const Icon = useMemo(() => getHabitIconWithFallback(habit.icon_key, habit.category), [habit.icon_key, habit.category]);

  // Memoized progress offset calculation
  const offset = useMemo(() => CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE, [progress]);
  const miniOffset = useMemo(() => MINI_RING_CIRCUMFERENCE - (progress / 100) * MINI_RING_CIRCUMFERENCE, [progress]);

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(completed);

  useEffect(() => {
    if (completed && !wasCompleted) {
      setShowCelebration(true);
      if ("vibrate" in navigator) {
        navigator.vibrate([15, 50, 25]);
      }
      const timer = setTimeout(() => setShowCelebration(false), 600);
      return () => clearTimeout(timer);
    } else if (!completed && wasCompleted) {
      if ("vibrate" in navigator) {
        navigator.vibrate(10);
      }
    }
    setWasCompleted(completed);
  }, [completed, wasCompleted]);

  const handleClick = useCallback(() => {
    onToggle();
  }, [onToggle]);

  return (
    <motion.button
      id={`habit-card-${habit.id}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={cn(
        "relative w-full aspect-square flex flex-col items-center justify-center gap-2 p-2",
        // Light mode: card with subtle border
        "bg-card rounded-3xl border border-border/60",
        // Dark mode: transparent background
        "dark:bg-transparent dark:border-transparent",
        "text-foreground",
        "focus-visible:outline-none focus-visible:ring-0",
        "transition-all duration-200",
        className
      )}
      type="button"
      aria-label={`${completed ? 'Desmarcar' : 'Marcar'} hábito ${habit.name}`}
      aria-pressed={completed}
    >
      {/* Glow effect on completion */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.1, 1.2] }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-3xl pointer-events-none bg-primary/30"
        />
      )}

      {/* Streak Badge - Top Right Corner */}
      {streakDays !== undefined && streakDays > 0 && (
        <div className="absolute top-2.5 right-2.5 flex items-center justify-center">
          <div className="relative">
            {/* Mini progress ring around streak */}
            <svg width={28} height={28} className="transform -rotate-90">
              <circle
                cx={14}
                cy={14}
                r={MINI_RING_RADIUS}
                className="stroke-primary/20"
                strokeWidth={2}
                fill="transparent"
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
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">
              {streakDays}
            </span>
          </div>
        </div>
      )}

      {/* Main Progress Ring with Icon Inside */}
      <div className="relative mb-1 w-[116px] h-[116px]">
        {/* Progress Ring SVG */}
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          className="transform -rotate-90 absolute inset-0"
        >
          {/* Background circle */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            className="stroke-primary/10 dark:stroke-primary/15"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
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
            strokeLinecap="round"
          />
        </svg>

        {/* Icon Container - Centered inside ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className={cn(
              "flex items-center justify-center rounded-full w-14 h-14",
              completed
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary dark:bg-primary/15"
            )}
            animate={showCelebration ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Icon
              width={30}
              height={30}
              strokeWidth={2.5}
            />
          </motion.div>
        </div>
      </div>

      {/* Habit Name */}
      <h3 className="text-[10px] font-semibold text-center leading-tight line-clamp-2 px-1 tracking-wide text-foreground">
        {habit.name.toUpperCase()}
      </h3>
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
    prevProps.habit.icon_key === nextProps.habit.icon_key &&
    prevProps.habit.name === nextProps.habit.name
  );
});

export default DashboardHabitCard;
