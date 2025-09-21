import { useState } from "react";
import { Plus, Calendar, TrendingUp, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HabitCard from "@/components/HabitCard";
import NavigationBar from "@/components/NavigationBar";
import DailyQuote from "@/components/DailyQuote";
import QuickTips from "@/components/QuickTips";
import UpgradePrompt from "@/components/UpgradePrompt";
import { useNavigate } from "react-router-dom";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: string;
  period: "morning" | "afternoon" | "evening";
  completed: boolean;
  streak: number;
}

// Mock data - in real app this would come from Supabase
const mockHabits: Habit[] = [
  {
    id: "1",
    name: "Meditação",
    emoji: "🧘‍♂️", 
    category: "mente",
    period: "morning" as const,
    completed: false,
    streak: 7
  },
  {
    id: "2", 
    name: "Exercícios",
    emoji: "💪",
    category: "corpo", 
    period: "morning" as const,
    completed: true,
    streak: 12
  },
  {
    id: "3",
    name: "Ler 30min",
    emoji: "📚",
    category: "estudo",
    period: "afternoon" as const, 
    completed: false,
    streak: 5
  },
  {
    id: "4",
    name: "Gratidão", 
    emoji: "✨",
    category: "mente",
    period: "evening" as const,
    completed: false,
    streak: 3
  }
];

const Dashboard = () => {
  const [habits, setHabits] = useState(mockHabits);
  const navigate = useNavigate();
  
  const MAX_FREE_HABITS = 3;
  const isPremium = false; // This would come from user subscription status

  const toggleHabit = (habitId: string) => {
    setHabits(prev => 
      prev.map(habit => 
        habit.id === habitId 
          ? { 
              ...habit, 
              completed: !habit.completed,
              streak: !habit.completed ? habit.streak + 1 : Math.max(0, habit.streak - 1)
            }
          : habit
      )
    );
  };

  const handleCreateHabit = () => {
    if (!isPremium && habits.length >= MAX_FREE_HABITS) {
      // Will show upgrade prompt instead of navigating
      return;
    }
    navigate("/create");
  };

  const handleUpgrade = () => {
    console.log("Redirect to Stripe checkout - R$ 247/year");
    // This would redirect to Stripe checkout
  };

  const morningHabits = habits.filter(h => h.period === "morning");
  const afternoonHabits = habits.filter(h => h.period === "afternoon"); 
  const eveningHabits = habits.filter(h => h.period === "evening");

  const completedToday = habits.filter(h => h.completed).length;
  const completionRate = Math.round((completedToday / habits.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">
              Olá, <span className="gradient-text">Jovem!</span>
            </h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
          <Button 
            onClick={handleCreateHabit}
            className="rounded-xl px-6 shadow-soft hover:shadow-medium transition-all duration-300"
            size="lg"
            disabled={!isPremium && habits.length >= MAX_FREE_HABITS}
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Hábito
            {!isPremium && (
              <Crown className="w-4 h-4 ml-1 text-yellow-500" />
            )}
          </Button>
        </div>

        {/* Upgrade Prompt */}
        <div className="mb-8">
          <UpgradePrompt 
            currentHabits={habits.length}
            maxFreeHabits={MAX_FREE_HABITS}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Daily Quote */}
        <div className="mb-8 animate-slide-up">
          <DailyQuote />
        </div>

        {/* Quick Tips */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <QuickTips />
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up" style={{ animationDelay: "400ms" }}>
          <Card className="glass-card p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-light text-muted-foreground">Hoje</p>
                <p className="text-2xl font-medium">{completedToday}/{habits.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-light text-muted-foreground">Taxa de sucesso</p>
                <p className="text-2xl font-medium">{completionRate}%</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/30 rounded-xl">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <p className="font-light text-muted-foreground">Melhor streak</p>
                <p className="text-2xl font-medium">{Math.max(...habits.map(h => h.streak))}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Morning Habits */}
        {morningHabits.length > 0 && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: "600ms" }}>
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <span className="text-2xl">🌅</span>
              Manhã
            </h2>
            <div className="grid gap-4">
              {morningHabits.map(habit => (
                <HabitCard 
                  key={habit.id}
                  habit={habit}
                  onToggle={toggleHabit}
                />
              ))}
            </div>
          </div>
        )}

        {/* Afternoon Habits */}
        {afternoonHabits.length > 0 && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: "800ms" }}>
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <span className="text-2xl">☀️</span>
              Tarde
            </h2>
            <div className="grid gap-4">
              {afternoonHabits.map(habit => (
                <HabitCard 
                  key={habit.id}
                  habit={habit}
                  onToggle={toggleHabit}
                />
              ))}
            </div>
          </div>
        )}

        {/* Evening Habits */}
        {eveningHabits.length > 0 && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: "1000ms" }}>
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <span className="text-2xl">🌙</span>
              Noite
            </h2>
            <div className="grid gap-4">
              {eveningHabits.map(habit => (
                <HabitCard 
                  key={habit.id}
                  habit={habit}
                  onToggle={toggleHabit}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default Dashboard;