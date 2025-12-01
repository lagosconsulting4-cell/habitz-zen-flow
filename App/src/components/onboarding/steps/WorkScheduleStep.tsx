import { motion } from "motion/react";
import { useOnboarding, type WorkSchedule } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { Clock } from "lucide-react";

const WORK_SCHEDULE_OPTIONS: Array<{
  value: WorkSchedule;
  label: string;
  emoji: string;
  description: string;
  hours: string;
}> = [
  {
    value: "morning",
    label: "Manhã",
    emoji: "🌅",
    description: "Trabalho de manhã",
    hours: "6h - 14h",
  },
  {
    value: "commercial",
    label: "Comercial",
    emoji: "☀️",
    description: "Horário tradicional",
    hours: "8h - 18h",
  },
  {
    value: "evening",
    label: "Tarde/Noite",
    emoji: "🌙",
    description: "Trabalho à tarde/noite",
    hours: "14h - 22h",
  },
  {
    value: "flexible",
    label: "Flexível",
    emoji: "⚡",
    description: "Sem horário fixo",
    hours: "Varia",
  },
];

export const WorkScheduleStep = () => {
  const { workSchedule, setWorkSchedule } = useOnboarding();

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
          <Clock className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-3xl font-bold mb-3">Qual seu horário de trabalho?</h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          Vamos organizar sua rotina nos horários livres
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
          {WORK_SCHEDULE_OPTIONS.map((option, index) => (
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
                    <p className="text-xs text-primary mt-1 font-medium">{option.hours}</p>
                  </div>
                }
                emoji={option.emoji}
                selected={workSchedule === option.value}
                onClick={() => setWorkSchedule(option.value)}
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
        💡 Seus hábitos serão sugeridos para antes e depois do trabalho
      </motion.p>
    </div>
  );
};
