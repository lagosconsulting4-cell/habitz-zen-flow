import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Sunrise, Sun, Moon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHabitIconWithFallback } from "@/components/icons/HabitIcons";
import type { Habit } from "@/components/DashboardHabitCard";

interface RoutineCardProps {
  habits: Habit[];
  getHabitCompletionStatus: (habitId: string) => boolean;
  className?: string;
}

interface PeriodData {
  id: "morning" | "afternoon" | "evening";
  name: string;
  icon: typeof Sunrise;
  habits: Habit[];
  completed: number;
  total: number;
  progress: number; // 0-100
}

export const RoutineCard = ({
  habits,
  getHabitCompletionStatus,
  className,
}: RoutineCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group habits by period and calculate progress
  const periods = useMemo((): PeriodData[] => {
    const periodMap: Record<string, Habit[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    // Group habits by period
    habits.forEach((habit) => {
      const period = (habit as any).period || "morning"; // Default to morning if no period
      if (periodMap[period]) {
        periodMap[period].push(habit);
      }
    });

    // Calculate progress for each period
    return [
      {
        id: "morning" as const,
        name: "Manhã",
        icon: Sunrise,
        habits: periodMap.morning,
        completed: periodMap.morning.filter((h) => getHabitCompletionStatus(h.id)).length,
        total: periodMap.morning.length,
        progress: periodMap.morning.length > 0
          ? (periodMap.morning.filter((h) => getHabitCompletionStatus(h.id)).length / periodMap.morning.length) * 100
          : 0,
      },
      {
        id: "afternoon" as const,
        name: "Tarde",
        icon: Sun,
        habits: periodMap.afternoon,
        completed: periodMap.afternoon.filter((h) => getHabitCompletionStatus(h.id)).length,
        total: periodMap.afternoon.length,
        progress: periodMap.afternoon.length > 0
          ? (periodMap.afternoon.filter((h) => getHabitCompletionStatus(h.id)).length / periodMap.afternoon.length) * 100
          : 0,
      },
      {
        id: "evening" as const,
        name: "Noite",
        icon: Moon,
        habits: periodMap.evening,
        completed: periodMap.evening.filter((h) => getHabitCompletionStatus(h.id)).length,
        total: periodMap.evening.length,
        progress: periodMap.evening.length > 0
          ? (periodMap.evening.filter((h) => getHabitCompletionStatus(h.id)).length / periodMap.evening.length) * 100
          : 0,
      },
    ];
  }, [habits, getHabitCompletionStatus]);

  // Overall progress
  const totalHabits = periods.reduce((sum, p) => sum + p.total, 0);
  const totalCompleted = periods.reduce((sum, p) => sum + p.completed, 0);
  const overallProgress = totalHabits > 0 ? (totalCompleted / totalHabits) * 100 : 0;

  // Progress ring helper
  const ProgressRing = ({ progress, size = 48 }: { progress: number; size?: number }) => {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-300"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full rounded-3xl overflow-hidden",
        // Dark card design
        "bg-gradient-to-br from-card/80 to-card/60 dark:from-zinc-900/90 dark:to-zinc-950/90",
        "border border-border/60 dark:border-zinc-800/50",
        "backdrop-blur-sm",
        className
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-accent/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Overall progress ring */}
          <div className="relative">
            <ProgressRing progress={overallProgress} size={56} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">
                {Math.round(overallProgress)}%
              </span>
            </div>
          </div>

          {/* Title and stats */}
          <div className="text-left">
            <h3 className="text-base font-bold text-foreground">
              Rotina do Dia
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalCompleted} de {totalHabits} concluídos
            </p>
          </div>
        </div>

        {/* Expand icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {periods.map((period) => (
                <motion.div
                  key={period.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className={cn(
                    "rounded-2xl p-3",
                    "bg-accent/5 dark:bg-zinc-800/30",
                    "border border-border/40 dark:border-zinc-700/30"
                  )}
                >
                  {/* Period Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <period.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                        {period.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {period.completed}/{period.total}
                      </span>
                      {period.total > 0 && period.completed === period.total && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {period.total > 0 && (
                    <div className="w-full h-2 bg-muted/20 dark:bg-zinc-700/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${period.progress}%` }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  )}

                  {/* Habit List */}
                  {period.habits.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {period.habits.map((habit) => {
                        const isCompleted = getHabitCompletionStatus(habit.id);
                        const HabitIcon = getHabitIconWithFallback(habit.icon_key, habit.category);
                        return (
                          <div
                            key={habit.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <HabitIcon
                              className={cn(
                                "w-3.5 h-3.5 flex-shrink-0",
                                isCompleted ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                            <span
                              className={cn(
                                "flex-1",
                                isCompleted
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground"
                              )}
                            >
                              {habit.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Empty state for period */}
                  {period.habits.length === 0 && (
                    <p className="text-xs text-muted-foreground/60 italic">
                      Nenhum hábito para este período
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RoutineCard;
