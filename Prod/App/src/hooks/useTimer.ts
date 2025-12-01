import { useState, useEffect, useCallback, useRef } from "react";

export type TimerState = "idle" | "running" | "paused" | "completed";

interface UseTimerOptions {
  /** Target time in seconds */
  targetSeconds: number;
  /** Callback when timer completes */
  onComplete?: () => void;
  /** Auto-start timer when hook mounts */
  autoStart?: boolean;
}

interface UseTimerReturn {
  /** Current elapsed time in seconds */
  elapsedSeconds: number;
  /** Remaining time in seconds */
  remainingSeconds: number;
  /** Progress percentage 0-100 */
  progress: number;
  /** Current timer state */
  state: TimerState;
  /** Start or resume the timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset the timer to initial state */
  reset: () => void;
  /** Skip to completion */
  skip: () => void;
  /** Formatted time string (MM:SS or HH:MM:SS) */
  formattedTime: string;
  /** Formatted remaining time string */
  formattedRemaining: string;
}

/**
 * Format seconds into MM:SS or HH:MM:SS string
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Get target seconds from habit goal
 */
export function getTargetSeconds(goalValue: number, unit: string): number {
  switch (unit) {
    case "minutes":
      return goalValue * 60;
    case "hours":
      return goalValue * 3600;
    default:
      return goalValue * 60; // default to minutes
  }
}

/**
 * Custom hook for managing a countdown/elapsed timer
 */
export function useTimer({
  targetSeconds,
  onComplete,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [state, setState] = useState<TimerState>(autoStart ? "running" : "idle");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef(0);

  // Calculate derived values
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const progress = Math.min(100, (elapsedSeconds / targetSeconds) * 100);

  // Clear interval helper
  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start timer
  const start = useCallback(() => {
    if (state === "completed") return;

    setState("running");
    startTimeRef.current = Date.now() - pausedElapsedRef.current * 1000;

    clearTimerInterval();
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) return;

      const newElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(newElapsed);

      if (newElapsed >= targetSeconds) {
        clearTimerInterval();
        setState("completed");
        setElapsedSeconds(targetSeconds);
        onComplete?.();
      }
    }, 100); // Update every 100ms for smooth progress
  }, [state, targetSeconds, onComplete, clearTimerInterval]);

  // Pause timer
  const pause = useCallback(() => {
    if (state !== "running") return;

    clearTimerInterval();
    pausedElapsedRef.current = elapsedSeconds;
    setState("paused");
  }, [state, elapsedSeconds, clearTimerInterval]);

  // Reset timer
  const reset = useCallback(() => {
    clearTimerInterval();
    setElapsedSeconds(0);
    pausedElapsedRef.current = 0;
    startTimeRef.current = null;
    setState("idle");
  }, [clearTimerInterval]);

  // Skip to completion
  const skip = useCallback(() => {
    clearTimerInterval();
    setElapsedSeconds(targetSeconds);
    setState("completed");
    onComplete?.();
  }, [targetSeconds, onComplete, clearTimerInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && state === "idle") {
      start();
    }
  }, [autoStart, state, start]);

  return {
    elapsedSeconds,
    remainingSeconds,
    progress,
    state,
    start,
    pause,
    reset,
    skip,
    formattedTime: formatTime(elapsedSeconds),
    formattedRemaining: formatTime(remainingSeconds),
  };
}

// Motivational quotes for timer
export const TIMER_QUOTES = [
  { text: "A consistência é mais importante que a perfeição.", author: "Provérbio" },
  { text: "Pequenos passos todos os dias levam a grandes resultados.", author: "Anônimo" },
  { text: "O tempo que você investe em si mesmo nunca é desperdiçado.", author: "Anônimo" },
  { text: "Cada minuto dedicado a você é um investimento no seu futuro.", author: "Anônimo" },
  { text: "A jornada de mil quilômetros começa com um único passo.", author: "Lao Tzu" },
  { text: "Você não precisa ser ótimo para começar, mas precisa começar para ser ótimo.", author: "Zig Ziglar" },
  { text: "O segredo de avançar é começar.", author: "Mark Twain" },
  { text: "Disciplina é escolher entre o que você quer agora e o que você mais quer.", author: "Abraham Lincoln" },
];

export function getRandomQuote() {
  return TIMER_QUOTES[Math.floor(Math.random() * TIMER_QUOTES.length)];
}
