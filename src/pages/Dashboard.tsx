import { useEffect, useState } from "react";
import { Plus, Calendar, TrendingUp, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HabitCard from "@/components/HabitCard";
import NavigationBar from "@/components/NavigationBar";
import DailyQuote from "@/components/DailyQuote";
import QuickTips from "@/components/QuickTips";
import UpgradePrompt from "@/components/UpgradePrompt";
import { useNavigate } from "react-router-dom";
import { useHabits } from "@/hooks/useHabits";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { habits, loading, toggleHabit, getHabitCompletionStatus } = useHabits();
  const [userName, setUserName] = useState("Jovem");
  const navigate = useNavigate();
  
  const MAX_FREE_HABITS = 3;
  const isPremium = false; // This would come from user subscription status

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.display_name) {
          setUserName(profile.display_name);
        }
      }
    };

    fetchUserProfile();
  }, []);

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

  const completedToday = habits.filter(h => getHabitCompletionStatus(h.id)).length;
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">
              Olá, <span className="gradient-text">{userName}!</span>
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
                <p className="text-2xl font-medium">{habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0}</p>
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
                  isCompleted={getHabitCompletionStatus(habit.id)}
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
                  isCompleted={getHabitCompletionStatus(habit.id)}
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
                  isCompleted={getHabitCompletionStatus(habit.id)}
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