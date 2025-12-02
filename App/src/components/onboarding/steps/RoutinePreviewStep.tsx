import { motion, AnimatePresence } from "motion/react";
import { useOnboarding } from "../OnboardingProvider";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { HabitGlyph } from "@/components/icons/HabitGlyph";
import { CustomHabitDialog } from "../CustomHabitDialog";
import { DaySelector, DAY_LABELS } from "../DaySelector";

interface HabitsByPeriod {
  morning: typeof habits;
  afternoon: typeof habits;
  evening: typeof habits;
}

export const RoutinePreviewStep = () => {
  const {
    recommendedHabits,
    selectedHabitIds,
    toggleHabit,
    isGeneratingRoutine,
    weekDays,
    addCustomHabit,
  } = useOnboarding();
  const [expandedPeriod, setExpandedPeriod] = useState<"morning" | "afternoon" | "evening" | null>(null);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Segunda como default

  // Calcular quantos hábitos tem em cada dia
  const habitCountByDay = useMemo(() => {
    const counts: Record<number, number> = {};
    recommendedHabits.forEach((habit) => {
      habit.frequency_days?.forEach((day) => {
        counts[day] = (counts[day] || 0) + 1;
      });
    });
    return counts;
  }, [recommendedHabits]);

  // Filtrar hábitos pelo dia selecionado
  const habitsForSelectedDay = useMemo(() => {
    return recommendedHabits.filter(
      (habit) => habit.frequency_days?.includes(selectedDay)
    );
  }, [recommendedHabits, selectedDay]);

  // Group habits by period (filtered by selected day)
  const habitsByPeriod = habitsForSelectedDay.reduce(
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
    morning: { label: "Manhã", color: "from-orange-500/20 to-yellow-500/20" },
    afternoon: { label: "Tarde", color: "from-blue-500/20 to-cyan-500/20" },
    evening: { label: "Noite", color: "from-purple-500/20 to-pink-500/20" },
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
    <div className="flex flex-col min-h-[600px] px-6 pt-0 pb-8">
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

      {/* Day Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="mb-4"
      >
        <DaySelector
          selectedDay={selectedDay}
          onDayChange={setSelectedDay}
          habitCountByDay={habitCountByDay}
        />
        <p className="text-center text-xs text-muted-foreground mt-2">
          {habitsForSelectedDay.length} hábitos para {DAY_LABELS[selectedDay]}
        </p>
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
                  className="text-foreground/60"
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
                              "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                              "hover:scale-[1.02] active:scale-[0.98]",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/30"
                            )}
                          >
                            {/* Icon - Using HabitGlyph */}
                            <div
                              className={cn(
                                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all",
                                isSelected ? "bg-primary/20" : "bg-muted"
                              )}
                            >
                              <HabitGlyph
                                iconKey={habit.icon_key}
                                category={habit.category}
                                size="lg"
                                tone={isSelected ? "lime" : "gray"}
                              />
                            </div>

                            {/* Name Only - Expanded */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base">{habit.name}</h4>
                            </div>

                            {/* Checkbox */}
                            <div
                              className={cn(
                                "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border dark:border-muted-foreground/70"
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
          onClick={() => setShowCustomDialog(true)}
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
        Selecione pelo menos 3 hábitos para começar sua jornada
      </motion.p>

      {/* Custom Habit Dialog */}
      {showCustomDialog && (
        <CustomHabitDialog
          isOpen={showCustomDialog}
          onClose={() => setShowCustomDialog(false)}
          onAdd={(habit) => {
            addCustomHabit({
              ...habit,
              id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            });
          }}
          weekDays={weekDays}
        />
      )}
    </div>
  );
};
