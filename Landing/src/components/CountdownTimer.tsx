import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Clock, AlertTriangle } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

interface CountdownTimerProps {
  variant?: "hero" | "pricing" | "compact";
  onExpire?: () => void;
}

const STORAGE_KEY = "bora_offer_expires";
const OFFER_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours

const getOrCreateExpireTime = (): number => {
  if (typeof window === "undefined") return Date.now() + OFFER_DURATION_MS;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const expireTime = parseInt(stored, 10);
    if (!isNaN(expireTime)) return expireTime;
  }

  const newExpireTime = Date.now() + OFFER_DURATION_MS;
  localStorage.setItem(STORAGE_KEY, newExpireTime.toString());
  return newExpireTime;
};

const calculateTimeLeft = (expireTime: number): TimeLeft => {
  const now = Date.now();
  const total = Math.max(0, expireTime - now);

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
};

export function CountdownTimer({ variant = "hero", onExpire }: CountdownTimerProps) {
  const [expireTime, setExpireTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Initialize expire time on mount
  useEffect(() => {
    const time = getOrCreateExpireTime();
    setExpireTime(time);
    setTimeLeft(calculateTimeLeft(time));
  }, []);

  // Update countdown every second
  useEffect(() => {
    if (!expireTime) return;

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(expireTime);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0) {
        setIsExpired(true);
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expireTime, onExpire]);

  const formatNumber = useCallback((n: number) => n.toString().padStart(2, "0"), []);

  if (!timeLeft) return null;

  // Expired state
  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-destructive"
      >
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Oferta encerrada</span>
      </motion.div>
    );
  }

  // Compact variant (for badges)
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="inline-flex items-center gap-1.5 text-xs font-medium"
      >
        <Clock className="h-3 w-3 text-primary" />
        <span className="text-muted-foreground">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </span>
      </motion.div>
    );
  }

  // Hero variant (large, prominent)
  if (variant === "hero") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-2 text-primary">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Oferta expira em
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {timeLeft.days > 0 && (
            <>
              <TimeBlock value={timeLeft.days} label="dias" />
              <TimeSeparator />
            </>
          )}
          <TimeBlock value={timeLeft.hours} label="horas" />
          <TimeSeparator />
          <TimeBlock value={timeLeft.minutes} label="min" />
          <TimeSeparator />
          <TimeBlock value={timeLeft.seconds} label="seg" />
        </div>
      </motion.div>
    );
  }

  // Pricing variant (medium, inline)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
    >
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-destructive animate-pulse" />
        <span className="text-sm font-medium text-destructive">
          Preço especial expira em:
        </span>
      </div>

      <div className="flex items-center gap-1 font-mono font-bold text-lg text-destructive">
        {timeLeft.days > 0 && (
          <span>{timeLeft.days}d </span>
        )}
        <span>{formatNumber(timeLeft.hours)}</span>
        <span className="animate-pulse">:</span>
        <span>{formatNumber(timeLeft.minutes)}</span>
        <span className="animate-pulse">:</span>
        <span>{formatNumber(timeLeft.seconds)}</span>
      </div>
    </motion.div>
  );
}

// Time block component for hero variant
function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-card border border-border"
      >
        <span className="text-2xl sm:text-3xl font-bold tabular-nums">
          {value.toString().padStart(2, "0")}
        </span>
      </motion.div>
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// Separator for hero variant
function TimeSeparator() {
  return (
    <span className="text-2xl font-bold text-muted-foreground/50 animate-pulse">
      :
    </span>
  );
}

export default CountdownTimer;
