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
    colorToken: "#FBBF24",
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
    colorToken: "#A3E635",
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
    colorToken: "#FB923C",
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
    colorToken: "#60A5FA",
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
    colorToken: "#F472B6",
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
          className="rounded-xl"
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
          className="rounded-xl"
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
          className="rounded-xl"
        />
      );
    }
    if (frequencyType === "fixed_days") {
      return (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
          {weekdays.map((day) => (
            <button
              key={day.id}
              onClick={() => toggleDay(day.id)}
              aria-pressed={selectedDays.includes(day.id)}
              className={`rounded-xl py-3 text-sm font-medium transition-all duration-200 ${
                selectedDays.includes(day.id)
                  ? "bg-primary text-white shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {day.label}
            </button>
          ))}
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
    <div className="flex items-center justify-between px-4 py-3">
      {step === "details" ? (
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setStep("select")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      ) : (
        <div className="w-10" />
      )}
      <div className="text-center">
        <p className="text-base font-semibold">
          {step === "select" ? "Add Task" : "Confirm Task"}
        </p>
      </div>
      <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/dashboard")}>
        <X className="h-5 w-5" />
      </Button>
    </div>
  );

  const SelectStep = (
    <motion.div
      key="select"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-4 pb-6"
    >
      {/* Category Pills - Apenas ícones circulares */}
      <div className="flex items-center justify-center gap-3 px-4 py-2">
        {CATEGORY_DATA.map((cat) => {
          const Icon = getHabitIcon(cat.iconKey);
          const isActive = selectedCategoryData?.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat)}
              className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 active:scale-95"
              style={{
                backgroundColor: isActive ? cat.colorToken : `${cat.colorToken}30`,
              }}
            >
              {Icon && <Icon className="h-6 w-6" style={{ color: isActive ? "#FFFFFF" : cat.colorToken }} />}
            </button>
          );
        })}
      </div>

      {/* Descrição da categoria selecionada */}
      {selectedCategoryData && (
        <div className="px-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Health tasks are linked to the Health app and are automatically marked as complete when new data is recorded.
          </p>
        </div>
      )}

      {/* Lista de hábitos */}
      {selectedCategoryData && (
        <div className="space-y-2 px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
            CREATE A HEALTH TASK:
          </p>
          {selectedCategoryData.tasks.map((tpl) => {
            const TaskIcon = tpl.iconKey ? getHabitIcon(tpl.iconKey as any) : getHabitIcon(selectedCategoryData.iconKey);
            const isHealthTask = tpl.auto_complete_source === "health";
            return (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                style={{
                  backgroundColor: selectedCategoryData.colorToken,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    {TaskIcon && <TaskIcon className="h-5 w-5 text-white" />}
                  </div>
                  <div className="flex items-center gap-2 text-left">
                    {isHealthTask && (
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    )}
                    <p className="text-base font-semibold text-white">{tpl.name}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            );
          })}
        </div>
      )}

      {/* Mensagem inicial se nenhuma categoria selecionada */}
      {!selectedCategoryData && (
        <div className="px-4 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
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
      className="space-y-4 pb-6"
    >
      {/* Hero Circle Section */}
      <div className="flex flex-col items-center gap-4 py-6">
        <HeroCircle
          iconKey={selectedTemplate?.iconKey ? (selectedTemplate.iconKey as any) : selectedCategoryData?.iconKey ?? null}
          color={selectedCategoryData?.colorToken ?? "#A3E635"}
          isAutoTask={selectedTemplateAuto}
        />

        {/* Task Title */}
        <div className="w-full px-4 text-center">
          <p
            className="text-xl font-bold uppercase tracking-wider"
            style={{ color: selectedCategoryData?.colorToken ?? "#A3E635" }}
          >
            {habitName || "NOME DO HÁBITO"}
          </p>
        </div>
      </div>

      {/* Health Integration Alert */}
      {selectedTemplateAuto && <HealthIntegrationAlert />}

      {/* Title Input */}
      <div className="px-4">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          TITLE:
        </Label>
        <Input
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          placeholder="Automatic"
          maxLength={18}
          className="mt-1 rounded-xl"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {habitName.length} / 18
        </p>
      </div>

      {/* Goal Card */}
      <div className="mx-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: `${selectedCategoryData?.colorToken ?? "#A3E635"}20` }}
            >
              <Target
                className="h-6 w-6"
                style={{ color: selectedCategoryData?.colorToken ?? "#A3E635" }}
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Goal
              </p>
              <p className="text-base font-semibold">
                {goalValue
                  ? `${goalValue} ${unit === "none" ? "" : unit}`
                  : "Set goal"}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="border-t border-border/60 px-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={goalValue ?? ""}
              onChange={(e) =>
                setGoalValue(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-24 rounded-xl"
              placeholder="5000"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as typeof unit)}
              className="flex-1 rounded-xl border px-3 py-2"
            >
              <option value="none">None</option>
              <option value="steps">Steps</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="km">km</option>
              <option value="pages">Pages</option>
              <option value="liters">Liters</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Days Card */}
      <div className="mx-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: `${selectedCategoryData?.colorToken ?? "#A3E635"}20` }}
            >
              <Calendar
                className="h-6 w-6"
                style={{ color: selectedCategoryData?.colorToken ?? "#A3E635" }}
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Task Days
              </p>
              <p className="text-base font-semibold">
                {frequencyType === "daily"
                  ? "Every Day"
                  : frequencyType === "times_per_week" && timesPerWeek
                    ? `${timesPerWeek}x / week`
                    : frequencyType === "times_per_month" && timesPerMonth
                      ? `${timesPerMonth}x / month`
                      : frequencyType === "every_n_days" && everyNDays
                        ? `Every ${everyNDays} days`
                        : "Specific days"}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="border-t border-border/60 px-4 py-4 space-y-3">
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={frequencyType}
            onChange={(e) =>
              setFrequencyType(e.target.value as typeof frequencyType)
            }
          >
            <option value="daily">Every day</option>
            <option value="fixed_days">Specific days</option>
            <option value="times_per_week">X times per week</option>
            <option value="times_per_month">X times per month</option>
            <option value="every_n_days">Every N days</option>
          </select>
          <div>{renderFrequencyFields()}</div>
        </div>
      </div>

      {/* Notifications Card */}
      <div className="mx-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: `${selectedCategoryData?.colorToken ?? "#A3E635"}20` }}
            >
              <Bell
                className="h-6 w-6"
                style={{ color: selectedCategoryData?.colorToken ?? "#A3E635" }}
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Notifications
              </p>
              <p className="text-base font-semibold">
                {prefs.notificationsEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* CTA Button */}
      <div className="px-4 pt-2">
        <Button
          className="h-14 w-full rounded-xl text-base font-bold uppercase tracking-wide shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: selectedCategoryData?.colorToken ?? "#A3E635",
            color: "#000000",
          }}
          disabled={!habitName.trim() || isSaving}
          onClick={handleSave}
        >
          {isSaving ? "SAVING..." : "SAVE TASK"}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm">
      <div className="mt-4 w-full max-w-md overflow-hidden rounded-3xl bg-background shadow-[var(--shadow-strong)] animate-fade-in" style={{ maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 2rem)' }}>
        {HeaderBar}
        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 6rem)' }}>
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
