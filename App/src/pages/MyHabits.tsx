import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationBar from "@/components/NavigationBar";
import { Toggle } from "@/components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useHabits, Habit } from "@/hooks/useHabits";
import { TimerModal } from "@/components/timer";
import { isTimedHabit } from "@/components/CircularHabitCard";
import { Loader2, MoreVertical, Check, Copy, Edit, Trash2, Sparkles, Target, Clock, CheckCircle2, Calendar, Flame, TrendingUp, ArrowUpDown, Trophy, Zap, Star } from "lucide-react";
import { WeeklyOverview } from "@/components/WeeklyOverview";
import { StreakCelebration } from "@/components/StreakCelebration";
import { HABIT_EMOJIS } from "@/data/habit-emojis";
import type { HabitEmoji } from "@/data/habit-emojis";
import { getHabitIcon, HabitIconKey } from "@/components/icons/HabitIcons";
import { supabase } from "@/integrations/supabase/client";
import { useAppPreferences } from "@/hooks/useAppPreferences";

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
const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
// All available icon keys from HabitIcons.tsx
const iconKeys: HabitIconKey[] = [
  // Exercícios
  "run", "cycle", "swim", "stairs", "stretch", "yoga", "strength", "active",
  // Saúde Mental
  "meditate", "journal", "gratitude", "focus", "pause", "leisure",
  // Alimentação
  "meal", "water", "fruits", "vegetables", "protein", "vitamins", "breakfast",
  // Sono
  "sleep", "bed", "alarm", "no_late_sleep",
  // Produtividade
  "plan", "deep_work", "review", "organize", "checklist", "target", "clock",
  // Social/Família
  "call_family", "family",
  // Restrições/Evitar
  "no_fast_food", "no_screens", "no_smoke", "no_alcohol", "no_sugar", "no_procrastination", "no_skip_meals", "ban", "detox", "social_media",
  // Apple Health
  "heart", "activity_rings", "stand_hours", "exercise_minutes", "burn_energy",
  // Rotina
  "sunrise", "make_bed", "book", "study",
];

interface HabitFormState {
  name: string;
  emoji: HabitEmoji;
  category: string;
  period: "morning" | "afternoon" | "evening";
  days_of_week: number[];
  goal_value?: number | null;
  unit?: "none" | "steps" | "minutes" | "km" | "custom" | null;
  frequency_type?: "fixed_days" | "times_per_week" | "times_per_month" | "every_n_days" | "daily" | null;
  times_per_week?: number | null;
  times_per_month?: number | null;
  every_n_days?: number | null;
  color?: string | null;
  icon_key?: HabitIconKey | string | null;
  notification_pref?: {
    reminder_enabled?: boolean;
    reminder_time?: string;
    sound?: string | null;
    time_sensitive?: boolean;
  } | null;
}

interface HabitNotification {
  id: string;
  habit_id: string;
  type: "reminder" | "completed";
  time: string;
  sound: string | null;
  time_sensitive: boolean | null;
}

const createFormState = (habit?: Habit): HabitFormState => ({
  name: habit?.name ?? "",
  emoji: habit?.emoji ?? HABIT_EMOJIS[0],
  category: habit?.category ?? "mente",
  period: habit?.period ?? "morning",
  days_of_week: habit?.days_of_week ? [...habit.days_of_week] : [1, 2, 3, 4, 5],
  goal_value: habit?.goal_value ?? null,
  unit: habit?.unit ?? "none",
  frequency_type: habit?.frequency_type ?? "fixed_days",
  times_per_week: habit?.times_per_week ?? null,
  times_per_month: habit?.times_per_month ?? null,
  every_n_days: habit?.every_n_days ?? null,
  color: habit?.color ?? null,
  icon_key: habit?.icon_key ?? null,
  notification_pref: (habit?.notification_pref as HabitFormState["notification_pref"]) ?? null,
});

