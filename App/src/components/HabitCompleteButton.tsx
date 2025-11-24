import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

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
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-foreground hover:border-primary/50 hover:text-primary"
      )}
      whileTap={{ scale: 0.94 }}
      animate={completed ? "completed" : "idle"}
      variants={{
        idle: {
          scale: 1,
        },
        completed: {
          scale: isPressing ? 0.95 : 1.08,
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
            completed ? "border-primary-foreground/60 bg-primary-foreground/25" : "border-primary/30 bg-primary/10"
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.span>
        <span>{completed ? "Conclu�do" : "Concluir"}</span>
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
            {particles.map(({ index, delay }) => (
              <motion.span
                key={`${burstId}-${index}`}
                className="absolute h-2 w-2 rounded-full bg-primary"
                style={{ left: "50%", top: "50%" }}
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
              className="absolute inset-0 rounded-full border border-primary-foreground/50"
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
