import { useId, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause, RotateCcw, Check, SkipForward, Settings } from "lucide-react";
import confetti from "canvas-confetti";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTimer, getTargetSeconds, formatTime } from "@/hooks/useTimer";
import type { Habit } from "@/components/CircularHabitCard";

const timerNatureImg = `${import.meta.env.BASE_URL}images/timer-nature.jpg`;

interface TimerModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  isDarkMode?: boolean;
}

const STATE_LABELS: Record<string, string> = {
  idle: "Foco profundo",
  running: "Foco profundo",
  paused: "Pausado",
  completed: "Completo!",
};

// Custom ring component built specifically for this modal
function TimerRing({
  progress,
  size,
  children,
}: {
  progress: number;
  size: number;
  children: React.ReactNode;
}) {
  const id = useId();
  const strokeWidth = 4;
  const trackStrokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90"
      >
        <defs>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(163, 230, 53, 0.08)"
          strokeWidth={trackStrokeWidth}
          fill="transparent"
        />

        {/* Glow layer */}
        {progress > 0 && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#A3E635"
            strokeWidth={strokeWidth + 4}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            filter={`url(#glow-${id})`}
            opacity={0.4}
          />
        )}

        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#A3E635"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export const TimerModal = ({
  habit,
  isOpen,
  onClose,
  onComplete,
}: TimerModalProps) => {
  const [showCelebration, setShowCelebration] = useState(false);

  const targetSeconds = getTargetSeconds(
    habit.goal_value || 10,
    habit.unit || "minutes"
  );

  const {
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
      if ("vibrate" in navigator) {
        navigator.vibrate([50, 50, 100]);
      }
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

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowCelebration(false);
    }
  }, [isOpen, reset]);

  const goalDisplay = habit.unit === "hours"
    ? `${habit.goal_value || 1}h`
    : `${habit.goal_value || 10}min`;

  if (!isOpen) return null;

  const glossyStyle = {
    boxShadow: "0 4px 24px rgba(163, 230, 53, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
  };

  return createPortal(
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
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={state === "idle" ? onClose : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm mx-4 rounded-3xl px-6 pt-5 pb-6 shadow-2xl overflow-hidden"
          style={{ backgroundColor: "#0A0A0A" }}
        >
          {/* Ambient green glow behind ring */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(163, 230, 53, 0.08) 0%, rgba(163, 230, 53, 0.03) 40%, transparent 70%)",
            }}
          />

          {/* Header bar */}
          <div className="relative flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="p-2 -ml-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
            <h2 className="text-sm font-bold text-white tracking-wide">
              {habit.name}
            </h2>
            <div className="w-9" />
          </div>

          {/* Ring area */}
          <div className="relative flex justify-center mb-8">
            <TimerRing progress={progress} size={240}>
              {/* Photo circle with dark border — uses background-image for reliability */}
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 200,
                  height: 200,
                  border: "3px solid #1a1a1a",
                  boxShadow: "inset 0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
                  backgroundImage: `url(${timerNatureImg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Gradient overlay + timer text */}
                <div
                  className="w-full h-full rounded-full flex flex-col items-center justify-center"
                  style={{
                    background: "radial-gradient(circle, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.4) 100%)",
                  }}
                >
                  <span
                    className="text-[44px] font-bold text-white tabular-nums leading-none"
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}
                  >
                    {formattedRemaining}
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-[0.2em] text-white/60 mt-2"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                  >
                    {STATE_LABELS[state] || ""}
                  </span>
                </div>
              </div>
            </TimerRing>
          </div>

          {/* Action button */}
          <div className="relative flex gap-3 mb-5">
            {state === "completed" ? (
              <Button
                onClick={handleComplete}
                className="flex-1 h-14 rounded-full bg-gradient-to-b from-lime-300 to-lime-500 hover:from-lime-200 hover:to-lime-400 text-black font-bold text-base border-0"
                style={glossyStyle}
              >
                <Check size={20} className="mr-2" />
                Concluir
              </Button>
            ) : state === "running" ? (
              <>
                <Button
                  onClick={pause}
                  className="flex-1 h-14 rounded-full bg-white/10 text-white hover:bg-white/15 font-semibold text-base border-0"
                >
                  <Pause size={20} className="mr-2" />
                  Pausar
                </Button>
                <Button
                  onClick={skip}
                  className="h-14 px-5 rounded-full bg-white/10 text-white hover:bg-white/15 border-0"
                  title="Pular"
                >
                  <SkipForward size={20} />
                </Button>
              </>
            ) : state === "paused" ? (
              <>
                <Button
                  onClick={start}
                  className="flex-1 h-14 rounded-full bg-gradient-to-b from-lime-300 to-lime-500 hover:from-lime-200 hover:to-lime-400 text-black font-bold text-base border-0"
                  style={glossyStyle}
                >
                  <Play size={20} className="mr-2" />
                  Continuar
                </Button>
                <Button
                  onClick={reset}
                  className="h-14 px-5 rounded-full bg-white/10 text-white hover:bg-white/15 border-0"
                  title="Reiniciar"
                >
                  <RotateCcw size={20} />
                </Button>
              </>
            ) : (
              <Button
                onClick={start}
                className="flex-1 h-14 rounded-full bg-gradient-to-b from-lime-300 to-lime-500 hover:from-lime-200 hover:to-lime-400 text-black font-bold text-base border-0"
                style={glossyStyle}
              >
                <Play size={18} className="mr-2" />
                Iniciar Sessao
              </Button>
            )}
          </div>

          {/* Info chips — dark gray pills */}
          <div className="relative flex gap-3">
            <div className="flex-1 rounded-2xl p-3.5" style={{ backgroundColor: "#1a1a1a" }}>
              <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">
                Habito
              </p>
              <p className="text-sm font-semibold text-white truncate">
                {habit.name}
              </p>
            </div>
            <div className="flex-1 rounded-2xl p-3.5" style={{ backgroundColor: "#1a1a1a" }}>
              <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">
                Meta hoje
              </p>
              <p className="text-sm font-semibold text-white">
                {goalDisplay}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Celebration overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.5, 1.2], opacity: [0, 0.4, 0] }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute w-64 h-64 rounded-full bg-lime-400/30 blur-3xl"
              />
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
    </AnimatePresence>,
    document.body
  );
};

export default TimerModal;
