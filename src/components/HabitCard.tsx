import { Flame } from "lucide-react";

import HabitCompleteButton from "@/components/HabitCompleteButton";
import { Card } from "@/components/ui/card";

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
      className={`relative overflow-hidden border border-border/40 bg-card/90 backdrop-blur transition-all duration-400 hover:border-primary/60 ${
        isCompleted ? "opacity-90 ring-1 ring-emerald-200" : "hover:-translate-y-0.5"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" aria-hidden />
      <div className="relative flex flex-col gap-4 p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/30 text-3xl shadow-inner ${
              isCompleted ? "animate-[bounce_0.6s_ease-out]" : ""
            }`}
          >
            {habit.emoji}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`text-lg font-semibold transition-colors ${
                  isCompleted ? "text-emerald-600 line-through" : "text-foreground"
                }`}
              >
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
          <HabitCompleteButton completed={isCompleted} onToggle={() => onToggle(habit.id)} />
        </div>
      </div>
    </Card>
  );
};

export default HabitCard;
