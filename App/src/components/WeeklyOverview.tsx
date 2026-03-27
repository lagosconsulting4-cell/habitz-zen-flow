import { useMemo } from "react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Zap, Flame } from "lucide-react";
import { CheckCircle2, Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WeeklyOverviewProps {
  getCompletionForDate: (date: Date) => { completed: number; total: number };
  isDarkMode?: boolean;
  className?: string;
  variant?: "progress-page" | "dashboard";
  consistencyPercent?: number;
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAY_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

export const WeeklyOverview = ({
  getCompletionForDate,
  isDarkMode = true,
  className,
  variant = "progress-page",
  consistencyPercent,
}: WeeklyOverviewProps) => {
  const isDashboard = variant === "dashboard";

  const weekDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - currentDay + i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    return dates;
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentStreak = useMemo(() => {
    let streak = 0;
    const checkDate = new Date(today);
    const todayCompletion = getCompletionForDate(today);
    if (todayCompletion.total === 0 || todayCompletion.completed < todayCompletion.total) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    for (let i = 0; i < 30; i++) {
      const completion = getCompletionForDate(checkDate);
      if (completion.total > 0 && completion.completed === completion.total) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [getCompletionForDate, today]);

  // ── Dashboard variant ──
  if (isDashboard) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={className}
      >
        <Card className="rounded-2xl p-4 border border-border/60 bg-card card-premium">
          {/* Header: label + streak badge */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Panorama Semanal
            </p>
            {currentStreak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400"
              >
                <Flame className="w-3.5 h-3.5" />
                {currentStreak}d
              </motion.div>
            )}
          </div>

          {/* Day dots */}
          <div className="flex items-center gap-2">
            {weekDates.map((date, index) => {
              const isToday = date.getTime() === today.getTime();
              const completion = getCompletionForDate(date);
              const hasHabits = completion.total > 0;
              const isComplete = hasHabits && completion.completed === completion.total;

              return (
                <div key={index} className="flex flex-col items-center gap-1.5 flex-1">
                  {/* Day circle */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                      isComplete
                        ? "bg-primary/25"
                        : isToday
                          ? "bg-primary/15"
                          : "bg-black/[0.06] dark:bg-white/[0.08] border border-black/10 dark:border-white/10"
                    )}
                  >
                    {isComplete ? (
                      <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                    ) : isToday ? (
                      <Zap className="w-4 h-4 text-primary" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                    )}
                  </div>

                  {/* Day label */}
                  <span className={cn(
                    "text-[10px] font-semibold",
                    isToday ? "text-primary" : "text-muted-foreground"
                  )}>
                    {WEEKDAY_SHORT[index]}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    );
  }

  // ── Progress-page variant (unchanged from original) ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={className}
    >
      <Card className={cn(
        "rounded-2xl p-4 border transition-all duration-300",
        isDarkMode
          ? "bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30"
          : "bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200"
      )}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Esta Semana
          </p>
          {currentStreak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                isDarkMode ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
              )}
            >
              <Flame className="w-3 h-3" />
              {currentStreak} dias
            </motion.div>
          )}
        </div>

        <TooltipProvider delayDuration={200}>
          <div className="flex justify-between gap-1">
            {weekDates.map((date, index) => {
              const isToday = date.getTime() === today.getTime();
              const isPast = date < today;
              const completion = getCompletionForDate(date);
              const hasHabits = completion.total > 0;
              const isComplete = hasHabits && completion.completed === completion.total;
              const isPartial = hasHabits && completion.completed > 0 && completion.completed < completion.total;
              const percentage = hasHabits ? Math.round((completion.completed / completion.total) * 100) : 0;

              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col items-center gap-1 flex-1"
                    >
                      <span className={cn(
                        "text-[10px] font-medium",
                        isToday ? (isDarkMode ? "text-purple-400" : "text-purple-600") : "text-muted-foreground"
                      )}>
                        {WEEKDAY_LABELS[index]}
                      </span>

                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-default",
                          isToday && "ring-2 ring-offset-1",
                          isToday && (isDarkMode ? "ring-purple-400 ring-offset-background" : "ring-purple-500 ring-offset-white"),
                          isComplete && (isDarkMode ? "bg-lime-500/30" : "bg-lime-100"),
                          isPartial && (isDarkMode ? "bg-yellow-500/20" : "bg-yellow-100"),
                          !hasHabits && isPast && (isDarkMode ? "bg-muted/30" : "bg-slate-100"),
                          !hasHabits && !isPast && (isDarkMode ? "bg-transparent" : "bg-transparent")
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle2 className={cn(
                            "w-4 h-4",
                            isDarkMode ? "text-lime-400" : "text-lime-600"
                          )} />
                        ) : isPartial ? (
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                            isDarkMode ? "border-yellow-400" : "border-yellow-500"
                          )}>
                            <span className={cn(
                              "text-[8px] font-bold",
                              isDarkMode ? "text-yellow-400" : "text-yellow-600"
                            )}>
                              {completion.completed}
                            </span>
                          </div>
                        ) : (
                          <Circle className={cn(
                            "w-4 h-4",
                            isPast ? "text-muted-foreground/30" : "text-muted-foreground/50"
                          )} />
                        )}
                      </motion.div>

                      <span className={cn(
                        "text-[10px] font-medium",
                        isToday ? (isDarkMode ? "text-purple-400" : "text-purple-600") : "text-muted-foreground/60"
                      )}>
                        {date.getDate()}
                      </span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {hasHabits ? (
                      <div className="text-center">
                        <p className="font-semibold">{percentage}% completo</p>
                        <p className="text-muted-foreground">{completion.completed}/{completion.total} hábitos</p>
                      </div>
                    ) : (
                      <p>Sem hábitos agendados</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </Card>
    </motion.div>
  );
};

export default WeeklyOverview;
