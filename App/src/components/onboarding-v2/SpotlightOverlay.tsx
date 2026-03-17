import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { motion } from "motion/react";

// ============================================================================
// TYPES
// ============================================================================

interface SpotlightOverlayProps {
  targetSelector: string;
  title: string;
  copy: string;
  position: "top" | "bottom";
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const SpotlightOverlay = ({
  targetSelector,
  title,
  copy,
  position,
  stepIndex,
  totalSteps,
  onNext,
}: SpotlightOverlayProps) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const measure = useCallback(() => {
    const el = document.querySelector(targetSelector);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [targetSelector]);

  // Initial measurement
  useLayoutEffect(() => {
    // Small delay to ensure mock elements are rendered
    const raf = requestAnimationFrame(() => measure());
    return () => cancelAnimationFrame(raf);
  }, [measure]);

  // Re-measure on resize
  useEffect(() => {
    const handler = () => measure();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [measure]);

  if (!rect) return null;

  const PADDING = 8;
  const cutout = {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50"
      onClick={onNext}
    >
      {/* Cutout element — box-shadow creates the dark overlay */}
      <div
        className="absolute rounded-2xl"
        style={{
          top: cutout.top,
          left: cutout.left,
          width: cutout.width,
          height: cutout.height,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.75)",
          pointerEvents: "none",
        }}
      />

      {/* Step indicator — top right */}
      <div className="absolute top-4 right-4 pt-safe">
        <span className="text-xs text-white/90 font-medium">
          {stepIndex + 1} de {totalSteps}
        </span>
      </div>

      {/* Tooltip */}
      <div
        className="absolute left-4 right-4 flex justify-center"
        style={
          position === "top"
            ? { bottom: window.innerHeight - cutout.top + 16 }
            : { top: cutout.top + cutout.height + 16 }
        }
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, y: position === "top" ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="bg-card rounded-2xl p-5 max-w-sm w-full shadow-xl border border-border/50"
        >
          <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{copy}</p>
          <p className="text-xs text-muted-foreground/50">Toque para continuar</p>
        </motion.div>
      </div>
    </motion.div>
  );
};