const MyHabits = () => {
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const {
    habits,
    loading,
    toggleHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
    deleteHabit,
    duplicateHabit,
    getHabitCompletionStatus,
  } = useHabits();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [status, setStatus] = useState<"active" | "archived" | "today">("active");
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formState, setFormState] = useState<HabitFormState>(createFormState());
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [notifications, setNotifications] = useState<HabitNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [timerHabit, setTimerHabit] = useState<Habit | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "streak" | "category" | "period">("name");
  const [celebration, setCelebration] = useState<{
    show: boolean;
    type: "day_complete" | "streak_milestone" | "habit_complete";
    habitName?: string;
  }>({ show: false, type: "habit_complete" });
  const { prefs } = useAppPreferences();

  // Calculate stats for today
  const todayStats = useMemo(() => {
    const today = new Date().getDay();
    const activeHabits = habits.filter((h) => h.is_active);
    const scheduledToday = activeHabits.filter((h) => h.days_of_week?.includes(today) ?? false);
    const completedToday = scheduledToday.filter((h) => getHabitCompletionStatus(h.id));
    const longestStreak = Math.max(0, ...activeHabits.map((h) => h.streak));
    const avgStreak = activeHabits.length > 0
      ? Math.round(activeHabits.reduce((sum, h) => sum + h.streak, 0) / activeHabits.length)
      : 0;
    const successRate = scheduledToday.length > 0
      ? Math.round((completedToday.length / scheduledToday.length) * 100)
      : 0;

    return {
      total: activeHabits.length,
      scheduledToday: scheduledToday.length,
      completedToday: completedToday.length,
      longestStreak,
      avgStreak,
      successRate,
    };
  }, [habits, getHabitCompletionStatus]);

  // Get completion data for any date (for WeeklyOverview)
  const getCompletionForDate = (date: Date): { completed: number; total: number } => {
    const dayOfWeek = date.getDay();
    const activeHabits = habits.filter((h) => h.is_active);
    const scheduledForDay = activeHabits.filter((h) => h.days_of_week?.includes(dayOfWeek) ?? false);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // For today, use actual completion status
    if (checkDate.getTime() === today.getTime()) {
      const completed = scheduledForDay.filter((h) => getHabitCompletionStatus(h.id)).length;
      return { completed, total: scheduledForDay.length };
    }

    // For future dates, show only scheduled count
    if (checkDate > today) {
      return { completed: 0, total: scheduledForDay.length };
    }

    // For past dates, estimate based on streak (simplified)
    // In a full implementation, you'd fetch historical completion data
    return { completed: 0, total: scheduledForDay.length };
  };

  // Check if habit is scheduled for today
  const isScheduledToday = (habit: Habit): boolean => {
    const today = new Date().getDay();
    return habit.days_of_week?.includes(today) ?? false;
  };

  // Check if habit is completed today
  const isCompletedToday = (habitId: string): boolean => {
    return getHabitCompletionStatus(habitId);
  };

  const filteredHabits = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const today = new Date().getDay();

    const filtered = habits
      .filter((habit) => {
        if (status === "today") {
          return habit.is_active && (habit.days_of_week?.includes(today) ?? false);
        }
        return status === "active" ? habit.is_active : !habit.is_active;
      })
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

  const MAX_NOTIFICATIONS = 5;

  const validateTime = (time: string) => {
    return /^([0-1]\d|2[0-3]):[0-5]\d$/.test(time);
  };

  const uniqueCategories = useMemo(
    () => Array.from(new Set(habits.map((habit) => habit.category))),
    [habits],
  );

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormState(createFormState(habit));
    setEditSheetOpen(true);
    void loadNotifications(habit.id);
  };

  const handleToggleDay = (day: number) => {
    setFormState((prev) => {
      const includes = prev.days_of_week.includes(day);
      const next = includes
        ? prev.days_of_week.filter((value) => value !== day)
        : [...prev.days_of_week, day];
      return { ...prev, days_of_week: next.sort((a, b) => a - b) };
    });
  };

  const loadNotifications = async (habitId: string) => {
    try {
      setNotifLoading(true);
      const { data, error } = await supabase
        .from("habit_notifications")
        .select("*")
        .eq("habit_id", habitId)
        .order("time", { ascending: true });

      if (error) throw error;
      setNotifications((data ?? []) as HabitNotification[]);
    } catch (err) {
      console.error("Erro ao carregar notificações", err);
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const addNotification = async () => {
    if (!editingHabit) return;
    if (!prefs.notificationsEnabled) {
      toast({
        title: "Notificações desativadas",
        description: "Ative notificações nas preferências para adicionar lembretes.",
        variant: "destructive",
      });
      return;
    }
    if (notifications.length >= MAX_NOTIFICATIONS) {
      toast({
        title: "Limite atingido",
        description: `Você pode adicionar até ${MAX_NOTIFICATIONS} horários por hábito.`,
        variant: "destructive",
      });
      return;
    }
    const existingTimes = notifications.map((n) => n.time?.slice(0, 5)).filter(Boolean);
    // sugere próximo horário sequencial simples
    const baseHour = 8 + notifications.length * 2;
    const suggestedHour = String(Math.min(baseHour, 22)).padStart(2, "0");
    const suggested = `${suggestedHour}:00`;
    if (existingTimes.includes(suggested)) {
      toast({
        title: "Horário duplicado",
        description: "Esse horário já está configurado. Ajuste antes de adicionar outro.",
        variant: "destructive",
      });
      return;
    }
    try {
      setNotifLoading(true);
      const { data, error } = await supabase
        .from("habit_notifications")
        .insert({
          habit_id: editingHabit.id,
          type: "reminder",
          time: suggested,
          time_sensitive: false,
          sound: prefs.defaultSound,
        })
        .select()
        .single();

      if (error) throw error;
      setNotifications((prev) => [...prev, data as HabitNotification]);
    } catch (err) {
      console.error("Erro ao adicionar notificação", err);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar lembrete",
        variant: "destructive",
      });
    } finally {
      setNotifLoading(false);
    }
  };

  const updateNotificationTime = async (id: string, time: string) => {
    if (!validateTime(time)) {
      toast({
        title: "Horário inválido",
        description: "Use o formato HH:MM entre 00:00 e 23:59.",
        variant: "destructive",
      });
      return;
    }
    if (notifications.some((n) => n.id !== id && n.time?.slice(0, 5) === time)) {
      toast({
        title: "Duplicado",
        description: "Já existe um lembrete neste horário.",
        variant: "destructive",
      });
      return;
    }
    try {
      setNotifLoading(true);
      const { data, error } = await supabase
        .from("habit_notifications")
        .update({ time })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setNotifications((prev) => prev.map((n) => (n.id === id ? (data as HabitNotification) : n)));
    } catch (err) {
      console.error("Erro ao atualizar lembrete", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      setNotifLoading(true);
      const { error } = await supabase
        .from("habit_notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Erro ao remover lembrete", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const updateNotificationSound = async (id: string, sound: string) => {
    try {
      setNotifLoading(true);
      const { data, error } = await supabase
        .from("habit_notifications")
        .update({ sound })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => (n.id === id ? (data as HabitNotification) : n)));
    } catch (err) {
      console.error("Erro ao atualizar som", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const updateNotificationSensitivity = async (id: string, timeSensitive: boolean) => {
    try {
      setNotifLoading(true);
      const { data, error } = await supabase
        .from("habit_notifications")
        .update({ time_sensitive: timeSensitive })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => (n.id === id ? (data as HabitNotification) : n)));
    } catch (err) {
      console.error("Erro ao atualizar sensibilidade", err);
    } finally {
      setNotifLoading(false);
    }
  };

const handleSave = async () => {
    if (!editingHabit) return;
    if (!formState.name.trim()) {
      toast({
        title: "Informe um nome",
        description: "O hábito precisa de um título",
        variant: "destructive",
      });
      return;
    }

    const frequencyType = formState.frequency_type ?? "fixed_days";

    if (frequencyType === "fixed_days" && formState.days_of_week.length === 0) {
      toast({
        title: "Selecione dias",
        description: "Escolha ao menos um dia da semana",
        variant: "destructive",
      });
      return;
    }

    if (frequencyType === "times_per_week" && !formState.times_per_week) {
      toast({
        title: "Informe a meta semanal",
        description: "Preencha quantas vezes por semana deseja cumprir",
        variant: "destructive",
      });
      return;
    }

    if (frequencyType === "times_per_month" && !formState.times_per_month) {
      toast({
        title: "Informe a meta mensal",
        description: "Preencha quantas vezes por mês deseja cumprir",
        variant: "destructive",
      });
      return;
    }

    if (frequencyType === "every_n_days" && !formState.every_n_days) {
      toast({
        title: "Informe o intervalo",
        description: "Preencha a cada quantos dias deseja repetir",
        variant: "destructive",
      });
      return;
    }

    if (formState.goal_value !== undefined && formState.goal_value !== null && Number.isNaN(Number(formState.goal_value))) {
      toast({
        title: "Meta inválida",
        description: "Informe um valor numérico para a meta",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const daysPayload =
        frequencyType === "daily"
          ? [0, 1, 2, 3, 4, 5, 6]
          : [...formState.days_of_week].sort((a, b) => a - b);

      await updateHabit(editingHabit.id, {
        name: formState.name.trim(),
        emoji: formState.emoji,
        category: formState.category,
        period: formState.period,
        days_of_week: daysPayload,
        unit: formState.unit ?? "none",
        goal_value: formState.goal_value ?? null,
        frequency_type: frequencyType,
        times_per_week: formState.times_per_week ?? null,
        times_per_month: formState.times_per_month ?? null,
        every_n_days: formState.every_n_days ?? null,
        color: formState.color ?? null,
        icon_key: formState.icon_key ?? null,
        notification_pref: formState.notification_pref ?? null,
      });
      toast({ title: "Hábito atualizado" });
      setEditSheetOpen(false);
      setEditingHabit(null);
    } catch (error) {
      // handled in hook toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (habit: Habit) => {
    if (!habit.is_active) return;

    const completed = isCompletedToday(habit.id);

    // If it's a timed habit and not completed, open timer
    if (isTimedHabit(habit.unit) && !completed && habit.goal_value && habit.goal_value > 0) {
      setTimerHabit(habit);
      return;
    }

    try {
      await toggleHabit(habit.id);

      // Show celebration if completing (not uncompleting)
      if (!completed) {
        // Check if this completes all habits for today
        const today = new Date().getDay();
        const scheduledToday = habits.filter(
          (h) => h.is_active && (h.days_of_week?.includes(today) ?? false)
        );
        const willBeCompleted = scheduledToday.filter(
          (h) => h.id === habit.id || getHabitCompletionStatus(h.id)
        ).length;

        if (willBeCompleted === scheduledToday.length && scheduledToday.length > 1) {
          // All habits completed - show big celebration
          setTimeout(() => {
            setCelebration({ show: true, type: "day_complete" });
          }, 300);
        } else {
          // Show small celebration for individual habit
          setCelebration({ show: true, type: "habit_complete", habitName: habit.name });
        }

        toast({ title: "Concluído!" });
      } else {
        toast({ title: "Desmarcado" });
      }
    } catch (error) {
      // toast handled no need
    }
  };

  const handleTimerComplete = async () => {
    if (timerHabit) {
      await toggleHabit(timerHabit.id);
      toast({ title: "Hábito concluído!" });
      setTimerHabit(null);
    }
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
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-6 max-w-4xl"
      >
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-primary" />
              Meus Hábitos
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus hábitos, agenda semanal e conclua tarefas do dia.
            </p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            <Link to="/create">Adicionar novo hábito</Link>
          </Button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {/* Today's Progress Card - Larger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
            className="col-span-2 md:col-span-2"
          >
            <Card className={cn(
              "rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden",
              isDarkMode
                ? "bg-gradient-to-br from-lime-500/20 to-lime-600/10 border-lime-500/30"
                : "bg-gradient-to-br from-lime-50 to-lime-100/50 border-lime-200"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-xl",
                    isDarkMode ? "bg-lime-500/20" : "bg-lime-500/10"
                  )}>
                    <Zap className={cn("w-5 h-5", isDarkMode ? "text-lime-400" : "text-lime-600")} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Progresso Hoje</p>
                    <p className={cn("text-2xl font-bold", isDarkMode ? "text-lime-400" : "text-lime-600")}>
                      {todayStats.completedToday}/{todayStats.scheduledToday}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "text-4xl font-bold",
                  todayStats.successRate === 100 ? "text-lime-500" : "text-muted-foreground/50"
                )}>
                  {todayStats.successRate}%
                </div>
              </div>
              <Progress
                value={todayStats.successRate}
                className={cn("h-2", isDarkMode ? "bg-white/10" : "bg-lime-200/50")}
              />
              {todayStats.successRate === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <Badge className="bg-lime-500 text-white text-xs">
                    <Trophy className="w-3 h-3 mr-1" />
                    Completo!
                  </Badge>
                </motion.div>
              )}
            </Card>
          </motion.div>

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
                {todayStats.longestStreak}
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
                {todayStats.total}
                <span className="text-sm font-normal text-muted-foreground ml-1">hábitos</span>
              </p>
            </Card>
          </motion.div>

          {/* Weekly Overview - Full Width */}
          <WeeklyOverview
            getCompletionForDate={getCompletionForDate}
            isDarkMode={isDarkMode}
            className="col-span-2 md:col-span-4"
          />
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
              <TabsList className="grid grid-cols-3 rounded-full bg-muted p-1">
                <TabsTrigger
                  value="today"
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-lime-500 data-[state=active]:text-black data-[state=active]:font-semibold"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Hoje
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold"
                >
                  Ativos
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground data-[state=active]:font-semibold"
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
                {status === "today" ? (
                  <>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="mb-4"
                    >
                      <div className={cn(
                        "w-20 h-20 mx-auto rounded-full flex items-center justify-center",
                        isDarkMode ? "bg-lime-500/20" : "bg-lime-100"
                      )}>
                        <Calendar className={cn("w-10 h-10", isDarkMode ? "text-lime-400" : "text-lime-600")} />
                      </div>
                    </motion.div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Nenhum hábito para hoje
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      Você não tem hábitos agendados para hoje. Que tal criar um novo ou ajustar a frequência dos existentes?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link to="/create">
                          <Target className="w-4 h-4 mr-2" />
                          Criar novo hábito
                        </Link>
                      </Button>
                      <Button variant="outline" onClick={() => setStatus("active")}>
                        Ver todos os hábitos
                      </Button>
                    </div>
                  </>
                ) : status === "archived" ? (
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
            <motion.div layout className="space-y-4">
              {filteredHabits.map((habit, index) => {
                const archived = !habit.is_active;
                const completed = isCompletedToday(habit.id);
              const scheduledToday = isScheduledToday(habit);
              const isTimed = isTimedHabit(habit.unit) && habit.goal_value && habit.goal_value > 0;

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
              <Card className={cn(
                "rounded-2xl bg-card border p-5 transition-all duration-200 group cursor-pointer",
                "hover:shadow-lg hover:scale-[1.01] hover:border-primary/30",
                archived ? "border-destructive/30 shadow-lg opacity-60 hover:opacity-70" : "border-border",
                completed && !archived && "border-lime-500/50 bg-lime-500/5 hover:bg-lime-500/10 hover:border-lime-500/70",
                !completed && !archived && scheduledToday && "hover:bg-primary/5"
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Emoji/Icon with completion indicator */}
                    <div className="relative">
                      <div className={cn(
                        "text-3xl transition-all duration-200 group-hover:scale-110",
                        completed && "opacity-50"
                      )}>
                        {habit.emoji}
                      </div>
                      {completed && (
                        <div className="absolute -bottom-1 -right-1 bg-lime-500 rounded-full p-0.5">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      )}
                      {isTimed && !completed && scheduledToday && (
                        <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                          <Clock className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={cn(
                          "text-xl font-bold text-foreground",
                          completed && "line-through opacity-60"
                        )}>
                          {habit.name}
                        </h3>
                        {scheduledToday && !archived && (
                          <Badge variant="outline" className="text-[10px] bg-lime-500/10 text-lime-600 border-lime-500/30">
                            HOJE
                          </Badge>
                        )}
                        {completed && (
                          <Badge className="text-[10px] bg-lime-500 text-white">
                            FEITO
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-md px-2 py-1 bg-secondary border border-border font-medium">
                          {categories.find((item) => item.id === habit.category)?.label ?? habit.category}
                        </span>
                        <span className="rounded-md px-2 py-1 bg-secondary border border-border font-medium">
                          {periods.find((period) => period.id === habit.period)?.label ?? habit.period}
                        </span>
                        {isTimed && (
                          <span className="rounded-md px-2 py-1 bg-primary/10 border border-primary/30 font-medium text-primary flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {habit.goal_value} {habit.unit === "minutes" ? "min" : "h"}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span className="font-semibold">{habit.streak} dias</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {weekdayLabels.map((label, dayIndex) => {
                          const active = habit.days_of_week.includes(dayIndex);
                          const isToday = dayIndex === new Date().getDay();
                          return (
                            <span
                              key={`${habit.id}-${label}`}
                              className={cn(
                                "rounded-md px-2 py-1 text-xs font-semibold transition",
                                active
                                  ? "bg-primary/20 text-primary border border-primary/30"
                                  : "bg-secondary text-muted-foreground border border-border",
                                isToday && active && "ring-2 ring-lime-400 ring-offset-1"
                              )}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {/* Quick toggle button */}
                    {!archived && scheduledToday && (
                      <Button
                        variant={completed ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggle(habit)}
                        className={cn(
                          "h-9 px-3",
                          completed
                            ? "bg-lime-500/10 border-lime-500/30 text-lime-600 hover:bg-lime-500/20"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        {isTimed && !completed ? (
                          <>
                            <Clock className="h-4 w-4 mr-1" />
                            Iniciar
                          </>
                        ) : completed ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Feito
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Fazer
                          </>
                        )}
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground hover:bg-muted">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onSelect={() => handleEdit(habit)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDuplicate(habit)}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleToggle(habit)} disabled={!habit.is_active}>
                          <Check className="mr-2 h-4 w-4" /> {completed ? "Desmarcar" : "Concluir hoje"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleArchiveToggle(habit)}>
                          {habit.is_active ? "Arquivar" : "Reativar"}
                        </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setDeleteTarget(habit)} className="text-destructive">
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

      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent className="flex flex-col gap-6 sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Editar hábito</SheetTitle>
            <SheetDescription>Atualize nome, emoji/ícone, cor, meta, frequência e agenda.</SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-foreground">Nome</label>
                <Input
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ex: Meditar 10 minutos"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-foreground">Emoji</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {HABIT_EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      type="button"
                      variant={formState.emoji === emoji ? "default" : "outline"}
                      className={`h-10 ${formState.emoji === emoji ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary border-border hover:bg-muted"}`}
                      onClick={() => setFormState((prev) => ({ ...prev, emoji }))}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-foreground">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                        formState.category === category.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                      }`}
                      onClick={() => setFormState((prev) => ({ ...prev, category: category.id }))}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-foreground">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {iconKeys.map((key) => {
                    const Icon = getHabitIcon(key);
                    return (
                      <Button
                        key={key}
                        type="button"
                        variant={formState.icon_key === key ? "default" : "outline"}
                        size="sm"
                        className={`gap-2 ${formState.icon_key === key ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary border-border hover:bg-muted"}`}
                        onClick={() => setFormState((prev) => ({ ...prev, icon_key: key }))}
                      >
                        {Icon ? <Icon className="h-4 w-4" /> : "?"}
                        {key}
                      </Button>
                    );
                  })}
                  <Button
                    type="button"
                    variant={!formState.icon_key ? "default" : "ghost"}
                    size="sm"
                    className={!formState.icon_key ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted"}
                    onClick={() => setFormState((prev) => ({ ...prev, icon_key: null }))}
                  >
                    Usar emoji
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-foreground">Cor do hábito (opcional)</label>
                <Input
                  type="color"
                  value={formState.color ?? "#000000"}
                  onChange={(event) => setFormState((prev) => ({ ...prev, color: event.target.value || null }))}
                  className="h-10 w-full bg-secondary border-border"
                />
                <Input
                  type="text"
                  value={formState.color ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, color: event.target.value || null }))}
                  placeholder="Ou digite ex: #34d399"
                  className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-foreground">Período</label>
                <div className="flex gap-2">
                  {periods.map((period) => (
                    <Button
                      key={period.id}
                      type="button"
                      variant={formState.period === period.id ? "default" : "outline"}
                      className={formState.period === period.id ? "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" : "bg-secondary border-border hover:bg-muted"}
                      onClick={() => setFormState((prev) => ({ ...prev, period: period.id as HabitFormState["period"] }))}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-foreground">Meta (opcional)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={formState.goal_value ?? ""}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        goal_value: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                    placeholder="Ex.: 5000"
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="flex flex-wrap gap-2">
                    {["none", "steps", "minutes", "km", "custom"].map((u) => (
                      <Button
                        key={u}
                        type="button"
                        variant={formState.unit === u ? "default" : "outline"}
                        size="sm"
                        className={formState.unit === u ? "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" : "bg-secondary border-border hover:bg-muted"}
                        onClick={() => setFormState((prev) => ({ ...prev, unit: u as HabitFormState["unit"] }))}
                      >
                        {u}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-foreground">Frequência</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-secondary border-border text-foreground"
                  value={formState.frequency_type ?? "fixed_days"}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      frequency_type: event.target.value as HabitFormState["frequency_type"],
                      times_per_week: undefined,
                      times_per_month: undefined,
                      every_n_days: undefined,
                    }))
                  }
                >
                  <option value="fixed_days">Dias específicos</option>
                  <option value="times_per_week">X vezes por semana</option>
                  <option value="times_per_month">X vezes por mês</option>
                  <option value="every_n_days">A cada N dias</option>
                  <option value="daily">Todos os dias</option>
                </select>

                {formState.frequency_type === "times_per_week" && (
                  <Input
                    type="number"
                    min={1}
                    max={7}
                    value={formState.times_per_week ?? ""}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        times_per_week: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                    placeholder="Ex.: 4 vezes/semana"
                  />
                )}

                {formState.frequency_type === "times_per_month" && (
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={formState.times_per_month ?? ""}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        times_per_month: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                    placeholder="Ex.: 10 vezes/mês"
                  />
                )}

                {formState.frequency_type === "every_n_days" && (
                  <Input
                    type="number"
                    min={1}
                    value={formState.every_n_days ?? ""}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        every_n_days: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                    placeholder="Ex.: a cada 2 dias"
                  />
                )}
              </div>

              {(formState.frequency_type === "fixed_days" || !formState.frequency_type) && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wide text-foreground">Dias da semana</label>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {weekdayLabels.map((label, index) => {
                      const active = formState.days_of_week.includes(index);
                      return (
                        <Toggle
                          key={label}
                          pressed={active}
                          onPressedChange={() => handleToggleDay(index)}
                          className={active ? "bg-primary/20 text-primary border border-primary/30 data-[state=on]:bg-primary/20 data-[state=on]:text-primary" : "bg-secondary text-muted-foreground border border-border"}
                        >
                          {label}
                        </Toggle>
                      );
                    })}
                  </div>
                </div>
              )}

              {formState.frequency_type === "daily" && (
                <p className="text-xs text-muted-foreground">Este hábito ficará programado para todos os dias.</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Lembrete</p>
                    <p className="text-xs text-muted-foreground">Receba um alerta para não esquecer.</p>
                  </div>
                  <Toggle
                    pressed={Boolean(formState.notification_pref?.reminder_enabled)}
                    onPressedChange={(pressed) =>
                      setFormState((prev) => ({
                        ...prev,
                        notification_pref: {
                          reminder_enabled: pressed,
                          reminder_time: prev.notification_pref?.reminder_time ?? "08:00",
                          sound: prev.notification_pref?.sound ?? "default",
                          time_sensitive: prev.notification_pref?.time_sensitive ?? false,
                        },
                      }))
                    }
                  >
                    {formState.notification_pref?.reminder_enabled ? "Ativo" : "Inativo"}
                  </Toggle>
                </div>

                {formState.notification_pref?.reminder_enabled && (
                  <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Horário</label>
                      <Input
                        type="time"
                        value={formState.notification_pref?.reminder_time ?? "08:00"}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            notification_pref: {
                              ...prev.notification_pref,
                              reminder_enabled: true,
                              reminder_time: event.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Som</label>
                      <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={formState.notification_pref?.sound ?? "default"}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            notification_pref: {
                              ...prev.notification_pref,
                              reminder_enabled: true,
                              sound: event.target.value,
                            },
                          }))
                        }
                      >
                        <option value="default">Padrão</option>
                        <option value="soft">Suave</option>
                        <option value="bright">Vibrante</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="time-sensitive"
                        type="checkbox"
                        checked={Boolean(formState.notification_pref?.time_sensitive)}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            notification_pref: {
                              ...prev.notification_pref,
                              reminder_enabled: true,
                              time_sensitive: event.target.checked,
                            },
                          }))
                        }
                        className="h-4 w-4 rounded border-border"
                      />
                      <label htmlFor="time-sensitive" className="text-sm text-muted-foreground">
                        Marcar como sensível ao tempo
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Lembretes personalizados</p>
                    <p className="text-xs text-muted-foreground">
                      {prefs.notificationsEnabled
                        ? "Adicione horários extras para lembrar do hábito."
                        : "Ative notificações nas preferências para usar lembretes."}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addNotification}
                    disabled={notifLoading || !editingHabit || !prefs.notificationsEnabled}
                  >
                    + Horário
                  </Button>
                </div>
                {notifLoading && <p className="text-xs text-muted-foreground">Sincronizando...</p>}
                {notifications.length === 0 && !notifLoading && (
                  <p className="text-xs text-muted-foreground">Nenhum horário extra configurado.</p>
                )}
                <div className="space-y-2">
                  {notifications
                    .slice()
                    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))
                    .map((notif) => (
                      <div key={notif.id} className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/30 p-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={notif.time?.slice(0, 5) ?? "08:00"}
                            className="max-w-[120px]"
                            onChange={(event) => updateNotificationTime(notif.id, event.target.value)}
                          />
                          <select
                            className="rounded-md border px-2 py-1 text-xs"
                            value={notif.sound ?? "default"}
                            onChange={(event) => updateNotificationSound(notif.id, event.target.value)}
                          >
                            <option value="default">Som padrão</option>
                            <option value="soft">Suave</option>
                            <option value="bright">Vibrante</option>
                          </select>
                          <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={Boolean(notif.time_sensitive)}
                              onChange={(event) => updateNotificationSensitivity(notif.id, event.target.checked)}
                              className="h-4 w-4 rounded border-border"
                            />
                            Time-sensitive
                          </label>
                          <Button variant="ghost" size="sm" onClick={() => removeNotification(notif.id)}>
                            Remover
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Tipo: {notif.type === "reminder" ? "Lembrete" : "Concluído"}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="flex justify-between gap-3">
            <SheetClose asChild>
              <Button variant="outline" className="bg-secondary border-border hover:bg-muted">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar alterações
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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

      <NavigationBar />

      {/* Timer Modal */}
      {timerHabit && (
        <TimerModal
          habit={timerHabit}
          isOpen={!!timerHabit}
          onClose={() => setTimerHabit(null)}
          onComplete={handleTimerComplete}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Streak Celebration */}
      <StreakCelebration
        show={celebration.show}
        onDismiss={() => setCelebration({ ...celebration, show: false })}
        streakDays={todayStats.longestStreak}
        type={celebration.type}
        habitName={celebration.habitName}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default MyHabits;

