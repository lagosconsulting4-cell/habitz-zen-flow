import { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Check, ChevronLeft, Sunrise, Sun, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitGlyph } from "@/components/icons/HabitGlyph";
import { useOnboardingV2 } from "../OnboardingProviderV2";
import type { RecommendedHabitV2 } from "../generateRecommendationsV2";

// ============================================================================
// CONSTANTS
// ============================================================================

// Micro-tags: map recommendation_sources entries to readable Portuguese labels
const SOURCE_LABELS: Record<string, string> = {
  "objective:productivity": "foco",
  "objective:health":       "saúde",
  "objective:mental":       "equilíbrio",
  "objective:routine":      "consistência",
  "objective:avoid":        "liberdade do celular",
  "challenge:procrastination": "procrastinação",
  "challenge:focus":        "foco",
  "challenge:anxiety":      "ansiedade",
  "challenge:tiredness":    "energia",
  "challenge:motivation":   "motivação",
  "challenge:forgetfulness":"memória",
  "area:work":              "trabalho",
  "area:physical":          "saúde física",
  "area:mind":              "mente",
  "area:relationships":     "relações",
  "profession:entrepreneur":"empreendedores",
  "profession:student":     "estudantes",
  "profession:employed":    "rotina CLT",
  "profession:clt":         "rotina CLT",
};

function getHabitTag(sources: string[]): string | null {
  // Prefer challenge > area > objective
  const priority = ["challenge:", "area:", "profession:", "objective:"];
  for (const prefix of priority) {
    const found = sources.find(s => s.startsWith(prefix));
    if (found && SOURCE_LABELS[found]) return SOURCE_LABELS[found];
  }
  return null;
}

const PERIOD_CONFIG: Record<string, { label: string; Icon: LucideIcon; dot: string }> = {
  morning:   { label: "Manhã",  Icon: Sunrise, dot: "bg-amber-400"  },
  afternoon: { label: "Tarde",  Icon: Sun,     dot: "bg-orange-400" },
  evening:   { label: "Noite",  Icon: Moon,    dot: "bg-indigo-400" },
};

type Period = keyof typeof PERIOD_CONFIG;
type Tab = "weekday" | "weekend";

// Frases curtas por objetivo — header editorial
const OBJECTIVE_PHRASE: Record<string, string> = {
  productivity: "ter mais foco",
  health:       "cuidar do corpo",
  mental:       "ter mais equilíbrio",
  routine:      "criar consistência",
  avoid:        "se libertar das distrações",
};

// ============================================================================
// DENSITY SYSTEM
// ============================================================================

const DENSITY_STYLES = {
  normal:  { cardPy: "py-2.5", handlePy: "py-3",   cardGap: "space-y-1.5", groupGap: "space-y-4", nameSize: "text-sm",  timeSize: "text-xs",     iconSize: "md" as const },
  compact: { cardPy: "py-1.5", handlePy: "py-2",   cardGap: "space-y-1",   groupGap: "space-y-3", nameSize: "text-sm",  timeSize: "text-xs",     iconSize: "sm" as const },
  dense:   { cardPy: "py-1",   handlePy: "py-1.5", cardGap: "space-y-0.5", groupGap: "space-y-2", nameSize: "text-xs",  timeSize: "text-[10px]", iconSize: "sm" as const },
};

type DensityStyles = typeof DENSITY_STYLES.normal;

// ============================================================================
// SORTABLE HABIT CARD — redesigned selection state
// ============================================================================

interface HabitCardProps {
  habit: RecommendedHabitV2;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  showWeekendTime?: boolean;
  ds: DensityStyles;
}

