import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain } from "lucide-react";
import { useOnboardingV2 } from "../OnboardingProviderV2";
import { useEventTracker } from "@/hooks/useEventTracker";
import { generateRecommendationsV2 } from "../generateRecommendationsV2";

// ============================================================================
// CONSTANTS
// ============================================================================

const OBJECTIVE_LABELS: Record<string, string> = {
  productivity: "ser mais produtivo",
  health: "cuidar do corpo",
  mental: "ter mais equilíbrio",
  routine: "criar uma rotina que funcione",
  avoid: "parar com o que te trava",
};

const SELECTION_LIMITS: Record<string, number> = {
  never: 4,
  tried: 6,
  already_have: 8,
};

const BASE_MESSAGES = [
  "Olhando o que você nos contou...",
  "Encontrando os melhores momentos do dia...",
  "Separando semana do fim de semana...",
  null, // Dynamic — filled at render time
  "Sua rotina está pronta.",
];

const MESSAGE_DURATION = 800;

// ============================================================================
// HELPERS
// ============================================================================

type StepStatus = "done" | "active" | "pending";

const getStepStatus = (idx: number, messageIndex: number): StepStatus => {
  if (idx < messageIndex) return "done";
  if (idx === messageIndex) return "active";
  return "pending";
};

const AREA_LABELS: Record<string, string> = {
  health: "Saúde",
  productivity: "Foco",
  fitness: "Esporte",
  mindfulness: "Mente",
  learning: "Aprendizado",
  social: "Conexões",
  work: "Trabalho",
  physical: "Físico",
  mind: "Mente",
  relationships: "Conexões",
};

const deriveBadges = (
  wakeSleepTime: { wake: string } | null,
  lifeAreas: string[],
  habitExperience: string | null
): string[] => {
  const badges: string[] = [];
  const wake = wakeSleepTime?.wake ?? "07:00";
  if (wake < "06:30") badges.push("Madrugador");
  else if (wake < "08:30") badges.push("Matutino");
  else badges.push("Noturno");
  if (lifeAreas[0]) badges.push(AREA_LABELS[lifeAreas[0]] ?? lifeAreas[0]);
  if (habitExperience === "never") badges.push("Iniciante");
  else if (habitExperience === "already_have") badges.push("Consistente");
  else badges.push("Em progresso");
  return badges;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const S8LoadingRoutine = () => {
  const {
    quizData,
    wakeSleepTime,
    weekendDiff,
    lifeAreas,
    habitExperience,
    confirmedObjective,
    collectedName,
    generatedHabits,
    setGeneratedHabits,
    setSelectedHabitIds,
    setIsGeneratingRoutine,
    nextStep,
  } = useOnboardingV2();
  const { trackEvent } = useEventTracker();

  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasStarted = useRef(false);

  const name = quizData?.name || collectedName || "";

  // Build messages with dynamic 4th entry
  const objectiveLabel = OBJECTIVE_LABELS[confirmedObjective || ""] || "seu objetivo";
  const messages = BASE_MESSAGES.map((m) =>
    m === null ? `Ajustando para o que você quer...` : m
  );

  const badges = deriveBadges(wakeSleepTime, lifeAreas, habitExperience);

  // Smooth progress bar: 0→100 over 4000ms
  useEffect(() => {
    const duration = 4000;
    const interval = 80;
    const totalSteps = duration / interval;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setProgress(Math.min(100, Math.round((step / totalSteps) * 100)));
      if (step >= totalSteps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  // Message cycling
  useEffect(() => {
    if (messageIndex >= messages.length - 1) return;
    const timer = setTimeout(() => {
      setMessageIndex((prev) => prev + 1);
    }, MESSAGE_DURATION);
    return () => clearTimeout(timer);
  }, [messageIndex, messages.length]);

  // Main generation logic
  useEffect(() => {
    if (hasStarted.current) return;
    if (generatedHabits.length > 0) {
      nextStep();
      return;
    }
    hasStarted.current = true;

    let cancelled = false;
    const run = async () => {
      setIsGeneratingRoutine(true);

      const safeQuizData = quizData ?? {
        objective: "produtividade",
        challenges: [] as string[],
        energy_peak: "manha",
        time_available: "15min",
        profession: "",
        age_range: "25-34",
      };

      const [habits] = await Promise.all([
        Promise.resolve(
          generateRecommendationsV2({
            quizData: safeQuizData as typeof quizData & Record<string, unknown>,
            wakeSleepTime,
            weekendDiff: weekendDiff ?? "same",
            lifeAreas,
            habitExperience: habitExperience ?? "tried",
            confirmedObjective: confirmedObjective ?? "produtividade",
            profession: safeQuizData.profession || null,
          })
        ),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);

      if (cancelled) return;

      setGeneratedHabits(habits);

      const limit = SELECTION_LIMITS[habitExperience ?? "tried"] || 6;
      const autoSelected = new Set(habits.slice(0, limit).map((h) => h.id));
      setSelectedHabitIds(autoSelected);

      trackEvent("onboarding_v2_routine_generated", {
        habits_count: habits.length,
        experience: habitExperience || "",
      }, "onboarding_v2");

      setIsGeneratingRoutine(false);

      setTimeout(() => {
        if (!cancelled) nextStep();
      }, 500);
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep getStepStatus in scope (used by generation logic indirectly)
  void getStepStatus;

  return (
    <div
      className="h-[100dvh] flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#0A0A0B" }}
    >
      {/* ── Central icon ── */}
      <motion.div
        className="relative w-24 h-24 mb-10 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Ping ring */}
        <div className="absolute inset-0 bg-primary/15 rounded-full animate-ping" />
        {/* Pulse inner */}
        <div
          className="absolute inset-2 bg-primary/10 rounded-full animate-pulse"
          style={{ animationDelay: "75ms" }}
        />
        {/* Icon box */}
        <div
          className="relative z-10 w-16 h-16 rounded-2xl bg-[#0f1017] border border-primary/25 flex items-center justify-center"
          style={{ boxShadow: "0 0 32px rgba(163,230,53,0.18)" }}
        >
          <Brain className="w-8 h-8 text-primary animate-pulse" />
        </div>
        {/* Rotating arc */}
        <motion.div
          className="absolute inset-[-10px] rounded-full"
          style={{
            border: "1.5px solid transparent",
            borderTopColor: "rgba(163,230,53,0.5)",
            borderRightColor: "rgba(163,230,53,0.15)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* ── Dynamic task text ── */}
      <div className="mb-8 min-h-[60px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.h2
            key={messageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-bold text-white mb-2"
          >
            {messages[messageIndex]}
          </motion.h2>
        </AnimatePresence>
        <p className="text-sm text-white/40">
          {name ? `Montando sua rotina, ${name}` : "Montando sua rotina..."}
        </p>
      </div>

      {/* ── Progress bar ── */}
      <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-primary rounded-full"
          style={{ boxShadow: "0 0 8px rgba(163,230,53,0.45)" }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.15, ease: "linear" }}
        />
      </div>

      {/* ── Profile traits ── */}
      <AnimatePresence>
        {messageIndex >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {badges.map((badge, i) => (
              <motion.span
                key={badge}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  delay: i * 0.15,
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/25"
              >
                {badge}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
