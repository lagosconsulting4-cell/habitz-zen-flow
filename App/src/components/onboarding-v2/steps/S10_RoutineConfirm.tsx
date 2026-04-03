import { useMemo, memo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Zap, CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { useOnboardingV2 } from "../OnboardingProviderV2";
import { Button } from "@/components/ui/button";

// ============================================================================
// CONSTANTS
// ============================================================================

const BG = `${import.meta.env.BASE_URL}backgrounds/arte1.webp`;

const IDENTITY_PHRASE: Record<string, string> = {
  productivity: "faz mais com menos energia desperdiçada",
  health:       "cuida do corpo todo dia",
  mental:       "mantém o equilíbrio mesmo no caos",
  routine:      "finalmente mantém uma rotina",
  avoid:        "se liberta das distrações que travam",
};

const PROGRESS_FILLED_PHASES = 3;
const PROGRESS_TOTAL_PHASES = 5;

// ============================================================================
// COMPONENT
// ============================================================================

export const S10RoutineConfirm = memo(function S10RoutineConfirm() {
  const {
    generatedHabits,
    selectedHabitIds,
    quizData,
    collectedName,
    confirmedObjective,
    nextStep,
    prevStep,
  } = useOnboardingV2();

  const name = quizData?.name || collectedName || "";
  const identityPhrase = confirmedObjective ? IDENTITY_PHRASE[confirmedObjective] : null;
  const projectedFeeling = quizData?.projected_feeling || null;
  const yearsPromising = quizData?.years_promising || null;

  const confirmed = useMemo(
    () => generatedHabits.filter((h) => selectedHabitIds.has(h.id)),
    [generatedHabits, selectedHabitIds]
  );

  const stats = useMemo(() => {
    const habitsPerDay = confirmed.length;
    const daysPerWeek = new Set(confirmed.flatMap((h) => h.frequency_days)).size;
    const totalMinutes = confirmed.reduce((sum, h) => sum + (h.duration || 0), 0);
    return { habitsPerDay, daysPerWeek, totalMinutes };
  }, [confirmed]);

  return (
    <div className="h-[100dvh] relative bg-black overflow-hidden flex flex-col">

      {/* ── Background image ── */}
      <motion.img
        src={BG}
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* ── Gradient overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,0.70) 55%, rgba(0,0,0,0.98) 100%)",
        }}
      />

      {/* ── Glow decorativo central ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 1.0, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ top: "-10%" }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, hsl(var(--primary)/0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </motion.div>

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
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: i < PROGRESS_FILLED_PHASES ? "hsl(var(--primary))" : "transparent" }}
              initial={{ width: 0 }}
              animate={{ width: i < PROGRESS_FILLED_PHASES ? "100%" : "0%" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>

      {/* ── Spacer ── */}
      <div className="relative z-10 flex-1" />

      {/* ── Conteúdo ancorado no bottom ── */}
      <div
        className="relative z-10 flex-shrink-0 flex flex-col px-6"
        style={{
          paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))",
        }}
      >

        {/* Badge de confirmação */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-2 mb-5"
        >
          <CheckCircle2
            size={16}
            style={{ color: "hsl(var(--primary))", flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "hsl(var(--primary))",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            Rotina configurada
          </span>
        </motion.div>

        {/* Identity headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: "easeOut" }}
          className="mb-4"
        >
          {identityPhrase ? (
            <>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.50)",
                  marginBottom: 4,
                  lineHeight: 1.4,
                }}
              >
                Você vai ser a pessoa que
              </p>
              <h2
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                {identityPhrase}.
              </h2>
            </>
          ) : (
            <h2
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.15,
              }}
            >
              {name ? `${name}, essa` : "Essa"} é a sua rotina.
            </h2>
          )}
        </motion.div>

        {/* Linha emocional com dados do quiz */}
        {(projectedFeeling || yearsPromising) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.55,
              marginBottom: 20,
            }}
          >
            {projectedFeeling && (
              <>
                Você quer se sentir{" "}
                <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                  {projectedFeeling.toLowerCase()}
                </span>
                {yearsPromising && yearsPromising !== "menos de 1 ano"
                  ? <>. Faz <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{yearsPromising}</span> que você busca isso.</>
                  : "."}
              </>
            )}
            {!projectedFeeling && yearsPromising && yearsPromising !== "menos de 1 ano" && (
              <>
                Faz <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{yearsPromising}</span> que você busca isso. Agora tem um sistema.
              </>
            )}
          </motion.p>
        )}

        {/* Stats glass pills */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="flex gap-2 mb-5"
        >
          <StatPill icon={<Zap size={14} />} value={stats.habitsPerDay} label="hábitos" />
          <StatPill icon={<CalendarDays size={14} />} value={stats.daysPerWeek} label="dias/sem" />
          <StatPill icon={<Clock size={14} />} value={`~${stats.totalMinutes}`} label="min/dia" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.55,
          }}
        >
          Montada para o seu dia real —{" "}
          <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
            não o dia perfeito.
          </span>
        </motion.p>
      </div>

      {/* ── CTA bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="fixed bottom-0 inset-x-0 z-20 px-4 py-3 flex items-center gap-3"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)" }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={prevStep}
          onMouseDown={(e) => e.preventDefault()}
          className="h-10 w-10 shrink-0 text-white hover:bg-white/15"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          onClick={nextStep}
          className="flex-1 h-12 text-base font-semibold rounded-2xl"
        >
          Ver o que vem a seguir →
        </Button>
      </motion.div>
    </div>
  );
});

// ============================================================================
// STAT PILL — glassmorphism
// ============================================================================

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        padding: "12px 8px",
      }}
    >
      <div style={{ color: "hsl(var(--primary))", opacity: 0.9 }}>{icon}</div>
      <p style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</p>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.40)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}
