import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuiz } from "./QuizProvider";

export const QuizNavigation = () => {
  const { currentStep, canGoBack, nextStep, prevStep, isStepValid } = useQuiz();

  const isValid = isStepValid();

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        onClick={prevStep}
        disabled={!canGoBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      {/* Botão Continuar */}
      <Button
        onClick={nextStep}
        disabled={!isValid}
        className="flex items-center gap-2 bg-[#A3E635] hover:bg-[#84cc16] text-slate-900 font-semibold px-6"
      >
        {currentStep === 7 ? "Ver minha rotina" : "Continuar"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
