import { motion } from "framer-motion";
import { Heart, Target } from "lucide-react";
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
  isDarkMode?: boolean;
}

export const CircularHabitCard = ({
  habit,
  progress,
  completed,
  onToggle,
  streakDays,
  goalInfo,
  isFavorite,
  className,
  isDarkMode = true
}: CircularHabitCardProps) => {
  // Always use Lucide icon - prefer icon_key, fallback to Target icon
  const Icon = getHabitIcon(habit.icon_key) || Target;
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Cores adaptivas baseadas no tema
  // Light mode: inspirado no app de referência (fundo colorido, ícones brancos, círculos escuros)
  // Dark mode: fundo escuro, ícones verdes
  const limeGreen = "#A3E635";

  // Light mode colors (sobre fundo verde)
  const lightModeColors = {
    iconDefault: "#FFFFFF", // Branco
    iconCompleted: "#1a1a1a", // Escuro quando completo
    progressStroke: "#FFFFFF", // Branco
    bgCircle: "rgba(0, 0, 0, 0.25)", // Escuro translúcido
    fillCompleted: "#FFFFFF", // Branco quando completo
    textColor: "#FFFFFF",
    textSecondary: "rgba(255, 255, 255, 0.8)",
  };

  // Dark mode colors (sobre fundo escuro)
  const darkModeColors = {
    iconDefault: limeGreen,
    iconCompleted: "#000000",
    progressStroke: limeGreen,
    bgCircle: "#2a2a2a",
    fillCompleted: limeGreen,
    textColor: "#FFFFFF",
    textSecondary: "rgba(255, 255, 255, 0.8)",
  };

  const colors = isDarkMode ? darkModeColors : lightModeColors;

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onToggle}
      className={cn(
        "flex flex-col items-center gap-3 relative group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 rounded-full",
        isDarkMode ? "focus-visible:ring-offset-black" : "focus-visible:ring-offset-primary",
        className
      )}
      type="button"
      aria-label={`${completed ? 'Desmarcar' : 'Marcar'} hábito ${habit.name}${streakDays ? `, sequência de ${streakDays} dias` : ''}`}
      aria-pressed={completed}
    >
      {/* Favorite indicator */}
      {isFavorite && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute -top-2 -left-2 rounded-full p-1.5 shadow-lg z-10",
            isDarkMode ? "bg-white" : "bg-white"
          )}
          aria-hidden="true"
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
          className={cn(
            "absolute -top-1 -right-1 rounded-full w-8 h-8 flex items-center justify-center text-xs font-extrabold shadow-lg z-10 border-2",
            isDarkMode
              ? "bg-white text-card border-background"
              : "bg-white text-primary border-primary/20"
          )}
          aria-hidden="true"
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
            stroke={colors.bgCircle}
            strokeWidth={strokeWidth}
            fill="transparent"
            opacity={isDarkMode ? 0.3 : 1}
          />

          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.progressStroke}
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

        {/* Inner filled circle when completed */}
        <motion.div
          initial={false}
          animate={{
            opacity: completed ? 1 : 0,
            scale: completed ? 1 : 0.85
          }}
          transition={{ duration: 0.3, delay: completed ? 0.15 : 0, type: "spring" }}
          className="absolute inset-0 m-2.5 rounded-full shadow-inner"
          style={{ backgroundColor: completed ? colors.fillCompleted : "transparent" }}
        />

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: completed ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Icon
              size={52}
              color={completed ? colors.iconCompleted : colors.iconDefault}
              strokeWidth={2.5}
              className="drop-shadow-lg"
            />
          </motion.div>
        </div>
      </div>

      {/* Habit name */}
      <div className="text-center max-w-[140px]">
        <p
          className="font-extrabold text-sm uppercase tracking-wider leading-tight line-clamp-2 drop-shadow-md"
          style={{ color: colors.textColor }}
        >
          {habit.name}
        </p>
        {goalInfo && (
          <p
            className="text-xs font-semibold mt-1.5 drop-shadow"
            style={{ color: colors.textSecondary }}
          >
            {goalInfo}
          </p>
        )}
      </div>
    </motion.button>
  );
};
