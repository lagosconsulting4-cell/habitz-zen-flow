import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { getHabitIcon } from "@/lib/habit-icons";
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

interface CircularHabitCardProps {
  habit: Habit;
  progress: number; // 0-100
  completed: boolean;
  onToggle: () => void;
  streakDays?: number;
  goalInfo?: string;
  isFavorite?: boolean;
  className?: string;
}

export const CircularHabitCard = ({
  habit,
  progress,
  completed,
  onToggle,
  streakDays,
  goalInfo,
  isFavorite,
  className
}: CircularHabitCardProps) => {
  const Icon = getHabitIcon(habit.icon_key);
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={cn("flex flex-col items-center gap-2 relative", className)}
      type="button"
    >
      {/* Favorite indicator */}
      {isFavorite && (
        <div className="absolute -top-2 -left-2 bg-white/80 rounded-full p-1 z-10">
          <Heart size={14} fill="#EF4444" color="#EF4444" />
        </div>
      )}

      {/* Streak badge */}
      {streakDays && streakDays > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="absolute -top-2 right-2 bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-bold text-white z-10"
        >
          {streakDays}
        </motion.div>
      )}

      {/* SVG Circular Progress */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-card"
          />

          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-white transition-all duration-300"
            initial={false}
            animate={{ strokeDashoffset: offset }}
          />
        </svg>

        {/* Inner filled circle when completed */}
        <motion.div
          initial={false}
          animate={{
            opacity: completed ? 1 : 0,
            scale: completed ? 1 : 0.8
          }}
          transition={{ duration: 0.2, delay: completed ? 0.1 : 0 }}
          className="absolute inset-0 m-2 bg-white/80 rounded-full"
        />

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {Icon ? (
            <Icon size={32} color="white" strokeWidth={2.5} />
          ) : (
            <span className="text-3xl">{habit.emoji}</span>
          )}
        </div>
      </div>

      {/* Habit name */}
      <div className="text-center max-w-[120px]">
        <p className="text-white font-bold text-xs uppercase tracking-wide leading-tight line-clamp-2">
          {habit.name}
        </p>
        {goalInfo && (
          <p className="text-white/70 text-[10px] font-medium mt-1">
            {goalInfo}
          </p>
        )}
      </div>
    </motion.button>
  );
};
