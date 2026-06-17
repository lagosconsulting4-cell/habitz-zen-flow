import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/hooks/useGamification";
import { useJourneyActions } from "@/hooks/useJourney";
import { useEventTracker } from "@/hooks/useEventTracker";
import { useQuizData, type QuizData } from "./useQuizData";
import { useTour } from "@/contexts/TourContext";
import type { RecommendedHabitV2 } from "./generateRecommendationsV2";
import { calculateJourneyScores } from "./calculateJourneyScores";

// Step IDs for analytics (mirrors OnboardingFlowV2.tsx STEPS config)
const STEP_IDS = [
  'welcome', 'intro', 'objective', 'pwa-soft',
  'wake-sleep', 'weekend', 'life-areas', 'experience',
  'loading', 'preview', 'confirm',
  'journeys-intro', 'journey-select',
  'pwa-hard', 'notifications', 'reminder-offset',
  'celebration',
] as const;
const STEP_PHASES = [0,0,0,0, 1,1,1,1, 2,2,2, 3,3, 4,4,4, 5] as const;

// ============================================================================
// TYPES
// ============================================================================

export type WeekendDiff = 'same' | 'different' | 'varies';
export type LifeArea = 'work' | 'physical' | 'mind' | 'relationships';
export type HabitExperience = 'never' | 'tried' | 'already_have';

export interface WakeSleeTime {
  wake: string;   // "HH:mm"
  sleep: string;  // "HH:mm"
}

// --- Split context types ---

export interface OnboardingNavContextType {
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export interface OnboardingDataContextType {
  // Quiz data
  quizData: QuizData | null;
  isLoadingQuizData: boolean;
  quizResponseId: string | null;
  // Collected inputs
  wakeSleepTime: WakeSleeTime;
  weekendDiff: WeekendDiff | null;
  lifeAreas: LifeArea[];
  habitExperience: HabitExperience | null;
  confirmedObjective: string | null;
  collectedName: string | null;
  // PWA
  isPWAInstalled: boolean;
  // Generated routine
  generatedHabits: RecommendedHabitV2[];
  selectedHabitIds: Set<string>;
  isGeneratingRoutine: boolean;
  // Journeys
  journeyScores: Record<string, number>;
  journeyDominantSignals: Record<string, string>;
  selectedJourneyIds: Set<string>;
  journeyBadges: string[];
  // Foquinha bridge (existing data from WhatsApp onboarding)
  existingHabits: Array<{ id: string; name: string; emoji: string | null; category: string | null; period: string | null; reminder_time: string | null; frequency_type: string | null; days_of_week: number[] | null; source: string | null }>;
  hasFoquinhaData: boolean;
  existingNotifPrefs: Record<string, unknown> | null;
  // Notifications + tour
  notificationsGranted: boolean;
  tourStep: number;
  // Setters
  setWakeSleepTime: (v: WakeSleeTime) => void;
  setWeekendDiff: (v: WeekendDiff) => void;
  setLifeAreas: (v: LifeArea[]) => void;
  toggleLifeArea: (area: LifeArea) => void;
  setHabitExperience: (v: HabitExperience) => void;
  setConfirmedObjective: (v: string) => void;
  setCollectedName: (v: string) => void;
  setIsPWAInstalled: (v: boolean) => void;
  setGeneratedHabits: (v: RecommendedHabitV2[]) => void;
  setIsGeneratingRoutine: (v: boolean) => void;
  toggleHabit: (id: string) => void;
  setSelectedHabitIds: (v: Set<string>) => void;
  setJourneyScores: (v: Record<string, number>) => void;
  setJourneyDominantSignals: (v: Record<string, string>) => void;
  toggleJourney: (id: string) => void;
  setNotificationsGranted: (v: boolean) => void;
  setTourStep: (v: number) => void;
}

export interface OnboardingActionsContextType {
  isStepValid: () => boolean;
  submitOnboardingV2: () => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}

// Backward-compatible composed type (used by useOnboardingV2)
export interface OnboardingV2ContextType extends OnboardingNavContextType, OnboardingDataContextType, OnboardingActionsContextType {}

// Legacy alias kept for external consumers
export interface OnboardingV2State extends OnboardingNavContextType, Omit<OnboardingDataContextType, keyof OnboardingActionsContextType>, OnboardingActionsContextType {}

// ============================================================================
// CONTEXTS
// ============================================================================

const OnboardingNavContext = createContext<OnboardingNavContextType | null>(null);
const OnboardingDataContext = createContext<OnboardingDataContextType | null>(null);
const OnboardingActionsContext = createContext<OnboardingActionsContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

const TOTAL_STEPS = 17;

interface OnboardingProviderV2Props {
  children: ReactNode;
  initialStep?: number;
}

export const OnboardingProviderV2: React.FC<OnboardingProviderV2Props> = ({ children, initialStep }) => {
  // External hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { startTour } = useTour();
  const { addXP } = useGamification(user?.id);
  const { startJourney } = useJourneyActions();
  const { trackEvent } = useEventTracker();

  // Quiz data hook
  const { quizData, isLoading: isLoadingQuizData, quizResponseId } = useQuizData();

  // Navigation
  const [currentStep, setCurrentStep] = useState(
    import.meta.env.DEV && initialStep != null ? initialStep : 0
  );

  // Collected data
  const [wakeSleepTime, setWakeSleepTime] = useState<WakeSleeTime>({ wake: '07:00', sleep: '23:00' });
  const [weekendDiff, setWeekendDiff] = useState<WeekendDiff | null>(null);
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [habitExperience, setHabitExperience] = useState<HabitExperience | null>(null);
  const [confirmedObjective, setConfirmedObjective] = useState<string | null>(null);
  const [collectedName, setCollectedName] = useState<string | null>(null);

  // PWA
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  // Generated routine
  const [generatedHabits, setGeneratedHabits] = useState<RecommendedHabitV2[]>([]);
  const [selectedHabitIds, setSelectedHabitIds] = useState<Set<string>>(new Set());
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);