function SortableHabitCard({ habit, selected, disabled, onToggle, showWeekendTime, ds }: HabitCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const time = showWeekendTime && habit.weekend_time ? habit.weekend_time : habit.suggested_time;
  const duration = showWeekendTime && habit.weekend_duration ? habit.weekend_duration : habit.duration;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center rounded-xl border transition-all duration-200 overflow-hidden",
        selected
          ? "border-primary/50 bg-primary/8 shadow-[0_0_0_1px_hsl(var(--primary)/0.15),inset_3px_0_0_hsl(var(--primary))]"
          : "border-border/50 bg-card/50",
        isDragging && "opacity-60 shadow-lg z-10 scale-[1.01]",
        disabled && !selected && "opacity-35 pointer-events-none",
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "touch-none pl-3 text-transparent group-hover:text-muted-foreground/30 focus-visible:text-muted-foreground/40 cursor-grab active:cursor-grabbing shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm transition-colors self-stretch flex items-center min-h-[44px]",
          selected && "group-hover:text-primary/30",
        )}
        tabIndex={0}
        aria-label={`Reordenar ${habit.name}`}
      >
        <GripVertical size={16} />
      </button>

      {/* Clickable area */}
      <button
        onClick={onToggle}
        disabled={disabled && !selected}
        className={cn(
          "flex-1 flex items-center gap-3 px-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
          ds.cardPy,
        )}
        aria-label={selected ? `Remover ${habit.name} da rotina` : `Adicionar ${habit.name} de volta`}
      >
        {/* Icon */}
        <div className="shrink-0">
          <HabitGlyph
            iconKey={habit.icon_key}
            category={habit.category}
            size={ds.iconSize}
            tone={selected ? "lime" : "gray"}
            fallbackLabel={habit.icon}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            ds.nameSize,
            "font-medium truncate transition-colors duration-150",
            selected ? "text-foreground" : "text-muted-foreground",
          )}>
            {habit.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <p className={cn(ds.timeSize, "text-muted-foreground/50")}>
              {time} · {duration}min
            </p>
            {(() => {
              const tag = getHabitTag(habit.recommendation_sources || []);
              return tag ? (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/70 font-medium leading-none">
                  {tag}
                </span>
              ) : null;
            })()}
          </div>
        </div>

        {/* Check */}
        <span
          className={cn(
            "shrink-0 w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center transition-all duration-150",
            selected
              ? "bg-primary border-primary"
              : "border-muted-foreground/25",
          )}
        >
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <Check size={11} strokeWidth={3} className="text-primary-foreground" />
            </motion.div>
          )}
        </span>
      </button>
    </div>
  );
}

// ============================================================================
// PERIOD GROUP — editorial header style
// ============================================================================

interface PeriodGroupProps {
  period: Period;
  habits: RecommendedHabitV2[];
  selectedIds: Set<string>;
  isAtLimit: boolean;
  onToggle: (id: string) => void;
  showWeekendTime: boolean;
  ds: DensityStyles;
}

