import { motion } from "motion/react";
import { useQuiz } from "./QuizProvider";

export const QuizProgress = () => {
  const { currentStep, totalSteps } = useQuiz();

  // O último step (8) é a preview, não conta como "pergunta"
  const questionSteps = totalSteps - 1;
  const progress = Math.min(currentStep / questionSteps, 1) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">
          {currentStep < questionSteps
            ? `Pergunta ${currentStep + 1} de ${questionSteps}`
            : "Sua rotina"}
        </span>
        <span className="text-xs font-medium text-slate-600">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#A3E635] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
