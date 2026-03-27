/**
 * SessionPage — Premium fullscreen daily session view
 * Routes: /session (standalone daily session) or /journeys/:slug/session (journey context)
 */

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Dumbbell,
  FlaskConical,
  Lightbulb,
  Utensils,
  CalendarDays,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJourneyDetail, useJourneyDay } from "@/hooks/useJourney";
import { getJourneyTheme } from "@/components/JourneyIllustration";
import { useTheme } from "@/hooks/useTheme";
import { haptic } from "@/lib/haptics";
import { useHabits, type Habit } from "@/hooks/useHabits";
import { useTimer } from "@/hooks/useTimer";

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const BASE = import.meta.env.BASE_URL;
const JOURNEY_COVERS: Record<string, string> = {
  "digital-detox-l1": `${BASE}backgrounds/arte9.webp`,
  "own-mornings-l1": `${BASE}backgrounds/arte8.webp`,
  "gym-l1": `${BASE}backgrounds/arte11.webp`,
  "focus-protocol-l1": `${BASE}backgrounds/arte5.webp`,
  "finances-l1": `${BASE}backgrounds/arte2.webp`,
  "digital-detox-l2": `${BASE}backgrounds/arte1.webp`,
  "own-mornings-l2": `${BASE}backgrounds/arte3.webp`,
  "gym-l2": `${BASE}backgrounds/arte12.webp`,
  "focus-protocol-l2": `${BASE}backgrounds/arte7.webp`,
  "finances-l2": `${BASE}backgrounds/arte10.webp`,
};

// ── Parsers ──

interface Exercise {
  number: string;
  name: string;
  details: string; // "2 séries • 12 reps • 60s descanso"
}

interface ContentBlock {
  type: "heading" | "callout" | "tip" | "text" | "task" | "list";
  title?: string;
  body?: string;
  icon?: "food" | "calendar" | "tip" | "science" | "task";
  items?: string[];
  taskNumber?: string;
}

