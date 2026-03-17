import { useRef, useState, useEffect, type ComponentType } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingProviderV2, useOnboardingV2 } from "./OnboardingProviderV2";
import { S0Welcome } from "./steps/S0_Welcome";
import { S1AppIntro } from "./steps/S1_AppIntro";
import { S2ObjectiveConfirm } from "./steps/S2_ObjectiveConfirm";
import { S3InstallPWASoft } from "./steps/S3_InstallPWA_Soft";
import { S4WakeSleepTime } from "./steps/S4_WakeSleepTime";
import { S5WeekendDiff } from "./steps/S5_WeekendDiff";
import { S6LifeAreas } from "./steps/S6_LifeAreas";
import { S7HabitExperience } from "./steps/S7_HabitExperience";
import { S8LoadingRoutine } from "./steps/S8_LoadingRoutine";
import { S9RoutinePreview } from "./steps/S9_RoutinePreview";
import { S10RoutineConfirm } from "./steps/S10_RoutineConfirm";
import { S11JourneysIntro } from "./steps/S11_JourneysIntro";
import { S12JourneySelection } from "./steps/S12_JourneySelection";
import { S13InstallPWAHard } from "./steps/S13_InstallPWA_Hard";
import { S14Notifications } from "./steps/S14_Notifications";
import { S14bReminderOffset } from "./steps/S14b_ReminderOffset";
import { S20Celebration } from "./steps/S20_Celebration";
import { OnboardingBlobBackground } from "./OnboardingBlobBackground";

// ============================================================================
// STEPS CONFIGURATION
// ============================================================================

interface StepConfig {
  id: string;
  phase: number;
  conditional?: boolean; // Only shown when condition is met
}

const STEPS: StepConfig[] = [
  { id: 'welcome',         phase: 0 },
  { id: 'intro',           phase: 0 },
  { id: 'objective',       phase: 0 },
  { id: 'pwa-soft',        phase: 0 },
  { id: 'wake-sleep',      phase: 1 },
  { id: 'weekend',         phase: 1 },
  { id: 'life-areas',      phase: 1 },
  { id: 'experience',      phase: 1 },
  { id: 'loading',         phase: 2 },
  { id: 'preview',         phase: 2 },
  { id: 'confirm',         phase: 2 },
  { id: 'journeys-intro',  phase: 3 },
  { id: 'journey-select',  phase: 3 },
  { id: 'pwa-hard',        phase: 4, conditional: true },
  { id: 'notifications',   phase: 4 },
  { id: 'reminder-offset', phase: 4 },
  { id: 'celebration',     phase: 5 },
];

// Steps where progress bar is hidden
const HIDE_PROGRESS_ON = new Set([
  'welcome', 'loading',
  'celebration',
]);

// Steps where back button is hidden
const HIDE_BACK_ON = new Set([
  'welcome', 'loading',
  'pwa-hard', 'notifications', 'reminder-offset',
  'celebration',
]);

// Steps where bottom nav bar is hidden (step has its own CTA)
const HIDE_NAV_ON = new Set([
  'pwa-soft',
  'loading',
  'pwa-hard', 'notifications', 'reminder-offset',
  'celebration',
]);

// Step component mapping — implemented steps render their component, others show placeholder
const STEP_COMPONENTS: Record<string, ComponentType> = {
  'welcome': S0Welcome,
  'intro': S1AppIntro,
  'objective': S2ObjectiveConfirm,
  'pwa-soft': S3InstallPWASoft,
  'wake-sleep': S4WakeSleepTime,
  'weekend': S5WeekendDiff,
  'life-areas': S6LifeAreas,
  'experience': S7HabitExperience,
  'loading': S8LoadingRoutine,
  'preview': S9RoutinePreview,
  'confirm': S10RoutineConfirm,
  'journeys-intro': S11JourneysIntro,
  'journey-select': S12JourneySelection,
  'pwa-hard': S13InstallPWAHard,
  'notifications': S14Notifications,
  'reminder-offset': S14bReminderOffset,
  'celebration': S20Celebration,
};

// Number of phases for progress bar (0-4, phase 5 = celebration excluded)
const NUM_PROGRESS_PHASES = 5;

// ============================================================================
// TRANSITION VARIANTS
// ============================================================================

const variants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? '60%' : '-60%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? '-60%' : '60%',
    opacity: 0,
  }),
};

