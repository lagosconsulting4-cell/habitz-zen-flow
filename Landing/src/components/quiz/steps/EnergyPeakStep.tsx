import { motion } from "motion/react";
import { Sunrise, Sun, Moon, type LucideIcon } from "lucide-react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { ContinueButton } from "../ContinueButton";
import type { EnergyPeak } from "@/lib/quizConfig";

const ENERGY_PEAK_OPTIONS: Array<{
  value: EnergyPeak;
  label: string;
  icon: LucideIcon;
  description: string;
}> = [
  { value: "morning", label: "Manhã", icon: Sunrise, description: "Acordo disposto" },
  { value: "afternoon", label: "Tarde", icon: Sun, description: "Pico após almoço" },
  { value: "evening", label: "Noite", icon: Moon, description: "Rendo mais de noite" },
];

export const EnergyPeakStep = () => {
  const { energyPeak, setEnergyPeak } = useQuiz();

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
          Quando você se sente mais disposto no seu dia?
        </h2>
        <p className="text-sm text-slate-500">
          Colocamos hábitos mais importantes no horário que você se sente mais comprometido
        </p>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <SelectionCardGrid columns={1} gap={3} className="w-full max-w-md">
          {ENERGY_PEAK_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.03, duration: 0.2 }}
            >
              <SelectionCard
                id={option.value}
                title={option.label}
                description={option.description}
                icon={<option.icon className="w-5 h-5 text-slate-600" />}
                selected={energyPeak === option.value}
                onClick={() => setEnergyPeak(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Continue Button */}
      <ContinueButton disabled={!energyPeak} />
    </div>
  );
};
