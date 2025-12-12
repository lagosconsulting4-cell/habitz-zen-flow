import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { generateRecommendations } from "@/lib/generateRecommendations";
import posthog from "posthog-js";
import type {
  AgeRange,
  Profession,
  WorkSchedule,
  EnergyPeak,
  TimeAvailable,
  Objective,
  RecommendedHabit,
} from "@/lib/quizConfig";

// ============================================================================
// TYPES
// ============================================================================

export type WeekDaysPreset = "weekdays" | "everyday" | "custom";

export interface QuizState {
  // Navigation
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;

  // Contact Information
  email: string | null;
  name: string | null;

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

  // Status
  isGeneratingRoutine: boolean;
}

export interface QuizContextType extends QuizState {
  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Data Updates
  setEmail: (email: string) => void;
  setName: (name: string) => void;
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

  // Helpers
  isStepValid: () => boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const QuizContext = createContext<QuizContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface QuizProviderProps {
  children: ReactNode;
}

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
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
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);

  // 12 Steps: Age, Profession, WorkSchedule, EnergyPeak, TimeAvailable, Objective, Challenges, WeekDays, Email, Name, Offer, LockedPreview
  const totalSteps = 12;

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);

      // Track step view
      posthog.capture("quiz_step_view", {
        step,
        total_steps: totalSteps,
        progress: Math.round(((step + 1) / totalSteps) * 100),
      });
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);

      // Track step completion
      posthog.capture("quiz_step_complete", {
        completed_step: currentStep,
        next_step: newStep,
        total_steps: totalSteps,
        progress: Math.round((newStep / totalSteps) * 100),
      });
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
      case 0: // Age
        return ageRange !== null;
      case 1: // Profession
        return profession !== null;
      case 2: // Work Schedule
        return workSchedule !== null;
      case 3: // Energy Peak
        return energyPeak !== null;
      case 4: // Time Available
        return timeAvailable !== null;
      case 5: // Objective
        return objective !== null;
      case 6: // Challenges
        return challenges.length > 0;
      case 7: // Week Days
        return weekDays.length > 0;
      case 8: // Email
        return email !== null && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      case 9: // Name
        return name !== null && name.trim().length >= 2;
      case 10: // Offer (always valid)
        return true;
      case 11: // Locked Preview (always valid)
        return true;
      default:
        return false;
    }
  }, [currentStep, ageRange, profession, workSchedule, energyPeak, timeAvailable, objective, challenges, weekDays, email, name]);

  // ============================================================================
  // HABIT MANAGEMENT
  // ============================================================================

  const toggleChallenge = useCallback((challenge: string) => {
    setChallenges((prev) =>
      prev.includes(challenge) ? prev.filter((c) => c !== challenge) : [...prev, challenge]
    );
  }, []);

  // ============================================================================
  // ROUTINE GENERATION - 4-Layer Smart Algorithm
  // ============================================================================

  const generateRoutine = useCallback(async () => {
    // Validate required data
    if (!objective || !timeAvailable || !workSchedule || !energyPeak) {
      console.error("Missing required quiz data for routine generation");
      return;
    }

    setIsGeneratingRoutine(true);

    // Track quiz completion
    posthog.capture("quiz_completed", {
      objective,
      time_available: timeAvailable,
      work_schedule: workSchedule,
      energy_peak: energyPeak,
      challenges_count: challenges.length,
      week_days_count: weekDays.length,
    });

    try {
      // Add artificial delay for better UX (shows loading state)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate recommendations using the 4-layer algorithm
      const recommendations = generateRecommendations({
        objective,
        challenges,
        timeAvailable,
        workSchedule,
        energyPeak,
        weekDays,
      });

      // Set recommended habits
      setRecommendedHabits(recommendations);

      // Track successful routine generation
      posthog.capture("routine_generated", {
        habits_count: recommendations.length,
      });
    } catch (error) {
      console.error("Failed to generate routine:", error);

      // Track error
      posthog.capture("routine_generation_error", {
        error: String(error),
      });
    } finally {
      setIsGeneratingRoutine(false);
    }
  }, [objective, challenges, timeAvailable, workSchedule, energyPeak, weekDays]);

  // ============================================================================
  // CONTEXT VALUE - Memoized to prevent unnecessary re-renders
  // ============================================================================

  const value = useMemo<QuizContextType>(
    () => ({
      // State
      currentStep,
      totalSteps,
      canGoBack,
      canGoNext,
      email,
      name,
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
      isGeneratingRoutine,

      // Navigation
      goToStep,
      nextStep,
      prevStep,

      // Data Updates
      setEmail,
      setName,
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

      // Helpers
      isStepValid,
    }),
    [
      currentStep,
      canGoBack,
      canGoNext,
      email,
      name,
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
      isGeneratingRoutine,
      goToStep,
      nextStep,
      prevStep,
      toggleChallenge,
      generateRoutine,
      isStepValid,
    ]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

// ============================================================================
// HOOK
// ============================================================================

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);

  if (!context) {
    throw new Error("useQuiz must be used within QuizProvider");
  }

  return context;
};
