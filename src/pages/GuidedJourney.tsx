import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGuided } from "@/hooks/useGuided";
import { Target, CheckCircle2, Circle, Lock, Clock, Sparkles } from "lucide-react";

const GuidedJourney = () => {
  const { weeks, loading, progressPercent, state, completeDay, todayGlobalDay } = useGuided();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const activeWeek = expandedWeek ?? Math.ceil((state?.last_completed_global_day ?? 0 + 1) / 7);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-light mb-2">
            Modo <span className="font-medium gradient-text">Guiado</span>
          </h1>
          <p className="text-muted-foreground font-light">
            Evolua dia a dia com a trilha personalizada para sua primeira jornada de 4 semanas.
          </p>
        </div>

        <Card className="glass-card p-6 mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Progresso geral</h2>
            <Badge variant="default" className="bg-gradient-primary">
              Semana {Math.max(1, activeWeek)}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Progress value={progressPercent} className="h-2 flex-1" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {progressPercent}% concluido
            </span>
          </div>
          {state && (
            <p className="text-xs text-muted-foreground mt-3">
              Jornada iniciada em {new Date(state.started_at + "T00:00:00").toLocaleDateString("pt-BR")}
            </p>
          )}
        </Card>

        <div className="space-y-6">
          {weeks.map(({ week, days }, index) => {
            const isExpanded = expandedWeek === week;
            const weekCompleted = days.every((day) => day.status === "completed");
            const weekTitle = week === 1 ? "Fundamentos" : week === 2 ? "Rotina" : week === 3 ? "Ritmo" : "Master";

            return (
              <Card
                key={week}
                className={`glass-card p-6 transition-all duration-300 animate-slide-up ${
                  isExpanded ? "ring-2 ring-primary" : "hover:shadow-elegant"
                } ${weekCompleted ? "border-primary/50" : ""}`}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setExpandedWeek(isExpanded ? null : week)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Target className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium">Semana {week}</h3>
                        <p className="text-sm text-muted-foreground">{weekTitle}</p>
                      </div>
                    </div>
                    <Badge variant={weekCompleted ? "default" : "secondary"}>
                      {weekCompleted ? "Concluida" : isExpanded ? "Explorando" : "Visualizar"}
                    </Badge>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-border/50 space-y-4 animate-fade-in">
                    {days.map((day) => {
                      const locked = day.status === "locked";
                      const completed = day.status === "completed";
                      const available = day.status === "available";

                      return (
                        <div
                          key={day.global_day}
                          className={`relative flex flex-col gap-4 p-4 rounded-xl transition-all duration-200 md:flex-row md:items-start ${
                            locked
                              ? "bg-muted/20 border border-dashed border-border/50"
                              : "bg-muted/30 border border-transparent hover:bg-muted/40"
                          }`}
                        >
                          {locked && (
                            <div className="absolute inset-0 bg-background/30 backdrop-blur-sm rounded-xl pointer-events-none" />
                          )}

                          <div className="flex w-full items-start gap-4 md:flex-1">
                            <div className="mt-1 flex-shrink-0">
                              {completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : available ? (
                                day.isToday ? (
                                  <Sparkles className="w-5 h-5 text-primary" />
                                ) : (
                                  <Circle className="w-5 h-5 text-primary" />
                                )
                              ) : (
                                <Lock className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex flex-col gap-2 mb-2 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-start gap-2 md:items-center">
                                  <h5 className="font-medium leading-tight md:leading-normal">
                                    Dia {day.day}: {day.title}
                                  </h5>
                                  {day.isToday && available && (
                                    <Badge variant="default" className="bg-primary/20 text-primary">
                                      Hoje
                                    </Badge>
                                  )}
                                </div>
                                {day.estimated_minutes && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {day.estimated_minutes} min
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {day.description ?? "Exerc?cio guiado para o dia."}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {day.type === "action"
                                  ? "Acao"
                                  : day.type === "reflection"
                                    ? "Reflexao"
                                    : "Desafio"}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex w-full flex-col gap-2 md:w-48 md:flex-shrink-0">
                            <Button
                              className="w-full"
                              variant={completed ? "secondary" : "default"}
                              disabled={locked || completed}
                              onClick={() => completeDay(day.global_day)}
                            >
                              {completed ? "Concluido" : "Marcar como concluido"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GuidedJourney;


