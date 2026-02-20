/**
 * DailyMissionCard — Unified RoutineCard + Journey Progress
 *
 * Extends the pattern from RoutineCard.tsx:
 * - When user has active journey(s): shows journey progress + daily habit progress
 * - When user has only loose habits: shows daily progress with CTA to explore journeys
 */

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, Sunrise, Sun, Moon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHabitIconWithFallback } from "@/components/icons/HabitIcons";
import { JourneyIllustration, getJourneyTheme } from "@/components/JourneyIllustration";
import { useActiveJourneys, useAllActiveJourneyHabits } from "@/hooks/useJourney";
import type { Habit } from "@/components/DashboardHabitCard";

interface DailyMissionCardProps {
  habits: Habit[];
  getHabitCompletionStatus: (habitId: string) => boolean;
  className?: string;
}

// ============================================
// Journey Progress Section
// ============================================
const JourneyProgressSection = ({
  getHabitCompletionStatus,
}: {
  getHabitCompletionStatus: (habitId: string) => boolean;
}) => {
  const { allJourneyHabits, activeStates, loading } = useAllActiveJourneyHabits();
  const navigate = useNavigate();

  if (loading || activeStates.length === 0) return null;

  return (
    <div className="space-y-2 mb-3">
      {activeStates.map((state) => {
        const journey = state.journeys;
        if (!journey) return null;
        const theme = getJourneyTheme(journey.theme_slug || journey.illustration_key);

        // Compute interpolated progress using live habit completion status
        const todayHabitIds = allJourneyHabits
          .filter(
            (jh) =>
              jh.journey_id === state.journey_id &&
              jh.introduced_on_day <= state.current_day &&
              (!jh.expires_on_day || jh.expires_on_day >= state.current_day)
          )
          .map((jh) => jh.habit_id);

        const completedToday = todayHabitIds.filter((id) =>
          getHabitCompletionStatus(id)
        ).length;
        const todayFraction =
          todayHabitIds.length > 0 ? completedToday / todayHabitIds.length : 0;

        // Daily habit progress (shown as main number)
        const dailyPercent = todayHabitIds.length > 0
          ? Math.round((completedToday / todayHabitIds.length) * 100)
          : 0;
        const isDayComplete = todayHabitIds.length > 0 && completedToday === todayHabitIds.length;

        return (
          <motion.button
            key={state.id}
            onClick={() => navigate(`/journeys/${journey.slug}`)}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-xl transition-all hover:scale-[1.01]",
              isDayComplete && "ring-1 ring-inset"
            )}
            style={{
              background: isDayComplete
                ? `linear-gradient(135deg, ${theme.color}18 0%, ${theme.color}08 100%)`
                : theme.headerGlow,
              ...(isDayComplete ? { ["--tw-ring-color" as string]: `${theme.color}30` } : {}),
            }}
            animate={isDayComplete ? { scale: [1, 1.01, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <JourneyIllustration
              illustrationKey={journey.illustration_key}
              size="sm"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-foreground truncate">
                {journey.title}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isDayComplete
                  ? `Dia ${state.current_day} concluído · Fase ${state.current_phase}`
                  : `Dia ${state.current_day} de ${journey.duration_days} · Fase ${state.current_phase}`}
              </p>
              <div className="mt-1 w-full h-1.5 bg-muted/20 dark:bg-zinc-700/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: dailyPercent / 100 }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full relative overflow-hidden origin-left"
                  style={{ backgroundColor: theme.color }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_1.5s_infinite]" />
                </motion.div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isDayComplete ? (
                <CheckCircle2 className="w-4 h-4" style={{ color: theme.color }} />
              ) : (
                <span className="text-[10px] font-bold" style={{ color: theme.color }}>
                  {dailyPercent}%
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

// ============================================
// No Journey CTA
// ============================================
const NoJourneyCTA = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/journeys")}
      className="w-full flex items-center gap-3 p-3 rounded-xl mt-2 border hover:opacity-90 transition-opacity"
      style={{
        background: "radial-gradient(ellipse at top, rgba(163,230,53,0.06) 0%, transparent 70%), var(--card)",
        borderColor: "rgba(163,230,53,0.15)",
      }}
    >
      <div className="flex -space-x-1.5">
        {["digital-detox", "gym", "own-mornings"].map((key) => (
          <JourneyIllustration key={key} illustrationKey={key} size="sm" className="w-7 h-7 ring-2 ring-card" />
        ))}
      </div>
      <div className="text-left flex-1">
        <p className="text-xs font-semibold text-foreground">
          Comece uma jornada
        </p>
        <p className="text-[10px] text-muted-foreground">
          Rotina guiada com hábitos automáticos
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-primary" />
    </button>
  );
};

// ============================================
// Progress Ring (module-scoped to avoid remount)
// ============================================
const ProgressRing = React.memo(({ progress, size = 48 }: { progress: number; size?: number }) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-muted/20" />
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} className="text-primary transition-all duration-300" strokeLinecap="round" />
    </svg>
  );
});
ProgressRing.displayName = "ProgressRing";

// ============================================
// Main Component
// ============================================
export const DailyMissionCard = ({
  habits,
  getHabitCompletionStatus,
  className,
}: DailyMissionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { activeStates } = useActiveJourneys();
  const hasActiveJourney = activeStates.length > 0;

  // Pre-compute completion status map
  const completionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    habits.forEach((h) => map.set(h.id, getHabitCompletionStatus(h.id)));
    return map;
  }, [habits, getHabitCompletionStatus]);

  // Group habits by period
  const periods = useMemo(() => {
    const periodMap: Record<string, Habit[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    habits.forEach((habit) => {
      const period = (habit as any).period || "morning";
      if (periodMap[period]) periodMap[period].push(habit);
    });

    return [
      { id: "morning" as const, name: "Manhã", icon: Sunrise, habits: periodMap.morning },
      { id: "afternoon" as const, name: "Tarde", icon: Sun, habits: periodMap.afternoon },
      { id: "evening" as const, name: "Noite", icon: Moon, habits: periodMap.evening },
    ].map((p) => ({
      ...p,
      completed: p.habits.filter((h) => completionMap.get(h.id)).length,
      total: p.habits.length,
      progress: p.habits.length > 0
        ? (p.habits.filter((h) => completionMap.get(h.id)).length / p.habits.length) * 100
        : 0,
    }));
  }, [habits, completionMap]);

  const totalHabits = periods.reduce((sum, p) => sum + p.total, 0);
  const totalCompleted = periods.reduce((sum, p) => sum + p.completed, 0);
  const overallProgress = totalHabits > 0 ? (totalCompleted / totalHabits) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full rounded-3xl overflow-hidden",
        "bg-card",
        "border border-border/60 dark:border-zinc-800/50",
        className
      )}
    >
      {/* Journey progress (if active) */}
      <div className="px-4 pt-3">
        <JourneyProgressSection getHabitCompletionStatus={getHabitCompletionStatus} />
      </div>

      {/* Header - Daily progress (always visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 pt-1 flex items-center justify-between hover:bg-accent/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ProgressRing progress={overallProgress} size={56} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">
                {Math.round(overallProgress)}%
              </span>
            </div>
          </div>

          <div className="text-left">
            <h3 className="text-base font-bold text-foreground">
              Progresso de Hoje
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalCompleted} de {totalHabits} concluídos
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expanded: Period breakdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {periods.map((period) => (
                <div
                  key={period.id}
                  className={cn(
                    "rounded-2xl p-3",
                    "bg-accent/5 dark:bg-zinc-800/30",
                    "border border-border/40 dark:border-zinc-700/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <period.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{period.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {period.completed}/{period.total}
                      </span>
                      {period.total > 0 && period.completed === period.total && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>

                  {period.total > 0 && (
                    <div className="w-full h-2 bg-muted/20 dark:bg-zinc-700/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: period.progress / 100 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="h-full bg-primary rounded-full origin-left"
                      />
                    </div>
                  )}

                  {period.habits.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {period.habits.map((habit) => {
                        const isCompleted = completionMap.get(habit.id);
                        const HabitIcon = getHabitIconWithFallback(habit.icon_key, habit.category);
                        return (
                          <div key={habit.id} className="flex items-center gap-2 text-xs">
                            <HabitIcon
                              className={cn(
                                "w-3.5 h-3.5 flex-shrink-0",
                                isCompleted ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                            <span
                              className={cn(
                                "flex-1",
                                isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                              )}
                            >
                              {habit.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {period.habits.length === 0 && (
                    <p className="text-xs text-muted-foreground/60 italic">
                      Nenhum hábito para este período
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No journey CTA (only if no active journey) */}
      {!hasActiveJourney && (
        <div className="px-4 pb-4">
          <NoJourneyCTA />
        </div>
      )}
    </motion.div>
  );
};

export default DailyMissionCard;
