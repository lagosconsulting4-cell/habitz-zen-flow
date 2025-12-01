import { motion } from "motion/react";
import { useOnboarding, type AgeRange } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { User } from "lucide-react";

const AGE_OPTIONS: Array<{
  value: AgeRange;
  label: string;
  emoji: string;
  description: string;
}> = [
  {
    value: "18-24",
    label: "18-24 anos",
    emoji: "🎓",
    description: "Início da vida adulta",
  },
  {
    value: "25-34",
    label: "25-34 anos",
    emoji: "💼",
    description: "Construindo carreira",
  },
  {
    value: "35-44",
    label: "35-44 anos",
    emoji: "🏆",
    description: "Consolidando experiência",
  },
  {
    value: "45-54",
    label: "45-54 anos",
    emoji: "🌟",
    description: "Maturidade profissional",
  },
  {
    value: "55+",
    label: "55+ anos",
    emoji: "🎯",
    description: "Sabedoria e equilíbrio",
  },
];

export const AgeStep = () => {
  const { ageRange, setAgeRange } = useOnboarding();

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
          <User className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-3xl font-bold mb-3">Qual sua faixa etária?</h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          Isso nos ajuda a recomendar hábitos adequados para seu momento de vida
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
          {AGE_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
            >
              <SelectionCard
                id={option.value}
                title={option.label}
                description={option.description}
                emoji={option.emoji}
                selected={ageRange === option.value}
                onClick={() => setAgeRange(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>
    </div>
  );
};
