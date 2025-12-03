import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import type { Objective } from "@/lib/quizConfig";

const OBJECTIVE_OPTIONS: Array<{
  value: Objective;
  label: string;
  emoji: string;
}> = [
  { value: "productivity", label: "Produtividade", emoji: "📊" },
  { value: "health", label: "Saúde Física", emoji: "💪" },
  { value: "mental", label: "Bem-estar", emoji: "🧘" },
  { value: "routine", label: "Organização", emoji: "📅" },
  { value: "avoid", label: "Eliminar Vícios", emoji: "🚫" },
];

export const ObjectiveStep = () => {
  const { objective, setObjective } = useQuiz();

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
          Qual seu principal objetivo?
        </h2>
        <p className="text-sm text-slate-500">
          Define 40% dos hábitos recomendados
        </p>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <SelectionCardGrid mobileColumns={3} gap={2} className="w-full max-w-sm">
          {OBJECTIVE_OPTIONS.map((option, index) => (
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
                selected={objective === option.value}
                onClick={() => setObjective(option.value)}
                variant="mini"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>
    </div>
  );
};
