import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import type { TimeAvailable } from "@/lib/quizConfig";

const TIME_OPTIONS: Array<{
  value: TimeAvailable;
  label: string;
  emoji: string;
  habits: string;
}> = [
  { value: "15min", label: "15 min", emoji: "⚡", habits: "3 hábitos" },
  { value: "30min", label: "30 min", emoji: "🎯", habits: "4-5 hábitos" },
  { value: "1h", label: "1 hora", emoji: "💪", habits: "6-7 hábitos" },
  { value: "2h+", label: "2h+", emoji: "🏆", habits: "8-10 hábitos" },
];

export const TimeAvailableStep = () => {
  const { timeAvailable, setTimeAvailable } = useQuiz();

  const selectedOption = TIME_OPTIONS.find((o) => o.value === timeAvailable);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Quanto tempo pode dedicar por dia?
        </h2>
        <p className="text-sm text-slate-500">
          Criamos uma rotina realista para você
        </p>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <SelectionCardGrid mobileColumns={2} gap={2} className="w-full max-w-xs">
          {TIME_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.03, duration: 0.2 }}
            >
              <SelectionCard
                id={option.value}
                title={option.label}
                emoji={option.emoji}
                selected={timeAvailable === option.value}
                onClick={() => setTimeAvailable(option.value)}
                variant="mini"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-center text-xs text-slate-400 mt-4"
      >
        {selectedOption ? `Recomendamos: ${selectedOption.habits}` : "Qualidade > Quantidade"}
      </motion.p>
    </div>
  );
};
