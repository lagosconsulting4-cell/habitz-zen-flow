/**
 * Onboarding Components - Sprint 1 (FASE 10)
 *
 * Exports all onboarding-related components for easy importing.
 *
 * Usage:
 *   import { NewOnboardingFlow, useOnboarding } from '@/components/onboarding';
 */

// Main Flow
export { NewOnboardingFlow, default as OnboardingFlow } from "./NewOnboardingFlow";

// Provider & Hook
export { OnboardingProvider, useOnboarding } from "./OnboardingProvider";
export type {
  AgeRange,
  Profession,
  WorkSchedule,
  EnergyPeak,
  TimeAvailable,
  Objective,
  WeekDaysPreset,
  RecommendedHabit,
  TimeSlots,
  OnboardingState,
  OnboardingContextType,
} from "./OnboardingProvider";

// UI Components
export { OnboardingProgress } from "./OnboardingProgress";
export { OnboardingNavigation } from "./OnboardingNavigation";
export { SelectionCard, SelectionCardGrid } from "./SelectionCard";
export type { SelectionCardProps } from "./SelectionCard";

// Steps
export { WelcomeStep } from "./steps/WelcomeStep";
export { AgeStep } from "./steps/AgeStep";
export { ProfessionStep } from "./steps/ProfessionStep";
export { WorkScheduleStep } from "./steps/WorkScheduleStep";
export { EnergyPeakStep } from "./steps/EnergyPeakStep";
export { TimeAvailableStep } from "./steps/TimeAvailableStep";
export { ObjectiveStep } from "./steps/ObjectiveStep";
export { ChallengesStep } from "./steps/ChallengesStep";
export { WeekDaysStep } from "./steps/WeekDaysStep";
export { RoutinePreviewStep } from "./steps/RoutinePreviewStep";
export { CelebrationStep } from "./steps/CelebrationStep";
