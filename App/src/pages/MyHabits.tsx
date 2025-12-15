import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/hooks/useTheme";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useHabits, Habit } from "@/hooks/useHabits";
import { Loader2, MoreVertical, Copy, Edit, Trash2, Target, Flame, TrendingUp, ArrowUpDown, ChevronRight, Sparkles } from "lucide-react";
import { HabitIconKey } from "@/components/icons/HabitIcons";
import { HabitGlyph } from "@/components/icons/HabitGlyph";

const categories = [
  { id: "mente", label: "Mente" },
  { id: "corpo", label: "Corpo" },
  { id: "estudo", label: "Estudo" },
  { id: "carreira", label: "Carreira" },
  { id: "relacionamento", label: "Relacionamento" },
  { id: "financeiro", label: "Financeiro" },
  { id: "outro", label: "Outro" },
];
const periods = [
  { id: "morning", label: "Manhã" },
  { id: "afternoon", label: "Tarde" },
  { id: "evening", label: "Noite" },
];

const MyHabits = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "streak" | "category" | "period">("name");

  // Calculate stats
  const stats = useMemo(() => {
    const activeHabits = habits.filter((h) => h.is_active);
    const longestStreak = Math.max(0, ...activeHabits.map((h) => h.streak));
    const avgStreak = activeHabits.length > 0
      ? Math.round(activeHabits.reduce((sum, h) => sum + h.streak, 0) / activeHabits.length)
      : 0;

    return {
      total: activeHabits.length,
      longestStreak,
      avgStreak,
    };
  }, [habits]);

  const filteredHabits = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = habits
      .filter((habit) => status === "active" ? habit.is_active : !habit.is_active)
      .filter((habit) => (term ? habit.name.toLowerCase().includes(term) : true))
      .filter((habit) =>
        selectedCategories.length > 0 ? selectedCategories.includes(habit.category) : true,
      )
      .filter((habit) =>
        selectedPeriods.length > 0 ? selectedPeriods.includes(habit.period) : true,
      );

    // Sort habits
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "streak":
          return b.streak - a.streak;
        case "category":
          return a.category.localeCompare(b.category);
        case "period":
          const periodOrder = { morning: 0, afternoon: 1, evening: 2 };
          return periodOrder[a.period] - periodOrder[b.period];
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [habits, status, searchTerm, selectedCategories, selectedPeriods, sortBy]);

  const uniqueCategories = useMemo(
    () => Array.from(new Set(habits.map((habit) => habit.category))),
    [habits],
  );

  const handleEdit = (habit: Habit) => {
    navigate(`/habits/edit/${habit.id}`);
  };

  const handleDuplicate = async (habit: Habit) => {
    try {
      await duplicateHabit(habit.id);
    } catch (error) {
      /* handled */
    }
  };

  const handleArchiveToggle = async (habit: Habit) => {
    try {
      if (habit.is_active) {
        await archiveHabit(habit.id);
      } else {
        await restoreHabit(habit.id);
      }
    } catch (error) {
      /* handled */
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteHabit(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      /* handled */
    }
  };

  return (
    <div className="min-h-screen bg-background pb-navbar transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 pb-6 max-w-4xl"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-primary" />
              Meus Hábitos
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie e edite seus hábitos.
            </p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            <Link to="/create">Adicionar novo hábito</Link>
          </Button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className={cn(
              "rounded-2xl p-4 border h-full transition-all duration-300",
              isDarkMode
                ? "bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30"
                : "bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  isDarkMode ? "bg-orange-500/20" : "bg-orange-500/10"
                )}>
                  <Flame className={cn("w-4 h-4", isDarkMode ? "text-orange-400" : "text-orange-600")} />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Maior Streak</p>
              </div>
              <p className={cn("text-2xl font-bold", isDarkMode ? "text-orange-400" : "text-orange-600")}>
                {stats.longestStreak}
                <span className="text-sm font-normal text-muted-foreground ml-1">dias</span>
              </p>
            </Card>
          </motion.div>

          {/* Total Habits Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card className={cn(
              "rounded-2xl p-4 border h-full transition-all duration-300",
              isDarkMode
                ? "bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30"
                : "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  isDarkMode ? "bg-blue-500/20" : "bg-blue-500/10"
                )}>
                  <Target className={cn("w-4 h-4", isDarkMode ? "text-blue-400" : "text-blue-600")} />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Ativos</p>
              </div>
              <p className={cn("text-2xl font-bold", isDarkMode ? "text-blue-400" : "text-blue-600")}>
                {stats.total}
                <span className="text-sm font-normal text-muted-foreground ml-1">hábitos</span>
              </p>
            </Card>
          </motion.div>
        </div>

        <Card className="rounded-2xl bg-card border border-border p-4 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Input
                placeholder="Buscar hábito"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="md:max-w-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
              {/* Sorting Dropdown */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-full sm:w-[160px] bg-secondary border-border">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome (A-Z)</SelectItem>
                  <SelectItem value="streak">Maior Streak</SelectItem>
                  <SelectItem value="category">Categoria</SelectItem>
                  <SelectItem value="period">Período</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Tabs value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <TabsList className="grid grid-cols-2 rounded-full bg-muted p-1">
                <TabsTrigger
                  value="active"
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold"
                >
                  Ativos
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground data-[state=active]:font-semibold"
                >
                  Arquivados
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {uniqueCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  selectedCategories.includes(category)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                }`}
                onClick={() =>
                  setSelectedCategories((prev) =>
                    prev.includes(category)
                      ? prev.filter((item) => item !== category)
                      : [...prev, category],
                  )
                }
              >
                {categories.find((item) => item.id === category)?.label ?? category}
              </button>
             ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {periods.map((period) => (
              <button
                key={period.id}
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  selectedPeriods.includes(period.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                }`}
                onClick={() =>
                  setSelectedPeriods((prev) =>
                    prev.includes(period.id)
                      ? prev.filter((item) => item !== period.id)
                      : [...prev, period.id],
                  )
                }
              >
                {period.label}
               </button>
             ))}
          </div>
        </Card>

        {loading ? (
          <Card className="rounded-2xl bg-card border border-border p-12 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 animate-ping opacity-20">
                  <Loader2 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground">Carregando seus hábitos...</p>
            </motion.div>
          </Card>
        ) : filteredHabits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className={cn(
              "rounded-2xl border p-8 text-center relative overflow-hidden",
              isDarkMode
                ? "bg-gradient-to-br from-card to-muted/30 border-border"
                : "bg-gradient-to-br from-white to-slate-50 border-slate-200"
            )}>
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={cn(
                  "absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-10",
                  isDarkMode ? "bg-primary" : "bg-lime-400"
                )} />
                <div className={cn(
                  "absolute -bottom-16 -left-16 w-32 h-32 rounded-full opacity-10",
                  isDarkMode ? "bg-blue-500" : "bg-blue-400"
                )} />
              </div>

              <div className="relative z-10">
                {status === "archived" ? (
                  <>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="mb-4"
                    >
                      <div className={cn(
                        "w-20 h-20 mx-auto rounded-full flex items-center justify-center",
                        isDarkMode ? "bg-muted" : "bg-slate-100"
                      )}>
                        <Trash2 className="w-10 h-10 text-muted-foreground" />
                      </div>
                    </motion.div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Nenhum hábito arquivado
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      Você não arquivou nenhum hábito ainda. Isso é bom! Continue mantendo seus hábitos ativos.
                    </p>
                    <Button variant="outline" onClick={() => setStatus("active")}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Ver hábitos ativos
                    </Button>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="mb-4"
                    >
                      <div className={cn(
                        "w-20 h-20 mx-auto rounded-full flex items-center justify-center",
                        isDarkMode ? "bg-primary/20" : "bg-lime-100"
                      )}>
                        <Target className={cn("w-10 h-10", isDarkMode ? "text-primary" : "text-lime-600")} />
                      </div>
                    </motion.div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      {searchTerm || selectedCategories.length > 0 || selectedPeriods.length > 0
                        ? "Nenhum resultado encontrado"
                        : "Comece sua jornada!"}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      {searchTerm || selectedCategories.length > 0 || selectedPeriods.length > 0
                        ? "Tente ajustar os filtros ou buscar por outro termo."
                        : "Crie seu primeiro hábito e comece a construir uma rotina que transforma sua vida."}
                    </p>
                    {searchTerm || selectedCategories.length > 0 || selectedPeriods.length > 0 ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategories([]);
                          setSelectedPeriods([]);
                        }}
                      >
                        Limpar filtros
                      </Button>
                    ) : (
                      <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link to="/create">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Criar primeiro hábito
                        </Link>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="space-y-3">
              {filteredHabits.map((habit, index) => {
                const archived = !habit.is_active;
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    layoutId={habit.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <Card
                      className={cn(
                        "rounded-2xl bg-card border p-4 transition-all duration-200 group cursor-pointer",
                        "hover:shadow-lg hover:border-primary/30",
                        archived ? "border-destructive/30 opacity-60 hover:opacity-70" : "border-border"
                      )}
                      onClick={() => handleEdit(habit)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105",
                              isDarkMode ? "bg-primary/10" : "bg-lime-100"
                            )}
                          >
                            <HabitGlyph
                              iconKey={habit.icon_key as HabitIconKey | null}
                              category={habit.category}
                              size="md"
                              tone="inherit"
                              fallbackLabel={habit.emoji}
                              className={isDarkMode ? "text-primary" : "text-lime-600"}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-foreground truncate">
                              {habit.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{categories.find((item) => item.id === habit.category)?.label ?? habit.category}</span>
                              <span>•</span>
                              <span>{periods.find((period) => period.id === habit.period)?.label ?? habit.period}</span>
                              {habit.streak > 0 && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Flame className="h-3 w-3 text-orange-500" />
                                    <span className="font-semibold">{habit.streak}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-foreground hover:bg-muted"
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                onSelect={() => handleDuplicate(habit)}
                              >
                                <Copy className="mr-2 h-4 w-4" /> Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                onSelect={() => handleArchiveToggle(habit)}
                              >
                                {habit.is_active ? "Arquivar" : "Reativar"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                onSelect={() => setDeleteTarget(habit)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

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
