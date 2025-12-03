import { motion } from "motion/react";
import { GraduationCap, Briefcase, Rocket, Laptop, Sparkles, type LucideIcon } from "lucide-react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import type { Profession } from "@/lib/quizConfig";

const PROFESSION_OPTIONS: Array<{
  value: Profession;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "student", label: "Estudante", icon: GraduationCap },
  { value: "employed", label: "CLT", icon: Briefcase },
  { value: "entrepreneur", label: "Empreendedor", icon: Rocket },
  { value: "freelancer", label: "Freelancer", icon: Laptop },
  { value: "other", label: "Outro", icon: Sparkles },
];

export const ProfessionStep = () => {
  const { profession, setProfession } = useQuiz();

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
          Qual sua ocupação?
        </h2>
        <p className="text-sm text-slate-500">
          Adaptamos a rotina para sua realidade
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
                icon={<option.icon className="w-5 h-5 text-slate-600" />}
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
