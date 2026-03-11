import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Zap, Timer, Clock, CalendarClock } from "lucide-react";
import { useOnboarding, type TimeAvailable } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";

const TIME_AVAILABLE_OPTIONS: Array<{
  value: TimeAvailable;
  label: string;
  icon: ReactNode;
  habits: string;
}> = [
  { value: "15min", label: "15 min", icon: <Zap className="w-5 h-5" />, habits: "~3 hábitos" },
  { value: "30min", label: "30 min", icon: <Timer className="w-5 h-5" />, habits: "~5 hábitos" },
  { value: "1h", label: "1 hora", icon: <Clock className="w-5 h-5" />, habits: "~7 hábitos" },
  { value: "2h+", label: "2+ horas", icon: <CalendarClock className="w-5 h-5" />, habits: "~10 hábitos" },
];

export const TimeAvailableStep = () => {
  const { timeAvailable, setTimeAvailable } = useOnboarding();

  // Get selected option for hint
  const selectedOption = TIME_AVAILABLE_OPTIONS.find(o => o.value === timeAvailable);

  return (
    <div className="flex flex-col h-full">
      {/* Header - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-4"
      >
        <h2 className="text-2xl font-bold mb-1">Quanto tempo por dia?</h2>
        <p className="text-sm text-muted-foreground">
          Define quantos hábitos vamos recomendar
        </p>
      </motion.div>

      {/* Selection Grid - 2x2 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex-1 flex items-center justify-center"
      >
        <SelectionCardGrid mobileColumns={2} gap={2} className="w-full max-w-xs">
          {TIME_AVAILABLE_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.03, duration: 0.2 }}
            >
              <SelectionCard
                id={option.value}
                title={option.label}
                icon={option.icon}
                selected={timeAvailable === option.value}
                onClick={() => setTimeAvailable(option.value)}
                variant="mini"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Dynamic Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-center text-xs text-muted-foreground mt-2"
      >
        {selectedOption ? `Sugestão: ${selectedOption.habits}` : "Selecione seu tempo disponível"}
      </motion.p>
    </div>
  );
};
