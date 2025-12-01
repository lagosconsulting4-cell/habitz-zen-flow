import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/skeleton";

import { DashboardHabitCard } from "@/components/DashboardHabitCard";
import { RoutineCard } from "@/components/RoutineCard";
import { LevelUpModal } from "@/components/LevelUpModal";
import { TimerModal } from "@/components/timer";
import { NotificationPermissionDialog } from "@/components/pwa/NotificationPermissionDialog";
import { StreakToast } from "@/components/StreakToast";
import { XPToast } from "@/components/XPToast";
import { useHabits } from "@/hooks/useHabits";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/integrations/supabase/auth";
import { useGamification, XP_VALUES } from "@/hooks/useGamification";
import { celebrations } from "@/lib/celebrations";
import type { Habit } from "@/components/DashboardHabitCard";
import { hideGamification } from "@/config/featureFlags";

// Helper to check if habit has time-based goal
const isTimedHabit = (unit?: string | null): boolean => {
  return unit === "minutes" || unit === "hours";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { habits, loading, toggleHabit, getHabitCompletionStatus, addCompletionOptimistic, removeCompletionOptimistic } = useHabits();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { user } = useAuth();
  const { awardHabitXP, awardStreakBonus, awardPerfectDayBonus } = useGamification(user?.id);
  const isGamificationEnabled = !hideGamification;

  // Timer modal state
  const [timerHabit, setTimerHabit] = useState<Habit | null>(null);

  // Level up modal state
  const [levelUpData, setLevelUpData] = useState<{
    fromLevel: number;
    toLevel: number;
    totalXP: number;
    unlockedItems?: Array<{
      type: "icon" | "widget" | "meditation" | "template" | "journey";
      id: string;
      name: string;
      description: string;
      icon?: string;
    }>;
  } | null>(null);

  // Streak toast state
  const [streakMilestone, setStreakMilestone] = useState<number | null>(null);

  // XP toast state - supports queued toasts for multiple XP gains
  const [xpGained, setXPGained] = useState<{
    amount: number;
    habitId?: string;
    type?: "habit" | "streak" | "perfect_day";
  } | null>(null);

  // Queue for multiple XP toasts (habit + streak bonus)
  const [xpToastQueue, setXpToastQueue] = useState<
    Array<{
      amount: number;
      habitId?: string;
      type?: "habit" | "streak" | "perfect_day";
    }>
  >([]);

  // Process XP toast queue
  useEffect(() => {
    if (!isGamificationEnabled) return;
    if (xpToastQueue.length > 0 && !xpGained) {
      const [next, ...rest] = xpToastQueue;
      setXPGained(next);
      setXpToastQueue(rest);
    }
  }, [xpToastQueue, xpGained, isGamificationEnabled]);

  // Listen for gamification events
  useEffect(() => {
    if (!isGamificationEnabled) return;
    const handleLevelUp = (event: CustomEvent) => {
      const { fromLevel, toLevel, totalXP, unlockedItems } = event.detail;
      setLevelUpData({ fromLevel, toLevel, totalXP, unlockedItems });
    };

    const handleXPGained = (event: CustomEvent) => {
      // Event dispatched from useGamification with totalXP and currentLevel
      // We need to calculate the amount that was just added
      // For now, we'll trigger the toast when habit is completed (handled below)
    };

    window.addEventListener("gamification:level-up", handleLevelUp as EventListener);
    window.addEventListener("gamification:xp-gained", handleXPGained as EventListener);

    return () => {
      window.removeEventListener("gamification:level-up", handleLevelUp as EventListener);
      window.removeEventListener("gamification:xp-gained", handleXPGained as EventListener);
    };
  }, [isGamificationEnabled]);

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

  // Calculate progress for each habit (0-100) - memoized
  const calculateProgress = useCallback((habit: Habit): number => {
    const completed = getHabitCompletionStatus(habit.id);

    // If has numeric goal
    if (habit.goal_value && habit.goal_value > 0) {
      return completed ? 100 : 0;
    }

    // Binary completion
    return completed ? 100 : 0;
  }, [getHabitCompletionStatus]);

  // Check if habit is completed today - memoized
  const isCompletedToday = useCallback((habitId: string): boolean => {
    return getHabitCompletionStatus(habitId);
  }, [getHabitCompletionStatus]);

  // Check if all today's habits are completed (Perfect Day)
  const checkPerfectDay = (): boolean => {
    if (todayHabits.length === 0) return false;
    return todayHabits.every((habit) => getHabitCompletionStatus(habit.id));
  };

  // Helper to add XP toast to queue
  const queueXpToast = (toast: {
    amount: number;
    habitId?: string;
    type?: "habit" | "streak" | "perfect_day";
  }) => {
    if (!isGamificationEnabled) return;
    setXpToastQueue((prev) => [...prev, toast]);
  };

  // Handle habit toggle - opens timer for timed habits
  const handleToggle = async (habit: Habit) => {
    const wasCompleted = getHabitCompletionStatus(habit.id);
    const targetDate = new Date().toISOString().split("T")[0];

    // If it's a timed habit and not completed, open timer
    if (isTimedHabit(habit.unit) && !wasCompleted && habit.goal_value && habit.goal_value > 0) {
      setTimerHabit(habit);
      return;
    }

    // OPTIMISTIC: Create completion object immediately
    const optimisticCompletion = {
      id: crypto.randomUUID(),
      habit_id: habit.id,
      user_id: user?.id || "",
      completed_at: targetDate,
      created_at: new Date().toISOString(),
    };

    // If completing (not uncompleting), trigger celebration IMMEDIATELY
    if (!wasCompleted) {
      // Add completion optimistically
      addCompletionOptimistic(optimisticCompletion);

      // Trigger celebration effect on the habit card IMMEDIATELY
      const habitCardId = `habit-card-${habit.id}`;
      celebrations.habitComplete(habitCardId);

      if (isGamificationEnabled) {
        // Queue XP toast IMMEDIATELY (will show after brief delay)
        queueXpToast({
          amount: XP_VALUES.HABIT_COMPLETE,
          habitId: habit.id,
          type: "habit",
        });
      }

      // Check for streak milestones (3, 7, 30 days)
      const newStreak = habit.streak + 1; // Optimistic - actual value comes from DB
      if (awardStreakBonus && (newStreak === 3 || newStreak === 7 || newStreak === 30)) {
        if (isGamificationEnabled) {
          // Queue streak milestone IMMEDIATELY
          setStreakMilestone(newStreak);
          const streakXpAmount =
            newStreak === 3
              ? XP_VALUES.STREAK_BONUS_3
              : newStreak === 7
                ? XP_VALUES.STREAK_BONUS_7
                : XP_VALUES.STREAK_BONUS_30;
          queueXpToast({
            amount: streakXpAmount,
            type: "streak",
          });
        }
      }

      // Check for Perfect Day (all habits completed)
      // Use requestAnimationFrame to ensure state is updated
      requestAnimationFrame(() => {
        // Need to re-check completion status after optimistic update
        const allCompleted = todayHabits.every(
          (h) => h.id === habit.id || getHabitCompletionStatus(h.id)
        );

        if (allCompleted && awardPerfectDayBonus) {
          // Show special celebration for perfect day
          celebrations.perfectDay();
          if (isGamificationEnabled) {
            // Queue XP toast for perfect day bonus
            queueXpToast({
              amount: XP_VALUES.PERFECT_DAY,
              type: "perfect_day",
            });
          }
        }
      });
    } else {
      // Remove completion optimistically
      removeCompletionOptimistic(habit.id, targetDate);
    }

    // BACKGROUND: Sync with backend (non-blocking)
    // RPC function now handles: completion toggle, XP award, and streak update atomically
    try {
      await toggleHabit(habit.id);

      // Note: XP and streak awards are now handled atomically in the RPC function
      // The calls below (awardStreakBonus, awardPerfectDayBonus) may be for additional
      // bonuses or UI side effects, but XP awards are already handled by RPC
    } catch (error) {
      console.error("Toggle sync failed:", error);
      // ROLLBACK: Revert optimistic update on error
      if (!wasCompleted) {
        removeCompletionOptimistic(habit.id, targetDate);
      } else {
        addCompletionOptimistic(optimisticCompletion);
      }
    }
  };

  // Handle timer completion
  const handleTimerComplete = async () => {
    if (timerHabit) {
      const targetDate = new Date().toISOString().split("T")[0];
      const habitId = timerHabit.id;
      const habitCardId = `habit-card-${habitId}`;

      // OPTIMISTIC: Create completion object immediately
      const optimisticCompletion = {
        id: crypto.randomUUID(),
        habit_id: habitId,
        user_id: user?.id || "",
        completed_at: targetDate,
        created_at: new Date().toISOString(),
      };

      // OPTIMISTIC: Add completion immediately
      addCompletionOptimistic(optimisticCompletion);

      // IMMEDIATE: Trigger celebration
      celebrations.habitComplete(habitCardId);

      if (isGamificationEnabled) {
        // IMMEDIATE: Queue XP toast
        queueXpToast({
          amount: XP_VALUES.HABIT_COMPLETE,
          habitId: habitId,
          type: "habit",
        });

        // IMMEDIATE: Check for streak milestones
        const newStreak = timerHabit.streak + 1;
        if (awardStreakBonus && (newStreak === 3 || newStreak === 7 || newStreak === 30)) {
          setStreakMilestone(newStreak);
          const streakXpAmount =
            newStreak === 3
              ? XP_VALUES.STREAK_BONUS_3
              : newStreak === 7
                ? XP_VALUES.STREAK_BONUS_7
                : XP_VALUES.STREAK_BONUS_30;
          queueXpToast({
            amount: streakXpAmount,
            type: "streak",
          });
        }
      }

      // IMMEDIATE: Check for Perfect Day
      const currentHabit = timerHabit;
      requestAnimationFrame(() => {
        const allCompleted = todayHabits.every(
          (h) => h.id === currentHabit.id || getHabitCompletionStatus(h.id)
        );

        if (allCompleted && awardPerfectDayBonus) {
          celebrations.perfectDay();
          if (isGamificationEnabled) {
            queueXpToast({
              amount: XP_VALUES.PERFECT_DAY,
              type: "perfect_day",
            });
          }
        }
      });

      // IMMEDIATE: Close modal
      setTimerHabit(null);

      // BACKGROUND: Sync with backend (non-blocking)
      // RPC function handles: completion toggle, XP award, and streak update atomically
      toggleHabit(habitId).catch((error) => {
        console.error("Timer completion sync failed:", error);
        // ROLLBACK: Revert optimistic update on error
        removeCompletionOptimistic(habitId, targetDate);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 px-4 pt-6 sm:pt-4 pb-32 space-y-5"
      >
        {/* Routine Card - Shows daily progress by period */}
        {todayHabits.length > 0 && (
          <RoutineCard
            habits={todayHabits as Habit[]}
            getHabitCompletionStatus={getHabitCompletionStatus}
          />
        )}

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
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-primary/10 dark:bg-primary/15">
                <Sparkles
                  size={32}
                  strokeWidth={1.5}
                  className="text-primary"
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
              <h3 className="text-xl font-bold mb-2 text-foreground">
                Comece sua jornada
              </h3>
              <p className="text-sm text-muted-foreground max-w-[260px]">
                Crie seu primeiro hábito e transforme sua rotina
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Button
                onClick={() => navigate("/create")}
                className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="mr-2 h-5 w-5" />
                Criar primeiro hábito
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          /* Grid de hábitos - 2 colunas */
          <div className="grid grid-cols-2 gap-3">
            {todayHabits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.15,
                  delay: Math.min(index * 0.03, 0.15) // Cap at 150ms
                }}
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
          isDarkMode={isDarkMode}
        />
      )}

      {/* Level Up Modal */}
      {levelUpData && isGamificationEnabled && (
        <LevelUpModal
          isOpen={!!levelUpData}
          onClose={() => setLevelUpData(null)}
          fromLevel={levelUpData.fromLevel}
          toLevel={levelUpData.toLevel}
          totalXP={levelUpData.totalXP}
          unlockedItems={levelUpData.unlockedItems}
        />
      )}

      {/* Notification Permission Dialog - shows after first habit */}
      {todayHabits.length > 0 && (
        <NotificationPermissionDialog trigger="after-first-habit" />
      )}

      {/* Streak Milestone Toast */}
      {streakMilestone && isGamificationEnabled && (
        <StreakToast
          streakDays={streakMilestone}
          show={!!streakMilestone}
          onClose={() => setStreakMilestone(null)}
        />
      )}

      {/* XP Gained Toast */}
      {xpGained && isGamificationEnabled && (
        <XPToast
          xpAmount={xpGained.amount}
          show={!!xpGained}
          onClose={() => setXPGained(null)}
          targetElementId={xpGained.habitId ? `habit-card-${xpGained.habitId}` : undefined}
          type={xpGained.type}
        />
      )}
    </div>
  );
};

export default Dashboard;
