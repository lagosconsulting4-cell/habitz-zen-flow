import { motion, AnimatePresence } from "motion/react";
import { useOnboarding } from "../OnboardingProvider";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface HabitsByPeriod {
  morning: typeof habits;
  afternoon: typeof habits;
  evening: typeof habits;
}

export const RoutinePreviewStep = () => {
  const { recommendedHabits, selectedHabitIds, toggleHabit, isGeneratingRoutine } = useOnboarding();
  const [expandedPeriod, setExpandedPeriod] = useState<"morning" | "afternoon" | "evening" | null>(null);

  // Group habits by period
  const habitsByPeriod = recommendedHabits.reduce(
    (acc, habit) => {
      acc[habit.period].push(habit);
      return acc;
    },
    { morning: [], afternoon: [], evening: [] } as HabitsByPeriod
  );

  // Sort by suggested time
  Object.keys(habitsByPeriod).forEach((period) => {
    habitsByPeriod[period as keyof HabitsByPeriod].sort((a, b) =>
      a.suggested_time.localeCompare(b.suggested_time)
    );
  });

  const selectedCount = selectedHabitIds.size;
  const totalHabits = recommendedHabits.length;

  const periodLabels = {
    morning: { emoji: "🌅", label: "Manhã", color: "from-orange-500/20 to-yellow-500/20" },
    afternoon: { emoji: "☀️", label: "Tarde", color: "from-blue-500/20 to-cyan-500/20" },
    evening: { emoji: "🌙", label: "Noite", color: "from-purple-500/20 to-pink-500/20" },
  };

  if (isGeneratingRoutine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 mb-6"
          >
            <Sparkles className="h-10 w-10 text-primary" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">Criando sua rotina...</h2>
          <p className="text-muted-foreground">
            Analisando suas respostas e gerando recomendações personalizadas
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[600px] px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-3xl font-bold mb-3">Sua Rotina Personalizada</h2>

        <p className="text-muted-foreground max-w-md mx-auto mb-2">
          Criamos {totalHabits} hábitos baseados no seu perfil
        </p>

        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {selectedCount} de {totalHabits} selecionados
          </span>
          {selectedCount >= 3 && (
            <span className="text-green-500 font-medium">✓ Mínimo atingido</span>
          )}
        </div>
      </motion.div>

      {/* Timeline by Period */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex-1 space-y-4"
      >
        {(Object.keys(habitsByPeriod) as Array<keyof typeof habitsByPeriod>).map((period, periodIndex) => {
          const habits = habitsByPeriod[period];
          if (habits.length === 0) return null;

          const periodInfo = periodLabels[period];
          const isExpanded = expandedPeriod === period;
          const selectedInPeriod = habits.filter((h) => selectedHabitIds.has(h.id)).length;

          return (
            <motion.div
              key={period}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + periodIndex * 0.1, duration: 0.3 }}
              className="space-y-2"
            >
              {/* Period Header */}
              <button
                onClick={() => setExpandedPeriod(isExpanded ? null : period)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                  "hover:border-primary/50 active:scale-98",
                  isExpanded ? "border-primary bg-gradient-to-r " + periodInfo.color : "border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{periodInfo.emoji}</span>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">{periodInfo.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedInPeriod} de {habits.length} hábitos
                    </p>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground"
                >
                  ▼
                </motion.div>
              </button>

              {/* Habits in Period */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden space-y-2 pl-2"
                  >
                    {habits.map((habit, index) => {
                      const isSelected = selectedHabitIds.has(habit.id);

                      return (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.2 }}
                        >
                          <button
                            onClick={() => toggleHabit(habit.id)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                              "hover:scale-102 active:scale-98",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/30"
                            )}
                          >
                            {/* Icon */}
                            <div
                              className={cn(
                                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all",
                                isSelected ? habit.color : "bg-muted"
                              )}
                            >
                              {habit.icon}
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-left">
                              <h4 className="font-semibold">{habit.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{habit.suggested_time}</span>
                                {habit.duration && <span>• {habit.duration} min</span>}
                              </div>
                            </div>

                            {/* Checkbox */}
                            <div
                              className={cn(
                                "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground"
                              )}
                            >
                              {isSelected && <span className="text-xs">✓</span>}
                            </div>
                          </button>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Add Custom Habit Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-6"
      >
        <Button
          variant="outline"
          className="w-full border-dashed border-2 hover:border-primary"
          disabled
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Hábito Personalizado
        </Button>
      </motion.div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="text-center text-xs text-muted-foreground mt-4"
      >
        💡 Selecione pelo menos 3 hábitos para começar sua jornada
      </motion.p>
    </div>
  );
};
