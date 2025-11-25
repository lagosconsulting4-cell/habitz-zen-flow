import { motion, AnimatePresence } from "framer-motion";
import { Heart, Clock, Check, Flame } from "lucide-react";
import { getHabitIconWithFallback } from "@/components/icons/HabitIcons";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";

// Helper to check if habit has time-based goal
export const isTimedHabit = (unit?: string | null): boolean => {
  return unit === "minutes" || unit === "hours";
};

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
  const Icon = getHabitIconWithFallback(habit.icon_key, habit.category);
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Estado para controlar animação de celebração
  const [showCelebration, setShowCelebration] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(completed);

  // Detecta quando hábito é completado (transição de false para true)
  useEffect(() => {
    if (completed && !wasCompleted) {
      // Acabou de completar - trigger celebração
      setShowCelebration(true);

      // Haptic feedback sutil
      if ("vibrate" in navigator) {
        navigator.vibrate([15, 50, 25]);
      }

      // Remove celebração após animação
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 800);

      return () => clearTimeout(timer);
    } else if (!completed && wasCompleted) {
      // Desfez - haptic sutil
      if ("vibrate" in navigator) {
        navigator.vibrate(10);
      }
    }
    setWasCompleted(completed);
  }, [completed, wasCompleted]);

  const handleClick = useCallback(() => {
    onToggle();
  }, [onToggle]);

  // Cores
  const limeGreen = "#A3E635";

  const lightModeColors = {
    iconDefault: "#FFFFFF",
    iconCompleted: "#166534",
    progressStroke: "#FFFFFF",
    bgCircle: "rgba(255, 255, 255, 0.25)",
    fillCompleted: "#FFFFFF",
    textColor: "#FFFFFF",
    textSecondary: "rgba(255, 255, 255, 0.8)",
    glowColor: "rgba(255, 255, 255, 0.8)",
  };

  const darkModeColors = {
    iconDefault: limeGreen,
    iconCompleted: "#000000",
    progressStroke: limeGreen,
    bgCircle: "rgba(163, 230, 53, 0.15)",
    fillCompleted: limeGreen,
    textColor: "#FFFFFF",
    textSecondary: "rgba(255, 255, 255, 0.8)",
    glowColor: "rgba(163, 230, 53, 0.6)",
  };

  const colors = isDarkMode ? darkModeColors : lightModeColors;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
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
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute -top-2 -left-2 rounded-full p-1.5 shadow-lg z-10 bg-white"
          aria-hidden="true"
        >
          <Heart size={16} fill="#EF4444" color="#EF4444" />
        </motion.div>
      )}

      {/* Streak badge - Premium design com fogo para streaks altas */}
      {streakDays !== undefined && streakDays > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={cn(
            "absolute -top-1 -right-1 rounded-full flex items-center justify-center shadow-lg z-10 border-2",
            // Tamanho baseado se tem fogo ou não
            streakDays >= 3 ? "gap-0.5 px-2 py-1" : "w-8 h-8",
            // Cores - destaque especial para streaks longas
            streakDays >= 7
              ? "bg-gradient-to-br from-orange-400 to-red-500 text-white border-orange-300"
              : isDarkMode
                ? "bg-white text-card border-background"
                : "bg-white text-primary border-primary/20"
          )}
          aria-hidden="true"
        >
          {/* Ícone de fogo para streaks >= 3 */}
          {streakDays >= 3 && (
            <Flame
              size={12}
              className={cn(
                streakDays >= 7 ? "text-yellow-200" : "text-orange-500"
              )}
              fill={streakDays >= 7 ? "#fef08a" : "#f97316"}
            />
          )}
          <span className={cn(
            "font-extrabold",
            streakDays >= 3 ? "text-xs" : "text-xs"
          )}>
            {streakDays}
          </span>
        </motion.div>
      )}

      {/* Timer indicator */}
      {isTimedHabit(habit.unit) && !completed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full w-7 h-7 flex items-center justify-center shadow-lg z-10 border-2",
            isDarkMode
              ? "bg-lime-400 text-black border-background"
              : "bg-white text-primary border-primary/20"
          )}
          aria-label="Hábito com cronômetro"
        >
          <Clock size={14} strokeWidth={2.5} />
        </motion.div>
      )}

      {/* Círculo principal */}
      <div className="relative" style={{ width: size, height: size }}>

        {/* Glow celebration - aparece brevemente ao completar */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.2, 1.3],
                opacity: [0, 0.7, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${colors.glowColor} 0%, transparent 70%)`,
              }}
            />
          )}
        </AnimatePresence>

        {/* SVG */}
        <motion.svg
          width={size}
          height={size}
          className="transform -rotate-90"
          animate={showCelebration ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <defs>
            <linearGradient id={`progress-gradient-${habit.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#A3E635" : "#FFFFFF"} stopOpacity="1" />
              <stop offset="100%" stopColor={isDarkMode ? "#65A30D" : "#E2E8F0"} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.bgCircle}
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#progress-gradient-${habit.id})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={false}
            animate={{
              strokeDashoffset: offset,
            }}
            transition={{
              duration: 0.5,
              ease: "easeOut"
            }}
            strokeLinecap="round"
            style={{
              filter: progress > 0
                ? `drop-shadow(0 0 ${isDarkMode ? '6px' : '3px'} ${colors.glowColor})`
                : 'none'
            }}
          />
        </motion.svg>

        {/* Círculo preenchido quando completo */}
        <motion.div
          initial={false}
          animate={{
            opacity: completed ? 1 : 0,
            scale: completed ? 1 : 0.8
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay: completed ? 0.1 : 0
          }}
          className="absolute inset-0 m-2.5 rounded-full"
          style={{
            backgroundColor: completed ? colors.fillCompleted : "transparent",
            boxShadow: completed ? `inset 0 2px 4px rgba(0,0,0,0.1)` : 'none'
          }}
        />

        {/* Ícone */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={false}
            animate={{
              scale: completed ? 1.05 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15
            }}
          >
            <Icon
              width={52}
              height={52}
              strokeWidth={2.5}
              className="drop-shadow-lg"
              style={{ color: completed ? colors.iconCompleted : colors.iconDefault }}
            />
          </motion.div>
        </div>

        {/* Checkmark overlay - aparece brevemente ao completar */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 25
              }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className={cn(
                  "rounded-full p-3",
                  isDarkMode ? "bg-lime-400/90" : "bg-white/90"
                )}
                style={{
                  boxShadow: `0 4px 20px ${colors.glowColor}`
                }}
              >
                <Check
                  size={32}
                  strokeWidth={3}
                  className={isDarkMode ? "text-black" : "text-primary"}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nome do hábito */}
      <div className="text-center w-[140px] h-[48px] flex flex-col justify-start">
        <p
          className="font-extrabold text-sm uppercase tracking-wider leading-tight line-clamp-2 drop-shadow-md"
          style={{ color: colors.textColor }}
        >
          {habit.name}
        </p>
        {goalInfo && (
          <p
            className="text-xs font-semibold mt-1 drop-shadow"
            style={{ color: colors.textSecondary }}
          >
            {goalInfo}
          </p>
        )}
      </div>
    </motion.button>
  );
};
