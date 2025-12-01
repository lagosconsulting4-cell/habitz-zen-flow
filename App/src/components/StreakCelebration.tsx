import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { Trophy, Star, Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StreakCelebrationProps {
  /** Whether to show the celebration */
  show: boolean;
  /** Callback when celebration is dismissed */
  onDismiss: () => void;
  /** Current streak count */
  streakDays: number;
  /** Type of celebration */
  type: "day_complete" | "streak_milestone" | "habit_complete";
  /** Habit name if type is habit_complete */
  habitName?: string;
  /** Dark mode */
  isDarkMode?: boolean;
}

const CELEBRATION_MESSAGES = {
  day_complete: [
    "Dia perfeito! 🎉",
    "Missão cumprida! ⭐",
    "Você é incrível! 🔥",
    "Arrasou hoje! 💪",
  ],
  streak_milestone: [
    "Que consistência! 🏆",
    "Você está voando! 🚀",
    "Imparável! 🔥",
    "Lenda dos hábitos! 👑",
  ],
  habit_complete: [
    "Mais um concluído!",
    "Continue assim!",
    "Excelente!",
    "Ótimo trabalho!",
  ],
};

export const StreakCelebration = ({
  show,
  onDismiss,
  streakDays,
  type,
  habitName,
  isDarkMode = true,
}: StreakCelebrationProps) => {
  const [message] = useState(() => {
    const messages = CELEBRATION_MESSAGES[type];
    return messages[Math.floor(Math.random() * messages.length)];
  });

  // Fire confetti on show
  useEffect(() => {
    if (show && type !== "habit_complete") {
      // Big celebration for day complete or milestone
      const duration = 2000;
      const end = Date.now() + duration;

      const colors = isDarkMode
        ? ["#A3E635", "#84CC16", "#FEF08A", "#FBBF24", "#F97316"]
        : ["#16A34A", "#22C55E", "#84CC16", "#EAB308", "#F97316"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [show, type, isDarkMode]);

  // Auto-dismiss after delay
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onDismiss();
      }, type === "habit_complete" ? 2000 : 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss, type]);

  if (type === "habit_complete") {
    // Small toast-like celebration for individual habits
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={cn(
              "px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3",
              isDarkMode
                ? "bg-lime-500/90 text-black"
                : "bg-lime-500 text-white"
            )}>
              <motion.div
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Star className="w-5 h-5" fill="currentColor" />
              </motion.div>
              <div>
                <p className="font-semibold text-sm">{message}</p>
                {habitName && (
                  <p className="text-xs opacity-80">{habitName}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Full celebration modal for day complete or streak milestone
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onDismiss}
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
              "relative w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl",
              isDarkMode
                ? "bg-gradient-to-br from-background to-muted"
                : "bg-gradient-to-br from-white to-lime-50"
            )}
          >
            {/* Close button */}
            <button
              onClick={onDismiss}
              className={cn(
                "absolute top-4 right-4 p-2 rounded-full transition-colors",
                isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"
              )}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Trophy animation */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.2 }}
              className="mb-6"
            >
              <div className={cn(
                "w-24 h-24 mx-auto rounded-full flex items-center justify-center",
                type === "streak_milestone"
                  ? isDarkMode ? "bg-orange-500/20" : "bg-orange-100"
                  : isDarkMode ? "bg-lime-500/20" : "bg-lime-100"
              )}>
                {type === "streak_milestone" ? (
                  <Flame className={cn(
                    "w-12 h-12",
                    isDarkMode ? "text-orange-400" : "text-orange-500"
                  )} />
                ) : (
                  <Trophy className={cn(
                    "w-12 h-12",
                    isDarkMode ? "text-lime-400" : "text-lime-600"
                  )} />
                )}
              </div>
            </motion.div>

            {/* Message */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground mb-2"
            >
              {message}
            </motion.h2>

            {/* Streak info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              {type === "day_complete" ? (
                <p className="text-muted-foreground">
                  Você completou todos os hábitos de hoje!
                </p>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Flame className={cn(
                    "w-5 h-5",
                    isDarkMode ? "text-orange-400" : "text-orange-500"
                  )} />
                  <span className={cn(
                    "text-xl font-bold",
                    isDarkMode ? "text-orange-400" : "text-orange-500"
                  )}>
                    {streakDays} dias de streak!
                  </span>
                </div>
              )}
            </motion.div>

            {/* Motivational text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground mb-6"
            >
              {type === "day_complete"
                ? "Continue assim e construa hábitos que transformam sua vida."
                : `Incrível! Você está consistente há ${streakDays} dias seguidos.`}
            </motion.p>

            {/* Action button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onDismiss}
                className={cn(
                  "w-full h-12 text-base font-semibold rounded-xl",
                  isDarkMode
                    ? "bg-lime-400 text-black hover:bg-lime-500"
                    : "bg-lime-500 text-white hover:bg-lime-600"
                )}
              >
                Continuar
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakCelebration;
