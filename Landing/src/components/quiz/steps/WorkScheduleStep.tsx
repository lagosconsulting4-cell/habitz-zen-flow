import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import type { WorkSchedule } from "@/lib/quizConfig";

const WORK_SCHEDULE_OPTIONS: Array<{
  value: WorkSchedule;
  label: string;
  emoji: string;
  hours: string;
}> = [
  { value: "morning", label: "Manhã", emoji: "🌅", hours: "6h-14h" },
  { value: "commercial", label: "Comercial", emoji: "🏢", hours: "8h-18h" },
  { value: "evening", label: "Tarde/Noite", emoji: "🌙", hours: "14h-22h" },
  { value: "flexible", label: "Flexível", emoji: "🔄", hours: "Varia" },
];

export const WorkScheduleStep = () => {
  const { workSchedule, setWorkSchedule } = useQuiz();

  const selectedOption = WORK_SCHEDULE_OPTIONS.find((o) => o.value === workSchedule);

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
          Seu horário de trabalho?
        </h2>
        <p className="text-sm text-slate-500">
          Organizamos sua rotina nos horários livres
        </p>
      </motion.div>

      {/* Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <SelectionCardGrid mobileColumns={2} gap={2} className="w-full max-w-xs">
          {WORK_SCHEDULE_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.03, duration: 0.2 }}
            >
              <SelectionCard
                id={option.value}
                title={option.label}
                emoji={option.emoji}
                selected={workSchedule === option.value}
                onClick={() => setWorkSchedule(option.value)}
                variant="mini"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-center text-xs text-slate-400 mt-4"
      >
        {selectedOption ? `Horário: ${selectedOption.hours}` : "Selecione seu turno de trabalho"}
      </motion.p>
    </div>
  );
};
