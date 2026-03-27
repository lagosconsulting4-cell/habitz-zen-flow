import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useHabits, Habit } from "@/hooks/useHabits";
import { Loader2, MoreVertical, Copy, Trash2, Target, Flame, Search, Clock, Sparkles, ChevronRight } from "lucide-react";
import { HabitIconKey } from "@/components/icons/HabitIcons";
import { HabitGlyph } from "@/components/icons/HabitGlyph";

const CATEGORY_LABELS: Record<string, string> = {
  mente: "Mente",
  corpo: "Corpo",
  estudo: "Estudo",
  carreira: "Carreira",
  relacionamento: "Relação",
  financeiro: "Finanças",
  productivity: "Produtividade",
  fitness: "Fitness",
  nutrition: "Alimentação",
  time_routine: "Rotina",
  avoid: "Evitar",
  outro: "Outro",
};

const PERIOD_LABELS: Record<string, string> = {
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
};

const PERIOD_ORDER: Record<string, number> = { morning: 0, afternoon: 1, evening: 2 };

function formatTime(time?: string | null): string | null {
  if (!time) return null;
  const parts = time.split(":");
  if (parts.length < 2) return null;
  return `${parts[0]}:${parts[1]}`;
}

const MyHabits = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const {
    habits,
    loading,
    archiveHabit,
    restoreHabit,
    deleteHabit,
    duplicateHabit,
  } = useHabits();

  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<"active" | "archived" | "completed">("active");
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);

  const filteredHabits = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return habits
      .filter((h) => {
        if (status === "active") return h.is_active;
        if (status === "archived") return !h.is_active;
        if (status === "completed") return h.is_active && h.streak > 0;
        return true;
      })
      .filter((h) => (term ? h.name.toLowerCase().includes(term) : true))
      .sort((a, b) => {
        if (status === "completed") return b.streak - a.streak;
        const po = (PERIOD_ORDER[a.period] ?? 0) - (PERIOD_ORDER[b.period] ?? 0);
        return po !== 0 ? po : a.name.localeCompare(b.name);
      });
  }, [habits, status, searchTerm]);

  // Group by period
  const habitsByPeriod = useMemo(() => {
    const groups: { period: string; label: string; habits: Habit[] }[] = [];
    const map = new Map<string, Habit[]>();
    for (const h of filteredHabits) {
      const arr = map.get(h.period) || [];
      arr.push(h);
      map.set(h.period, arr);
    }
    for (const [period, list] of map) {
      groups.push({ period, label: PERIOD_LABELS[period] || period, habits: list });
    }
    groups.sort((a, b) => (PERIOD_ORDER[a.period] ?? 0) - (PERIOD_ORDER[b.period] ?? 0));
    return groups;
  }, [filteredHabits]);

  const handleEdit = (habit: Habit) => navigate(`/habits/edit/${habit.id}`);

  const handleDuplicate = async (habit: Habit) => {
    try { await duplicateHabit(habit.id); } catch { /* handled */ }
  };

  const handleArchiveToggle = async (habit: Habit) => {
    try {
      if (habit.is_active) await archiveHabit(habit.id);
      else await restoreHabit(habit.id);
    } catch { /* handled */ }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteHabit(deleteTarget.id);
      setDeleteTarget(null);
    } catch { /* handled */ }
  };

  return (
    <div className="bg-background min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="px-4 pb-navbar max-w-xl mx-auto w-full"
        style={{ paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))" }}
      >
        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cn(
            "flex items-center gap-3 rounded-2xl px-4 py-3 mb-4",
            isDarkMode
              ? "bg-white/5 border border-white/5"
              : "bg-gray-100 border border-gray-200/50"
          )}
        >
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar hábito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </motion.div>

        {/* Status tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {([
            { id: "active", label: "Ativos" },
            { id: "archived", label: "Arquivados" },
            { id: "completed", label: "Completados" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatus(tab.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                status === tab.id
                  ? isDarkMode
                    ? "bg-lime-400/15 text-lime-300 border border-lime-400/30"
                    : "bg-foreground text-background"
                  : isDarkMode
                    ? "text-white/40 hover:text-white/60 border border-white/10"
                    : "text-muted-foreground hover:text-foreground border border-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : filteredHabits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-5",
                isDarkMode ? "bg-white/5" : "bg-gray-100"
              )}
            >
              {status === "archived" ? (
                <Trash2 className="w-9 h-9 text-muted-foreground" />
              ) : (
                <Target className="w-9 h-9 text-muted-foreground" />
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              {status === "archived"
                ? "Nenhum hábito arquivado"
                : searchTerm
                  ? "Nenhum resultado"
                  : "Comece sua jornada!"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              {status === "archived"
                ? "Seus hábitos arquivados aparecerão aqui."
                : searchTerm
                  ? "Tente buscar por outro termo."
                  : "Crie seu primeiro hábito e transforme sua rotina."}
            </p>
            {status === "archived" ? (
              <Button variant="outline" size="sm" onClick={() => setStatus("active")}>
                Ver ativos
              </Button>
            ) : !searchTerm ? (
              <Button asChild size="sm" className="bg-primary text-primary-foreground">
                <Link to="/create">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Criar hábito
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                Limpar busca
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-8">
            {habitsByPeriod.map(({ period, label, habits: periodHabits }, gi) => (
              <motion.div
                key={period}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + gi * 0.05 }}
              >
                {/* Section header */}
                <p
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 px-1",
                    isDarkMode ? "text-white/65" : "text-muted-foreground"
                  )}
                >
                  {label}
                </p>

                {/* Habit cards */}
                <div className="space-y-2.5">
                  <AnimatePresence mode="popLayout">
                    {periodHabits.map((habit, i) => {
                      const archived = !habit.is_active;
                      const streakStr = String(habit.streak).padStart(2, "0");
                      const time = formatTime(habit.reminder_time);
                      const categoryLabel =
                        CATEGORY_LABELS[habit.category] || habit.category;

                      return (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, transition: { duration: 0.15 } }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => handleEdit(habit)}
                          className={cn(
                            "group cursor-pointer rounded-2xl p-4 flex items-center gap-4 transition-all duration-200",
                            isDarkMode
                              ? "bg-[#1a1a1a] border border-white/[0.06] hover:border-lime-400/15 hover:bg-[#1f1f1f]"
                              : "bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200",
                            archived && "opacity-50"
                          )}
                          style={
                            isDarkMode
                              ? { boxShadow: "0 2px 16px rgba(0,0,0,0.4), 0 0 1px rgba(163,230,53,0.05), inset 0 1px 0 rgba(255,255,255,0.03)" }
                              : undefined
                          }
                        >
                          {/* Icon circle */}
                          <div
                            className={cn(
                              "flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center",
                              isDarkMode ? "bg-lime-400/15" : "bg-gray-100"
                            )}
                          >
                            <HabitGlyph
                              iconKey={habit.icon_key as HabitIconKey | null}
                              category={habit.category}
                              size="md"
                              tone="gray"
                              fallbackLabel={habit.emoji}
                              className={isDarkMode ? "text-lime-300" : "text-gray-600"}
                            />
                          </div>

                          {/* Name + meta */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {habit.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                              <span>{categoryLabel}</span>
                              {time && (
                                <>
                                  <Clock className="w-3 h-3" />
                                  <span>{time}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Streak — pinned to right edge */}
                          <div className="flex-shrink-0 text-right ml-auto pr-1">
                            <p
                              className={cn(
                                "text-2xl font-bold tabular-nums leading-none",
                                isDarkMode ? "text-lime-300" : "text-lime-600"
                              )}
                              style={
                                isDarkMode && habit.streak > 0
                                  ? { textShadow: "0 0 14px rgba(163, 230, 53, 0.6)" }
                                  : undefined
                              }
                            >
                              {streakStr}
                            </p>
                            <p className="text-[8px] uppercase tracking-widest text-muted-foreground mt-1">
                              Daystreak
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete confirmation */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir hábito?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Remove o hábito e suas conclusões.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyHabits;
