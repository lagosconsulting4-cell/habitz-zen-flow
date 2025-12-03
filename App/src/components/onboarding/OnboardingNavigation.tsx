import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "./OnboardingProvider";
import { cn } from "@/lib/utils";

interface OnboardingNavigationProps {
  className?: string;
  onNext?: () => void;
  onBack?: () => void;
  centered?: boolean;
}

export const OnboardingNavigation = ({
  className,
  onNext,
  onBack,
  centered = false,
}: OnboardingNavigationProps) => {
  const {
    currentStep,
    totalSteps,
    canGoBack,
    canGoNext,
    nextStep,
    prevStep,
    isStepValid,
    isSubmitting,
    submitOnboarding,
  } = useOnboarding();

  const isLastStep = currentStep === totalSteps - 1;
  const isValid = isStepValid();

  const handleNext = () => {
    if (isLastStep) {
      submitOnboarding();
    } else {
      onNext?.();
      nextStep();
    }
  };

  const handleBack = () => {
    onBack?.();
    prevStep();
  };

  return (
    <div className={cn("flex items-center gap-3", centered && "justify-center", className)}>
      {/* Back Button */}
      <AnimatePresence mode="wait">
        {canGoBack && !centered && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              size="default"
              onClick={handleBack}
              disabled={!canGoBack}
              className="gap-1.5 rounded-xl h-10"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      {!centered && <div className="flex-1" />}

      {/* Next/Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: centered ? 20 : 0, x: centered ? 0 : 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className={centered ? "w-full max-w-[280px]" : "flex-1 max-w-[200px]"}
      >
        <Button
          size="default"
          onClick={handleNext}
          disabled={!isValid || isSubmitting}
          className={cn(
            "w-full gap-1.5 rounded-xl font-bold transition-all duration-300 h-10",
            isLastStep
              ? "bg-gradient-to-r from-primary to-primary/80 hover:scale-105 shadow-lg shadow-primary/25"
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              Criando rotina...
            </>
          ) : isLastStep ? (
            <>
              Concluir
              <Check className="h-4 w-4" />
            </>
          ) : (
            <>
              Continuar
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>

      {/* Validation Indicator */}
      <AnimatePresence mode="wait">
        {!isValid && currentStep > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -bottom-8 right-0 text-xs text-muted-foreground"
          >
            Selecione uma opção para continuar
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
