import { memo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useOnboardingNav } from "../OnboardingProviderV2";
import { Button } from "@/components/ui/button";

const BG = `${import.meta.env.BASE_URL}assets/onboarding/journeys-intro-bg.webp`;
const PRIMARY = "#A3E635";

// phases 0-2 full, phase 3 at 50%, phase 4 empty
const PROGRESS_TOTAL_PHASES = 5;
const PROGRESS_FILLED_PHASES = 3; // phases 0, 1, 2
const PHASE_3_FILL = 0.5;         // journeys-intro = first step of phase 3

// ============================================================================
// MOCK JOURNEY CARD (overlapping, horizontal layout)
// ============================================================================

function MockJourneyCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
      style={{
        marginTop: -48,
        marginLeft: 20,
        marginRight: 20,
        background: "#FFFFFF",
        borderRadius: 16,
        boxShadow: "0 -4px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        padding: "16px 18px",
        zIndex: 10,
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Left: badge + title + subtitle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            background: "#A3E6351F",
            color: PRIMARY,
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 6,
            padding: "3px 8px",
            display: "inline-block",
            marginBottom: 6,
          }}
        >
          30 dias
        </span>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "hsl(var(--foreground))",
            marginTop: 0,
            lineHeight: 1.3,
          }}
        >
          Sua primeira Jornada
        </p>
        <p
          style={{
            fontSize: 12,
            color: "#999",
            marginTop: 2,
          }}
        >
          Começa quando você quiser
        </p>
      </div>

      {/* Right: chevron */}
      <ChevronRight
        style={{
          color: PRIMARY,
          flexShrink: 0,
          width: 20,
          height: 20,
        }}
      />
    </motion.div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export const S11JourneysIntro = memo(function S11JourneysIntro() {
  const { nextStep, prevStep } = useOnboardingNav();

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">

      {/* ── Scrollable area: image + card + text ── */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Zone 1: Imagem (58dvh) + progress bar + gradiente */}
        <div className="relative flex-shrink-0" style={{ height: "58dvh" }}>
          <motion.img
            src={BG}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Gradiente transparent → background (branco) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, transparent 65%, var(--background) 100%)",
            }}
          />

          {/* Progress bar sobre a imagem */}
          <div
            className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 px-4"
            style={{
              paddingTop: "max(env(safe-area-inset-top, 0px), 14px)",
              paddingBottom: 10,
            }}
          >
            {Array.from({ length: PROGRESS_TOTAL_PHASES }, (_, i) => {
              let fill = "0%";
              if (i < PROGRESS_FILLED_PHASES) fill = "100%";
              else if (i === PROGRESS_FILLED_PHASES) fill = `${PHASE_3_FILL * 100}%`;
              return (
                <div
                  key={i}
                  className="relative flex-1 h-[3px] rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.30)" }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: fill, background: "white" }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Card sobreposto à base da imagem */}
        <MockJourneyCard />

        {/* Texto */}
        <div style={{ paddingLeft: 24, paddingRight: 24, marginTop: 20, paddingBottom: 16 }}>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
            className="text-[28px] font-bold text-foreground leading-tight"
          >
            Agora, um nível acima.
          </motion.h1>

          {/* Subtítulo discreto */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-[13px] text-muted-foreground mt-1.5"
          >
            Além da sua rotina diária, o Bora tem as Jornadas.
          </motion.p>

          {/* Bloco 1: copy explicativo */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4, ease: "easeOut" }}
            className="text-[15px] text-muted-foreground leading-relaxed"
            style={{ marginTop: 14 }}
          >
            Missões de 30 dias com hábitos específicos para um objetivo. Um passo por dia.
          </motion.p>

          {/* Bloco 2: frase de impacto */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4, ease: "easeOut" }}
            className="text-[15px] font-semibold text-foreground leading-relaxed mt-3"
          >
            A rotina é o que você faz todos os dias. A Jornada é o que vai te levar pro outro nível.
          </motion.p>
        </div>
      </div>

      {/* ── CTA — fora do scroll, ancorado no bottom ── */}
      <div className="flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
          className="px-4 py-3 flex items-center gap-3"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={prevStep}
            onMouseDown={(e) => e.preventDefault()}
            className="h-10 w-10 shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            onClick={nextStep}
            className="flex-1 h-[52px] text-base font-semibold rounded-2xl"
          >
            Ver as jornadas disponíveis
          </Button>
        </motion.div>
      </div>
    </div>
  );
});