function parseSessionContent(content: string): {
  title: string | null;
  exercises: Exercise[];
  blocks: ContentBlock[];
} {
  const lines = content.split("\n");
  let title: string | null = null;
  const exercises: Exercise[] = [];
  const blocks: ContentBlock[] = [];
  let tableHeaders: string[] = [];
  let inTable = false;
  let calloutLabel = "";
  let calloutLines: string[] = [];
  let currentText: string[] = [];
  let listItems: string[] = [];

  const flushText = () => {
    if (currentText.length > 0) {
      const joined = currentText.join(" ").trim();
      if (joined) blocks.push({ type: "text", body: joined });
      currentText = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: [...listItems] });
      listItems = [];
    }
  };

  const flushCallout = () => {
    if (calloutLines.length > 0) {
      const label = calloutLabel.toLowerCase();
      const icon = label.includes("dica") ? "tip" as const
        : label.includes("ciência") || label.includes("ciencia") ? "science" as const
        : label.includes("refei") || label.includes("nutri") ? "food" as const
        : label.includes("agenda") || label.includes("cronograma") ? "calendar" as const
        : "tip" as const;
      blocks.push({
        type: label.includes("dica") ? "tip" : "callout",
        title: calloutLabel.replace(/:$/, ""),
        body: calloutLines.join(" ").trim(),
        icon,
      });
      calloutLines = [];
      calloutLabel = "";
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // ── Table detection ──
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushText(); flushList();
      const cells = trimmed.split("|").map((c) => c.trim()).filter(Boolean);
      if (!inTable) { inTable = true; tableHeaders = cells; continue; }
      if (/^[\s\-:|]+$/.test(cells.join(""))) continue;
      const numIdx = tableHeaders.findIndex((h) => /^#$|^n[uú]m/i.test(h));
      const nameIdx = tableHeaders.findIndex((h) => /exerc|nome|atividade/i.test(h));
      const num = cells[numIdx >= 0 ? numIdx : 0] || String(exercises.length + 1);
      const name = cells[nameIdx >= 0 ? nameIdx : Math.min(1, cells.length - 1)] || "";
      const detailParts = cells
        .map((c, i) => ({ header: tableHeaders[i], value: c }))
        .filter((_, i) => i !== (numIdx >= 0 ? numIdx : 0) && i !== (nameIdx >= 0 ? nameIdx : Math.min(1, cells.length - 1)))
        .filter((d) => d.value?.trim())
        .map((d) => d.value);
      exercises.push({ number: num, name, details: detailParts.join(" • ") });
      continue;
    }
    if (inTable) { inTable = false; tableHeaders = []; }

    // ── Title detection (TREINO, PROTOCOLO, ROTINA, DIAGNÓSTICO, etc.) ──
    if (!title) {
      if (/^\*\*.*(TREINO|PROTOCOLO|ROTINA|DIAGNÓSTICO|SESSÃO|BLOCO|DESAFIO).*\*\*$/i.test(trimmed)) {
        title = trimmed.replace(/\*\*/g, "");
        continue;
      }
      if (/^###?\s+.*(TREINO|PROTOCOLO|ROTINA)/i.test(trimmed)) {
        title = trimmed.replace(/^#+\s*/, "");
        continue;
      }
    }

    // ── **NOVO — Label:** body (inline callout) ──
    const novoMatch = trimmed.match(/^\*\*NOVO\s*[—–-]\s*([^*]+?):\*\*\s*(.+)/i);
    if (novoMatch) {
      flushText(); flushList(); flushCallout();
      const label = novoMatch[1].trim();
      const body = novoMatch[2].trim();
      const icon = /refei|nutri|pós-treino|alimenta|comer|proteín/i.test(label) ? "food" as const
        : /agenda|cronograma|planej|seman/i.test(label) ? "calendar" as const
        : "tip" as const;
      blocks.push({ type: "callout", title: label, body, icon });
      continue;
    }

    // ── **Dica:** body (inline tip) ──
    const dicaMatch = trimmed.match(/^\*\*Dica:\*\*\s*(.+)/i);
    if (dicaMatch) {
      flushText(); flushList(); flushCallout();
      blocks.push({ type: "tip", title: "Dica", body: dicaMatch[1].trim() });
      continue;
    }

    // ── **Tarefa N — Label:** body (task block) ──
    const taskMatch = trimmed.match(/^\*\*(Tarefa\s*\d*|Exercício|Na noite anterior|Sem celular|Preparar)\s*[—–-]?\s*([^*]*?):\*\*\s*(.*)/i);
    if (taskMatch) {
      flushText(); flushList(); flushCallout();
      const taskLabel = taskMatch[1].trim();
      const taskTitle = taskMatch[2].trim() || taskLabel;
      const taskBody = taskMatch[3].trim();
      const numMatch = taskLabel.match(/\d+/);
      blocks.push({
        type: "task",
        title: taskTitle || taskLabel,
        body: taskBody,
        taskNumber: numMatch ? numMatch[0] : undefined,
      });
      continue;
    }

    // ── **Bold label:** body (inline bold with colon — generic task/instruction) ──
    const boldInlineMatch = trimmed.match(/^\*\*([^*]{3,50}):\*\*\s+(.+)/);
    if (boldInlineMatch) {
      flushText(); flushList(); flushCallout();
      const label = boldInlineMatch[1].trim();
      const body = boldInlineMatch[2].trim();
      // Detect known callout types
      if (/contexto|ciência|ciencia|importante|por qu[eê]/i.test(label)) {
        blocks.push({ type: "callout", title: label, body, icon: /ciência|ciencia/i.test(label) ? "science" : "tip" });
      } else {
        blocks.push({ type: "task", title: label, body });
      }
      continue;
    }

    // ── Standalone **Bold Headers** ──
    if (/^\*\*[^*]+\*\*$/.test(trimmed) && trimmed.length < 100) {
      flushText(); flushList(); flushCallout();
      const heading = trimmed.replace(/\*\*/g, "");
      if (/refei|nutri|pós-treino|alimenta/i.test(heading)) { calloutLabel = heading; continue; }
      if (/agenda|cronograma|planej/i.test(heading)) { calloutLabel = heading; continue; }
      if (/contexto|ciência|importante/i.test(heading)) { calloutLabel = heading; continue; }
      blocks.push({ type: "heading", title: heading });
      continue;
    }

    // ── Multi-line callout labels ──
    const calloutMatchLine = trimmed.match(/^(Contexto|A ciência|Dica|Importante|Por quê|Nota|Movimentação leve|O que esperar)\s*:/i);
    if (calloutMatchLine) {
      flushText(); flushList(); flushCallout();
      calloutLabel = calloutMatchLine[1] + ":";
      const rest = trimmed.slice(calloutMatchLine[0].length).trim();
      if (rest) calloutLines.push(rest);
      continue;
    }

    if (calloutLabel) {
      calloutLines.push(trimmed.replace(/\*\*/g, ""));
      continue;
    }

    // ── Numbered list items (1. text, 2. text) ──
    const numListMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numListMatch) {
      flushText();
      listItems.push(numListMatch[2].replace(/\*\*/g, ""));
      continue;
    }

    // ── Bulleted list items (- text, • text) ──
    const bulletMatch = trimmed.match(/^[-•]\s+(.+)/);
    if (bulletMatch) {
      flushText();
      listItems.push(bulletMatch[1].replace(/\*\*/g, ""));
      continue;
    }

    // ── Regular text ──
    flushList();
    currentText.push(trimmed.replace(/\*\*/g, ""));
  }
  flushText();
  flushList();
  flushCallout();

  return { title, exercises, blocks };
}

