import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  X,
  Target,
  Calendar,
  Bell,
  BellRing,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "@/hooks/useTheme";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useHabits, Habit } from "@/hooks/useHabits";
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { HabitIconKey, getHabitIcon, getHabitIconWithFallback } from "@/components/icons/HabitIcons";
import { HeroCircle } from "@/components/HeroCircle";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const periods: Array<{ id: "morning" | "afternoon" | "evening"; name: string }> = [
  { id: "morning", name: "Manhã" },
  { id: "afternoon", name: "Tarde" },
  { id: "evening", name: "Noite" },
];

const weekdays = [
  { id: 1, label: "Seg" },
  { id: 2, label: "Ter" },
  { id: 3, label: "Qua" },
  { id: 4, label: "Qui" },
  { id: 5, label: "Sex" },
  { id: 6, label: "Sáb" },
  { id: 0, label: "Dom" },
];

const categories = [
  { id: "mente", label: "Mente" },
  { id: "corpo", label: "Corpo" },
  { id: "estudo", label: "Estudo" },
  { id: "carreira", label: "Carreira" },
  { id: "relacionamento", label: "Relacionamento" },
  { id: "financeiro", label: "Financeiro" },
  { id: "productivity", label: "Produtividade" },
  { id: "fitness", label: "Saúde/Fitness" },
  { id: "nutrition", label: "Alimentação" },
  { id: "time_routine", label: "Tempo/Rotina" },
  { id: "avoid", label: "Evitar" },
  { id: "outro", label: "Outro" },
];

type Step = "details" | "confirm";
type FrequencyType = "daily" | "fixed_days";

const UNIFIED_COLOR = "#A3E635";

