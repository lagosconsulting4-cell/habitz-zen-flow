import { motion } from "motion/react";
import { Frown, EyeOff, Meh, Flame, Smile, type LucideIcon } from "lucide-react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { ContinueButton } from "../ContinueButton";
import type { ConsistencyFeeling } from "@/lib/quizConfig";

const CONSISTENCY_FEELING_OPTIONS: Array<{
  value: ConsistencyFeeling;
  label: string;
  icon: LucideIcon;
}> = [
    { value: "frustrado", label: "Frustrado", icon: Frown },
    { value: "evitando", label: "Evitando", icon: EyeOff },
    { value: "conformado", label: "Conformado", icon: Meh },
    { value: "determinado", label: "Determinado", icon: Flame },
    { value: "bem" as ConsistencyFeeling, label: "Estou bem com isso", icon: Smile },
  ];

export const ConsistencyFeelingStep = () => {
  const { consistencyFeeling, setConsistencyFeeling } = useQuiz();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Sobre ter consistência... como você se sente?
        </h2>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <SelectionCardGrid columns={1} gap={3} className="w-full max-w-md">
          {CONSISTENCY_FEELING_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.03, duration: 0.2 }}
            >
              <SelectionCard
                id={option.value}
                title={option.label}
                icon={<option.icon className="w-5 h-5 text-slate-400" />}
                selected={consistencyFeeling === option.value}
                onClick={() => setConsistencyFeeling(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Continue Button */}
      <ContinueButton disabled={!consistencyFeeling} />
    </div>
  );
};
