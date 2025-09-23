import { Calendar, TrendingUp, Target, Award, Crown, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";

const Progress = () => {
  const isPremium = false; // This would come from user subscription status
  
  // Mock data - in real app this would come from Supabase
  const weeklyProgress = [
    { day: "Dom", completed: 2, total: 4 },
    { day: "Seg", completed: 4, total: 4 },
    { day: "Ter", completed: 3, total: 4 },
    { day: "Qua", completed: 4, total: 4 },
    { day: "Qui", completed: 2, total: 4 },
    { day: "Sex", completed: 3, total: 4 },
    { day: "Sáb", completed: 1, total: 4 },
  ];

  const streaks = [
    { habit: "Meditação", emoji: "🧘‍♂️", streak: 12, bestStreak: 15 },
    { habit: "Exercícios", emoji: "💪", streak: 8, bestStreak: 20 },
    { habit: "Leitura", emoji: "📚", streak: 5, bestStreak: 12 },
    { habit: "Gratidão", emoji: "✨", streak: 3, bestStreak: 7 },
  ];

  const monthlyStats = {
    totalDays: 30,
    perfectDays: 8,
    consistency: 78,
    topCategory: "Mente"
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-light mb-2">
            Seu <span className="font-medium gradient-text">Progresso</span>
          </h1>
          <p className="text-muted-foreground font-light">
            Acompanhe sua jornada de desenvolvimento pessoal
          </p>
        </div>

        {/* Monthly Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <Card className="glass-card p-4">
            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-xl mx-auto w-fit mb-3">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-medium">{monthlyStats.perfectDays}</p>
              <p className="text-xs text-muted-foreground font-light">Dias perfeitos</p>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="text-center">
              <div className="p-3 bg-accent/10 rounded-xl mx-auto w-fit mb-3">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl font-medium">{monthlyStats.consistency}%</p>
              <p className="text-xs text-muted-foreground font-light">Consistência</p>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="text-center">
              <div className="p-3 bg-secondary/30 rounded-xl mx-auto w-fit mb-3">
                <Target className="w-6 h-6 text-secondary-foreground" />
              </div>
              <p className="text-2xl font-medium">{monthlyStats.topCategory}</p>
              <p className="text-xs text-muted-foreground font-light">Top categoria</p>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="text-center">
              <div className="p-3 bg-gradient-primary rounded-xl mx-auto w-fit mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-medium">{Math.max(...streaks.map(s => s.streak))}</p>
              <p className="text-xs text-muted-foreground font-light">Melhor streak</p>
            </div>
          </Card>
        </div>

        {/* Weekly Progress */}
        <Card className="glass-card p-6 mb-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-xl font-medium mb-6">Progresso Semanal</h2>
          <div className="flex justify-between items-end h-32">
            {weeklyProgress.map((day, index) => {
              const percentage = (day.completed / day.total) * 100;
              const height = Math.max((percentage / 100) * 80, 8);
              
              return (
                <div key={day.day} className="flex flex-col items-center gap-2">
                  <div className="relative w-8">
                    <div 
                      className="w-full bg-gradient-primary rounded-t-lg transition-all duration-500"
                      style={{ 
                        height: `${height}px`,
                        animationDelay: `${index * 100}ms`
                      }}
                    />
                    <div 
                      className="w-full bg-muted/30 rounded-b-lg"
                      style={{ height: `${80 - height}px` }}
                    />
                  </div>
                  <span className="text-sm font-light text-muted-foreground">
                    {day.day}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {day.completed}/{day.total}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Streaks */}
        <Card className="glass-card p-6 mb-8 animate-slide-up" style={{ animationDelay: "400ms" }}>
          <h2 className="text-xl font-medium mb-6">Sequências de Hábitos</h2>
          <div className="space-y-4">
            {streaks.map((streak, index) => (
              <div 
                key={streak.habit}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-xl animate-slide-up hover:bg-muted/40 transition-colors"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{streak.emoji}</div>
                  <div>
                    <p className="font-medium">{streak.habit}</p>
                    <p className="text-sm text-muted-foreground font-light">
                      Melhor: {streak.bestStreak} dias
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-medium gradient-text">
                      {streak.streak}
                    </span>
                    <span className="text-orange-500">🔥</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-light">
                    dias seguidos
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Premium Features Teaser */}
        {!isPremium && (
          <Card className="glass-card p-6 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors animate-slide-up" style={{ animationDelay: "800ms" }}>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Relatórios Premium</h3>
                <p className="text-muted-foreground font-light mb-4">
                  Desbloqueie análises mensais detalhadas, comparações e insights personalizados
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>Relatório mensal</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>Comparações</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>Insights IA</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>Exportar dados</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade para Premium
              </Button>
              
              <p className="text-xs text-muted-foreground">
                R$ 247/ano • Cancele quando quiser
              </p>
            </div>
          </Card>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default Progress;