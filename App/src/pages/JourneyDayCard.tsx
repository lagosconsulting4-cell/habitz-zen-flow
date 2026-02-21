/**
 * JourneyDayCard — Daily content reader with interactive habits
 * Route: /journeys/:slug/day/:day
 */

import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useJourneyDay, useJourneyDetail, useJourneyHabits, useJourneyActions, CANONICAL_TO_ICON, type JourneyHabitTemplate } from "@/hooks/useJourney";
import { JourneyIllustration, getJourneyTheme } from "@/components/JourneyIllustration";
import { JourneyDaySkeleton } from "@/components/ui/skeleton";
import { HabitGlyph } from "@/components/icons/HabitGlyph";
import { useHabits } from "@/hooks/useHabits";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Simple markdown-ish renderer for card_content.
 * Handles **bold**, headers, lists, paragraphs, and callout blocks.
 */
/**
 * Mobile-friendly table renderer — turns markdown table rows into styled exercise cards.
 */
const ExerciseTable = ({
  headers,
  rows,
  themeColor,
  keyPrefix,
}: {
  headers: string[];
  rows: string[][];
  themeColor: string;
  keyPrefix: string;
}) => {
  // First column is usually "#" or index — shown in circle badge, skip from inline badges
  const numColIdx = headers.findIndex((h) => /^#$|^n[uú]m/i.test(h));
  const idxCol = numColIdx >= 0 ? numColIdx : 0;
  const nameColIdx = headers.findIndex((h) => /exerc|nome|atividade/i.test(h));
  const nameIdx = nameColIdx >= 0 ? nameColIdx : Math.min(1, headers.length - 1);
  const skipCols = new Set([idxCol, nameIdx]);

  return (
    <div className="space-y-1.5 my-2">
      {rows.map((cells, ri) => {
        const name = cells[nameIdx] || "";
        const badges = cells
          .map((c, ci) => ({ label: headers[ci], value: c }))
          .filter((_, ci) => !skipCols.has(ci) && cells[ci]?.trim());

        return (
          <div
            key={`${keyPrefix}-row-${ri}`}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-card/60"
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `${themeColor}1A`, color: themeColor }}
            >
              {cells[0]?.trim() || ri + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {renderInline(name)}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {badges.map((b, bi) => (
                  <span
                    key={bi}
                    className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/30 text-muted-foreground"
                  >
                    {b.value} <span className="opacity-50">{b.label?.toLowerCase()}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const renderContent = (content: string, themeColor: string) => {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let calloutLines: string[] = [];
  let inCallout = false;
  let calloutLabel = "";
  let tableLines: string[] = [];

  const flushCallout = () => {
    if (calloutLines.length > 0) {
      elements.push(
        <div
          key={`callout-${i}`}
          className="p-3 rounded-xl backdrop-blur-sm my-2"
          style={{
            background: `linear-gradient(135deg, ${themeColor}0D, transparent)`,
            border: `1px solid ${themeColor}1A`,
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-wider mb-1"
            style={{ color: themeColor }}
          >
            {calloutLabel}
          </p>
          {calloutLines.map((line, li) => (
            <p key={li} className="text-sm text-muted-foreground leading-relaxed">
              {renderInline(line)}
            </p>
          ))}
        </div>
      );
      calloutLines = [];
      inCallout = false;
      calloutLabel = "";
    }
  };

  const flushTable = () => {
    if (tableLines.length < 2) {
      // Not a real table, render as plain text
      tableLines.forEach((tl) => {
        elements.push(
          <p key={`tl-${i}-${elements.length}`} className="text-sm text-foreground/80 leading-relaxed">
            {tl}
          </p>
        );
      });
      tableLines = [];
      return;
    }

    const parseCells = (line: string) =>
      line.split("|").map((c) => c.trim()).filter(Boolean);

    const headers = parseCells(tableLines[0]);
    const rows: string[][] = [];

    for (let ti = 1; ti < tableLines.length; ti++) {
      const line = tableLines[ti];
      // Skip separator rows like |---|---|
      if (/^\|[\s\-:|]+\|$/.test(line)) continue;
      rows.push(parseCells(line));
    }

    if (rows.length > 0) {
      elements.push(
        <ExerciseTable
          key={`table-${i}`}
          headers={headers}
          rows={rows}
          themeColor={themeColor}
          keyPrefix={`table-${i}`}
        />
      );
    }
    tableLines = [];
  };

  for (const line of lines) {
    i++;
    const trimmed = line.trim();

    // Table line detection — accumulate while inside a table block
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (inCallout) flushCallout();
      tableLines.push(trimmed);
      continue;
    }

    // Exiting a table block — flush accumulated table lines
    if (tableLines.length > 0) flushTable();

    // Detect callout blocks (Contexto:, A ciência:, Dica:, etc.)
    const calloutMatch = trimmed.match(/^(Contexto|A ciência|Dica|Importante|Por quê|Nota)\s*:/i);
    if (calloutMatch) {
      flushCallout();
      inCallout = true;
      calloutLabel = calloutMatch[1] + ":";
      const rest = trimmed.slice(calloutMatch[0].length).trim();
      if (rest) calloutLines.push(rest);
      continue;
    }

    // Continue callout if in one and line isn't empty or a header/list
    if (inCallout && trimmed && !trimmed.startsWith("**") && !trimmed.startsWith("- ") && !trimmed.startsWith("* ") && !/^\d+\.\s/.test(trimmed)) {
      calloutLines.push(trimmed);
      continue;
    }

    // End callout
    if (inCallout) flushCallout();

    if (!trimmed) {
      elements.push(<div key={i} className="h-3" />);
      continue;
    }

    // Headers (### or **bold lines**) — with accent bar
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-foreground mt-4 mb-1.5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: themeColor }} />
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-foreground mt-4 mb-1.5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: themeColor }} />
          {trimmed.replace(/\*\*/g, "")}
        </h3>
      );
      continue;
    }

    // List items
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.slice(2);
      elements.push(
        <div key={i} className="flex gap-2.5 ml-1 mb-0.5">
          <span
            className="w-1.5 h-1.5 rounded-sm mt-2 flex-shrink-0"
            style={{ backgroundColor: themeColor }}
          />
          <p className="text-sm text-foreground/80 flex-1 leading-relaxed">{renderInline(text)}</p>
        </div>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)\./)?.[1];
      const text = trimmed.replace(/^\d+\.\s/, "");
      elements.push(
        <div key={i} className="flex gap-2 ml-1 mb-0.5">
          <span className="text-sm font-bold min-w-[1.2rem]" style={{ color: themeColor }}>{num}.</span>
          <p className="text-sm text-foreground/80 flex-1 leading-relaxed">{renderInline(text)}</p>
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm text-foreground/80 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  }

  // Flush remaining callout or table
  flushCallout();
  if (tableLines.length > 0) flushTable();

  return elements;
};

/** Inline formatting: **bold** */
const renderInline = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-foreground font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

// ============================================
// Habits Section
// ============================================
const DayHabitsSection = ({
  journeyId,
  currentDay,
  isDayCompleted,
  themeColor,
}: {
  journeyId: string;
  currentDay: number;
  isDayCompleted: boolean;
  themeColor: string;
}) => {
  const { journeyHabits } = useJourneyHabits(journeyId);
  const { habits: allHabits, getHabitCompletionStatus, toggleHabit } = useHabits();
  const { adoptHabit } = useJourneyActions();
  const { toast } = useToast();
  const [adoptingId, setAdoptingId] = useState<string | null>(null);

  // Filter to habits active on this day
  const dayHabits = useMemo(() => {
    const activeJourneyHabitIds = journeyHabits
      .filter(
        (jh) =>
          jh.is_active &&
          jh.introduced_on_day <= currentDay &&
          (!jh.expires_on_day || jh.expires_on_day >= currentDay)
      )
      .map((jh) => jh.habit_id);

    return allHabits.filter((h) => activeJourneyHabitIds.includes(h.id));
  }, [journeyHabits, allHabits, currentDay]);

  if (dayHabits.length === 0) return null;

  const completedCount = dayHabits.filter((h) => getHabitCompletionStatus(h.id)).length;

  const handleAdopt = async (habitId: string, habitName: string) => {
    setAdoptingId(habitId);
    try {
      await adoptHabit(habitId);
      toast({ title: "Hábito adotado!", description: `"${habitName}" agora faz parte da sua rotina.` });
    } catch {
      toast({ title: "Erro", description: "Não foi possível adotar o hábito.", variant: "destructive" });
    } finally {
      setAdoptingId(null);
    }
  };

  return (
    <div className="pt-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Hábitos do Dia</h3>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{dayHabits.length}
        </span>
      </div>

      {/* Progress bar — scaleX to avoid layout reflow */}
      <div className="w-full h-1.5 bg-muted/20 dark:bg-zinc-700/30 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: dayHabits.length > 0 ? completedCount / dayHabits.length : 0 }}
          transition={{ duration: 0.3 }}
          className="h-full rounded-full w-full"
          style={{ backgroundColor: themeColor, transformOrigin: "left" }}
        />
      </div>

      <div className="space-y-1.5">
        {dayHabits.map((habit) => {
          const isCompleted = getHabitCompletionStatus(habit.id);
          const canAdopt = isDayCompleted && isCompleted && habit.source === "journey";

          return (
            <div key={habit.id} className="space-y-1">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleHabit(habit.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors",
                  isCompleted
                    ? "bg-card/40 opacity-70"
                    : "bg-card/60 hover:bg-card/80"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                    isCompleted ? "text-white" : "text-muted-foreground"
                  )}
                  style={{
                    backgroundColor: isCompleted ? themeColor : `${themeColor}1A`,
                  }}
                >
                  <HabitGlyph
                    iconKey={habit.icon_key}
                    category={habit.category}
                    size="sm"
                    tone="inherit"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                    )}
                  >
                    {habit.name}
                  </p>
                  {habit.goal_value && habit.unit && (
                    <p className="text-[10px] text-muted-foreground">
                      {habit.goal_value} {habit.unit}
                    </p>
                  )}
                </div>

                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: themeColor }} />
                  </motion.div>
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
                )}
              </motion.button>

              {canAdopt && (
                <button
                  onClick={() => handleAdopt(habit.id, habit.name)}
                  disabled={adoptingId === habit.id}
                  className="ml-12 flex items-center gap-1.5 text-xs py-1 px-2 rounded-lg transition-colors hover:bg-card/60 disabled:opacity-50"
                  style={{ color: themeColor }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {adoptingId === habit.id ? "Adotando..." : "Adicionar à rotina"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// Habits Preview Section (non-interactive, for users who haven't started)
// ============================================
const DayHabitsPreviewSection = ({
  templates,
  currentDay,
  themeColor,
}: {
  templates: JourneyHabitTemplate[];
  currentDay: number;
  themeColor: string;
}) => {
  const dayTemplates = useMemo(
    () =>
      templates.filter(
        (t) => t.start_day <= currentDay && (!t.end_day || t.end_day >= currentDay)
      ),
    [templates, currentDay]
  );

  if (dayTemplates.length === 0) return null;

  return (
    <div className="mt-5 pt-4 border-t border-border/40">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Hábitos do Dia</h3>
        <span className="text-xs text-muted-foreground">
          0/{dayTemplates.length}
        </span>
      </div>

      {/* Progress bar (empty) */}
      <div className="w-full h-1.5 bg-muted/20 dark:bg-zinc-700/30 rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full w-0" style={{ backgroundColor: themeColor }} />
      </div>

      <div className="space-y-1.5">
        {dayTemplates.map((template) => {
          const iconKey = (template.canonical_key && CANONICAL_TO_ICON[template.canonical_key]) || null;

          return (
            <div
              key={template.id}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-card/60 opacity-70"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-muted-foreground"
                style={{ backgroundColor: `${themeColor}1A` }}
              >
                <HabitGlyph
                  iconKey={iconKey}
                  category={template.category}
                  size="sm"
                  tone="inherit"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {template.name}
                </p>
                {template.initial_goal_value && template.unit && template.unit !== "none" && (
                  <p className="text-[10px] text-muted-foreground">
                    {template.initial_goal_value} {template.unit}
                  </p>
                )}
              </div>

              <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// Main Component
// ============================================
const JourneyDayCard = () => {
  const { slug, day: dayParam } = useParams<{ slug: string; day: string }>();
  const navigate = useNavigate();
  const dayNumber = parseInt(dayParam || "1", 10);
  const { day, loading } = useJourneyDay(slug || "", dayNumber);
  const { journey, habitTemplates, userState, dayCompletions } = useJourneyDetail(slug || "");

  const theme = getJourneyTheme(journey?.theme_slug || journey?.illustration_key);

  const isDayCompleted = dayCompletions.includes(dayNumber);
  const hasPrev = dayNumber > 1;
  const hasNext = dayNumber < (journey?.duration_days || 30);
  const canAccessNext = userState ? dayNumber < userState.current_day : false;

  if (loading || !day) {
    return <JourneyDaySkeleton />;
  }

  return (
    <div className="pb-navbar">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate(`/journeys/${slug}`)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <span className="text-xs text-muted-foreground">
          Dia {dayNumber} de {journey?.duration_days || 30}
        </span>
      </div>

      {/* Card */}
      <motion.div
        key={dayNumber}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="mx-4 mt-2"
      >
        <div
          className={cn(
            "rounded-2xl overflow-hidden relative",
            "border backdrop-blur-sm"
          )}
          style={{
            background: 'var(--card)',
            borderColor: `${theme.color}26`,
            boxShadow: `0 4px 24px ${theme.color}0D`,
          }}
        >
          {/* Theme color stripe — gradient with light overlay */}
          <div className="h-1.5 relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{ background: theme.color }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          <div className="p-5 space-y-4">
            {/* Day header */}
            <div className="flex items-center gap-3">
              {journey && (
                <JourneyIllustration
                  illustrationKey={journey.illustration_key}
                  size="sm"
                />
              )}
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground">
                  Dia {dayNumber}: {day.title}
                </h1>
                {day.estimated_minutes && (
                  <p className="text-xs text-muted-foreground">
                    ~{day.estimated_minutes} min de leitura
                  </p>
                )}
              </div>
              {isDayCompleted && (
                <CheckCircle2 className="w-5 h-5 ml-auto flex-shrink-0" style={{ color: theme.color }} />
              )}
            </div>

            {/* Badges */}
            {(day.is_rest_day || day.is_review_day || day.is_cliff_day) && (
              <div className="flex gap-2">
                {day.is_rest_day && (
                  <span className="text-xs px-2 py-1 rounded-full bg-muted/20 text-muted-foreground">
                    Dia de descanso
                  </span>
                )}
                {day.is_review_day && (
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${theme.color}1A`, color: theme.color }}
                  >
                    Review semanal
                  </span>
                )}
                {day.is_cliff_day && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">
                    Zona de desafio
                  </span>
                )}
              </div>
            )}

            {/* Motivational note (cliff days) */}
            {day.motivational_note && (
              <div className="flex gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-400/80 italic">{day.motivational_note}</p>
              </div>
            )}

            {/* Habits section — above content for prominence */}
            {journey && userState && dayNumber <= userState.current_day ? (
              <DayHabitsSection
                journeyId={journey.id}
                currentDay={dayNumber}
                isDayCompleted={isDayCompleted}
                themeColor={theme.color}
              />
            ) : journey && habitTemplates.length > 0 && (
              <DayHabitsPreviewSection
                templates={habitTemplates}
                currentDay={dayNumber}
                themeColor={theme.color}
              />
            )}

            {/* Content */}
            <div className="space-y-1">{renderContent(day.card_content, theme.color)}</div>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
        className="px-4 mt-4 flex gap-2"
      >
        <Button
          variant="outline"
          onClick={() => navigate(`/journeys/${slug}/day/${dayNumber - 1}`)}
          disabled={!hasPrev}
          className="flex-1 h-11 rounded-xl"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Dia {dayNumber - 1}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/journeys/${slug}/day/${dayNumber + 1}`)}
          disabled={!hasNext || !canAccessNext}
          className="flex-1 h-11 rounded-xl"
        >
          Dia {dayNumber + 1}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </motion.div>
    </div>
  );
};

export default JourneyDayCard;
