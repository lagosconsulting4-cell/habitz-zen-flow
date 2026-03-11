import type { ReactNode } from "react";
import { motion } from "motion/react";
import { GraduationCap, Briefcase, Home, Star, Sparkles } from "lucide-react";
import { useOnboarding, type AgeRange } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";

const AGE_OPTIONS: Array<{
  value: AgeRange;
  label: string;
  icon: ReactNode;
}> = [
  { value: "18-24", label: "18-24", icon: <GraduationCap className="w-5 h-5" /> },
  { value: "25-34", label: "25-34", icon: <Briefcase className="w-5 h-5" /> },
  { value: "35-44", label: "35-44", icon: <Home className="w-5 h-5" /> },
  { value: "45-54", label: "45-54", icon: <Star className="w-5 h-5" /> },
  { value: "55+", label: "55+", icon: <Sparkles className="w-5 h-5" /> },
];

export const AgeStep = () => {
  const { ageRange, setAgeRange } = useOnboarding();

  return (
    <div className="flex flex-col h-full">
      {/* Header - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-4"
      >
        <h2 className="text-2xl font-bold mb-1">Qual sua faixa etária?</h2>
        <p className="text-sm text-muted-foreground">
          Ajuda a recomendar hábitos para seu momento de vida
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
                icon={option.icon}
                selected={ageRange === option.value}
                onClick={() => setAgeRange(option.value)}
                variant="mini"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>
    </div>
  );
};
