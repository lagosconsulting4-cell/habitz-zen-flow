import { Check, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: string;
  period: "morning" | "afternoon" | "evening";
  streak: number;
}

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string) => void;
  isCompleted?: boolean;
}

const periodMap: Record<Habit["period"], { label: string; bg: string; accent: string }> = {
  morning: { label: "Manhã", bg: "bg-emerald-50", accent: "text-emerald-600" },
  afternoon: { label: "Tarde", bg: "bg-amber-50", accent: "text-amber-600" },
  evening: { label: "Noite", bg: "bg-indigo-50", accent: "text-indigo-600" },
};

const HabitCard = ({ habit, onToggle, isCompleted = false }: HabitCardProps) => {
  const period = periodMap[habit.period];

  return (
    <Card
      className={`relative overflow-hidden border border-border/40 bg-card/90 backdrop-blur transition-all duration-300 hover:border-primary/50 ${
        isCompleted ? "opacity-80" : ""
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" aria-hidden />
      <div className="relative flex flex-col gap-4 p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/30 text-3xl shadow-inner">
            {habit.emoji}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`text-lg font-semibold ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {habit.name}
              </h3>
              <span className="rounded-full bg-white/30 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {period.label}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {habit.category}
              </span>
            </div>
            {habit.streak > 0 && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="h-4 w-4 text-orange-500" />
                {habit.streak} dias seguidos
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-stretch justify-end gap-3 md:flex-row md:items-center">
          <div className={`w-full rounded-xl px-3 py-2 text-sm font-medium md:w-auto md:text-xs ${period.bg} ${period.accent}`}>
            {isCompleted ? "Tempo liberado para novos desafios" : "Mantenha o ritmo hoje"}
          </div>
          <Button
            type="button"
            variant={isCompleted ? "secondary" : "default"}
            size="sm"
            className={`min-w-[110px] justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 ${
              isCompleted
                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                : "bg-emerald-500 text-emerald-50 hover:bg-emerald-600"
            }`}
            onClick={() => onToggle(habit.id)}
          >
            {isCompleted ? (
              <span className="flex items-center gap-1 text-xs">
                <Check className="h-4 w-4" /> Concluído
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Marcar hoje
              </span>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default HabitCard;
