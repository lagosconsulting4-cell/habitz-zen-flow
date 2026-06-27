import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  X,
  ChevronRight,
  Plus,
  Pencil,
  ArrowRight,
  Check,
  Target,
  Calendar,
  Bell,
  Clock,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "@/hooks/useTheme";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/hooks/useHabits";
import { getBRTDateString } from "@/utils/date";
import useHabitCatalog, { HabitTemplate } from "@/hooks/useHabitCatalog";
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { haptic } from "@/lib/haptics";
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
import { getHabitFormTheme } from "@/theme/habitFormTheme";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ptBR } from "date-fns/locale";

const periods: Array<{ id: "morning" | "afternoon" | "evening"; name: string; icon: React.ReactNode }> = [
  { id: "morning", name: "Manhã", icon: <Sun className="h-5 w-5" /> },
  { id: "afternoon", name: "Tarde", icon: <Sunset className="h-5 w-5" /> },
  { id: "evening", name: "Noite", icon: <Moon className="h-5 w-5" /> },
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

const soundOptions: Array<{ value: "default" | "soft" | "bright"; label: string; description: string }> = [
  { value: "default", label: "Padrão", description: "Som padrão do sistema" },
  { value: "soft", label: "Suave", description: "Som suave e discreto" },
  { value: "bright", label: "Vibrante", description: "Som mais chamativo" },
];

import { DrumColumn, HOURS, MINUTES } from "@/components/ui/time-drum-picker";

type Step = "select" | "details" | "confirm";
type FrequencyType = "daily" | "fixed_days" | "once";

// Cor unificada para todas as categorias - verde lime premium
const UNIFIED_COLOR = "#A3E635";

// Hero card images mapped by habit iconKey and category
const HABIT_HERO_IMAGES: Record<string, string> = {
  meditate: "/images/habits/meditation.webp",
  mindful_minutes: "/images/habits/meditation.webp",
  sunrise: "/images/habits/morning.webp",
  wake_early: "/images/habits/morning.webp",
  wake_on_time: "/images/habits/morning.webp",
  make_bed: "/images/habits/morning.webp",
  alarm: "/images/habits/morning.webp",
  run: "/images/habits/exercise.webp",
  walk_run: "/images/habits/exercise.webp",
  strength: "/images/habits/exercise.webp",
  exercise_minutes: "/images/habits/exercise.webp",
  burn_energy: "/images/habits/exercise.webp",
  cycle: "/images/habits/exercise.webp",
  swim: "/images/habits/exercise.webp",
  book: "/images/habits/reading.webp",
  read_books: "/images/habits/reading.webp",
  study: "/images/habits/reading.webp",
  journal: "/images/habits/reading.webp",
  water: "/images/habits/water.webp",
  drink_water: "/images/habits/water.webp",
  sleep: "/images/habits/sleep.webp",
  sleep_8h: "/images/habits/sleep.webp",
  bed: "/images/habits/sleep.webp",
  no_late_sleep: "/images/habits/sleep.webp",
  meal: "/images/habits/food.webp",
  breakfast: "/images/habits/food.webp",
  fruits: "/images/habits/food.webp",
  vegetables: "/images/habits/food.webp",
  protein: "/images/habits/food.webp",
  vitamins: "/images/habits/food.webp",
  no_sugar: "/images/habits/food.webp",
  focus: "/images/habits/focus.webp",
  deep_work: "/images/habits/focus.webp",
  plan: "/images/habits/focus.webp",
  review: "/images/habits/focus.webp",
  checklist: "/images/habits/focus.webp",
  organize: "/images/habits/focus.webp",
  yoga: "/images/habits/yoga.webp",
  stretch: "/images/habits/yoga.webp",
};

const CATEGORY_HERO_IMAGES: Record<string, string> = {
  productivity: "/images/habits/focus.webp",
  fitness: "/images/habits/exercise.webp",
  nutrition: "/images/habits/food.webp",
  time_routine: "/images/habits/focus.webp",
  avoid: "/images/habits/meditation.webp",
};

function getHeroImage(iconKey: string | null | undefined, categoryId: string | undefined): string {
  if (iconKey && HABIT_HERO_IMAGES[iconKey]) return HABIT_HERO_IMAGES[iconKey];
  if (categoryId && CATEGORY_HERO_IMAGES[categoryId]) return CATEGORY_HERO_IMAGES[categoryId];
  return "/images/habits/default.webp";
}

export const CATEGORY_DATA: Array<{
  id: string;
  name: string;
  description: string;
  iconKey: HabitIconKey;
  colorToken: string;
  tasks: Array<{
    id: string;
    name: string;
    description?: string;
    iconKey?: HabitIconKey;
    categoryOverride?: string;
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
    name: "Mente",
    description: "Desenvolvimento pessoal e mental",
    iconKey: "meditate",
    colorToken: UNIFIED_COLOR,
    tasks: [
      { id: "wake_early", name: "Acordar Cedo", description: "Comece o dia com vantagem", iconKey: "sunrise", default_unit: "none", default_frequency_type: "daily" },
      { id: "make_bed", name: "Fazer a Cama", description: "Primeira vitória do dia", iconKey: "make_bed", default_unit: "none", default_frequency_type: "daily" },
      { id: "plan_day", name: "Planejar o Dia", description: "Organize suas prioridades", iconKey: "plan", default_unit: "minutes", default_goal_value: 10, default_frequency_type: "daily" },
      { id: "review_goals", name: "Revisar Objetivos", description: "Mantenha o foco no que importa", iconKey: "review", default_unit: "none", default_frequency_type: "times_per_week", default_times_per_week: 1 },
      { id: "journaling", name: "Journaling", description: "Reflita e organize pensamentos", iconKey: "journal", default_unit: "minutes", default_goal_value: 10, default_frequency_type: "daily" },
      { id: "read_books", name: "Ler Livros", description: "Expanda seu conhecimento", iconKey: "book", default_unit: "pages", default_goal_value: 30, default_frequency_type: "daily" },
      { id: "meditate", name: "Meditar", description: "Treine sua mente diariamente", iconKey: "meditate", default_unit: "minutes", default_goal_value: 10, default_frequency_type: "daily" },
      { id: "study", name: "Estudar", description: "Invista no seu crescimento", iconKey: "study", default_unit: "hours", default_goal_value: 1, default_frequency_type: "daily" },
      { id: "organize_space", name: "Organizar Ambiente", description: "Espaço limpo, mente clara", iconKey: "organize", default_unit: "minutes", default_goal_value: 15, default_frequency_type: "daily" },
      { id: "task_list", name: "Fazer Lista de Tarefas", description: "Planeje e execute com clareza", iconKey: "checklist", default_unit: "none", default_frequency_type: "daily" },
    ],
  },
  {
    id: "fitness",
    name: "Corpo",
    description: "Saúde física, nutrição e bem-estar",
    iconKey: "run",
    colorToken: UNIFIED_COLOR,
    tasks: [
      { id: "walk_run", name: "Caminhar ou Correr", description: "Movimente-se todos os dias", default_unit: "steps", default_goal_value: 10000, default_frequency_type: "daily", auto_complete_source: "health" },
      { id: "cycle", name: "Pedalar", description: "Pedale para mais energia", iconKey: "cycle", default_unit: "minutes", default_goal_value: 30, default_frequency_type: "times_per_week", default_times_per_week: 3 },
      { id: "swim", name: "Nadar", description: "Exercício completo e refrescante", iconKey: "swim", default_unit: "minutes", default_goal_value: 30, default_frequency_type: "times_per_week", default_times_per_week: 2 },
      { id: "stretching", name: "Alongamento", description: "Flexibilidade e bem-estar", iconKey: "stretch", default_unit: "minutes", default_goal_value: 10, default_frequency_type: "daily" },
      { id: "yoga", name: "Yoga", description: "Equilíbrio entre corpo e mente", iconKey: "yoga", default_unit: "minutes", default_goal_value: 20, default_frequency_type: "times_per_week", default_times_per_week: 3 },
      { id: "strength_training", name: "Treino de Força", description: "Fortaleça seu corpo", iconKey: "strength", default_unit: "minutes", default_goal_value: 45, default_frequency_type: "times_per_week", default_times_per_week: 3 },
      { id: "drink_water", name: "Beber Água", description: "Mantenha seu corpo hidratado", iconKey: "water", default_unit: "liters", default_goal_value: 2, default_frequency_type: "daily" },
      { id: "sleep_8h", name: "Dormir 8 Horas", description: "Descanse para render mais", iconKey: "sleep", default_unit: "hours", default_goal_value: 8, default_frequency_type: "daily", auto_complete_source: "health" },
      { id: "exercise_minutes", name: "Minutos de Exercício", description: "Mova-se por pelo menos 30 min", iconKey: "exercise_minutes", default_unit: "minutes", default_goal_value: 30, default_frequency_type: "daily", auto_complete_source: "health" },
      { id: "burn_calories", name: "Queimar Calorias", description: "Atinja sua meta diária", iconKey: "burn_energy", default_unit: "custom", default_goal_value: 500, default_frequency_type: "daily", auto_complete_source: "health" },
      // Nutrition tasks (categoryOverride preserves DB value)
      { id: "healthy_breakfast", name: "Café da Manhã Saudável", description: "Comece o dia bem alimentado", iconKey: "breakfast", categoryOverride: "nutrition", default_unit: "none", default_frequency_type: "daily" },
      { id: "eat_fruits", name: "Comer Frutas", description: "Vitaminas naturais diárias", iconKey: "fruits", categoryOverride: "nutrition", default_unit: "custom", default_goal_value: 2, default_frequency_type: "daily" },
      { id: "eat_vegetables", name: "Comer Vegetais", description: "Nutrição verde no prato", iconKey: "vegetables", categoryOverride: "nutrition", default_unit: "custom", default_goal_value: 3, default_frequency_type: "daily" },
      { id: "drink_water_2l", name: "Beber 2L de Água", description: "Hidratação é essencial", iconKey: "water", categoryOverride: "nutrition", default_unit: "liters", default_goal_value: 2, default_frequency_type: "daily" },
      { id: "avoid_sugar", name: "Evitar Açúcar", description: "Reduza o açúcar no dia a dia", iconKey: "no_sugar", categoryOverride: "nutrition", default_unit: "none", default_frequency_type: "daily" },
      { id: "meal_prep", name: "Preparar Refeições", description: "Planeje suas refeições", iconKey: "meal", categoryOverride: "nutrition", default_unit: "custom", default_goal_value: 3, default_frequency_type: "times_per_week", default_times_per_week: 1 },
      { id: "eat_protein", name: "Comer Proteína", description: "Fortaleça seus músculos", iconKey: "protein", categoryOverride: "nutrition", default_unit: "custom", default_goal_value: 3, default_frequency_type: "daily" },
      { id: "take_vitamins", name: "Tomar Vitaminas", description: "Suplementação diária", iconKey: "vitamins", categoryOverride: "nutrition", default_unit: "none", default_frequency_type: "daily" },
    ],
  },
  {
    id: "time_routine",
    name: "Foco",
    description: "Produtividade, foco e rotinas saudáveis",
    iconKey: "focus",
    colorToken: UNIFIED_COLOR,
    tasks: [
      { id: "pomodoro", name: "Pomodoro de Trabalho", description: "Blocos de foco intenso", iconKey: "focus", default_unit: "custom", default_goal_value: 4, default_frequency_type: "times_per_week", default_times_per_week: 5 },
      { id: "deep_focus", name: "Tempo de Foco Profundo", description: "Concentração sem distrações", iconKey: "deep_work", default_unit: "hours", default_goal_value: 2, default_frequency_type: "daily" },
      { id: "sleep_on_time", name: "Dormir no Horário", description: "Rotina de sono consistente", iconKey: "bed", default_unit: "none", default_frequency_type: "daily" },
      { id: "wake_on_time", name: "Acordar no Horário", description: "Disciplina desde o despertar", iconKey: "alarm", default_unit: "none", default_frequency_type: "daily" },
      { id: "screen_free_time", name: "Tempo Sem Telas", description: "Descanse seus olhos e mente", iconKey: "no_screens", default_unit: "hours", default_goal_value: 1, default_frequency_type: "daily" },
      // Avoid tasks (categoryOverride preserves DB value)
      { id: "no_smoking", name: "Não Fumar", description: "Liberte-se do cigarro", iconKey: "no_smoke", categoryOverride: "avoid", default_unit: "none", default_frequency_type: "daily" },
      { id: "no_sweets", name: "Não Comer Doces", description: "Controle a tentação", iconKey: "no_sugar", categoryOverride: "avoid", default_unit: "none", default_frequency_type: "daily" },
      { id: "limit_social_media", name: "Limitar Redes Sociais", description: "Menos scroll, mais vida", iconKey: "social_media", categoryOverride: "avoid", default_unit: "minutes", default_goal_value: 30, default_frequency_type: "daily" },
      { id: "no_skip_meals", name: "Não Pular Refeições", description: "Alimente-se regularmente", iconKey: "no_skip_meals", categoryOverride: "avoid", default_unit: "custom", default_goal_value: 3, default_frequency_type: "daily" },
      { id: "no_late_sleep", name: "Não Dormir Tarde", description: "Respeite seu horário de sono", iconKey: "no_late_sleep", categoryOverride: "avoid", default_unit: "none", default_frequency_type: "daily" },
      { id: "no_sedentary", name: "Não Ficar Sedentário", description: "Levante-se e movimente-se", iconKey: "active", categoryOverride: "avoid", default_unit: "custom", default_goal_value: 8, default_frequency_type: "daily" },
    ],
  },
];

const fallbackCategories = CATEGORY_DATA.map((c) => ({ id: c.id, name: c.name, color: c.colorToken, icon_key: null }));

const CreateHabit = () => {
  const location = useLocation();
  const prefilled = location.state as { prefilledName?: string; prefilledCategory?: string; prefilledPeriod?: string } | undefined;
  const [habitName, setHabitName] = useState(prefilled?.prefilledName || "");
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
  const [timesPerDay, setTimesPerDay] = useState<number>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<typeof periods[number]["id"]>((prefilled?.prefilledPeriod as typeof periods[number]["id"]) || periods[0].id);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [reminderTime, setReminderTime] = useState<string>("08:00");
  const [notificationSound, setNotificationSound] = useState<"default" | "soft" | "bright">("default");
  const [dueDate, setDueDate] = useState<string>("");
  const [dueTime, setDueTime] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string; iconKey?: HabitIconKey } | null>(null);
  const [selectedTemplateAuto, setSelectedTemplateAuto] = useState<boolean>(false);
  const [step, setStep] = useState<Step>(prefilled?.prefilledName ? "details" : "select");
  const [selectedCategoryData, setSelectedCategoryData] = useState<(typeof CATEGORY_DATA)[number] | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createHabit } = useHabits();
  const { categories: catalogCategories, templates, isLoading: catalogLoading } = useHabitCatalog();
  const { prefs } = useAppPreferences();
  const { resolvedTheme } = useTheme();
  const { isSupported: pushSupported, isSubscribed: pushSubscribed, subscribe: pushSubscribe, isLoading: pushLoading } = usePushNotifications();
  const isDarkMode = resolvedTheme === "dark";
  // Sincroniza estado local com preferências do app (fallback)
  useEffect(() => {
    setNotificationsEnabled(prefs.notificationsEnabled);
  }, [prefs.notificationsEnabled]);

  // Handler para toggle de notificações - solicita permissão se necessário
  const handleNotificationToggle = async (checked: boolean) => {
    if (checked && pushSupported && !pushSubscribed) {
      // Solicitar permissão quando usuário ativa
      const success = await pushSubscribe();
      if (!success) {
        toast({
          title: "Permissão necessária",
          description: "Ative as notificações nas configurações para receber lembretes.",
          variant: "destructive",
        });
        return;
      }
    }
    setNotificationsEnabled(checked);
  };

  const themeColors = getHabitFormTheme(isDarkMode);

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

  // Scroll to top when step changes
  useEffect(() => {
    // Immediate scroll
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    setIsScrolled(false);
    // Delayed scroll to catch AnimatePresence timing
    const timer = setTimeout(() => {
      if (contentScrollRef.current) {
        contentScrollRef.current.scrollTop = 0;
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [step]);

  // Handle scroll for header opacity
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

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

    if (frequencyType === "once" && !dueDate) {
      toast({
        title: "Selecione uma data",
        description: "Escolha a data para esta tarefa",
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
          : frequencyType === "once"
            ? [new Date(dueDate + "T00:00:00").getDay()]
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
        frequency_type: frequencyType || "daily",
        times_per_week: null,
        times_per_month: null,
        every_n_days: null,
        times_per_day: timesPerDay,
        reminder_time: notificationsEnabled ? reminderTime : null,
        notification_pref: notificationsEnabled
          ? {
              reminder_enabled: true,
              reminder_time: reminderTime,
              sound: notificationSound,
              time_sensitive: false,
            }
          : null,
        auto_complete_source: "manual",
        due_date: frequencyType === "once" ? dueDate : null,
      });
      haptic.success();
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to create habit", error);
      haptic.error();
      toast({
        title: "Erro ao criar hábito",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderFrequencyFields = () => {
    if (frequencyType === "times_per_week") {
      return (
        <Input
          type="number"
          inputMode="numeric"
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
          inputMode="numeric"
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
          inputMode="numeric"
          min={1}
          value={everyNDays ?? ""}
          onChange={(e) => setEveryNDays(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Ex.: a cada 2 dias"
          className={`rounded-xl ${themeColors.input}`}
        />
      );
    }
    if (frequencyType === "once") {
      return (
        <div className="space-y-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={getBRTDateString()}
            className={`h-11 w-full rounded-xl px-3 ${themeColors.input}`}
          />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type="time"
              value={dueTime}
              onChange={(e) => {
                setDueTime(e.target.value);
                if (e.target.value) {
                  setReminderTime(e.target.value);
                  setNotificationsEnabled(true);
                }
              }}
              placeholder="Horário (opcional)"
              className={`h-11 w-full rounded-xl px-3 ${themeColors.input}`}
            />
            {dueTime && (
              <button
                type="button"
                onClick={() => setDueTime("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {dueDate && (
            <p className={`text-xs ${themeColors.bodyTextSecondary}`}>
              {new Date(dueDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              {dueTime && ` às ${dueTime}`}
            </p>
          )}
        </div>
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

  const handleCustomCreate = () => {
    clearTemplateSelection();
    setSelectedCategory("productivity");
    setHabitName("");
    setStep("details");
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
    // Use categoryOverride for DB category if task was redistributed
    if (tpl.categoryOverride) {
      setSelectedCategory(tpl.categoryOverride);
    }
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
  const steps: Array<{ id: Step; label: string }> = [
    { id: "select", label: "ESCOLHER" },
    { id: "details", label: "CONFIGURAR" },
    { id: "confirm", label: "CONFIRMAR" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  const StepperIndicator = (
    <div className="px-4 py-3 flex justify-center">
      <div className="flex items-center justify-center w-full max-w-xs">
        {steps.map((s, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={s.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isActive || isCompleted
                      ? themeColors.stepperNumber.activeBg
                      : themeColors.stepperNumber.inactiveBg,
                    boxShadow: isActive
                      ? (isDarkMode ? "0 0 20px rgba(163, 230, 53, 0.4), 0 0 40px rgba(163, 230, 53, 0.15)" : "0 0 16px rgba(132, 204, 22, 0.3)")
                      : isCompleted
                        ? (isDarkMode ? "0 0 12px rgba(163, 230, 53, 0.2)" : "0 0 8px rgba(132, 204, 22, 0.15)")
                        : "none",
                  }}
                  transition={{ duration: 0.2 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                >
                  <span
                    className="text-sm font-bold transition-colors duration-200"
                    style={{
                      color: isActive || isCompleted
                        ? themeColors.stepperNumber.activeText
                        : themeColors.stepperNumber.inactiveText,
                    }}
                  >
                    {index + 1}
                  </span>
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
                <div className="w-12 mx-2">
                  <motion.div
                    className="h-0.5 rounded-full"
                    animate={{
                      backgroundColor: isCompleted
                        ? themeColors.stepperNumber.activeBg
                        : (isDarkMode ? "rgba(255,255,255,0.15)" : "#CBD5E1"),
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
      {step === "select" ? (
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${themeColors.headerIcon}`}
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      ) : step === "details" ? (
        <button
          onClick={() => setStep("select")}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${themeColors.headerIcon}`}
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      ) : (
        <button
          onClick={() => setStep("details")}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${themeColors.headerIcon}`}
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <div className="text-center">
        <p className={`text-base font-semibold tracking-wide ${themeColors.headerText}`}>
          {step === "select" ? "Nova Tarefa" : step === "details" ? "Configurar Tarefa" : "Confirmar"}
        </p>
      </div>
      <div className="w-10" />
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
      {/* Category Filter Label */}
      <p
        className="text-[10px] font-bold uppercase tracking-[0.2em] px-6"
        style={{ color: themeColors.categoryLabel }}
      >
        FILTRO POR CATEGORIA
      </p>

      {/* Category Pills with Labels */}
      <div className="flex items-center justify-center gap-6 px-4">
        {CATEGORY_DATA.map((cat) => {
          const Icon = getHabitIcon(cat.iconKey);
          const isActive = selectedCategoryData?.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat)}
              aria-label={cat.name}
              aria-pressed={isActive}
              className="flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200"
                style={{
                  backgroundColor: isActive ? themeColors.categoryPill.activeBg : themeColors.categoryPill.inactiveBg,
                  border: isActive ? `2px solid ${themeColors.categoryPill.activeBg}` : "2px solid transparent",
                  boxShadow: isActive
                    ? (isDarkMode ? "0 0 20px rgba(163, 230, 53, 0.35), 0 0 40px rgba(163, 230, 53, 0.1)" : "0 0 16px rgba(132, 204, 22, 0.25)")
                    : "none",
                }}
              >
                {Icon && <Icon className="h-5 w-5" style={{ color: isActive ? themeColors.categoryPill.activeIcon : themeColors.categoryPill.inactiveIcon }} />}
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? themeColors.bodyText : themeColors.bodyTextMuted
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Habit Card */}
      <div className="px-4">
        <button
          onClick={handleCustomCreate}
          className="flex w-full items-center gap-4 rounded-2xl px-5 py-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: themeColors.customHabitCard.bg,
            border: `1.5px dashed ${themeColors.customHabitCard.border}`,
            boxShadow: isDarkMode
              ? "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(163, 230, 53, 0.06), inset 0 1px 0 rgba(255,255,255,0.04)"
              : "0 4px 16px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: isDarkMode ? "rgba(163, 230, 53, 0.15)" : "rgba(132, 204, 22, 0.1)",
              boxShadow: isDarkMode ? "0 0 12px rgba(163, 230, 53, 0.1)" : "none",
            }}
          >
            <Plus className="h-6 w-6" style={{ color: themeColors.customHabitCard.icon }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold uppercase tracking-wide" style={{ color: themeColors.customHabitCard.text }}>
              CRIAR HÁBITO PERSONALIZADO
            </p>
            <p className="text-xs mt-0.5" style={{ color: themeColors.customHabitCard.subtitle }}>
              Defina sua própria meta do zero
            </p>
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0" style={{ color: themeColors.customHabitCard.chevron }} />
        </button>
      </div>

      {/* Separator */}
      <div className="px-6">
        <div className="h-px" style={{ backgroundColor: themeColors.separator }} />
      </div>

      {/* Task List */}
      {selectedCategoryData && selectedCategoryData.tasks.length > 0 && (
        <div className="space-y-3 px-4">
          <p
            className="text-sm font-medium px-2"
            style={{ color: themeColors.categoryLabel }}
          >
            Selecione uma tarefa
          </p>
          {selectedCategoryData.tasks.map((tpl) => {
            const TaskIcon = tpl.iconKey ? getHabitIcon(tpl.iconKey as any) : getHabitIcon(selectedCategoryData.iconKey);
            return (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className="group flex w-full items-center justify-between rounded-2xl px-4 py-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: themeColors.taskButton.bg,
                  boxShadow: isDarkMode
                    ? "0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.03)"
                    : themeColors.taskButton.shadow,
                  border: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                    }}
                  >
                    {TaskIcon && <TaskIcon className={`h-6 w-6 ${themeColors.taskButton.iconColor}`} />}
                  </div>
                  <div className="text-left">
                    <p className={`text-base font-bold ${themeColors.taskButton.text}`}>{tpl.name}</p>
                    {tpl.description && (
                      <p className="text-xs mt-0.5" style={{ color: themeColors.taskDescription }}>
                        {tpl.description}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 flex-shrink-0 transition-colors ${themeColors.taskButton.chevron}`} />
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

  const [showCustomTimes, setShowCustomTimes] = useState(false);

  const frequencyOptions: Array<{ value: FrequencyType; label: string }> = [
    { value: "once", label: "Uma vez" },
    { value: "daily", label: "Todo dia" },
    { value: "fixed_days", label: "Específicos" },
  ];

  const periodData: Array<{ id: "morning" | "afternoon" | "evening"; name: string; icon: React.ReactNode; range: string }> = [
    { id: "morning", name: "Manhã", icon: <Sun className="h-6 w-6" />, range: "06:00 - 12:00" },
    { id: "afternoon", name: "Tarde", icon: <Sunset className="h-6 w-6" />, range: "12:00 - 18:00" },
    { id: "evening", name: "Noite", icon: <Moon className="h-6 w-6" />, range: "18:00 - 00:00" },
  ];

  const getFrequencySummary = () => {
    if (frequencyType === "daily" && selectedDays.length === 7) return "Todos os dias";
    if (frequencyType === "fixed_days") return `${selectedDays.length} dias`;
    if (frequencyType === "once") return dueDate ? new Date(dueDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" }) : "";
    return "";
  };

  const DetailsStep = (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-7 pb-6 pt-2"
    >
      {/* ── NOME DO HÁBITO ── (sem isso, hábito personalizado fica sem nome e o botão trava) */}
      <div className="space-y-3 px-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: themeColors.categoryLabel }}>
          NOME DO HÁBITO
        </p>
        <Input
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          placeholder="Ex.: Beber água, Ler 10 páginas..."
          maxLength={60}
          autoFocus={!habitName.trim()}
          className={`rounded-xl ${themeColors.input}`}
        />
      </div>

      {/* Health Integration Alert */}
      {selectedTemplateAuto && (
        <div className="mx-4 flex items-start gap-3 rounded-xl p-4"
          style={{
            backgroundColor: themeColors.detailsCard.bg,
            border: `1px solid ${themeColors.detailsCard.border}`,
          }}
        >
          <svg className={`h-5 w-5 flex-shrink-0 mt-0.5 ${themeColors.healthIcon}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className={`text-sm font-medium ${themeColors.bodyText}`}>Esta tarefa usa dados do app Saúde.</p>
            <p className={`mt-1 text-xs ${themeColors.bodyTextSecondary}`}>Conceda permissão ao Habitz quando solicitado.</p>
          </div>
        </div>
      )}

      {/* ── FREQUÊNCIA ── */}
      <div className="space-y-4 px-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: themeColors.categoryLabel }}>
            FREQUÊNCIA
          </p>
          {getFrequencySummary() && (
            <p className={`text-xs font-medium ${themeColors.bodyTextSecondary}`}>
              {getFrequencySummary()}
            </p>
          )}
        </div>

        {/* Frequency Cards */}
        <div className="grid grid-cols-3 gap-3">
          {frequencyOptions.map((opt) => {
            const isActive = frequencyType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFrequencyType(opt.value)}
                className="flex flex-col items-center gap-2 rounded-xl py-4 px-2 transition-all duration-200 active:scale-[0.97]"
                style={{
                  backgroundColor: themeColors.detailsCard.bg,
                  border: `1.5px solid ${isActive ? themeColors.detailsCard.activeBorder : themeColors.detailsCard.border}`,
                  boxShadow: isActive ? themeColors.detailsCard.activeShadow : "none",
                }}
              >
                <Calendar className="h-5 w-5" style={{ color: isActive ? (isDarkMode ? "#A3E635" : "#65A30D") : (isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)") }} />
                <span className="text-xs font-semibold" style={{ color: isActive ? (isDarkMode ? "#A3E635" : "#65A30D") : (isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)") }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Day Pills (daily / fixed_days) */}
        {(frequencyType === "daily" || frequencyType === "fixed_days") && (
          <div className="flex items-center justify-between gap-2 pt-1">
            {weekdays.map((day) => {
              const isSelected = selectedDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  aria-pressed={isSelected}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 active:scale-[0.93]"
                  style={{
                    backgroundColor: isSelected ? themeColors.dayPill.activeBg : themeColors.dayPill.inactiveBg,
                    border: `1.5px solid ${isSelected ? themeColors.dayPill.activeBorder : themeColors.dayPill.inactiveBorder}`,
                    color: isSelected ? themeColors.dayPill.activeText : themeColors.dayPill.inactiveText,
                    boxShadow: isSelected ? (isDarkMode ? "0 0 10px rgba(163, 230, 53, 0.15)" : "0 0 8px rgba(132, 204, 22, 0.1)") : "none",
                  }}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Date Picker (once) — Popover + Calendar */}
        {frequencyType === "once" && (
          <div className="space-y-3 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: themeColors.categoryLabel }}>
              DATA ESCOLHIDA
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-4 rounded-xl px-4 py-4 transition-all duration-200"
                  style={{
                    backgroundColor: themeColors.detailsCard.bg,
                    border: `1px solid ${themeColors.detailsCard.border}`,
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: isDarkMode ? "rgba(163,230,53,0.12)" : "rgba(132,204,22,0.1)" }}>
                    <Calendar className="h-5 w-5" style={{ color: isDarkMode ? "#A3E635" : "#65A30D" }} />
                  </div>
                  <p className={`flex-1 text-left text-lg font-bold ${themeColors.bodyText}`}>
                    {dueDate
                      ? new Date(dueDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })
                      : "Selecionar data"}
                  </p>
                  <Calendar className="h-5 w-5" style={{ color: isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto rounded-xl border-0 p-0"
                style={{
                  backgroundColor: isDarkMode ? "rgb(20, 20, 20)" : "#FFFFFF",
                  boxShadow: isDarkMode ? "0 8px 32px rgba(0,0,0,0.6), 0 0 16px rgba(163,230,53,0.05)" : "0 8px 32px rgba(0,0,0,0.12)",
                  border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <CalendarComponent
                  mode="single"
                  locale={ptBR}
                  selected={dueDate ? new Date(dueDate + "T12:00:00") : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, "0");
                      const d = String(date.getDate()).padStart(2, "0");
                      setDueDate(`${y}-${m}-${d}`);
                    }
                  }}
                  fromDate={new Date()}
                  className="rounded-xl"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* ── VEZES POR DIA ── */}
      <div className="space-y-4 px-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: themeColors.categoryLabel }}>
          VEZES POR DIA
        </p>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3].map((count) => {
            const isActive = timesPerDay === count && !showCustomTimes;
            return (
              <button
                key={count}
                type="button"
                onClick={() => { setTimesPerDay(count); setShowCustomTimes(false); }}
                className="flex flex-col items-center justify-center rounded-xl py-4 transition-all duration-200 active:scale-[0.97]"
                style={{
                  backgroundColor: themeColors.detailsCard.bg,
                  border: `1.5px solid ${isActive ? themeColors.detailsCard.activeBorder : themeColors.detailsCard.border}`,
                  boxShadow: isActive ? themeColors.detailsCard.activeShadow : "none",
                }}
              >
                <span className="text-lg font-bold" style={{ color: isActive ? (isDarkMode ? "#A3E635" : "#65A30D") : (isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)") }}>
                  {count}x
                </span>
                {count === 1 && (
                  <span className="text-[9px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: isActive ? (isDarkMode ? "#A3E635" : "#65A30D") : (isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)") }}>
                    META
                  </span>
                )}
              </button>
            );
          })}
          {/* Custom (+) button */}
          <button
            type="button"
            onClick={() => setShowCustomTimes(true)}
            className="flex items-center justify-center rounded-xl py-4 transition-all duration-200 active:scale-[0.97]"
            style={{
              backgroundColor: themeColors.detailsCard.bg,
              border: `1.5px solid ${showCustomTimes || timesPerDay > 3 ? themeColors.detailsCard.activeBorder : themeColors.detailsCard.border}`,
              boxShadow: showCustomTimes || timesPerDay > 3 ? themeColors.detailsCard.activeShadow : "none",
            }}
          >
            {showCustomTimes || timesPerDay > 3 ? (
              <span className="text-lg font-bold" style={{ color: isDarkMode ? "#A3E635" : "#65A30D" }}>
                {timesPerDay}x
              </span>
            ) : (
              <Plus className="h-6 w-6" style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)" }} />
            )}
          </button>
        </div>
        {showCustomTimes && (
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={timesPerDay}
            onChange={(e) => setTimesPerDay(Math.max(1, Number(e.target.value) || 1))}
            placeholder="Quantas vezes?"
            className={`rounded-xl ${themeColors.input}`}
          />
        )}
      </div>

      {/* ── PERÍODO DO DIA ── */}
      <div className="space-y-4 px-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: themeColors.categoryLabel }}>
          PERÍODO DO DIA
        </p>
        <div className="grid grid-cols-3 gap-3">
          {periodData.map((p) => {
            const isActive = selectedPeriod === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPeriod(p.id)}
                aria-pressed={isActive}
                className="flex flex-col items-center gap-2 rounded-xl py-5 px-2 transition-all duration-200 active:scale-[0.97]"
                style={{
                  backgroundColor: themeColors.detailsCard.bg,
                  border: `1.5px solid ${isActive ? themeColors.detailsCard.activeBorder : themeColors.detailsCard.border}`,
                  boxShadow: isActive ? themeColors.detailsCard.activeShadow : "none",
                }}
              >
                <span style={{ color: isActive ? (isDarkMode ? "#A3E635" : "#65A30D") : (isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)") }}>
                  {p.icon}
                </span>
                <span className="text-xs font-bold" style={{ color: isActive ? (isDarkMode ? "#FFFFFF" : "#1F2937") : (isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)") }}>
                  {p.name}
                </span>
                <span className="text-[10px]" style={{ color: isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>
                  {p.range}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── HORÁRIO DO LEMBRETE ── */}
      <div className="space-y-4 px-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: themeColors.categoryLabel }}>
          HORÁRIO DO LEMBRETE
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-4 rounded-xl px-4 py-4 transition-all duration-200"
              style={{
                backgroundColor: themeColors.reminderCard.bg,
                border: `1px solid ${themeColors.reminderCard.border}`,
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: isDarkMode ? "rgba(163,230,53,0.12)" : "rgba(132,204,22,0.1)" }}>
                <Clock className="h-5 w-5" style={{ color: themeColors.reminderCard.iconColor }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xl font-bold" style={{ color: themeColors.reminderCard.timeText }}>
                  {reminderTime}
                </p>
                <p className="text-xs mt-0.5" style={{ color: themeColors.reminderCard.subtitleText }}>
                  Notificação diária
                </p>
              </div>
              <Pencil className="h-5 w-5" style={{ color: isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto rounded-xl border-0 p-4"
            style={{
              backgroundColor: isDarkMode ? "rgb(20, 20, 20)" : "#FFFFFF",
              boxShadow: isDarkMode ? "0 8px 32px rgba(0,0,0,0.6), 0 0 16px rgba(163,230,53,0.05)" : "0 8px 32px rgba(0,0,0,0.12)",
              border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
              // CSS variable for drum gradient fades
              "--drum-bg": isDarkMode ? "rgb(20, 20, 20)" : "#FFFFFF",
            } as React.CSSProperties}
          >
            <div className="flex items-center gap-2">
              <DrumColumn
                options={HOURS}
                value={reminderTime.split(":")[0]}
                onChange={(h) => {
                  setReminderTime(`${h}:${reminderTime.split(":")[1]}`);
                  setNotificationsEnabled(true);
                }}
              />
              <span className={`text-2xl font-bold ${themeColors.bodyText}`}>:</span>
              <DrumColumn
                options={MINUTES}
                value={(() => {
                  const m = parseInt(reminderTime.split(":")[1], 10);
                  const rounded = Math.round(m / 5) * 5;
                  return String(rounded >= 60 ? 0 : rounded).padStart(2, "0");
                })()}
                onChange={(m) => {
                  setReminderTime(`${reminderTime.split(":")[0]}:${m}`);
                  setNotificationsEnabled(true);
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* ── CTA BUTTON ── */}
      <div
        className="px-4 pt-4"
        style={{ paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}
      >
        <button
          onClick={() => setStep("confirm")}
          disabled={!habitName.trim()}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold uppercase tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
          style={{
            background: !habitName.trim()
              ? themeColors.ctaButton.disabledBg
              : themeColors.ctaButton.bg,
            color: !habitName.trim()
              ? themeColors.ctaButton.disabledText
              : themeColors.ctaButton.text,
            boxShadow: !habitName.trim()
              ? 'none'
              : themeColors.ctaButton.shadow,
          }}
        >
          PRÓXIMO PASSO <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );

  // Helper to format frequency text for confirmation
  const getFrequencyText = () => {
    if (frequencyType === "daily") return "Todos os dias";
    if (frequencyType === "once") {
      if (!dueDate) return "Uma vez";
      return new Date(dueDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
    }
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

  const heroImageUrl = getHeroImage(
    selectedTemplate?.iconKey ?? selectedCategoryData?.iconKey ?? null,
    selectedCategoryData?.id
  );
  const HabitIcon = selectedTemplate?.iconKey
    ? getHabitIcon(selectedTemplate.iconKey as any)
    : selectedCategoryData?.iconKey
      ? getHabitIcon(selectedCategoryData.iconKey)
      : null;

  const ConfirmStep = (
    <motion.div
      key="confirm"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-7 pb-6 pt-2"
    >
      {/* Section Label + Heading */}
      <div className="px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: themeColors.categoryLabel }}>
          RESUMO FINAL
        </p>
        <h2 className={`mt-2 text-2xl font-bold ${themeColors.bodyText}`}>
          Confirmar Tarefa
        </h2>
      </div>

      {/* Hero Card with Image */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="mx-4 relative rounded-2xl overflow-hidden"
        style={{
          height: 220,
          boxShadow: isDarkMode
            ? "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(163,230,53,0.04)"
            : "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Background Image */}
        <img
          src={heroImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)" }}
        />
        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-5">
          {/* Category Badge */}
          {selectedCategoryData && (
            <span
              className="self-start rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{
                backgroundColor: "rgba(163, 230, 53, 0.15)",
                color: "#A3E635",
                border: "1px solid rgba(163, 230, 53, 0.2)",
              }}
            >
              {selectedCategoryData.name}
            </span>
          )}
          {/* Habit Name */}
          <h3 className="text-2xl font-bold text-white leading-tight">
            {habitName}
          </h3>
        </div>
        {/* Icon Badge (bottom-right) */}
        {HabitIcon && (
          <div
            className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(163, 230, 53, 0.3)",
            }}
          >
            <HabitIcon className="h-5 w-5" style={{ color: "#A3E635" }} />
          </div>
        )}
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="space-y-3 px-4"
      >
        {/* Frequency */}
        <div
          className="flex items-center gap-5 rounded-xl px-4 py-4"
          style={{
            backgroundColor: themeColors.detailsCard.bg,
            border: `1px solid ${themeColors.detailsCard.border}`,
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: isDarkMode ? "rgba(163,230,53,0.12)" : "rgba(132,204,22,0.1)" }}>
            <Calendar className="h-5 w-5" style={{ color: isDarkMode ? "#A3E635" : "#65A30D" }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: themeColors.categoryLabel }}>
              FREQUÊNCIA
            </p>
            <p className={`text-base font-bold ${themeColors.bodyText}`}>
              {getFrequencyText()}
            </p>
          </div>
        </div>

        {/* Period */}
        <div
          className="flex items-center gap-5 rounded-xl px-4 py-4"
          style={{
            backgroundColor: themeColors.detailsCard.bg,
            border: `1px solid ${themeColors.detailsCard.border}`,
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: isDarkMode ? "rgba(163,230,53,0.12)" : "rgba(132,204,22,0.1)" }}>
            {selectedPeriod === "morning" ? <Sun className="h-5 w-5" style={{ color: isDarkMode ? "#A3E635" : "#65A30D" }} /> :
             selectedPeriod === "afternoon" ? <Sunset className="h-5 w-5" style={{ color: isDarkMode ? "#A3E635" : "#65A30D" }} /> :
             <Moon className="h-5 w-5" style={{ color: isDarkMode ? "#A3E635" : "#65A30D" }} />}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: themeColors.categoryLabel }}>
              PERÍODO
            </p>
            <p className={`text-base font-bold ${themeColors.bodyText}`}>
              {periods.find(p => p.id === selectedPeriod)?.name}
            </p>
          </div>
        </div>

        {/* Reminder */}
        <div
          className="flex items-center gap-5 rounded-xl px-4 py-4"
          style={{
            backgroundColor: themeColors.detailsCard.bg,
            border: `1px solid ${themeColors.detailsCard.border}`,
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: isDarkMode ? "rgba(163,230,53,0.12)" : "rgba(132,204,22,0.1)" }}>
            <Clock className="h-5 w-5" style={{ color: isDarkMode ? "#A3E635" : "#65A30D" }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: themeColors.categoryLabel }}>
              LEMBRETE
            </p>
            <p className={`text-base font-bold ${themeColors.bodyText}`}>
              {reminderTime}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Save CTA */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="px-4 pt-2"
        style={{ paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}
      >
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold uppercase tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isSaving ? themeColors.ctaButton.disabledBg : themeColors.ctaButton.bg,
            color: isSaving ? themeColors.ctaButton.disabledText : themeColors.ctaButton.text,
            boxShadow: isSaving ? "none" : themeColors.ctaButton.shadow,
          }}
        >
          {isSaving ? "SALVANDO..." : (<>SALVAR TAREFA <Check className="h-5 w-5" /></>)}
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen flex flex-col ${themeColors.background || 'bg-background'}`}>
      {/* Fixed header and stepper */}
      <div
        className={`fixed top-0 left-0 right-0 z-20 w-full transition-all duration-200 ${themeColors.background || 'bg-background'} ${
          isScrolled ? 'shadow-md' : ''
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {HeaderBar}
        {StepperIndicator}
      </div>

      {/* Scrollable content with padding to account for fixed header */}
      <div
        ref={contentScrollRef}
        onScroll={handleScroll}
        className={`flex-1 px-4 py-6 ${step === "confirm" ? "overflow-hidden" : "overflow-y-auto"}`}
        style={{ paddingTop: 'calc(10rem + env(safe-area-inset-top))' }}
      >
        <AnimatePresence mode="wait">
          {step === "select" && SelectStep}
          {step === "details" && DetailsStep}
          {step === "confirm" && ConfirmStep}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateHabit;
