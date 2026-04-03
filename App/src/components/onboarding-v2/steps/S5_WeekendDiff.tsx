import { memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useOnboardingV2, type WeekendDiff } from "../OnboardingProviderV2";
import { SelectionCard } from "@/components/onboarding/SelectionCard";

interface WeekendOption {
  value: WeekendDiff;
  title: string;
  description: string;
}

const WEEKEND_OPTIONS: WeekendOption[] = [
  {
    value: "same",
    title: "Mais ou menos igual",
    description: "Acordo no mesmo horário, faço coisas parecidas.",
  },
  {
    value: "different",
    title: "Bem diferente",
    description: "Tenho mais tempo livre e liberdade de horário.",
  },
];

const CONDITIONAL_COPY: Record<WeekendDiff, string> = {
  same: "Mesmos hábitos todos os dias. Mais simples de manter.",
  different: "Rotina diferente para cada período. Mais leve no fim de semana.",
  varies: "Vamos adaptar conforme o dia.",
};

export const S5WeekendDiff = memo(function S5WeekendDiff() {
  const { weekendDiff, setWeekendDiff } = useOnboardingV2();

  return (
    <div className="h-full flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-foreground">
          Seu fim de semana é parecido com a semana?
        </h2>
      </motion.div>

      {/* Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-3 max-w-md mx-auto w-full">
          {WEEKEND_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08, duration: 0.3 }}
            >
              <SelectionCard
                id={option.value}
                title={option.title}
                description={option.description}
                selected={weekendDiff === option.value}
                onClick={() => setWeekendDiff(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </div>

        {/* Conditional microcopy */}
        <AnimatePresence mode="wait">
          {weekendDiff && (
            <motion.p
              key={weekendDiff}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-muted-foreground/70 text-center mt-6 max-w-md mx-auto"
            >
              {CONDITIONAL_COPY[weekendDiff]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
