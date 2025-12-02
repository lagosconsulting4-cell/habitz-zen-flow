import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { OnboardingProvider, useOnboarding } from "./OnboardingProvider";
import { OnboardingProgress } from "./OnboardingProgress";
import { OnboardingNavigation } from "./OnboardingNavigation";

// Steps
import { WelcomeStep } from "./steps/WelcomeStep";
import { ThemeStep } from "./steps/ThemeStep";
import { AgeStep } from "./steps/AgeStep";
import { ProfessionStep } from "./steps/ProfessionStep";
import { WorkScheduleStep } from "./steps/WorkScheduleStep";
import { EnergyPeakStep } from "./steps/EnergyPeakStep";
import { TimeAvailableStep } from "./steps/TimeAvailableStep";
import { ObjectiveStep } from "./steps/ObjectiveStep";
import { ChallengesStep } from "./steps/ChallengesStep";
import { WeekDaysStep } from "./steps/WeekDaysStep";
import { RoutinePreviewStep } from "./steps/RoutinePreviewStep";
import { CelebrationStep } from "./steps/CelebrationStep";

/**
 * OnboardingFlow Content Component
 * This component has access to the OnboardingProvider context
 */
const OnboardingFlowContent = () => {
  const { currentStep, generateRoutine } = useOnboarding();

  // Generate routine when reaching preview step (step 10 - after WeekDays)
  useEffect(() => {
    if (currentStep === 10) {
      generateRoutine();
    }
  }, [currentStep, generateRoutine]);

  // All 12 steps (including Theme step)
  const steps = [
    <WelcomeStep key="welcome" />,        // 0
    <ThemeStep key="theme" />,            // 1 - NEW
    <AgeStep key="age" />,                // 2
    <ProfessionStep key="profession" />,  // 3
    <WorkScheduleStep key="work-schedule" />, // 4
    <EnergyPeakStep key="energy" />,      // 5
    <TimeAvailableStep key="time" />,     // 6
    <ObjectiveStep key="objective" />,    // 7
    <ChallengesStep key="challenges" />,  // 8
    <WeekDaysStep key="weekdays" />,      // 9
    <RoutinePreviewStep key="preview" />, // 10
    <CelebrationStep key="celebration" />,// 11
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Progress Bar - Fixed at top */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <OnboardingProgress />
        </div>
      </div>

      {/* Step Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto w-full pt-6 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation - Fixed at bottom */}
      <div
        className={`sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm ${
          currentStep === 0 ? "" : "border-t border-border"
        }`}
      >
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <OnboardingNavigation centered={currentStep === 0} />
        </div>
      </div>
    </div>
  );
};

/**
 * NewOnboardingFlow - Main Component with Provider
 * This is the entry point for the onboarding flow
 */
export const NewOnboardingFlow = () => {
  return (
    <OnboardingProvider>
      <OnboardingFlowContent />
    </OnboardingProvider>
  );
};

export default NewOnboardingFlow;
