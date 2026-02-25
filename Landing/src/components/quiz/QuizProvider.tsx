import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { generateRecommendations } from "@/lib/generateRecommendations";
import posthog from "posthog-js";
import type { QuizTheme } from "@/lib/quizThemes";
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

  // Pain Mapping
  painFrequency: string | null;
  mindRacing: string | null;
  cycleAwareness: string | null;

  // Emotional/Psychological
  consistencyFeeling: ConsistencyFeeling | null;
  projectedFeeling: ProjectedFeeling | null;
  yearsPromising: YearsPromising | null;

  // Feature Seeding
  featureNeeds: string[];

  // Routine Configuration
  weekDays: number[];
  weekDaysPreset: WeekDaysPreset;

  // Recommended Habits
  recommendedHabits: RecommendedHabit[];

  // Theme
  theme: QuizTheme;

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
  setPainFrequency: (freq: string) => void;
  setMindRacing: (val: string) => void;
  setCycleAwareness: (val: string) => void;
  toggleFeatureNeed: (need: string) => void;
  setTheme: (theme: QuizTheme) => void;
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

  // State - Pain Mapping
  const [painFrequency, setPainFrequency] = useState<string | null>(null);
  const [mindRacing, setMindRacing] = useState<string | null>(null);
  const [cycleAwareness, setCycleAwareness] = useState<string | null>(null);

  // State - Emotional/Psychological
  const [consistencyFeeling, setConsistencyFeeling] = useState<ConsistencyFeeling | null>(null);
  const [projectedFeeling, setProjectedFeeling] = useState<ProjectedFeeling | null>(null);
  const [yearsPromising, setYearsPromising] = useState<YearsPromising | null>(null);

  // State - Feature Seeding
  const [featureNeeds, setFeatureNeeds] = useState<string[]>([]);

  // State - Routine
  const [weekDaysPreset, setWeekDaysPreset] = useState<WeekDaysPreset>("weekdays");
  const [weekDays, setWeekDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [recommendedHabits, setRecommendedHabits] = useState<RecommendedHabit[]>([]);

  // State - Theme
  const [theme, setTheme] = useState<QuizTheme>("jade");

  // State - Tracking/Display
  const [currentDate] = useState<string>(new Date().toLocaleDateString("pt-BR"));
  const [primaryChallenge, setPrimaryChallenge] = useState<string | null>(null);

  // State - PWA
  const [pwaInstallPromptShown, setPwaInstallPromptShown] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  // State - Status
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);

  // TODO: ThemeSelectionStep (personalização de tema) será reintroduzido em breve como step 1
  // 32 Steps: Hero(0), PainRecognition(1), MindRacing(2), CycleAwareness(3),
  // Objective(4), Time(5), FeedbackTime(6), Energy(7), Profession(8), FeedbackAdapt(9),
  // Age(10), FeedbackAgeChart(11), Challenges(12), Gender(13), SocialProofChart(14),
  // ConsistencyFeeling(15), ProjectedFeeling[SLIDER](16), Testimonials(17), YearsPromising[EMOJI](18),
  // Urgency(19), PotentialChart(20), FeatureSeeding[MULTI](21), ScientificProof(22), AppExplanation(23),
  // AnalysisLoading(24), Diagnosis(25), Transformation(26), Similarity(27),
  // DataCollection[EMAIL](28), NameStep(29), PhoneStep[WPP](30),
  // LoadingPlan(31), SubscriptionOffers[+EXIT](32)
  const totalSteps = 33;

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

  const toggleFeatureNeed = useCallback((need: string) => {
    setFeatureNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  }, []);

  const isStepValid = useCallback((): boolean => {
    switch (currentStep) {
      case 0: return true;  // HeroStep
      // TODO: case 1 será ThemeSelectionStep quando reintroduzido
      case 1: return painFrequency !== null; // PainRecognition
      case 2: return mindRacing !== null; // MindRacing
      case 3: return cycleAwareness !== null; // CycleAwareness
      case 4: return objective !== null; // Objective
      case 5: return timeAvailable !== null; // TimeAvailable
      case 6: return true; // FeedbackTime
      case 7: return energyPeak !== null; // EnergyPeak
      case 8: return profession !== null; // Profession
      case 9: return true; // FeedbackAdapt
      case 10: return ageRange !== null; // Age
      case 11: return true; // FeedbackAgeChart
      case 12: return challenges.length > 0; // Challenges
      case 13: return gender !== null; // Gender
      case 14: return true; // SocialProofChart
      case 15: return consistencyFeeling !== null; // ConsistencyFeeling
      case 16: return projectedFeeling !== null; // ProjectedFeeling[SLIDER]
      case 17: return true; // Testimonials
      case 18: return yearsPromising !== null; // YearsPromising[EMOJI]
      case 19: return true; // Urgency
      case 20: return true; // PotentialChart
      case 21: return featureNeeds.length > 0; // FeatureSeeding[MULTI]
      case 22: return true; // ScientificProof
      case 23: return true; // AppExplanation
      case 24: return true; // AnalysisLoading
      case 25: return true; // Diagnosis
      case 26: return true; // Transformation
      case 27: return true; // Similarity
      case 28: return false; // DataCollection[EMAIL] (form submit)
      case 29: return false; // NameStep (form submit)
      case 30: return false; // PhoneStep[WPP] (form submit)
      case 31: return true; // LoadingPlan
      case 32: return true; // SubscriptionOffers
      default: return false;
    }
  }, [currentStep, objective, timeAvailable, energyPeak, profession, ageRange, challenges, gender, consistencyFeeling, projectedFeeling, yearsPromising, painFrequency, mindRacing, cycleAwareness, featureNeeds]);

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
      painFrequency,
      mindRacing,
      cycleAwareness,
      consistencyFeeling,
      projectedFeeling,
      featureNeeds,
      yearsPromising,
      weekDaysPreset,
      weekDays,
      recommendedHabits,
      theme,
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
      setPainFrequency,
      setMindRacing,
      setCycleAwareness,
      toggleFeatureNeed,
      setTheme,
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
      painFrequency,
      mindRacing,
      cycleAwareness,
      featureNeeds,
      consistencyFeeling,
      projectedFeeling,
      yearsPromising,
      theme,
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
