import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  // Mock current habits count and premium status
  const currentHabitsCount = 3; // This would come from context/state
  const isPremium = false;
  const maxFreeHabits = 3;
  
  const isAtLimit = !isPremium && currentHabitsCount >= maxFreeHabits;

  const handleSave = () => {
    if (isAtLimit) {
      toast({
        title: "Limite atingido",
        description: "Você já tem 3 hábitos. Faça upgrade para criar mais!",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would save to Supabase
    console.log({
      name: habitName,
      emoji: selectedEmoji,
      category: selectedCategory,
      period: selectedPeriod
    });
    
    toast({
      title: "Hábito criado!",
      description: `${selectedEmoji} ${habitName} foi adicionado à sua rotina.`
    });
    
    navigate("/dashboard");
  };

  const handleUpgrade = () => {
    console.log("Redirect to upgrade page");
    // Navigate to upgrade flow
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
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Novo Hábito</h1>
            {!isPremium && (
              <p className="text-xs text-muted-foreground">
                {currentHabitsCount}/{maxFreeHabits} hábitos gratuitos
              </p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={!habitName.trim() || isAtLimit}
            className="rounded-xl px-6 shadow-soft hover:shadow-medium transition-all duration-300"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>

        {/* Upgrade Notice */}
        {isAtLimit && (
          <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 p-6 mb-6 animate-fade-in">
            <div className="text-center">
              <Crown className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Limite Atingido</h3>
              <p className="text-muted-foreground mb-4">
                Você já tem {maxFreeHabits} hábitos gratuitos. Faça upgrade para criar hábitos ilimitados!
              </p>
              <Button onClick={handleUpgrade} className="bg-primary hover:bg-primary/90">
                <Crown className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          </Card>
        )}

        <div className={`space-y-6 ${isAtLimit ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Habit Name */}
          <Card className="glass-card p-6 animate-slide-up relative">
            {isAtLimit && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <Label htmlFor="habit-name" className="text-lg font-medium">
              Nome do Hábito
            </Label>
            <Input
              id="habit-name"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="Ex: Meditar 10 minutos"
              className="mt-3 rounded-xl border-2 text-lg py-3"
              disabled={isAtLimit}
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