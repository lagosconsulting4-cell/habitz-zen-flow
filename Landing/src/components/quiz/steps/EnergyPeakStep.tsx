import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import type { EnergyPeak } from "@/lib/quizConfig";

const ENERGY_PEAK_OPTIONS: Array<{
  value: EnergyPeak;
  label: string;
  emoji: string;
  description: string;
}> = [
  { value: "morning", label: "Manhã", emoji: "🌅", description: "Acordo disposto" },
  { value: "afternoon", label: "Tarde", emoji: "☀️", description: "Pico após almoço" },
  { value: "evening", label: "Noite", emoji: "🌙", description: "Rendo mais de noite" },
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
          Quando você tem mais energia?
        </h2>
        <p className="text-sm text-slate-500">
          Colocamos hábitos importantes no seu melhor horário
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
                emoji={option.emoji}
                selected={energyPeak === option.value}
                onClick={() => setEnergyPeak(option.value)}
                variant="mini"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>
    </div>
  );
};
