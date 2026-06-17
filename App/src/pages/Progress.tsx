import { useMemo } from "react";
import { motion } from "motion/react";
import { Flame, TrendingUp, Calendar, Heart, Zap, BookOpen, Brain, Clock, Sparkles } from "lucide-react";
import useProgress from "@/hooks/useProgress";
import { useGamification, XP_VALUES } from "@/hooks/useGamification";
import { useHabits } from "@/hooks/useHabits";
import { hideGamification } from "@/config/featureFlags";
import { useAuth } from "@/integrations/supabase/auth";
import { useTheme } from "@/hooks/useTheme";
import { ProgressSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { HabitGlyph } from "@/components/icons/HabitGlyph";
import { HabitIconKey } from "@/components/icons/HabitIcons";

const DAY_LABELS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const DAY_LABELS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: typeof Heart }> = {
  corpo: { label: "Saúde", color: "#EF4444", icon: Heart },
  fitness: { label: "Fitness", color: "#EF4444", icon: Heart },
  mente: { label: "Mental", color: "#10B981", icon: Brain },
  productivity: { label: "Foco", color: "#FACC15", icon: Zap },
  estudo: { label: "Leitura", color: "#A855F7", icon: BookOpen },
  carreira: { label: "Carreira", color: "#3B82F6", icon: Zap },
  financeiro: { label: "Finanças", color: "#10B981", icon: TrendingUp },
  time_routine: { label: "Rotina", color: "#F59E0B", icon: Clock },
  avoid: { label: "Evitar", color: "#F97316", icon: Sparkles },
  nutrition: { label: "Nutrição", color: "#22C55E", icon: Heart },
  outro: { label: "Outro", color: "#6B7280", icon: Sparkles },
  relacionamento: { label: "Relações", color: "#EC4899", icon: Heart },
};

