import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/skeleton";

import { DashboardHabitCard } from "@/components/DashboardHabitCard";
import { DailyMissionCard } from "@/components/DailyMissionCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { LevelUpModal } from "@/components/LevelUpModal";
import { TimerModal } from "@/components/timer";
import { NotificationPermissionDialog } from "@/components/pwa/NotificationPermissionDialog";
import { StreakToast } from "@/components/StreakToast";
import { XPToast } from "@/components/XPToast";
import { GemToast, AchievementToast } from "@/components/gamification";
import { FreezeUsedToast } from "@/components/gamification/FreezeUsedToast";
import { FreezeBadge } from "@/components/gamification/FreezeBadge";
import { useHabits } from "@/hooks/useHabits";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/integrations/supabase/auth";
import { useGamification, XP_VALUES } from "@/hooks/useGamification";
import { celebrations } from "@/lib/celebrations";
import type { Habit } from "@/components/DashboardHabitCard";
import { hideGamification } from "@/config/featureFlags";
import { useAllActiveJourneyHabits, useJourneyActions, CANONICAL_TO_ICON, type Journey } from "@/hooks/useJourney";
import { JourneyDayCompleteModal } from "@/components/JourneyDayCompleteModal";
import { JourneyGraduationModal } from "@/components/JourneyGraduationModal";

