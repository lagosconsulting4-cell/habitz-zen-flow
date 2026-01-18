import { motion } from "motion/react";
import { BarChart3, Dumbbell, Brain, Calendar, Ban, type LucideIcon } from "lucide-react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { ContinueButton } from "../ContinueButton";
import type { Objective } from "@/lib/quizConfig";

const OBJECTIVE_OPTIONS: Array<{
  value: Objective;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "productivity", label: "Ser mais produtivo", icon: BarChart3 },
  { value: "health", label: "Melhorar a minha saúde física", icon: Dumbbell },
  { value: "routine", label: "Ser mais organizado", icon: Calendar },
  { value: "avoid", label: "Eliminar vícios", icon: Ban },
  { value: "mental", label: "Ter uma qualidade de Vida Melhor", icon: Brain },
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
          O que você mais gostaria de melhorar na sua rotina agora?
        </h2>
        <p className="text-sm text-slate-500">
          Isso nos ajuda a entender onde sua energia faz mais diferença hoje.
        </p>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <SelectionCardGrid columns={2} gap={3} className="w-full max-w-md">
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
                icon={<option.icon className="w-5 h-5 text-slate-600" />}
                selected={objective === option.value}
                onClick={() => setObjective(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Continue Button */}
      <ContinueButton disabled={!objective} />
    </div>
  );
};
