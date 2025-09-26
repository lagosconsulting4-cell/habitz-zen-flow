import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const burstColors = [
  "#22c55e",
  "#10b981",
  "#34d399",
  "#f59e0b",
  "#14b8a6",
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

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, index) => ({
        index,
        color: burstColors[index % burstColors.length],
        delay: index * 0.03,
      })),
    [],
  );

  const handleClick = () => {
    setIsPressing(true);
    onToggle();
    setTimeout(() => setIsPressing(false), 180);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className={cn(
        "relative flex min-w-[120px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition-colors",
        completed
          ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 text-white shadow-emerald-500/40"
          : "bg-emerald-500 text-emerald-50 hover:bg-emerald-400"
      )}
      whileTap={{ scale: 0.93 }}
      animate={completed ? "completed" : "idle"}
      variants={{
        idle: {
          scale: 1,
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.22)",
        },
        completed: {
          scale: isPressing ? 0.97 : 1.04,
          boxShadow: "0 15px 45px rgba(16, 185, 129, 0.35)",
          transition: {
            type: "spring",
            stiffness: 140,
            damping: 12,
          },
        },
      }}
    >
      <motion.span
        layout
        className="flex items-center gap-2"
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <motion.span
          initial={false}
          animate={completed ? { rotate: [0, 360], scale: [0.7, 1.1, 1] } : { rotate: 0, scale: 1 }}
          transition={{ duration: completed ? 0.6 : 0.3, ease: "easeOut" }}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.span>
        <span>{completed ? "Concluído" : "Marcar hoje"}</span>
      </motion.span>

      <AnimatePresence>
        {completed && (
          <motion.div
            key={burstId}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0"
          >
            {confettiPieces.map(({ index, color, delay }) => (
              <motion.span
                key={`${burstId}-${index}`}
                className="absolute h-2 w-2 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  backgroundColor: color,
                }}
                initial={{
                  scale: 0,
                  opacity: 1,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  scale: [0, 1, 0.8],
                  opacity: [0.9, 1, 0],
                  x: Math.cos((index / confettiPieces.length) * Math.PI * 2) * 36,
                  y: Math.sin((index / confettiPieces.length) * Math.PI * 2) * 36,
                }}
                transition={{ duration: 0.9, delay, ease: "easeOut" }}
              />
            ))}

            <motion.div
              className="absolute inset-0 rounded-full border border-white/40"
              initial={{ scale: 0.6, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default HabitCompleteButton;
