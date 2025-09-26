import { useEffect, useState } from "react";
import { Plus, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HabitCard from "@/components/HabitCard";
import DailyQuote from "@/components/DailyQuote";
import QuickTips from "@/components/QuickTips";
import { useNavigate } from "react-router-dom";
import { useHabits } from "@/hooks/useHabits";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { habits, loading, toggleHabit, getHabitCompletionStatus, getHabitsForDate } = useHabits();
  const [userName, setUserName] = useState("Habitz");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();

        if (profile?.display_name) {
          setUserName(profile.display_name);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleCreateHabit = () => {
    navigate("/create");
  };

  const today = new Date();
  const todaysHabits = getHabitsForDate(today);

  const morningHabits = todaysHabits.filter((habit) => habit.period === "morning");
  const afternoonHabits = todaysHabits.filter((habit) => habit.period === "afternoon");
  const eveningHabits = todaysHabits.filter((habit) => habit.period === "evening");

  const completedToday = todaysHabits.filter((habit) => getHabitCompletionStatus(habit.id)).length;
  const completionRate = todaysHabits.length > 0 ? Math.round((completedToday / todaysHabits.length) * 100) : 0;

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
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">
              Ola, <span className="gradient-text">{userName}!</span>
            </h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <Button
            onClick={handleCreateHabit}
            className="rounded-xl px-6 shadow-soft hover:shadow-medium transition-all duration-300"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo habito
          </Button>
        </div>

        <div className="mb-8 animate-slide-up">
          <DailyQuote />
        </div>

        <div className="mb-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <QuickTips />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up" style={{ animationDelay: "400ms" }}>
          <Card className="glass-card p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-light text-muted-foreground">Hoje</p>
                <p className="text-2xl font-medium">{completedToday}/{todaysHabits.length}</p>
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
                <p className="font-light text-muted-foreground">Melhor sequencia</p>
                <p className="text-2xl font-medium">{habits.length > 0 ? Math.max(...habits.map((habit) => habit.streak)) : 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {morningHabits.length > 0 && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: "600ms" }}>
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <span className="text-2xl">🌅</span>
              Manha
            </h2>
            <div className="grid gap-4">
              {morningHabits.map((habit) => (
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

        {afternoonHabits.length > 0 && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: "800ms" }}>
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <span className="text-2xl">🌤</span>
              Tarde
            </h2>
            <div className="grid gap-4">
              {afternoonHabits.map((habit) => (
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

        {eveningHabits.length > 0 && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: "1000ms" }}>
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <span className="text-2xl">🌙</span>
              Noite
            </h2>
            <div className="grid gap-4">
              {eveningHabits.map((habit) => (
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
    </div>
  );
};

export default Dashboard;





