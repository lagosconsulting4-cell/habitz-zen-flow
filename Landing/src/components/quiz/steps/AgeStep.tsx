import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useQuiz } from "../QuizProvider";

// Generate ages 18 to 80
const AGES = Array.from({ length: 63 }, (_, i) => String(18 + i));
const ITEM_HEIGHT = 64; // px

export const AgeStep = () => {
  const { ageRange, setAgeRange, nextStep } = useQuiz();

  const initialIndex = (() => {
    const parsed = parseInt(ageRange ?? "");
    if (!isNaN(parsed) && parsed >= 18 && parsed <= 80) return parsed - 18;
    return 7; // default: 25
  })();

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [confirmed, setConfirmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const snapTimeout = useRef<number | null>(null);

  // Scroll to initial position on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snapToIndex = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(AGES.length - 1, idx));
    setSelectedIndex(clamped);
    containerRef.current?.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const raw = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
    setSelectedIndex(Math.max(0, Math.min(AGES.length - 1, raw)));

    if (snapTimeout.current) clearTimeout(snapTimeout.current);
    snapTimeout.current = window.setTimeout(() => {
      if (!containerRef.current) return;
      const snapped = Math.max(
        0,
        Math.min(AGES.length - 1, Math.round(containerRef.current.scrollTop / ITEM_HEIGHT))
      );
      containerRef.current.scrollTo({ top: snapped * ITEM_HEIGHT, behavior: "smooth" });
      setSelectedIndex(snapped);
    }, 80);
  }, []);

  const handleConfirm = () => {
    setAgeRange(AGES[selectedIndex]);
    setConfirmed(true);
    setTimeout(nextStep, 400);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Quantos anos você tem?</h2>
        <p className="text-sm text-slate-400">
          Vamos adaptar seu plano ao seu momento de vida
        </p>
      </motion.div>

      {/* Drum-roll Picker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-56 select-none" aria-label="Seletor de idade">
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0A0A0B] to-transparent z-10 pointer-events-none rounded-t-2xl" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0A0B] to-transparent z-10 pointer-events-none rounded-b-2xl" />

          {/* Selection highlight band */}
          <div
            className="absolute left-0 right-0 z-10 pointer-events-none"
            style={{ top: "50%", transform: "translateY(-50%)", height: ITEM_HEIGHT }}
          >
            <div className="h-full mx-3 rounded-2xl bg-lime-500/15 border border-lime-500/40" />
          </div>

          {/* Scrollable list */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="overflow-y-scroll"
            style={{
              height: ITEM_HEIGHT * 5,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Top spacer: 2 items worth of padding */}
            <div style={{ height: ITEM_HEIGHT * 2 }} />

            {AGES.map((age, i) => {
              const dist = Math.abs(i - selectedIndex);
              const scale = dist === 0 ? 1 : dist === 1 ? 0.82 : dist === 2 ? 0.68 : 0.55;
              const opacity = dist === 0 ? 1 : dist === 1 ? 0.55 : dist === 2 ? 0.3 : 0.12;

              return (
                <div
                  key={age}
                  onClick={() => snapToIndex(i)}
                  className="flex items-center justify-center cursor-pointer"
                  style={{ height: ITEM_HEIGHT }}
                >
                  <span
                    className={`font-black transition-all duration-150 ${i === selectedIndex ? "text-lime-400 text-3xl" : "text-white text-2xl"
                      }`}
                    style={{ transform: `scale(${scale})`, opacity }}
                  >
                    {age}
                    {i === selectedIndex && (
                      <span className="text-base font-semibold ml-1.5 text-lime-300">anos</span>
                    )}
                  </span>
                </div>
              );
            })}

            {/* Bottom spacer */}
            <div style={{ height: ITEM_HEIGHT * 2 }} />
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
          <span>↕</span> Deslize para escolher
        </p>
      </motion.div>

      {/* Confirm button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <Button
          onClick={handleConfirm}
          size="lg"
          className="w-full h-14 text-base font-bold rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-900 shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] transition-all"
        >
          {confirmed ? (
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5" /> Confirmado!
            </span>
          ) : (
            `Confirmar — ${AGES[selectedIndex]} anos`
          )}
        </Button>
      </motion.div>
    </div>
  );
};
