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
  // 29 Steps: Hero...AppExplanation(21), Loading(22), Analysis(23), Diagnosis(24), Similarity(25), Commitment(26), DataCollection(27), Subscription(28)
  // Adjusted for removal of WorkSchedule (-1), Financial (-1), and addition of ObjectionHandling (+1) -> Net -1
  const totalSteps = 28;

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
      // REMOVED: Case 5 (WorkSchedule) and 6 (Financial)

      case 5: // ProfessionStep (Prev 7)
        return profession !== null;
      case 6: // FeedbackAdaptStep (Prev 8)
        return true;
      case 7: // AgeStep (Prev 9)
        return ageRange !== null;
      case 8: // FeedbackAgeChartStep (Prev 10)
        return true;
      case 9: // ChallengesStep (Prev 11)
        return challenges.length > 0;
      case 10: // GenderStep (Prev 12)
        return gender !== null;
      case 11: // SocialProofChartStep (Prev 13)
        return true;
      case 12: // ConsistencyFeelingStep (Prev 14)
        return consistencyFeeling !== null;
      case 13: // ProjectedFeelingStep (Prev 15)
        return projectedFeeling !== null;
      case 14: // TestimonialsStep (Prev 16)
        return true;
      case 15: // YearsPromisingStep (Prev 17)
        return yearsPromising !== null;
      case 16: // UrgencyStep (Prev 18)
        return true;
      case 17: // PotentialChartStep (Prev 19)
        return true;
      case 18: // AppExplanationStep (Prev 20)
        return true;
      case 19: // DataCollectionStep (Prev 21)
        return false; // Requires form submission
      case 20: // AnalysisLoadingStep (Prev 22)
        return true;
      case 21: // DiagnosisStep (Prev 23)
        return true;
      case 22: // SimilarityMatchStep (Prev 24)
        return true;
      case 23: // ObjectionHandlingStep (NEW)
        return true;
      case 24: // CommitmentStep (Prev 25)
        return true;
      case 25: // SubscriptionOffersStep (Prev 26)
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
