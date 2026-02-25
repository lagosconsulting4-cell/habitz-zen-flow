import { motion } from "motion/react";
import { useQuiz } from "./QuizProvider";

export const QuizProgress = () => {
  const { currentStep, totalSteps } = useQuiz();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="flex items-center gap-3 w-full max-w-md">
      {/* Progress Bar */}
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "var(--q-primary)" }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
