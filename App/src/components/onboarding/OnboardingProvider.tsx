import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { useGamification } from "@/hooks/useGamification";
import { generateRecommendations } from "./generateRecommendations";

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
export type ThemePreference = "light" | "dark";

export interface RecommendedHabit {
  id: string;
  template_id: string;
  name: string;
  category: string;
  icon: string;
  icon_key: string; // HabitGlyph icon key
  color: string;
  period: "morning" | "afternoon" | "evening";
  suggested_time: string; // HH:mm format
  duration?: number; // Minutes to complete
  goal_value?: number;
  goal_unit?: "none" | "minutes" | "hours" | "times" | "pages" | "ml" | "steps";
  frequency_type?: "fixed_days" | "times_per_week" | "daily";
  frequency_days?: number[]; // Days of week (0-6)
  priority: number; // 1-10 (higher = more important)
  recommendation_score?: number; // Algorithm score
  recommendation_sources?: string[]; // Why this habit was recommended
}

export interface PeriodSlot {
  start: string;
  end: string;
}

export interface TimeSlots {
  morning?: PeriodSlot;
  afternoon?: PeriodSlot;
  evening?: PeriodSlot;
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
  themePreference: ThemePreference;
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
  setThemePreference: (theme: ThemePreference) => void;
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
  const [themePreference, setThemePreference] = useState<ThemePreference>("dark");
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

  const totalSteps = 13; // Welcome, Theme, Age, Profession, WorkSchedule, EnergyPeak, TimeAvailable, Objective, Challenges, WeekDays, Preview, Notification, Celebration

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
      case 1: // Theme
        return true; // Theme always has a default value
      case 2: // Age
        return ageRange !== null;
      case 3: // Profession
        return profession !== null;
      case 4: // Work Schedule
        return workSchedule !== null;
      case 5: // Energy Peak
        return energyPeak !== null;
      case 6: // Time Available
        return timeAvailable !== null;
      case 7: // Objective
        return objective !== null;
      case 8: // Challenges
        return challenges.length > 0;
      case 9: // Week Days
        return weekDays.length > 0;
      case 10: // Preview
        return selectedHabitIds.size >= 3;
      case 11: // Notification
        return true; // Notification step always valid (user can skip)
      case 12: // Celebration (auto-submits)
        return true;
      default:
        return false;
    }
  }, [currentStep, ageRange, profession, workSchedule, energyPeak, timeAvailable, objective, challenges, weekDays, selectedHabitIds]);

  // ============================================================================
  // TIME SLOTS CALCULATION
  // ============================================================================

  const getTimeSlots = useCallback((): TimeSlots => {
    switch (workSchedule) {
      case "morning": // Trabalha 6-14h
        return {
          morning: { start: "05:00", end: "06:00" },
          afternoon: { start: "14:30", end: "17:00" },
          evening: { start: "19:00", end: "23:00" },
        };
      case "commercial": // Trabalha 8-18h
        return {
          morning: { start: "06:00", end: "07:30" },
          afternoon: { start: "12:00", end: "13:00" },
          evening: { start: "19:00", end: "23:00" },
        };
      case "evening": // Trabalha 14-22h
        return {
          morning: { start: "06:00", end: "13:00" },
          afternoon: { start: "13:00", end: "14:00" },
          evening: { start: "22:30", end: "23:59" },
        };
      case "flexible":
      default:
        return {
          morning: { start: "06:00", end: "09:00" },
          afternoon: { start: "12:00", end: "15:00" },
          evening: { start: "18:00", end: "23:00" },
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
  // ROUTINE GENERATION - 4-Layer Smart Algorithm
  // ============================================================================

  const generateRoutine = useCallback(async () => {
    // Validate required data
    if (!objective || !timeAvailable || !workSchedule || !energyPeak) {
      console.error("Missing required onboarding data for routine generation");
      return;
    }

    setIsGeneratingRoutine(true);
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

      // Set recommended habits and select all by default
      setRecommendedHabits(recommendations);
      setSelectedHabitIds(new Set(recommendations.map((h) => h.id)));
    } catch (error) {
      console.error("Failed to generate routine:", error);
    } finally {
      setIsGeneratingRoutine(false);
    }
  }, [objective, challenges, timeAvailable, workSchedule, energyPeak, weekDays]);

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

      // Map invalid units to valid enum values
      const mapUnit = (unit?: string): "none" | "steps" | "minutes" | "km" | "custom" => {
        const validUnits = ["none", "steps", "minutes", "km", "custom"];
        if (unit && validUnits.includes(unit)) {
          return unit as "none" | "steps" | "minutes" | "km" | "custom";
        }
        // Map other units to closest valid option
        if (unit === "hours") return "minutes";
        if (unit === "times" || unit === "pages") return "none";
        if (unit === "ml") return "custom";
        return "none";
      };

      // Map template categories to valid database enum values
      const mapCategory = (category: string): string => {
        const categoryMap: Record<string, string> = {
          // Already valid in database
          productivity: "productivity",
          avoid: "avoid",
          // Mappings needed for template categories
          health: "corpo",
          mental: "mente",
          routine: "time_routine",
        };
        return categoryMap[category] || "outro";
      };

      // Create habits in database with all available data
      for (const habit of selectedHabits) {
        const { error: habitError } = await supabase.from("habits").insert({
          // Required fields
          user_id: user.id,
          name: habit.name,
          category: mapCategory(habit.category),
          period: habit.period,

          // Visual fields
          emoji: habit.icon,
          icon_key: habit.icon_key,
          color: habit.color,

          // Goal configuration
          goal_value: habit.goal_value,
          unit: mapUnit(habit.goal_unit),

          // Frequency configuration
          frequency_type: habit.frequency_type || "fixed_days",
          days_of_week: habit.frequency_days || weekDays,

          // New enriched fields
          reminder_time: habit.suggested_time || null,
          duration_minutes: habit.duration || null,
          priority: habit.priority || 5,
          template_id: habit.template_id || null,
          recommendation_score: habit.recommendation_score || null,
          source: "onboarding",

          // Status
          is_active: true,
        });

        if (habitError) {
          console.error("Failed to create habit:", habit.name, habitError);
        }
      }

      // Mark onboarding as complete in profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          has_completed_onboarding: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (profileError) {
        console.error("Failed to update profile:", profileError);
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
      navigate("/dashboard", { replace: true });
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
    themePreference,
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
    setThemePreference,
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
