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
import { JourneySelectionStep } from "./steps/JourneySelectionStep";
import { WeekDaysStep } from "./steps/WeekDaysStep";
import { RoutinePreviewStep } from "./steps/RoutinePreviewStep";
import { NotificationStep } from "./steps/NotificationStep";
import { CelebrationStep } from "./steps/CelebrationStep";

/**
 * OnboardingFlow Content Component
 * This component has access to the OnboardingProvider context
 */
const OnboardingFlowContent = () => {
  const { currentStep, generateRoutine } = useOnboarding();

  // Generate routine when reaching preview step (step 11 - after WeekDays)
  useEffect(() => {
    if (currentStep === 11) {
      generateRoutine();
    }
  }, [currentStep, generateRoutine]);

  // All 14 steps (including Theme, JourneySelection, and Notification)
  const steps = [
    <WelcomeStep key="welcome" />,              // 0
    <ThemeStep key="theme" />,                  // 1
    <AgeStep key="age" />,                      // 2
    <ProfessionStep key="profession" />,        // 3
    <WorkScheduleStep key="work-schedule" />,   // 4
    <EnergyPeakStep key="energy" />,            // 5
    <TimeAvailableStep key="time" />,           // 6
    <ObjectiveStep key="objective" />,          // 7
    <ChallengesStep key="challenges" />,        // 8
    <JourneySelectionStep key="journeys" />,    // 9
    <WeekDaysStep key="weekdays" />,            // 10
    <RoutinePreviewStep key="preview" />,       // 11
    <NotificationStep key="notification" />,    // 12
    <CelebrationStep key="celebration" />,      // 13
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Progress Bar - Fixed at top (compact) */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border pt-safe">
        <div className="container max-w-2xl mx-auto px-4 py-3">
          <OnboardingProgress />
        </div>
      </div>

      {/* Step Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto w-full pt-4 pb-4 px-4">
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

      {/* Navigation - Fixed at bottom (compact) */}
      <div
        className={`sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm pb-safe ${
          currentStep === 0 ? "" : "border-t border-border"
        }`}
      >
        <div className="container max-w-2xl mx-auto px-4 py-3">
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
