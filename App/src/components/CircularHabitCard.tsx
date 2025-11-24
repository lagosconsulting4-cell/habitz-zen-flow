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
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Lime green from CreateHabit
  const limeGreen = "#A3E635";

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onToggle}
      className={cn("flex flex-col items-center gap-3 relative group", className)}
      type="button"
    >
      {/* Favorite indicator */}
      {isFavorite && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -left-2 bg-white rounded-full p-1.5 shadow-lg z-10"
        >
          <Heart size={16} fill="#EF4444" color="#EF4444" />
        </motion.div>
      )}

      {/* Streak badge - only show if > 0 */}
      {streakDays !== undefined && streakDays > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="absolute -top-1 -right-1 bg-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-extrabold text-card shadow-lg z-10 border-2 border-background"
        >
          {streakDays}
        </motion.div>
      )}

      {/* SVG Circular Progress */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 drop-shadow-lg"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2a2a2a"
            strokeWidth={strokeWidth}
            fill="transparent"
            opacity={0.3}
          />

          {/* Progress circle - Lime green */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={limeGreen}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
            initial={false}
            animate={{ strokeDashoffset: offset }}
          />
        </svg>

        {/* Inner filled circle when completed - lime green */}
        <motion.div
          initial={false}
          animate={{
            opacity: completed ? 1 : 0,
            scale: completed ? 1 : 0.85
          }}
          transition={{ duration: 0.3, delay: completed ? 0.15 : 0, type: "spring" }}
          className="absolute inset-0 m-2.5 rounded-full shadow-inner"
          style={{ backgroundColor: completed ? limeGreen : "transparent" }}
        />

        {/* Icon - lime green or black when completed */}
        <div className="absolute inset-0 flex items-center justify-center">
          {Icon ? (
            <motion.div
              animate={{
                scale: completed ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <Icon
                size={52}
                color={completed ? "#000000" : limeGreen}
                strokeWidth={2.5}
                className="drop-shadow-lg"
              />
            </motion.div>
          ) : habit.emoji ? (
            <motion.span
              className="text-5xl drop-shadow-md"
              style={{ color: completed ? "#000000" : limeGreen }}
              animate={{
                scale: completed ? 1.1 : 1,
              }}
            >
              {habit.emoji}
            </motion.span>
          ) : null}
        </div>
      </div>

      {/* Habit name */}
      <div className="text-center max-w-[140px]">
        <p className="text-white font-extrabold text-sm uppercase tracking-wider leading-tight line-clamp-2 drop-shadow-md">
          {habit.name}
        </p>
        {goalInfo && (
          <p className="text-white/80 text-xs font-semibold mt-1.5 drop-shadow">
            {goalInfo}
          </p>
        )}
      </div>
    </motion.button>
  );
};
