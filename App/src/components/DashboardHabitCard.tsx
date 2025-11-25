import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
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

export const DashboardHabitCard = ({
  habit,
  progress,
  completed,
  onToggle,
  streakDays,
  className,
}: DashboardHabitCardProps) => {
  const Icon = getHabitIconWithFallback(habit.icon_key, habit.category);

  // Progress ring dimensions - GRANDE como na referência
  const ringSize = 90;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

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

  const limeGreen = "#A3E635";
  const iconColor = completed ? "#0F172A" : limeGreen;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={cn(
        "relative w-full aspect-square rounded-[24px] p-3 flex flex-col items-center justify-center",
        "bg-[#141414] border border-white/[0.03]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400",
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
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${limeGreen}40 0%, transparent 70%)`,
          }}
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
                r={11}
                stroke="rgba(163, 230, 53, 0.2)"
                strokeWidth={2}
                fill="transparent"
              />
              <circle
                cx={14}
                cy={14}
                r={11}
                stroke={limeGreen}
                strokeWidth={2}
                fill="transparent"
                strokeDasharray={2 * Math.PI * 11}
                strokeDashoffset={2 * Math.PI * 11 - (progress / 100) * 2 * Math.PI * 11}
                strokeLinecap="round"
                style={{
                  filter: progress > 0 ? `drop-shadow(0 0 3px ${limeGreen}60)` : 'none'
                }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
              {streakDays}
            </span>
          </div>
        </div>
      )}

      {/* Main Progress Ring with Icon Inside */}
      <div className="relative mb-2 w-[90px] h-[90px]">
        {/* Progress Ring SVG */}
        <svg
          width={ringSize}
          height={ringSize}
          className="transform -rotate-90 absolute inset-0"
        >
          {/* Background circle */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="rgba(163, 230, 53, 0.12)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke={limeGreen}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            strokeLinecap="round"
            style={{
              filter: progress > 0 ? `drop-shadow(0 0 8px ${limeGreen}60)` : 'none'
            }}
          />
        </svg>

        {/* Icon Container - Centered inside ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className={cn(
              "flex items-center justify-center rounded-xl w-12 h-12",
              completed ? "bg-lime-400" : "bg-white/[0.08]"
            )}
            animate={showCelebration ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Icon
              width={28}
              height={28}
              strokeWidth={2.5}
              style={{ color: iconColor }}
            />
          </motion.div>
        </div>
      </div>

      {/* Habit Name */}
      <h3 className="text-[10px] font-semibold text-white text-center leading-tight line-clamp-2 px-1 tracking-wide">
        {habit.name.toUpperCase()}
      </h3>

      {/* Progress Percentage */}
      <p className="text-[9px] text-white/35 mt-0.5 font-medium">
        {Math.round(progress)} %
      </p>
    </motion.button>
  );
};

export default DashboardHabitCard;
