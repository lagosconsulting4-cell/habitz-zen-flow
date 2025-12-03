import { motion } from "motion/react";
import { useOnboarding, type EnergyPeak } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";

const ENERGY_PEAK_OPTIONS: Array<{
  value: EnergyPeak;
  label: string;
  emoji: string;
}> = [
  { value: "morning", label: "Manhã", emoji: "☀️" },
  { value: "afternoon", label: "Tarde", emoji: "🌤️" },
  { value: "evening", label: "Noite", emoji: "🌙" },
];

export const EnergyPeakStep = () => {
  const { energyPeak, setEnergyPeak } = useOnboarding();

  return (
    <div className="flex flex-col h-full">
      {/* Header - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-4"
      >
        <h2 className="text-2xl font-bold mb-1">Quando você tem mais energia?</h2>
        <p className="text-sm text-muted-foreground">
          Priorizamos atividades no seu melhor momento
        </p>
      </motion.div>

      {/* Selection Grid - 3 columns horizontal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex-1 flex items-center justify-center"
      >
        <SelectionCardGrid mobileColumns={3} gap={2} className="w-full max-w-sm">
          {ENERGY_PEAK_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.05, duration: 0.2 }}
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

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-center text-xs text-muted-foreground mt-2"
      >
        Tarefas importantes serão sugeridas nesse período
      </motion.p>
    </div>
  );
};
