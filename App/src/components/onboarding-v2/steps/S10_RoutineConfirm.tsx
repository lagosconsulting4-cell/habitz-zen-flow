import { useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { useOnboardingV2 } from "../OnboardingProviderV2";
import { HabitGlyph } from "@/components/icons/HabitGlyph";
import { Button } from "@/components/ui/button";
import type { RecommendedHabitV2 } from "../generateRecommendationsV2";

// ============================================================================
// CONSTANTS
// ============================================================================

const PERIOD_LABEL: Record<string, string> = {
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
};

const PERIOD_ORDER = ["morning", "afternoon", "evening"] as const;

const BG = `${import.meta.env.BASE_URL}backgrounds/arte1.webp`;

// confirm = end of phase 2 (phases 0-indexed: 0,1,2 = full; 3,4 = empty)
const PROGRESS_FILLED_PHASES = 3;
const PROGRESS_TOTAL_PHASES = 5;

// ============================================================================
// COMPONENT
// ============================================================================

export const S10RoutineConfirm = () => {
  const {
    generatedHabits,
    selectedHabitIds,
    quizData,
    collectedName,
    nextStep,
    prevStep,
  } = useOnboardingV2();

  const name = quizData?.name || collectedName || "";

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

      {/* ── Fullscreen background image ── */}
      <motion.img
        src={BG}
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* ── Gradient overlay — escuro no topo e no bottom ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.50) 30%, rgba(0,0,0,0.72) 65%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      {/* ── Progress bar (glass, fases 0-2 preenchidas) ── */}
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
                width: i < PROGRESS_FILLED_PHASES ? "100%" : "0%",
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
          paddingTop: 16,
          paddingBottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.2,
            }}
          >
            Pronto. Essa é a sua rotina{name ? `, ${name}` : ""}.
          </h2>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex justify-center gap-8 mb-6"
        >
          <StatBlock value={stats.habitsPerDay} label="hábitos" />
          <StatBlock value={stats.daysPerWeek} label="dias/semana" />
          <StatBlock value={`~${stats.totalMinutes}`} label="min/dia" />
        </motion.div>

        {/* Copy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.70)",
            textAlign: "center",
            maxWidth: 300,
            margin: "0 auto 16px",
            lineHeight: 1.5,
          }}
        >
          Parece pouco? É proposital. Consistência não é sobre fazer muito.
          É sobre nunca parar.
        </motion.p>

        {/* Habit list */}
        <ConfirmedHabitList habits={confirmed} />
      </div>

      {/* ── CTA bar (glass + botão verde padrão) ── */}
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

// ============================================================================
// STAT BLOCK
// ============================================================================

function StatBlock({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="text-center">
      <p
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: "#fff",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.60)",
          marginTop: 4,
        }}
      >
        {label}
      </p>
    </div>
  );
}

// ============================================================================
// CONFIRMED HABIT LIST
// ============================================================================

function ConfirmedHabitList({ habits }: { habits: RecommendedHabitV2[] }) {
  const groups = useMemo(() => {
    const map: Partial<Record<string, RecommendedHabitV2[]>> = {};
    for (const h of habits) {
      (map[h.period] ??= []).push(h);
    }
    return PERIOD_ORDER
      .filter((p) => map[p]?.length)
      .map((p) => ({ period: p, habits: map[p]! }));
  }, [habits]);

  if (!habits.length) return null;

  let globalIndex = 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.45, duration: 0.4 }}
      className="flex-1 min-h-0 space-y-3"
    >
      {groups.map(({ period, habits: groupHabits }) => (
        <div key={period}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            {PERIOD_LABEL[period]}
          </p>
          <div className="space-y-1.5">
            {groupHabits.map((habit) => {
              const delay = 0.5 + globalIndex * 0.06;
              globalIndex++;
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay, duration: 0.3 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(255,255,255,0.10)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    borderRadius: 12,
                    padding: "10px 12px",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  <HabitGlyph
                    iconKey={habit.icon_key}
                    category={habit.category}
                    size="sm"
                    tone="lime"
                    fallbackLabel={habit.icon}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "white",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {habit.name}
                    </p>
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", flexShrink: 0 }}>
                    {habit.suggested_time} · {habit.duration}min
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
