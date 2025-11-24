import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  X,
  ChevronRight,
  Target,
  Calendar,
  Bell,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

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

type Step = "select" | "details";

// Cor unificada para todas as categorias - verde lime premium
const UNIFIED_COLOR = "#A3E635";

const CATEGORY_DATA: Array<{
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
      { id: "wake_early", name: "Acordar Cedo", default_unit: "none", default_frequency_type: "daily" },
      { id: "make_bed", name: "Fazer a Cama", default_unit: "none", default_frequency_type: "daily" },
      { id: "plan_day", name: "Planejar o Dia", default_unit: "minutes", default_goal_value: 10, default_frequency_type: "daily" },
      { id: "review_goals", name: "Revisar Objetivos", default_unit: "none", default_frequency_type: "times_per_week", default_times_per_week: 1 },
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
      { id: "healthy_breakfast", name: "Café da Manhã Saudável", default_unit: "none", default_frequency_type: "daily" },
      { id: "eat_fruits", name: "Comer Frutas", iconKey: "fruits", default_unit: "custom", default_goal_value: 2, default_frequency_type: "daily" },
      { id: "eat_vegetables", name: "Comer Vegetais", iconKey: "vegetables", default_unit: "custom", default_goal_value: 3, default_frequency_type: "daily" },
      { id: "drink_water_2l", name: "Beber 2L de Água", iconKey: "water", default_unit: "liters", default_goal_value: 2, default_frequency_type: "daily" },
      { id: "avoid_sugar", name: "Evitar Açúcar", iconKey: "target", default_unit: "none", default_frequency_type: "daily" },
      { id: "meal_prep", name: "Preparar Refeições", default_unit: "custom", default_goal_value: 3, default_frequency_type: "times_per_week", default_times_per_week: 1 },
      { id: "eat_protein", name: "Comer Proteína", iconKey: "protein", default_unit: "custom", default_goal_value: 3, default_frequency_type: "daily" },
      { id: "take_vitamins", name: "Tomar Vitaminas", iconKey: "vitamins", default_unit: "none", default_frequency_type: "daily" },
      { id: "avoid_fast_food", name: "Evitar Fast Food", iconKey: "no_fast_food", default_unit: "none", default_frequency_type: "daily" },
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
      { id: "family_time", name: "Tempo com Família", iconKey: "family", default_unit: "hours", default_goal_value: 1, default_frequency_type: "daily" },
      { id: "leisure_time", name: "Tempo de Lazer", default_unit: "minutes", default_goal_value: 30, default_frequency_type: "daily" },
      { id: "sleep_on_time", name: "Dormir no Horário", iconKey: "bed", default_unit: "none", default_frequency_type: "daily" },
      { id: "wake_on_time", name: "Acordar no Horário", default_unit: "none", default_frequency_type: "daily" },
      { id: "regular_breaks", name: "Fazer Pausas Regulares", iconKey: "pause", default_unit: "custom", default_goal_value: 8, default_frequency_type: "daily" },
      { id: "screen_free_time", name: "Tempo Sem Telas", iconKey: "no_screens", default_unit: "hours", default_goal_value: 1, default_frequency_type: "daily" },
    ],
  },
  {
    id: "avoid",
    name: "Evitar",
    description: "Hábitos a serem eliminados",
    iconKey: "target",
    colorToken: UNIFIED_COLOR,
    tasks: [
      { id: "no_smoking", name: "Não Fumar", iconKey: "no_smoke", default_unit: "none", default_frequency_type: "daily" },
      { id: "no_alcohol", name: "Não Beber Álcool", iconKey: "no_alcohol", default_unit: "none", default_frequency_type: "daily" },
      { id: "no_sweets", name: "Não Comer Doces", default_unit: "none", default_frequency_type: "daily" },
      { id: "limit_social_media", name: "Limitar Redes Sociais", iconKey: "no_screens", default_unit: "minutes", default_goal_value: 30, default_frequency_type: "daily" },
      { id: "no_procrastination", name: "Não Procrastinar", iconKey: "target", default_unit: "none", default_frequency_type: "daily" },
      { id: "no_skip_meals", name: "Não Pular Refeições", iconKey: "meal", default_unit: "custom", default_goal_value: 3, default_frequency_type: "daily" },
      { id: "no_late_sleep", name: "Não Dormir Tarde", iconKey: "sleep", default_unit: "none", default_frequency_type: "daily" },
      { id: "no_sedentary", name: "Não Ficar Sedentário", iconKey: "stand_hours", default_unit: "custom", default_goal_value: 8, default_frequency_type: "daily" },
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
  const [frequencyType, setFrequencyType] = useState<"fixed_days" | "times_per_week" | "times_per_month" | "every_n_days" | "daily">("daily");
  const [timesPerWeek, setTimesPerWeek] = useState<number | undefined>(undefined);
  const [timesPerMonth, setTimesPerMonth] = useState<number | undefined>(undefined);
  const [everyNDays, setEveryNDays] = useState<number | undefined>(undefined);
  const [selectedPeriod, setSelectedPeriod] = useState<typeof periods[number]["id"]>(periods[0].id);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
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

  useEffect(() => {
    if (catalogCategories.length > 0 && selectedCategory === fallbackCategories[0].id) {
      setSelectedCategory(catalogCategories[0].id);
      setSelectedColor(catalogCategories[0].color ?? null);
      setSelectedIconKey(catalogCategories[0].icon_key ?? null);
    }
  }, [catalogCategories, selectedCategory]);

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

    if (frequencyType === "times_per_week" && !timesPerWeek) {
      toast({
        title: "Informe a meta semanal",
        description: "Preencha quantas vezes por semana deseja cumprir",
        variant: "destructive",
      });
      return;
    }

    if (frequencyType === "times_per_month" && !timesPerMonth) {
      toast({
        title: "Informe a meta mensal",
        description: "Preencha quantas vezes por mês deseja cumprir",
        variant: "destructive",
      });
      return;
    }

    if (frequencyType === "every_n_days" && !everyNDays) {
      toast({
        title: "Informe o intervalo",
        description: "Preencha a cada quantos dias deseja repetir",
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
      const days = [...selectedDays].sort((a, b) => a - b);
      await createHabit({
        name: habitName.trim(),
        emoji: selectedEmoji,
        category: selectedCategory,
        period: selectedPeriod,
        days_of_week: days,
        color: selectedColor,
        icon_key: selectedIconKey,
        unit,
        goal_value: goalValue ?? null,
        frequency_type: frequencyType,
        times_per_week: timesPerWeek ?? null,
        times_per_month: timesPerMonth ?? null,
        every_n_days: everyNDays ?? null,
        notification_pref: prefs.notificationsEnabled
          ? {
              reminder_enabled: true,
              reminder_time: "08:00",
              sound: prefs.defaultSound,
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
          className="rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/30 focus:border-lime-400/50"
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
          className="rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/30 focus:border-lime-400/50"
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
          className="rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/30 focus:border-lime-400/50"
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
              className="rounded-lg py-2 text-xs font-semibold transition-all duration-200 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            >
              Selecionar todos
            </button>
            <button
              type="button"
              onClick={() => setSelectedDays([])}
              className="rounded-lg py-2 text-xs font-semibold transition-all duration-200 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
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
                    ? "bg-lime-400 text-black"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
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
    setUnit((tpl.default_unit as typeof unit) ?? "none");
    setGoalValue(tpl.default_goal_value ?? undefined);
    setFrequencyType((tpl.default_frequency_type as typeof frequencyType) ?? "daily");
    setTimesPerWeek(tpl.default_times_per_week ?? undefined);
    setTimesPerMonth(tpl.default_times_per_month ?? undefined);
    setEveryNDays(tpl.default_every_n_days ?? undefined);
    if (tpl.default_days_of_week?.length) {
      setSelectedDays(tpl.default_days_of_week);
    } else {
      setSelectedDays([1, 2, 3, 4, 5]);
    }
    setStep("details");
  };

  const HeaderBar = (
    <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
      {step === "details" ? (
        <button
          onClick={() => setStep("select")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      ) : (
        <div className="w-10" />
      )}
      <div className="text-center">
        <p className="text-base font-semibold text-white tracking-wide">
          {step === "select" ? "Nova Tarefa" : "Confirmar Tarefa"}
        </p>
      </div>
      <button
        onClick={() => navigate("/dashboard")}
        className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-all"
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
                backgroundColor: isActive ? UNIFIED_COLOR : "rgba(163, 230, 53, 0.15)",
                border: isActive ? `2px solid ${UNIFIED_COLOR}` : "2px solid transparent",
              }}
            >
              {Icon && <Icon className="h-5 w-5" style={{ color: isActive ? "#000000" : UNIFIED_COLOR }} />}
            </button>
          );
        })}
      </div>

      {/* Descrição da categoria selecionada */}
      {selectedCategoryData && (
        <div className="px-6 pt-0">
          <p className="text-sm text-white/60 text-center leading-relaxed">
            {selectedCategoryData.description}
          </p>
        </div>
      )}

      {/* Lista de hábitos */}
      {selectedCategoryData && (
        <div className="space-y-3 px-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-2">
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
                  backgroundColor: UNIFIED_COLOR,
                  boxShadow: "0 4px 20px rgba(163, 230, 53, 0.25)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/20">
                    {TaskIcon && <TaskIcon className="h-6 w-6 text-black" />}
                  </div>
                  <div className="flex items-center gap-2 text-left">
                    {isHealthTask && (
                      <svg className="h-4 w-4 text-black/80" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    )}
                    <p className="text-base font-bold text-black">{tpl.name}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-black/60 group-hover:text-black transition-colors" />
              </button>
            );
          })}
        </div>
      )}

      {/* Mensagem inicial se nenhuma categoria selecionada */}
      {!selectedCategoryData && (
        <div className="px-6 pt-12 text-center">
          <p className="text-sm text-white/50">
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
          color={UNIFIED_COLOR}
          isAutoTask={selectedTemplateAuto}
        />

        {/* Task Title */}
        <div className="w-full px-6 text-center">
          <p className="text-2xl font-bold uppercase tracking-wide text-white">
            {habitName || "NOME DO HÁBITO"}
          </p>
        </div>
      </div>

      {/* Health Integration Alert */}
      {selectedTemplateAuto && (
        <div className="mx-4 flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 p-4">
          <svg className="h-5 w-5 text-lime-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              Esta tarefa usa dados do app Saúde.
            </p>
            <p className="mt-1 text-xs text-white/60">
              Conceda permissão ao Habitz quando solicitado.
            </p>
          </div>
        </div>
      )}

      {/* Title Input */}
      <div className="px-4">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
          TÍTULO
        </Label>
        <Input
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          placeholder="Digite o nome da tarefa"
          maxLength={18}
          className="mt-2 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-lime-400/50 focus:ring-lime-400/20"
        />
        <p className="mt-1.5 text-right text-xs text-white/40">
          {habitName.length} / 18
        </p>
      </div>

      {/* Goal Card */}
      <div className="mx-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10">
              <Target className="h-6 w-6 text-lime-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Meta
              </p>
              <p className="text-base font-semibold text-white">
                {goalValue
                  ? `${goalValue} ${unit === "none" ? "" : unit === "steps" ? "passos" : unit === "minutes" ? "min" : unit === "hours" ? "hrs" : unit === "pages" ? "pág" : unit === "liters" ? "L" : unit === "km" ? "km" : "un"}`
                  : "Definir meta"}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 space-y-3">
          <Input
            type="number"
            min={0}
            value={goalValue ?? ""}
            onChange={(e) =>
              setGoalValue(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/30 focus:border-lime-400/50"
            placeholder="Ex: 10000"
          />
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: "none", label: "Nenhum" },
              { value: "steps", label: "Passos" },
              { value: "minutes", label: "Minutos" },
              { value: "hours", label: "Horas" },
              { value: "km", label: "Km" },
              { value: "pages", label: "Páginas" },
              { value: "liters", label: "Litros" },
              { value: "custom", label: "Outro" },
            ].map((unitOption) => (
              <button
                key={unitOption.value}
                type="button"
                onClick={() => setUnit(unitOption.value as typeof unit)}
                className={`rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 ${
                  unit === unitOption.value
                    ? "bg-lime-400 text-black"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {unitOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task Days Card */}
      <div className="mx-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10">
              <Calendar className="h-6 w-6 text-lime-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Frequência
              </p>
              <p className="text-base font-semibold text-white">
                {frequencyType === "daily"
                  ? "Todo dia"
                  : frequencyType === "times_per_week" && timesPerWeek
                    ? `${timesPerWeek}x / semana`
                    : frequencyType === "times_per_month" && timesPerMonth
                      ? `${timesPerMonth}x / mês`
                      : frequencyType === "every_n_days" && everyNDays
                        ? `A cada ${everyNDays} dias`
                        : "Dias específicos"}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "daily", label: "Todo dia" },
              { value: "fixed_days", label: "Dias específicos" },
              { value: "times_per_week", label: "X vezes/semana" },
              { value: "times_per_month", label: "X vezes/mês" },
            ].map((freqOption) => (
              <button
                key={freqOption.value}
                type="button"
                onClick={() => setFrequencyType(freqOption.value as typeof frequencyType)}
                className={`rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 ${
                  frequencyType === freqOption.value
                    ? "bg-lime-400 text-black"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
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
      <div className="mx-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10">
              <Bell className="h-6 w-6 text-lime-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Notificações
              </p>
              <p className="text-base font-semibold text-white">
                {prefs.notificationsEnabled ? "Ativadas" : "Desativadas"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-4 pt-4">
        <button
          onClick={handleSave}
          disabled={!habitName.trim() || isSaving}
          className="h-14 w-full rounded-xl text-base font-bold uppercase tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: UNIFIED_COLOR,
            color: "#000000",
            boxShadow: "0 4px 24px rgba(163, 230, 53, 0.3)",
          }}
        >
          {isSaving ? "SALVANDO..." : "SALVAR TAREFA"}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90">
      <div className="mt-4 w-full max-w-md overflow-hidden rounded-3xl bg-[#000000] shadow-2xl animate-fade-in" style={{ maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 2rem)' }}>
        {HeaderBar}
        <div className="overflow-y-auto overscroll-contain scrollbar-hide" style={{ maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 6rem)' }}>
          <AnimatePresence mode="wait">
            {step === "select" && SelectStep}
            {step === "details" && DetailsStep}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CreateHabit;
