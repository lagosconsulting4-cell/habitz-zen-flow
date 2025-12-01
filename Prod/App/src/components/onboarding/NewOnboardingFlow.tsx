import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { OnboardingProvider, useOnboarding } from "./OnboardingProvider";
import { OnboardingProgress } from "./OnboardingProgress";
import { OnboardingNavigation } from "./OnboardingNavigation";

// Steps
import { WelcomeStep } from "./steps/WelcomeStep";
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

  // Generate routine when reaching preview step (step 8)
  useEffect(() => {
    if (currentStep === 8) {
      generateRoutine();
    }
  }, [currentStep, generateRoutine]);

  // All 11 steps
  const steps = [
    <WelcomeStep key="welcome" />,
    <AgeStep key="age" />,
    <ProfessionStep key="profession" />,
    <WorkScheduleStep key="work-schedule" />,
    <EnergyPeakStep key="energy" />,
    <TimeAvailableStep key="time" />,
    <ObjectiveStep key="objective" />,
    <ChallengesStep key="challenges" />,
    <WeekDaysStep key="weekdays" />,
    <RoutinePreviewStep key="preview" />,
    <CelebrationStep key="celebration" />,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar - Fixed at top */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <OnboardingProgress />
        </div>
      </div>

      {/* Step Content - Scrollable */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="container max-w-4xl mx-auto w-full">
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
      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <OnboardingNavigation />
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
