import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Plus, BookOpen, Bell, ChevronRight, Sun, Sunset, Moon, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
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
import { supabase } from "@/integrations/supabase/client";
import { useGamification, XP_VALUES } from "@/hooks/useGamification";
import { celebrations } from "@/lib/celebrations";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Habit } from "@/components/DashboardHabitCard";
import { hideGamification } from "@/config/featureFlags";
import useProgress from "@/hooks/useProgress";
import { useAllActiveJourneyHabits, useJourneyActions, useJourneyDay, CANONICAL_TO_ICON, type Journey } from "@/hooks/useJourney";
import { JourneyIllustration, getJourneyTheme } from "@/components/JourneyIllustration";
import { JourneyDayCompleteModal } from "@/components/JourneyDayCompleteModal";
import { JourneyGraduationModal } from "@/components/JourneyGraduationModal";
import { getBRTDateString } from "@/utils/date";

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
  const queryClient = useQueryClient();
  const { weeklyInsight, loading: progressLoading } = useProgress();

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

  // Dynamic notification permission trigger (for streak-7 and journey-start re-asks)
  const [notifTrigger, setNotifTrigger] = useState<"after-streak-7" | "after-journey-start" | null>(null);

  // Reminder time quick-setup drawer (Sprint 2)
  const [showTimeSetup, setShowTimeSetup] = useState(false);
  const [setupTimes, setSetupTimes] = useState({
    morning: "08:00",
    afternoon: "14:00",
    evening: "20:00",
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.trigger === "after-streak-7" || detail?.trigger === "after-journey-start") {
        setNotifTrigger(detail.trigger);
      }
    };
    window.addEventListener("notification:request-permission", handler);
    return () => window.removeEventListener("notification:request-permission", handler);
  }, []);

  // Listen for reminder time setup prompt (Sprint 2)
  useEffect(() => {
    const handler = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_progress")
        .select("notification_preferences")
        .eq("user_id", user.id)
        .maybeSingle();
      const prefs = (data?.notification_preferences as Record<string, unknown>) || {};
      if (prefs.preferred_reminder_times) return; // already configured
      setShowTimeSetup(true);
    };
    window.addEventListener("notification:setup-times", handler);
    return () => window.removeEventListener("notification:setup-times", handler);
  }, [user]);

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
          toast.error("Erro ao completar hábito");
        });
      }
    };

    window.addEventListener("habit:complete-from-notification", handleCompleteFromNotification);

    return () => {
      window.removeEventListener("habit:complete-from-notification", handleCompleteFromNotification);
    };
  }, [toggleHabit]);

  // Handle intent URL from SW "Complete" fallback (?complete={habitId}&nhid={notificationHistoryId})
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (loading) return; // Wait for habits data before processing intent
    const completeHabitId = searchParams.get("complete");
    const nhid = searchParams.get("nhid");

    if (completeHabitId && user?.id) {
      // Track completion from notification
      if (nhid) {
        supabase
          .from("notification_history")
          .update({ completed_from_notification: true, opened_at: new Date().toISOString() })
          .eq("id", nhid)
          .then(({ error }) => {
            if (error) console.warn("[Dashboard] Notification tracking failed:", error.message);
          });
      }

      // Check if already completed before toggling (avoids un-completing)
      const alreadyCompleted = getHabitCompletionStatus(completeHabitId);
      if (alreadyCompleted) {
        console.log("[Dashboard] Habit already completed, skipping:", completeHabitId);
      } else {
        console.log("[Dashboard] Completing habit from URL intent:", completeHabitId);
        toggleHabit(completeHabitId)
          .then(() => toast.success("Hábito completado!"))
          .catch((error) => {
            console.error("[Dashboard] Error completing habit from URL intent:", error);
            toast.error("Erro ao completar hábito");
          });
      }

      // Clean URL params
      searchParams.delete("complete");
      searchParams.delete("nhid");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, user?.id, loading]);

  // Journey day auto-completion detection — iterates ALL active journeys
  useEffect(() => {
    if (activeStates.length === 0 || allJourneyHabits.length === 0 || isCompleting) return;

    for (const activeJourney of activeStates) {
      const todayStr = getBRTDateString();
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

  // ── First Day Banner data ──
  const firstActiveJourney = activeStates[0]?.journeys as Journey | undefined;
  const firstActiveState = activeStates[0];
  const firstJourneyTheme = useMemo(
    () => firstActiveJourney ? getJourneyTheme(firstActiveJourney.theme_slug || firstActiveJourney.illustration_key) : null,
    [firstActiveJourney]
  );

  const isFirstDay = useMemo(() => {
    if (!firstActiveState) return false;
    return firstActiveState.current_day === 1 && firstActiveState.days_completed === 0;
  }, [firstActiveState]);

  // Fetch day content for first day banner (only queries when there's an active journey)
  const { day: todayDayContent } = useJourneyDay(
    firstActiveJourney?.slug || "",
    firstActiveState?.current_day || 1,
    firstActiveJourney?.id
  );

  // ── Section headers ──
  const hasJourneyHabits = useMemo(() => todayHabits.some((h) => h.source === "journey"), [todayHabits]);
  const hasPersonalHabits = useMemo(() => todayHabits.some((h) => h.source !== "journey"), [todayHabits]);

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

  // Perfect Day persistent banner state
  const isPerfectDay = useMemo(() => {
    if (todayHabits.length === 0) return false;
    return todayHabits.every((habit) => getHabitCompletionStatus(habit.id));
  }, [todayHabits, getHabitCompletionStatus]);

  // Save preferred reminder times from quick-setup drawer (Sprint 2)
  const handleSaveSetupTimes = useCallback(async () => {
    if (!user) return;

    // 1. Save to notification_preferences
    const { data: current } = await supabase
      .from("user_progress")
      .select("notification_preferences")
      .eq("user_id", user.id)
      .maybeSingle();

    const prefs = (current?.notification_preferences as Record<string, unknown>) || {};
    await supabase
      .from("user_progress")
      .update({
        notification_preferences: {
          ...prefs,
          preferred_reminder_times: setupTimes,
        },
      })
      .eq("user_id", user.id);

    // 2. Retroactively update existing journey habits
    const journeyHabitIds = allJourneyHabits
      .filter(jh => jh.is_active)
      .map(jh => jh.habit_id);

    if (journeyHabitIds.length > 0) {
      for (const [period, time] of Object.entries(setupTimes)) {
        const idsForPeriod = todayHabits
          .filter(h => journeyHabitIds.includes(h.id) && h.period === period)
          .map(h => h.id);
        if (idsForPeriod.length > 0) {
          await supabase
            .from("habits")
            .update({
              reminder_time: time,
              notification_pref: { reminder_enabled: true, reminder_time: time },
            })
            .in("id", idsForPeriod);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    }

    setShowTimeSetup(false);
    toast.success("Horarios salvos! Seus lembretes foram atualizados.");
  }, [user, setupTimes, allJourneyHabits, todayHabits, queryClient]);

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
        // Sensory celebration — sound + haptic
        celebrations.habitComplete();

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
      const targetDate = getBRTDateString();
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

      // Sensory celebration — sound + haptic
      celebrations.habitComplete();

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
        className="flex-1 px-4 pb-navbar space-y-5 max-w-xl mx-auto w-full"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        {/* DailyMissionCard - Journey progress + daily habit progress */}
        {todayHabits.length > 0 && (
          <DailyMissionCard
            habits={todayHabits as Habit[]}
            getHabitCompletionStatus={getHabitCompletionStatus}
          />
        )}

        {/* Next Reminder Preview — links to Profile for time adjustment */}
        {(() => {
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const journeyHabitIds = new Set(
            allJourneyHabits.filter(jh => jh.is_active).map(jh => jh.habit_id)
          );

          const upcomingReminder = todayHabits
            .filter(h =>
              journeyHabitIds.has(h.id) &&
              h.reminder_time &&
              !getHabitCompletionStatus(h.id)
            )
            .map(h => {
              const [hh, mm] = (h.reminder_time || "08:00").split(":").map(Number);
              return { habit: h, minutes: hh * 60 + mm };
            })
            .filter(r => r.minutes > currentMinutes)
            .sort((a, b) => a.minutes - b.minutes)[0];

          if (!upcomingReminder) return null;

          const { habit: nextHabit, minutes } = upcomingReminder;
          const timeStr = `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;

          return (
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/60 hover:bg-accent/5 transition-colors text-left"
            >
              <Bell className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">
                  Proximo lembrete: {timeStr}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {nextHabit.name}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          );
        })()}

        {/* Streak Protection Status */}
        {isGamificationEnabled && (
          <FreezeBadge userId={user?.id} variant="full" />
        )}

        {/* Freeze auto-used today banner */}
        {isGamificationEnabled && freezeUsedToday && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20"
          >
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <p className="text-xs text-blue-600 dark:text-blue-300">
              <strong>Streak salvo!</strong> Um freeze foi usado automaticamente hoje para proteger seu progresso.
            </p>
          </motion.div>
        )}

        {/* First Day Banner — only on Day 1 of first active journey */}
        {isFirstDay && firstActiveJourney && firstJourneyTheme && todayDayContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full rounded-2xl overflow-hidden bg-card border"
            style={{
              borderColor: `${firstJourneyTheme.color}26`,
              boxShadow: `0 4px 24px ${firstJourneyTheme.color}0D`,
            }}
          >
            {/* Theme gradient stripe */}
            <div className="h-1.5 relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: firstJourneyTheme.color }} />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
            </div>

            <div className="p-4 space-y-3">
              {/* Header with illustration */}
              <div className="flex items-center gap-3">
                <JourneyIllustration
                  illustrationKey={firstActiveJourney.illustration_key}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground">
                    Dia 1: {todayDayContent.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {firstActiveJourney.title} · {firstActiveJourney.duration_days} dias
                  </p>
                </div>
              </div>

              {/* CTA — navigate to day content */}
              <Button
                onClick={() => navigate(`/journeys/${firstActiveJourney.slug}/day/1`)}
                className="w-full h-11 rounded-xl font-semibold text-white"
                style={{
                  backgroundColor: firstJourneyTheme.color,
                  boxShadow: `0 4px 12px ${firstJourneyTheme.color}40`,
                }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Ler conteúdo do Dia 1
              </Button>

              {/* Time estimate */}
              {todayDayContent.estimated_minutes && (
                <p className="text-center text-[11px] text-muted-foreground">
                  ~{todayDayContent.estimated_minutes} min de leitura
                </p>
              )}
            </div>
          </motion.div>
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
          /* Grid de hábitos - 2 colunas com section headers */
          <div className="space-y-4">
            {/* Perfect Day Banner */}
            <AnimatePresence>
              {isPerfectDay && (
                <motion.div
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center gap-3 py-6 px-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Dia Perfeito!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Todos os {todayHabits.length} habitos concluidos. Voce arrasou!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Journey section header */}
            {hasJourneyHabits && firstActiveJourney && firstJourneyTheme && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ backgroundColor: firstJourneyTheme.color }}
                />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Hábitos da Jornada
                </span>
              </motion.div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center">
              {todayHabits.filter((h) => h.source === "journey").map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.15,
                    delay: Math.min(index * 0.03, 0.15)
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

              {/* Non-journey habits (only if no section headers needed) */}
              {!hasJourneyHabits && todayHabits.filter((h) => h.source !== "journey").map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.15,
                    delay: Math.min(index * 0.03, 0.15)
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

            {/* Personal habits section (only shown when both types exist) */}
            {hasPersonalHabits && hasJourneyHabits && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 mt-2"
                >
                  <div className="w-1 h-4 rounded-full bg-muted-foreground/30" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Meus hábitos
                  </span>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center">
                  {todayHabits.filter((h) => h.source !== "journey").map((habit, index) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.15,
                        delay: Math.min(index * 0.03, 0.15)
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
              </>
            )}
          </div>
        )}

        {/* Weekly Insight Mini-Card */}
        {!progressLoading && weeklyInsight && todayHabits.length > 0 && (
          <button
            onClick={() => navigate("/progress")}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/60 hover:bg-accent/5 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
          >
            <div className="flex-shrink-0 relative w-12 h-12">
              <svg width={48} height={48} className="transform -rotate-90" role="img" aria-label="Progresso semanal">
                <circle cx={24} cy={24} r={20} stroke="currentColor" strokeWidth={3}
                  fill="none" className="text-muted/20" />
                <circle cx={24} cy={24} r={20} stroke="currentColor" strokeWidth={3}
                  fill="none" strokeLinecap="round" className="text-primary"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - (weeklyInsight.thisWeekConsistency || 0) / 100)}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                {weeklyInsight.thisWeekConsistency || 0}%
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Esta semana</p>
              <p className="text-xs text-muted-foreground">
                {weeklyInsight.perfectDaysThisWeek || 0} {(weeklyInsight.perfectDaysThisWeek || 0) === 1 ? "dia perfeito" : "dias perfeitos"}
                {weeklyInsight.delta !== 0 && (
                  <span className={weeklyInsight.delta > 0 ? "text-green-500 ml-1" : "text-red-400 ml-1"}>
                    {weeklyInsight.delta > 0 ? "+" : ""}{weeklyInsight.delta}%
                  </span>
                )}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </button>
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

      {/* Re-permission dialog for streak-7 / journey-start triggers */}
      {notifTrigger && (
        <NotificationPermissionDialog
          trigger={notifTrigger}
          onClose={() => setNotifTrigger(null)}
        />
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

      {/* Reminder Time Quick-Setup Drawer (Sprint 2) */}
      <Drawer open={showTimeSetup} onOpenChange={setShowTimeSetup}>
        <DrawerContent className="px-6 pb-8">
          <div className="pt-4 pb-6 text-center">
            <h3 className="text-lg font-bold text-foreground">
              Quando voce quer ser lembrado?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure seus horarios ideais
            </p>
          </div>

          <div className="space-y-4">
            {([
              { period: "morning" as const, label: "Manha", icon: Sun },
              { period: "afternoon" as const, label: "Tarde", icon: Sunset },
              { period: "evening" as const, label: "Noite", icon: Moon },
            ]).map(({ period, label, icon: Icon }) => (
              <div key={period} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="flex-1 text-sm font-medium text-foreground">{label}</p>
                <input
                  type="time"
                  value={setupTimes[period]}
                  onChange={(e) => setSetupTimes(prev => ({ ...prev, [period]: e.target.value }))}
                  className="h-10 w-24 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground text-center"
                  aria-label={`Horário ${label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handleSaveSetupTimes}
            className="w-full mt-6 h-12 bg-primary text-primary-foreground font-semibold rounded-xl"
          >
            Salvar
          </Button>

          <button
            onClick={() => setShowTimeSetup(false)}
            className="w-full mt-2 py-3 text-sm text-muted-foreground font-medium"
          >
            Pular por enquanto
          </button>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Dashboard;
