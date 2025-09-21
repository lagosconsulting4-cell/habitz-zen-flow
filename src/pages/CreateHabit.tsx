import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emojis = ["🧘‍♂️", "💪", "📚", "🏃‍♂️", "💧", "🌱", "✨", "🎯", "🎨", "🍎", "😴", "🧠"];

const categories = [
  { id: "mente", name: "Mente", color: "text-purple-600" },
  { id: "corpo", name: "Corpo", color: "text-green-600" },
  { id: "estudo", name: "Estudo", color: "text-blue-600" },
  { id: "saúde", name: "Saúde", color: "text-pink-600" }
];

const periods = [
  { id: "morning", name: "Manhã", emoji: "🌅" },
  { id: "afternoon", name: "Tarde", emoji: "☀️" },
  { id: "evening", name: "Noite", emoji: "🌙" }
];

const CreateHabit = () => {
  const [habitName, setHabitName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(emojis[0]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0].id);
  const navigate = useNavigate();

  const handleSave = () => {
    // In a real app, this would save to Supabase
    console.log({
      name: habitName,
      emoji: selectedEmoji,
      category: selectedCategory,
      period: selectedPeriod
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-medium">Novo Hábito</h1>
          <Button
            onClick={handleSave}
            disabled={!habitName.trim()}
            className="rounded-xl px-6 shadow-soft hover:shadow-medium transition-all duration-300"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>

        <div className="space-y-6">
          {/* Habit Name */}
          <Card className="glass-card p-6 animate-slide-up">
            <Label htmlFor="habit-name" className="text-lg font-medium">
              Nome do Hábito
            </Label>
            <Input
              id="habit-name"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="Ex: Meditar 10 minutos"
              className="mt-3 rounded-xl border-2 text-lg py-3"
            />
          </Card>

          {/* Emoji Selection */}
          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <Label className="text-lg font-medium mb-4 block">Escolha um Emoji</Label>
            <div className="grid grid-cols-6 gap-3">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
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

          {/* Category Selection */}
          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Label className="text-lg font-medium mb-4 block">Categoria</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
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

          {/* Period Selection */}
          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <Label className="text-lg font-medium mb-4 block">Período do Dia</Label>
            <div className="grid grid-cols-1 gap-3">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
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

          {/* Preview */}
          {habitName && (
            <Card className="glass-card p-6 animate-scale-in">
              <Label className="text-lg font-medium mb-4 block">Preview</Label>
              <div className="habit-card">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{selectedEmoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg">{habitName}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full bg-white/20 ${
                        categories.find(c => c.id === selectedCategory)?.color
                      }`}>
                        {categories.find(c => c.id === selectedCategory)?.name}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white/50 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="h-20" /> {/* Bottom spacing for safe area */}
      </div>
    </div>
  );
};

export default CreateHabit;