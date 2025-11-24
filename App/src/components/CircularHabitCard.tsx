import { useMemo } from "react";
import { Check, Flame, Plus } from "lucide-react";
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";

import { getHabitIcon } from "@/lib/habit-icons";
import { cn } from "@/lib/utils";

interface BaseCardProps {
  onClick?: () => void;
  className?: string;
}

interface HabitCardProps extends BaseCardProps {
  id: string;
  name: string;
  emoji: string;
  icon_key?: string | null;
  color?: string | null;
  streak: number;
  completed: boolean;
  category: string;
  autoCompleteSource?: "manual" | "health" | null;
  progress?: number; // 0 a 1 para estados parciais
  isPending?: boolean;
}

export const CircularHabitCard = ({
  name,
  emoji,
  icon_key,
  color,
  streak,
  completed,
  category,
  autoCompleteSource,
  progress,
  isPending,
  onClick,
  className,
}: HabitCardProps) => {
  const Icon = useMemo(() => getHabitIcon(icon_key), [icon_key]);
  const pct = progress !== undefined ? Math.min(1, Math.max(0, progress)) : completed ? 1 : 0;
  const size = 128;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);
  const isDone = completed || pct >= 1;
  const progressColor = isDone ? "hsl(var(--success))" : "hsl(var(--primary))";
  const trackColor = "hsl(var(--muted-foreground) / 0.18)";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={completed}
      className={cn(
        "relative isolate flex flex-col items-center gap-2 rounded-3xl bg-card p-3 text-center shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-medium)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2",
        className
      )}
      whileTap={{ scale: 0.98 }}
      animate={isDone ? "done" : "idle"}
      variants={{
        idle: { scale: 1 },
        done: { scale: 1.02 },
      }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
    >
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={stroke}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.3s ease, stroke 0.2s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          {autoCompleteSource === "health" && (
            <span className="absolute right-1 top-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm">
              Auto
            </span>
          )}
          {!isDone && isPending && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 shadow-sm">
              Pendente
            </span>
          )}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/85 text-foreground shadow-inner">
            {isDone ? (
              <Check className="h-8 w-8 text-[hsl(var(--success))]" strokeWidth={3} />
            ) : Icon ? (
              <Icon className="h-7 w-7" />
            ) : (
              <span className="text-3xl">{emoji}</span>
            )}
          </div>
          <div className="mt-1 space-y-1 text-center">
            <p className={cn("text-sm font-semibold leading-tight", isDone ? "text-[hsl(var(--success))]" : "text-foreground")}>
              {name}
            </p>
            <p className="text-[11px] text-muted-foreground leading-none">{category}</p>
            {!isDone && progress !== undefined && (
              <p className="text-[11px] text-muted-foreground leading-none">{Math.round(pct * 100)}%</p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDone && (
          <motion.div
            key="burst"
            className="pointer-events-none absolute inset-0 rounded-3xl"
            initial={{ opacity: 0.5, scale: 0.9 }}
            animate={{ opacity: 0, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {streak > 0 && (
        <div className="absolute -bottom-2 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] text-orange-600 shadow-sm">
          <Flame className="h-3 w-3" />
          {streak}d
        </div>
      )}
    </motion.button>
  );
};

interface AddCardProps extends BaseCardProps {
  label?: string;
}

export const AddHabitCard = ({ onClick, label = "Adicionar" }: AddCardProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-2 border-dashed border-border bg-card text-muted-foreground shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-primary/60 hover:text-primary hover:shadow-[var(--shadow-medium)]"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Plus className="h-6 w-6" />
      </div>
      <p className="mt-2 text-sm font-medium">{label}</p>
    </motion.button>
  );
};
