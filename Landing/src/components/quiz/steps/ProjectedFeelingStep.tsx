import { motion } from "motion/react";
import { MinusCircle, Smile, Shield, Trophy, type LucideIcon } from "lucide-react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { ContinueButton } from "../ContinueButton";
import type { ProjectedFeeling } from "@/lib/quizConfig";

const PROJECTED_FEELING_OPTIONS: Array<{
  value: ProjectedFeeling;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "sem_mudanca", label: "Não ia mudar nada", icon: MinusCircle },
  { value: "muito_feliz", label: "Iria ficar muito feliz", icon: Smile },
  { value: "sem_insegurancas", label: "Não teria mais inseguranças", icon: Shield },
  { value: "realizado", label: "Me sentiria realizado", icon: Trophy },
];

export const ProjectedFeelingStep = () => {
  const { projectedFeeling, setProjectedFeeling, objective } = useQuiz();

  // Map objective to readable text
  const objectiveLabels: Record<string, string> = {
    productivity: "sendo mais produtivo",
    health: "com saúde física melhorada",
    routine: "mais organizado",
    avoid: "livre dos vícios",
    mental: "com qualidade de vida melhor",
  };

  const objectiveText = objective ? objectiveLabels[objective] || "seus objetivos alcançados" : "seus objetivos alcançados";

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
          Como você se sentiria se no final desse ano, você estivesse {objectiveText}?
        </h2>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <SelectionCardGrid columns={2} gap={3} className="w-full max-w-md">
          {PROJECTED_FEELING_OPTIONS.map((option, index) => (
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
                selected={projectedFeeling === option.value}
                onClick={() => setProjectedFeeling(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Continue Button */}
      <ContinueButton disabled={!projectedFeeling} />
    </div>
  );
};
