import { useEffect, memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingV2 } from "../OnboardingProviderV2";

const BG = `${import.meta.env.BASE_URL}assets/onboarding/celebration-bg.webp`;

// ============================================================================
// COMPONENT
// ============================================================================

export const S20Celebration = memo(function S20Celebration() {
  const {
    collectedName,
    quizData,
    isSubmitting,
    submitOnboardingV2,
  } = useOnboardingV2();

  const shouldReduceMotion = useReducedMotion();

  // Fire confetti on mount (lazy-loaded to avoid bundling upfront)
  useEffect(() => {
    if (!shouldReduceMotion) {
      import("canvas-confetti").then(m => m.default({ particleCount: 100, spread: 70, origin: { y: 0.6 } }));
    }
  }, [shouldReduceMotion]);

  const name = collectedName || quizData?.name || "você";

  const YEARS_LABELS: Record<string, string> = {
    "2-3_anos": "2 a 3 anos",
    "4-5_anos": "4 a 5 anos",
    "perdi_conta": "muitos anos",
  };
  const yearsPromising = quizData?.years_promising ? (YEARS_LABELS[quizData.years_promising] ?? null) : null;

  return (
    <div className="h-[100dvh] relative bg-black overflow-hidden flex flex-col">

      {/* ── Fullscreen background image ── */}
      <motion.img
        src={BG}
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* ── Gradient overlay — topo limpo, escurece apenas na base ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.82) 100%)",
        }}
      />

      {/* ── Spacer — empurra conteúdo para o bottom ── */}
      <div className="relative z-10 flex-1" />

      {/* ── Content ancorado no bottom ── */}
      <div
        className="relative z-10 flex-shrink-0 flex flex-col items-center px-6 text-center"
        style={{
          paddingBottom: "calc(130px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ fontSize: 34, fontWeight: 700, color: "#fff", marginBottom: 10, lineHeight: 1.15 }}
        >
          Sua rotina está{" "}
          <span style={{ color: "hsl(var(--primary))" }}>no ar</span>
          , {name}.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", maxWidth: 300, lineHeight: 1.55 }}
        >
          {yearsPromising
            ? <>Faz {yearsPromising} que você busca isso.<br />Agora você tem um sistema. Use-o um dia de cada vez.</>
            : <>Você tem um sistema agora.<br />Use-o um dia de cada vez.</>
          }
        </motion.p>
      </div>

      {/* ── CTA — fixed bottom ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="fixed bottom-0 inset-x-0 z-20 px-6"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)" }}
      >
        <Button
          size="lg"
          onClick={submitOnboardingV2}
          disabled={isSubmitting}
          className="w-full h-14 text-base font-semibold rounded-2xl"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Ver minha rotina"
          )}
        </Button>
      </motion.div>
    </div>
  );
});
