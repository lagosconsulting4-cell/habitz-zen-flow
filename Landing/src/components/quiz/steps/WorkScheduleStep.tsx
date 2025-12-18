import { motion } from "motion/react";
import { Sunrise, Building2, Moon, RefreshCw, type LucideIcon } from "lucide-react";
import { useQuiz } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import type { WorkSchedule } from "@/lib/quizConfig";

const WORK_SCHEDULE_OPTIONS: Array<{
  value: WorkSchedule;
  label: string;
  icon: LucideIcon;
  hours: string;
}> = [
  { value: "commercial", label: "Comercial", icon: Building2, hours: "9h-18h" },
  { value: "morning", label: "Manhã", icon: Sunrise, hours: "6h-14h" },
  { value: "evening", label: "Noite", icon: Moon, hours: "18h-02h" },
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
          Qual é o seu horário de trabalho?
        </h2>
        <p className="text-sm text-slate-500">
          Adaptamos a sua rotina de acordo com a sua disponibilidade de tempo
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
                description={option.hours}
                icon={<option.icon className="w-5 h-5 text-slate-600" />}
                selected={workSchedule === option.value}
                onClick={() => setWorkSchedule(option.value)}
                variant="compact"
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
