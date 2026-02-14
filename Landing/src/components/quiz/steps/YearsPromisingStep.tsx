import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { ContinueButton } from "../ContinueButton";
import type { YearsPromising } from "@/lib/quizConfig";

const EMOJI_OPTIONS: Array<{
  value: YearsPromising;
  emoji: string;
  label: string;
}> = [
    { value: "primeiro_ano", emoji: "😅", label: "Menos de 1 ano" },
    { value: "2-3_anos", emoji: "😓", label: "1-2 anos" },
    { value: "4-5_anos", emoji: "😰", label: "3-5 anos" },
    { value: "perdi_conta", emoji: "💀", label: "Mais de 5 anos" },
  ];

export const YearsPromisingStep = () => {
  const { yearsPromising, setYearsPromising, nextStep } = useQuiz();

  const handleSelect = (value: YearsPromising) => {
    setYearsPromising(value);
    setTimeout(() => nextStep(), 400);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-8 px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Há quanto tempo você promete que vai mudar?
        </h2>
      </motion.div>

      {/* Emoji Scale */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="w-full max-w-md space-y-3"
      >
        {EMOJI_OPTIONS.map((option, index) => {
          const isSelected = yearsPromising === option.value;
          return (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.07, duration: 0.25 }}
              onClick={() => handleSelect(option.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${isSelected
                  ? "bg-lime-500/10 border-lime-500/40 shadow-[0_0_15px_rgba(132,204,22,0.15)]"
                  : "bg-[#121214] border-white/10 hover:border-white/20"
                }`}
            >
              <span className="text-4xl">{option.emoji}</span>
              <span className={`text-base font-medium ${isSelected ? "text-white" : "text-slate-300"}`}>
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};
