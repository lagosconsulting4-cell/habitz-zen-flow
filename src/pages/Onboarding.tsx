import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Target, Zap, Heart, BookOpen, Activity } from "lucide-react";

const goals = [
  {
    id: "productivity",
    title: "Produtividade",
    description: "Organizar melhor meu tempo e tarefas",
    icon: Target,
    color: "text-purple-500"
  },
  {
    id: "focus", 
    title: "Foco",
    description: "Melhorar concentração e reduzir distrações",
    icon: Zap,
    color: "text-blue-500"
  },
  {
    id: "health",
    title: "Saúde",
    description: "Cuidar melhor do meu corpo e mente",
    icon: Heart,
    color: "text-pink-500"
  },
  {
    id: "learning",
    title: "Aprendizado",
    description: "Desenvolver novos conhecimentos e habilidades",
    icon: BookOpen,
    color: "text-green-500"
  },
  {
    id: "fitness",
    title: "Exercícios",
    description: "Manter uma rotina de atividade física",
    icon: Activity,
    color: "text-orange-500"
  }
];

const Onboarding = () => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    // In a real app, this would save goals to Supabase
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <span className="text-4xl">🌟</span>
          </div>
          <h1 className="text-4xl font-light text-white mb-4">
            Bem-vindo ao <span className="font-medium gradient-text">Habitz</span>
          </h1>
          <p className="text-white/80 text-lg font-light">
            Vamos começar definindo seus objetivos pessoais
          </p>
        </div>

        <Card className="glass-card p-8 animate-slide-up">
          <h2 className="text-2xl font-medium text-center mb-8">
            Quais são seus principais objetivos?
          </h2>
          
          <div className="grid gap-4 mb-8">
            {goals.map((goal, index) => {
              const Icon = goal.icon;
              const isSelected = selectedGoals.includes(goal.id);
              
              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 animate-slide-up ${
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-medium" 
                      : "border-border hover:border-primary/30 hover:shadow-soft"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => toggleGoal(goal.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : goal.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{goal.title}</h3>
                      <p className="text-muted-foreground font-light">{goal.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-primary animate-scale-in" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Button 
              onClick={handleContinue}
              disabled={selectedGoals.length === 0}
              className="px-8 py-6 text-lg font-light rounded-2xl shadow-medium hover:shadow-strong transition-all duration-300"
              size="lg"
            >
              Continuar ({selectedGoals.length} selecionados)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;