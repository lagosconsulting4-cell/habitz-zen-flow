import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
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
  addDays,
  subDays,
  isToday as dateFnsIsToday,
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
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const monthKey = format(currentDate, "yyyy-MM");

  // Week strip - shows current week centered on today
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekDays = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) }),
    [weekStart]
  );

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

  // Navigation handlers with direction tracking
  const goToPreviousMonth = useCallback(() => {
    setSlideDirection("right");
    setCurrentDate(prev => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setSlideDirection("left");
    setCurrentDate(prev => addMonths(prev, 1));
  }, []);

  // Swipe gesture handler
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 50;
      if (info.offset.x > threshold) {
        goToPreviousMonth();
      } else if (info.offset.x < -threshold) {
        goToNextMonth();
      }
    },
    [goToPreviousMonth, goToNextMonth]
  );

  // Animation variants for month transitions
  const monthVariants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "left" ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "left" ? -100 : 100,
      opacity: 0,
    }),
  };

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
        <div className="flex items-center justify-between mb-6">
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

        {/* Week Strip - Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Card className="rounded-2xl bg-card border border-border p-3">
            <div className="flex items-center justify-between gap-1">
              {weekDays.map((day) => {
                const dayRate = getCompletionRate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = dateFnsIsToday(day);
                const isPast = day < today && !isTodayDate;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleSelectDate(day)}
                    className={`
                      flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-200
                      ${isSelected ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"}
                    `}
                  >
                    <span className={`text-[10px] font-semibold uppercase ${
                      isTodayDate ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {format(day, "EEE", { locale: ptBR }).slice(0, 3)}
                    </span>
                    <span className={`
                      w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold
                      ${isTodayDate ? "bg-primary text-primary-foreground" : ""}
                      ${isSelected && !isTodayDate ? "bg-primary/30 text-primary" : ""}
                      ${!isTodayDate && !isSelected ? "text-foreground" : ""}
                    `}>
                      {format(day, "d")}
                    </span>
                    {/* Completion indicator */}
                    <div className="flex gap-0.5">
                      {dayRate >= 100 ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      ) : dayRate > 0 ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                      ) : isPast ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>

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
          <Card className="rounded-2xl bg-card border border-border mb-8 overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="h-10 w-10 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={monthKey}
                    custom={slideDirection}
                    initial={{ opacity: 0, y: slideDirection === "left" ? 10 : -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: slideDirection === "left" ? -10 : 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardTitle className="text-xl font-bold uppercase tracking-wide text-foreground text-center">
                      {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                    </CardTitle>
                  </motion.div>
                </AnimatePresence>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMonth}
                  className="h-10 w-10 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Swipe container */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="touch-pan-y"
              >
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {weekdayLabels.map((day) => (
                    <div key={day} className="p-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={monthKey}
                    custom={slideDirection}
                    variants={monthVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="grid grid-cols-7 gap-1"
                  >
                    {calendarDays.map((day) => {
                      const completionRate = getCompletionRate(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isTodayDate = dateFnsIsToday(day);

                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => handleSelectDate(day)}
                          className={`
                            aspect-square p-1 rounded-xl text-sm font-medium relative
                            transition-all duration-200 hover:scale-105 active:scale-95
                            ${isCurrentMonth ? "text-foreground" : "text-muted-foreground/30"}
                            ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}
                          `}
                        >
                          {/* Background completion indicator */}
                          {isCurrentMonth && completionRate > 0 && !isTodayDate && (
                            <div
                              className={`absolute inset-1 rounded-lg transition-colors duration-200 ${getCompletionColor(completionRate)}`}
                            />
                          )}
                          {/* Today highlight */}
                          {isTodayDate && (
                            <div className="absolute inset-1 rounded-lg bg-primary" />
                          )}
                          {/* Day number */}
                          <span className={`
                            relative z-10 flex items-center justify-center w-full h-full
                            ${isTodayDate ? "text-primary-foreground font-bold" : ""}
                          `}>
                            {format(day, "d")}
                          </span>
                          {/* Perfect day indicator */}
                          {isCurrentMonth && completionRate === 100 && !isTodayDate && (
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card z-20">
                              <Check className="w-1.5 h-1.5 text-primary-foreground absolute top-0.5 left-0.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-primary/30" />
                  <span className="text-[10px] text-muted-foreground">Parcial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span className="text-[10px] text-muted-foreground">Completo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2 h-2 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">Perfeito</span>
                </div>
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
