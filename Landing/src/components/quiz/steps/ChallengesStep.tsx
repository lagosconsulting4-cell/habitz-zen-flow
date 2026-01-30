// Force HMR update
import { motion } from "motion/react";
import { Clock, Target, CloudFog, BedDouble, AlertCircle, Flame, type LucideIcon } from "lucide-react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { ContinueButton } from "../ContinueButton";

const CHALLENGE_OPTIONS: Array<{
  id: string;
  label: string;
  icon: LucideIcon;
}> = [
    { id: "procrastination", label: "Quando sento pra fazer algo chato (empurro com a barriga)", icon: Clock },
    { id: "focus", label: "Minha mente não para quieta (penso em 10 coisas ao mesmo tempo)", icon: Target },
    { id: "forgetfulness", label: "Só lembro do que tinha que fazer quando já é tarde", icon: CloudFog },
    { id: "tiredness", label: "Acordo já sem bateria, parece que um caminhão passou", icon: BedDouble },
    { id: "anxiety", label: "Fico ansioso só de olhar o tanto de coisa que tenho pra fazer", icon: AlertCircle },
    { id: "motivation", label: "Quando algo sai do planejado, eu largo tudo", icon: Flame },
  ];

export const ChallengesStep = () => {
  const { challenges, toggleChallenge } = useQuiz();

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
          Em qual desses momentos você trava?
        </h2>
        <p className="text-sm text-slate-400">Seja sincero. Ninguém vai ver suas respostas.</p>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <SelectionCardGrid columns={1} gap={3} className="w-full max-w-md">
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
                icon={<option.icon className="w-5 h-5 text-slate-600" />}
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
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-center text-xs text-slate-400 mt-4"
      >
        {challenges.length > 0
          ? `${challenges.length} ${challenges.length === 1 ? "selecionado" : "selecionados"}`
          : "Sugerimos hábitos para seus desafios"}
      </motion.p>

      {/* Continue Button */}
      <ContinueButton disabled={challenges.length === 0} />
    </div>
  );
};
