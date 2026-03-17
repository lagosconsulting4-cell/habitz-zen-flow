import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { useOnboardingV2 } from "../OnboardingProviderV2";
import { Button } from "@/components/ui/button";

const BG = "/backgrounds/arte3.webp";

// intro = step 2 of 4 in phase 0 → show phase 0 at ~50%
const PROGRESS_TOTAL_PHASES = 5;
const PHASE_0_FILL = 0.5;

const PARAGRAPHS = [
  "A maioria das pessoas tenta criar hábitos no improviso. Anota numa lista, tenta se lembrar, desiste em duas semanas.",
  "O Bora funciona de outro jeito. A gente monta uma rotina real, feita para o seu dia, e vai do seu lado enquanto você executa.",
  "Não é motivação. É estrutura.",
];

export const S1AppIntro = () => {
  const { nextStep, prevStep } = useOnboardingV2();

  return (
    <div className="h-[100dvh] relative bg-black overflow-hidden flex flex-col">

      {/* ── Fullscreen background image ── */}
      <motion.img
        src={BG}
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* ── Gradient overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.70) 65%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      {/* ── Progress bar ── */}
      <div
        className="relative z-10 flex items-center gap-2 px-4"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px), 14px)",
          paddingBottom: 10,
        }}
      >
        {Array.from({ length: PROGRESS_TOTAL_PHASES }, (_, i) => (
          <div
            key={i}
            className="relative flex-1 h-[3px] rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.20)" }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: i === 0 ? `${PHASE_0_FILL * 100}%` : "0%",
                background: "white",
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div
        className="relative z-10 flex flex-col flex-1 min-h-0 px-6 justify-center"
        style={{
          paddingBottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.15,
            marginBottom: 28,
          }}
        >
          Aqui é diferente.
        </motion.h1>

        <div className="space-y-5">
          {PARAGRAPHS.map((text, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.4 }}
              style={{
                fontSize: 16,
                color: i === PARAGRAPHS.length - 1
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.80)",
                lineHeight: 1.55,
                fontWeight: i === PARAGRAPHS.length - 1 ? 600 : 400,
              }}
            >
              {text}
            </motion.p>
          ))}
        </div>
      </div>

      {/* ── CTA bar (glass + back + Continuar) ── */}
      <div
        className="fixed bottom-0 inset-x-0 z-20"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)",
        }}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevStep}
            onMouseDown={(e) => e.preventDefault()}
            className="h-10 w-10 shrink-0 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            onClick={nextStep}
            className="flex-1 h-12 text-base font-medium"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};
