import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import NavigationBar from "@/components/NavigationBar";
import { useGuided } from "@/hooks/useGuided";
import { Target, CheckCircle2, Circle, Lock, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isBonusEnabled } from "@/config/bonusFlags";

const GuidedJourney = () => {
  const navigate = useNavigate();
  const { weeks, loading, progressPercent, state, completeDay, todayGlobalDay } = useGuided();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  useEffect(() => {
    if (!isBonusEnabled("guided")) {
      navigate("/bonus", { replace: true });
    }
  }, [navigate]);

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

  const activeWeek = expandedWeek ?? Math.ceil((state?.last_completed_global_day ?? 0 + 1) / 7);

  return (
    <div className="min-h-screen bg-[#000000] pb-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-6 max-w-4xl"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-white flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-lime-400" />
            Modo Guiado
          </h1>
          <p className="text-white/60">
            Evolua dia a dia com a trilha personalizada para sua primeira jornada de 4 semanas.
          </p>
        </div>

        <Card className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Progresso geral</h2>
            <Badge className="bg-lime-400 text-black border-0 font-semibold">
              Semana {Math.max(1, activeWeek)}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Progress value={progressPercent} className="h-3 flex-1 bg-white/10" />
            <span className="text-sm text-white font-semibold whitespace-nowrap">
              {progressPercent}%
            </span>
          </div>
          {state && (
            <p className="text-xs text-white/60 mt-3">
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
              <motion.div
                key={week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`rounded-2xl bg-white/5 border border-white/10 p-6 transition-all duration-300 ${
                    isExpanded ? "ring-2 ring-lime-400" : "hover:border-lime-400/50"
                  } ${weekCompleted ? "border-lime-400/30" : ""}`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setExpandedWeek(isExpanded ? null : week)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-lime-400/10 rounded-xl">
                          <Target className="w-6 h-6 text-lime-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">Semana {week}</h3>
                          <p className="text-sm text-white/60">{weekTitle}</p>
                        </div>
                      </div>
                      <Badge className={weekCompleted ? "bg-lime-400 text-black border-0 font-semibold" : "bg-white/5 text-white/60 border-white/10 font-semibold"}>
                        {weekCompleted ? "Concluída" : isExpanded ? "Explorando" : "Visualizar"}
                      </Badge>
                    </div>
                  </button>

                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                    {days.map((day) => {
                      const locked = day.status === "locked";
                      const completed = day.status === "completed";
                      const available = day.status === "available";

                      return (
                        <div
                          key={day.global_day}
                          className={`relative flex flex-col gap-4 p-4 rounded-xl transition-all duration-200 md:flex-row md:items-start ${
                            locked
                              ? "bg-white/5 border border-dashed border-white/20"
                              : completed
                              ? "bg-lime-400/10 border border-lime-400/30"
                              : "bg-white/5 border border-white/10 hover:border-lime-400/50"
                          }`}
                        >
                          {locked && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl pointer-events-none" />
                          )}

                          <div className="flex w-full items-start gap-4 md:flex-1">
                            <div className="mt-1 flex-shrink-0">
                              {completed ? (
                                <CheckCircle2 className="w-5 h-5 text-lime-400" />
                              ) : available ? (
                                day.isToday ? (
                                  <Sparkles className="w-5 h-5 text-lime-400" />
                                ) : (
                                  <Circle className="w-5 h-5 text-lime-400" />
                                )
                              ) : (
                                <Lock className="w-5 h-5 text-white/40" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex flex-col gap-2 mb-2 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-start gap-2 md:items-center">
                                  <h5 className="font-semibold text-white leading-tight md:leading-normal">
                                    Dia {day.day}: {day.title}
                                  </h5>
                                  {day.isToday && available && (
                                    <Badge className="bg-lime-400 text-black border-0 font-semibold text-xs">
                                      Hoje
                                    </Badge>
                                  )}
                                </div>
                                {day.estimated_minutes && (
                                  <div className="flex items-center gap-1 text-xs text-white/60">
                                    <Clock className="w-3 h-3" />
                                    {day.estimated_minutes} min
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-white/60 mb-3">
                                {day.description ?? "Exercício guiado para o dia."}
                              </p>
                              <Badge className="bg-white/5 text-white/60 border-white/10 text-xs font-semibold">
                                {day.type === "action"
                                  ? "Ação"
                                  : day.type === "reflection"
                                    ? "Reflexão"
                                    : "Desafio"}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex w-full flex-col gap-2 md:w-48 md:flex-shrink-0">
                            <Button
                              className={`w-full font-semibold ${
                                completed
                                  ? "bg-white/10 border border-white/20 hover:bg-white/20 text-white"
                                  : "bg-lime-400 text-black hover:bg-lime-500"
                              }`}
                              disabled={locked || completed}
                              onClick={() => completeDay(day.global_day)}
                            >
                              {completed ? "Concluído" : "Marcar como concluído"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <NavigationBar />
    </div>
  );
};

export default GuidedJourney;


