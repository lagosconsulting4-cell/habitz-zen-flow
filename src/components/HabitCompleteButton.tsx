import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const burstColors = [
  "#22c55e",
  "#10b981",
  "#34d399",
  "#f59e0b",
  "#0ea5e9",
];

interface HabitCompleteButtonProps {
  completed: boolean;
  onToggle: () => void;
}

const HabitCompleteButton = ({ completed, onToggle }: HabitCompleteButtonProps) => {
  const [isPressing, setIsPressing] = useState(false);
  const [burstId, setBurstId] = useState(0);

  useEffect(() => {
    if (completed) {
      setBurstId((id) => id + 1);
    }
  }, [completed]);

  const particles = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, index) => ({
        index,
        color: burstColors[index % burstColors.length],
        delay: index * 0.02,
      })),
    [],
  );

  const handleClick = () => {
    setIsPressing(true);
    onToggle();
    setTimeout(() => setIsPressing(false), 120);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className={cn(
        "relative flex min-w-[120px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-lg transition-colors duration-150",
        completed
          ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 text-white shadow-emerald-500/40"
          : "border border-border/70 bg-white/85 text-foreground hover:border-primary/50 hover:text-primary hover:shadow-primary/20"
      )}
      whileTap={{ scale: 0.94 }}
      animate={completed ? "completed" : "idle"}
      variants={{
        idle: {
          scale: 1,
          boxShadow: "0 10px 24px rgba(16, 185, 129, 0.15)",
        },
        completed: {
          scale: isPressing ? 0.95 : 1.08,
          boxShadow: "0 18px 42px rgba(16, 185, 129, 0.32)",
          transition: {
            type: "spring",
            stiffness: 210,
            damping: 16,
            mass: 0.7,
          },
        },
      }}
    >
      <motion.span
        layout
        className="flex items-center gap-2"
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
      >
        <motion.span
          initial={false}
          animate={
            completed
              ? { rotate: [0, 360], scale: [0.6, 1.2, 1] }
              : { rotate: 0, scale: isPressing ? 0.92 : 1 }
          }
          transition={{ duration: completed ? 0.35 : 0.18, ease: "easeOut" }}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full border",
            completed ? "border-white/60 bg-white/25" : "border-primary/30 bg-primary/10"
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.span>
        <span>{completed ? "Concluído" : "Concluir"}</span>
      </motion.span>

      <AnimatePresence>
        {completed && (
          <motion.div
            key={burstId}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0"
          >
            {particles.map(({ index, color, delay }) => (
              <motion.span
                key={`${burstId}-${index}`}
                className="absolute h-2 w-2 rounded-full"
                style={{ left: "50%", top: "50%", backgroundColor: color }}
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0.4],
                  opacity: [1, 1, 0],
                  x: Math.cos((index / particles.length) * Math.PI * 2) * 32,
                  y: Math.sin((index / particles.length) * Math.PI * 2) * 32,
                }}
                transition={{ duration: 0.55, delay, ease: "easeOut" }}
              />
            ))}
            <motion.div
              className="absolute inset-0 rounded-full border border-white/50"
              initial={{ scale: 0.55, opacity: 0.6 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default HabitCompleteButton;
