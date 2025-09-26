import { useMemo } from "react";
import { Calendar, TrendingUp, Target, Award, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import useProgress from "@/hooks/useProgress";

const Progress = () => {
  const { loading, weeklySeries, monthlyStats, habitStreaks, bestGlobalStreak } = useProgress();

  const hasData = useMemo(() => weeklySeries.some((point) => point.scheduled > 0), [weeklySeries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-light mb-2">
            Seu <span className="font-medium gradient-text">Progresso</span>
          </h1>
          <p className="text-muted-foreground font-light">
            Acompanhe sua disciplina nos hábitos concluídos no dia a dia
          </p>
        </div>

        {!hasData ? (
          <Card className="glass-card p-8 text-center animate-fade-in">
            <h2 className="text-xl font-medium mb-2">Comece criando seus hábitos</h2>
            <p className="text-sm text-muted-foreground">
              Assim que você marcar os hábitos do dia como concluídos, toda a evolução aparecerá aqui automaticamente.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
              <Card className="glass-card p-4">
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-xl mx-auto w-fit mb-3">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-2xl font-medium">{monthlyStats.perfectDays}</p>
                  <p className="text-xs text-muted-foreground font-light">Dias perfeitos</p>
                </div>
              </Card>

              <Card className="glass-card p-4">
                <div className="text-center">
                  <div className="p-3 bg-accent/10 rounded-xl mx-auto w-fit mb-3">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-2xl font-medium">{monthlyStats.consistency}%</p>
                  <p className="text-xs text-muted-foreground font-light">Consistência</p>
                </div>
              </Card>

              <Card className="glass-card p-4">
                <div className="text-center">
                  <div className="p-3 bg-secondary/30 rounded-xl mx-auto w-fit mb-3">
                    <Target className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <p className="text-2xl font-medium">
                    {monthlyStats.topCategory ? monthlyStats.topCategory : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground font-light">Categoria destaque</p>
                </div>
              </Card>

              <Card className="glass-card p-4">
                <div className="text-center">
                  <div className="p-3 bg-gradient-primary rounded-xl mx-auto w-fit mb-3">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-medium">{bestGlobalStreak}</p>
                  <p className="text-xs text-muted-foreground font-light">Melhor sequência</p>
                </div>
              </Card>
            </div>

            <Card className="glass-card p-6 mb-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Progresso da semana</h2>
                <Badge variant="outline" className="text-xs">
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
                          className="w-full bg-gradient-primary rounded-t-xl transition-all duration-500"
                          style={{ height: `${barHeight}%`, minHeight: `${Math.max(barHeight, 6)}px`, animationDelay: `${index * 120}ms` }}
                        />
                        <div
                          className="absolute inset-x-0 bottom-0 h-full bg-muted/20 rounded-xl -z-10"
                          aria-hidden
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {day.dayLabel}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {day.completed}/{day.scheduled}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "350ms" }}>
              <h2 className="text-xl font-medium mb-6">sequências de hábitos</h2>
              <div className="space-y-4">
                {habitStreaks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Conclua seus hábitos para acompanhar as sequências aqui.
                  </p>
                ) : (
                  habitStreaks.map((streak, index) => (
                    <div
                      key={streak.habitId}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-xl animate-slide-up hover:bg-muted/40 transition-colors"
                      style={{ animationDelay: `${500 + index * 80}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{streak.emoji}</div>
                        <div>
                          <p className="font-medium">{streak.name}</p>
                          <p className="text-xs text-muted-foreground font-light">
                            Melhor: {streak.bestStreak} dias  –  Categoria: {streak.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-2xl font-medium gradient-text">{streak.streak}</span>
                          <Flame className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-xs text-muted-foreground font-light">dias seguidos</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Progress;





