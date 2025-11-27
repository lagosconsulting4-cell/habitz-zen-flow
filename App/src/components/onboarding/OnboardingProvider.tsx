import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { useGamification } from "@/hooks/useGamification";

// ============================================================================
// TYPES
// ============================================================================

export type AgeRange = "18-24" | "25-34" | "35-44" | "45-54" | "55+";
export type Profession = "clt" | "freelancer" | "entrepreneur" | "student" | "retired";
export type WorkSchedule = "morning" | "commercial" | "evening" | "flexible";
export type EnergyPeak = "morning" | "afternoon" | "evening";
export type TimeAvailable = "15min" | "30min" | "1h" | "2h+";
export type Objective = "productivity" | "health" | "mental" | "routine" | "avoid";
export type WeekDaysPreset = "weekdays" | "everyday" | "custom";

export interface RecommendedHabit {
  id: string;
  template_id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  period: "morning" | "afternoon" | "evening";
  suggested_time: string; // HH:mm format
  default_goal_value?: number;
  default_unit?: string;
  default_frequency_type?: string;
  reason: string; // Why this habit was recommended
  priority: number; // 1-10 (higher = more important)
}

export interface TimeSlots {
  morning_start: string;
  morning_end: string;
  evening_start: string;
  evening_end: string;
}

export interface OnboardingState {
  // Navigation
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;

  // Demographics
  ageRange: AgeRange | null;
  profession: Profession | null;
  workSchedule: WorkSchedule | null;

  // Preferences
  energyPeak: EnergyPeak | null;
  timeAvailable: TimeAvailable | null;
  objective: Objective | null;
  challenges: string[];

  // Routine Configuration
  weekDays: number[];
  weekDaysPreset: WeekDaysPreset;

  // Recommended Habits
  recommendedHabits: RecommendedHabit[];
  selectedHabitIds: Set<string>;

  // Status
  isGeneratingRoutine: boolean;
  isSubmitting: boolean;
}

export interface OnboardingContextType extends OnboardingState {
  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Data Updates
  setAgeRange: (age: AgeRange) => void;
  setProfession: (profession: Profession) => void;
  setWorkSchedule: (schedule: WorkSchedule) => void;
  setEnergyPeak: (peak: EnergyPeak) => void;
  setTimeAvailable: (time: TimeAvailable) => void;
  setObjective: (objective: Objective) => void;
  toggleChallenge: (challenge: string) => void;
  setWeekDaysPreset: (preset: WeekDaysPreset) => void;
  setWeekDays: (days: number[]) => void;

  // Habit Management
  generateRoutine: () => Promise<void>;
  toggleHabit: (habitId: string) => void;
  updateHabitTime: (habitId: string, time: string) => void;
  addCustomHabit: (habit: RecommendedHabit) => void;
  removeHabit: (habitId: string) => void;

  // Submission
  submitOnboarding: () => Promise<void>;

