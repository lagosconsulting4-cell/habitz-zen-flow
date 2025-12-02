import { motion } from "motion/react";
import { useOnboarding } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { AlertCircle } from "lucide-react";

const CHALLENGE_OPTIONS = [
  {
    id: "procrastination",
    label: "Procrastinação",
    description: "Deixo tudo para depois",
  },
  {
    id: "focus",
    label: "Falta de Foco",
    description: "Me distraio facilmente",
  },
  {
    id: "forgetfulness",
    label: "Esquecimento",
    description: "Esqueço das tarefas",
  },
  {
    id: "tiredness",
    label: "Cansaço",
    description: "Sempre me sinto cansado",
  },
  {
    id: "anxiety",
    label: "Ansiedade",
    description: "Fico ansioso com frequência",
  },
  {
    id: "motivation",
    label: "Motivação",
    description: "Perco a motivação rápido",
  },
];

export const ChallengesStep = () => {
  const { challenges, toggleChallenge } = useOnboarding();

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
          <AlertCircle className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-3xl font-bold mb-3">Quais seus maiores desafios?</h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          Selecione todos que se aplicam
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
          {CHALLENGE_OPTIONS.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
            >
              <SelectionCard
                id={option.id}
                title={option.label}
                description={option.description}
                selected={challenges.includes(option.id)}
                onClick={() => toggleChallenge(option.id)}
                variant="compact"
                multiselect
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Counter */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="text-center text-xs text-muted-foreground mt-6"
      >
        {challenges.length > 0 ? (
          <>
            {challenges.length} {challenges.length === 1 ? "desafio selecionado" : "desafios selecionados"}
          </>
        ) : (
          "Hábitos de suporte serão sugeridos para ajudar com seus desafios"
        )}
      </motion.p>
    </div>
  );
};
