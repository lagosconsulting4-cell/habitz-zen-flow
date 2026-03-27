/**
 * JourneyDetail — Premium daily journey view with habits and progress
 * Route: /journeys/:slug
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Pencil,
  Play,
  Trophy,
} from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useJourneyDetail,
  useJourneyActions,
  useJourneyHabits,
  useJourneyDay,
  CANONICAL_TO_ICON,
} from "@/hooks/useJourney";
import { renderContent } from "@/pages/JourneyDayCard";
import { getJourneyTheme } from "@/components/JourneyIllustration";
import { JourneyDetailSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/integrations/supabase/auth";
import { useGamification } from "@/hooks/useGamification";
import { useHabits } from "@/hooks/useHabits";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { getHabitIcon, type HabitIconKey } from "@/components/icons/HabitIcons";
import { getBRTDateString } from "@/utils/date";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DrumColumn, HOURS, MINUTES } from "@/components/ui/time-drum-picker";

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Journey cover images (same as JourneyHub)
const BASE = import.meta.env.BASE_URL;
const JOURNEY_COVERS: Record<string, string> = {
  "digital-detox-l1": `${BASE}backgrounds/arte9.webp`,
  "own-mornings-l1": `${BASE}backgrounds/arte8.webp`,
  "gym-l1": `${BASE}backgrounds/arte11.webp`,
  "focus-protocol-l1": `${BASE}backgrounds/arte5.webp`,
  "finances-l1": `${BASE}backgrounds/arte2.webp`,
  "digital-detox-l2": `${BASE}backgrounds/arte1.webp`,
  "own-mornings-l2": `${BASE}backgrounds/arte3.webp`,
  "gym-l2": `${BASE}backgrounds/arte12.webp`,
  "focus-protocol-l2": `${BASE}backgrounds/arte7.webp`,
  "finances-l2": `${BASE}backgrounds/arte10.webp`,
};

const JourneyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { journey, phases, userState, loading } = useJourneyDetail(slug || "");
  const { startJourney, pauseJourney, resumeJourney, isStarting } = useJourneyActions();
  const { user } = useAuth();
  const { unlockAchievement, isAchievementUnlocked } = useGamification(user?.id);
  const { journeyHabits } = useJourneyHabits(journey?.id);
  const { day: currentDayData } = useJourneyDay(slug || "", userState?.current_day || 1);
  const { habits, toggleHabit, getHabitCompletionStatus, updateHabit } = useHabits();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { toast } = useToast();
  const [pendingEdits, setPendingEdits] = useState<Map<string, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  if (loading || !journey) {
    return <JourneyDetailSkeleton />;
  }

  const theme = getJourneyTheme(journey.theme_slug || journey.illustration_key);
  const isActive = userState?.status === "active";
  const isPaused = userState?.status === "paused";
  const isCompleted = userState?.status === "completed";
  const isEnrolled = !!userState;
  const currentDay = userState?.current_day || 0;
  const coverImage = JOURNEY_COVERS[journey.slug] || theme.backgroundImage;

  // Get today's habit data
  const journeyHabitIds = new Set(journeyHabits.map((jh) => jh.habit_id));
  const todayHabits = habits.filter((h) => journeyHabitIds.has(h.id) && h.is_active);
  const completedCount = todayHabits.filter((h) => getHabitCompletionStatus(h.id)).length;
  const totalCount = todayHabits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Get display time for a habit (pending edit overrides DB value)
  const getDisplayTime = (habitId: string, dbTime: string | null): string => {
    return pendingEdits.get(habitId) || dbTime?.slice(0, 5) || "08:00";
  };

  // Set pending time edit
  const setPendingTime = (habitId: string, newTime: string) => {
    setPendingEdits((prev) => new Map(prev).set(habitId, newTime));
  };

  // Save all pending time edits
  const handleSaveEdits = async () => {
    setIsSaving(true);
    try {
      for (const [habitId, newTime] of pendingEdits) {
        await updateHabit({
          id: habitId,
          reminder_time: newTime,
          notification_pref: {
            reminder_enabled: true,
            reminder_time: newTime,
            sound: "default",
            time_sensitive: false,
          },
        });
      }
      setPendingEdits(new Map());
      haptic.success();
      toast({ title: "Horários atualizados", description: "Os lembretes foram salvos com sucesso." });
    } catch {
      haptic.error();
      toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle habit toggle
  const handleToggle = async (habitId: string) => {
    haptic.light();
    await toggleHabit(habitId);
  };

  // Next milestone
  const currentPhase = phases.find((p) => p.phase_number === (userState?.current_phase || 1));
  const nextPhase = phases.find((p) => p.phase_number === (userState?.current_phase || 1) + 1);
  const milestoneDay = currentPhase?.day_end || 7;
  const milestoneProgress = currentPhase
    ? Math.min(100, ((currentDay - currentPhase.day_start) / (currentPhase.day_end - currentPhase.day_start + 1)) * 100)
    : 0;

  // Progress ring calculations
  const ringSize = 56;
  const strokeWidth = 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ringOffset = circumference - (progressPercent / 100) * circumference;

  const handleStart = async () => {
    sounds.unlock();
    haptic.success();
    await startJourney(journey.id);
    if (!isAchievementUnlocked("journey_explorer")) {
      unlockAchievement({ achievementId: "journey_explorer", progressSnapshot: { journey_id: journey.id } }).catch(() => {});
    }
    navigate(`/journeys/${slug}/day/1`);
  };

  // ── NOT ENROLLED STATE ──
  if (!isEnrolled) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen"
        style={{ backgroundColor: isDarkMode ? "#000" : "#FAFAFA" }}
      >
        {/* Hero */}
        <div className="relative" style={{ height: "calc(45vh + 1rem + env(safe-area-inset-top, 0px))", marginLeft: "-1rem", marginRight: "-1rem", marginTop: "calc(-1rem - env(safe-area-inset-top, 0px))" }}>
          {coverImage && <img src={coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)" }} />
          <button onClick={() => navigate("/journeys")} className="absolute z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm" style={{ top: "calc(1rem + env(safe-area-inset-top, 0px))", left: "1rem" }}>
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h1 className="text-3xl font-bold text-white italic leading-tight">{journey.title}</h1>
            {journey.subtitle && <p className="text-sm text-white/60 mt-2">{journey.subtitle}</p>}
          </div>
        </div>

        {/* Info */}
        <div className="px-4 py-6 space-y-6">
          {journey.promise && (
            <p className={`text-sm leading-relaxed ${isDarkMode ? "text-white/60" : "text-gray-600"}`}>{journey.promise}</p>
          )}

          {/* Before/After */}
          {journey.target_audience && (
            <div className="rounded-xl p-4" style={{ backgroundColor: isDarkMode ? "rgb(28,28,28)" : "rgb(249,250,251)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: theme.color }}>PRA QUEM</p>
              <p className={`text-sm ${isDarkMode ? "text-white/70" : "text-gray-700"}`}>{journey.target_audience}</p>
            </div>
          )}
          {journey.expected_result && (
            <div className="rounded-xl p-4" style={{ backgroundColor: isDarkMode ? "rgb(28,28,28)" : "rgb(249,250,251)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: theme.color }}>O RESULTADO</p>
              <p className={`text-sm ${isDarkMode ? "text-white/70" : "text-gray-700"}`}>{journey.expected_result}</p>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold uppercase tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #A3E635 0%, #84CC16 100%)",
              color: "#000",
              boxShadow: "0 0 30px rgba(163,230,53,0.3), 0 4px 16px rgba(163,230,53,0.2)",
            }}
          >
            {isStarting ? "INICIANDO..." : "INICIAR JORNADA"}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── PAUSED STATE ──
  if (isPaused) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen" style={{ backgroundColor: isDarkMode ? "#000" : "#FAFAFA" }}>
        <div className="relative" style={{ height: "calc(45vh + 1rem + env(safe-area-inset-top, 0px))", marginLeft: "-1rem", marginRight: "-1rem", marginTop: "calc(-1rem - env(safe-area-inset-top, 0px))" }}>
          {coverImage && <img src={coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />
          <button onClick={() => navigate("/journeys")} className="absolute z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm" style={{ top: "calc(1rem + env(safe-area-inset-top, 0px))", left: "1rem" }}>
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">PAUSADA · DIA {currentDay} DE {journey.duration_days}</p>
            <h1 className="text-3xl font-bold text-white italic leading-tight">{journey.title}</h1>
          </div>
        </div>
        <div className="px-4 py-6">
          <button
            onClick={() => { haptic.medium(); resumeJourney(journey.id); }}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold uppercase tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #A3E635 0%, #84CC16 100%)", color: "#000", boxShadow: "0 0 30px rgba(163,230,53,0.3), 0 4px 16px rgba(163,230,53,0.2)" }}
          >
            RETOMAR JORNADA
          </button>
        </div>
      </motion.div>
    );
  }

  // ── ACTIVE STATE — Main daily view ──
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-navbar"
      style={{ backgroundColor: isDarkMode ? "#000" : "#FAFAFA" }}
    >
      {/* Hero with cover image */}
      <div className="relative" style={{ height: "calc(42vh + 1rem + env(safe-area-inset-top, 0px))", marginLeft: "-1rem", marginRight: "-1rem", marginTop: "calc(-1rem - env(safe-area-inset-top, 0px))" }}>
        {coverImage && (
          <img src={coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: isDarkMode
              ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)"
              : "linear-gradient(to top, rgba(250,250,250,1) 0%, rgba(250,250,250,0.4) 50%, rgba(250,250,250,0) 100%)",
          }}
        />
        {/* Back button */}
        <button
          onClick={() => navigate("/journeys")}
          className="absolute z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
          style={{ top: "calc(1rem + env(safe-area-inset-top, 0px))", left: "1rem" }}
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.color }}>
            DIA {currentDay} DE {journey.duration_days}
          </p>
          <h1 className={cn("text-3xl font-bold italic leading-tight", isDarkMode ? "text-white" : "text-gray-900")}>
            {journey.title}
          </h1>
        </div>
      </div>

      <div className="px-4 space-y-7 pt-4">
        {/* Today's Progress */}
        <div
          className="flex items-center justify-between rounded-xl px-5 py-4"
          style={{
            backgroundColor: isDarkMode ? "rgb(28,28,28)" : "rgb(249,250,251)",
            border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
              PROGRESSO DE HOJE
            </p>
            <p className={cn("text-xl font-bold mt-1", isDarkMode ? "text-white" : "text-gray-900")}>
              {completedCount}/{totalCount} Tarefas
            </p>
          </div>
          {/* Progress Ring */}
          <div className="relative">
            <svg width={ringSize} height={ringSize} className="transform -rotate-90">
              <circle cx={ringSize / 2} cy={ringSize / 2} r={radius} strokeWidth={strokeWidth} fill="transparent" style={{ stroke: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }} />
              <circle
                cx={ringSize / 2} cy={ringSize / 2} r={radius} strokeWidth={strokeWidth} fill="transparent"
                strokeDasharray={circumference} strokeDashoffset={ringOffset} strokeLinecap="round"
                style={{ stroke: theme.color, transition: "stroke-dashoffset 0.6s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-xs font-bold", isDarkMode ? "text-white" : "text-gray-900")}>{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* ── Premium Session Card ── */}
        {currentDayData?.card_content && (
          <motion.button
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => navigate(`/journeys/${slug}/session`)}
            className="w-full rounded-2xl p-[1.5px] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97]"
            style={{
              background: isDarkMode
                ? `linear-gradient(135deg, ${hexToRgba(theme.color, 0.5)} 0%, ${hexToRgba(theme.color, 0.15)} 40%, ${hexToRgba(theme.color, 0.4)} 100%)`
                : `linear-gradient(135deg, ${hexToRgba(theme.color, 0.4)} 0%, ${hexToRgba(theme.color, 0.1)} 40%, ${hexToRgba(theme.color, 0.3)} 100%)`,
              boxShadow: isDarkMode
                ? `0 0 32px ${hexToRgba(theme.color, 0.12)}, 0 0 64px ${hexToRgba(theme.color, 0.06)}, 0 4px 20px rgba(0,0,0,0.3)`
                : `0 0 24px ${hexToRgba(theme.color, 0.08)}, 0 4px 16px rgba(0,0,0,0.06)`,
            }}
          >
            <div
              className="flex items-center gap-4 rounded-[14px] px-5 py-5"
              style={{
                backgroundColor: isDarkMode ? "rgb(16, 16, 16)" : "#FFFFFF",
                boxShadow: isDarkMode ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "none",
              }}
            >
              {/* Icon with glow */}
              <div className="relative flex-shrink-0">
                {/* Glow behind icon */}
                <div
                  className="absolute inset-0 rounded-xl blur-lg"
                  style={{ backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.2 : 0.15) }}
                />
                <div
                  className="relative flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.15 : 0.12),
                    boxShadow: isDarkMode ? `0 0 16px ${hexToRgba(theme.color, 0.2)}` : `0 0 12px ${hexToRgba(theme.color, 0.12)}`,
                  }}
                >
                  <Play className="h-5 w-5 ml-0.5" style={{ color: theme.color }} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-left min-w-0">
                <p className={cn("text-base font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                  Sessão do Dia
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: isDarkMode ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
                  {currentDayData.title}
                  {currentDayData.estimated_minutes ? ` · ~${currentDayData.estimated_minutes} min` : ""}
                </p>
              </div>

              {/* Arrow */}
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.12 : 0.1),
                }}
              >
                <ChevronRight className="h-4 w-4" style={{ color: theme.color }} />
              </div>
            </div>
          </motion.button>
        )}

        {/* Essential Rituals */}
        <div className="space-y-4">
          <p className={cn("text-base font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
            Rituais Essenciais
          </p>
          <div className="space-y-3">
            {todayHabits.map((habit) => {
              const isDone = getHabitCompletionStatus(habit.id);
              const jh = journeyHabits.find((j) => j.habit_id === habit.id);
              const iconKey = habit.icon_key || (jh?.canonical_key ? CANONICAL_TO_ICON[jh.canonical_key] : null) || "plan";
              const HabitIcon = getHabitIcon(iconKey as HabitIconKey);
              const displayTime = getDisplayTime(habit.id, habit.reminder_time);
              const [displayHour, displayMinute] = displayTime.split(":");

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleToggle(habit.id)}
                  className="rounded-xl px-4 py-4 cursor-pointer active:scale-[0.98] transition-transform"
                  style={{
                    backgroundColor: isDarkMode ? "rgb(28,28,28)" : "rgb(249,250,251)",
                    border: isDone
                      ? `1px solid ${hexToRgba(theme.color, 0.3)}`
                      : `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                    boxShadow: isDone ? (isDarkMode ? `0 0 12px ${hexToRgba(theme.color, 0.08)}` : `0 0 8px ${hexToRgba(theme.color, 0.06)}`) : "none",
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.12 : 0.1),
                        boxShadow: isDone ? (isDarkMode ? `0 0 10px ${hexToRgba(theme.color, 0.15)}` : "none") : "none",
                      }}
                    >
                      {HabitIcon && <HabitIcon className="h-5 w-5" style={{ color: theme.color }} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-gray-900")}>{habit.name}</p>
                      {habit.goal_value && habit.unit && habit.unit !== "none" && (
                        <p className="text-xs mt-0.5" style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                          {habit.goal_value} {habit.unit === "minutes" ? "minutos" : habit.unit === "liters" ? "litros" : habit.unit}
                        </p>
                      )}
                      {/* Time row — Popover with DrumPicker */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 mt-2 touch-target-sm">
                            <Clock className="h-3 w-3" style={{ color: isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
                            <span className="text-xs" style={{ color: pendingEdits.has(habit.id) ? theme.color : (isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)") }}>
                              {displayTime}
                            </span>
                            <Pencil className="h-3 w-3 ml-1" style={{ color: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto rounded-xl border-0 p-4"
                          style={{
                            backgroundColor: isDarkMode ? "rgb(20, 20, 20)" : "#FFFFFF",
                            boxShadow: isDarkMode ? `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${hexToRgba(theme.color, 0.05)}` : "0 8px 32px rgba(0,0,0,0.12)",
                            border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                            "--drum-bg": isDarkMode ? "rgb(20, 20, 20)" : "#FFFFFF",
                          } as React.CSSProperties}
                        >
                          <div className="flex items-center gap-2">
                            <DrumColumn
                              options={HOURS}
                              value={displayHour}
                              onChange={(h) => setPendingTime(habit.id, `${h}:${displayMinute}`)}
                            />
                            <span className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>:</span>
                            <DrumColumn
                              options={MINUTES}
                              value={(() => {
                                const m = parseInt(displayMinute, 10);
                                const rounded = Math.round(m / 5) * 5;
                                return String(rounded >= 60 ? 0 : rounded).padStart(2, "0");
                              })()}
                              onChange={(m) => setPendingTime(habit.id, `${displayHour}:${m}`)}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Completion indicator */}
                    <div className="flex-shrink-0 mt-1">
                      {isDone ? (
                        <CheckCircle2 className="h-6 w-6" style={{ color: theme.color }} />
                      ) : (
                        <Circle
                          className="h-6 w-6"
                          style={{ color: isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {todayHabits.length === 0 && (
              <p className="text-sm text-center py-6" style={{ color: isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>
                Nenhum hábito ativo para hoje
              </p>
            )}
          </div>
        </div>


        {/* Next Milestone */}
        {currentPhase && !isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl px-5 py-4"
            style={{
              backgroundColor: isDarkMode ? "rgb(28,28,28)" : "rgb(249,250,251)",
              border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: theme.color }}>
                  PRÓXIMO MARCO
                </p>
                <p className={cn("text-base font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                  Dia {milestoneDay}: {currentPhase.badge_name || currentPhase.title}
                </p>
              </div>
              <Trophy className="h-8 w-8 flex-shrink-0 ml-4" style={{ color: isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }} />
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(5, milestoneProgress)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ backgroundColor: theme.color }}
              />
            </div>
          </motion.div>
        )}

        {/* Pause button */}
        {isActive && (
          <button
            onClick={() => { haptic.light(); pauseJourney(journey.id); }}
            className={cn(
              "w-full rounded-xl py-3 text-sm font-semibold transition-all",
              isDarkMode ? "bg-neutral-800 text-neutral-400 hover:bg-neutral-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            Pausar Jornada
          </button>
        )}
      </div>

      {/* Sticky Save Button — appears when user has pending time edits */}
      {pendingEdits.size > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-30 px-4"
          style={{ paddingBottom: "max(1rem, calc(1rem + env(safe-area-inset-bottom)))" }}
        >
          <button
            onClick={handleSaveEdits}
            disabled={isSaving}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold uppercase tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #A3E635 0%, #84CC16 100%)",
              color: "#000",
              boxShadow: "0 0 30px rgba(163,230,53,0.3), 0 4px 16px rgba(163,230,53,0.2), 0 -8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {isSaving ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JourneyDetail;
