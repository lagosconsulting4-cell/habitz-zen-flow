import { motion } from "motion/react";
import { Calendar, CalendarDays, CalendarRange, HelpCircle, type LucideIcon } from "lucide-react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { ContinueButton } from "../ContinueButton";
import type { YearsPromising } from "@/lib/quizConfig";

const YEARS_PROMISING_OPTIONS: Array<{
  value: YearsPromising;
  label: string;
  icon: LucideIcon;
}> = [
    { value: "primeiro_ano", label: "Esse seria o primeiro", icon: Calendar },
    { value: "2-3_anos", label: "2-3 anos desperdiçados", icon: CalendarDays },
    { value: "4-5_anos", label: "4-5 anos... já perdi a conta", icon: CalendarRange },
    { value: "perdi_conta", label: "Prefiro não pensar nisso", icon: HelpCircle },
  ];

export const YearsPromisingStep = () => {
  const { yearsPromising, setYearsPromising, objective } = useQuiz();

  // Map objective to verb form
  const objectiveVerbs: Record<string, string> = {
    productivity: "ser mais produtivo",
    health: "melhorar sua saúde física",
    routine: "ser mais organizado",
    avoid: "eliminar vícios",
    mental: "ter qualidade de vida melhor",
  };

  const objectiveVerb = objective ? objectiveVerbs[objective] || "mudar" : "mudar";

  return (
    <div className="flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Há quantos anos você promete que vai {objectiveVerb}?
        </h2>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <SelectionCardGrid columns={2} gap={3} className="w-full max-w-md">
          {YEARS_PROMISING_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.03, duration: 0.2 }}
            >
              <SelectionCard
                id={option.value}
                title={option.label}
                icon={<option.icon className="w-5 h-5 text-slate-400" />}
                selected={yearsPromising === option.value}
                onClick={() => setYearsPromising(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Continue Button */}
      <ContinueButton disabled={!yearsPromising} />
    </div>
  );
};