// ── Daily Session Components ──

function getPeriodInfo() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  // Morning starts at 06:00, not midnight
  const period: "morning" | "afternoon" | "evening" =
    h < 6 ? "evening" : h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
  const startH = h < 6 ? 0 : h < 12 ? 6 : h < 18 ? 12 : 18;
  const endH = h < 6 ? 6 : h < 12 ? 12 : h < 18 ? 18 : 24;
  return {
    period,
    remainingSeconds: Math.max(0, endH * 3600 - (h * 3600 + m * 60 + s)),
    startH,
    endH,
  };
}

function getPeriodElapsedPct(startH: number, endH: number): number {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  const total = (endH - startH) * 3600;
  const elapsed = Math.max(0, h * 3600 + m * 60 + s - startH * 3600);
  return Math.min(100, (elapsed / total) * 100);
}

function SessionTimerRing({
  progress,
  size = 240,
  isDark,
  children,
}: {
  progress: number;
  size?: number;
  isDark: boolean;
  children: React.ReactNode;
}) {
  const strokeWidth = 2;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // progress = % of period elapsed → ring fills clockwise as time passes
  // offset = circumference - (progress/100 * circumference) means ring shrinks as progress grows
  // We want: progress=0 → ring empty, progress=100 → ring full
  // But visually we want: at start of period ring is almost empty (little elapsed)
  // and grows as period progresses, gap = remaining
  const offset = circumference - (progress / 100) * circumference;
  const ringColor = isDark ? "#a3e635" : "#65a30d";
  const trackColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <defs>
          <filter id="session-ring-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={isDark ? 6 : 3} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} stroke={trackColor} />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          stroke={ringColor}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={isDark ? "url(#session-ring-glow)" : undefined}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

const DailySessionView = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { period, remainingSeconds, startH, endH } = useMemo(() => getPeriodInfo(), []);

  // Ring progress: reflects how much of the PERIOD has elapsed (updates every second)
  const [ringProgress, setRingProgress] = useState(() => getPeriodElapsedPct(startH, endH));
  useEffect(() => {
    const id = setInterval(() => setRingProgress(getPeriodElapsedPct(startH, endH)), 1000);
    return () => clearInterval(id);
  }, [startH, endH]);

  // Timer: used only for the countdown text display
  const { formattedRemaining } = useTimer({ targetSeconds: remainingSeconds, autoStart: true });

  const { habits, toggleHabit, completions } = useHabits();

  const completedIds = useMemo(
    () => new Set(completions.map((c) => c.habit_id)),
    [completions]
  );

  // Todos os hábitos ativos do dia (todos os períodos), ordenados por horário
  const allDayHabits = useMemo(() => {
    const todayDow = new Date().getDay();
    return habits
      .filter(
        (h) =>
          h.is_active &&
          (h.days_of_week.length === 0 || h.days_of_week.includes(todayDow))
      )
      .sort((a, b) => {
        const ta = a.reminder_time ?? "99:99";
        const tb = b.reminder_time ?? "99:99";
        return ta.localeCompare(tb);
      });
  }, [habits]);

  const PERIOD_ORDER = ["morning", "afternoon", "evening"] as const;
  const PERIOD_LABELS: Record<string, string> = { morning: "Manhã", afternoon: "Tarde", evening: "Noite" };

  // Agrupado por período; concluídos primeiro dentro de cada grupo
  const groupedHabits = useMemo(() => {
    return PERIOD_ORDER
      .map((p) => ({
        period: p,
        label: PERIOD_LABELS[p],
        habits: allDayHabits
          .filter((h) => h.period === p)
          .sort((a, b) => (completedIds.has(a.id) ? 0 : 1) - (completedIds.has(b.id) ? 0 : 1)),
      }))
      .filter((g) => g.habits.length > 0);
  }, [allDayHabits, completedIds]);

  const pendingHabits = allDayHabits.filter((h) => !completedIds.has(h.id));
  const allDone = pendingHabits.length === 0 && allDayHabits.length > 0;

  const getStatus = (habit: Habit) => {
    if (completedIds.has(habit.id)) return "done" as const;
    const idx = pendingHabits.findIndex((h) => h.id === habit.id);
    if (idx === 0) return "ongoing" as const;
    if (idx === 1) return "upnext" as const;
    return "later" as const;
  };

  const formatTime = (t: string | null | undefined) => t ? t.slice(0, 5) : null;

  const statusLabel = (status: ReturnType<typeof getStatus>, habit: Habit) => {
    if (status === "done") return habit.goal_value ? `${habit.goal_value} ${habit.unit ?? ""}`.trim() : "Concluído";
    if (status === "ongoing") return "Em Andamento";
    if (status === "upnext") return "Próximo";
    return "Pendente";
  };

  // Theme colors
  const bg = isDark ? "#000" : "#F5F5F5";
  // Card neutro (concluído, próximo, pendente)
  const cardNeutralBg     = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const cardNeutralBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  // Card em andamento (destaque)
  const cardOngoingBg     = isDark ? "rgba(255,255,255,0.10)" : "rgba(101,163,13,0.08)";
  const cardOngoingBorder = isDark ? "rgba(163,230,53,0.25)"  : "rgba(101,163,13,0.22)";
  const textPrimary = isDark ? "#ffffff" : "#111111";
  const textDimmed = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const textMuted = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
  const ringAccent = isDark ? "#a3e635" : "#65a30d";
  const closeButtonBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
  const closeIconColor = isDark ? "#ffffff" : "#111111";

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: bg, paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors active:scale-95"
        style={{ top: "calc(1rem + env(safe-area-inset-top, 0px))", backgroundColor: closeButtonBg }}
      >
        <X className="h-5 w-5" style={{ color: closeIconColor }} />
      </button>

      {/* Timer ring */}
      <div className="flex items-center justify-center pt-16 pb-8">
        <SessionTimerRing progress={ringProgress} size={240} isDark={isDark}>
          <div className="text-center select-none">
            <p className="text-6xl font-bold tracking-tight tabular-nums" style={{ color: textPrimary }}>
              {formattedRemaining}
            </p>
            <p className="text-[11px] tracking-[0.22em] uppercase mt-1.5 flex items-center justify-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ringAccent }} />
              <span style={{ color: isDark ? "rgba(163,230,53,0.6)" : "#65a30d" }}>Restante</span>
            </p>
          </div>
        </SessionTimerRing>
      </div>

      {/* Lista de hábitos agrupada por período */}
      <div className="flex-1 px-4 overflow-y-auto pb-4">
        {allDayHabits.length === 0 && (
          <p className="text-center text-sm pt-8" style={{ color: textMuted }}>
            Nenhum hábito para hoje.
          </p>
        )}
        {groupedHabits.map((group) => (
          <div key={group.period} className="mb-4">
            {/* Cabeçalho do período */}
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-2 px-1" style={{ color: textMuted }}>
              {group.label}
            </p>
            <div className="space-y-2">
              {group.habits.map((habit, i) => {
                const status = getStatus(habit);
                const isDone = status === "done";
                const isOngoing = status === "ongoing";
                const timeLabel = formatTime(habit.reminder_time);

                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => {
                      if (isDone) return;
                      haptic.light();
                      toggleHabit(habit.id);
                    }}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-150",
                      !isDone && "cursor-pointer active:scale-[0.98]",
                      isDone && "cursor-default",
                    )}
                    style={{
                      backgroundColor: isOngoing ? cardOngoingBg : cardNeutralBg,
                      border: `1px solid ${isOngoing ? cardOngoingBorder : cardNeutralBorder}`,
                    }}
                  >
                    {/* Círculo de status */}
                    <div className="flex-shrink-0">
                      {isDone ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: ringAccent }}>
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" style={{ color: "#000" }} />
                        </div>
                      ) : (
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2"
                          style={{ borderColor: isOngoing ? ringAccent : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }}
                        >
                          {isOngoing && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ringAccent }} />}
                        </div>
                      )}
                    </div>

                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight" style={{
                        color: isDone ? textMuted : isOngoing ? textPrimary : isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
                        textDecoration: isDone ? "line-through" : "none",
                      }}>
                        {habit.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{
                        color: isOngoing ? ringAccent : isDone ? textMuted : isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                      }}>
                        {statusLabel(status, habit)}
                      </p>
                    </div>

                    {/* Horário + chevron */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {timeLabel && (
                        <span className="text-xs tabular-nums" style={{ color: textMuted }}>
                          {timeLabel}
                        </span>
                      )}
                      {isOngoing && <ChevronRight className="h-4 w-4" style={{ color: textMuted }} />}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        className="px-5 pt-4"
        style={{ paddingBottom: "max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom, 0px)))" }}
      >
        <button
          disabled={allDone || pendingHabits.length === 0}
          onClick={() => {
            if (pendingHabits[0]) { haptic.success(); toggleHabit(pendingHabits[0].id); }
          }}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold tracking-wide transition-all duration-200 active:scale-[0.98]"
          style={allDone ? {
            background: isDark ? "rgba(163,230,53,0.12)" : "rgba(101,163,13,0.12)",
            color: isDark ? "rgba(163,230,53,0.4)" : "rgba(101,163,13,0.5)",
          } : {
            background: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
            color: "#000",
            boxShadow: "0 0 28px rgba(163,230,53,0.45), 0 4px 20px rgba(163,230,53,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          {allDone ? "Sessão Completa! 🎉" : (
            <><Zap className="h-5 w-5 fill-current" /> Concluir Tarefa</>
          )}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="mt-5 w-full text-center text-[11px] tracking-[0.2em] uppercase transition-colors"
          style={{ color: textMuted }}
        >
          Encerrar Sessão
        </button>
      </div>
    </div>
  );
};

