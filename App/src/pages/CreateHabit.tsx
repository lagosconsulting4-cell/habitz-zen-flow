import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

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

const fallbackCategories = [
  { id: "Health", name: "Saúde", color: "#2ecc71", icon_key: "heart" },
  { id: "Fitness", name: "Fitness", color: "#1abc9c", icon_key: "run" },
  { id: "Mindfulness", name: "Mindfulness", color: "#9b59b6", icon_key: "meditate" },
  { id: "Nutrition", name: "Nutrição", color: "#f39c12", icon_key: "carrot" },
  { id: "Productivity", name: "Produtividade", color: "#3498db", icon_key: "focus" },
  { id: "custom", name: "Outro", color: "#475569", icon_key: "check" },
];

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

const CreateHabit = () => {
  const [habitName, setHabitName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<HabitEmoji>(HABIT_EMOJIS[0]);
  const [selectedCategory, setSelectedCategory] = useState(fallbackCategories[0].id);
  const [selectedColor, setSelectedColor] = useState<string | null>(fallbackCategories[0].color ?? null);
  const [selectedIconKey, setSelectedIconKey] = useState<string | null>(fallbackCategories[0].icon_key ?? null);
  const [goalValue, setGoalValue] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState<"none" | "steps" | "minutes" | "km" | "custom">("none");
  const [frequencyType, setFrequencyType] = useState<"fixed_days" | "times_per_week" | "times_per_month" | "every_n_days" | "daily">("fixed_days");
  const [timesPerWeek, setTimesPerWeek] = useState<number | undefined>(undefined);
  const [timesPerMonth, setTimesPerMonth] = useState<number | undefined>(undefined);
  const [everyNDays, setEveryNDays] = useState<number | undefined>(undefined);
  const [selectedPeriod, setSelectedPeriod] = useState<typeof periods[number]["id"]>(periods[0].id);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isSaving, setIsSaving] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createHabit } = useHabits();
  const { categories: catalogCategories, templates, isLoading: catalogLoading } = useHabitCatalog();
  const { prefs } = useAppPreferences();

  const categories = useMemo(
    () =>
      catalogCategories.length > 0
        ? catalogCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            color: cat.color ?? undefined,
            icon_key: cat.icon_key ?? null,
          }))
        : fallbackCategories,
    [catalogCategories]
  );

  useEffect(() => {
    if (catalogCategories.length > 0 && selectedCategory === fallbackCategories[0].id) {
      setSelectedCategory(catalogCategories[0].id);
      setSelectedColor(catalogCategories[0].color ?? null);
      setSelectedIconKey(catalogCategories[0].icon_key ?? null);
    }
  }, [catalogCategories, selectedCategory]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((value) => value !== day) : [...prev, day]
    );
  };

  const clearTemplateSelection = () => {
    setSelectedTemplateId(null);
    setHabitName("");
    setGoalValue(undefined);
    setUnit("none");
    setFrequencyType("fixed_days");
    setTimesPerWeek(undefined);
    setTimesPerMonth(undefined);
    setEveryNDays(undefined);
    setSelectedDays([1, 2, 3, 4, 5]);
    setSelectedColor(categories[0]?.color ?? fallbackCategories[0].color ?? null);
    setSelectedIconKey(categories[0]?.icon_key ?? fallbackCategories[0].icon_key ?? null);
  };

  const applyTemplate = (template: HabitTemplate) => {
    setSelectedTemplateId(template.id);
    setHabitName(template.name);
    if (template.category_id) {
      setSelectedCategory(template.category_id);
    }
    setSelectedColor(template.color ?? null);
    setSelectedIconKey(template.icon_key ?? null);
    setUnit((template.default_unit as typeof unit) ?? "none");
    setGoalValue(template.default_goal_value ?? undefined);
    setFrequencyType((template.default_frequency_type as typeof frequencyType) ?? "fixed_days");
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

  const filteredTemplates = useMemo(() => {
    if (templateFilter === "all") return templates;
    return templates.filter((tpl) => tpl.category_id === templateFilter);
  }, [templateFilter, templates]);

  const templateCategoryOptions = useMemo(() => {
    const base = [{ id: "all", name: "Todos" }, ...categories];
    const seen = new Set<string>();
    return base.filter((item) => {
      const exists = seen.has(item.id);
      seen.add(item.id);
      return !exists;
    });
  }, [categories]);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Novo hábito</h1>
            <p className="text-xs text-muted-foreground">Crie uma rotina alinhada com suas metas</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={!habitName.trim() || isSaving}
            className="rounded-xl px-6 shadow-soft hover:shadow-medium transition-all duration-300"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="glass-card p-6 animate-slide-up">
            <Label htmlFor="habit-name" className="text-lg font-medium">
              Nome do hábito
            </Label>
            <Input
              id="habit-name"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="Ex: Meditar 10 minutos"
              className="mt-3 rounded-xl border-2 text-lg py-3"
            />
          </Card>

          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <Label className="text-lg font-medium block">Escolha um hábito pronto (opcional)</Label>
                <p className="text-sm text-muted-foreground">Templates preenchem meta, frequência e ícone automaticamente.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearTemplateSelection} disabled={!selectedTemplateId}>
                Criar do zero
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {templateCategoryOptions.map((cat) => (
                <Button
                  key={cat.id}
                  variant={templateFilter === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTemplateFilter(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
              {catalogLoading && <p className="text-sm text-muted-foreground">Carregando catálogo...</p>}
              {!catalogLoading && filteredTemplates.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum template disponível nessa categoria.</p>
              )}
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className={`flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-colors ${
                    selectedTemplateId === template.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{template.name}</span>
                      {template.color && (
                        <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: template.color }} />
                      )}
                    </div>
                    {template.auto_complete_source === "health" && (
                      <span className="text-[11px] font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Auto
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{renderTemplateFrequency(template)}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Label className="text-lg font-medium mb-4 block">Escolha um emoji</Label>
            <div className="grid grid-cols-6 gap-3">
              {HABIT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  aria-pressed={selectedEmoji === emoji}
                  className={`w-12 h-12 rounded-xl text-2xl transition-all duration-300 ${
                    selectedEmoji === emoji
                      ? "bg-primary/20 border-2 border-primary scale-110"
                      : "bg-muted hover:bg-muted/80 border-2 border-transparent hover:scale-105"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </Card>

          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <Label className="text-lg font-medium mb-4 block">Categoria</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedColor(category.color ?? null);
                    setSelectedIconKey(category.icon_key ?? null);
                  }}
                  aria-pressed={selectedCategory === category.id}
                  className={`p-4 rounded-xl text-left transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                  }`}
                >
                  <span className="font-medium" style={category.color ? { color: category.color } : undefined}>
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <Label className="text-lg font-medium mb-4 block">Meta (opcional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                step={1}
                value={goalValue ?? ""}
                onChange={(e) => setGoalValue(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ex.: 5000"
                className="rounded-xl"
              />
              <div className="flex flex-wrap gap-2">
                {["none", "steps", "minutes", "km", "custom"].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u as typeof unit)}
                    className={`rounded-lg px-3 py-2 text-sm border ${
                      unit === u ? "border-primary bg-primary/10 text-primary" : "border-border"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <Label className="text-lg font-medium mb-4 block">Frequência</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                className="rounded-xl border px-3 py-2"
                value={frequencyType}
                onChange={(e) => setFrequencyType(e.target.value as typeof frequencyType)}
              >
                <option value="fixed_days">Dias específicos</option>
                <option value="times_per_week">X vezes por semana</option>
                <option value="times_per_month">X vezes por mês</option>
                <option value="every_n_days">A cada N dias</option>
                <option value="daily">Todos os dias</option>
              </select>

              <div className="md:col-span-2">{renderFrequencyFields()}</div>
            </div>
          </Card>

          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "500ms" }}>
            <Label className="text-lg font-medium mb-4 block">Período do dia</Label>
            <div className="grid grid-cols-1 gap-3">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  aria-pressed={selectedPeriod === period.id}
                  className={`p-4 rounded-xl text-left transition-all duration-300 ${
                    selectedPeriod === period.id
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{period.emoji}</span>
                    <span className="font-medium">{period.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {habitName && (
            <Card className="glass-card p-6 animate-scale-in">
              <Label className="text-lg font-medium mb-4 block">Preview</Label>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedEmoji}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{habitName}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">{selectedCategory}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {frequencyType === "fixed_days"
                      ? selectedDays
                          .sort((a, b) => a - b)
                          .map((d) => weekdays.find((w) => w.id === d)?.label)
                          .join(" • ")
                      : frequencyType === "times_per_week"
                        ? `${timesPerWeek ?? 0}x / semana`
                        : frequencyType === "times_per_month"
                          ? `${timesPerMonth ?? 0}x / mês`
                          : frequencyType === "every_n_days"
                            ? `A cada ${everyNDays ?? 0} dias`
                            : "Todos os dias"}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateHabit;
