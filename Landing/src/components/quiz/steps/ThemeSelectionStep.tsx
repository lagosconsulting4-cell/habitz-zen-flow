import { motion, AnimatePresence } from "motion/react";
import { useState, useRef } from "react";
import { useQuiz } from "../QuizProvider";
import type { QuizTheme } from "@/lib/quizThemes";

const THEMES = [
  {
    id: "jade" as QuizTheme,
    name: "Jade",
    word: "Equilíbrio",
    photo:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=1920&auto=format&fit=crop",
    fallback:
      "radial-gradient(ellipse at 40% 25%, #254d20 0%, #0e2710 55%, #040c05 100%)",
    accent: "#a3e635",
  },
  {
    id: "aurora" as QuizTheme,
    name: "Aurora",
    word: "Criatividade",
    photo:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop",
    fallback:
      "radial-gradient(ellipse at 60% 25%, #3d1a6e 0%, #1a0a3a 55%, #080414 100%)",
    accent: "#a78bfa",
  },
  {
    id: "chama" as QuizTheme,
    name: "Chama",
    word: "Intensidade",
    photo:
      "https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?q=80&w=1920&auto=format&fit=crop",
    fallback:
      "radial-gradient(ellipse at 50% 20%, #5a2810 0%, #2d1008 55%, #0d0402 100%)",
    accent: "#fb923c",
  },
  {
    id: "gelo" as QuizTheme,
    name: "Gelo",
    word: "Clareza",
    photo:
      "https://images.unsplash.com/photo-1551415923-a2297c7fda79?q=80&w=1920&auto=format&fit=crop",
    fallback:
      "radial-gradient(ellipse at 30% 40%, #0a2a3a 0%, #041520 55%, #010508 100%)",
    accent: "#22d3ee",
  },
];

export const ThemeSelectionStep = () => {
  const { setTheme, nextStep } = useQuiz();
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);

  const active = THEMES[activeIndex];
  const hasError = imgErrors[active.id];

  const goNext = () => setActiveIndex((i) => (i + 1) % THEMES.length);
  const goPrev = () => setActiveIndex((i) => (i - 1 + THEMES.length) % THEMES.length);

  const handleSelect = () => {
    setTheme(active.id);
    nextStep();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      delta < 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full min-h-[100dvh] overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65 }}
        >
          {!hasError ? (
            <img
              src={active.photo}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={() =>
                setImgErrors((prev) => ({ ...prev, [active.id]: true }))
              }
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: active.fallback }}
            />
          )}
          {/* Vignette */}
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />
        </motion.div>
      </AnimatePresence>

      {/* Invisible tap zones — top 60% of screen */}
      <button
        className="absolute left-0 top-0 w-1/2 opacity-0 z-20"
        style={{ height: "60%" }}
        onClick={goPrev}
        aria-label="Tema anterior"
      />
      <button
        className="absolute right-0 top-0 w-1/2 opacity-0 z-20"
        style={{ height: "60%" }}
        onClick={goNext}
        aria-label="Próximo tema"
      />

      {/* Top label */}
      <div className="absolute top-14 inset-x-0 flex justify-center z-10 pointer-events-none">
        <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-light">
          Personalize sua experiência
        </p>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 inset-x-0 px-8 pb-14 z-10 flex flex-col items-center">
        {/* Name + word */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
            className="text-center mb-6"
          >
            <h2 className="text-[4.5rem] font-black text-white tracking-tight leading-none mb-2">
              {active.name}
            </h2>
            <p
              className="text-xs tracking-[0.25em] uppercase font-light"
              style={{ color: active.accent }}
            >
              {active.word}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="flex items-center gap-2 mb-8">
          {THEMES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveIndex(i)}
              className="transition-all duration-300"
              style={{
                width: i === activeIndex ? 22 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  i === activeIndex ? active.accent : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleSelect}
          className="w-full max-w-sm h-14 rounded-2xl text-sm font-bold tracking-widest uppercase transition-all active:scale-[0.97]"
          style={{
            backgroundColor: active.accent,
            color: "#0a0a0b",
            boxShadow: `0 0 40px ${active.accent}55`,
          }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
