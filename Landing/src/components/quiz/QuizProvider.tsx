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
  FinancialRange,
  Gender,
  ConsistencyFeeling,
  ProjectedFeeling,
  YearsPromising,
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
  phone: string | null;

  // Demographics
  ageRange: AgeRange | null;
  profession: Profession | null;
  workSchedule: WorkSchedule | null;
  gender: Gender | null;
  financialRange: FinancialRange | null;

  // Preferences
  energyPeak: EnergyPeak | null;
  timeAvailable: TimeAvailable | null;
  objective: Objective | null;
  challenges: string[];

  // Emotional/Psychological
  consistencyFeeling: ConsistencyFeeling | null;
  projectedFeeling: ProjectedFeeling | null;
  yearsPromising: YearsPromising | null;

  // Routine Configuration
  weekDays: number[];
  weekDaysPreset: WeekDaysPreset;

  // Recommended Habits
  recommendedHabits: RecommendedHabit[];

  // Tracking/Display
  currentDate: string;
  primaryChallenge: string | null;

  // PWA
  pwaInstallPromptShown: boolean;
  pwaInstalled: boolean;

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
  setPhone: (phone: string) => void;
  setAgeRange: (age: AgeRange) => void;
  setProfession: (profession: Profession) => void;
  setWorkSchedule: (schedule: WorkSchedule) => void;
  setGender: (gender: Gender) => void;
  setFinancialRange: (range: FinancialRange) => void;
  setEnergyPeak: (peak: EnergyPeak) => void;
  setTimeAvailable: (time: TimeAvailable) => void;
  setObjective: (objective: Objective) => void;
  toggleChallenge: (challenge: string) => void;
  setConsistencyFeeling: (feeling: ConsistencyFeeling) => void;
  setProjectedFeeling: (feeling: ProjectedFeeling) => void;
  setYearsPromising: (years: YearsPromising) => void;
  setWeekDaysPreset: (preset: WeekDaysPreset) => void;
  setWeekDays: (days: number[]) => void;
  setPwaInstallPromptShown: (shown: boolean) => void;
  setPwaInstalled: (installed: boolean) => void;

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
  // State - Contact
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

  // State - Demographics
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null);
  const [profession, setProfession] = useState<Profession | null>(null);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [financialRange, setFinancialRange] = useState<FinancialRange | null>(null);

  // State - Preferences
  const [energyPeak, setEnergyPeak] = useState<EnergyPeak | null>(null);
  const [timeAvailable, setTimeAvailable] = useState<TimeAvailable | null>(null);
  const [objective, setObjective] = useState<Objective | null>(null);
  const [challenges, setChallenges] = useState<string[]>([]);

  // State - Emotional/Psychological
  const [consistencyFeeling, setConsistencyFeeling] = useState<ConsistencyFeeling | null>(null);
  const [projectedFeeling, setProjectedFeeling] = useState<ProjectedFeeling | null>(null);
  const [yearsPromising, setYearsPromising] = useState<YearsPromising | null>(null);

  // State - Routine
  const [weekDaysPreset, setWeekDaysPreset] = useState<WeekDaysPreset>("weekdays");
  const [weekDays, setWeekDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [recommendedHabits, setRecommendedHabits] = useState<RecommendedHabit[]>([]);

  // State - Tracking/Display
  const [currentDate] = useState<string>(new Date().toLocaleDateString("pt-BR"));
  const [primaryChallenge, setPrimaryChallenge] = useState<string | null>(null);

  // State - PWA
  const [pwaInstallPromptShown, setPwaInstallPromptShown] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  // State - Status
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);

  // 24 Steps: Hero, Objective, Time, FeedbackTime, Energy, WorkSchedule, Financial, FeedbackAdapt,
  // Age, FeedbackAgeChart, Challenges, Gender, SocialProofChart, ConsistencyFeeling,
  // ProjectedFeeling, Testimonials, YearsPromising, Urgency, PotentialChart, AppExplanation,
  // Loading, DataCollection, SubscriptionOffersStep
  const totalSteps = 25;

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
      case 0: // HeroStep - intro screen
        return true;
      case 1: // ObjectiveStep
        return objective !== null;
      case 2: // TimeAvailableStep
        return timeAvailable !== null;
      case 3: // FeedbackTimeStep - feedback screen
        return true;
      case 4: // EnergyPeakStep
        return energyPeak !== null;
      case 5: // WorkScheduleStep
        return workSchedule !== null;
      case 6: // FinancialRangeStep
        return financialRange !== null;
      case 7: // ProfessionStep
        return profession !== null;
      case 8: // FeedbackAdaptStep - feedback screen
        return true;
      case 9: // AgeStep
        return ageRange !== null;
      case 10: // FeedbackAgeChartStep - chart screen
        return true;
      case 11: // ChallengesStep
        return challenges.length > 0;
      case 12: // GenderStep
        return gender !== null;
      case 13: // SocialProofChartStep - chart screen
        return true;
      case 14: // ConsistencyFeelingStep
        return consistencyFeeling !== null;
      case 15: // ProjectedFeelingStep
        return projectedFeeling !== null;
      case 16: // TestimonialsStep - feedback screen
        return true;
      case 17: // YearsPromisingStep
        return yearsPromising !== null;
      case 18: // UrgencyStep - feedback screen
        return true;
      case 19: // PotentialChartStep - chart screen
        return true;
      case 20: // AppExplanationStep - explanation screen
        return true;
      case 21: // LoadingStep - auto-advances
        return true;
      case 22: // DataCollectionStep - has its own validation
        return true;
      case 23: // SubscriptionOffersStep - final step
        return true;
      default:
        return false;
    }
  }, [currentStep, objective, timeAvailable, energyPeak, workSchedule, financialRange, profession, ageRange, challenges, gender, consistencyFeeling, projectedFeeling, yearsPromising]);

  // ============================================================================
  // HABIT MANAGEMENT
  // ============================================================================

  const toggleChallenge = useCallback((challenge: string) => {
    setChallenges((prev) => {
      const newChallenges = prev.includes(challenge)
        ? prev.filter((c) => c !== challenge)
        : [...prev, challenge];

      // Set primary challenge to the first selected challenge
      if (newChallenges.length > 0 && !primaryChallenge) {
        setPrimaryChallenge(newChallenges[0]);
      } else if (newChallenges.length === 0) {
        setPrimaryChallenge(null);
      }

      return newChallenges;
    });
  }, [primaryChallenge]);

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
      phone,
      ageRange,
      profession,
      workSchedule,
      gender,
      financialRange,
      energyPeak,
      timeAvailable,
      objective,
      challenges,
      consistencyFeeling,
      projectedFeeling,
      yearsPromising,
      weekDaysPreset,
      weekDays,
      recommendedHabits,
      currentDate,
      primaryChallenge,
      pwaInstallPromptShown,
      pwaInstalled,
      isGeneratingRoutine,

      // Navigation
      goToStep,
      nextStep,
      prevStep,

      // Data Updates
      setEmail,
      setName,
      setPhone,
      setAgeRange,
      setProfession,
      setWorkSchedule,
      setGender,
      setFinancialRange,
      setEnergyPeak,
      setTimeAvailable,
      setObjective,
      toggleChallenge,
      setConsistencyFeeling,
      setProjectedFeeling,
      setYearsPromising,
      setWeekDaysPreset,
      setWeekDays,
      setPwaInstallPromptShown,
      setPwaInstalled,

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
      phone,
      ageRange,
      profession,
      workSchedule,
      gender,
      financialRange,
      energyPeak,
      timeAvailable,
      objective,
      challenges,
      consistencyFeeling,
      projectedFeeling,
      yearsPromising,
      weekDaysPreset,
      weekDays,
      recommendedHabits,
      currentDate,
      primaryChallenge,
      pwaInstallPromptShown,
      pwaInstalled,
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
