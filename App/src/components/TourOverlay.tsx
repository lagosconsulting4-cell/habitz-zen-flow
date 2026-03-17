import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useTour } from "@/contexts/TourContext";
import { TOUR_STEPS } from "@/config/tourSteps";

// ============================================================================
// CONSTANTS
// ============================================================================

const SPOTLIGHT_PADDING = 8;  // extra space around the target element
const CARD_MARGIN = 16;        // gap between spotlight edge and step card
const CARD_WIDTH = 344;        // max card width in px

// ============================================================================
// COMPONENT
// ============================================================================

export const TourOverlay = () => {
  const { isTourActive, currentStep, totalSteps, nextStep, endTour } = useTour();
  const location = useLocation();
  const navigate = useNavigate();
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStep];

  // ── Navigate to the correct page when step changes ─────────────────────
  useEffect(() => {
    if (!isTourActive || !step) return;
    if (location.pathname !== step.page) {
      navigate(step.page, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTourActive, currentStep]);

  // ── Find & measure the target element once on the right page ───────────
  useEffect(() => {
    if (!isTourActive || !step) return;
    if (location.pathname !== step.page) return;

    setRect(null); // reset while we search

    const findAndMeasure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!el) return;

      if (step.scrollIntoView) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Wait for scroll animation before measuring
        setTimeout(() => setRect(el.getBoundingClientRect()), 400);
      } else {
        setRect(el.getBoundingClientRect());
      }
    };

    // Small delay after navigation to let the page render
    const timer = setTimeout(findAndMeasure, 200);
    return () => clearTimeout(timer);
  }, [isTourActive, currentStep, location.pathname]); // eslint-disable-line

  // ── Update rect on resize ───────────────────────────────────────────────
  useEffect(() => {
    if (!isTourActive || !step || location.pathname !== step.page) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) return;

    const updateRect = () => setRect(el.getBoundingClientRect());
    const observer = new ResizeObserver(updateRect);
    observer.observe(el);
    window.addEventListener("resize", updateRect);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateRect);
    };
  }, [isTourActive, currentStep, location.pathname, rect]); // eslint-disable-line

  if (!isTourActive || !step) return null;

  // ── Card position calculation ───────────────────────────────────────────
  const spotlightTop  = rect ? rect.top    - SPOTLIGHT_PADDING : 0;
  const spotlightLeft = rect ? rect.left   - SPOTLIGHT_PADDING : 0;
  const spotlightW    = rect ? rect.width  + SPOTLIGHT_PADDING * 2 : 0;
  const spotlightH    = rect ? rect.height + SPOTLIGHT_PADDING * 2 : 0;

  const cardAbove = step.cardPosition === "above";
  const cardStyle: React.CSSProperties = rect
    ? {
        position: "fixed",
        width: Math.min(CARD_WIDTH, window.innerWidth - 32),
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        ...(cardAbove
          ? { bottom: window.innerHeight - spotlightTop + CARD_MARGIN }
          : { top: spotlightTop + spotlightH + CARD_MARGIN }),
      }
    : {
        position: "fixed",
        width: Math.min(CARD_WIDTH, window.innerWidth - 32),
        left: "50%",
        transform: "translateX(-50%)",
        top: "50%",
        marginTop: "-80px",
        zIndex: 9999,
      };

  return createPortal(
    <AnimatePresence mode="wait">
      {isTourActive && (
        <>
          {/* Full-screen backdrop — blocks interaction with the app */}
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9996,
              pointerEvents: "all",
            }}
          />

          {/* Spotlight cutout — box-shadow creates the dim overlay with a hole */}
          {rect && (
            <motion.div
              key={`spotlight-${currentStep}`}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: "fixed",
                top: spotlightTop,
                left: spotlightLeft,
                width: spotlightW,
                height: spotlightH,
                borderRadius: 14,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
                pointerEvents: "none",
                zIndex: 9997,
              }}
            />
          )}

          {/* Step card — wrapper div handles fixed positioning; AnimatePresence+motion.div handle animation */}
          <div style={cardStyle}>
          <AnimatePresence mode="wait">
          <motion.div
            key={`card-${currentStep}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-background rounded-2xl p-5 shadow-2xl border border-border/60"
          >
            {/* Step indicator */}
            <p className="text-xs font-semibold text-primary mb-2 tracking-wide">
              {currentStep + 1} / {totalSteps}
            </p>

            {/* Title */}
            <h3 className="text-lg font-bold text-foreground mb-1 leading-snug">
              {step.title}
            </h3>

            {/* Copy */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {step.copy}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {currentStep < totalSteps - 1 && (
                <button
                  onClick={endTour}
                  className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors py-2 shrink-0"
                >
                  Pular
                </button>
              )}
              <Button
                onClick={nextStep}
                className="flex-1 rounded-xl h-10"
              >
                {currentStep === totalSteps - 1 ? "Começar →" : "Próximo →"}
              </Button>
            </div>
          </motion.div>
          </AnimatePresence>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
