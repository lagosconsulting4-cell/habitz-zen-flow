import { useMemo } from "react";
import { motion } from "motion/react";
import { Calendar, TrendingUp, Target, Award, Flame, ListOrdered, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import NavigationBar from "@/components/NavigationBar";
import useProgress from "@/hooks/useProgress";

const Progress = () => {
  const {
    loading,
    weeklySeries,
    monthlyStats,
    habitStreaks,
    bestGlobalStreak,
    heatmap,
    topHabits,
    dailyTrend,
    weekdayDist,
    hourDist,
    totalCompletions,
    consistencyAllTime,
  } = useProgress();

  const hasData = useMemo(() => weeklySeries.some((point) => point.scheduled > 0), [weeklySeries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] pb-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-6 max-w-4xl"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-white mb-2">
            Seu Progresso
          </h1>
          <p className="text-white/60">
            Acompanhe sua disciplina nos hábitos concluídos no dia a dia
          </p>
        </div>

        {!hasData ? (
          <Card className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Comece criando seus hábitos</h2>
            <p className="text-sm text-white/60">
              Assim que você marcar os hábitos do dia como concluídos, toda a evolução aparecerá aqui automaticamente.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Calendar, value: monthlyStats.perfectDays, label: "Dias perfeitos" },
                { icon: TrendingUp, value: `${monthlyStats.consistency}%`, label: "Consistência" },
                { icon: Target, value: monthlyStats.topCategory || "--", label: "Categoria destaque" },
                { icon: Award, value: bestGlobalStreak, label: "Melhor sequência" }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="rounded-2xl bg-white/5 border border-white/10 p-4">
                      <div className="text-center">
                        <div className="p-3 bg-lime-400/10 rounded-xl mx-auto w-fit mb-3">
                          <Icon className="w-6 h-6 text-lime-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mt-1">
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
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-white/40 font-semibold">Total de conclusões (90d)</span>
                    <span className="text-2xl font-bold text-white">{totalCompletions}</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-white/40 font-semibold">Consistência 90d</span>
                    <span className="text-2xl font-bold text-white">{consistencyAllTime}%</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-white/40 font-semibold">Melhor streak global</span>
                    <span className="text-2xl font-bold text-white">{bestGlobalStreak}d</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-white/40 font-semibold">Destaque</span>
                    <span className="text-sm font-semibold text-white">{monthlyStats.topCategory || "—"}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <Card className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold uppercase tracking-wide text-white">Progresso da semana</h2>
                  <Badge className="text-xs bg-white/10 text-white/60 border-white/10">
                    {weeklySeries[0].date}  –  {weeklySeries[6].date}
                  </Badge>
                </div>
                <div className="flex justify-between items-end h-36">
                  {weeklySeries.map((day, index) => {
                    const percentage = day.scheduled > 0 ? day.completed / day.scheduled : 0;
                    const barHeight = Math.max(percentage * 100, day.completed > 0 ? 20 : 6);

                    return (
                      <div key={day.date} className="flex flex-col items-center gap-2">
                        <div className="relative w-10">
                          <div
                            className="w-full bg-lime-400 rounded-t-xl transition-all duration-500"
                            style={{ height: `${barHeight}%`, minHeight: `${Math.max(barHeight, 6)}px`, animationDelay: `${index * 120}ms` }}
                          />
                          <div
                            className="absolute inset-x-0 bottom-0 h-full bg-white/5 rounded-xl -z-10"
                            aria-hidden
                          />
                        </div>
                        <span className="text-sm font-semibold text-white/60">
                          {day.dayLabel}
                        </span>
                        <span className="text-xs text-white/40">
                          {day.completed}/{day.scheduled}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold uppercase tracking-wide text-white">Evolução diária (90d)</h2>
                  <Badge className="text-xs bg-white/10 text-white/60 border-white/10">Últimos 90 dias</Badge>
                </div>
                <Sparkline data={dailyTrend.map((d) => d.count)} />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <Card className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8">
                <h2 className="text-lg font-bold uppercase tracking-wide text-white mb-6">Sequências de hábitos</h2>
                <div className="space-y-4">
                  {habitStreaks.length === 0 ? (
                    <p className="text-sm text-white/60">
                      Conclua seus hábitos para acompanhar as sequências aqui.
                    </p>
                  ) : (
                    habitStreaks.map((streak, index) => (
                      <div
                        key={streak.habitId}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{streak.emoji}</div>
                          <div>
                            <p className="font-semibold text-white">{streak.name}</p>
                            <p className="text-xs text-white/60">
                              Melhor: {streak.bestStreak} dias  –  Categoria: {streak.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-2xl font-bold text-lime-400">{streak.streak}</span>
                            <Flame className="w-4 h-4 text-lime-400" />
                          </div>
                          <p className="text-xs text-white/40">dias seguidos</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold uppercase tracking-wide text-white">Heatmap 30 dias</h2>
                  <Badge className="text-xs bg-white/10 text-white/60 border-white/10">Últimos 30 dias</Badge>
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {heatmap.map((day) => {
                    const intensity = Math.min(day.count, 4);
                    const shades = ["bg-white/5", "bg-lime-400/20", "bg-lime-400/40", "bg-lime-400/60", "bg-lime-400/80"];
                    return (
                      <div
                        key={day.date}
                        className={`aspect-square rounded ${shades[intensity]} border border-white/10`}
                        title={`${day.date}: ${day.count} conclusões`}
                      />
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
            >
              <Card className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <ListOrdered className="h-4 w-4 text-lime-400" />
                  <h2 className="text-lg font-bold uppercase tracking-wide text-white">Ranking de hábitos</h2>
                </div>
                {topHabits.length === 0 ? (
                  <p className="text-sm text-white/60">Complete hábitos para ver o ranking.</p>
                ) : (
                  <div className="space-y-2">
                    {topHabits.map((habit, index) => (
                      <div
                        key={habit.habitId}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-lime-400">#{index + 1}</span>
                          <div>
                            <p className="font-semibold text-white">{habit.name}</p>
                            <p className="text-xs text-white/60">{habit.category}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-white">{habit.completions}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Timer className="h-4 w-4 text-lime-400" />
                  <h2 className="text-lg font-bold uppercase tracking-wide text-white">Distribuição por hora</h2>
                </div>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                  {hourDist.map((item) => {
                    const max = Math.max(...hourDist.map((h) => h.count), 1);
                    const height = (item.count / max) * 100;
                    return (
                      <div key={item.hour} className="flex flex-col items-center gap-1">
                        <div className="h-24 w-full bg-white/5 rounded-lg overflow-hidden flex items-end">
                          <div className="w-full bg-lime-400" style={{ height: `${height}%` }} />
                        </div>
                        <span className="text-[10px] text-white/60 font-semibold">
                          {item.hour}h
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.55 }}
            >
              <Card className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-4 w-4 text-lime-400" />
                  <h2 className="text-lg font-bold uppercase tracking-wide text-white">Distribuição por dia da semana</h2>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekdayDist.map((item) => {
                    const max = Math.max(...weekdayDist.map((d) => d.count), 1);
                    const height = (item.count / max) * 100;
                    return (
                      <div key={item.weekday} className="flex flex-col items-center gap-1">
                        <div className="h-24 w-full bg-white/5 rounded-lg overflow-hidden flex items-end">
                          <div className="w-full bg-lime-400/70" style={{ height: `${height}%` }} />
                        </div>
                        <span className="text-[10px] text-white/60 font-semibold">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>

      <NavigationBar />
    </div>
  );
};

export default Progress;

// Sparkline simples em SVG
const Sparkline = ({ data }: { data: number[] }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const width = 300;
  const height = 80;
  const step = width / (data.length - 1 || 1);
  const points = data.map((val, idx) => {
    const x = idx * step;
    const y = height - (val / max) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 text-lime-400">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
};





