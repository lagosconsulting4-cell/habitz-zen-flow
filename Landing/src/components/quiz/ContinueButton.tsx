import { motion } from "motion/react";
import { useQuiz } from "./QuizProvider";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ContinueButtonProps {
  label?: string;
  disabled?: boolean;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({
  label = "Continuar",
  disabled = false
}) => {
  const { nextStep } = useQuiz();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-md mx-auto mt-8"
    >
      <Button
        size="lg"
        onClick={nextStep}
        disabled={disabled}
        className="w-full h-14 text-lg font-bold bg-lime-500 hover:bg-lime-600 text-white disabled:opacity-50"
      >
        {label}
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </motion.div>
  );
};
