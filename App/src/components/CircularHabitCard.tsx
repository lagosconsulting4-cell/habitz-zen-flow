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
  const gradient = color ?? "var(--primary)";
  const pct = progress !== undefined ? Math.min(1, Math.max(0, progress)) : completed ? 1 : 0;
  const ringFill = `${pct * 360}deg`;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-32 w-32 flex-col items-center justify-center rounded-full border border-border/60 bg-card/80 p-3 shadow-lg backdrop-blur hover:-translate-y-[2px] transition",
        completed ? "ring-2 ring-emerald-200" : "ring-1 ring-border/40",
        className
      )}
      whileTap={{ scale: 0.97 }}
      animate={completed ? "done" : "idle"}
      variants={{
        idle: { scale: 1 },
        done: { scale: 1.04 },
      }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
    >
      <motion.div
        className="absolute inset-1 rounded-full"
        style={{
          background: `conic-gradient(${gradient} 0deg, ${gradient} ${ringFill}, rgba(0,0,0,0) 0deg)`,
          opacity: 0.16,
        }}
        aria-hidden
        animate={{ scale: completed ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
      />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-background/80 shadow-inner">
        {completed ? (
          <Check className="h-8 w-8 text-emerald-500" strokeWidth={3} />
        ) : Icon ? (
          <Icon className="h-7 w-7 text-foreground" />
        ) : (
          <span className="text-3xl">{emoji}</span>
        )}
      </div>
      <AnimatePresence>
        {completed && (
          <motion.div
            key="burst"
            className="pointer-events-none absolute inset-0 rounded-full"
            initial={{ opacity: 0.6, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ boxShadow: "0 0 0 8px rgba(16,185,129,0.25)" }}
          />
        )}
      </AnimatePresence>
      {autoCompleteSource === "health" && (
        <span className="absolute right-2 top-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm">
          Auto
        </span>
      )}
      {!completed && isPending && (
        <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 shadow-sm">
          Pendente
        </span>
      )}
      <div className="mt-2 flex flex-col items-center gap-0.5 text-center">
        <p className={cn("text-sm font-semibold", completed ? "text-emerald-700" : "text-foreground")}>
          {name}
        </p>
        <p className="text-[11px] text-muted-foreground">{category}</p>
        {progress !== undefined && progress < 1 && !completed && (
          <p className="text-[11px] text-muted-foreground">{Math.round(progress * 100)}%</p>
        )}
      </div>
      {streak > 0 && (
        <div className="absolute -bottom-2 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[11px] text-orange-600 shadow-sm">
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
      className="flex h-32 w-32 flex-col items-center justify-center rounded-full border border-dashed border-border/70 bg-muted/40 text-muted-foreground transition hover:border-primary/60 hover:text-primary"
      whileTap={{ scale: 0.96 }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Plus className="h-6 w-6" />
      </div>
      <p className="mt-2 text-sm font-medium">{label}</p>
    </motion.button>
  );
};