  // Journeys
  const [journeyScores, setJourneyScores] = useState<Record<string, number>>({});
  const [journeyDominantSignals, setJourneyDominantSignals] = useState<Record<string, string>>({});
  const [selectedJourneyIds, setSelectedJourneyIds] = useState<Set<string>>(new Set());
  const [journeyBadges, setJourneyBadges] = useState<string[]>([]);

  // Notifications
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  // Tour
  const [tourStep, setTourStep] = useState(0);

  // Foquinha bridge — existing data from prior onboarding
  const [existingHabits, setExistingHabits] = useState<OnboardingDataContextType["existingHabits"]>([]);
  const [hasFoquinhaData, setHasFoquinhaData] = useState(false);
  const [existingNotifPrefs, setExistingNotifPrefs] = useState<Record<string, unknown> | null>(null);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // INITIALIZE FROM QUIZ DATA
  // ============================================================================

  useEffect(() => {
    if (quizData?.objective && confirmedObjective === null) {
      setConfirmedObjective(quizData.objective);
    }
  }, [quizData?.objective, confirmedObjective]);

  // Fetch existing habits & notification prefs (Foquinha bridge)
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const [habitsRes, progressRes] = await Promise.all([
          supabase.from("habits").select("id, name, emoji, category, period, reminder_time, frequency_type, days_of_week, source").eq("user_id", user.id).eq("is_active", true),
          supabase.from("user_progress").select("notification_preferences").eq("user_id", user.id).maybeSingle(),
        ]);
        if (habitsRes.data && habitsRes.data.length > 0) {
          setExistingHabits(habitsRes.data);
          setHasFoquinhaData(true);
        }
        if (progressRes.data?.notification_preferences) {
          setExistingNotifPrefs(progressRes.data.notification_preferences as Record<string, unknown>);
        }
      } catch (err) {
        console.warn("Foquinha bridge fetch failed:", err);
      }
    })();
  }, [user?.id]);

  // Calculate journey scores when all Phase 1 data is collected
  useEffect(() => {
    if (!habitExperience || !confirmedObjective || !quizData) return;
    const result = calculateJourneyScores({
      quizData,
      lifeAreas,
      habitExperience,
      wakeSleepTime,
      confirmedObjective,
    });
    setJourneyScores(result.scores);
    setJourneyDominantSignals(result.dominantSignals);
    setJourneyBadges(result.badges);
  }, [habitExperience, confirmedObjective, quizData, lifeAreas, wakeSleepTime]);

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  const hasTrackedStart = useRef(false);
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  // Track onboarding started (once)
  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackEvent("onboarding_v2_started", {}, "onboarding_v2");
    }
  }, [trackEvent]);

  // Track abandoned on unmount (if not completed)
  useEffect(() => {
    return () => {
      const step = currentStepRef.current;
      if (step < TOTAL_STEPS - 1) {
        trackEvent("onboarding_v2_abandoned", {
          last_step: STEP_IDS[step] || `step_${step}`,
          phase: STEP_PHASES[step] ?? -1,
        }, "onboarding_v2");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
    }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, TOTAL_STEPS - 1);
      trackEvent("onboarding_v2_step_completed", {
        step_id: STEP_IDS[prev] || `step_${prev}`,
        phase: STEP_PHASES[prev] ?? -1,
      }, "onboarding_v2");
      return next;
    });
  }, [trackEvent]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  // ============================================================================
  // TOGGLE HELPERS
  // ============================================================================

  const toggleLifeArea = useCallback((area: LifeArea) => {
    setLifeAreas(prev => {
      if (prev.includes(area)) {
        return prev.filter(a => a !== area);
      }
      return [...prev, area];
    });
  }, []);

  const toggleHabit = useCallback((id: string) => {
    setSelectedHabitIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleJourney = useCallback((id: string) => {
    setSelectedJourneyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 2) {
        // Max 2 journeys
        next.add(id);
      }
      return next;
    });
  }, []);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const isStepValid = useCallback((): boolean => {
    switch (currentStep) {
      case 0: // welcome — name must exist (from quiz or manually entered)
        return !!(quizData?.name || (collectedName && collectedName.trim().length > 0));
      case 2: // objective — must have confirmed objective
        return confirmedObjective !== null;
      case 4: // wake-sleep — always valid (has defaults)
        return true;
      case 5: // weekend diff
        return weekendDiff !== null;
      case 6: // life areas — at least 1
        return lifeAreas.length >= 1;
      case 7: // habit experience
        return habitExperience !== null;
      case 9: // preview — at least 1 habit selected
        return selectedHabitIds.size >= 1;
      default:
        return true;
    }
  }, [currentStep, quizData?.name, collectedName, confirmedObjective, weekendDiff, lifeAreas, habitExperience, selectedHabitIds]);

  // ============================================================================
  // SUBMIT (follows v1 pattern from OnboardingProvider.tsx:370-541)
  // ============================================================================

  const submitOnboardingV2 = useCallback(async () => {
    if (!user) return;
    setIsSubmitting(true);

    // Map units — same as OnboardingProvider.tsx:376-386
    const mapUnit = (unit?: string): "none" | "steps" | "minutes" | "km" | "custom" => {
      const validUnits = ["none", "steps", "minutes", "km", "custom"];
      if (unit && validUnits.includes(unit)) return unit as "none" | "steps" | "minutes" | "km" | "custom";
      if (unit === "hours") return "minutes";
      if (unit === "times" || unit === "pages") return "none";
      if (unit === "ml") return "custom";
      return "none";
    };

    // Map categories — same as OnboardingProvider.tsx:389-400
    const mapCategory = (category: string): string => {
      const categoryMap: Record<string, string> = {
        productivity: "productivity",
        avoid: "avoid",
        health: "corpo",
        mental: "mente",
        routine: "time_routine",
      };
      return categoryMap[category] || "outro";
    };

    try {
      // --- (a) Create habits (skip existing Foquinha habits) ---
      const selectedHabits = generatedHabits.filter(h => selectedHabitIds.has(h.id) && !(h as any)._isExisting);

      // Dedup check — same as v1:402-410
      const { data: existingHabits } = await supabase
        .from("habits")
        .select("name")
        .eq("user_id", user.id)
        .eq("is_active", true);
      const existingNames = new Set(
        (existingHabits || []).map(h => h.name.toLowerCase().trim())
      );

      for (const habit of selectedHabits) {
        if (existingNames.has(habit.name.toLowerCase().trim())) continue;
        const { error: habitError } = await supabase.from("habits").insert({
          user_id: user.id,
          name: habit.name,
          description: habit.description ?? null,
          category: mapCategory(habit.category),
          period: habit.period,
          emoji: habit.icon,
          icon_key: habit.icon_key,
          color: habit.color,
          goal_value: habit.goal_value,
          unit: mapUnit(habit.goal_unit),
          frequency_type: habit.frequency_type || "fixed_days",
          days_of_week: habit.frequency_days || [1, 2, 3, 4, 5, 6, 0],
          reminder_time: habit.suggested_time || null,
          duration_minutes: habit.duration || null,
          priority: habit.priority || 5,
          template_id: habit.template_id || null,
          recommendation_score: habit.recommendation_score || null,
          source: "onboarding_v2",
          is_active: true,
        });
        if (habitError) {
          if (habitError.code !== "23505") {
            // 23505 = duplicate key — já existe (edge case Unicode), seguro ignorar
            console.error("Failed to create habit:", habit.name, habitError);
          }
        }
      }

      // --- (b) Save journey recommendation scores ---
      if (Object.keys(journeyScores).length > 0) {
        const scoreRows = Object.entries(journeyScores).map(([slug, score]) => ({
          user_id: user.id,
          journey_id: slug,
          score,
          dominant_signal: journeyDominantSignals[slug] || null,
        }));
        await supabase.from("journey_recommendation_scores").upsert(scoreRows, {
          onConflict: "user_id,journey_id",
          ignoreDuplicates: true,
        });
      }

      // --- (c) Start journeys (slug→UUID lookup) ---
      const slugs = Array.from(selectedJourneyIds);
      if (slugs.length > 0) {
        const { data: journeyRows } = await supabase
          .from("journeys")
          .select("id, slug")
          .in("slug", slugs);
        for (const row of journeyRows || []) {
          try {
            await startJourney(row.id);
          } catch (err) {
            console.error("Failed to start journey:", row.slug, err);
          }
        }
      }

      // --- (d) Update profile ---
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          has_completed_onboarding: true,
          onboarding_completed_at: new Date().toISOString(),
          onboarding_version: "v2",
          onboarding_v2_data: JSON.stringify({ wakeSleepTime, weekendDiff, lifeAreas, habitExperience }),
          quiz_linked_at: quizResponseId ? new Date().toISOString() : null,
        })
        .eq("user_id", user.id);
      if (profileError) {
        console.error("Failed to update profile:", profileError);
      }

      // --- (d2) Ensure whatsapp_conversations exists (bridge for Foquinha scheduler) ---
      try {
        const { data: profileForPhone } = await supabase
          .from("profiles")
          .select("phone")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profileForPhone?.phone) {
          await supabase.from("whatsapp_conversations").upsert(
            { phone: profileForPhone.phone, user_id: user.id, messages: [] },
            { onConflict: "phone" }
          );
        }
      } catch (wcErr) {
        // Non-fatal — Foquinha will create conversation on first WhatsApp message
        console.warn("whatsapp_conversations upsert skipped:", wcErr);
      }

      // --- (e) Update quiz_responses ---
      if (quizResponseId) {
        await supabase
          .from("quiz_responses")
          .update({ converted_to_customer: true, onboarding_completed: true })
          .eq("id", quizResponseId);
      }

      // --- (f) Award XP ---
      if (addXP) {
        await addXP({
          amount: 75,
          reason: "onboarding_v2_complete",
          metadata: {
            habits_created: selectedHabits.length,
            journeys_started: slugs.length,
            notifications: notificationsGranted,
          },
        });
      }

      // --- (g) Track completion ---
      trackEvent("onboarding_v2_completed", {
        habits_created: selectedHabits.length,
        journeys_started: slugs.length,
        notifications: notificationsGranted,
      }, "onboarding_v2");

      // --- (h) Invalidate profile cache so ProtectedRoute reads updated has_completed_onboarding ---
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["premium-profile", user.id] });
      }

      // --- (i) Navigate + start tour ---
      startTour();
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("submitOnboardingV2 failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, generatedHabits, selectedHabitIds, selectedJourneyIds, quizResponseId, notificationsGranted, addXP, navigate, queryClient, startTour, startJourney, trackEvent, journeyScores, journeyDominantSignals, wakeSleepTime, weekendDiff, lifeAreas, habitExperience]);

  // ============================================================================
  // SPLIT CONTEXT VALUES — each useMemo only re-runs when its own deps change
  // ============================================================================

  // Nav context: only changes when currentStep changes
  const navValue = useMemo<OnboardingNavContextType>(() => ({
    currentStep,
    totalSteps: TOTAL_STEPS,
    goToStep,
    nextStep,
    prevStep,
  }), [currentStep, goToStep, nextStep, prevStep]);

  // Data context: changes when any quiz/input/habit/journey state changes
  const dataValue = useMemo<OnboardingDataContextType>(() => ({
    quizData,
    isLoadingQuizData,
    quizResponseId,
    wakeSleepTime,
    weekendDiff,
    lifeAreas,
    habitExperience,
    confirmedObjective,
    collectedName,
    isPWAInstalled,
    generatedHabits,
    selectedHabitIds,
    isGeneratingRoutine,
    journeyScores,
    journeyDominantSignals,
    selectedJourneyIds,
    journeyBadges,
    existingHabits,
    hasFoquinhaData,
    existingNotifPrefs,
    notificationsGranted,
    tourStep,
    setWakeSleepTime,
    setWeekendDiff,
    setLifeAreas,
    toggleLifeArea,
    setHabitExperience,
    setConfirmedObjective,
    setCollectedName,
    setIsPWAInstalled,
    setGeneratedHabits,
    setIsGeneratingRoutine,
    toggleHabit,
    setSelectedHabitIds,
    setJourneyScores,
    setJourneyDominantSignals,
    toggleJourney,
    setNotificationsGranted,
    setTourStep,
  }), [
    quizData, isLoadingQuizData, quizResponseId,
    wakeSleepTime, weekendDiff, lifeAreas, habitExperience,
    confirmedObjective, collectedName, isPWAInstalled,
    generatedHabits, selectedHabitIds, isGeneratingRoutine,
    journeyScores, journeyDominantSignals, selectedJourneyIds, journeyBadges,
    existingHabits, hasFoquinhaData, existingNotifPrefs,
    notificationsGranted, tourStep,
    toggleLifeArea, toggleHabit, toggleJourney,
  ]);

  // Actions context: changes when validation deps or submission state changes
  const actionsValue = useMemo<OnboardingActionsContextType>(() => ({
    isStepValid,
    submitOnboardingV2,
    isSubmitting,
    setIsSubmitting,
  }), [isStepValid, submitOnboardingV2, isSubmitting]);

  return (
    <OnboardingNavContext.Provider value={navValue}>
      <OnboardingDataContext.Provider value={dataValue}>
        <OnboardingActionsContext.Provider value={actionsValue}>
          {children}
        </OnboardingActionsContext.Provider>
      </OnboardingDataContext.Provider>
    </OnboardingNavContext.Provider>
  );
};

// ============================================================================
// HOOKS — use the focused sub-contexts for optimal re-render isolation
// ============================================================================

export const useOnboardingNav = (): OnboardingNavContextType => {
  const ctx = useContext(OnboardingNavContext);
  if (!ctx) throw new Error("useOnboardingNav must be used within OnboardingProviderV2");
  return ctx;
};

export const useOnboardingData = (): OnboardingDataContextType => {
  const ctx = useContext(OnboardingDataContext);
  if (!ctx) throw new Error("useOnboardingData must be used within OnboardingProviderV2");
  return ctx;
};

export const useOnboardingActions = (): OnboardingActionsContextType => {
  const ctx = useContext(OnboardingActionsContext);
  if (!ctx) throw new Error("useOnboardingActions must be used within OnboardingProviderV2");
  return ctx;
};

// Backward-compatible composed hook — subscribes to all 3 contexts.
// For optimal performance in heavy steps, use the focused hooks above directly.
export const useOnboardingV2 = (): OnboardingV2ContextType => {
  const nav = useOnboardingNav();
  const data = useOnboardingData();
  const actions = useOnboardingActions();
  return { ...nav, ...data, ...actions };
};