// ============================================================================
// SEGMENTED PROGRESS BAR
// ============================================================================

function OnboardingProgressDots({ currentStep }: { currentStep: number }) {
  const currentStepConfig = STEPS[currentStep];
  if (!currentStepConfig || HIDE_PROGRESS_ON.has(currentStepConfig.id)) return null;

  const currentPhase = currentStepConfig.phase;

  return (
    <motion.div
      className="z-40 pt-safe"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="px-4 py-3 flex items-center gap-2">
        {Array.from({ length: NUM_PROGRESS_PHASES }, (_, i) => {
          const isPast = i < currentPhase;
          const isCurrent = i === currentPhase;

          let fillRatio = 0;
          if (isPast) {
            fillRatio = 1;
          } else if (isCurrent) {
            const stepsInThisPhase = STEPS.filter(s => s.phase === i);
            const stepIdxInPhase = stepsInThisPhase.findIndex(s => s.id === currentStepConfig.id);
            fillRatio = (stepIdxInPhase + 1) / stepsInThisPhase.length;
          }

          return (
            <div key={i} className="relative flex-1 h-1 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 w-full rounded-full bg-primary"
                animate={{ scaleX: fillRatio }}
                style={{ transformOrigin: 'left' }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================================================
// FLOW CONTENT (inside Provider)
// ============================================================================

const OnboardingFlowV2Content = () => {
  const { currentStep, nextStep, prevStep, isStepValid } = useOnboardingV2();
  const directionRef = useRef<'forward' | 'backward'>('forward');

  const currentStepConfig = STEPS[currentStep];
  const showBack = currentStepConfig && !HIDE_BACK_ON.has(currentStepConfig.id) && currentStep > 0;
  const showNav = currentStepConfig && !HIDE_NAV_ON.has(currentStepConfig.id);

  // Idle pulse — CTA pulses subtly after 4s of being valid & idle
  const [idlePulse, setIdlePulse] = useState(false);
  const stepIsValid = isStepValid();
  useEffect(() => {
    setIdlePulse(false);
    if (!stepIsValid) return;
    const timer = setTimeout(() => setIdlePulse(true), 4000);
    return () => clearTimeout(timer);
  }, [stepIsValid, currentStep]);

  const handleNext = () => {
    directionRef.current = 'forward';
    nextStep();
  };

  const handleBack = () => {
    directionRef.current = 'backward';
    prevStep();
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Progress Dots */}
      <OnboardingProgressDots currentStep={currentStep} />

      {/* Step Content */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <OnboardingBlobBackground phase={currentStepConfig?.phase ?? 0} />
        <AnimatePresence mode="wait" custom={directionRef.current}>
          <motion.div
            key={currentStep}
            custom={directionRef.current}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="w-full h-full relative z-10"
          >
            {(() => {
              const StepComponent = currentStepConfig ? STEP_COMPONENTS[currentStepConfig.id] : null;
              if (StepComponent) {
                return <StepComponent />;
              }
              return (
                <div className="min-h-[60vh] flex items-center justify-center px-6">
                  <div className="text-center space-y-3">
                    <p className="text-muted-foreground text-lg">
                      Step <span className="font-semibold text-foreground">{currentStepConfig?.id || currentStep}</span> em construção
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Fase {currentStepConfig?.phase ?? '?'} · Step {currentStep + 1} de {STEPS.length}
                    </p>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Bar */}
      {(showNav || showBack) && (
        <div className="z-40 bg-background/95 backdrop-blur-sm border-t border-border pb-safe">
          <div className="px-4 py-3 flex items-center gap-3">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-10 w-10 shrink-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {showNav && (
              <motion.div
                className="flex-1"
                animate={idlePulse ? { scale: [1, 1.025, 1] } : {}}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="w-full h-12 text-base font-medium"
                >
                  Continuar
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTED COMPONENT (wraps with Provider)
// ============================================================================

export const OnboardingFlowV2 = () => {
  // Dev-only: read ?step=N from URL to jump directly to a step
  const initialStep = import.meta.env.DEV
    ? (() => {
        const params = new URLSearchParams(window.location.search);
        const step = params.get("step");
        return step != null ? parseInt(step, 10) : undefined;
      })()
    : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <OnboardingProviderV2 initialStep={initialStep}>
        <OnboardingFlowV2Content />
      </OnboardingProviderV2>
    </MotionConfig>
  );
};

export default OnboardingFlowV2;
