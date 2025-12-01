import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause, RotateCcw, Check, SkipForward } from "lucide-react";
import confetti from "canvas-confetti";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TreeVisualization } from "./TreeVisualization";
import { useTimer, getTargetSeconds, getRandomQuote, formatTime } from "@/hooks/useTimer";
import type { Habit } from "@/components/CircularHabitCard";

interface TimerModalProps {
  /** The habit to track */
  habit: Habit;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when timer completes */
  onComplete: () => void;
  /** Dark mode */
  isDarkMode?: boolean;
}

export const TimerModal = ({
  habit,
  isOpen,
  onClose,
  onComplete,
  isDarkMode = true,
}: TimerModalProps) => {
  const [quote] = useState(getRandomQuote);
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate target time from habit
  const targetSeconds = getTargetSeconds(
    habit.goal_value || 10,
    habit.unit || "minutes"
  );

  const {
    elapsedSeconds,
    remainingSeconds,
    progress,
    state,
    start,
    pause,
    reset,
    skip,
    formattedRemaining,
  } = useTimer({
    targetSeconds,
    onComplete: () => {
      setShowCelebration(true);
      // Haptic feedback for completion
      if ("vibrate" in navigator) {
        navigator.vibrate([50, 50, 100]);
      }
      // Elegant confetti - reduced particles for better performance
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#A3E635", "#84CC16", "#65A30D"],
        gravity: 1.2,
        scalar: 0.9,
      });
    },
  });

  // Handle completion
  const handleComplete = () => {
    onComplete();
    onClose();
  };

  // Handle skip
  const handleSkip = () => {
    skip();
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowCelebration(false);
    }
  }, [isOpen, reset]);

  // Colors based on theme
  const bgColor = isDarkMode ? "bg-background" : "bg-primary";
  const textColor = isDarkMode ? "text-white" : "text-white";
  const textMuted = isDarkMode ? "text-white/60" : "text-white/70";
  const accentColor = isDarkMode ? "text-lime-400" : "text-white";
  const buttonPrimary = isDarkMode
    ? "bg-lime-400 text-black hover:bg-lime-500"
    : "bg-white text-primary hover:bg-white/90";
  const buttonSecondary = isDarkMode
    ? "bg-white/10 text-white hover:bg-white/20"
    : "bg-black/10 text-white hover:bg-black/20";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={state === "idle" ? onClose : undefined}
        />

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "relative w-full max-w-sm mx-4 rounded-3xl p-6 shadow-2xl",
            bgColor
          )}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={cn(
              "absolute top-4 right-4 p-2 rounded-full transition-colors",
              buttonSecondary
            )}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className={cn("text-xl font-bold mb-1", textColor)}>
              {habit.name}
            </h2>
            <p className={cn("text-sm", textMuted)}>
              Meta: {formatTime(targetSeconds)}
            </p>
          </div>

          {/* Tree Visualization */}
          <div className="flex justify-center mb-8">
            <TreeVisualization
              progress={progress}
              size={180}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Timer display */}
          <div className="text-center mb-6">
            <motion.div
              key={formattedRemaining}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className={cn("text-5xl font-bold tracking-tight", accentColor)}
            >
              {formattedRemaining}
            </motion.div>
            <p className={cn("text-sm mt-2", textMuted)}>
              {state === "completed"
                ? "Tempo completo!"
                : state === "running"
                ? "Em andamento..."
                : state === "paused"
                ? "Pausado"
                : "Pronto para começar"}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div
              className={cn(
                "h-2 rounded-full overflow-hidden",
                isDarkMode ? "bg-white/10" : "bg-black/10"
              )}
            >
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isDarkMode ? "bg-lime-400" : "bg-white"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className={cn("text-xs text-center mt-2", textMuted)}>
              {Math.round(progress)}% concluído
            </p>
          </div>

          {/* Quote */}
          {state !== "completed" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "text-center mb-6 px-4 py-3 rounded-xl",
                isDarkMode ? "bg-white/5" : "bg-black/5"
              )}
            >
              <p className={cn("text-sm italic", textMuted)}>
                "{quote.text}"
              </p>
              <p className={cn("text-xs mt-1", textMuted)}>
                — {quote.author}
              </p>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {state === "completed" ? (
              <Button
                onClick={handleComplete}
                className={cn("flex-1 h-14 text-base font-semibold rounded-xl", buttonPrimary)}
              >
                <Check size={20} className="mr-2" />
                Concluir
              </Button>
            ) : state === "running" ? (
              <>
                <Button
                  onClick={pause}
                  className={cn("flex-1 h-14 text-base font-semibold rounded-xl", buttonSecondary)}
                >
                  <Pause size={20} className="mr-2" />
                  Pausar
                </Button>
                <Button
                  onClick={handleSkip}
                  className={cn("h-14 px-4 rounded-xl", buttonSecondary)}
                  title="Pular para conclusão"
                >
                  <SkipForward size={20} />
                </Button>
              </>
            ) : state === "paused" ? (
              <>
                <Button
                  onClick={start}
                  className={cn("flex-1 h-14 text-base font-semibold rounded-xl", buttonPrimary)}
                >
                  <Play size={20} className="mr-2" />
                  Continuar
                </Button>
                <Button
                  onClick={reset}
                  className={cn("h-14 px-4 rounded-xl", buttonSecondary)}
                  title="Reiniciar"
                >
                  <RotateCcw size={20} />
                </Button>
              </>
            ) : (
              <Button
                onClick={start}
                className={cn("flex-1 h-14 text-base font-semibold rounded-xl", buttonPrimary)}
              >
                <Play size={20} className="mr-2" />
                Iniciar
              </Button>
            )}
          </div>

          {/* Skip hint for long timers */}
          {state !== "completed" && targetSeconds > 300 && (
            <p className={cn("text-xs text-center mt-4", textMuted)}>
              Dica: Você pode pular o timer se já completou a atividade
            </p>
          )}
        </motion.div>

        {/* Celebration overlay - elegant glow effect instead of emoji */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
              {/* Radial glow effect */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.5, 1.2], opacity: [0, 0.4, 0] }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute w-64 h-64 rounded-full bg-lime-400/30 blur-3xl"
              />
              {/* Check icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.15, 1] }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-lime-400 flex items-center justify-center shadow-lg shadow-lime-500/40"
              >
                <Check size={40} className="text-black" strokeWidth={3} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default TimerModal;