// ── Main Component ──

const SessionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const { journey, userState, loading } = useJourneyDetail(slug || "");
  const currentDay = userState?.current_day || 1;
  const { day } = useJourneyDay(slug || "", currentDay);

  // ── Standalone daily session (no journey context) ──
  if (!slug) {
    return <DailySessionView />;
  }

  if (loading || !journey || !day) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDarkMode ? "#000" : "#FAFAFA" }}>
        <div className="animate-pulse text-muted-foreground">Carregando sessão...</div>
      </div>
    );
  }

  const theme = getJourneyTheme(journey.theme_slug || journey.illustration_key);
  const coverImage = JOURNEY_COVERS[journey.slug] || theme.backgroundImage;
  const parsed = parseSessionContent(day.card_content);
  const sessionTitle = parsed.title || day.title;

  const cardStyle = {
    backgroundColor: isDarkMode ? "rgb(28, 28, 28)" : "rgb(249, 250, 251)",
    border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
  };
  const glowCardStyle = {
    ...cardStyle,
    border: `1px solid ${hexToRgba(theme.color, 0.3)}`,
    boxShadow: isDarkMode ? `0 0 16px ${hexToRgba(theme.color, 0.08)}` : `0 0 12px ${hexToRgba(theme.color, 0.06)}`,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
      style={{ backgroundColor: isDarkMode ? "#000" : "#FAFAFA" }}
    >
      {/* ── Hero ── */}
      <div className="relative" style={{ height: "calc(38vh + 1rem + env(safe-area-inset-top, 0px))", marginLeft: "-1rem", marginRight: "-1rem", marginTop: "calc(-1rem - env(safe-area-inset-top, 0px))" }}>
        {coverImage && <img src={coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        {/* Green glow overlay at edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDarkMode
              ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)"
              : "linear-gradient(to top, rgba(250,250,250,1) 0%, rgba(250,250,250,0.3) 50%, transparent 100%)",
          }}
        />
        {/* Subtle green ambient glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 pointer-events-none"
          style={{
            background: isDarkMode
              ? `radial-gradient(ellipse at center bottom, ${hexToRgba(theme.color, 0.06)} 0%, transparent 70%)`
              : "none",
          }}
        />

        {/* Top bar */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 z-10"
          style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
        >
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <span className="text-sm font-semibold text-white">Daily Session</span>
          <div className="w-10" />
        </div>

        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          {day.estimated_minutes && (
            <span
              className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-3"
              style={{
                backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.15 : 0.12),
                color: theme.color,
                boxShadow: isDarkMode ? `0 0 12px ${hexToRgba(theme.color, 0.1)}` : "none",
              }}
            >
              {day.estimated_minutes} MIN SESSION
            </span>
          )}
          <h1 className={cn("text-2xl font-bold leading-tight", isDarkMode ? "text-white" : "text-gray-900")}>
            {sessionTitle}
          </h1>
        </div>
      </div>

      {/* ── Stats pills ── */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          {journey.tags.slice(0, 1).map((tag) => (
            <div key={tag} className="flex-1 rounded-xl py-3 text-center" style={cardStyle}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>FOCO</p>
              <p className={cn("text-sm font-bold mt-0.5 capitalize", isDarkMode ? "text-white" : "text-gray-900")}>{tag}</p>
            </div>
          ))}
          {parsed.exercises.length > 0 && (
            <div className="flex-1 rounded-xl py-3 text-center" style={cardStyle}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>ITENS</p>
              <p className={cn("text-sm font-bold mt-0.5", isDarkMode ? "text-white" : "text-gray-900")}>{parsed.exercises.length} Ex</p>
            </div>
          )}
          <div className="flex-1 rounded-xl py-3 text-center" style={cardStyle}>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>NÍVEL</p>
            <p className={cn("text-sm font-bold mt-0.5", isDarkMode ? "text-white" : "text-gray-900")}>
              {journey.level === 1 ? "Iniciante" : "Avançado"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Exercise List ── */}
      {parsed.exercises.length > 0 && (
        <div className="px-5 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: theme.color }} />
            <p className={cn("text-base font-bold", isDarkMode ? "text-white" : "text-gray-900")}>Lista de Exercícios</p>
          </div>

          {parsed.exercises.map((ex, i) => {
            const isLast = i === parsed.exercises.length - 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center gap-4 rounded-xl px-4 py-4"
                style={isLast ? glowCardStyle : cardStyle}
              >
                {/* Icon */}
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.12 : 0.1),
                    boxShadow: isLast ? (isDarkMode ? `0 0 10px ${hexToRgba(theme.color, 0.15)}` : "none") : "none",
                  }}
                >
                  <Dumbbell className="h-5 w-5" style={{ color: theme.color }} />
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                    {ex.number}. {ex.name}
                  </p>
                  {ex.details && (
                    <p className="text-xs mt-0.5" style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                      {ex.details}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0" style={{ color: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }} />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Content Blocks (callouts, tips, etc.) ── */}
      <div className="px-5 pt-6 space-y-4">
        {parsed.blocks.map((block, i) => {
          if (block.type === "heading") {
            return (
              <p key={i} className={cn("text-base font-bold pt-2", isDarkMode ? "text-white" : "text-gray-900")}>
                {block.title}
              </p>
            );
          }

          if (block.type === "callout") {
            const IconComponent = block.icon === "food" ? Utensils : block.icon === "calendar" ? CalendarDays : block.icon === "science" ? FlaskConical : Lightbulb;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{
                  ...cardStyle,
                  boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)" : cardStyle.border,
                }}
              >
                {/* NOVO badge */}
                <span
                  className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-3"
                  style={{
                    backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.15 : 0.12),
                    color: theme.color,
                  }}
                >
                  NOVO
                </span>
                {/* Icon top-right */}
                <div className="absolute top-5 right-5">
                  <IconComponent className="h-6 w-6" style={{ color: isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)" }} />
                </div>
                <p className={cn("text-lg font-bold mb-2", isDarkMode ? "text-white" : "text-gray-900")}>
                  {block.title}
                </p>
                {block.body && (
                  <p className="text-sm leading-relaxed" style={{ color: isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                    {block.body}
                  </p>
                )}
                {block.icon === "calendar" && (
                  <button
                    className="mt-4 rounded-xl py-2.5 px-5 text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                      color: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                      border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                    }}
                  >
                    Configurar Cronograma
                  </button>
                )}
              </motion.div>
            );
          }

          if (block.type === "tip") {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.06 : 0.05),
                  border: `1px solid ${hexToRgba(theme.color, isDarkMode ? 0.15 : 0.12)}`,
                  boxShadow: isDarkMode ? `0 0 20px ${hexToRgba(theme.color, 0.04)}` : "none",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full mt-0.5"
                    style={{ backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.15 : 0.12) }}
                  >
                    <Lightbulb className="h-4 w-4" style={{ color: theme.color }} />
                  </div>
                  <p className="text-sm leading-relaxed italic" style={{ color: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }}>
                    <strong className={isDarkMode ? "text-white" : "text-gray-900"}>Dica: </strong>
                    {block.body}
                  </p>
                </div>
              </motion.div>
            );
          }

          if (block.type === "task") {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 rounded-xl px-4 py-4"
                style={cardStyle}
              >
                {/* Numbered badge */}
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.12 : 0.1),
                  }}
                >
                  {block.taskNumber ? (
                    <span className="text-sm font-bold" style={{ color: theme.color }}>
                      {block.taskNumber}
                    </span>
                  ) : (
                    <Check className="h-5 w-5" style={{ color: theme.color }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                    {block.title}
                  </p>
                  {block.body && (
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: isDarkMode ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
                      {block.body}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          }

          if (block.type === "list" && block.items && block.items.length > 0) {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl px-5 py-4 space-y-2.5"
                style={cardStyle}
              >
                {block.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full mt-0.5"
                      style={{ backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.15 : 0.1) }}
                    >
                      <span className="text-[9px] font-bold" style={{ color: theme.color }}>
                        {idx + 1}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                      {item}
                    </p>
                  </div>
                ))}
              </motion.div>
            );
          }

          if (block.type === "text" && block.body) {
            return (
              <p key={i} className="text-sm leading-relaxed" style={{ color: isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                {block.body}
              </p>
            );
          }

          return null;
        })}
      </div>

      {/* ── Motivational note ── */}
      {day.motivational_note && !parsed.blocks.some((b) => b.type === "tip") && (
        <div className="px-5 pt-4">
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.06 : 0.05),
              border: `1px solid ${hexToRgba(theme.color, isDarkMode ? 0.15 : 0.12)}`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full mt-0.5"
                style={{ backgroundColor: hexToRgba(theme.color, isDarkMode ? 0.15 : 0.12) }}
              >
                <Lightbulb className="h-4 w-4" style={{ color: theme.color }} />
              </div>
              <p className="text-sm leading-relaxed italic" style={{ color: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }}>
                <strong className={isDarkMode ? "text-white" : "text-gray-900"}>Dica: </strong>
                {day.motivational_note}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── CTA with glow ── */}
      <div
        className="px-5 pt-8"
        style={{ paddingBottom: "max(2rem, calc(2rem + env(safe-area-inset-bottom)))" }}
      >
        <div
          className="rounded-full p-[2px]"
          style={{
            background: isDarkMode
              ? `linear-gradient(135deg, ${hexToRgba(theme.color, 0.4)}, ${hexToRgba(theme.color, 0.2)}, ${hexToRgba(theme.color, 0.4)})`
              : "transparent",
            boxShadow: isDarkMode ? `0 0 24px ${hexToRgba(theme.color, 0.15)}` : "none",
          }}
        >
          <button
            onClick={() => { haptic.success(); navigate(`/journeys/${slug}`); }}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold uppercase tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #A3E635 0%, #84CC16 100%)",
              color: "#000",
              boxShadow: "0 0 30px rgba(163,230,53,0.3), 0 4px 16px rgba(163,230,53,0.2)",
            }}
          >
            CONCLUIR TREINO
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SessionPage;
