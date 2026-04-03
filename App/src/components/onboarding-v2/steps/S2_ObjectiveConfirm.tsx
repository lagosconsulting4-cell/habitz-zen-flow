import { useRef, memo } from "react";
import { motion } from "motion/react";
import { BarChart3, Dumbbell, Heart, CalendarDays, ShieldX } from "lucide-react";
import { useOnboardingV2 } from "../OnboardingProviderV2";
import { SelectionCard } from "@/components/onboarding/SelectionCard";
import type { ReactNode } from "react";

const OBJECTIVE_LABELS: Record<string, string> = {
  productivity: "exaustão sem resultado",
  health: "corpo e energia lá embaixo",
  mental: "mente que não desliga",
  routine: "começo forte, paro rápido",
  avoid: "preso no celular",
};

interface ObjectiveOption {
  value: string;
  title: string;
  description: string;
  icon: ReactNode;
}

const OBJECTIVE_OPTIONS: ObjectiveOption[] = [
  {
    value: "productivity",
    title: "Exaustão sem resultado",
    description: "Muito esforço, pouco avanço. Foco e clareza.",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    value: "health",
    title: "Corpo e energia lá embaixo",
    description: "Sem disposição, sem movimento, sem ritmo.",
    icon: <Dumbbell className="w-5 h-5" />,
  },
  {
    value: "mental",
    title: "Mente que não desliga",
    description: "Ansiedade, sobrecarga e falta de clareza.",
    icon: <Heart className="w-5 h-5" />,
  },
  {
    value: "routine",
    title: "Começo forte, paro rápido",
    description: "Boa vontade que não vira consistência.",
    icon: <CalendarDays className="w-5 h-5" />,
  },
  {
    value: "avoid",
    title: "Preso no celular",
    description: "Distrações que comem seu tempo e foco.",
    icon: <ShieldX className="w-5 h-5" />,
  },
];

export const S2ObjectiveConfirm = memo(function S2ObjectiveConfirm() {
  const {
    quizData,
    confirmedObjective,
    setConfirmedObjective,
  } = useOnboardingV2();

  const hasAnimatedRef = useRef(false);

  const preSelected = quizData?.objective || null;

  // Dynamic title label
  const objectiveLabel = confirmedObjective
    ? OBJECTIVE_LABELS[confirmedObjective]
    : preSelected
      ? OBJECTIVE_LABELS[preSelected]
      : null;

  return (
    <div className="h-full flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6"
      >
        {objectiveLabel ? (
          <h2 className="text-2xl font-bold text-foreground">
            Você está lidando com{" "}
            <span className="text-primary">{objectiveLabel}</span>?
          </h2>
        ) : (
          <h2 className="text-2xl font-bold text-foreground">
            O que mais te trava hoje?
          </h2>
        )}
        <p className="text-base text-muted-foreground mt-2">
          Sua rotina será montada em torno disso.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-3 max-w-md mx-auto w-full pb-2">
          {OBJECTIVE_OPTIONS.map((option, index) => {
            const isPreSelected = option.value === preSelected;
            const isSelected = option.value === confirmedObjective;

            return (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isPreSelected && !hasAnimatedRef.current
                    ? [1, 1.03, 1]
                    : 1,
                }}
                transition={{
                  opacity: { delay: 0.1 + index * 0.08, duration: 0.3 },
                  y: { delay: 0.1 + index * 0.08, duration: 0.3 },
                  scale: isPreSelected
                    ? { delay: 0.3 + index * 0.08, duration: 0.4 }
                    : undefined,
                }}
                onAnimationComplete={() => {
                  if (isPreSelected) hasAnimatedRef.current = true;
                }}
              >
                <SelectionCard
                  id={option.value}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  selected={isSelected}
                  onClick={() => setConfirmedObjective(option.value)}
                  variant="compact"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Support copy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-sm text-muted-foreground/70 text-center mt-4"
        >
          Pode mudar. A gente ajusta tudo.
        </motion.p>
      </div>

    </div>
  );
});
