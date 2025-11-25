import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { Sparkles } from "lucide-react";

import { CircularHabitCard, isTimedHabit } from "@/components/CircularHabitCard";
import { AddHabitCircle } from "@/components/AddHabitCircle";
import NavigationBar from "@/components/NavigationBar";
import { TimerModal } from "@/components/timer";
import { useHabits } from "@/hooks/useHabits";
import type { Habit } from "@/components/CircularHabitCard";

const Dashboard = () => {
  const { habits, loading, toggleHabit, getHabitCompletionStatus } = useHabits();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  // Timer modal state
  const [timerHabit, setTimerHabit] = useState<Habit | null>(null);

  // Filter habits for today
  const todayHabits = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    return habits.filter((habit) => {
      if (!habit.is_active) return false;

      // Check if today is in days_of_week
      if (habit.days_of_week && habit.days_of_week.length > 0) {
        return habit.days_of_week.includes(dayOfWeek);
      }

      return true;
    });
  }, [habits]);

  // Calculate progress for each habit (0-100)
  const calculateProgress = (habit: Habit): number => {
    const completed = getHabitCompletionStatus(habit.id);

    // If has numeric goal
    if (habit.goal_value && habit.goal_value > 0) {
      // For now, return 100 if completed, 0 if not
      // In future, implement partial progress tracking
      return completed ? 100 : 0;
    }

    // Binary completion
    return completed ? 100 : 0;
  };

  // Format goal info string
  const formatGoalInfo = (habit: Habit): string | undefined => {
    if (!habit.goal_value || habit.goal_value <= 0) return undefined;

    switch (habit.unit) {
      case "km":
        return `${habit.goal_value} KM`;
      case "minutes": {
        const hours = Math.floor(habit.goal_value / 60);
        const mins = habit.goal_value % 60;
        if (hours > 0) {
          return `${hours}:${mins.toString().padStart(2, "0")}`;
        }
        return `${mins} min`;
      }
      case "steps":
        return `${habit.goal_value.toLocaleString()} steps`;
      case "reps":
      case "custom":
        return `${habit.goal_value}`;
      default:
        return undefined;
    }
  };

  // Check if habit is completed today
  const isCompletedToday = (habitId: string): boolean => {
    return getHabitCompletionStatus(habitId);
  };

  // Handle habit toggle - opens timer for timed habits
  const handleToggle = async (habit: Habit) => {
    const isCompleted = getHabitCompletionStatus(habit.id);

    // If it's a timed habit and not completed, open timer
    if (isTimedHabit(habit.unit) && !isCompleted && habit.goal_value && habit.goal_value > 0) {
      setTimerHabit(habit);
      return;
    }

    // Otherwise, toggle directly
    await toggleHabit(habit.id);
  };

  // Handle timer completion
  const handleTimerComplete = async () => {
    if (timerHabit) {
      await toggleHabit(timerHabit.id);
      setTimerHabit(null);
    }
  };

  // Light mode: fundo verde vibrante | Dark mode: fundo escuro
  const bgClass = isDarkMode ? "bg-background" : "bg-primary";

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center transition-colors duration-300`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`text-lg font-semibold ${isDarkMode ? "text-foreground" : "text-white"}`}>
            Carregando seus hábitos...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} pb-20 md:pb-6 transition-colors duration-300`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Grid de hábitos */}
        <div className="habits-grid">
          {todayHabits.length === 0 ? (
            /* Empty State Premium - Centralizado e minimalista */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="col-span-2 flex flex-col items-center justify-center py-12 px-6"
            >
              {/* Ilustração minimalista */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="mb-6"
              >
                <div
                  className="relative w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: isDarkMode
                      ? "linear-gradient(135deg, rgba(163, 230, 53, 0.15) 0%, rgba(163, 230, 53, 0.05) 100%)"
                      : "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)",
                    boxShadow: isDarkMode
                      ? "0 8px 32px rgba(163, 230, 53, 0.1)"
                      : "0 8px 32px rgba(255, 255, 255, 0.15)"
                  }}
                >
                  <Sparkles
                    size={32}
                    strokeWidth={1.5}
                    style={{ color: isDarkMode ? "#A3E635" : "#FFFFFF" }}
                  />
                </div>
              </motion.div>

              {/* Texto motivacional */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-center mb-8"
              >
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: isDarkMode ? "#FFFFFF" : "#FFFFFF" }}
                >
                  Comece sua jornada
                </h3>
                <p
                  className="text-sm max-w-[240px]"
                  style={{ color: isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.8)" }}
                >
                  Crie seu primeiro hábito e transforme sua rotina
                </p>
              </motion.div>

              {/* CTA - AddHabitCircle destacado */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <AddHabitCircle isDarkMode={isDarkMode} highlighted />
              </motion.div>
            </motion.div>
          ) : (
            /* Lista normal de hábitos */
            <>
              {todayHabits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CircularHabitCard
                    habit={habit as Habit}
                    progress={calculateProgress(habit as Habit)}
                    completed={isCompletedToday(habit.id)}
                    onToggle={() => handleToggle(habit as Habit)}
                    streakDays={habit.streak}
                    goalInfo={formatGoalInfo(habit as Habit)}
                    isDarkMode={isDarkMode}
                  />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: todayHabits.length * 0.05 }}
              >
                <AddHabitCircle isDarkMode={isDarkMode} />
              </motion.div>
            </>
          )}
        </div>
      </motion.div>

      <NavigationBar isDarkMode={isDarkMode} />

      {/* Timer Modal */}
      {timerHabit && (
        <TimerModal
          habit={timerHabit}
          isOpen={!!timerHabit}
          onClose={() => setTimerHabit(null)}
          onComplete={handleTimerComplete}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default Dashboard;
