import { motion } from "motion/react";
import { User, Users, Sparkles, type LucideIcon } from "lucide-react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { ContinueButton } from "../ContinueButton";
import type { Gender } from "@/lib/quizConfig";

const GENDER_OPTIONS: Array<{
  value: Gender;
  label: string;
  icon: LucideIcon;
}> = [
    { value: "masculino", label: "Masculino", icon: User },
    { value: "feminino", label: "Feminino", icon: Users },
    { value: "outro", label: "Outro", icon: Sparkles },
  ];

export const GenderStep = () => {
  const { gender, setGender, nextStep } = useQuiz();

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
          Escolhe o seu gênero
        </h2>
        <p className="text-sm text-slate-400">
          Isso será usado para gerar a sua rotina personalizada
        </p>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <SelectionCardGrid columns={1} gap={3} className="w-full max-w-md">
          {GENDER_OPTIONS.map((option, index) => (
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
                selected={gender === option.value}
                onClick={() => { setGender(option.value); setTimeout(nextStep, 350); }}
                variant="compact"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

    </div>
  );
};
