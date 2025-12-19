import { useEffect } from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QuizProvider, useQuiz } from "./QuizProvider";
import posthog from "posthog-js";
import { QuizProgress } from "./QuizProgress";

// Steps - Question Steps
import { HeroStep } from "./steps/HeroStep";
import { ObjectiveStep } from "./steps/ObjectiveStep";
import { TimeAvailableStep } from "./steps/TimeAvailableStep";
import { EnergyPeakStep } from "./steps/EnergyPeakStep";
import { WorkScheduleStep } from "./steps/WorkScheduleStep";
import { FinancialRangeStep } from "./steps/FinancialRangeStep";
import { AgeStep } from "./steps/AgeStep";
import { ProfessionStep } from "./steps/ProfessionStep";
import { ChallengesStep } from "./steps/ChallengesStep";
import { GenderStep } from "./steps/GenderStep";
import { ConsistencyFeelingStep } from "./steps/ConsistencyFeelingStep";
import { ProjectedFeelingStep } from "./steps/ProjectedFeelingStep";
import { YearsPromisingStep } from "./steps/YearsPromisingStep";

// Steps - Feedback & Special Screens
import { FeedbackTimeStep } from "./steps/FeedbackTimeStep";
import { FeedbackAdaptStep } from "./steps/FeedbackAdaptStep";
import { PWAInstallStep } from "./steps/PWAInstallStep";
import { TestimonialsStep } from "./steps/TestimonialsStep";
import { UrgencyStep } from "./steps/UrgencyStep";
import { AppExplanationStep } from "./steps/AppExplanationStep";

// Steps - Chart Components
import { FeedbackAgeChartStep } from "./steps/FeedbackAgeChartStep";
import { SocialProofChartStep } from "./steps/SocialProofChartStep";
import { PotentialChartStep } from "./steps/PotentialChartStep";

// Steps - Final Flow
import { LoadingStep } from "./steps/LoadingStep";
import { CongratsStep } from "./steps/CongratsStep";
import { PersonalizedPlanView } from "./steps/PersonalizedPlanView";
import { DataCollectionStep } from "./steps/DataCollectionStep";

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
}

// Componente interno que usa o context
const QuizContent = ({ onClose }: { onClose: () => void }) => {
  const { currentStep, generateRoutine, canGoBack, prevStep, nextStep } = useQuiz();

  // Gera a rotina quando chega no LoadingStep (step 21)
  useEffect(() => {
    if (currentStep === 21) {
      generateRoutine();
    }
  }, [currentStep, generateRoutine]);

  // Renderiza o step atual
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <HeroStep />;
      case 1:
        return <ObjectiveStep />;
      case 2:
        return <TimeAvailableStep />;
      case 3:
        return <FeedbackTimeStep />;
      case 4:
        return <EnergyPeakStep />;
      case 5:
        return <WorkScheduleStep />;
      case 6:
        return <FinancialRangeStep />;
      case 7:
        return <ProfessionStep />;
      case 8:
        return <FeedbackAdaptStep />;
      case 9:
        return <AgeStep />;
      case 10:
        return <FeedbackAgeChartStep />;
      case 11:
        return <ChallengesStep />;
      case 12:
        return <GenderStep />;
      case 13:
        return <PWAInstallStep />;
      case 14:
        return <SocialProofChartStep />;
      case 15:
        return <ConsistencyFeelingStep />;
      case 16:
        return <ProjectedFeelingStep />;
      case 17:
        return <TestimonialsStep />;
      case 18:
        return <YearsPromisingStep />;
      case 19:
        return <UrgencyStep />;
      case 20:
        return <PotentialChartStep />;
      case 21:
        return <AppExplanationStep />;
      case 22:
        return <LoadingStep onComplete={nextStep} />;
      case 23:
        return <PersonalizedPlanView />;
      case 24:
        return <DataCollectionStep />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header com progresso */}
      <div className="sticky top-0 bg-white border-b border-slate-100 z-10">
        <div className="flex items-center justify-between p-4 gap-3">
          {/* Botão Voltar à esquerda */}
          {canGoBack ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" /> /* Spacer quando não tem voltar */
          )}

          {/* QuizProgress centralizado */}
          <div className="flex-1 max-w-md mx-auto">
            <QuizProgress />
          </div>

          {/* Botão Fechar à direita */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Conteúdo do Step */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

// Componente principal do Modal
export const QuizModal = ({ open, onClose }: QuizModalProps) => {
  // Track modal open/close
  useEffect(() => {
    if (open) {
      posthog.capture("quiz_modal_opened");
    }
  }, [open]);

  // Previne scroll do body quando modal está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Track modal close when it's actually closed
      if (!open) {
        posthog.capture("quiz_modal_closed");
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handler para fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-white"
        >
          <QuizProvider>
            <QuizContent onClose={onClose} />
          </QuizProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
