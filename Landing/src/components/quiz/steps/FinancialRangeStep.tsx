import { motion } from "motion/react";
import { DollarSign, TrendingUp, Wallet, Banknote, type LucideIcon } from "lucide-react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { ContinueButton } from "../ContinueButton";
import type { FinancialRange } from "@/lib/quizConfig";

const FINANCIAL_RANGE_OPTIONS: Array<{
  value: FinancialRange;
  label: string;
  icon: LucideIcon;
}> = [
    { value: "1600-3000", label: "R$ 1.600 - 3.000", icon: Wallet },
    { value: "3000-7000", label: "R$ 3.000 - 7.000", icon: DollarSign },
    { value: "7000-20000", label: "R$ 7.000 - 20.000", icon: TrendingUp },
    { value: "20000+", label: "R$ 20.000+", icon: Banknote },
  ];

export const FinancialRangeStep = () => {
  const { financialRange, setFinancialRange } = useQuiz();

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
          Qual faixa de renda mais se aproxima da sua realidade atual?
        </h2>
        <p className="text-sm text-slate-400">
          Isso não muda o acesso ao plano. Serve apenas para sugerir hábitos possíveis dentro do seu contexto.
        </p>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <SelectionCardGrid columns={2} gap={3} className="w-full max-w-md">
          {FINANCIAL_RANGE_OPTIONS.map((option, index) => (
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
                selected={financialRange === option.value}
                onClick={() => setFinancialRange(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Continue Button */}
      <ContinueButton disabled={!financialRange} />
    </div>
  );
};
