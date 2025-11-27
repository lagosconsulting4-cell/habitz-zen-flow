import { motion } from "motion/react";
import { useOnboarding, type Objective } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { Target, Heart, Brain, Calendar, Ban } from "lucide-react";

const OBJECTIVE_OPTIONS: Array<{
  value: Objective;
  label: string;
  description: string;
  icon: typeof Target;
  color: string;
}> = [
  {
    value: "productivity",
    label: "Produtividade",
    description: "Otimizar tempo e realizar mais",
    icon: Target,
    color: "text-blue-500",
  },
  {
    value: "health",
    label: "Saúde Física",
    description: "Cuidar do corpo e energia",
    icon: Heart,
    color: "text-red-500",
  },
  {
    value: "mental",
    label: "Bem-estar Mental",
    description: "Equilibrar mente e emoções",
    icon: Brain,
    color: "text-purple-500",
  },
  {
    value: "routine",
    label: "Organização",
    description: "Estruturar rotina diária",
    icon: Calendar,
    color: "text-green-500",
  },
  {
    value: "avoid",
    label: "Eliminar Vícios",
    description: "Quebrar maus hábitos",
    icon: Ban,
    color: "text-orange-500",
  },
];

export const ObjectiveStep = () => {
  const { objective, setObjective } = useOnboarding();

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
          <Target className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-3xl font-bold mb-3">Qual seu principal objetivo?</h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          Escolha o que é mais importante para você neste momento
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
          {OBJECTIVE_OPTIONS.map((option, index) => {
            const Icon = option.icon;

            return (
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
                  icon={<Icon className={`h-6 w-6 ${option.color}`} />}
                  selected={objective === option.value}
                  onClick={() => setObjective(option.value)}
                />
              </motion.div>
            );
          })}
        </SelectionCardGrid>
      </motion.div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="text-center text-xs text-muted-foreground mt-6"
      >
        💡 Sua escolha define 40% dos hábitos recomendados
      </motion.p>
    </div>
  );
};
