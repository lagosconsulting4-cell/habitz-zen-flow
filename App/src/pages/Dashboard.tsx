import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Plus, Bell, ChevronRight, Sun, Sunrise, Sunset, Moon, Shield, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { DashboardSkeleton } from "@/components/ui/skeleton";

import { DashboardHeroSection } from "@/components/DashboardHeroSection";
import { CircularHabitCard } from "@/components/CircularHabitCard";
import { HabitListItem } from "@/components/HabitListItem";
import { WeeklyOverview } from "@/components/WeeklyOverview";
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
import { usePremium } from "@/hooks/usePremium";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { useGamification, XP_VALUES, GEM_VALUES } from "@/hooks/useGamification";
import { celebrations } from "@/lib/celebrations";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Habit } from "@/components/DashboardHabitCard";
import { hideGamification } from "@/config/featureFlags";
import useProgress from "@/hooks/useProgress";
import { useAllActiveJourneyHabits, useJourneyActions, CANONICAL_TO_ICON, type Journey } from "@/hooks/useJourney";
import { JourneyIllustration, getJourneyTheme } from "@/components/JourneyIllustration";
import { JourneyDayCompleteModal } from "@/components/JourneyDayCompleteModal";
import { JourneyGraduationModal } from "@/components/JourneyGraduationModal";
import { DayCompleteModal } from "@/components/DayCompleteModal";
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
  const { onboardingCompletedAt } = usePremium(user?.id);

  // Detecta se é o primeiro dia pós-onboarding (últimas 48h)
  const isFirstDayAfterOnboarding = useMemo(() => {
    if (!onboardingCompletedAt) return false;
    const completedAt = new Date(onboardingCompletedAt).getTime();
    const hoursSince = (Date.now() - completedAt) / (1000 * 60 * 60);
    return hoursSince < 48;
  }, [onboardingCompletedAt]);
  const { awardHabitXP, awardStreakBonus, awardPerfectDayBonus, awardJourneyDayGems, awardJourneyPhaseGems, awardJourneyCompleteGems, unlockAchievement, isAchievementUnlocked, getAchievementProgress, updateStreak, freezeUsedToday, progress: userProgress } = useGamification(user?.id);
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

  // Day Complete modal state
  const [showDayComplete, setShowDayComplete] = useState(false);
  const dayCompleteShownRef = useRef<string | null>(null); // stores BRT date when last shown

  // DEV: expose for testing — remove before production
  // DEV: expose for testing — remove before production
  useEffect(() => {
    (window as any).__showDayComplete = () => setShowDayComplete(true);
    (window as any).__showJourneyComplete = (slug?: string, day?: number) => {
      setCompletingJourney({ journeyId: "test", themeSlug: slug || "own-mornings" });
      setJourneyDayComplete({
        dayNumber: day || 7,
        totalDays: 30,
        journeyTitle: "Elite Morning",
        phaseCompleted: false,
        journeyCompleted: false,
        newHabitPreview: null,
      });
    };
    return () => {
      delete (window as any).__showDayComplete;
      delete (window as any).__showJourneyComplete;
    };
  }, []);

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
    if (activeStates.length === 0 || allJourneyHabits.length === 0) return;

    for (const activeJourney of activeStates) {
      const todayStr = getBRTDateString();
      const completionKey = `${activeJourney.journey_id}:${todayStr}`;
      if (journeyDayCompletedRef.current.has(completionKey)) continue;

      // Skip if day was already advanced today (prevents re-advance on page reload).
      // On day 1 (never advanced), always allow; on day 2+, only advance if
      // updated_at is from a previous day (meaning habits are freshly completed today).
      if (activeJourney.current_day > 1 && activeJourney.updated_at) {
        const updatedDate = getBRTDateString(new Date(activeJourney.updated_at));
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
  }, [activeStates, allJourneyHabits, getHabitCompletionStatus, completeDay]);

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

  // ── Group habits by journey ──
  const habitsByJourney = useMemo(() => {
    const map = new Map<string, Habit[]>();
    for (const habit of todayHabits) {
      if (habit.source !== 'journey') continue;
      const jh = allJourneyHabits.find(j => j.habit_id === habit.id && j.is_active);
      if (!jh) continue;
      const arr = map.get(jh.journey_id) || [];
      arr.push(habit as Habit);
      map.set(jh.journey_id, arr);
    }
    return map;
  }, [todayHabits, allJourneyHabits]);

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

  // ── Period-based grouping for redesigned dashboard ──
  const PERIOD_CONFIG = useMemo(() => ({
    morning: { label: "Manha", timeRange: "06:00 - 12:00", icon: Sunrise },
    afternoon: { label: "Tarde", timeRange: "12:00 - 18:00", icon: Sun },
    evening: { label: "Noite", timeRange: "18:00 - 00:00", icon: Moon },
  }), []);

  const habitsByPeriod = useMemo(() => {
    const map: Record<string, typeof todayHabits> = { morning: [], afternoon: [], evening: [] };
    todayHabits.forEach((h) => {
      const period = (h as any).period || "morning";
      if (map[period]) map[period].push(h);
      else map.morning.push(h);
    });
    return map;
  }, [todayHabits]);

  const completedCount = useMemo(
    () => todayHabits.filter((h) => getHabitCompletionStatus(h.id)).length,
    [todayHabits, getHabitCompletionStatus]
  );

  const getJourneyTitleForHabit = useCallback((habitId: string): string | undefined => {
    const jh = allJourneyHabits.find((j) => j.habit_id === habitId && j.is_active);
    if (!jh) return undefined;
    return (journeyLookup.get(jh.journey_id) as Journey | undefined)?.title;
  }, [allJourneyHabits, journeyLookup]);

  const getThemeColorForHabit = useCallback((habitId: string): string | undefined => {
    const slug = habitThemeMap.get(habitId);
    if (!slug) return undefined;
    const theme = getJourneyTheme(slug);
    return theme.color;
  }, [habitThemeMap]);

  // Primary journey title for hero section
  const primaryJourneyTitle = useMemo(() => {
    if (activeStates.length === 0) return undefined;
    const first = activeStates[0]?.journeys as Journey | undefined;
    return first?.title;
  }, [activeStates]);

  // Weekly completion data for WeeklyOverview
  const getCompletionForDate = useCallback((date: Date): { completed: number; total: number } => {
    const habits = getHabitsForDate(date);
    if (habits.length === 0) return { completed: 0, total: 0 };
    const completed = habits.filter((h) => getHabitCompletionStatus(h.id)).length;
    return { completed, total: habits.length };
  }, [getHabitsForDate, getHabitCompletionStatus]);

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
            const todayBRT = getBRTDateString();
            if (dayCompleteShownRef.current !== todayBRT) {
              dayCompleteShownRef.current = todayBRT;
              setShowDayComplete(true);
            }
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
          const todayBRT = getBRTDateString();
          if (dayCompleteShownRef.current !== todayBRT) {
            dayCompleteShownRef.current = todayBRT;
            setShowDayComplete(true);
          }
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
        className="flex-1 px-4 pb-navbar space-y-5 max-w-xl md:max-w-3xl mx-auto w-full"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        {todayHabits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center py-12 md:py-16"
          >
            {isFirstDayAfterOnboarding ? (
              /* ── Day-1 state: rotina criada, sem hábitos hoje ── */
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="mb-6"
                >
                  <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-primary/15">
                    <Sparkles size={30} strokeWidth={1.5} className="text-primary" />
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: "2.5s" }} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-center mb-8 px-4"
                >
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    Boa! Sua rotina já está montada.
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed">
                    Cada hábito começa no melhor dia pra ele — então hoje pode estar mais leve. Que tal já dar o primeiro passo?
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="flex flex-col items-center gap-3"
                >
                  <Button
                    onClick={() => navigate("/create")}
                    className="h-13 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 transition-all"
                  >
                    Criar hábito para hoje
                  </Button>
                  <button
                    onClick={() => navigate("/journeys")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ou explorar jornadas
                  </button>
                </motion.div>
              </>
            ) : (
              /* ── Empty state padrão ── */
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="mb-6"
                >
                  <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-primary/10 dark:bg-primary/15">
                    <Sparkles size={32} strokeWidth={1.5} className="text-primary" />
                  </div>
                </motion.div>

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
              </>
            )}
          </motion.div>
        ) : (
          <>
            {/* Mini-progresso do dia (Home enxuta: só os hábitos + um indicador discreto) */}
            <div className="pt-1">
              <div className="flex items-end justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Hoje</h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium tabular-nums text-muted-foreground">
                    {completedCount} de {todayHabits.length} concluídos
                  </span>
                  {/* Gerenciar hábitos (editar/excluir) — a tela /habits saiu do nav */}
                  <button
                    onClick={() => navigate("/habits")}
                    aria-label="Gerenciar hábitos"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    <Settings2 className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${todayHabits.length ? Math.round((completedCount / todayHabits.length) * 100) : 0}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

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

            {/* 3. Habits by Period */}
            <div className="space-y-5">
              {(["morning", "afternoon", "evening"] as const).map((periodKey) => {
                const config = PERIOD_CONFIG[periodKey];
                const habits = habitsByPeriod[periodKey];
                if (!habits || habits.length === 0) return null;

                const PeriodIcon = config.icon;

                return (
                  <div key={periodKey}>
                    {/* Period header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                          {config.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                        {config.timeRange}
                      </span>
                    </div>

                    {/* Hábitos — círculo + ícone + anel + legenda (grid 2 colunas) */}
                    <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-7 pt-1">
                      {habits.map((habit, index) => (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15, delay: Math.min(index * 0.04, 0.2) }}
                        >
                          <CircularHabitCard
                            habit={habit as Habit}
                            progress={isCompletedToday(habit.id) ? 100 : 0}
                            completed={isCompletedToday(habit.id)}
                            onToggle={() => handleToggle(habit as Habit)}
                            streakDays={habit.streak}
                            isDarkMode={isDarkMode}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Perfect Day Banner */}
              <AnimatePresence>
                {isPerfectDay && (
                  <motion.div
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="flex flex-col items-center gap-3 py-6 px-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 text-center">
                      <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Dia Perfeito!</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Todos os {todayHabits.length} habitos concluidos. Voce arrasou!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
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

      {/* Day Complete Modal */}
      <DayCompleteModal
        isOpen={showDayComplete}
        onClose={() => setShowDayComplete(false)}
        streakDays={userProgress?.current_streak || 0}
        gemsAwarded={GEM_VALUES.PERFECT_DAY}
      />

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