const EditHabit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { habits, updateHabit, loading: habitsLoading } = useHabits();
  const { prefs } = useAppPreferences();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const [habitName, setHabitName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("mente");
  const [selectedIconKey, setSelectedIconKey] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [goalValue, setGoalValue] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState<"none" | "steps" | "minutes" | "km" | "hours" | "pages" | "liters" | "custom">("none");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("daily");
  const [selectedPeriod, setSelectedPeriod] = useState<typeof periods[number]["id"]>("morning");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [notificationSound, setNotificationSound] = useState<"default" | "soft" | "bright">("default");
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [habitLoaded, setHabitLoaded] = useState(false);

  // Find the habit to edit
  const habit = useMemo(() => {
    return habits.find((h) => h.id === id);
  }, [habits, id]);

  // Load habit data when found
  useEffect(() => {
    if (habit && !habitLoaded) {
      setHabitName(habit.name);
      setSelectedCategory(habit.category);
      setSelectedIconKey(habit.icon_key ?? null);
      setSelectedColor(habit.color ?? null);
      setGoalValue(habit.goal_value ?? undefined);
      setUnit((habit.unit as typeof unit) ?? "none");
      setSelectedPeriod(habit.period);
      setSelectedDays(habit.days_of_week ?? [1, 2, 3, 4, 5, 6, 0]);

      // Determine frequency type from days
      if (habit.days_of_week?.length === 7) {
        setFrequencyType("daily");
      } else {
        setFrequencyType("fixed_days");
      }

      // Notifications
      const notifPref = habit.notification_pref as any;
      if (notifPref) {
        setNotificationsEnabled(notifPref.reminder_enabled ?? false);
        setNotificationSound(notifPref.sound ?? "default");
      }

      setHabitLoaded(true);
    }
  }, [habit, habitLoaded]);

  const soundOptions: Array<{ value: "default" | "soft" | "bright"; label: string; description: string }> = [
    { value: "default", label: "Padrão", description: "Alerta equilibrado para o dia a dia" },
    { value: "soft", label: "Suave", description: "Discreto, sem assustar" },
    { value: "bright", label: "Vibrante", description: "Curto e chamativo" },
  ];

  const themeColors = isDarkMode
    ? {
        overlay: "bg-black/90",
        container: "bg-[#0a0a0a]",
        headerBorder: "border-white/10",
        headerText: "text-white",
        headerIcon: "text-white/80 hover:text-white hover:bg-white/5",
        sectionTitle: "text-white/40",
        bodyText: "text-white",
        bodyTextSecondary: "text-white/60",
        bodyTextMuted: "text-white/50",
        card: "bg-white/5 border-white/10",
        cardHover: "hover:bg-white/10",
        input: "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-lime-400/50 focus:ring-lime-400/20",
        buttonInactive: "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
        buttonActive: "bg-lime-400 text-black",
        iconBg: "bg-lime-400/10",
        iconColor: "text-lime-400",
      }
    : {
        overlay: "bg-primary/95",
        container: "bg-primary",
        headerBorder: "border-white/20",
        headerText: "text-white",
        headerIcon: "text-white/80 hover:text-white hover:bg-white/10",
        sectionTitle: "text-white/70",
        bodyText: "text-white",
        bodyTextSecondary: "text-white/80",
        bodyTextMuted: "text-white/60",
        card: "bg-black/10 border-white/20",
        cardHover: "hover:bg-black/15",
        input: "bg-black/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20",
        buttonInactive: "bg-black/10 text-white/80 hover:bg-black/15 hover:text-white",
        buttonActive: "bg-white text-primary",
        iconBg: "bg-white/20",
        iconColor: "text-white",
      };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((value) => value !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!habit) return;

    if (!habitName.trim()) {
      toast({
        title: "Informe um nome",
        description: "Escolha um título para o hábito antes de salvar",
        variant: "destructive",
      });
      return;
    }

    if (frequencyType === "fixed_days" && selectedDays.length === 0) {
      toast({
        title: "Selecione dias",
        description: "Escolha ao menos um dia da semana",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const days =
        frequencyType === "daily"
          ? [0, 1, 2, 3, 4, 5, 6]
          : [...selectedDays].sort((a, b) => a - b);

      await updateHabit(habit.id, {
        name: habitName.trim(),
        category: selectedCategory,
        period: selectedPeriod,
        days_of_week: days,
        color: selectedColor,
        icon_key: selectedIconKey,
        unit,
        goal_value: goalValue ?? null,
        frequency_type: frequencyType,
        notification_pref: notificationsEnabled
          ? {
              reminder_enabled: true,
              reminder_time: "08:00",
              sound: notificationSound,
              time_sensitive: false,
            }
          : null,
      });

      toast({ title: "Hábito atualizado com sucesso!" });
      navigate("/habits");
    } catch (error) {
      console.error("Failed to update habit", error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderFrequencyFields = () => {
    if (frequencyType === "fixed_days") {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedDays([0, 1, 2, 3, 4, 5, 6])}
              className={`rounded-lg py-2 text-xs font-semibold transition-all duration-200 ${themeColors.buttonInactive}`}
            >
              Selecionar todos
            </button>
            <button
              type="button"
              onClick={() => setSelectedDays([])}
              className={`rounded-lg py-2 text-xs font-semibold transition-all duration-200 ${themeColors.buttonInactive}`}
            >
              Limpar
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
            {weekdays.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                aria-pressed={selectedDays.includes(day.id)}
                className={`rounded-xl py-3 text-sm font-bold transition-all duration-200 ${
                  selectedDays.includes(day.id)
                    ? themeColors.buttonActive
                    : themeColors.buttonInactive
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const getFrequencyText = () => {
    if (frequencyType === "daily") return "Todos os dias";
    if (frequencyType === "fixed_days") {
      const sortedDays = [...selectedDays].sort((a, b) => {
        const order = [1, 2, 3, 4, 5, 6, 0];
        return order.indexOf(a) - order.indexOf(b);
      });
      return sortedDays.map((d) => weekdays.find((w) => w.id === d)?.label).join(", ");
    }
    return "Personalizado";
  };

  const getGoalText = () => {
    if (!goalValue || goalValue <= 0) return "Completar";
    const unitLabels: Record<string, string> = {
      none: "",
      steps: "passos",
      minutes: "minutos",
      km: "km",
      hours: "horas",
      pages: "páginas",
      liters: "litros",
      custom: "unidades",
    };
    return `${goalValue} ${unitLabels[unit] || ""}`.trim();
  };

  // Loading state
  if (habitsLoading || !habitLoaded) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${themeColors.overlay}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className={themeColors.bodyTextSecondary}>Carregando hábito...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!habit) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${themeColors.overlay}`}>
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <Target className="h-16 w-16 text-muted-foreground" />
          <h2 className={`text-xl font-bold ${themeColors.bodyText}`}>Hábito não encontrado</h2>
          <p className={themeColors.bodyTextSecondary}>Este hábito pode ter sido excluído.</p>
          <Button onClick={() => navigate("/habits")} variant="outline">
            Voltar para Meus Hábitos
          </Button>
        </div>
      </div>
    );
  }

  const HeaderBar = (
    <div className={`flex items-center justify-between px-4 py-4 border-b ${themeColors.headerBorder}`}>
      {step === "confirm" ? (
        <button
          onClick={() => setStep("details")}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${themeColors.headerIcon}`}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      ) : (
        <button
          onClick={() => navigate("/habits")}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${themeColors.headerIcon}`}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <div className="text-center">
        <p className={`text-base font-semibold tracking-wide ${themeColors.headerText}`}>
          {step === "details" ? "Editar Tarefa" : "Confirmar Alterações"}
        </p>
      </div>
      <button
        onClick={() => navigate("/habits")}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${themeColors.headerIcon}`}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );

  const DetailsStep = (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6 pb-6 pt-4"
    >
      {/* Hero Circle Section */}
      <div className="flex flex-col items-center gap-4 py-4">
        <HeroCircle
          iconKey={selectedIconKey as HabitIconKey | null}
          color={isDarkMode ? UNIFIED_COLOR : "#FFFFFF"}
          isAutoTask={false}
        />
        <div className="w-full px-6 text-center">
          <p className={`text-2xl font-bold uppercase tracking-wide ${themeColors.bodyText}`}>
            {habitName || "NOME DO HÁBITO"}
          </p>
        </div>
      </div>

      {/* Title Input */}
      <div className="px-4">
        <Label className={`text-[10px] font-bold uppercase tracking-widest ${themeColors.sectionTitle}`}>
          TÍTULO
        </Label>
        <Input
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          placeholder="Digite o nome da tarefa"
          maxLength={18}
          className={`mt-2 rounded-xl ${themeColors.input}`}
        />
        <p className={`mt-1.5 text-right text-xs ${themeColors.sectionTitle}`}>
          {habitName.length} / 18
        </p>
      </div>

      {/* Category Selection */}
      <div className="px-4">
        <Label className={`text-[10px] font-bold uppercase tracking-widest ${themeColors.sectionTitle}`}>
          CATEGORIA
        </Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                selectedCategory === cat.id
                  ? themeColors.buttonActive
                  : themeColors.buttonInactive
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Period Selection */}
      <div className="px-4">
        <Label className={`text-[10px] font-bold uppercase tracking-widest ${themeColors.sectionTitle}`}>
          PERÍODO DO DIA
        </Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {periods.map((period) => (
            <button
              key={period.id}
              type="button"
              onClick={() => setSelectedPeriod(period.id)}
              className={`rounded-xl py-3 text-sm font-bold transition-all duration-200 ${
                selectedPeriod === period.id
                  ? themeColors.buttonActive
                  : themeColors.buttonInactive
              }`}
            >
              {period.name}
            </button>
          ))}
        </div>
      </div>

      {/* Goal Input */}
      <div className="px-4">
        <Label className={`text-[10px] font-bold uppercase tracking-widest ${themeColors.sectionTitle}`}>
          META (OPCIONAL)
        </Label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Input
            type="number"
            min={0}
            value={goalValue ?? ""}
            onChange={(e) => setGoalValue(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Ex: 30"
            className={`rounded-xl ${themeColors.input}`}
          />
          <Select value={unit} onValueChange={(val) => setUnit(val as typeof unit)}>
            <SelectTrigger className={`rounded-xl ${themeColors.input}`}>
              <SelectValue placeholder="Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="minutes">Minutos</SelectItem>
              <SelectItem value="hours">Horas</SelectItem>
              <SelectItem value="steps">Passos</SelectItem>
              <SelectItem value="km">Km</SelectItem>
              <SelectItem value="pages">Páginas</SelectItem>
              <SelectItem value="liters">Litros</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Frequency Card */}
      <div className={`mx-4 overflow-hidden rounded-2xl border ${themeColors.card}`}>
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeColors.iconBg}`}>
              <Calendar className={`h-6 w-6 ${themeColors.iconColor}`} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${themeColors.sectionTitle}`}>
                Frequência
              </p>
              <p className={`text-base font-semibold ${themeColors.bodyText}`}>
                {frequencyType === "daily" ? "Todo dia" : "Dias específicos"}
              </p>
            </div>
          </div>
        </div>
        <div className={`border-t px-4 py-4 space-y-3 ${themeColors.headerBorder}`}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "daily", label: "Todo dia" },
              { value: "fixed_days", label: "Dias específicos" },
            ].map((freqOption) => (
              <button
                key={freqOption.value}
                type="button"
                onClick={() => setFrequencyType(freqOption.value as FrequencyType)}
                className={`rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 ${
                  frequencyType === freqOption.value
                    ? themeColors.buttonActive
                    : themeColors.buttonInactive
                }`}
              >
                {freqOption.label}
              </button>
            ))}
          </div>
          <div>{renderFrequencyFields()}</div>
        </div>
      </div>

      {/* Notifications Card */}
      <div className={`mx-4 overflow-hidden rounded-2xl border ${themeColors.card}`}>
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeColors.iconBg}`}>
              <Bell className={`h-6 w-6 ${themeColors.iconColor}`} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${themeColors.sectionTitle}`}>
                Notificações
              </p>
              <p className={`text-base font-semibold ${themeColors.bodyText}`}>
                {notificationsEnabled ? "Ativadas" : "Desativadas"}
              </p>
            </div>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={(checked) => setNotificationsEnabled(checked)}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {notificationsEnabled && (
          <div className="px-4 pb-4 space-y-3">
            <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${themeColors.iconBg}`}>
                  <BellRing className={`h-5 w-5 ${themeColors.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${themeColors.bodyText}`}>Som da notificação</p>
                  <Select value={notificationSound} onValueChange={(val) => setNotificationSound(val as typeof notificationSound)}>
                    <SelectTrigger className={`mt-2 h-11 w-full rounded-lg ${themeColors.input}`}>
                      <SelectValue placeholder="Escolha um som" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {soundOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-xs text-muted-foreground">{opt.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Button - Go to Confirm */}
      <div
        className="px-4 pt-4"
        style={{ paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}
      >
        <button
          onClick={() => setStep("confirm")}
          disabled={!habitName.trim()}
          className="h-14 w-full rounded-xl text-base font-bold uppercase tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: isDarkMode ? UNIFIED_COLOR : "#FFFFFF",
            color: isDarkMode ? "#000000" : "#65A30D",
            boxShadow: isDarkMode ? "0 4px 24px rgba(163, 230, 53, 0.3)" : "0 4px 24px rgba(255, 255, 255, 0.3)",
          }}
        >
          CONTINUAR
        </button>
      </div>
    </motion.div>
  );

  const ConfirmStep = (
    <motion.div
      key="confirm"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6 pb-6 pt-6"
    >
      {/* Hero Section */}
      <div className="flex flex-col items-center gap-5 px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <HeroCircle
            iconKey={selectedIconKey as HabitIconKey | null}
            color={isDarkMode ? UNIFIED_COLOR : "#FFFFFF"}
            isAutoTask={false}
            size="lg"
          />
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-center"
        >
          <h2 className={`text-2xl font-bold uppercase tracking-wide ${themeColors.bodyText}`}>
            {habitName}
          </h2>
          <p className={`mt-1 text-sm ${themeColors.bodyTextSecondary}`}>
            {categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}
          </p>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="space-y-3 px-4"
      >
        {/* Goal Summary */}
        <div className={`flex items-center justify-between rounded-xl border p-4 ${themeColors.card}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${themeColors.iconBg}`}>
              <Target className={`h-5 w-5 ${themeColors.iconColor}`} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${themeColors.sectionTitle}`}>
                Meta
              </p>
              <p className={`text-sm font-semibold ${themeColors.bodyText}`}>
                {getGoalText()}
              </p>
            </div>
          </div>
        </div>

        {/* Frequency Summary */}
        <div className={`flex items-center justify-between rounded-xl border p-4 ${themeColors.card}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${themeColors.iconBg}`}>
              <Calendar className={`h-5 w-5 ${themeColors.iconColor}`} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${themeColors.sectionTitle}`}>
                Frequência
              </p>
              <p className={`text-sm font-semibold ${themeColors.bodyText}`}>
                {getFrequencyText()}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Summary */}
        <div className={`flex items-center justify-between rounded-xl border p-4 ${themeColors.card}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${themeColors.iconBg}`}>
              <Bell className={`h-5 w-5 ${themeColors.iconColor}`} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${themeColors.sectionTitle}`}>
                Notificações
              </p>
              <p className={`text-sm font-semibold ${themeColors.bodyText}`}>
                {notificationsEnabled ? `Ativadas • ${soundOptions.find((s) => s.value === notificationSound)?.label ?? "Padrão"}` : "Desativadas"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Button */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="px-4"
      >
        <button
          onClick={() => setStep("details")}
          className={`w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${themeColors.buttonInactive}`}
        >
          Editar configurações
        </button>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="px-4 pt-2"
        style={{ paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}
      >
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="h-14 w-full rounded-xl text-base font-bold uppercase tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: isDarkMode ? UNIFIED_COLOR : "#FFFFFF",
            color: isDarkMode ? "#000000" : "#65A30D",
            boxShadow: isDarkMode ? "0 4px 24px rgba(163, 230, 53, 0.3)" : "0 4px 24px rgba(255, 255, 255, 0.3)",
          }}
        >
          {isSaving ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center transition-colors duration-300 ${themeColors.overlay}`}>
      <div className={`mt-4 w-full max-w-md overflow-hidden rounded-3xl shadow-2xl animate-fade-in transition-colors duration-300 ${themeColors.container}`} style={{ maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 2rem)' }}>
        {HeaderBar}
        <div className="overflow-y-auto overscroll-contain scrollbar-hide" style={{ maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 6rem)' }}>
          <AnimatePresence mode="wait">
            {step === "details" && DetailsStep}
            {step === "confirm" && ConfirmStep}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EditHabit;
