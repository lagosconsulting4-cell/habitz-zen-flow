import { useEffect, useRef } from "react";
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
// import { WorkScheduleStep } from "./steps/WorkScheduleStep"; // Removed
// import { FinancialRangeStep } from "./steps/FinancialRangeStep"; // Removed
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
import { DataCollectionStep } from "./steps/DataCollectionStep";
import { SubscriptionOffersStep } from "./steps/SubscriptionOffersStep";
import { ValueBridgeStep } from "./steps/ValueBridgeStep";

// New Deep Bridge Steps
import AnalysisLoadingStep from "./steps/AnalysisLoadingStep";
import DiagnosisStep from "./steps/DiagnosisStep";
import SimilarityMatchStep from "./steps/SimilarityMatchStep";
import { ObjectionHandlingStep } from "./steps/ObjectionHandlingStep";
import CommitmentStep from "./steps/CommitmentStep";

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
}

// Componente interno que usa o context
const QuizContent = ({ onClose }: { onClose: () => void }) => {
  const { currentStep, generateRoutine, canGoBack, prevStep, nextStep } = useQuiz();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top when step changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // Routine generation removed - only using AnalysisLoadingStep now

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
      // Removed 5 (WorkSchedule) and 6 (Financial)
      case 5:
        return <ProfessionStep />;
      case 6:
        return <FeedbackAdaptStep />;
      case 7:
        return <AgeStep />;
      case 8:
        return <FeedbackAgeChartStep />;
      case 9:
        return <ChallengesStep />;
      case 10:
        return <GenderStep />;
      case 11:
        return <SocialProofChartStep />;
      case 12:
        return <ConsistencyFeelingStep />;
      case 13:
        return <ProjectedFeelingStep />;
      case 14:
        return <TestimonialsStep />;
      case 15:
        return <YearsPromisingStep />;
      case 16:
        return <UrgencyStep />;
      case 17:
        return <PotentialChartStep />;
      case 18:
        return <AppExplanationStep />;

      // === DEEP BRIDGE START ===
      case 19:
        // Data Collection - user submits form
        return <DataCollectionStep />;
      case 20:
        // Analysis happens AFTER form submission
        return <AnalysisLoadingStep />;
      case 21:
        // Show diagnosis results
        return <DiagnosisStep />;
      case 22:
        // Show "Veja quem resolveu isso" - social proof
        return <SimilarityMatchStep />;
      case 23:
        // Objection Handling (Parece bom demais?)
        return <ObjectionHandlingStep />;
      case 24:
        // Now Commitment comes after Similarity/Objection
        return <CommitmentStep />;
      case 25:
        return <SubscriptionOffersStep />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header com progresso */}
      <div className="sticky top-0 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/5 z-10">
        <div className="flex items-center justify-between p-4 gap-3">
          {/* Botão Voltar à esquerda */}
          {canGoBack ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
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
            className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Conteúdo do Step */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
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
          className="fixed inset-0 z-50 bg-[#0A0A0B] text-slate-50 overflow-y-auto"
        >
          <QuizProvider>
            <QuizContent onClose={onClose} />
          </QuizProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
