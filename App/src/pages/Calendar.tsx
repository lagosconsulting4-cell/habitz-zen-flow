import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Calendar as CalendarIcon,
  TrendingUp,
  Target,
  Award,
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useHabits } from "@/hooks/useHabits";
import { supabase } from "@/integrations/supabase/client";

const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

type MonthCompletionMap = Record<string, Set<string>>;

const Calendar = () => {
  const {
    habits,
    loading,
    getHabitsForDate,
    toggleHabit,
    fetchCompletionsForDate,
    getHabitCompletionStatus,
    completions,
    completionsDate,
  } = useHabits();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [monthCompletions, setMonthCompletions] = useState<MonthCompletionMap>({});
  const [loadingMonthStats, setLoadingMonthStats] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = useMemo(
    () =>
      eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
      }),
    [calendarStart, calendarEnd]
  );

  const loadMonthCompletions = useCallback(
    async (date: Date) => {
      try {
        setLoadingMonthStats(true);
        const start = format(startOfMonth(date), "yyyy-MM-dd");
        const end = format(endOfMonth(date), "yyyy-MM-dd");

        const { data, error } = await supabase
          .from("habit_completions")
          .select("habit_id, completed_at")
          .gte("completed_at", start)
          .lte("completed_at", end);

        if (error) throw error;

        const map: MonthCompletionMap = {};
        (data || []).forEach((entry) => {
          const day = entry.completed_at;
          if (!map[day]) {
            map[day] = new Set();
          }
          map[day].add(entry.habit_id);
        });

        setMonthCompletions(map);
      } catch (err) {
        console.error("Failed to load month completions", err);
      } finally {
        setLoadingMonthStats(false);
      }
    },
    []
  );

  useEffect(() => {
    loadMonthCompletions(currentDate);
  }, [currentDate, loadMonthCompletions]);

  const handleSelectDate = async (day: Date) => {
    setSelectedDate(day);
    setDialogOpen(true);

    const dateKey = format(day, "yyyy-MM-dd");
    try {
      await fetchCompletionsForDate(dateKey);
    } catch (error) {
      console.error("Failed to load completions for date", error);
    }
  };

  const getCompletionRate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const scheduled = getHabitsForDate(date).length;
    if (scheduled === 0) {
      return 0;
    }
    const completed = monthCompletions[dateKey]?.size ?? 0;
    return Math.round((completed / scheduled) * 100);
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 100) return "bg-primary";
    if (rate >= 75) return "bg-primary/70";
    if (rate >= 50) return "bg-primary/50";
    if (rate > 0) return "bg-primary/30";
    return "bg-transparent";
  };

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedDayHabits = selectedDate ? getHabitsForDate(selectedDate) : [];
  const completedHabitsSet = useMemo(() => {
    if (!selectedDateKey || completionsDate !== selectedDateKey) {
      return new Set<string>();
    }
    return new Set(completions.map((completion) => completion.habit_id));
  }, [selectedDateKey, completions, completionsDate]);

  const handleToggleHabit = async (habitId: string) => {
    if (!selectedDate || !selectedDateKey) {
      return;
    }

    await toggleHabit(habitId, selectedDateKey);
    await fetchCompletionsForDate(selectedDateKey);
    await loadMonthCompletions(currentDate);
  };

  const monthlyStats = useMemo(() => {
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return monthDays.reduce(
      (acc, day) => {
        const scheduled = getHabitsForDate(day).length;
        if (scheduled === 0) {
          return acc;
        }

        acc.totalDays += 1;
        acc.totalPossible += scheduled;

        const completed = monthCompletions[format(day, "yyyy-MM-dd")]?.size ?? 0;
        acc.totalCompleted += completed;

        if (completed === scheduled && scheduled > 0) {
          acc.perfectDays += 1;
        }

        return acc;
      },
      { totalDays: 0, totalCompleted: 0, totalPossible: 0, perfectDays: 0 }
    );
  }, [monthStart, monthEnd, getHabitsForDate, monthCompletions]);

  const monthlyRate = monthlyStats.totalPossible > 0
    ? Math.round((monthlyStats.totalCompleted / monthlyStats.totalPossible) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-6 max-w-4xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-primary" />
              Calendário
            </h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso ao longo do tempo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: TrendingUp, value: loadingMonthStats ? "--" : `${monthlyRate}%`, label: "Taxa mensal" },
            { icon: Award, value: loadingMonthStats ? "--" : monthlyStats.perfectDays, label: "Dias perfeitos" },
            { icon: Target, value: loadingMonthStats ? "--" : monthlyStats.totalCompleted, label: "Habitos completos" }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="rounded-2xl bg-card border border-border p-4">
                  <div className="text-center">
                    <div className="p-3 bg-primary/10 rounded-xl mx-auto w-fit mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="rounded-2xl bg-card border border-border mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold uppercase tracking-wide text-foreground">
                  {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="bg-secondary border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="bg-secondary border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekdayLabels.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const completionRate = getCompletionRate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleSelectDate(day)}
                    className={`
                      aspect-square p-2 rounded-lg text-sm font-medium relative
                      transition-all duration-200 hover:scale-105
                      ${isCurrentMonth ? "text-foreground" : "text-muted-foreground/40"}
                      ${isSelected ? "ring-2 ring-primary" : ""}
                      ${isToday ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted"}
                    `}
                  >
                    <span className="relative z-10">{format(day, "d")}</span>
                    {isCurrentMonth && completionRate > 0 && !isToday && (
                      <div
                        className={`absolute inset-1 rounded-md ${getCompletionColor(completionRate)}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-wide text-foreground">
              {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ""}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Visualize e atualize os habitos programados para este dia
            </DialogDescription>
          </DialogHeader>

          {selectedDayHabits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum habito foi programado para este dia.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDayHabits.map((habit) => {
                const isCompleted = completedHabitsSet.has(habit.id);
                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
                  >
                    <div>
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        <span className="text-xl">{habit.emoji}</span>
                        {habit.name}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                        {habit.category} • {habit.period === "morning" ? "Manha" : habit.period === "afternoon" ? "Tarde" : "Noite"}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`flex items-center gap-2 font-semibold transition-all duration-200 ${
                        isCompleted
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary border border-border hover:bg-muted text-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="h-4 w-4" />
                          Concluido
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4" />
                          Marcar
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
