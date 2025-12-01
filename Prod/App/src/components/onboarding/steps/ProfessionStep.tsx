import { motion } from "motion/react";
import { useOnboarding, type Profession } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { Briefcase } from "lucide-react";

const PROFESSION_OPTIONS: Array<{
  value: Profession;
  label: string;
  emoji: string;
  description: string;
}> = [
  {
    value: "clt",
    label: "CLT",
    emoji: "💼",
    description: "Trabalho formal com horário fixo",
  },
  {
    value: "freelancer",
    label: "Autônomo",
    emoji: "🎨",
    description: "Trabalho independente",
  },
  {
    value: "entrepreneur",
    label: "Empresário",
    emoji: "🚀",
    description: "Tenho meu próprio negócio",
  },
  {
    value: "student",
    label: "Estudante",
    emoji: "📚",
    description: "Foco nos estudos",
  },
  {
    value: "retired",
    label: "Aposentado",
    emoji: "🌴",
    description: "Tempo livre para mim",
  },
];

export const ProfessionStep = () => {
  const { profession, setProfession } = useOnboarding();

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
          <Briefcase className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-3xl font-bold mb-3">Qual sua situação profissional?</h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          Isso nos ajuda a entender sua disponibilidade de tempo
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
          {PROFESSION_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
            >
              <SelectionCard
                id={option.value}
                title={option.label}
                description={option.description}
                emoji={option.emoji}
                selected={profession === option.value}
                onClick={() => setProfession(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>
    </div>
  );
};
