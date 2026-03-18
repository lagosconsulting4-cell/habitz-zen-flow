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
    title: "Nunca mantive nenhum de verdade",
    description: "Sempre começo, mas não dura.",
  },
  {
    value: "tried",
    title: "Já tentei, mas não chegou longe",
    description: "Alguns funcionaram por um tempo.",
  },
  {
    value: "already_have",
    title: "Já tenho alguns, quero ir além",
    description: "Quero melhorar o que já existe.",
  },
];

const CONDITIONAL_COPY: Record<HabitExperience, string> = {
  never: "Começamos com poucos hábitos. Consistência com 4 vale mais do que abandono com 10.",
  tried: "A rotina foi montada para se sustentar nos dias ruins. Não só nos bons.",
  already_have: "Construímos em cima do que funciona e adicionamos o que faltava.",
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
      <div className="flex-1 flex flex-col justify-center">
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

        {/* Static microcopy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-sm text-muted-foreground/70 text-center mt-4"
        >
          Não existe resposta errada. Isso só muda como a gente monta sua rotina.
        </motion.p>

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
