import { motion } from "motion/react";
import { BatteryLow, ZapOff, TrendingDown, Smartphone, BrainCircuit, type LucideIcon } from "lucide-react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { ContinueButton } from "../ContinueButton";
import type { Objective } from "@/lib/quizConfig";

const OBJECTIVE_OPTIONS: Array<{
  value: Objective;
  label: string;
  icon: LucideIcon;
}> = [
    { value: "productivity", label: "Exaustão sem resultado", icon: BatteryLow },
    { value: "health", label: "Corpo e energia lá embaixo", icon: ZapOff },
    { value: "routine", label: "Começo forte, paro rápido", icon: TrendingDown },
    { value: "avoid", label: "Preso no celular", icon: Smartphone },
    { value: "mental", label: "Mente que não desliga", icon: BrainCircuit },
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
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          Na sua vida, o que mais te <span className="text-lime-400">trava?</span>
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