// Helper to check if habit has time-based goal
const isTimedHabit = (unit?: string | null): boolean => {
  return unit === "minutes" || unit === "hours";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { habits, loading, toggleHabit, getHabitCompletionStatus, getHabitCompletionCount, addCompletionOptimistic, removeCompletionOptimistic, getHabitsForDate } = useHabits();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { user } = useAuth();
  const { awardHabitXP, awardStreakBonus, awardPerfectDayBonus, awardJourneyDayGems, awardJourneyPhaseGems, awardJourneyCompleteGems, unlockAchievement, isAchievementUnlocked, getAchievementProgress, updateStreak, freezeUsedToday } = useGamification(user?.id);
  const isGamificationEnabled = !hideGamification;

  // Journey hooks — multi-journey support
  const { allJourneyHabits, activeStates } = useAllActiveJourneyHabits();
  const { completeDay, keepHabits, isCompleting } = useJourneyActions();

  // Build journey_id → Journey lookup + habit_id → theme_slug map for ALL active journeys
  const journeyLookup = useMemo(() => {
    const map = new Map<string, Journey>();
    for (const state of activeStates) {
      if (state.journeys) map.set(state.journey_id, state.journeys as Journey);
    }
    return map;
  }, [activeStates]);

  const habitThemeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const jh of allJourneyHabits) {
      if (!jh.is_active) continue;
      const journey = journeyLookup.get(jh.journey_id);
      if (journey?.theme_slug) {
        map.set(jh.habit_id, journey.theme_slug);
      }
    }
    return map;
  }, [allJourneyHabits, journeyLookup]);

  // Fallback theme slug: if habitThemeMap is empty (data still loading), use first active journey's theme
  const defaultThemeSlug = useMemo(() => {
    if (activeStates.length === 0) return null;
    const first = activeStates[0]?.journeys as Journey | undefined;
    return first?.theme_slug || null;
  }, [activeStates]);

  // Build habit_id → icon_key map from canonical_key (fixes existing habits created without icon_key)
  const habitIconMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const jh of allJourneyHabits) {
      if (jh.canonical_key && CANONICAL_TO_ICON[jh.canonical_key]) {
        map.set(jh.habit_id, CANONICAL_TO_ICON[jh.canonical_key]);
      }
    }
    return map;
  }, [allJourneyHabits]);

  // Journey day completion modal state
  const [journeyDayComplete, setJourneyDayComplete] = useState<{
    dayNumber: number;
    totalDays: number;
    journeyTitle: string;
    phaseCompleted?: boolean;
    phaseBadgeName?: string;
    journeyCompleted?: boolean;
    newHabitPreview?: string | null;
  } | null>(null);
  const journeyDayCompletedRef = useRef<Set<string>>(new Set());
  const [showGraduation, setShowGraduation] = useState(false);
  const [completingJourney, setCompletingJourney] = useState<{ journeyId: string; themeSlug: string | null } | null>(null);

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

  // Call updateStreak on mount to trigger auto-freeze consumption
  useEffect(() => {
    if (!user?.id) return;
    updateStreak().catch((err) => console.error("[Dashboard] streak check:", err));
  }, [user?.id]);

  // Listen for notification-triggered habit completion
  useEffect(() => {
    const handleCompleteFromNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      const habitId = customEvent.detail?.habitId;

      if (habitId) {
        console.log("[Dashboard] Completing habit from notification:", habitId);
        // Complete the habit (today's date)
        toggleHabit(habitId).catch((error) => {
          console.error("[Dashboard] Error completing habit from notification:", error);
        });
      }
    };

    window.addEventListener("habit:complete-from-notification", handleCompleteFromNotification);

    return () => {
      window.removeEventListener("habit:complete-from-notification", handleCompleteFromNotification);
    };
  }, [toggleHabit]);

  // Journey day auto-completion detection — iterates ALL active journeys
  useEffect(() => {
    if (activeStates.length === 0 || allJourneyHabits.length === 0 || isCompleting) return;

    for (const activeJourney of activeStates) {
      const todayStr = new Date().toISOString().split("T")[0];
      const completionKey = `${activeJourney.journey_id}:${todayStr}`;
      if (journeyDayCompletedRef.current.has(completionKey)) continue;

      // Skip if day was already advanced today (prevents re-advance on page reload).
      // On day 1 (never advanced), always allow; on day 2+, only advance if
      // updated_at is from a previous day (meaning habits are freshly completed today).
      if (activeJourney.current_day > 1 && activeJourney.updated_at) {
        const updatedDate = activeJourney.updated_at.split("T")[0];
        if (updatedDate === todayStr) {
          journeyDayCompletedRef.current.add(completionKey);
          continue;
        }
      }

      // Get habit IDs that belong to this journey for the current day
      const activeJourneyHabitIds = allJourneyHabits
        .filter((jh) => jh.journey_id === activeJourney.journey_id && jh.is_active &&
          jh.introduced_on_day <= activeJourney.current_day &&
          (!jh.expires_on_day || jh.expires_on_day >= activeJourney.current_day))
        .map((jh) => jh.habit_id);

      if (activeJourneyHabitIds.length === 0) continue;

      const allCompleted = activeJourneyHabitIds.every((id) => getHabitCompletionStatus(id));
      if (!allCompleted) continue;

      // Mark as completed to avoid re-triggering (sync — ref updates immediately)
      journeyDayCompletedRef.current.add(completionKey);

      const journey = activeJourney.journeys as Journey | undefined;
      const themeSlug = journey?.theme_slug || null;
      setCompletingJourney({ journeyId: activeJourney.journey_id, themeSlug });

      completeDay(activeJourney.journey_id).then((result) => {
        setJourneyDayComplete({
          dayNumber: activeJourney.current_day,
          totalDays: journey?.duration_days || 30,
          journeyTitle: journey?.title || "",
          phaseCompleted: result?.phase_completed,
          phaseBadgeName: result?.phase_badge_name || undefined,
          journeyCompleted: result?.journey_completed,
          newHabitPreview: result?.new_habits?.[0]?.name || null,
        });

        awardJourneyDayGems(activeJourney.journey_id, activeJourney.current_day).catch(console.error);

        if (result?.phase_completed) {
          awardJourneyPhaseGems(activeJourney.journey_id, activeJourney.current_phase).catch(console.error);
        }

        if (result?.journey_completed) {
          awardJourneyCompleteGems(activeJourney.journey_id, journey?.level || 1).catch(console.error);
        }

        try {
          if (result?.phase_completed && !isAchievementUnlocked("journey_phase")) {
            unlockAchievement({ achievementId: "journey_phase", progressSnapshot: { journey_id: activeJourney.journey_id, phase: activeJourney.current_phase } }).catch(() => {});
          }
          if (result?.journey_completed && (journey?.level || 1) === 1) {
            if (!isAchievementUnlocked("journey_l1_complete")) {
              unlockAchievement({ achievementId: "journey_l1_complete", progressSnapshot: { journey_id: activeJourney.journey_id } }).catch(() => {});
            }
            const polyProgress = getAchievementProgress("journey_polymata");
            if (!isAchievementUnlocked("journey_polymata") && (polyProgress.current + 1) >= 3) {
              unlockAchievement({ achievementId: "journey_polymata", progressSnapshot: { journey_id: activeJourney.journey_id } }).catch(() => {});
            }
            if (!isAchievementUnlocked("journey_completist") && (polyProgress.current + 1) >= 5) {
              unlockAchievement({ achievementId: "journey_completist", progressSnapshot: { journey_id: activeJourney.journey_id } }).catch(() => {});
            }
          }
          if (result?.journey_completed && (journey?.level || 1) === 2) {
            if (!isAchievementUnlocked("journey_l2_complete")) {
              unlockAchievement({ achievementId: "journey_l2_complete", progressSnapshot: { journey_id: activeJourney.journey_id } }).catch(() => {});
            }
          }
        } catch { /* achievements are best-effort */ }
      }).catch((err) => {
        console.error("[Dashboard] Journey day complete error:", err);
        journeyDayCompletedRef.current.delete(completionKey);
      });

      // Only process one journey completion at a time
      break;
    }
  }, [activeStates, allJourneyHabits, getHabitCompletionStatus, isCompleting, completeDay]);

  // Filter habits for today using comprehensive filtering logic
  const todayHabitsRaw = useMemo(() => {
    return getHabitsForDate(new Date());
  }, [getHabitsForDate]);

  // Enrich habits with icon_key from canonical_key mapping (fixes existing habits without icon_key)
  // + sort journey habits first for visual grouping
  const todayHabits = useMemo(() => {
    const enriched = todayHabitsRaw.map((habit) => {
      if (habit.icon_key) return habit;
      const derivedIcon = habitIconMap.get(habit.id);
      if (derivedIcon) return { ...habit, icon_key: derivedIcon };
      return habit;
    });
    // Journey habits first for visual grouping
    return enriched.sort((a, b) => {
      const aJ = a.source === 'journey' ? 0 : 1;
      const bJ = b.source === 'journey' ? 0 : 1;
      return aJ - bJ;
    });
  }, [todayHabitsRaw, habitIconMap]);

  // Calculate progress for each habit (0-100) - memoized
  const calculateProgress = useCallback((habit: Habit): number => {
    const { current, target } = getHabitCompletionCount(habit.id);
    if (target <= 0) return 0;
    return Math.min(100, (current / target) * 100);
  }, [getHabitCompletionCount]);

  // Check if habit is completed today - memoized
  const isCompletedToday = useCallback((habitId: string): boolean => {
    return getHabitCompletionStatus(habitId);
  }, [getHabitCompletionStatus]);

  // Check if all today's habits are completed (Perfect Day)
  const checkPerfectDay = useCallback((): boolean => {
    if (todayHabits.length === 0) return false;
    return todayHabits.every((habit) => getHabitCompletionStatus(habit.id));
  }, [todayHabits, getHabitCompletionStatus]);

  // Helper to add XP toast to queue
  const queueXpToast = useCallback((toast: {
    amount: number;
    habitId?: string;
    type?: "habit" | "streak" | "perfect_day";
  }) => {
    if (!isGamificationEnabled) return;
    setXpToastQueue((prev) => [...prev, toast]);
  }, [isGamificationEnabled]);

  // Handle habit toggle - supports times_per_day increment/decrement
  const handleToggle = useCallback(async (habit: Habit) => {
    const wasFullyCompleted = getHabitCompletionStatus(habit.id);
    const { current: prevCount, target } = getHabitCompletionCount(habit.id);

    // If it's a timed habit and not completed, open timer
    if (isTimedHabit(habit.unit) && !wasFullyCompleted && habit.goal_value && habit.goal_value > 0) {
      setTimerHabit(habit);
      return;
    }

    try {
      // RPC handles increment/decrement + cache update atomically
      await toggleHabit(habit.id);

      // After toggle, check new state for celebrations
      const { current: newCount } = getHabitCompletionCount(habit.id);
      const isNowFullyCompleted = newCount >= target;

      // Celebrations only when transitioning to fully completed
      if (isNowFullyCompleted && !wasFullyCompleted) {
        if (isGamificationEnabled) {
          queueXpToast({
            amount: XP_VALUES.HABIT_COMPLETE,
            habitId: habit.id,
            type: "habit",
          });
        }

        // Check for streak milestones
        const newStreak = habit.streak + 1;
        if (awardStreakBonus && (newStreak === 3 || newStreak === 7 || newStreak === 30)) {
          if (isGamificationEnabled) {
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

        // Check for Perfect Day
        requestAnimationFrame(() => {
          const allCompleted = todayHabits.every(
            (h) => h.id === habit.id || getHabitCompletionStatus(h.id)
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
      }
    } catch (error) {
      console.error("Toggle sync failed:", error);
    }
  }, [
    getHabitCompletionStatus,
    getHabitCompletionCount,
    isTimedHabit,
    setTimerHabit,
    queueXpToast,
    awardStreakBonus,
    setStreakMilestone,
    awardPerfectDayBonus,
    todayHabits,
    celebrations,
    isGamificationEnabled,
    toggleHabit,
  ]);

  // Handle timer completion
  const handleTimerComplete = useCallback(async () => {
    if (timerHabit) {
      const targetDate = new Date().toISOString().split("T")[0];
      const habitId = timerHabit.id;

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
  }, [timerHabit, user, addCompletionOptimistic, queueXpToast, isGamificationEnabled, awardStreakBonus, todayHabits, getHabitCompletionStatus, awardPerfectDayBonus, toggleHabit, removeCompletionOptimistic]);

  if (loading) {
    return (
      <div className="bg-background flex flex-col min-h-[calc(100vh-80px)]">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="bg-background flex flex-col">
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 px-4 pb-navbar space-y-5"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        {/* DailyMissionCard - Journey progress + daily habit progress */}
        {todayHabits.length > 0 && (
          <DailyMissionCard
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
            className="flex flex-col items-center justify-center py-12 md:py-16"
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
                Comece sua transformação
              </h3>
              <p className="text-sm text-muted-foreground max-w-[260px]">
                Escolha uma jornada e tenha hábitos prontos no seu dashboard
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex flex-col items-center gap-3"
            >
              <Button
                onClick={() => navigate("/journeys")}
                className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
              >
                Explorar Jornadas
              </Button>
              <button
                onClick={() => navigate("/create")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ou criar meu próprio hábito
              </button>
            </motion.div>
          </motion.div>
        ) : (
          /* Grid de hábitos - 2 colunas */
          <div className="grid grid-cols-2 gap-3 justify-items-center">
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
                  completionCount={getHabitCompletionCount(habit.id).current}
                  timesPerDay={(habit as Habit).times_per_day ?? 1}
                  isTimedHabit={isTimedHabit(habit.unit)}
                  onTimerClick={() => setTimerHabit(habit as Habit)}
                  journeyThemeSlug={habitThemeMap.get(habit.id) || (habit.source === 'journey' ? defaultThemeSlug : null)}
                  isFrozen={freezeUsedToday && (habit.streak ?? 0) > 0}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* FAB for creating standalone habits */}
      <FloatingActionButton />

      {/* Journey Day Complete Modal */}
      {journeyDayComplete && (
        <JourneyDayCompleteModal
          isOpen={!!journeyDayComplete}
          onClose={() => {
            const wasJourneyComplete = journeyDayComplete?.journeyCompleted;
            setJourneyDayComplete(null);
            if (wasJourneyComplete) setShowGraduation(true);
          }}
          dayNumber={journeyDayComplete.dayNumber}
          totalDays={journeyDayComplete.totalDays}
          journeyTitle={journeyDayComplete.journeyTitle}
          phaseCompleted={journeyDayComplete.phaseCompleted}
          phaseBadgeName={journeyDayComplete.phaseBadgeName}
          journeyCompleted={journeyDayComplete.journeyCompleted}
          newHabitPreview={journeyDayComplete.newHabitPreview}
          themeSlug={completingJourney?.themeSlug || null}
        />
      )}

      {/* Journey Graduation Modal */}
      {showGraduation && completingJourney && (() => {
        const gradState = activeStates.find((s) => s.journey_id === completingJourney.journeyId);
        const gradJourney = gradState ? (gradState.journeys as Journey | undefined) : undefined;
        return (
          <JourneyGraduationModal
            isOpen={showGraduation}
            onClose={() => { setShowGraduation(false); setCompletingJourney(null); }}
            journeyId={completingJourney.journeyId}
            journeyTitle={gradJourney?.title || ""}
            journeyLevel={gradJourney?.level || 1}
            completionPercent={gradState?.completion_percent || 0}
            keepHabits={keepHabits}
            themeSlug={gradJourney?.theme_slug}
          />
        );
      })()}

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

      {/* NEW: Gems Toast */}
      {isGamificationEnabled && <GemToast />}

      {/* NEW: Achievement Toast */}
      {isGamificationEnabled && <AchievementToast userId={user?.id} />}

      {/* NEW: Freeze Used Toast */}
      {isGamificationEnabled && <FreezeUsedToast />}
    </div>
  );
};

export default Dashboard;
