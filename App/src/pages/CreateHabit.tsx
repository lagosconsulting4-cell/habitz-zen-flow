import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  X,
  ChevronRight,
  Target,
  Calendar,
  Bell,
  BellRing,
  Clock,
  Sun,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "@/hooks/useTheme";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/hooks/useHabits";
import useHabitCatalog, { HabitTemplate } from "@/hooks/useHabitCatalog";
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { HABIT_EMOJIS } from "@/data/habit-emojis";
import type { HabitEmoji } from "@/data/habit-emojis";
import { HabitIconKey, getHabitIcon } from "@/components/icons/HabitIcons";
import { HeroCircle } from "@/components/HeroCircle";
import { HealthIntegrationAlert } from "@/components/HealthIntegrationAlert";
import { SmartGoalCard } from "@/components/goals";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const periods: Array<{ id: "morning" | "afternoon" | "evening"; name: string; emoji: string }> = [
  { id: "morning", name: "Manhã", emoji: "☀️" },
  { id: "afternoon", name: "Tarde", emoji: "🌇" },
  { id: "evening", name: "Noite", emoji: "🌙" },
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

type Step = "select" | "details" | "confirm";
type FrequencyType = "daily" | "fixed_days";

// Cor unificada para todas as categorias - verde lime premium
const UNIFIED_COLOR = "#A3E635";

export const CATEGORY_DATA: Array<{
  id: string;
  name: string;
  description: string;
  iconKey: HabitIconKey;
  colorToken: string;
  tasks: Array<{
    id: string;
    name: string;
    iconKey?: HabitIconKey;
    description?: string;
    default_goal_value?: number;
    default_unit?: "none" | "steps" | "minutes" | "km" | "hours" | "pages" | "liters" | "custom";
    default_frequency_type?: "fixed_days" | "times_per_week" | "times_per_month" | "every_n_days" | "daily";
    default_times_per_week?: number;
    default_times_per_month?: number;
    default_every_n_days?: number;
    default_days_of_week?: number[];
    auto_complete_source?: "manual" | "health";
  }>;
}> = [
  {
    id: "productivity",
    name: "Produtividade",
    description: "Organização pessoal e desenvolvimento",
    iconKey: "plan",
    colorToken: UNIFIED_COLOR,
    tasks: [
      { id: "wake_early", name: "Acordar Cedo", iconKey: "sunrise", default_unit: "none", default_frequency_type: "daily" },
      { id: "make_bed", name: "Fazer a Cama", iconKey: "make_bed", default_unit: "none", default_frequency_type: "daily" },
      { id: "plan_day", name: "Planejar o Dia", iconKey: "plan", default_unit: "minutes", default_goal_value: 10, default_frequency_type: "daily" },
      { id: "review_goals", name: "Revisar Objetivos", iconKey: "review", default_unit: "none", default_frequency_type: "times_per_week", default_times_per_week: 1 },
      { id: "journaling", name: "Journaling", iconKey: "journal", default_unit: "minutes", default_goal_value: 10, default_frequency_type: "daily" },
      { id: "read_books", name: "Ler Livros", iconKey: "book", default_unit: "pages", default_goal_value: 30, default_frequency_type: "daily" },
      { id: "meditate", name: "Meditar", iconKey: "meditate", default_unit: "minutes", default_goal_value: 10, default_frequency_type: "daily" },
      { id: "study", name: "Estudar", iconKey: "study", default_unit: "hours", default_goal_value: 1, default_frequency_type: "daily" },
      { id: "organize_space", name: "Organizar Ambiente", iconKey: "organize", default_unit: "minutes", default_goal_value: 15, default_frequency_type: "daily" },
      { id: "task_list", name: "Fazer Lista de Tarefas", iconKey: "checklist", default_unit: "none", default_frequency_type: "daily" },
    ],
  },
  {
    id: "fitness",
    name: "Saúde/Fitness",
    description: "Saúde física e bem-estar corporal",
    iconKey: "run",
    colorToken: UNIFIED_COLOR,
    tasks: [
      { id: "walk_run", name: "Caminhar ou Correr", default_unit: "steps", default_goal_value: 10000, default_frequency_type: "daily", auto_complete_source: "health" },
      { id: "cycle", name: "Pedalar", iconKey: "cycle", default_unit: "minutes", default_goal_value: 30, default_frequency_type: "times_per_week", default_times_per_week: 3 },
      { id: "swim", name: "Nadar", iconKey: "swim", default_unit: "minutes", default_goal_value: 30, default_frequency_type: "times_per_week", default_times_per_week: 2 },
      { id: "mindful_minutes", name: "Minutos de Atenção Plena", iconKey: "meditate", default_unit: "minutes", default_goal_value: 10, default_frequency_type: "daily", auto_complete_source: "health" },
      { id: "climb_stairs", name: "Subir Escadas", iconKey: "stairs", default_unit: "custom", default_goal_value: 10, default_frequency_type: "daily", auto_complete_source: "health" },
      { id: "activity_rings", name: "Completar Anéis de Atividade", iconKey: "activity_rings", default_unit: "none", default_frequency_type: "daily", auto_complete_source: "health" },
      { id: "stand_hours", name: "Horas em Pé", iconKey: "stand_hours", default_unit: "custom", default_goal_value: 12, default_frequency_type: "daily", auto_complete_source: "health" },
      { id: "exercise_minutes", name: "Minutos de Exercício", iconKey: "exercise_minutes", default_unit: "minutes", default_goal_value: 30, default_frequency_type: "daily", auto_complete_source: "health" },
      { id: "burn_calories", name: "Queimar Calorias", iconKey: "burn_energy", default_unit: "custom", default_goal_value: 500, default_frequency_type: "daily", auto_complete_source: "health" },
      { id: "stretching", name: "Alongamento", iconKey: "stretch", default_unit: "minutes", default_goal_value: 10, default_frequency_type: "daily" },
      { id: "yoga", name: "Yoga", iconKey: "yoga", default_unit: "minutes", default_goal_value: 20, default_frequency_type: "times_per_week", default_times_per_week: 3 },
      { id: "strength_training", name: "Treino de Força", iconKey: "strength", default_unit: "minutes", default_goal_value: 45, default_frequency_type: "times_per_week", default_times_per_week: 3 },
      { id: "drink_water", name: "Beber Água", iconKey: "water", default_unit: "liters", default_goal_value: 2, default_frequency_type: "daily" },
      { id: "sleep_8h", name: "Dormir 8 Horas", iconKey: "sleep", default_unit: "hours", default_goal_value: 8, default_frequency_type: "daily", auto_complete_source: "health" },
    ],
  },
  {
    id: "nutrition",
    name: "Alimentação",
    description: "Nutrição e alimentação saudável",
    iconKey: "meal",
    colorToken: UNIFIED_COLOR,
    tasks: [
      { id: "healthy_breakfast", name: "Café da Manhã Saudável", iconKey: "breakfast", default_unit: "none", default_frequency_type: "daily" },
      { id: "eat_fruits", name: "Comer Frutas", iconKey: "fruits", default_unit: "custom", default_goal_value: 2, default_frequency_type: "daily" },
      { id: "eat_vegetables", name: "Comer Vegetais", iconKey: "vegetables", default_unit: "custom", default_goal_value: 3, default_frequency_type: "daily" },
      { id: "drink_water_2l", name: "Beber 2L de Água", iconKey: "water", default_unit: "liters", default_goal_value: 2, default_frequency_type: "daily" },
      { id: "avoid_sugar", name: "Evitar Açúcar", iconKey: "no_sugar", default_unit: "none", default_frequency_type: "daily" },
      { id: "meal_prep", name: "Preparar Refeições", iconKey: "meal", default_unit: "custom", default_goal_value: 3, default_frequency_type: "times_per_week", default_times_per_week: 1 },
      { id: "eat_protein", name: "Comer Proteína", iconKey: "protein", default_unit: "custom", default_goal_value: 3, default_frequency_type: "daily" },
      { id: "take_vitamins", name: "Tomar Vitaminas", iconKey: "vitamins", default_unit: "none", default_frequency_type: "daily" },
    ],
  },
  {
    id: "time_routine",
    name: "Tempo/Rotina",
    description: "Gestão de tempo e rotinas",
    iconKey: "clock",
    colorToken: UNIFIED_COLOR,
    tasks: [
      { id: "pomodoro", name: "Pomodoro de Trabalho", iconKey: "focus", default_unit: "custom", default_goal_value: 4, default_frequency_type: "times_per_week", default_times_per_week: 5 },
      { id: "deep_focus", name: "Tempo de Foco Profundo", iconKey: "deep_work", default_unit: "hours", default_goal_value: 2, default_frequency_type: "daily" },
      { id: "sleep_on_time", name: "Dormir no Horário", iconKey: "bed", default_unit: "none", default_frequency_type: "daily" },
      { id: "wake_on_time", name: "Acordar no Horário", iconKey: "alarm", default_unit: "none", default_frequency_type: "daily" },
      { id: "screen_free_time", name: "Tempo Sem Telas", iconKey: "no_screens", default_unit: "hours", default_goal_value: 1, default_frequency_type: "daily" },
    ],
  },
  {
    id: "avoid",
    name: "Evitar",
    description: "Hábitos a serem eliminados",
    iconKey: "ban",
    colorToken: UNIFIED_COLOR,
    tasks: [
      { id: "no_smoking", name: "Não Fumar", iconKey: "no_smoke", default_unit: "none", default_frequency_type: "daily" },
      { id: "no_sweets", name: "Não Comer Doces", iconKey: "no_sugar", default_unit: "none", default_frequency_type: "daily" },
      { id: "limit_social_media", name: "Limitar Redes Sociais", iconKey: "social_media", default_unit: "minutes", default_goal_value: 30, default_frequency_type: "daily" },
      { id: "no_skip_meals", name: "Não Pular Refeições", iconKey: "no_skip_meals", default_unit: "custom", default_goal_value: 3, default_frequency_type: "daily" },
      { id: "no_late_sleep", name: "Não Dormir Tarde", iconKey: "no_late_sleep", default_unit: "none", default_frequency_type: "daily" },
      { id: "no_sedentary", name: "Não Ficar Sedentário", iconKey: "active", default_unit: "custom", default_goal_value: 8, default_frequency_type: "daily" },
    ],
  },
];

const fallbackCategories = CATEGORY_DATA.map((c) => ({ id: c.id, name: c.name, color: c.colorToken, icon_key: null }));

const CreateHabit = () => {
  const [habitName, setHabitName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<HabitEmoji>(HABIT_EMOJIS[0]);
  const [selectedCategory, setSelectedCategory] = useState(fallbackCategories[0].id);
  const [selectedColor, setSelectedColor] = useState<string | null>(fallbackCategories[0].color ?? null);
  const [selectedIconKey, setSelectedIconKey] = useState<string | null>(fallbackCategories[0].icon_key ?? null);
  const [goalValue, setGoalValue] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState<"none" | "steps" | "minutes" | "km" | "hours" | "pages" | "liters" | "custom">("none");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("daily");
  const [timesPerWeek, setTimesPerWeek] = useState<number | undefined>(undefined);
  const [timesPerMonth, setTimesPerMonth] = useState<number | undefined>(undefined);
  const [everyNDays, setEveryNDays] = useState<number | undefined>(undefined);
  const [selectedPeriod, setSelectedPeriod] = useState<typeof periods[number]["id"]>(periods[0].id);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [notificationSound, setNotificationSound] = useState<"default" | "soft" | "bright">("default");
  const [reminderTime, setReminderTime] = useState<string>("08:00");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string; iconKey?: HabitIconKey } | null>(null);
  const [selectedTemplateAuto, setSelectedTemplateAuto] = useState<boolean>(false);
  const [step, setStep] = useState<Step>("select");
  const [selectedCategoryData, setSelectedCategoryData] = useState<(typeof CATEGORY_DATA)[number] | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createHabit } = useHabits();
  const { categories: catalogCategories, templates, isLoading: catalogLoading } = useHabitCatalog();
  const { prefs } = useAppPreferences();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  // Sincroniza estado local com preferências do app (fallback)
  useEffect(() => {
    setNotificationsEnabled(prefs.notificationsEnabled);
    setNotificationSound(prefs.defaultSound);
  }, [prefs.notificationsEnabled, prefs.defaultSound]);
  const soundOptions: Array<{ value: "default" | "soft" | "bright"; label: string; description: string }> = [
    { value: "default", label: "Padrão", description: "Alerta equilibrado para o dia a dia" },
    { value: "soft", label: "Suave", description: "Discreto, sem assustar" },
    { value: "bright", label: "Vibrante", description: "Curto e chamativo" },
  ];

  // Cores adaptativas baseadas no tema
  const themeColors = isDarkMode
    ? {
        // Dark mode: fundo escuro, acentos verdes
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
        healthIcon: "text-lime-400",
        taskButton: {
          bg: UNIFIED_COLOR,
          shadow: "0 4px 20px rgba(163, 230, 53, 0.25)",
          iconBg: "bg-black/20",
          iconColor: "text-black",
          text: "text-black",
          chevron: "text-black/60 group-hover:text-black",
        },
        categoryPill: {
          activeBg: UNIFIED_COLOR,
          inactiveBg: "rgba(163, 230, 53, 0.15)",
          activeIcon: "#000000",
          inactiveIcon: UNIFIED_COLOR,
        },
      }
    : {
        // Light mode: fundo verde, elementos brancos/escuros
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
        healthIcon: "text-white",
        taskButton: {
          bg: "#FFFFFF",
          shadow: "0 4px 20px rgba(255, 255, 255, 0.3)",
          iconBg: "bg-primary/20",
          iconColor: "text-primary",
          text: "text-primary",
          chevron: "text-primary/60 group-hover:text-primary",
        },
        categoryPill: {
          activeBg: "#FFFFFF",
          inactiveBg: "rgba(255, 255, 255, 0.2)",
          activeIcon: "#65A30D",
          inactiveIcon: "#FFFFFF",
        },
      };

  const categories = useMemo(() => {
    if (catalogCategories.length > 0) {
      return catalogCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        color: cat.color ?? undefined,
        icon_key: cat.icon_key ?? null,
      }));
    }
    return fallbackCategories;
  }, [catalogCategories]);

  // REMOVIDO: useEffect que sobrescrevia selectedCategory com valores do catálogo
  // Isso causava erro de constraint pois o catálogo pode ter IDs antigos
  // Agora usamos sempre CATEGORY_DATA.id que tem os valores válidos

  // Seleciona a primeira categoria por padrão ao abrir
  useEffect(() => {
    if (!selectedCategoryData && step === "select" && CATEGORY_DATA.length > 0) {
      handleSelectCategory(CATEGORY_DATA[0]);
    }
  }, [step]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((value) => value !== day) : [...prev, day]
    );
  };

  const clearTemplateSelection = () => {
    setSelectedTemplateId(null);
    setSelectedTemplate(null);
    setSelectedTemplateAuto(false);
    setHabitName("");
    setGoalValue(undefined);
    setUnit("none");
    setFrequencyType("daily");
    setTimesPerWeek(undefined);
    setTimesPerMonth(undefined);
    setEveryNDays(undefined);
    setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
    setSelectedColor(categories[0]?.color ?? fallbackCategories[0].color ?? null);
    setSelectedIconKey(categories[0]?.icon_key ?? fallbackCategories[0].icon_key ?? null);
    setSelectedCategoryData(null);
    setStep("select");
  };

  const applyTemplate = (template: HabitTemplate) => {
    setSelectedTemplateId(template.id);
    setSelectedTemplate({ id: template.id, name: template.name });
    setSelectedTemplateAuto(template.auto_complete_source === "health");
    setHabitName(template.name);
    if (template.category_id) {
      setSelectedCategory(template.category_id);
    }
    setSelectedColor(template.color ?? null);
    setSelectedIconKey(template.icon_key ?? null);
    setUnit((template.default_unit as typeof unit) ?? "none");
    setGoalValue(template.default_goal_value ?? undefined);
    setFrequencyType((template.default_frequency_type as typeof frequencyType) ?? "daily");
    setTimesPerWeek(template.default_times_per_week ?? undefined);
    setTimesPerMonth(template.default_times_per_month ?? undefined);
    setEveryNDays(template.default_every_n_days ?? undefined);
    if (template.default_days_of_week && template.default_days_of_week.length > 0) {
      setSelectedDays(template.default_days_of_week);
    } else if ((template.default_frequency_type ?? "") === "daily") {
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    } else {
      setSelectedDays([1, 2, 3, 4, 5]);
    }
  };

