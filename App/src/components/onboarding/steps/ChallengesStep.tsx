import { motion } from "motion/react";
import { useOnboarding } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";

const CHALLENGE_OPTIONS = [
  { id: "procrastination", label: "Procrastinação", emoji: "⏰" },
  { id: "focus", label: "Foco", emoji: "🎯" },
  { id: "forgetfulness", label: "Esquecimento", emoji: "💭" },
  { id: "tiredness", label: "Cansaço", emoji: "😴" },
  { id: "anxiety", label: "Ansiedade", emoji: "😰" },
  { id: "motivation", label: "Motivação", emoji: "🔥" },
];

export const ChallengesStep = () => {
  const { challenges, toggleChallenge } = useOnboarding();

  return (
    <div className="flex flex-col h-full">
      {/* Header - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-4"
      >
        <h2 className="text-2xl font-bold mb-1">Seus maiores desafios?</h2>
        <p className="text-sm text-muted-foreground">
          Selecione todos que se aplicam
        </p>
      </motion.div>

      {/* Selection Grid - 3x2 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex-1 flex items-center justify-center"
      >
        <SelectionCardGrid mobileColumns={3} gap={2} className="w-full max-w-sm">
          {CHALLENGE_OPTIONS.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.03, duration: 0.2 }}
            >
              <SelectionCard
                id={option.id}
                title={option.label}
                emoji={option.emoji}
                selected={challenges.includes(option.id)}
                onClick={() => toggleChallenge(option.id)}
                variant="mini"
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
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-center text-xs text-muted-foreground mt-2"
      >
        {challenges.length > 0
          ? `${challenges.length} ${challenges.length === 1 ? "selecionado" : "selecionados"}`
          : "Sugerimos hábitos para seus desafios"}
      </motion.p>
    </div>
  );
};
