import { useState, useMemo, useEffect, useRef, memo } from "react";
import { motion } from "motion/react";
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
import { GripVertical, Check, Sunrise, Sun, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitGlyph } from "@/components/icons/HabitGlyph";
import { useOnboardingV2 } from "../OnboardingProviderV2";
import type { RecommendedHabitV2 } from "../generateRecommendationsV2";

// ============================================================================
// CONSTANTS
// ============================================================================

const SELECTION_LIMITS: Record<string, number> = {
  never: 4,
  tried: 6,
  already_have: 8,
};

const PERIOD_CONFIG: Record<string, { label: string; Icon: LucideIcon; iconColor: string }> = {
  morning:   { label: "Manhã", Icon: Sunrise, iconColor: "text-amber-500"  },
  afternoon: { label: "Tarde", Icon: Sun,     iconColor: "text-orange-400" },
  evening:   { label: "Noite", Icon: Moon,    iconColor: "text-amber-400"  },
};

type Period = keyof typeof PERIOD_CONFIG;
type Tab = "weekday" | "weekend";

// ============================================================================
// DENSITY SYSTEM
// ============================================================================

const DENSITY_STYLES = {
  normal:  { cardPy: "py-2.5", handlePy: "py-3",   cardGap: "space-y-1.5", groupGap: "space-y-4", nameSize: "text-sm",  timeSize: "text-xs",      iconSize: "md" as const },
  compact: { cardPy: "py-1.5", handlePy: "py-2",   cardGap: "space-y-1",   groupGap: "space-y-3", nameSize: "text-sm",  timeSize: "text-xs",      iconSize: "sm" as const },
  dense:   { cardPy: "py-1",   handlePy: "py-1.5", cardGap: "space-y-0.5", groupGap: "space-y-2", nameSize: "text-xs",  timeSize: "text-[10px]",  iconSize: "sm" as const },
};

type DensityStyles = typeof DENSITY_STYLES.normal;

// ============================================================================
// SORTABLE HABIT CARD
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
        "group flex items-center rounded-xl border transition-colors overflow-hidden",
        selected
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card",
        isDragging && "opacity-60 shadow-lg z-10",
        disabled && !selected && "opacity-40 pointer-events-none",
      )}
    >
      {/* Drag handle — hidden until hover/focus */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "touch-none pl-3 text-transparent group-hover:text-muted-foreground/40 focus-visible:text-muted-foreground/40 cursor-grab active:cursor-grabbing shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm transition-colors self-stretch flex items-center min-h-[44px]",
        )}
        tabIndex={0}
        aria-label={`Reordenar ${habit.name}`}
      >
        <GripVertical size={20} />
      </button>

      {/* Clickable content area — full row toggle */}
      <button
        onClick={onToggle}
        disabled={disabled && !selected}
        className={cn(
          "flex-1 flex items-center gap-3 px-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
          ds.cardPy,
        )}
        aria-label={selected ? `Desmarcar ${habit.name}` : `Selecionar ${habit.name}`}
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
            "font-medium truncate",
            selected ? "text-foreground" : "text-muted-foreground",
          )}>
            {habit.name}
          </p>
          <p className={cn(ds.timeSize, "text-muted-foreground/60")}>
            {time} · {duration} min
          </p>
        </div>

        {/* Checkbox indicator */}
        <span
          className={cn(
            "shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
            selected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/30",
          )}
        >
          {selected && <Check size={14} strokeWidth={3} />}
        </span>
      </button>
    </div>
  );
}

