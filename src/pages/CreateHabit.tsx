import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/hooks/useHabits";

const emojis = ["🔥", "📚", "💪", "🧠", "🧘", "🥗", "💧", "✍️", "🎧", "🏃", "🌞", "🌙"];

const categories = [
  { id: "mente", name: "Mente", color: "text-purple-600" },
  { id: "corpo", name: "Corpo", color: "text-green-600" },
  { id: "estudo", name: "Estudo", color: "text-blue-600" },
  { id: "carreira", name: "Carreira", color: "text-amber-600" },
  { id: "relacionamento", name: "Relacionamento", color: "text-pink-600" },
  { id: "financeiro", name: "Financeiro", color: "text-emerald-600" },
  { id: "outro", name: "Outro", color: "text-slate-600" },
];

const periods: Array<{ id: "morning" | "afternoon" | "evening"; name: string; emoji: string }> = [
  { id: "morning", name: "Manha", emoji: "🌅" },
  { id: "afternoon", name: "Tarde", emoji: "☀️" },
  { id: "evening", name: "Noite", emoji: "🌙" },
];

const weekdays = [
  { id: 1, label: "Seg" },
  { id: 2, label: "Ter" },
  { id: 3, label: "Qua" },
  { id: 4, label: "Qui" },
  { id: 5, label: "Sex" },
  { id: 6, label: "Sab" },
  { id: 0, label: "Dom" },
];

const CreateHabit = () => {
  const [habitName, setHabitName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(emojis[0]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [selectedPeriod, setSelectedPeriod] = useState<typeof periods[number]["id"]>(periods[0].id);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createHabit } = useHabits();

  const toggleDay = (day: number) => {
    setSelectedDays((prev) => (
      prev.includes(day) ? prev.filter((value) => value !== day) : [...prev, day]
    ));
  };

  const handleSave = async () => {
    if (!habitName.trim()) {
      toast({
        title: "Informe um nome",
        description: "Escolha um titulo para o habito antes de salvar",
        variant: "destructive",
      });
      return;
    }

    if (selectedDays.length === 0) {
      toast({
        title: "Selecione dias",
        description: "Escolha ao menos um dia da semana",
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
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to create habit", error);
    } finally {
      setIsSaving(false);
    }
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
            <h1 className="text-2xl font-semibold">Novo habito</h1>
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
              Nome do habito
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
            <Label className="text-lg font-medium mb-4 block">Escolha um emoji</Label>
            <div className="grid grid-cols-6 gap-3">
              {emojis.map((emoji) => (
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

          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Label className="text-lg font-medium mb-4 block">Categoria</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  aria-pressed={selectedCategory === category.id}
                  className={`p-4 rounded-xl text-left transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                  }`}
                >
                  <span className={`font-medium ${category.color}`}>
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <Label className="text-lg font-medium mb-4 block">Periodo do dia</Label>
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

          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <Label className="text-lg font-medium mb-4 block">Dias da semana</Label>
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
          </Card>

          {habitName && (
            <Card className="glass-card p-6 animate-scale-in">
              <Label className="text-lg font-medium mb-4 block">Preview</Label>
              <div className="habit-card">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{selectedEmoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg">{habitName}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full bg-white/20 ${
                          categories.find((category) => category.id === selectedCategory)?.color ?? ""
                        }`}
                      >
                        {categories.find((category) => category.id === selectedCategory)?.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedDays
                        .sort((a, b) => a - b)
                        .map((day) => weekdays.find((weekday) => weekday.id === day)?.label)
                        .join(" • ")}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white/50 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="h-20" />
      </div>
    </div>
  );
};

export default CreateHabit;

