import { useEffect, useRef } from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QuizProvider, useQuiz } from "./QuizProvider";
import posthog from "posthog-js";
import { QuizProgress } from "./QuizProgress";
import { cn } from "@/lib/utils";

// Steps - Question Steps
import { HeroStep } from "./steps/HeroStep";
import { PainRecognitionStep } from "./steps/PainRecognitionStep";
import { MindRacingStep } from "./steps/MindRacingStep";
import { CycleAwarenessStep } from "./steps/CycleAwarenessStep";
import { ObjectiveStep } from "./steps/ObjectiveStep";
import { TimeAvailableStep } from "./steps/TimeAvailableStep";
import { EnergyPeakStep } from "./steps/EnergyPeakStep";
import { AgeStep } from "./steps/AgeStep";
import { ProfessionStep } from "./steps/ProfessionStep";
import { ChallengesStep } from "./steps/ChallengesStep";
import { GenderStep } from "./steps/GenderStep";
import { ConsistencyFeelingStep } from "./steps/ConsistencyFeelingStep";
import { ProjectedFeelingStep } from "./steps/ProjectedFeelingStep";
import { YearsPromisingStep } from "./steps/YearsPromisingStep";
import { FeatureSeedingStep } from "./steps/FeatureSeedingStep";
import { ScientificProofStep } from "./steps/ScientificProofStep";
import { NameStep } from "./steps/NameStep";

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
import TransformationStep from "./steps/TransformationStep";
import SimilarityMatchStep from "./steps/SimilarityMatchStep";
import { LoadingPlanStep } from "./steps/LoadingPlanStep";
import { PhoneStep } from "./steps/PhoneStep";
// TODO: ThemeSelectionStep reintroduzida em breve (personalização de tema por objetivo)
// import { ThemeSelectionStep } from "./steps/ThemeSelectionStep";
import { getThemeConfig } from "@/lib/quizThemes";

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
}

// Componente que usa o context - exportado para uso standalone em BoraQuizPage
export const QuizContent = ({ onClose }: { onClose?: () => void }) => {
  const { currentStep, generateRoutine, canGoBack, prevStep, nextStep, theme } = useQuiz();
  const themeConfig = getThemeConfig(theme);
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
      // case 1 (ThemeSelectionStep) removido temporariamente — volta em breve
      case 1:
        return <PainRecognitionStep />;
      case 2:
        return <MindRacingStep />;
      case 3:
        return <CycleAwarenessStep />;
      case 4:
        return <ObjectiveStep />;
      case 5:
        return <TimeAvailableStep />;
      case 6:
        return <FeedbackTimeStep />;
      case 7:
        return <EnergyPeakStep />;
      case 8:
        return <ProfessionStep />;
      case 9:
        return <FeedbackAdaptStep />;
      case 10:
        return <AgeStep />;
      case 11:
        return <FeedbackAgeChartStep />;
      case 12:
        return <ChallengesStep />;
      case 13:
        return <GenderStep />;
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
        return <FeatureSeedingStep />;
      case 22:
        return <ScientificProofStep />;
      case 23:
        return <AppExplanationStep />;

      // === DEEP BRIDGE ===
      case 24:
        return <AnalysisLoadingStep />;
      case 25:
        return <DiagnosisStep />;
      case 26:
        return <TransformationStep />;
      case 27:
        return <SimilarityMatchStep />;

      // === DATA COLLECTION ===
      case 28:
        return <DataCollectionStep />;
      case 29:
        return <NameStep />;
      case 30:
        return <PhoneStep />;

      // === LOADING + OFFER ===
      case 31:
        return <LoadingPlanStep />;
      case 32:
        return <SubscriptionOffersStep />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col h-full", themeConfig.cssClass)} style={{ backgroundColor: "var(--q-bg)" }}>
      {/* Header com progresso - Oculto no Hero (0), FeedbackAdapt (9), Testimonials (17), ScientificProof (22), AppExplanation (23), Offer (32) */}
      <div className={cn(
        "sticky top-0 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/5 z-10",
        (currentStep === 0 || currentStep === 9 || currentStep === 17 || currentStep === 22 || currentStep === 23 || currentStep === 32) && "hidden"
      )}>
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

          {/* Logo Bora */}
          <img
            src="https://i.ibb.co/CstYtpdH/meditar.png"
            alt="BORA"
            className="w-7 h-7 object-contain flex-shrink-0"
            loading="lazy"
          />

          {/* QuizProgress centralizado */}
          <div className="flex-1 max-w-md mx-auto">
            <QuizProgress />
          </div>

          {/* Botão Fechar à direita (só aparece quando usado como modal) */}
          {onClose ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-5" />
          )}
        </div>
      </div>

      {/* Conteúdo do Step */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className={cn(
          "max-w-2xl mx-auto min-h-full",
          (currentStep === 0 || currentStep === 9 || currentStep === 17 || currentStep === 22 || currentStep === 23) ? "p-0" : currentStep === 32 ? "px-4 pt-6 pb-8" : "px-4 pt-12 pb-8"
        )}>
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
