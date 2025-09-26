import { AnimatePresence, motion } from "motion/react";
import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
  Flame,
  Lock,
  Menu,
  Play,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

const habits = [
  {
    id: "meditation",
    title: "Meditar 10 minutos",
    detail: "07:30 - Respiracao guiada",
    icon: Play,
  },
  {
    id: "reading",
    title: "Ler 20 paginas",
    detail: "08:15 - Mindset",
    icon: Star,
  },
  {
    id: "exercise",
    title: "Treino rapido",
    detail: "Pendente",
    icon: CheckCircle2,
  },
  {
    id: "water",
    title: "Beber 2L de agua",
    detail: "17:00 - Lembrete",
    icon: AlarmClock,
  },
] as const;

const guidedJourneyDays = [
  { day: 1, state: "done" as const, label: "Respiracao consciente" },
  { day: 2, state: "done" as const, label: "Micro vitorias" },
  { day: 3, state: "active" as const, label: "Planejamento diario" },
  { day: 4, state: "locked" as const, label: "Experimento social" },
  { day: 5, state: "locked" as const, label: "Sono profundo" },
  { day: 6, state: "locked" as const, label: "Foco profundo" },
  { day: 7, state: "locked" as const, label: "Semana 1 concluida" },
];

export type HeroPreviewProps = {
  onCtaClick: () => void;
  track?: (event: string, meta?: Record<string, unknown>) => void;
};

const HeroPreview = ({ onCtaClick, track }: HeroPreviewProps) => {
  const [completed, setCompleted] = useState<Set<string>>(new Set(["meditation", "reading"]));

  const stats = useMemo(() => {
    const total = habits.length;
    const done = Array.from(completed).filter((id) => habits.some((habit) => habit.id === id)).length;
    const percentage = Math.round((done / total) * 100);
    return { total, done, percentage };
  }, [completed]);

  const toggleHabit = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        track?.("hero_toggle_habit", { id, checked: false });
      } else {
        next.add(id);
        track?.("hero_toggle_habit", { id, checked: true });
      }
      return next;
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="mx-auto w-full max-w-xl"
    >
      <Card className="overflow-hidden border-slate-200 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
        <CardHeader className="flex flex-col gap-6 border-b border-slate-100 bg-slate-50/70 px-6 py-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Quarta, 25 de setembro</span>
            <button
              type="button"
              aria-label="Menu"
              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
            >
              <Menu className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Hoje</h3>
              <p className="text-sm text-slate-500">Complete 3 habitos para fechar sua barra diaria.</p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700">
              <Flame className="h-4 w-4" strokeWidth={1.5} /> Sequencia 12 dias
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-8 px-6 py-6">
          <div className="flex flex-col gap-4">
            {habits.map((habit) => {
              const Icon = habit.icon;
              const isDone = completed.has(habit.id);
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="group flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{habit.title}</p>
                      <p className="text-xs text-slate-500">{habit.detail}</p>
                    </div>
                  </div>

                  <motion.div layout className="flex items-center gap-2">
                    <AnimatePresence initial={false}>
                      {isDone ? (
                        <motion.span
                          key="done"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 sm:block"
                        >
                          Feito
                        </motion.span>
                      ) : (
                        <motion.span
                          key="pending"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 sm:block"
                        >
                          Fazer agora
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <Switch
                      checked={isDone}
                      onCheckedChange={() => toggleHabit(habit.id)}
                      aria-label={`Marcar ${habit.title}`}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid gap-6 rounded-3xl bg-slate-50/60 p-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
                <span>Progresso de hoje</span>
                <span>{stats.done}/{stats.total}</span>
              </div>
              <Progress value={stats.percentage} className="h-2 bg-slate-200" />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <AlarmClock className="h-4 w-4" strokeWidth={1.5} />
                Proximo lembrete as 17:00
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
                <span>Modo Guiado</span>
                <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
                  Semana 1
                </Badge>
              </div>
              <p className="text-sm text-slate-600">Depois de concluir o dia de hoje, o proximo conteudo e desbloqueado automaticamente.</p>
              <div className="grid grid-cols-7 gap-2">
                {guidedJourneyDays.map((item) => (
                  <div key={item.day} className="relative">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-semibold transition-all ${
                        item.state === "done"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.state === "active"
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/25"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {item.day}
                    </span>
                    {item.state === "locked" ? (
                      <Lock className="absolute -right-1 -top-1 h-3 w-3 text-slate-300" strokeWidth={1.5} />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Mensagem do dia</p>
                <p className="mt-1 text-sm text-slate-600">"Disciplina e liberdade. Faca o que precisa ser feito antes da motivacao chegar."</p>
              </div>
              <CalendarDays className="hidden h-8 w-8 text-emerald-600 sm:block" strokeWidth={1.5} />
            </div>
            <Button
              size="lg"
              onClick={() => {
                track?.("hero_preview_cta_click");
                onCtaClick();
              }}
              className="h-12 rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Comecar agora por R$ 47,90
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HeroPreview;