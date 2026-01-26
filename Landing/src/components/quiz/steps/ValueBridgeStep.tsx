import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { ContinueButton } from "../ContinueButton";

const feelingMap: { [key: string]: string } = {
  anxiety: "Ansiedade",
  procrastination: "Frustração",
  tiredness: "Cansaço",
  focus: "Frustração",
  forgetfulness: "Frustração",
  motivation: "Frustração",
};

export const ValueBridgeStep = () => {
  const { primaryChallenge } = useQuiz();
  const feeling = primaryChallenge ? feelingMap[primaryChallenge] : "Frustração";

  return (
    <div className="flex flex-col text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Uma última pergunta
        </h2>
        <p className="text-lg text-slate-700 mb-4">
          Quanto custa para você passar mais um ano sentindo{" "}
          <span className="font-bold text-primary">{feeling}</span>?
        </p>
        <p className="text-sm text-slate-500">
          Apps comuns organizam tarefas. O Sistema Bora organiza sua biologia. O preço de não agir é sempre maior que o investimento na mudança.
        </p>
      </motion.div>

      <ContinueButton>Quero investir em mim</ContinueButton>
    </div>
  );
};
