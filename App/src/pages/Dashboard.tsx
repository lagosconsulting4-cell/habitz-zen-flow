import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

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
          {todayHabits.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="col-span-2 text-center py-8"
            >
              <p className={`text-sm mb-2 ${isDarkMode ? "text-muted-foreground" : "text-white/80"}`}>
                Nenhum hábito para hoje
              </p>
              <p className={`text-xs ${isDarkMode ? "text-muted-foreground/60" : "text-white/60"}`}>
                Adicione um hábito para começar
              </p>
            </motion.div>
          )}

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
