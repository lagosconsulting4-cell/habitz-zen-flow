import { useMemo, useRef, useLayoutEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingV2 } from "../OnboardingProviderV2";

// Generate 30-min interval time options from 04:00 to 02:00 (wrapping midnight)
function generateTimeOptions(): string[] {
  const options: string[] = [];
  // Start at 04:00 (index 8 of 48 half-hours), wrap through midnight to 02:00 (index 4)
  for (let i = 8; i < 48 + 5; i++) {
    const slot = i % 48;
    const h = Math.floor(slot / 2);
    const m = (slot % 2) * 30;
    options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();
const ITEM_HEIGHT = 44; // px — 44px min touch target

// --- Sleep duration helpers ---

function calcSleepDuration(wake: string, sleep: string): { hours: number; minutes: number } {
  const [wh, wm] = wake.split(':').map(Number);
  const [sh, sm] = sleep.split(':').map(Number);
  const wakeMin = wh * 60 + wm;
  const sleepMin = sh * 60 + sm;
  // Sleep duration = from sleep time to next wake
  const totalMin = sleepMin > wakeMin
    ? (1440 - sleepMin) + wakeMin  // e.g. sleep 23:00 → wake 07:00 = 8h
    : wakeMin - sleepMin;           // e.g. sleep 01:00 → wake 07:00 = 6h
  return { hours: Math.floor(totalMin / 60), minutes: totalMin % 60 };
}

function sleepContextMessage(hours: number): string {
  if (hours < 6) return "Vamos encaixar hábitos rápidos pela manhã.";
  if (hours <= 9) return "Seu dia tem equilíbrio.";
  return "Bastante descanso. Ótimo ponto de partida.";
}

// --- DrumPicker — iOS-style CSS scroll-snap drum ---
interface DrumPickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function DrumPicker({ label, value, onChange }: DrumPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set initial scroll position before first paint to avoid flash at position 0
  useLayoutEffect(() => {
    const index = TIME_OPTIONS.indexOf(value);
    if (ref.current && index >= 0) {
      ref.current.scrollTop = index * ITEM_HEIGHT;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!ref.current) return;
      const index = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(TIME_OPTIONS.length - 1, index));
      if (TIME_OPTIONS[clamped] !== value) {
        onChange(TIME_OPTIONS[clamped]);
      }
    }, 50);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <div className="relative h-[220px] w-28 overflow-hidden rounded-xl">
        {/* Top fade */}
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        {/* Center selection highlight */}
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-11 border border-primary/30 bg-primary/5 z-0 pointer-events-none rounded-lg" />
        {/* Scroll drum */}
        <div
          ref={ref}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {/* Top spacer — centers first item */}
          <div style={{ height: (220 - ITEM_HEIGHT) / 2 }} />
          {TIME_OPTIONS.map((time) => (
            <div
              key={time}
              style={{ scrollSnapAlign: "center", height: ITEM_HEIGHT }}
              className={`flex items-center justify-center text-lg font-semibold transition-colors duration-150 ${
                time === value ? "text-foreground" : "text-muted-foreground/30"
              }`}
            >
              {time}
            </div>
          ))}
          {/* Bottom spacer */}
          <div style={{ height: (220 - ITEM_HEIGHT) / 2 }} />
        </div>
      </div>
    </div>
  );
}