function PeriodGroup({ period, habits, selectedIds, isAtLimit, onToggle, showWeekendTime, ds }: PeriodGroupProps) {
  if (habits.length === 0) return null;

  const config = PERIOD_CONFIG[period];

  return (
    <div className={ds.groupGap}>
      {/* Editorial period header */}
      <div className="flex items-center gap-2 px-0.5 mb-1">
        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 flex-1">
          {config.label}
        </span>
        <config.Icon size={10} className="text-muted-foreground/40" />
      </div>

      <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
        <div className={ds.cardGap}>
          {habits.map((habit) => (
            <SortableHabitCard
              key={habit.id}
              habit={habit}
              selected={selectedIds.has(habit.id)}
              disabled={isAtLimit && !selectedIds.has(habit.id)}
              onToggle={() => onToggle(habit.id)}
              showWeekendTime={showWeekendTime}
              ds={ds}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const S9RoutinePreview = memo(function S9RoutinePreview() {
  const {
    generatedHabits,
    setGeneratedHabits,
    selectedHabitIds,
    toggleHabit,
    habitExperience,
    weekendDiff,
    hasFoquinhaData,
    quizData,
    collectedName,
    confirmedObjective,
    nextStep,
    prevStep,
  } = useOnboardingV2();

  const [confirming, setConfirming] = useState(false);

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => nextStep(), 900);
  };

  const showTabs = weekendDiff !== "same";
  const [activeTab, setActiveTab] = useState<Tab>("weekday");

  // Derived display values
  const name = quizData?.name || collectedName || "";
  const objectivePhrase = confirmedObjective ? OBJECTIVE_PHRASE[confirmedObjective] : null;
  const totalMinutes = useMemo(() =>
    Array.from(selectedHabitIds).reduce((sum, id) => {
      const h = generatedHabits.find(h => h.id === id);
      return sum + (h?.duration || 0);
    }, 0),
    [generatedHabits, selectedHabitIds]
  );

  // Adaptive density
  const density = useMemo(() => {
    const n = generatedHabits.length;
    if (n <= 6) return "normal";
    if (n <= 9) return "compact";
    return "dense";
  }, [generatedHabits.length]);

  const ds = DENSITY_STYLES[density];

  // DnD sensors
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 5 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } });
  const keyboardSensor = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });
  const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

  // Filter by tab
  const filteredHabits = useMemo(() => {
    if (!showTabs) return generatedHabits;
    if (activeTab === "weekday") {
      return generatedHabits.filter((h) => h.frequency_days.some((d) => d >= 1 && d <= 5));
    }
    return generatedHabits.filter((h) => h.frequency_days.some((d) => d === 0 || d === 6));
  }, [generatedHabits, activeTab, showTabs]);

  // Group by period
  const groupedHabits = useMemo(() => {
    const groups: Record<Period, RecommendedHabitV2[]> = { morning: [], afternoon: [], evening: [] };
    for (const habit of filteredHabits) {
      const period = (habit.period as Period) || "morning";
      if (groups[period]) groups[period].push(habit);
    }
    const timeKey = activeTab === "weekend" ? "weekend_time" : "suggested_time";
    for (const period of Object.keys(groups) as Period[]) {
      groups[period].sort((a, b) =>
        (a[timeKey] || a.suggested_time).localeCompare(b[timeKey] || b.suggested_time)
      );
    }
    return groups;
  }, [filteredHabits, activeTab]);

  // DnD handler — reorder within same period (logic unchanged)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const findPeriod = (id: string): Period | null => {
      for (const [period, habits] of Object.entries(groupedHabits)) {
        if (habits.some((h) => h.id === id)) return period as Period;
      }
      return null;
    };
    const activePeriod = findPeriod(activeId);
    const overPeriod = findPeriod(overId);
    if (!activePeriod || activePeriod !== overPeriod) return;
    const periodHabits = groupedHabits[activePeriod];
    const oldIndex = periodHabits.findIndex((h) => h.id === activeId);
    const newIndex = periodHabits.findIndex((h) => h.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(periodHabits, oldIndex, newIndex);
    const newHabits = generatedHabits.map((h) => h);
    const periodIds = new Set(reordered.map((h) => h.id));
    let reorderIdx = 0;
    for (let i = 0; i < newHabits.length; i++) {
      if (periodIds.has(newHabits[i].id)) {
        newHabits[i] = reordered[reorderIdx++];
      }
    }
    setGeneratedHabits(newHabits);
  };

  return (
    <div className="h-full flex flex-col px-5 pt-4 pb-0 relative">

      {/* ── Overlay animado de confirmação ── */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center mb-4"
            >
              <Check className="w-9 h-9 text-primary" strokeWidth={2.5} />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-lg font-bold text-foreground"
            >
              Rotina configurada
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ZONA 1: Header editorial — nome + objetivo + badge de tempo ── */}
      <div className="flex-shrink-0 max-w-md mx-auto w-full mb-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-start justify-between gap-3"
        >
          {/* Left: name + objective */}
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary mb-0.5">
              {hasFoquinhaData ? "Rotina Atualizada" : "Sua Rotina"}
            </p>
            <h2 className="text-[26px] font-bold leading-[1.1] text-foreground truncate">
              {name ? `${name},` : "Pronto."}
            </h2>
            {objectivePhrase && (
              <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                montada para {objectivePhrase}.
              </p>
            )}
          </div>

          {/* Right: total time badge */}
          {totalMinutes > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.35, type: "spring", stiffness: 300 }}
              className="shrink-0 mt-1"
            >
              <div className="px-2.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-center">
                <p className="text-xs font-bold text-primary tabular-nums">~{totalMinutes}min</p>
                <p className="text-[9px] text-primary/60 leading-none">por dia</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── ZONA 2: Conteúdo com scroll ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="overflow-y-auto max-h-full max-w-md mx-auto w-full"
        >
          {/* Tabs weekday/weekend */}
          {showTabs && (
            <div className="flex gap-2 mb-3">
              {(["weekday", "weekend"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    activeTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {tab === "weekday" ? "Dias úteis" : "Fim de semana"}
                </button>
              ))}
            </div>
          )}

          {/* ── Pill: hábitos na rotina + instrução ── */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              <span className="tabular-nums">{selectedHabitIds.size}</span>
              <span className="font-normal opacity-80">hábitos na sua rotina</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              Toque para remover · Arraste para reordenar
            </p>
          </div>

          {/* ── Lista de hábitos ── */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {hasFoquinhaData ? (
              <div className="w-full pb-2 space-y-5">
                {/* Foquinha habits */}
                {(() => {
                  const foquinhaList = filteredHabits.filter((h: any) => h._isExisting);
                  if (foquinhaList.length === 0) return null;
                  const fGroups: Record<Period, RecommendedHabitV2[]> = { morning: [], afternoon: [], evening: [] };
                  for (const h of foquinhaList) {
                    const p = (h.period as Period) || "morning";
                    if (fGroups[p]) fGroups[p].push(h);
                  }
                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-2 px-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Da Foquinha</span>
                        <span className="text-[10px] text-muted-foreground">(já ativos)</span>
                      </div>
                      <div className={cn("w-full", ds.groupGap)}>
                        {(["morning", "afternoon", "evening"] as Period[]).map((period) =>
                          fGroups[period].length > 0 ? (
                            <PeriodGroup
                              key={`foquinha-${activeTab}-${period}`}
                              period={period}
                              habits={fGroups[period]}
                              selectedIds={selectedHabitIds}
                              isAtLimit={false}
                              onToggle={toggleHabit}
                              showWeekendTime={activeTab === "weekend"}
                              ds={ds}
                            />
                          ) : null
                        )}
                      </div>
                    </div>
                  );
                })()}
                {/* New suggestions */}
                {(() => {
                  const newList = filteredHabits.filter((h: any) => !h._isExisting);
                  if (newList.length === 0) return null;
                  const nGroups: Record<Period, RecommendedHabitV2[]> = { morning: [], afternoon: [], evening: [] };
                  for (const h of newList) {
                    const p = (h.period as Period) || "morning";
                    if (nGroups[p]) nGroups[p].push(h);
                  }
                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-2 px-0.5 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Sugestões novas</span>
                        <span className="text-[10px] text-muted-foreground/50">(toque para adicionar)</span>
                      </div>
                      <div className={cn("w-full", ds.groupGap)}>
                        {(["morning", "afternoon", "evening"] as Period[]).map((period) =>
                          nGroups[period].length > 0 ? (
                            <PeriodGroup
                              key={`new-${activeTab}-${period}`}
                              period={period}
                              habits={nGroups[period]}
                              selectedIds={selectedHabitIds}
                              isAtLimit={false}
                              onToggle={toggleHabit}
                              showWeekendTime={activeTab === "weekend"}
                              ds={ds}
                            />
                          ) : null
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className={cn("w-full pb-2", ds.groupGap)}>
                {(["morning", "afternoon", "evening"] as Period[]).map((period) => (
                  <PeriodGroup
                    key={`${activeTab}-${period}`}
                    period={period}
                    habits={groupedHabits[period]}
                    selectedIds={selectedHabitIds}
                    isAtLimit={false}
                    onToggle={toggleHabit}
                    showWeekendTime={activeTab === "weekend"}
                    ds={ds}
                  />
                ))}
              </div>
            )}
          </DndContext>
        </motion.div>
      </div>

      {/* ── CTA bar ── */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-0 py-3"
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
          onClick={handleConfirm}
          disabled={selectedHabitIds.size === 0 || confirming}
          className="flex-1 h-12 text-base font-semibold gap-2"
        >
          Confirmar minha rotina →
        </Button>
      </div>
    </div>
  );
});
