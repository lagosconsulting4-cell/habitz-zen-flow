import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QuizProvider, useQuiz } from "./QuizProvider";
import { QuizProgress } from "./QuizProgress";
import { QuizNavigation } from "./QuizNavigation";

// Steps
import { AgeStep } from "./steps/AgeStep";
import { ProfessionStep } from "./steps/ProfessionStep";
import { WorkScheduleStep } from "./steps/WorkScheduleStep";
import { EnergyPeakStep } from "./steps/EnergyPeakStep";
import { TimeAvailableStep } from "./steps/TimeAvailableStep";
import { ObjectiveStep } from "./steps/ObjectiveStep";
import { ChallengesStep } from "./steps/ChallengesStep";
import { WeekDaysStep } from "./steps/WeekDaysStep";
import { EmailStep } from "./steps/EmailStep";
import { NameStep } from "./steps/NameStep";
import { OfferSlide } from "./steps/OfferSlide";
import { LockedRoutinePreview } from "./LockedRoutinePreview";

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
}

// Componente interno que usa o context
const QuizContent = ({ onClose }: { onClose: () => void }) => {
  const { currentStep, generateRoutine } = useQuiz();

  // Gera a rotina quando chega no LockedRoutinePreview (step 11)
  useEffect(() => {
    if (currentStep === 11) {
      generateRoutine();
    }
  }, [currentStep, generateRoutine]);

  // Renderiza o step atual
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <AgeStep />;
      case 1:
        return <ProfessionStep />;
      case 2:
        return <WorkScheduleStep />;
      case 3:
        return <EnergyPeakStep />;
      case 4:
        return <TimeAvailableStep />;
      case 5:
        return <ObjectiveStep />;
      case 6:
        return <ChallengesStep />;
      case 7:
        return <WeekDaysStep />;
      case 8:
        return <EmailStep />;
      case 9:
        return <NameStep />;
      case 10:
        return <OfferSlide />;
      case 11:
        return <LockedRoutinePreview onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header com progresso */}
      <div className="sticky top-0 bg-white border-b border-slate-100 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">Fechar</span>
          </button>
          <div className="flex-1 max-w-md mx-4">
            <QuizProgress />
          </div>
          <div className="w-16" /> {/* Spacer para centralizar progress */}
        </div>
      </div>

      {/* Conteúdo do Step */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
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

      {/* Footer com navegação (oculto nos steps de Offer e Preview) */}
      {currentStep < 10 && (
        <div className="sticky bottom-0 bg-white border-t border-slate-100">
          <div className="max-w-2xl mx-auto p-4">
            <QuizNavigation />
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal do Modal
export const QuizModal = ({ open, onClose }: QuizModalProps) => {
  // Previne scroll do body quando modal está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
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