const renderTemplateFrequency = (template: HabitTemplate) => {
  const freq = template.default_frequency_type;
  if (freq === "daily") return "Todos os dias";
  if (freq === "fixed_days" && template.default_days_of_week?.length) {
    return `Dias: ${template.default_days_of_week
        .map((d) => weekdays.find((w) => w.id === d)?.label ?? d)
        .join(" ")}`;
    }
    if (freq === "times_per_week" && template.default_times_per_week) return `${template.default_times_per_week}x / semana`;
    if (freq === "times_per_month" && template.default_times_per_month) return `${template.default_times_per_month}x / mês`;
    if (freq === "every_n_days" && template.default_every_n_days) return `A cada ${template.default_every_n_days} dias`;
    return "Frequência personalizada";
  };

  const handleSave = async () => {
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

    if (goalValue !== undefined && goalValue !== null && Number.isNaN(Number(goalValue))) {
      toast({
        title: "Meta inválida",
        description: "Informe um valor numérico para a meta",
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
      // Usa selectedCategoryData.id que sempre vem de CATEGORY_DATA com valores válidos
      const categoryValue = selectedCategoryData?.id || selectedCategory;
      await createHabit({
        name: habitName.trim(),
        emoji: selectedEmoji,
        category: categoryValue,
        period: selectedPeriod,
        days_of_week: days,
        color: selectedColor,
        icon_key: selectedIconKey,
        unit,
        goal_value: goalValue ?? null,
        frequency_type: frequencyType,
        times_per_week: null,
        times_per_month: null,
        every_n_days: null,
        notification_pref: notificationsEnabled
          ? {
              reminder_enabled: true,
              reminder_time: reminderTime,
              sound: notificationSound,
              time_sensitive: false,
            }
          : null,
        auto_complete_source: "manual",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to create habit", error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderFrequencyFields = () => {
    if (frequencyType === "times_per_week") {
      return (
        <Input
          type="number"
          min={1}
          max={7}
          value={timesPerWeek ?? ""}
          onChange={(e) => setTimesPerWeek(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Ex.: 4 vezes/semana"
          className={`rounded-xl ${themeColors.input}`}
        />
      );
    }
    if (frequencyType === "times_per_month") {
      return (
        <Input
          type="number"
          min={1}
          max={31}
          value={timesPerMonth ?? ""}
          onChange={(e) => setTimesPerMonth(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Ex.: 10 vezes/mês"
          className={`rounded-xl ${themeColors.input}`}
        />
      );
    }
    if (frequencyType === "every_n_days") {
      return (
        <Input
          type="number"
          min={1}
          value={everyNDays ?? ""}
          onChange={(e) => setEveryNDays(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Ex.: a cada 2 dias"
          className={`rounded-xl ${themeColors.input}`}
        />
      );
    }
    if (frequencyType === "fixed_days") {
      const allDaysSelected = selectedDays.length === 7;

      return (
        <div className="space-y-3">
          {/* Botões de seleção rápida */}
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

          {/* Grade de dias da semana */}
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

  const handleSelectCategory = (cat: (typeof CATEGORY_DATA)[number]) => {
    setSelectedCategory(cat.id);
    setSelectedCategoryData(cat);
    setSelectedColor(cat.colorToken);
    setSelectedIconKey(null);
    // Não muda de step, tudo acontece na mesma tela
  };

  const handleSelectTemplateFromCatalog = (template: HabitTemplate) => {
    applyTemplate(template);
    setStep("details");
  };

  const handleSelectTemplate = (tpl: (typeof CATEGORY_DATA)[number]["tasks"][number]) => {
    setSelectedTemplate({ id: tpl.id, name: tpl.name, iconKey: tpl.iconKey });
    setSelectedTemplateId(tpl.id);
    setSelectedTemplateAuto(tpl.auto_complete_source === "health");
    setHabitName(tpl.name);
    // IMPORTANTE: Atualizar o icon_key com o ícone do template selecionado
    setSelectedIconKey(tpl.iconKey || null);
    setUnit((tpl.default_unit as typeof unit) ?? "none");
    setGoalValue(tpl.default_goal_value ?? undefined);
    const tplFreq = tpl.default_frequency_type === "fixed_days" ? "fixed_days" : "daily";
    setFrequencyType(tplFreq);
    setTimesPerWeek(undefined);
    setTimesPerMonth(undefined);
    setEveryNDays(undefined);
    if (tplFreq === "fixed_days" && tpl.default_days_of_week?.length) {
      setSelectedDays(tpl.default_days_of_week);
    } else if (tplFreq === "fixed_days") {
      setSelectedDays([1, 2, 3, 4, 5]);
    } else {
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    }
    setStep("details");
  };

  // Stepper configuration
  const steps: Array<{ id: Step; label: string; icon: typeof Target }> = [
    { id: "select", label: "Escolher", icon: Target },
    { id: "details", label: "Configurar", icon: Calendar },
    { id: "confirm", label: "Confirmar", icon: Bell },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  const StepperIndicator = (
    <div className="px-6 py-3">
      <div className="flex items-center justify-between">
        {steps.map((s, index) => {
          const StepIcon = s.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={s.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isActive || isCompleted
                      ? (isDarkMode ? UNIFIED_COLOR : "#FFFFFF")
                      : (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
                  }}
                  transition={{ duration: 0.2 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                >
                  <StepIcon
                    className="h-5 w-5 transition-colors duration-200"
                    style={{
                      color: isActive || isCompleted
                        ? (isDarkMode ? "#000000" : "#65A30D")
                        : (isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.6)")
                    }}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide transition-colors duration-200 ${
                    isActive
                      ? themeColors.bodyText
                      : isCompleted
                        ? themeColors.bodyTextSecondary
                        : themeColors.bodyTextMuted
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-2">
                  <motion.div
                    className="h-0.5 rounded-full"
                    animate={{
                      backgroundColor: isCompleted
                        ? (isDarkMode ? UNIFIED_COLOR : "#FFFFFF")
                        : (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const HeaderBar = (
    <div className={`flex items-center justify-between px-4 py-4 border-b ${themeColors.headerBorder}`}>
      {step === "details" ? (
        <button
          onClick={() => setStep("select")}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${themeColors.headerIcon}`}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      ) : step === "confirm" ? (
        <button
          onClick={() => setStep("details")}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${themeColors.headerIcon}`}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      ) : (
        <div className="w-10" />
      )}
      <div className="text-center">
        <p className={`text-base font-semibold tracking-wide ${themeColors.headerText}`}>
          {step === "select" ? "Nova Tarefa" : step === "details" ? "Configurar Tarefa" : "Confirmar"}
        </p>
      </div>
      <button
        onClick={() => navigate("/dashboard")}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${themeColors.headerIcon}`}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );

  const SelectStep = (
    <motion.div
      key="select"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6 pb-6 pt-4"
    >
      {/* Category Pills - Apenas ícones circulares minimalistas */}
      <div className="flex items-center justify-center gap-2 px-4">
        {CATEGORY_DATA.map((cat) => {
          const Icon = getHabitIcon(cat.iconKey);
          const isActive = selectedCategoryData?.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat)}
              className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 active:scale-95"
              style={{
                backgroundColor: isActive ? themeColors.categoryPill.activeBg : themeColors.categoryPill.inactiveBg,
                border: isActive ? `2px solid ${themeColors.categoryPill.activeBg}` : "2px solid transparent",
              }}
            >
              {Icon && <Icon className="h-5 w-5" style={{ color: isActive ? themeColors.categoryPill.activeIcon : themeColors.categoryPill.inactiveIcon }} />}
            </button>
          );
        })}
      </div>

      {/* Descrição da categoria selecionada */}
      {selectedCategoryData && (
        <div className="px-6 pt-0">
          <p className={`text-sm text-center leading-relaxed ${themeColors.bodyTextSecondary}`}>
            {selectedCategoryData.description}
          </p>
        </div>
      )}

      {/* Lista de hábitos */}
      {selectedCategoryData && (
        <div className="space-y-3 px-4">
          <p className={`text-[10px] font-bold uppercase tracking-widest px-2 ${themeColors.sectionTitle}`}>
            Selecione uma tarefa
          </p>
          {selectedCategoryData.tasks.map((tpl) => {
            const TaskIcon = tpl.iconKey ? getHabitIcon(tpl.iconKey as any) : getHabitIcon(selectedCategoryData.iconKey);
            const isHealthTask = tpl.auto_complete_source === "health";
            return (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className="group flex w-full items-center justify-between rounded-2xl px-4 py-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: themeColors.taskButton.bg,
                  boxShadow: themeColors.taskButton.shadow,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeColors.taskButton.iconBg}`}>
                    {TaskIcon && <TaskIcon className={`h-6 w-6 ${themeColors.taskButton.iconColor}`} />}
                  </div>
                  <div className="flex items-center gap-2 text-left">
                    {isHealthTask && (
                      <svg className={`h-4 w-4 ${themeColors.taskButton.text} opacity-80`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    )}
                    <p className={`text-base font-bold ${themeColors.taskButton.text}`}>{tpl.name}</p>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 transition-colors ${themeColors.taskButton.chevron}`} />
              </button>
            );
          })}
        </div>
      )}

      {/* Mensagem inicial se nenhuma categoria selecionada */}
      {!selectedCategoryData && (
        <div className="px-6 pt-12 text-center">
          <p className={`text-sm ${themeColors.bodyTextMuted}`}>
            Escolha uma categoria acima para ver os hábitos disponíveis
          </p>
        </div>
      )}
    </motion.div>
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
          iconKey={selectedTemplate?.iconKey ? (selectedTemplate.iconKey as any) : selectedCategoryData?.iconKey ?? null}
          color={isDarkMode ? UNIFIED_COLOR : "#FFFFFF"}
          isAutoTask={selectedTemplateAuto}
        />

        {/* Task Title */}
        <div className="w-full px-6 text-center">
          <p className={`text-2xl font-bold uppercase tracking-wide ${themeColors.bodyText}`}>
            {habitName || "NOME DO HÁBITO"}
          </p>
        </div>
      </div>

      {/* Health Integration Alert */}
      {selectedTemplateAuto && (
        <div className={`mx-4 flex items-start gap-3 rounded-xl border p-4 ${themeColors.card}`}>
          <svg className={`h-5 w-5 flex-shrink-0 mt-0.5 ${themeColors.healthIcon}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className={`text-sm font-medium ${themeColors.bodyText}`}>
              Esta tarefa usa dados do app Saúde.
            </p>
            <p className={`mt-1 text-xs ${themeColors.bodyTextSecondary}`}>
              Conceda permissão ao Habitz quando solicitado.
            </p>
          </div>
        </div>
      )}

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

      {/* Live Preview Card */}
      <div className="px-4">
        <Label className={`text-[10px] font-bold uppercase tracking-widest ${themeColors.sectionTitle}`}>
          PREVIEW
        </Label>
        <motion.div
          layout
          className={`mt-2 overflow-hidden rounded-2xl border-2 ${themeColors.card}`}
          style={{
            borderColor: isDarkMode ? UNIFIED_COLOR : "rgba(255,255,255,0.4)",
          }}
        >
          <div className="p-4">
            {/* Mini Dashboard Card Preview */}
            <div className="flex items-center gap-3">
              {/* Icon */}
              <motion.div
                layout
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: isDarkMode ? "rgba(163,230,53,0.15)" : "rgba(255,255,255,0.2)",
                }}
              >
                {(() => {
                  const PreviewIcon = selectedTemplate?.iconKey
                    ? getHabitIcon(selectedTemplate.iconKey as any)
                    : selectedCategoryData?.iconKey
                      ? getHabitIcon(selectedCategoryData.iconKey)
                      : null;
                  return PreviewIcon ? (
                    <PreviewIcon
                      className="h-6 w-6"
                      style={{ color: isDarkMode ? UNIFIED_COLOR : "#FFFFFF" }}
                    />
                  ) : (
                    <Target className="h-6 w-6" style={{ color: isDarkMode ? UNIFIED_COLOR : "#FFFFFF" }} />
                  );
                })()}
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <motion.p
                  layout
                  className={`text-sm font-bold truncate ${themeColors.bodyText}`}
                >
                  {habitName || "Nome do hábito"}
                </motion.p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs ${themeColors.bodyTextSecondary}`}>
                    {goalValue && goalValue > 0 ? `${goalValue} ${unit !== "none" ? unit : ""}` : "Completar"}
                  </span>
                  <span className={`text-xs ${themeColors.bodyTextMuted}`}>•</span>
                  <span className={`text-xs ${themeColors.bodyTextSecondary}`}>
                    {frequencyType === "daily" ? "Diário" : `${selectedDays.length} dias`}
                  </span>
                </div>
              </div>

              {/* Checkbox Preview */}
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: isDarkMode ? UNIFIED_COLOR : "rgba(255,255,255,0.5)",
                }}
              />
            </div>

            {/* Period Badge */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                style={{
                  backgroundColor: isDarkMode ? "rgba(163,230,53,0.15)" : "rgba(255,255,255,0.2)",
                  color: isDarkMode ? UNIFIED_COLOR : "#FFFFFF",
                }}
              >
                {periods.find(p => p.id === selectedPeriod)?.emoji}{" "}
                {periods.find(p => p.id === selectedPeriod)?.name}
              </span>
              {notificationsEnabled && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                  style={{
                    backgroundColor: isDarkMode ? "rgba(163,230,53,0.15)" : "rgba(255,255,255,0.2)",
                    color: isDarkMode ? UNIFIED_COLOR : "#FFFFFF",
                  }}
                >
                  <Bell className="h-3 w-3" /> {reminderTime}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Smart Goal Card - Metas inteligentes baseadas no hábito */}
      {selectedTemplateId && (
        <SmartGoalCard
          habitId={selectedTemplateId}
          value={goalValue}
          unit={unit}
          onChange={setGoalValue}
          onUnitChange={setUnit}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Task Days Card */}
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

      {/* Period Selector Card */}
      <div className={`mx-4 overflow-hidden rounded-2xl border ${themeColors.card}`}>
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeColors.iconBg}`}>
              <Sun className={`h-6 w-6 ${themeColors.iconColor}`} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${themeColors.sectionTitle}`}>
                Período do Dia
              </p>
              <p className={`text-base font-semibold ${themeColors.bodyText}`}>
                {periods.find(p => p.id === selectedPeriod)?.emoji} {periods.find(p => p.id === selectedPeriod)?.name}
              </p>
            </div>
          </div>
        </div>
        <div className={`border-t px-4 py-4 ${themeColors.headerBorder}`}>
          <div className="grid grid-cols-3 gap-2">
            {periods.map((period) => (
              <button
                key={period.id}
                type="button"
                onClick={() => setSelectedPeriod(period.id)}
                className={`flex flex-col items-center gap-1 rounded-xl py-3 text-center transition-all duration-200 ${
                  selectedPeriod === period.id
                    ? themeColors.buttonActive
                    : themeColors.buttonInactive
                }`}
              >
                <span className="text-lg">{period.emoji}</span>
                <span className="text-xs font-semibold">{period.name}</span>
              </button>
            ))}
          </div>
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
          <div className={`border-t px-4 py-4 space-y-3 ${themeColors.headerBorder}`}>
            {/* Time Picker */}
            <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${themeColors.iconBg}`}>
                  <Clock className={`h-5 w-5 ${themeColors.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${themeColors.bodyText}`}>Horário do lembrete</p>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className={`mt-2 h-11 w-full rounded-lg px-3 ${themeColors.input}`}
                  />
                </div>
              </div>
            </div>

            {/* Sound Selector */}
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
      <div className="px-4 pt-4">
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

  // Helper to format frequency text for confirmation
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

  // Helper to format goal text for confirmation
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

  const ConfirmStep = (
    <motion.div
      key="confirm"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6 pb-6 pt-6"
    >
      {/* Hero Section - Larger icon and name */}
      <div className="flex flex-col items-center gap-5 px-6">
        {/* Large Hero Circle */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <HeroCircle
            iconKey={selectedTemplate?.iconKey ? (selectedTemplate.iconKey as any) : selectedCategoryData?.iconKey ?? null}
            color={isDarkMode ? UNIFIED_COLOR : "#FFFFFF"}
            isAutoTask={selectedTemplateAuto}
            size="lg"
          />
        </motion.div>

        {/* Habit Name */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-center"
        >
          <h2 className={`text-2xl font-bold uppercase tracking-wide ${themeColors.bodyText}`}>
            {habitName}
          </h2>
          {selectedCategoryData && (
            <p className={`mt-1 text-sm ${themeColors.bodyTextSecondary}`}>
              {selectedCategoryData.name}
            </p>
          )}
        </motion.div>
      </div>

      {/* Health Integration Notice */}
      {selectedTemplateAuto && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={`mx-4 flex items-center gap-3 rounded-xl border p-3 ${themeColors.card}`}
        >
          <svg className={`h-5 w-5 flex-shrink-0 ${themeColors.healthIcon}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <p className={`text-sm ${themeColors.bodyTextSecondary}`}>
            Conectado ao app Saúde
          </p>
        </motion.div>
      )}

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

        {/* Period Summary */}
        <div className={`flex items-center justify-between rounded-xl border p-4 ${themeColors.card}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${themeColors.iconBg}`}>
              <Sun className={`h-5 w-5 ${themeColors.iconColor}`} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${themeColors.sectionTitle}`}>
                Período
              </p>
              <p className={`text-sm font-semibold ${themeColors.bodyText}`}>
                {periods.find(p => p.id === selectedPeriod)?.emoji} {periods.find(p => p.id === selectedPeriod)?.name}
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
                {notificationsEnabled ? `${reminderTime} • ${soundOptions.find((s) => s.value === notificationSound)?.label ?? "Padrão"}` : "Desativadas"}
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
          {isSaving ? "SALVANDO..." : "SALVAR TAREFA"}
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center transition-colors duration-300 ${themeColors.overlay}`}>
      <div className={`mt-4 w-full max-w-md overflow-hidden rounded-3xl shadow-2xl animate-fade-in transition-colors duration-300 ${themeColors.container}`} style={{ maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 2rem)' }}>
        {HeaderBar}
        {StepperIndicator}
        <div className="overflow-y-auto overscroll-contain scrollbar-hide" style={{ maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 10rem)' }}>
          <AnimatePresence mode="wait">
            {step === "select" && SelectStep}
            {step === "details" && DetailsStep}
            {step === "confirm" && ConfirmStep}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CreateHabit;
