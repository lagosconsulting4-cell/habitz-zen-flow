import { motion } from "motion/react";
import { useOnboarding, type TimeAvailable } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { Timer } from "lucide-react";

const TIME_AVAILABLE_OPTIONS: Array<{
  value: TimeAvailable;
  label: string;
  emoji: string;
  description: string;
  habits: string;
}> = [
  {
    value: "15min",
    label: "15 minutos",
    emoji: "⚡",
    description: "Tenho pouco tempo livre",
    habits: "~3 hábitos rápidos",
  },
  {
    value: "30min",
    label: "30 minutos",
    emoji: "⏰",
    description: "Um tempo moderado",
    habits: "~5 hábitos",
  },
  {
    value: "1h",
    label: "1 hora",
    emoji: "⏲️",
    description: "Tenho tempo disponível",
    habits: "~7 hábitos",
  },
  {
    value: "2h+",
    label: "2+ horas",
    emoji: "🕐",
    description: "Tenho bastante tempo",
    habits: "~10 hábitos completos",
  },
];

export const TimeAvailableStep = () => {
  const { timeAvailable, setTimeAvailable } = useOnboarding();

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
          <Timer className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-3xl font-bold mb-3">Quanto tempo você tem por dia?</h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          Isso define quantos hábitos vamos recomendar
        </p>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex-1 flex items-center justify-center"
      >
        <SelectionCardGrid columns={2} className="max-w-2xl w-full">
          {TIME_AVAILABLE_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
            >
              <SelectionCard
                id={option.value}
                title={option.label}
                description={
                  <div>
                    <p>{option.description}</p>
                    <p className="text-xs text-primary mt-1 font-medium">{option.habits}</p>
                  </div>
                }
                emoji={option.emoji}
                selected={timeAvailable === option.value}
                onClick={() => setTimeAvailable(option.value)}
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="text-center text-xs text-muted-foreground mt-6"
      >
        💡 Você sempre pode adicionar ou remover hábitos depois
      </motion.p>
    </div>
  );
};
