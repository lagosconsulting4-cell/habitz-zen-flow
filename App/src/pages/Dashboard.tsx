import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { CircularHabitCard } from "@/components/CircularHabitCard";
import { AddHabitCircle } from "@/components/AddHabitCircle";
import NavigationBar from "@/components/NavigationBar";
import { useHabits } from "@/hooks/useHabits";
import type { Habit } from "@/components/CircularHabitCard";

const Dashboard = () => {
  const { habits, loading, toggleHabit, getHabitCompletionStatus } = useHabits();
  const navigate = useNavigate();

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

  // Handle habit toggle
  const handleToggle = async (habitId: string) => {
    await toggleHabit(habitId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-white text-lg font-medium">Carregando seus hábitos...</div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-6">
      {/* Grid de hábitos */}
      <div className="habits-grid">
        {todayHabits.map((habit) => (
          <CircularHabitCard
            key={habit.id}
            habit={habit as Habit}
            progress={calculateProgress(habit as Habit)}
            completed={isCompletedToday(habit.id)}
            onToggle={() => handleToggle(habit.id)}
            streakDays={habit.streak}
            goalInfo={formatGoalInfo(habit as Habit)}
            isFavorite={habit.is_favorite}
          />
        ))}

        <AddHabitCircle />
      </div>

      <NavigationBar />
    </div>
  );
};

export default Dashboard;
