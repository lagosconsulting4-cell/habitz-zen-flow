import { motion } from "motion/react";
import { GraduationCap, Briefcase, Home, Star, Sparkles, type LucideIcon } from "lucide-react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { ContinueButton } from "../ContinueButton";
import type { AgeRange } from "@/lib/quizConfig";

const AGE_OPTIONS: Array<{
  value: AgeRange;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "18-24", label: "18-24 anos", icon: GraduationCap },
  { value: "25-34", label: "25-34 anos", icon: Briefcase },
  { value: "35-44", label: "35-44 anos", icon: Home },
  { value: "45-54", label: "45-54 anos", icon: Star },
  { value: "55+", label: "55+ anos", icon: Sparkles },
];

export const AgeStep = () => {
  const { ageRange, setAgeRange } = useQuiz();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Quantos anos você tem?
        </h2>
        <p className="text-sm text-slate-500">
          Isso será usado para recomendar hábitos adequados para seu momento de vida
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
          {AGE_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.03, duration: 0.2 }}
            >
              <SelectionCard
                id={option.value}
                title={option.label}
                icon={<option.icon className="w-5 h-5 text-slate-600" />}
                selected={ageRange === option.value}
                onClick={() => setAgeRange(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Continue Button */}
      <ContinueButton disabled={!ageRange} />
    </div>
  );
};
