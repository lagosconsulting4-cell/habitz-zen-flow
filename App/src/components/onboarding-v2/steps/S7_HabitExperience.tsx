import { memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useOnboardingV2, type HabitExperience } from "../OnboardingProviderV2";
import { SelectionCard } from "@/components/onboarding/SelectionCard";

interface ExperienceOption {
  value: HabitExperience;
  title: string;
  description: string;
}

const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  {
    value: "never",
    title: "Estou começando do zero",
    description: "Nunca mantive um hábito por muito tempo.",
  },
  {
    value: "tried",
    title: "Já tentei, mas não durou",
    description: "Funcionou por um tempo, mas parou.",
  },
  {
    value: "already_have",
    title: "Já tenho hábitos e quero mais",
    description: "Quero melhorar e expandir o que existe.",
  },
];

const CONDITIONAL_COPY: Record<HabitExperience, string> = {
  never: "Sua rotina terá 4 hábitos — quantidade certa para criar consistência sem sobrecarregar.",
  tried: "Sua rotina terá 6 hábitos, montados para se sustentar nos dias ruins também.",
  already_have: "Sua rotina terá até 8 hábitos, construídos em cima do que já funciona.",
};

export const S7HabitExperience = memo(function S7HabitExperience() {
  const { habitExperience, setHabitExperience } = useOnboardingV2();

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
          Como você se relaciona com hábitos hoje?
        </h2>
      </motion.div>

      {/* Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-3 max-w-md mx-auto w-full">
          {EXPERIENCE_OPTIONS.map((option, index) => (
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
                selected={habitExperience === option.value}
                onClick={() => setHabitExperience(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </div>

        {/* Conditional microcopy */}
        <AnimatePresence mode="wait">
          {habitExperience && (
            <motion.p
              key={habitExperience}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-primary/80 font-medium text-center mt-3 max-w-md mx-auto"
            >
              {CONDITIONAL_COPY[habitExperience]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
