import { motion, AnimatePresence } from "motion/react";
import { useOnboarding, type WeekDaysPreset } from "../OnboardingProvider";
import { SelectionCard, SelectionCardGrid } from "../SelectionCard";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_OPTIONS: Array<{
  value: WeekDaysPreset;
  label: string;
  emoji: string;
  description: string;
  days: number[];
}> = [
  {
    value: "weekdays",
    label: "Segunda a Sexta",
    emoji: "💼",
    description: "Dias úteis apenas",
    days: [1, 2, 3, 4, 5],
  },
  {
    value: "everyday",
    label: "Todos os Dias",
    emoji: "🌟",
    description: "Construir consistência diária",
    days: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    value: "custom",
    label: "Personalizado",
    emoji: "⚙️",
    description: "Escolher dias específicos",
    days: [],
  },
];

const WEEK_DAYS = [
  { id: 0, label: "Dom", full: "Domingo" },
  { id: 1, label: "Seg", full: "Segunda" },
  { id: 2, label: "Ter", full: "Terça" },
  { id: 3, label: "Qua", full: "Quarta" },
  { id: 4, label: "Qui", full: "Quinta" },
  { id: 5, label: "Sex", full: "Sexta" },
  { id: 6, label: "Sáb", full: "Sábado" },
];

export const WeekDaysStep = () => {
  const { weekDaysPreset, setWeekDaysPreset, weekDays, setWeekDays } = useOnboarding();

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
    <div className="flex flex-col min-h-[500px] px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Calendar className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-3xl font-bold mb-3">Quais dias da semana?</h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          Escolha quando deseja manter seus hábitos
        </p>
      </motion.div>

      {/* Preset Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-6"
      >
        <SelectionCardGrid columns={1} className="max-w-md mx-auto">
          {PRESET_OPTIONS.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
            >
              <SelectionCard
                id={option.value}
                title={option.label}
                description={option.description}
                emoji={option.emoji}
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
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="max-w-md mx-auto"
            >
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Selecione os dias que deseja manter seus hábitos:
              </p>

              <div className="grid grid-cols-7 gap-2">
                {WEEK_DAYS.map((day, index) => (
                  <motion.button
                    key={day.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.2 }}
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "aspect-square rounded-xl flex flex-col items-center justify-center p-2 border-2 transition-all duration-200",
                      "hover:scale-105 active:scale-95",
                      weekDays.includes(day.id)
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-xs font-bold">{day.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Selected days summary */}
              {weekDays.length > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-center text-muted-foreground mt-4"
                >
                  ✓ {weekDays.length} {weekDays.length === 1 ? "dia selecionado" : "dias selecionados"}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="text-center text-xs text-muted-foreground mt-6"
      >
        💡 Você pode ajustar dias específicos para cada hábito depois
      </motion.p>
    </div>
  );
};
