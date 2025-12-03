import { motion } from "motion/react";
import { useOnboarding, type Profession } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";

const PROFESSION_OPTIONS: Array<{
  value: Profession;
  label: string;
  emoji: string;
}> = [
  { value: "clt", label: "CLT", emoji: "👔" },
  { value: "freelancer", label: "Autônomo", emoji: "💻" },
  { value: "entrepreneur", label: "Empresário", emoji: "🏢" },
  { value: "student", label: "Estudante", emoji: "📚" },
  { value: "retired", label: "Aposentado", emoji: "🌴" },
];

export const ProfessionStep = () => {
  const { profession, setProfession } = useOnboarding();

  return (
    <div className="flex flex-col h-full">
      {/* Header - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-4"
      >
        <h2 className="text-2xl font-bold mb-1">Sua situação profissional?</h2>
        <p className="text-sm text-muted-foreground">
          Ajuda a entender sua disponibilidade de tempo
        </p>
      </motion.div>

      {/* Selection Grid - 3 columns */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex-1 flex items-center justify-center"
      >
        <SelectionCardGrid mobileColumns={3} gap={2} className="w-full max-w-sm">
          {PROFESSION_OPTIONS.map((option, index) => (
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
                selected={profession === option.value}
                onClick={() => setProfession(option.value)}
                variant="mini"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>
    </div>
  );
};
