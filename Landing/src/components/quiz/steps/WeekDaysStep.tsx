import { motion, AnimatePresence } from "motion/react";
import { Briefcase, RefreshCw, Sparkles, type LucideIcon } from "lucide-react";
import { useQuiz, type WeekDaysPreset } from "../QuizProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { cn } from "@/lib/utils";

const PRESET_OPTIONS: Array<{
  value: WeekDaysPreset;
  label: string;
  icon: LucideIcon;
  days: number[];
}> = [
    { value: "weekdays", label: "Seg-Sex", icon: Briefcase, days: [1, 2, 3, 4, 5] },
    { value: "everyday", label: "Todo dia", icon: RefreshCw, days: [0, 1, 2, 3, 4, 5, 6] },
    { value: "custom", label: "Custom", icon: Sparkles, days: [] },
  ];

const WEEK_DAYS = [
  { id: 0, label: "D" },
  { id: 1, label: "S" },
  { id: 2, label: "T" },
  { id: 3, label: "Q" },
  { id: 4, label: "Q" },
  { id: 5, label: "S" },
  { id: 6, label: "S" },
];

export const WeekDaysStep = () => {
  const { weekDaysPreset, setWeekDaysPreset, weekDays, setWeekDays } = useQuiz();

  const handlePresetChange = (preset: WeekDaysPreset) => {
    setWeekDaysPreset(preset);

    const option = PRESET_OPTIONS.find((opt) => opt.value === preset);
    if (option && preset !== "custom") {
      setWeekDays(option.days);
    }
  };

  const toggleDay = (dayId: number) => {
    if (weekDays.includes(dayId)) {
      setWeekDays(weekDays.filter((d) => d !== dayId));
    } else {
      setWeekDays([...weekDays, dayId].sort());
    }
  };

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
          Quais dias da semana?
        </h2>
        <p className="text-sm text-slate-400">Escolha quando manter seus hábitos</p>
      </motion.div>

      {/* Preset Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex justify-center mb-4"
      >
        <SelectionCardGrid columns={3} gap={3} className="w-full max-w-md">
          {PRESET_OPTIONS.map((option, index) => (
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
                selected={weekDaysPreset === option.value}
                onClick={() => handlePresetChange(option.value)}
                variant="compact"
              />
            </motion.div>
          ))}
        </SelectionCardGrid>
      </motion.div>

      {/* Custom Day Selection */}
      <AnimatePresence mode="wait">
        {weekDaysPreset === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="max-w-xs mx-auto"
            >
              <div className="grid grid-cols-7 gap-1.5">
                {WEEK_DAYS.map((day, index) => (
                  <motion.button
                    key={`${day.id}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.03, duration: 0.15 }}
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-150",
                      "active:scale-95",
                      weekDays.includes(day.id)
                        ? "bg-[#A3E635] text-slate-900 border-[#A3E635]"
                        : "bg-[#1A1A1C] border-white/10 text-slate-400 hover:border-white/20"
                    )}
                  >
                    <span className="text-xs font-bold">{day.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-center text-xs text-slate-400 mt-4"
      >
        {weekDaysPreset === "custom" && weekDays.length > 0
          ? `${weekDays.length} ${weekDays.length === 1 ? "dia" : "dias"} selecionados`
          : "Ajuste dias por hábito depois"}
      </motion.p>
    </div>
  );
};
