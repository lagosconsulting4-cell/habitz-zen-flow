import { useMemo, memo } from "react";
import { motion } from "motion/react";
import { Calendar, TrendingUp, Award, Flame, Zap, Trophy, Compass, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useProgress from "@/hooks/useProgress";
import { useGamification, getLevelConfig } from "@/hooks/useGamification";
import { useActiveJourneys } from "@/hooks/useJourney";
import { hideGamification } from "@/config/featureFlags";
import { useAuth } from "@/integrations/supabase/auth";
import { getHabitIconWithFallback, HabitIconKey } from "@/components/icons/HabitIcons";
import { JourneyIllustration, getJourneyTheme } from "@/components/JourneyIllustration";
import { ProgressSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Tier colors for gamification display - Premium metallic palette
const tierColors = {
  bronze: {
    bg: "from-zinc-900/50 to-neutral-900/40",
    border: "border-zinc-600/40",
    text: "text-zinc-300",
    glow: "shadow-zinc-400/25",
    bar: "from-zinc-400 via-neutral-300 to-zinc-400",
    ring: "stroke-zinc-400",
    glowHex: "rgba(161,161,170,0.25)",
  },
  prata: {
    bg: "from-slate-900/50 to-slate-800/40",
    border: "border-slate-500/40",
    text: "text-slate-200",
    glow: "shadow-slate-300/30",
    bar: "from-slate-400 via-slate-300 to-slate-400",
    ring: "stroke-slate-300",
    glowHex: "rgba(203,213,225,0.30)",
  },
  ouro: {
    bg: "from-yellow-950/50 to-amber-950/40",
    border: "border-yellow-500/40",
    text: "text-yellow-300",
    glow: "shadow-yellow-400/30",
    bar: "from-yellow-400 via-amber-300 to-yellow-400",
    ring: "stroke-yellow-400",
    glowHex: "rgba(250,204,21,0.30)",
  },
  diamante: {
    bg: "from-cyan-950/50 to-blue-950/40",
    border: "border-cyan-400/40",
    text: "text-cyan-200",
    glow: "shadow-cyan-300/35",
    bar: "from-cyan-400 via-blue-300 to-cyan-300",
    ring: "stroke-cyan-300",
    glowHex: "rgba(103,232,249,0.35)",
  },
};

// Spring transition preset
const springTransition = { type: "spring" as const, stiffness: 260, damping: 28 };

const Progress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeStates: activeJourneys } = useActiveJourneys();
  const {
    loading,
    weeklySeries,
    habitStreaks,
    heatmap,
    dailyTrend,
    weeklyInsight,
    habitsNeedingAttention,
  } = useProgress();

  const {
    progress: gamificationProgress,
    currentLevelConfig,
    currentLevelProgress,
    xpToNextLevel,
    loading: gamificationLoading,
  } = useGamification(user?.id);

  const hasData = useMemo(() => weeklySeries.some((point) => point.scheduled > 0), [weeklySeries]);
  const tierColor = currentLevelConfig ? tierColors[currentLevelConfig.tier] : tierColors.bronze;

  const nextLevelConfig = currentLevelConfig ? getLevelConfig(currentLevelConfig.level + 1) : null;
  const isMaxLevel = currentLevelConfig?.level === 10;

  // Today's weekday index (0=Sun)
  const todayIndex = new Date().getDay();

  // Heatmap: GitHub-style 7 columns
  const heatmapGrid = useMemo(() => {
    if (!heatmap.length) return [];
    const firstDate = new Date(heatmap[0].date);
    const startDay = firstDate.getDay(); // 0=Sun
    const cells: { date: string; count: number; empty: boolean }[] = [];
    // Add empty cells for alignment
    for (let i = 0; i < startDay; i++) {
      cells.push({ date: "", count: 0, empty: true });
    }
    heatmap.forEach((d) => cells.push({ ...d, empty: false }));
    return cells;
  }, [heatmap]);

  if (loading) {
    return <ProgressSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pb-navbar transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 pb-6 max-w-4xl"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground mb-2">
            Seu Progresso
          </h1>
          <p className="text-muted-foreground font-serif italic">
            Acompanhe sua disciplina nos hábitos concluídos no dia a dia
          </p>
        </div>

        {/* Gamification Hero Card - Premium Design */}
        {!hideGamification && gamificationProgress && !gamificationLoading && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...springTransition }}
            className="mb-8 relative"
          >
            {/* Breathing glow — CSS animation for compositor thread */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none animate-breathe"
              style={{ boxShadow: `0 0 40px ${tierColor.glowHex}` }}
            />
            <Card
              className={cn(
                "rounded-2xl overflow-hidden border relative",
                `bg-gradient-to-br ${tierColor.bg}`,
                tierColor.border,
                "backdrop-blur-sm",
                `shadow-lg ${tierColor.glow}`
              )}
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite]"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
                  }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-6">
                  {/* Progress Ring */}
                  <div className="relative flex-shrink-0">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none" stroke="currentColor" strokeWidth="8"
                        className="text-muted/20"
                      />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none" strokeWidth="8" strokeLinecap="round"
                        className={tierColor.ring}
                        strokeDasharray={`${(currentLevelProgress / 100) * 264} 264`}
                        style={{ filter: `drop-shadow(0 0 6px currentColor)` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Trophy className={cn("w-6 h-6 mb-0.5", tierColor.text)} />
                      <span className={cn("text-lg font-bold", tierColor.text)}>
                        {currentLevelConfig?.level || 1}
                      </span>
                    </div>
                  </div>

                  {/* Level Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-xl font-bold", tierColor.text)}>
                        {currentLevelConfig?.name || "Bronze I"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isMaxLevel
                        ? "Parabéns! Você alcançou o nível máximo!"
                        : `${xpToNextLevel} XP para ${nextLevelConfig?.name}`}
                    </p>

                    {!isMaxLevel && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className={tierColor.text}>{currentLevelProgress}%</span>
                        </div>
                        <div className="h-2 bg-black/20 dark:bg-black/40 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: currentLevelProgress / 100 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={cn("h-full rounded-full origin-left", `bg-gradient-to-r ${tierColor.bar}`)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className={cn("w-4 h-4", tierColor.text)} />
                      <span className="text-lg font-bold text-foreground">
                        {gamificationProgress.total_xp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">XP Total</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-lg font-bold text-foreground">
                        {gamificationProgress.current_streak}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Sequência</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-lg font-bold text-foreground">
                        {gamificationProgress.longest_streak}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Recorde</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="text-lg font-bold text-foreground">
                        {gamificationProgress.perfect_days}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Dias Perfeitos</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Minhas Jornadas Section */}
        {activeJourneys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...springTransition, delay: 0.08 }}
            className="mb-8"
          >
            <Card className="progress-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Minhas Jornadas</h2>
                </div>
                <button
                  onClick={() => navigate("/journeys")}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Ver todas
                </button>
              </div>
              <div className="space-y-3">
                {activeJourneys.map((state) => {
                  const journey = (state as any).journeys;
                  if (!journey) return null;
                  const percent = state.completion_percent || 0;
                  const theme = getJourneyTheme(journey.theme_slug || journey.illustration_key);
                  return (
                    <button
                      key={state.id}
                      onClick={() => navigate(`/journeys/${journey.slug}`)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl bg-secondary hover:bg-muted transition-colors text-left"
                      style={{
                        borderWidth: 1,
                        borderColor: `${theme.color}1A`,
                        boxShadow: `0 0 0 0 transparent`,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 8px ${theme.color}0D`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 transparent`; }}
                    >
                      <JourneyIllustration
                        illustrationKey={journey.illustration_key || journey.theme_slug}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {journey.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dia {state.current_day}/{journey.duration_days} · Fase {state.current_phase}
                        </p>
                        <div className="mt-1.5 h-1.5 bg-black/20 dark:bg-black/40 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%`, backgroundColor: theme.color }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: theme.color }}>
                        {percent}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {!hasData ? (
          <Card className="progress-card p-8 text-center">
            <div className="max-w-xs mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Comece criando seus hábitos</h2>
              <p className="text-sm text-muted-foreground">
                Assim que você marcar os hábitos do dia como concluídos, toda a evolução aparecerá aqui automaticamente.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Resumo Semanal */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...springTransition, delay: 0.12 }}
            >
              <Card className="progress-card p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground">Esta semana</h2>
                  {weeklyInsight.delta !== 0 && (
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        weeklyInsight.delta > 0 ? "text-green-500" : "text-red-400"
                      )}
                    >
                      {weeklyInsight.delta > 0 ? "\u2191" : "\u2193"}
                      {Math.abs(weeklyInsight.delta)}% vs anterior
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">
                    {weeklyInsight.thisWeekConsistency}%
                  </span>
                  <div className="mt-2 h-3 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: weeklyInsight.thisWeekConsistency / 100 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 origin-left"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <span className="font-medium text-foreground">
                    {weeklyInsight.habitsOnTrack} de {weeklyInsight.habitsTotal} em dia
                  </span>
                  <span>·</span>
                  <span>
                    {weeklyInsight.perfectDaysThisWeek}{" "}
                    {weeklyInsight.perfectDaysThisWeek === 1 ? "dia perfeito" : "dias perfeitos"}
                  </span>
                </div>

                {weeklyInsight.personalRecord && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="text-foreground">
                      Recorde: <strong>{weeklyInsight.personalRecord.name}</strong> atingiu{" "}
                      {weeklyInsight.personalRecord.streak} dias!
                    </span>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Weekly Bar Chart with gradient + animation */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...springTransition, delay: 0.16 }}
            >
              <Card className="progress-card p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-foreground">Progresso da semana</h2>
                  <Badge className="text-xs bg-muted text-muted-foreground border-border">
                    {weeklySeries[0].date}  –  {weeklySeries[6].date}
                  </Badge>
                </div>
                <svg viewBox="0 0 350 160" className="w-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  {weeklySeries.map((day, i) => {
                    const percentage = day.scheduled > 0 ? day.completed / day.scheduled : 0;
                    const barH = Math.max(percentage * 110, day.completed > 0 ? 22 : 6);
                    const barW = 32;
                    const gap = 350 / 7;
                    const x = gap * i + (gap - barW) / 2;
                    const isToday = i === todayIndex;
                    return (
                      <g key={day.date}>
                        {/* Background bar */}
                        <rect
                          x={x} y={10} width={barW} height={110}
                          rx={6} fill="hsl(var(--muted))" opacity={0.4}
                        />
                        {/* Data bar */}
                        <motion.rect
                          x={x}
                          width={barW}
                          rx={6}
                          fill="url(#barGrad)"
                          initial={{ height: 0, y: 120 }}
                          animate={{ height: barH, y: 120 - barH }}
                          transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease: "easeOut" }}
                          style={isToday ? { filter: "drop-shadow(0 0 6px hsl(var(--primary)))" } : undefined}
                        />
                        {/* Day label */}
                        <text
                          x={x + barW / 2} y={140}
                          textAnchor="middle"
                          className="fill-muted-foreground"
                          style={{ fontSize: 11, fontWeight: 600 }}
                        >
                          {day.dayLabel}
                        </text>
                        {/* Count */}
                        <text
                          x={x + barW / 2} y={155}
                          textAnchor="middle"
                          className="fill-muted-foreground"
                          style={{ fontSize: 9, opacity: 0.6 }}
                        >
                          {day.completed}/{day.scheduled}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </Card>
            </motion.div>

            {/* Habit Streaks */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...springTransition, delay: 0.2 }}
            >
              <Card className="progress-card p-6 mb-8">
                <h2 className="text-lg font-bold text-foreground mb-6">Sequências de hábitos</h2>
                <div className="space-y-3">
                  {habitStreaks.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                        <Flame className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Conclua seus hábitos para acompanhar as sequências aqui.
                      </p>
                    </div>
                  ) : (
                    habitStreaks.map((streak, index) => {
                      const StreakIcon = getHabitIconWithFallback(
                        streak.iconKey as HabitIconKey | null,
                        streak.category
                      );
                      const streakRatio = (streak.streak / Math.max(streak.bestStreak, 1)) * 100;
                      const isHotStreak = streak.streak > 7;
                      return (
                        <motion.div
                          key={streak.habitId}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + Math.min(index * 0.03, 0.24) }}
                          className="progress-card p-4 flex items-center gap-4"
                        >
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                            <StreakIcon className="w-5 h-5 text-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-sm truncate">{streak.name}</p>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <span className="text-lg font-bold text-orange-500">{streak.streak}</span>
                                <Flame
                                  className="w-4 h-4 text-orange-500"
                                  style={isHotStreak ? { filter: "drop-shadow(0 0 4px rgba(249,115,22,0.5))" } : undefined}
                                />
                              </div>
                            </div>
                            <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: Math.min(streakRatio, 100) / 100 }}
                                transition={{ duration: 0.6, delay: 0.3 + index * 0.03 }}
                                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 origin-left"
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Melhor: {streak.bestStreak}d · {streak.category}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Precisa de Atenção */}
            {habitsNeedingAttention.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...springTransition, delay: 0.24 }}
              >
                <Card className="progress-card p-6 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-bold text-foreground">Precisa de atenção</h2>
                  </div>
                  <div className="space-y-2">
                    {habitsNeedingAttention.map((habit) => {
                      const HabitIcon = getHabitIconWithFallback(
                        habit.iconKey as HabitIconKey | null,
                        habit.category
                      );
                      return (
                        <div
                          key={habit.habitId}
                          className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
                        >
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                            <HabitIcon className="w-5 h-5 text-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {habit.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Sequência quebrada ·{" "}
                              {habit.daysSinceLastCompletion >= 999
                                ? "sem conclusão recente"
                                : habit.daysSinceLastCompletion === 0
                                  ? "completou hoje"
                                  : `última vez: ${habit.daysSinceLastCompletion} ${habit.daysSinceLastCompletion === 1 ? "dia" : "dias"} atrás`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Heatmap 30 days - GitHub style 7 columns */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...springTransition, delay: 0.28 }}
            >
              <Card className="progress-card p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground">Heatmap 30 dias</h2>
                  <Badge className="text-xs bg-muted text-muted-foreground border-border">Últimos 30 dias</Badge>
                </div>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                    <div key={i} className="text-[9px] text-muted-foreground text-center font-semibold">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {heatmapGrid.map((day, i) => {
                    if (day.empty) return <div key={`empty-${i}`} className="aspect-square" />;
                    const intensity = Math.min(day.count, 4);
                    const shades = [
                      "bg-muted/40",
                      "bg-primary/15",
                      "bg-primary/30",
                      "bg-primary/50",
                      "bg-primary/80",
                    ];
                    return (
                      <div
                        key={day.date}
                        className={`aspect-square rounded-[3px] ${shades[intensity]}`}
                        title={`${day.date}: ${day.count} conclusões`}
                      />
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex items-center justify-end gap-1.5 mt-3">
                  <span className="text-[9px] text-muted-foreground">Menos</span>
                  {["bg-muted/40", "bg-primary/15", "bg-primary/30", "bg-primary/50", "bg-primary/80"].map((shade, i) => (
                    <div key={i} className={`w-3 h-3 rounded-[2px] ${shade}`} />
                  ))}
                  <span className="text-[9px] text-muted-foreground">Mais</span>
                </div>
              </Card>
            </motion.div>

            {/* Sparkline with area fill */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...springTransition, delay: 0.32 }}
            >
              <Card className="progress-card p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground">Evolução diária (90d)</h2>
                  <Badge className="text-xs bg-muted text-muted-foreground border-border">Últimos 90 dias</Badge>
                </div>
                <Sparkline data={dailyTrend.map((d) => d.count)} />
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Progress;

// Enhanced Sparkline with area fill + gradient
const Sparkline = memo(({ data }: { data: number[] }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const width = 300;
  const height = 100;
  const step = width / (data.length - 1 || 1);
  const points = data.map((val, idx) => {
    const x = idx * step;
    const y = height - (val / max) * height;
    return { x, y };
  });

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  // Area: line + close at bottom
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`;
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 text-primary">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <polygon fill="url(#sparkFill)" points={areaPoints} />
      <polyline
        fill="none"
        stroke="url(#sparkStroke)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={linePoints}
      />
      {last && (
        <circle cx={last.x} cy={last.y} r="4" fill="hsl(var(--primary))" className="animate-breathe" />
      )}
    </svg>
  );
});
