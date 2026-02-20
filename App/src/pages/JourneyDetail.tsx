/**
 * JourneyDetail — Individual journey page with visual timeline, phases, and progress
 * Route: /journeys/:slug
 */

import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, CheckCircle2, Lock, Circle, Play, Pause, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useJourneyDetail, useJourneyActions } from "@/hooks/useJourney";
import { JourneyIllustration, getJourneyTheme } from "@/components/JourneyIllustration";
import { JourneyDetailSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/integrations/supabase/auth";
import { useGamification } from "@/hooks/useGamification";
import { useState } from "react";

const JourneyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { journey, phases, days, userState, dayCompletions, loading } = useJourneyDetail(slug || "");
  const { startJourney, pauseJourney, resumeJourney, isStarting } = useJourneyActions();
  const { user } = useAuth();
  const { unlockAchievement, isAchievementUnlocked } = useGamification(user?.id);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  if (loading || !journey) {
    return <JourneyDetailSkeleton />;
  }

  const theme = getJourneyTheme(journey.theme_slug || journey.illustration_key);
  const isActive = userState?.status === "active";
  const isPaused = userState?.status === "paused";
  const isCompleted = userState?.status === "completed";
  const isEnrolled = !!userState;
  const currentDay = userState?.current_day || 0;
  const completionSet = new Set(dayCompletions);

  const handleStart = async () => {
    await startJourney(journey.id);
    if (!isAchievementUnlocked("journey_explorer")) {
      unlockAchievement({ achievementId: "journey_explorer", progressSnapshot: { journey_id: journey.id } }).catch(() => {});
    }
    navigate(`/journeys/${slug}/day/1`);
  };

  const handlePause = () => pauseJourney(journey.id);
  const handleResume = () => resumeJourney(journey.id);

  return (
    <div className="pb-navbar">
      {/* Header with atmospheric gradient */}
      <div
        className="px-4 pt-4 pb-6 space-y-4 relative overflow-hidden"
        style={{
          background: `${theme.headerGlow}, ${theme.ambientPattern}, linear-gradient(180deg, ${theme.color}0D 0%, transparent 100%)`,
        }}
      >
        <button
          onClick={() => navigate("/journeys")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="flex items-start gap-4">
          <JourneyIllustration illustrationKey={journey.illustration_key} size="lg" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{journey.title}</h1>
            {journey.subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{journey.subtitle}</p>
            )}
            <p className="text-xs text-muted-foreground/70 mt-1">
              {journey.duration_days} dias · Nivel {journey.level}
            </p>
          </div>
        </div>

        {/* Promise */}
        {journey.promise && (
          <p
            className="text-sm text-muted-foreground italic font-serif leading-relaxed border-l-3 pl-3"
            style={{ borderLeftWidth: 3, borderLeftColor: `${theme.color}66` }}
          >
            "{journey.promise}"
          </p>
        )}

        {/* Progress bar (if enrolled) */}
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Dia {currentDay} de {journey.duration_days}</span>
              <span>{userState!.completion_percent}%</span>
            </div>
            <div className="w-full h-3 bg-muted/20 dark:bg-zinc-700/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: userState!.completion_percent / 100 }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full origin-left"
                style={{ backgroundColor: theme.color }}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {!isEnrolled && (
            <Button
              onClick={handleStart}
              disabled={isStarting}
              className="flex-1 h-12 rounded-xl font-bold text-white"
              style={{ backgroundColor: theme.color }}
            >
              {isStarting ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Iniciar Jornada
            </Button>
          )}

          {isActive && (
            <>
              <Button
                onClick={() => navigate(`/journeys/${slug}/day/${currentDay}`)}
                className="flex-1 h-12 rounded-xl font-bold text-white"
                style={{ backgroundColor: theme.color }}
              >
                Ver Dia {currentDay}
              </Button>
              <Button
                variant="outline"
                onClick={handlePause}
                className="h-12 w-12 rounded-xl p-0"
              >
                <Pause className="w-4 h-4" />
              </Button>
            </>
          )}

          {isPaused && (
            <Button
              onClick={handleResume}
              className="flex-1 h-12 rounded-xl font-bold text-white"
              style={{ backgroundColor: theme.color }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retomar Jornada
            </Button>
          )}

          {isCompleted && (
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
              disabled
            >
              <CheckCircle2 className="w-4 h-4 mr-2" style={{ color: theme.color }} />
              Jornada Completa
            </Button>
          )}
        </div>
      </div>

      {/* Timeline: Phases and Days */}
      <div className="px-4 space-y-0">
        {phases.map((phase, phaseIdx) => {
          const phaseDays = days.filter(
            (d) => d.day_number >= phase.day_start && d.day_number <= phase.day_end
          );
          const phaseCompletedDays = phaseDays.filter((d) => completionSet.has(d.day_number)).length;
          const phaseComplete = phaseCompletedDays === phaseDays.length && phaseDays.length > 0;
          const phaseActive =
            isActive && currentDay >= phase.day_start && currentDay <= phase.day_end;
          const phaseFuture = isActive && currentDay < phase.day_start;
          const isExpanded = expandedPhase === phase.phase_number || phaseActive;
          const isLast = phaseIdx === phases.length - 1;

          return (
            <div key={phase.id} className="flex gap-3">
              {/* Timeline column */}
              <div className="flex flex-col items-center w-8 flex-shrink-0">
                {/* Node — rounded square for more designed feel */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border-2 z-10 transition-all",
                    phaseComplete
                      ? "border-transparent text-white"
                      : phaseActive
                        ? "border-2"
                        : "border-border bg-background text-muted-foreground"
                  )}
                  style={{
                    backgroundColor: phaseComplete ? theme.color : phaseActive ? `${theme.color}1A` : undefined,
                    borderColor: phaseActive ? theme.color : phaseComplete ? theme.color : undefined,
                    boxShadow: phaseComplete
                      ? `0 4px 16px ${theme.color}4D`
                      : phaseActive
                        ? `0 0 12px ${theme.color}33`
                        : undefined,
                  }}
                >
                  {phaseComplete ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold" style={phaseActive ? { color: theme.color } : undefined}>
                      {phase.phase_number}
                    </span>
                  )}
                </div>
                {/* Connecting gradient line */}
                {!isLast && (
                  <div
                    className="w-0.5 flex-1 min-h-[16px]"
                    style={{
                      background: phaseComplete
                        ? `linear-gradient(180deg, ${theme.color}, ${theme.color}80)`
                        : `linear-gradient(180deg, var(--border), transparent)`,
                    }}
                  />
                )}
              </div>

              {/* Phase content */}
              <div className={cn("flex-1 pb-4", !isLast && "mb-0")}>
                {/* Phase header */}
                <button
                  onClick={() =>
                    setExpandedPhase(
                      expandedPhase === phase.phase_number ? null : phase.phase_number
                    )
                  }
                  className="w-full flex items-center justify-between py-1"
                >
                  <div className="text-left flex items-center gap-2">
                    {/* Decorative phase number */}
                    <span
                      className="text-2xl font-mono font-bold opacity-10 select-none leading-none"
                      style={{ color: theme.color }}
                      aria-hidden="true"
                    >
                      {String(phase.phase_number).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{phase.title}</h3>
                      {phase.subtitle && (
                        <p className="text-xs text-muted-foreground">{phase.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {phaseCompletedDays}/{phaseDays.length}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </button>

                {/* Expanded day list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-1">
                        {phaseDays.map((day) => {
                          const isDone = completionSet.has(day.day_number);
                          const isCurrent = isActive && day.day_number === currentDay;
                          const isDayLocked = isActive && day.day_number > currentDay;
                          const isAccessible = !isActive || day.day_number <= currentDay;

                          return (
                            <button
                              key={day.id}
                              onClick={() => {
                                if (isAccessible) {
                                  navigate(`/journeys/${slug}/day/${day.day_number}`);
                                }
                              }}
                              disabled={isDayLocked}
                              className={cn(
                                "w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors",
                                isCurrent && "border",
                                isDone && "opacity-70",
                                isDayLocked && "opacity-40 cursor-not-allowed",
                                !isCurrent && !isDayLocked && "hover:bg-accent/5"
                              )}
                              style={isCurrent ? {
                                backgroundColor: `${theme.color}0D`,
                                borderColor: `${theme.color}33`,
                              } : undefined}
                            >
                              {/* Status icon */}
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: theme.color }} />
                              ) : isCurrent ? (
                                <Circle className="w-4 h-4 flex-shrink-0" style={{ color: theme.color }} />
                              ) : isDayLocked ? (
                                <Lock className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                              )}

                              {/* Day info */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    "text-xs font-semibold",
                                    isCurrent ? "" : "text-foreground"
                                  )}
                                  style={isCurrent ? { color: theme.color } : undefined}
                                >
                                  Dia {day.day_number}: {day.title}
                                  {isCurrent && (
                                    <span className="ml-1.5 inline-flex items-center gap-1">
                                      <span
                                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                                        style={{ backgroundColor: theme.color }}
                                      />
                                      <span
                                        className="text-[9px] font-bold uppercase tracking-wider"
                                        style={{ color: theme.color }}
                                      >
                                        hoje
                                      </span>
                                    </span>
                                  )}
                                </p>
                                {day.estimated_minutes && (
                                  <p className="text-[10px] text-muted-foreground">
                                    ~{day.estimated_minutes} min
                                  </p>
                                )}
                              </div>

                              {/* Badges */}
                              <div className="flex gap-1">
                                {day.is_rest_day && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/20 text-muted-foreground">
                                    descanso
                                  </span>
                                )}
                                {day.is_review_day && (
                                  <span
                                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                                    style={{ backgroundColor: `${theme.color}1A`, color: theme.color }}
                                  >
                                    review
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyDetail;