  // Helpers
  getTimeSlots: () => TimeSlots;
  isStepValid: () => boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const OnboardingContext = createContext<OnboardingContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addXP } = useGamification(user?.id);

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null);
  const [profession, setProfession] = useState<Profession | null>(null);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule | null>(null);
  const [energyPeak, setEnergyPeak] = useState<EnergyPeak | null>(null);
  const [timeAvailable, setTimeAvailable] = useState<TimeAvailable | null>(null);
  const [objective, setObjective] = useState<Objective | null>(null);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [weekDaysPreset, setWeekDaysPreset] = useState<WeekDaysPreset>("weekdays");
  const [weekDays, setWeekDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [recommendedHabits, setRecommendedHabits] = useState<RecommendedHabit[]>([]);
  const [selectedHabitIds, setSelectedHabitIds] = useState<Set<string>>(new Set());
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 10;

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const canGoBack = currentStep > 0;
  const canGoNext = currentStep < totalSteps - 1;

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const isStepValid = useCallback((): boolean => {
    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Age
        return ageRange !== null;
      case 2: // Profession
        return profession !== null;
      case 3: // Work Schedule
        return workSchedule !== null;
      case 4: // Energy Peak
        return energyPeak !== null;
      case 5: // Time Available
        return timeAvailable !== null;
      case 6: // Objective
        return objective !== null;
      case 7: // Challenges
        return challenges.length > 0;
      case 8: // Week Days
        return weekDays.length > 0;
      case 9: // Preview
        return selectedHabitIds.size >= 3;
      default:
        return false;
    }
  }, [currentStep, ageRange, profession, workSchedule, energyPeak, timeAvailable, objective, challenges, weekDays, selectedHabitIds]);

  // ============================================================================
  // TIME SLOTS CALCULATION
  // ============================================================================

  const getTimeSlots = useCallback((): TimeSlots => {
    switch (workSchedule) {
      case "morning": // 6-14h
        return {
          morning_start: "05:00",
          morning_end: "06:00",
          evening_start: "14:30",
          evening_end: "23:00",
        };
      case "commercial": // 8-18h
        return {
          morning_start: "06:00",
          morning_end: "07:30",
          evening_start: "19:00",
          evening_end: "23:00",
        };
      case "evening": // 14-22h
        return {
          morning_start: "06:00",
          morning_end: "13:00",
          evening_start: "22:30",
          evening_end: "23:59",
        };
      case "flexible":
      default:
        return {
          morning_start: "06:00",
          morning_end: "12:00",
          evening_start: "18:00",
          evening_end: "23:00",
        };
    }
  }, [workSchedule]);

  // ============================================================================
  // HABIT MANAGEMENT
  // ============================================================================

  const toggleChallenge = useCallback((challenge: string) => {
    setChallenges((prev) =>
      prev.includes(challenge) ? prev.filter((c) => c !== challenge) : [...prev, challenge]
    );
  }, []);

  const toggleHabit = useCallback((habitId: string) => {
    setSelectedHabitIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
      }
      return newSet;
    });
  }, []);

  const updateHabitTime = useCallback((habitId: string, time: string) => {
    setRecommendedHabits((prev) =>
      prev.map((habit) => (habit.id === habitId ? { ...habit, suggested_time: time } : habit))
    );
  }, []);

  const addCustomHabit = useCallback((habit: RecommendedHabit) => {
    setRecommendedHabits((prev) => [...prev, habit]);
    setSelectedHabitIds((prev) => new Set(prev).add(habit.id));
  }, []);

  const removeHabit = useCallback((habitId: string) => {
    setRecommendedHabits((prev) => prev.filter((h) => h.id !== habitId));
    setSelectedHabitIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(habitId);
      return newSet;
    });
  }, []);

  // ============================================================================
  // ROUTINE GENERATION (Placeholder - will be implemented in Sprint 3)
  // ============================================================================

  const generateRoutine = useCallback(async () => {
    setIsGeneratingRoutine(true);
    try {
      // TODO: Implement 4-layer recommendation algorithm in Sprint 3
      // For now, just generate some dummy habits
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const dummyHabits: RecommendedHabit[] = [
        {
          id: "habit-1",
          template_id: "wake_early",
          name: "Acordar Cedo",
          category: "productivity",
          icon: "🌅",
          color: "bg-orange-500",
          period: "morning",
          suggested_time: "06:00",
          reason: "Baseado no seu objetivo de produtividade",
          priority: 10,
        },
        {
          id: "habit-2",
          template_id: "meditation",
          name: "Meditação",
          category: "mental",
          icon: "🧘",
          color: "bg-purple-500",
          period: "morning",
          suggested_time: "07:00",
          reason: "Ajuda com ansiedade e foco",
          priority: 9,
        },
        {
          id: "habit-3",
          template_id: "exercise",
          name: "Exercícios",
          category: "health",
          icon: "💪",
          color: "bg-green-500",
          period: "evening",
          suggested_time: "19:00",
          reason: "Melhora saúde e bem-estar",
          priority: 8,
        },
      ];

      setRecommendedHabits(dummyHabits);
      setSelectedHabitIds(new Set(dummyHabits.map((h) => h.id)));
    } catch (error) {
      console.error("Failed to generate routine:", error);
    } finally {
      setIsGeneratingRoutine(false);
    }
  }, [objective, challenges, timeAvailable, workSchedule]);

  // ============================================================================
  // SUBMISSION
  // ============================================================================

  const submitOnboarding = useCallback(async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get selected habits
      const selectedHabits = recommendedHabits.filter((h) => selectedHabitIds.has(h.id));

      // Create habits in database
      for (const habit of selectedHabits) {
        await supabase.from("habits").insert({
          user_id: user.id,
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          goal_value: habit.default_goal_value,
          unit: habit.default_unit || "none",
          frequency_type: habit.default_frequency_type || "fixed_days",
          days_of_week: weekDays,
          reminder_time: habit.suggested_time,
          is_active: true,
        });
      }

      // Award welcome XP
      if (addXP) {
        await addXP({
          amount: 50,
          reason: "onboarding_complete",
          metadata: {
            habits_created: selectedHabits.length,
            objective,
            time_available: timeAvailable,
          },
        });
      }

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to submit onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, recommendedHabits, selectedHabitIds, weekDays, objective, timeAvailable, addXP, navigate]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: OnboardingContextType = {
    // State
    currentStep,
    totalSteps,
    canGoBack,
    canGoNext,
    ageRange,
    profession,
    workSchedule,
    energyPeak,
    timeAvailable,
    objective,
    challenges,
    weekDaysPreset,
    weekDays,
    recommendedHabits,
    selectedHabitIds,
    isGeneratingRoutine,
    isSubmitting,

    // Navigation
    goToStep,
    nextStep,
    prevStep,

    // Data Updates
    setAgeRange,
    setProfession,
    setWorkSchedule,
    setEnergyPeak,
    setTimeAvailable,
    setObjective,
    toggleChallenge,
    setWeekDaysPreset,
    setWeekDays,

    // Habit Management
    generateRoutine,
    toggleHabit,
    updateHabitTime,
    addCustomHabit,
    removeHabit,

    // Submission
    submitOnboarding,

    // Helpers
    getTimeSlots,
    isStepValid,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

// ============================================================================
// HOOK
// ============================================================================

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }

  return context;
};