const Progress = () => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const {
    loading,
    weeklySeries,
    habitStreaks,
    weeklyInsight,
  } = useProgress();

  const {
    progress: gProgress,
    loading: gLoading,
  } = useGamification(user?.id);

  const { habits, completions } = useHabits();
  const isGamEnabled = !hideGamification;

  const currentStreak = gProgress?.current_streak || 0;
  const longestStreak = gProgress?.longest_streak || 0;

  // Category performance — compute from completions + habits (real data)
  const categoryPerformance = useMemo(() => {
    const activeHabits = habits.filter((h) => h.is_active);
    if (!activeHabits.length) return [];
    const todayStr = new Date().toISOString().split("T")[0];
    const completedIds = new Set(
      (completions || [])
        .filter((c: any) => c.completed_at === todayStr)
        .map((c: any) => c.habit_id)
    );
    const catMap = new Map<string, { total: number; completed: number }>();
    for (const h of activeHabits) {
      const cat = h.category || "outro";
      const entry = catMap.get(cat) || { total: 0, completed: 0 };
      entry.total++;
      if (completedIds.has(h.id)) entry.completed++;
      catMap.set(cat, entry);
    }
    const results: { category: string; label: string; color: string; icon: typeof Heart; percentage: number }[] = [];
    for (const [cat, val] of catMap) {
      const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.outro;
      results.push({
        category: cat,
        label: config.label,
        color: config.color,
        icon: config.icon,
        percentage: val.total > 0 ? Math.round((val.completed / val.total) * 100) : 0,
      });
    }
    return results.sort((a, b) => b.percentage - a.percentage).slice(0, 4);
  }, [habits, completions]);

  // Recent completions (today)
  const recentCompletions = useMemo(() => {
    if (!completions || !habits.length) return [];
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split("T")[0];

    const recent = completions
      .filter((c: any) => c.completed_at === todayStr || c.completed_at === yesterdayStr)
      .sort((a: any, b: any) => (b.completed_at_time || "").localeCompare(a.completed_at_time || ""))
      .slice(0, 5);

    return recent.map((c: any) => {
      const habit = habits.find((h) => h.id === c.habit_id);
      return {
        id: c.id,
        name: habit?.name || "Hábito",
        iconKey: habit?.icon_key || null,
        category: habit?.category || "outro",
        emoji: habit?.emoji || "⭐",
        time: c.completed_at_time ? c.completed_at_time.substring(0, 5) : null,
        isToday: c.completed_at === todayStr,
        xp: XP_VALUES.HABIT_COMPLETE || 5,
      };
    });
  }, [completions, habits]);

  // Weekly chart data
  const weeklyBars = useMemo(() => {
    return weeklySeries.map((point) => ({
      ...point,
      actualPct: point.scheduled > 0 ? Math.min(100, (point.completed / point.scheduled) * 100) : 0,
      targetPct: 100,
    }));
  }, [weeklySeries]);

  // Insights
  const insights = useMemo(() => {
    const result: { title: string; description: string; icon: typeof Sparkles }[] = [];

    // Best day insight
    if (weeklySeries.length > 0) {
      const best = weeklySeries.reduce((max, p) =>
        p.scheduled > 0 && (p.completed / p.scheduled) > (max.completed / Math.max(1, max.scheduled)) ? p : max
      , weeklySeries[0]);
      if (best.scheduled > 0) {
        const pct = Math.round((best.completed / best.scheduled) * 100);
        result.push({
          title: "Pico de Performance",
          description: `${best.dayLabel} é seu dia mais forte com ${pct}% de taxa de conclusão esta semana.`,
          icon: Zap,
        });
      }
    }

    // Morning vs evening
    const morningHabits = habitStreaks.filter((h) => {
      const habit = habits.find((hh) => hh.id === h.habitId);
      return habit?.period === "morning";
    });
    const eveningHabits = habitStreaks.filter((h) => {
      const habit = habits.find((hh) => hh.id === h.habitId);
      return habit?.period === "evening";
    });
    if (morningHabits.length > 0 && eveningHabits.length > 0) {
      const mAvg = morningHabits.reduce((s, h) => s + h.streak, 0) / morningHabits.length;
      const eAvg = eveningHabits.reduce((s, h) => s + h.streak, 0) / eveningHabits.length;
      if (mAvg > eAvg) {
        result.push({
          title: "Impulso Matinal",
          description: `Você é ${Math.round(((mAvg - eAvg) / Math.max(1, eAvg)) * 100)}% mais consistente nas rotinas matinais. Continue priorizando os hábitos da manhã.`,
          icon: Sparkles,
        });
      }
    }

    // Fallback: consistency insight
    if (result.length < 2 && weeklyInsight) {
      result.push({
        title: "Consistência Geral",
        description: `Sua taxa de consistência esta semana é de ${weeklyInsight.thisWeekConsistency}%. ${weeklyInsight.delta > 0 ? `Isso é ${weeklyInsight.delta}% melhor que a semana passada!` : weeklyInsight.delta < 0 ? `Foque em manter a constância — semana passada foi ${Math.abs(weeklyInsight.delta)}% maior.` : "Mantenha o ritmo!"}`,
        icon: TrendingUp,
      });
    }

    // Fallback: perfect days
    if (result.length < 2 && weeklyInsight && weeklyInsight.perfectDaysThisWeek > 0) {
      result.push({
        title: "Dias Perfeitos",
        description: `Você teve ${weeklyInsight.perfectDaysThisWeek} dia${weeklyInsight.perfectDaysThisWeek > 1 ? "s" : ""} perfeito${weeklyInsight.perfectDaysThisWeek > 1 ? "s" : ""} esta semana — completou todos os hábitos do dia. Continue assim!`,
        icon: Flame,
      });
    }

    // Final fallback
    if (result.length < 2) {
      result.push({
        title: "Construindo Hábitos",
        description: `Você tem ${habits.filter(h => h.is_active).length} hábitos ativos. A consistência é a chave — cada dia conta para construir rotinas duradouras.`,
        icon: Sparkles,
      });
    }

    return result.slice(0, 3);
  }, [weeklySeries, habitStreaks, habits, weeklyInsight]);

  // Shared dark card style with glow
  const darkCardStyle = isDark ? {
    background: "linear-gradient(145deg, #1c1c1c 0%, #141414 100%)",
    boxShadow: "0 0 40px rgba(163,230,53,0.03), 0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
  } : undefined;

  const darkCardClass = isDark
    ? "border border-white/[0.08]"
    : "bg-white border border-gray-100 shadow-sm";

  if (loading || gLoading) return <ProgressSkeleton />;

  return (
    <div className="min-h-screen bg-background pb-navbar">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="px-4 max-w-xl mx-auto w-full"
        style={{ paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))" }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Sua evolução
          </h1>
          <div
            className={cn(
              "inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider",
              isDark
                ? "bg-white/5 text-white/50 border border-white/5"
                : "bg-gray-100 text-muted-foreground border border-gray-200/50"
            )}
          >
            <Calendar className="w-3 h-3" />
            Últimos 30 dias
          </div>
        </motion.div>

        {/* Current Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn("rounded-3xl p-6 mb-4 relative overflow-hidden", darkCardClass)}
          style={isDark ? {
            background: "linear-gradient(145deg, #1e1e1e 0%, #141414 50%, #0f1a0f 100%)",
            boxShadow: "0 0 80px rgba(163,230,53,0.06), 0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
          } : undefined}
        >
          {/* Ambient glow blob */}
          {isDark && (
            <div
              className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 70%)" }}
            />
          )}
          <div className="relative z-10">
            <Flame
              className={cn("w-6 h-6 mb-3", isDark ? "text-lime-300" : "text-lime-600")}
              style={isDark ? { filter: "drop-shadow(0 0 8px rgba(163,230,53,0.4))" } : undefined}
            />
            <p className={cn("text-[10px] uppercase tracking-[0.2em] mb-2", isDark ? "text-white/40" : "text-muted-foreground")}>
              Streak Atual
            </p>
            <p
              className={cn("text-6xl font-bold leading-none tracking-tight", isDark ? "text-white" : "text-foreground")}
              style={isDark ? { textShadow: "0 0 30px rgba(163,230,53,0.12)" } : undefined}
            >
              {currentStreak}
              <span className={cn("text-xl font-medium ml-2", isDark ? "text-white/40" : "text-muted-foreground")}>
                Dias
              </span>
            </p>
          </div>
          <div className={cn("flex items-center justify-between mt-4 pt-4", isDark ? "border-t border-white/5" : "border-t border-gray-100")}>
            <div>
              <p className={cn("text-[9px] uppercase tracking-widest", isDark ? "text-white/30" : "text-muted-foreground")}>
                Melhor Streak
              </p>
              <p className={cn("text-lg font-bold", isDark ? "text-white/80" : "text-foreground")}>
                {longestStreak} Dias
              </p>
            </div>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDark ? "bg-lime-400/10" : "bg-lime-100")}>
              <TrendingUp className={cn("w-5 h-5", isDark ? "text-lime-300" : "text-lime-600")} />
            </div>
          </div>
        </motion.div>

        {/* Weekly Consistency Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={cn("rounded-3xl p-6 mb-4", darkCardClass)}
          style={darkCardStyle}
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className={cn("text-base font-bold", isDark ? "text-white" : "text-foreground")}>
                Consistência Semanal
              </h2>
              <p className={cn("text-[11px] mt-0.5", isDark ? "text-white/40" : "text-muted-foreground")}>
                Taxa de conclusão ativa vs meta
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-lime-400" />
                <span className={cn("text-[10px] uppercase tracking-wider", isDark ? "text-white/40" : "text-muted-foreground")}>Real</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", isDark ? "bg-lime-400/25" : "bg-lime-200")} />
                <span className={cn("text-[10px] uppercase tracking-wider", isDark ? "text-white/40" : "text-muted-foreground")}>Meta</span>
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-2 mt-6 h-32">
            {weeklyBars.map((bar, i) => (
              <div key={bar.date || i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="relative w-full h-28 flex items-end justify-center gap-[2px]">
                  {/* Target bar (background) */}
                  <div
                    className={cn("w-[45%] rounded-t-md", isDark ? "bg-lime-400/15" : "bg-lime-100")}
                    style={{ height: `${Math.max(8, bar.targetPct * 0.9)}%` }}
                  />
                  {/* Actual bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, bar.actualPct * 0.9)}%` }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.05 }}
                    className="w-[45%] rounded-t-md bg-lime-400"
                    style={isDark ? { boxShadow: bar.actualPct > 50 ? "0 0 8px rgba(163,230,53,0.3)" : "none" } : undefined}
                  />
                </div>
                <span className={cn("text-[9px] font-medium", isDark ? "text-white/30" : "text-muted-foreground")}>
                  {bar.dayLabel?.substring(0, 3).toUpperCase() || DAY_LABELS_SHORT[i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance por Categoria */}
        {categoryPerformance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <h2 className={cn("text-base font-bold mb-3", isDark ? "text-white" : "text-foreground")}>
              Performance por Categoria
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {categoryPerformance.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.category}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                    className={cn(
                      "rounded-2xl p-4",
                      isDark ? "border border-white/[0.06]" : "bg-white border border-gray-100 shadow-sm"
                    )}
                    style={isDark ? { backgroundColor: "#1a1a1a" } : undefined}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: cat.color }} />
                      </div>
                      <span
                        className="text-xl font-bold"
                        style={{ color: cat.color }}
                      >
                        {cat.percentage}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className={cn("w-full h-1.5 rounded-full mb-2", isDark ? "bg-white/5" : "bg-gray-100")}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                    <p className={cn("text-xs", isDark ? "text-white/50" : "text-muted-foreground")}>
                      {cat.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2.5 mb-4"
          >
            {insights.map((insight, i) => {
              const Icon = insight.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-2xl p-5",
                    darkCardClass
                  )}
                  style={darkCardStyle}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", isDark ? "bg-lime-400/10" : "bg-lime-100")}>
                      <Icon className={cn("w-4 h-4", isDark ? "text-lime-300" : "text-lime-600")} />
                    </div>
                    <div>
                      <h3 className={cn("text-sm font-bold mb-1", isDark ? "text-white" : "text-foreground")}>
                        {insight.title}
                      </h3>
                      <p className={cn("text-xs leading-relaxed", isDark ? "text-white/50" : "text-muted-foreground")}>
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Recent Completions */}
        {recentCompletions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <h2 className={cn("text-base font-bold mb-3", isDark ? "text-white" : "text-foreground")}>
              Recentemente
            </h2>
            <div className="space-y-2">
              {recentCompletions.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className={cn(
                    "rounded-2xl p-4 flex items-center gap-3",
                    darkCardClass
                  )}
                  style={darkCardStyle}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", isDark ? "bg-lime-400/15" : "bg-gray-100")}>
                    <HabitGlyph
                      iconKey={item.iconKey as HabitIconKey | null}
                      category={item.category}
                      size="sm"
                      tone="gray"
                      fallbackLabel={item.emoji}
                      className={isDark ? "text-lime-300" : "text-gray-600"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold truncate", isDark ? "text-white" : "text-foreground")}>
                      {item.name}
                    </p>
                    <p className={cn("text-[11px]", isDark ? "text-white/40" : "text-muted-foreground")}>
                      {item.isToday ? "Concluído hoje" : "Concluído ontem"}
                      {item.time ? ` às ${item.time}` : ""}
                    </p>
                  </div>
                  {isGamEnabled && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0",
                        isDark ? "bg-lime-400/15 text-lime-300" : "bg-lime-100 text-lime-700"
                      )}
                    >
                      +{item.xp} XP
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Progress;
