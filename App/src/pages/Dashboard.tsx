import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

import { DashboardHabitCard } from "@/components/DashboardHabitCard";
import { TimerModal } from "@/components/timer";
import { useHabits } from "@/hooks/useHabits";
import type { Habit } from "@/components/DashboardHabitCard";

// Helper to check if habit has time-based goal
const isTimedHabit = (unit?: string | null): boolean => {
  return unit === "minutes" || unit === "hours";
};

const Dashboard = () => {
  const { habits, loading, toggleHabit, getHabitCompletionStatus } = useHabits();

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
      return completed ? 100 : 0;
    }

    // Binary completion
    return completed ? 100 : 0;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-lg font-semibold text-white">
            Carregando seus hábitos...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 px-4 pt-6 pb-32"
      >
        {todayHabits.length === 0 ? (
          /* Empty State Premium */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center h-[60vh]"
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
                  background: "linear-gradient(135deg, rgba(163, 230, 53, 0.15) 0%, rgba(163, 230, 53, 0.05) 100%)",
                  boxShadow: "0 8px 32px rgba(163, 230, 53, 0.1)"
                }}
              >
                <Sparkles
                  size={32}
                  strokeWidth={1.5}
                  className="text-lime-400"
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
              <h3 className="text-xl font-bold mb-2 text-white">
                Comece sua jornada
              </h3>
              <p className="text-sm text-white/50 max-w-[260px]">
                Crie seu primeiro hábito e transforme sua rotina
              </p>
            </motion.div>
          </motion.div>
        ) : (
          /* Grid de hábitos - 2 colunas */
          <div className="grid grid-cols-2 gap-3">
            {todayHabits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <DashboardHabitCard
                  habit={habit as Habit}
                  progress={calculateProgress(habit as Habit)}
                  completed={isCompletedToday(habit.id)}
                  onToggle={() => handleToggle(habit as Habit)}
                  streakDays={habit.streak}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Timer Modal */}
      {timerHabit && (
        <TimerModal
          habit={timerHabit}
          isOpen={!!timerHabit}
          onClose={() => setTimerHabit(null)}
          onComplete={handleTimerComplete}
          isDarkMode={true}
        />
      )}
    </div>
  );
};

export default Dashboard;