// --- Sleep Stats Card ---
function SleepStatsCard({ wake, sleep }: { wake: string; sleep: string }) {
  const wakeMin = useMemo(() => {
    const [h, m] = wake.split(':').map(Number);
    return h * 60 + m;
  }, [wake]);

  const sleepMin = useMemo(() => {
    const [h, m] = sleep.split(':').map(Number);
    return h * 60 + m;
  }, [sleep]);

  const { hours, minutes } = calcSleepDuration(wake, sleep);
  const durationLabel = minutes > 0 ? `${hours}h${String(minutes).padStart(2, '0')}` : `${hours}h`;
  const message = sleepContextMessage(hours);

  const TOTAL = 1440;
  const wakePercent = (wakeMin / TOTAL) * 100;
  const sleepPercent = (sleepMin / TOTAL) * 100;

  // isOvernight: sleep time is AFTER midnight (e.g. sleep=23:00 → wake=07:00)
  const isOvernight = sleepMin > wakeMin;

  // Segments for the timeline bar
  // Normal (not overnight, e.g. sleep=01:00, wake=07:00): awake block is small
  // Overnight (sleep=23:00, wake=07:00): large awake block in the middle
  const segments = isOvernight
    ? [
        { pct: wakePercent,                cls: "bg-muted-foreground/25" },
        { pct: sleepPercent - wakePercent, cls: "bg-primary/75" },
        { pct: 100 - sleepPercent,          cls: "bg-muted-foreground/25" },
      ]
    : [
        { pct: sleepPercent,               cls: "bg-primary/75" },
        { pct: wakePercent - sleepPercent, cls: "bg-muted-foreground/25" },
        { pct: 100 - wakePercent,           cls: "bg-primary/75" },
      ];

  const springCfg = { type: "spring" as const, stiffness: 260, damping: 30 };

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/70 backdrop-blur-sm p-4 space-y-3">
      {/* Header — duration + contextual message */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Moon className="w-5 h-5 text-primary shrink-0" />
          <div className="flex items-baseline gap-1">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={durationLabel}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="text-2xl font-bold text-foreground tabular-nums leading-none"
              >
                {durationLabel}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs text-muted-foreground">de sono</span>
          </div>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={message}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-xs text-muted-foreground/70 text-right max-w-[110px] leading-snug"
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Floating time labels that slide with spring to exact positions */}
      <div className="relative h-4 mx-0.5">
        <motion.div
          className="absolute -translate-x-1/2"
          animate={{ left: `${wakePercent}%` }}
          transition={springCfg}
        >
          <span className="text-[10px] font-semibold text-primary tabular-nums">{wake}</span>
        </motion.div>
        <motion.div
          className="absolute -translate-x-1/2"
          animate={{ left: `${sleepPercent}%` }}
          transition={springCfg}
        >
          <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">{sleep}</span>
        </motion.div>
      </div>

      {/* Timeline bar — segments + tick overlay sharing exact h-5 bounds */}
      <div className="relative h-5">
        {/* Segments — clipped by overflow-hidden (safe, ticks are outside) */}
        <div className="absolute inset-0 rounded-full bg-muted overflow-hidden flex">
          {segments.map((seg, i) => (
            <motion.div
              key={i}
              className={cn("h-full", seg.cls)}
              animate={{ width: `${Math.max(0, seg.pct)}%` }}
              transition={springCfg}
            />
          ))}
        </div>
        {/* Tick overlay — inset-0 matches exactly h-5 bar, no clipping of edges */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Wake tick */}
          <motion.div
            className="absolute top-0 bottom-0 w-[2px] bg-primary"
            style={{ translateX: "-50%" }}
            animate={{ left: `${wakePercent}%` }}
            transition={springCfg}
          />
          {/* Sleep tick */}
          <motion.div
            className="absolute top-0 bottom-0 w-[2px] bg-foreground"
            style={{ translateX: "-50%" }}
            animate={{ left: `${sleepPercent}%` }}
            transition={springCfg}
          />
        </div>
      </div>

      {/* Static hour labels */}
      <div className="flex justify-between mt-1 px-0.5">
        {["00", "06", "12", "18", "24"].map((t) => (
          <span key={t} className="text-[9px] text-muted-foreground/40">{t}h</span>
        ))}
      </div>

    </div>
  );
}

// ============================================================================
// S4 — Wake/Sleep Time
// ============================================================================

export const S4WakeSleepTime = memo(function S4WakeSleepTime() {
  const { wakeSleepTime, setWakeSleepTime } = useOnboardingV2();

  return (
    <div className="h-full flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-foreground">
          A que horas você acorda e dorme?
        </h2>
        <p className="text-base text-muted-foreground mt-2">
          Usamos isso para encaixar os hábitos no seu horário livre, não disputar com ele.
        </p>
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col justify-center max-w-md mx-auto w-full overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex justify-around gap-4"
        >
          <DrumPicker
            label="Acordar"
            value={wakeSleepTime.wake}
            onChange={(wake) => setWakeSleepTime({ ...wakeSleepTime, wake })}
          />
          <DrumPicker
            label="Dormir"
            value={wakeSleepTime.sleep}
            onChange={(sleep) => setWakeSleepTime({ ...wakeSleepTime, sleep })}
          />
        </motion.div>

        {/* Sleep stats card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-8"
        >
          <SleepStatsCard wake={wakeSleepTime.wake} sleep={wakeSleepTime.sleep} />
        </motion.div>

        {/* Microcopy — outside card */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="text-xs text-muted-foreground/60 text-center mt-3"
        >
          Não precisa ser exato. Uma estimativa já ajuda bastante.
        </motion.p>
      </div>
    </div>
  );
});