// ============================================================================
// PERIOD GROUP
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
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <config.Icon size={14} className={cn(config.iconColor, "shrink-0")} />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          {config.label}
        </span>
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
  } = useOnboardingV2();

  const showTabs = weekendDiff !== "same";
  const [activeTab, setActiveTab] = useState<Tab>("weekday");

  const limit = SELECTION_LIMITS[habitExperience || "tried"] || 6;
  const isAtLimit = selectedHabitIds.size >= limit;

  // Adaptive density based on habit count
  const density = useMemo(() => {
    const n = generatedHabits.length;
    if (n <= 6) return "normal";
    if (n <= 9) return "compact";
    return "dense";
  }, [generatedHabits.length]);

  const ds = DENSITY_STYLES[density];

  // Shake dot row when limit is first reached
  const [shakeLimit, setShakeLimit] = useState(false);
  const prevIsAtLimit = useRef(false);
  useEffect(() => {
    if (isAtLimit && !prevIsAtLimit.current) {
      setShakeLimit(true);
      const t = setTimeout(() => setShakeLimit(false), 400);
      return () => clearTimeout(t);
    }
    prevIsAtLimit.current = isAtLimit;
  }, [isAtLimit]);

  // DnD sensors
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  });
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

  // Filter habits by tab
  const filteredHabits = useMemo(() => {
    if (!showTabs) return generatedHabits;
    if (activeTab === "weekday") {
      return generatedHabits.filter((h) =>
        h.frequency_days.some((d) => d >= 1 && d <= 5)
      );
    }
    return generatedHabits.filter((h) =>
      h.frequency_days.some((d) => d === 0 || d === 6)
    );
  }, [generatedHabits, activeTab, showTabs]);

  // Group by period, sorted by suggested_time
  const groupedHabits = useMemo(() => {
    const groups: Record<Period, RecommendedHabitV2[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    for (const habit of filteredHabits) {
      const period = (habit.period as Period) || "morning";
      if (groups[period]) {
        groups[period].push(habit);
      }
    }
    const timeKey = activeTab === "weekend" ? "weekend_time" : "suggested_time";
    for (const period of Object.keys(groups) as Period[]) {
      groups[period].sort((a, b) =>
        (a[timeKey] || a.suggested_time).localeCompare(b[timeKey] || b.suggested_time)
      );
    }
    return groups;
  }, [filteredHabits, activeTab]);

  // Handle drag end — reorder within the same period
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
    <div className="h-full flex flex-col px-6 pt-3 pb-1">

      {/* ── Zona 1: Header FIXO — título + subtítulo ── */}
      <div className="flex-shrink-0 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-3"
        >
          <h2 className="text-2xl font-bold text-foreground">
            {hasFoquinhaData ? "Sua rotina personalizada" : "Essa é a sua rotina."}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {hasFoquinhaData
              ? `${generatedHabits.filter((h: any) => h._isExisting).length} da Foquinha + ${generatedHabits.filter((h: any) => !h._isExisting).length} sugestões novas`
              : `${generatedHabits.length} hábitos selecionados para você`}
          </p>
        </motion.div>
      </div>

      {/* ── Zona 2: Centralizada — tabs + dots + lista ── */}
      {/* Outer: centra o conteúdo quando curto; Inner: scrolla quando longo */}
      <div className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="overflow-y-auto max-h-full max-w-md mx-auto w-full"
        >
          {/* Tabs */}
          {showTabs && (
            <div className="flex gap-2 justify-center mb-3">
              {(["weekday", "weekend"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
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

          {/* Dot-row selection indicator */}
          <div className="flex justify-end mb-2">
            <motion.div
              animate={shakeLimit ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-1.5"
            >
              {Array.from({ length: limit }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i < selectedHabitIds.size ? "bg-primary" : "bg-muted-foreground/20",
                  )}
                />
              ))}
            </motion.div>
          </div>

          {/* Lista de hábitos */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {hasFoquinhaData ? (
              <div className="w-full pb-2 space-y-4">
                {/* Section: Foquinha habits */}
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
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-sm font-semibold text-primary">Da Foquinha</span>
                        <span className="text-xs text-muted-foreground">(já ativos)</span>
                      </div>
                      <div className={cn("w-full", ds.groupGap)}>
                        {(["morning", "afternoon", "evening"] as Period[]).map((period) =>
                          fGroups[period].length > 0 ? (
                            <PeriodGroup
                              key={`foquinha-${activeTab}-${period}`}
                              period={period}
                              habits={fGroups[period]}
                              selectedIds={selectedHabitIds}
                              isAtLimit={isAtLimit}
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
                {/* Section: New suggestions */}
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
                      <div className="flex items-center gap-2 mb-2 px-1 mt-3">
                        <span className="text-sm font-semibold text-foreground">Sugestões novas</span>
                        <span className="text-xs text-muted-foreground">(toque para adicionar)</span>
                      </div>
                      <div className={cn("w-full", ds.groupGap)}>
                        {(["morning", "afternoon", "evening"] as Period[]).map((period) =>
                          nGroups[period].length > 0 ? (
                            <PeriodGroup
                              key={`new-${activeTab}-${period}`}
                              period={period}
                              habits={nGroups[period]}
                              selectedIds={selectedHabitIds}
                              isAtLimit={isAtLimit}
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
                    isAtLimit={isAtLimit}
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

    </div>
  );
});
