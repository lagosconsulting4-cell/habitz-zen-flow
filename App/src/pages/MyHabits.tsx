import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import { useToast } from "@/hooks/use-toast";
import { useHabits, Habit } from "@/hooks/useHabits";
import { Loader2, MoreVertical, Check, Copy, Edit, Trash2, Sparkles, Target } from "lucide-react";
import { HABIT_EMOJIS } from "@/data/habit-emojis";
import type { HabitEmoji } from "@/data/habit-emojis";
import { getHabitIcon } from "@/lib/habit-icons";
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
const iconKeys = ["heart", "run", "bike", "meditate", "banana", "carrot", "check", "water", "dumbbell", "focus", "target", "book", "flame"];

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
  icon_key?: string | null;
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
  const {
    habits,
    loading,
    toggleHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
    deleteHabit,
    duplicateHabit,
  } = useHabits();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formState, setFormState] = useState<HabitFormState>(createFormState());
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [notifications, setNotifications] = useState<HabitNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const { prefs } = useAppPreferences();

  const filteredHabits = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return habits
      .filter((habit) => (status === "active" ? habit.is_active : !habit.is_active))
      .filter((habit) => (term ? habit.name.toLowerCase().includes(term) : true))
      .filter((habit) =>
        selectedCategories.length > 0 ? selectedCategories.includes(habit.category) : true,
      )
      .filter((habit) =>
        selectedPeriods.length > 0 ? selectedPeriods.includes(habit.period) : true,
      );
  }, [habits, status, searchTerm, selectedCategories, selectedPeriods]);

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
    try {
      await toggleHabit(habit.id);
      toast({ title: "Dia marcado" });
    } catch (error) {
      // toast handled no need
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
    <div className="min-h-screen bg-[#000000] pb-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-6 max-w-4xl"
      >
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide text-white flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-lime-400" />
              Meus Hábitos
            </h1>
            <p className="text-sm text-white/60">
              Gerencie seus hábitos, agenda semanal e conclua tarefas do dia.
            </p>
          </div>
          <Button asChild className="bg-lime-400 text-black hover:bg-lime-500 font-semibold">
            <Link to="/create">Adicionar novo hábito</Link>
          </Button>
        </div>

        <Card className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              placeholder="Buscar hábito"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="md:max-w-sm bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
            <Tabs value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <TabsList className="grid grid-cols-2 rounded-full bg-white/5 p-1">
                <TabsTrigger
                  value="active"
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-white/60 transition-all data-[state=active]:bg-lime-400 data-[state=active]:text-black data-[state=active]:font-semibold"
                >
                  Ativos
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-white/60 transition-all data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:font-semibold"
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
                    ? "bg-lime-400 text-black"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
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
                    ? "bg-lime-400 text-black"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
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
          <Card className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-lime-400" />
          </Card>
        ) : filteredHabits.length === 0 ? (
          <Card className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
            <h2 className="text-lg font-bold uppercase tracking-wide text-white mb-2">Nenhum hábito encontrado</h2>
            <p className="text-sm text-white/60">
              Ajuste os filtros ou cadastre um novo hábito para começar.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHabits.map((habit, index) => {
              const archived = !habit.is_active;

              return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
              <Card className={cn("rounded-2xl bg-white/5 border p-5 transition-colors duration-200", archived ? "border-red-500/30 shadow-lg" : "border-white/10")}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{habit.emoji}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">{habit.name}</h3>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/60">
                        <span className="rounded-md px-2 py-1 bg-white/5 border border-white/10 font-medium">
                          {categories.find((item) => item.id === habit.category)?.label ?? habit.category}
                        </span>
                        <span className="rounded-md px-2 py-1 bg-white/5 border border-white/10 font-medium">
                          {periods.find((period) => period.id === habit.period)?.label ?? habit.period}
                        </span>
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-lime-400" />
                          <span className="font-semibold">{habit.streak} dias de sequência</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {weekdayLabels.map((label, index) => {
                          const active = habit.days_of_week.includes(index);
                          return (
                            <span
                              key={`${habit.id}-${label}`}
                              className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                                active
                                  ? "bg-lime-400/20 text-lime-400 border border-lime-400/30"
                                  : "bg-white/5 text-white/40 border border-white/10"
                              }`}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/10">
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
                        <Check className="mr-2 h-4 w-4" /> Concluir hoje
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
              </Card>
              </motion.div>
            );
          })}
          </div>
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
                <label className="text-sm font-semibold uppercase tracking-wide text-white">Nome</label>
                <Input
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ex: Meditar 10 minutos"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-white">Emoji</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {HABIT_EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      type="button"
                      variant={formState.emoji === emoji ? "default" : "outline"}
                      className={`h-10 ${formState.emoji === emoji ? "bg-lime-400 text-black hover:bg-lime-500" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                      onClick={() => setFormState((prev) => ({ ...prev, emoji }))}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-white">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                        formState.category === category.id
                          ? "bg-lime-400 text-black"
                          : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                      }`}
                      onClick={() => setFormState((prev) => ({ ...prev, category: category.id }))}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-white">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {iconKeys.map((key) => {
                    const Icon = getHabitIcon(key);
                    return (
                      <Button
                        key={key}
                        type="button"
                        variant={formState.icon_key === key ? "default" : "outline"}
                        size="sm"
                        className={`gap-2 ${formState.icon_key === key ? "bg-lime-400 text-black hover:bg-lime-500" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
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
                    className={!formState.icon_key ? "bg-lime-400 text-black hover:bg-lime-500" : "hover:bg-white/10"}
                    onClick={() => setFormState((prev) => ({ ...prev, icon_key: null }))}
                  >
                    Usar emoji
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-white">Cor do hábito (opcional)</label>
                <Input
                  type="color"
                  value={formState.color ?? "#000000"}
                  onChange={(event) => setFormState((prev) => ({ ...prev, color: event.target.value || null }))}
                  className="h-10 w-full bg-white/5 border-white/10"
                />
                <Input
                  type="text"
                  value={formState.color ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, color: event.target.value || null }))}
                  placeholder="Ou digite ex: #34d399"
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-white">Período</label>
                <div className="flex gap-2">
                  {periods.map((period) => (
                    <Button
                      key={period.id}
                      type="button"
                      variant={formState.period === period.id ? "default" : "outline"}
                      className={formState.period === period.id ? "bg-lime-400 text-black hover:bg-lime-500 font-semibold" : "bg-white/5 border-white/10 hover:bg-white/10"}
                      onClick={() => setFormState((prev) => ({ ...prev, period: period.id as HabitFormState["period"] }))}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-white">Meta (opcional)</label>
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
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  <div className="flex flex-wrap gap-2">
                    {["none", "steps", "minutes", "km", "custom"].map((u) => (
                      <Button
                        key={u}
                        type="button"
                        variant={formState.unit === u ? "default" : "outline"}
                        size="sm"
                        className={formState.unit === u ? "bg-lime-400 text-black hover:bg-lime-500 font-semibold" : "bg-white/5 border-white/10 hover:bg-white/10"}
                        onClick={() => setFormState((prev) => ({ ...prev, unit: u as HabitFormState["unit"] }))}
                      >
                        {u}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-white">Frequência</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white/5 border-white/10 text-white"
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
                  <label className="text-sm font-semibold uppercase tracking-wide text-white">Dias da semana</label>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {weekdayLabels.map((label, index) => {
                      const active = formState.days_of_week.includes(index);
                      return (
                        <Toggle
                          key={label}
                          pressed={active}
                          onPressedChange={() => handleToggleDay(index)}
                          className={active ? "bg-lime-400/20 text-lime-400 border border-lime-400/30 data-[state=on]:bg-lime-400/20 data-[state=on]:text-lime-400" : "bg-white/5 text-white/60 border border-white/10"}
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
              <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleSave} disabled={isSaving} className="bg-lime-400 text-black hover:bg-lime-500 font-semibold">
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
    </div>
  );
};

export default MyHabits;

