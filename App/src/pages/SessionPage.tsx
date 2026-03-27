/**
 * SessionPage — Premium fullscreen daily session view
 * Routes: /session (standalone) or /journeys/:slug/session (journey context)
 */

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJourneyDetail, useJourneyDay } from "@/hooks/useJourney";
import { getJourneyTheme } from "@/components/JourneyIllustration";
import { useTheme } from "@/hooks/useTheme";
import { haptic } from "@/lib/haptics";

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

// ── Component ──

const SessionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const { journey, userState, loading } = useJourneyDetail(slug || "");
  const currentDay = userState?.current_day || 1;
  const { day } = useJourneyDay(slug || "", currentDay);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDarkMode ? "#000" : "#FAFAFA" }}>
        <p className={isDarkMode ? "text-white/50" : "text-gray-500"}>Selecione uma jornada para ver a sessão.</p>
      </div>
    );
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
