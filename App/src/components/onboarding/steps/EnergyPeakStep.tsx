import { motion } from "motion/react";
import { useOnboarding, type EnergyPeak } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { Zap } from "lucide-react";

const ENERGY_PEAK_OPTIONS: Array<{
  value: EnergyPeak;
  label: string;
  emoji: string;
  description: string;
}> = [
  {
    value: "morning",
    label: "Manhã",
    emoji: "🌅",
    description: "Tenho mais energia pela manhã",
  },
  {
    value: "afternoon",
    label: "Tarde",
    emoji: "☀️",
    description: "Rendo melhor à tarde",
  },
  {
    value: "evening",
    label: "Noite",
    emoji: "🌙",
    description: "Sou mais produtivo à noite",
  },
];

export const EnergyPeakStep = () => {
  const { energyPeak, setEnergyPeak } = useOnboarding();

  return (
    <div className="flex flex-col min-h-[500px] px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Zap className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-3xl font-bold mb-3">Quando você tem mais energia?</h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          Vamos priorizar atividades importantes no seu melhor momento
        </p>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex-1 flex items-center justify-center"
      >
        <SelectionCardGrid columns={1} className="max-w-md w-full">
          {ENERGY_PEAK_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
            >
              <SelectionCard
                id={option.value}
                title={option.label}
                description={option.description}
                emoji={option.emoji}
                selected={energyPeak === option.value}
                onClick={() => setEnergyPeak(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>
    </div>
  );
};
