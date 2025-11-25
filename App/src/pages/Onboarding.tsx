import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Target, Brain, Dumbbell, BookOpen, Heart, Briefcase, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const goalOptions = [
  {
    id: "productivity",
    title: "Produtividade",
    description: "Foco, organização e disciplina",
    icon: Target,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    habits: ["🌅 Acordar cedo", "📝 Planejar o dia", "🎯 Focar 25min (Pomodoro)"]
  },
  {
    id: "mindset",
    title: "Mentalidade",
    description: "Clareza mental e autocontrole", 
    icon: Brain,
    color: "bg-purple-50 text-purple-600 border-purple-200",
    habits: ["🧘‍♂️ Meditação 10min", "📚 Leitura 30min", "✨ Gratidão diária"]
  },
  {
    id: "fitness",
    title: "Físico",
    description: "Força, energia e disposição",
    icon: Dumbbell,
    color: "bg-green-50 text-green-600 border-green-200", 
    habits: ["💪 Exercícios 30min", "🚶‍♂️ Caminhada", "💧 Beber 2L água"]
  },
  {
    id: "learning",
    title: "Aprendizado", 
    description: "Crescimento e desenvolvimento",
    icon: BookOpen,
    color: "bg-orange-50 text-orange-600 border-orange-200",
    habits: ["📖 Estudar skill nova", "🎧 Podcast educativo", "✏️ Fazer anotações"]
  },
  {
    id: "wellness",
    title: "Bem-estar",
    description: "Saúde e equilíbrio",
    icon: Heart,
    color: "bg-red-50 text-red-600 border-red-200",
    habits: ["😴 Dormir 8h", "🥗 Comer saudável", "📱 Menos tela"]
  },
  {
    id: "career",
    title: "Carreira",
    description: "Networking e crescimento profissional",
    icon: Briefcase,
    color: "bg-gray-50 text-gray-600 border-gray-200",
    habits: ["🤝 Fazer networking", "📊 Atualizar CV", "💼 Buscar oportunidades"]
  }
];

const Onboarding = () => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleNext = async () => {
    if (currentStep === 1 && selectedGoals.length > 0) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Salvar dados do onboarding no Supabase
      setIsSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          toast.error("Usuário não autenticado");
          navigate("/auth");
          return;
        }

        // Salvar áreas de foco escolhidas
        const { error } = await supabase.rpc("complete_onboarding", {
          p_user_id: user.id,
          p_goals: selectedGoals
        });

        if (error) {
          console.error("Erro ao salvar onboarding:", error);
          toast.error("Erro ao salvar suas preferências");
          return;
        }

        toast.success("Preferências salvas com sucesso!");
        navigate("/dashboard");
      } catch (error) {
        console.error("Erro inesperado ao salvar onboarding:", error);
        toast.error("Erro ao salvar suas preferências");
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-muted/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">H</span>
              </div>
              <span className="text-3xl font-bold text-foreground">Habitz</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Qual seu foco principal?
            </h1>
            
            <p className="text-xl text-foreground/90 max-w-2xl mx-auto leading-relaxed">
              Escolha as áreas que você quer desenvolver. Vamos sugerir hábitos personalizados 
              para você começar sua jornada.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 animate-slide-up">
            {goalOptions.map((goal, index) => {
              const Icon = goal.icon;
              const isSelected = selectedGoals.includes(goal.id);
              
              return (
                <Card
                  key={goal.id}
                  className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 animate-slide-up ${
                    isSelected 
                      ? 'ring-2 ring-white bg-muted/20 backdrop-blur-sm' 
                      : 'bg-muted/20 backdrop-blur-sm hover:bg-muted/15'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => toggleGoal(goal.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${goal.color} ${isSelected ? 'bg-foreground text-background' : ''}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-lg">{goal.title}</h3>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-foreground" />
                        )}
                      </div>
                      <p className="text-foreground/70 text-sm mb-3">{goal.description}</p>
                      
                      <div className="space-y-1">
                        {goal.habits.map((habit, idx) => (
                          <div key={idx} className="text-muted-foreground text-xs">
                            {habit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="text-center animate-fade-in">
            <p className="text-muted-foreground text-sm mb-6">
              {selectedGoals.length} área{selectedGoals.length !== 1 ? 's' : ''} selecionada{selectedGoals.length !== 1 ? 's' : ''}
            </p>
            
            <Button
              onClick={handleNext}
              disabled={selectedGoals.length === 0}
              size="lg"
              className="px-12 py-4 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted/30 disabled:text-foreground/50 shadow-strong"
            >
              Continuar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 - Confirmation
  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        <div className="mb-12">
          <div className="w-20 h-20 bg-muted/15 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-foreground" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Perfeito!
          </h1>
          
          <p className="text-xl text-foreground/90 mb-8 leading-relaxed">
            Com base nos seus objetivos, criamos uma rotina personalizada. 
            Comece devagar e seja consistente.
          </p>

          <div className="bg-muted/20 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h3 className="text-foreground font-semibold text-lg mb-4">Suas áreas de foco:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {selectedGoals.map(goalId => {
                const goal = goalOptions.find(g => g.id === goalId);
                return (
                  <Badge key={goalId} variant="secondary" className="bg-muted/20 text-foreground text-sm">
                    {goal?.title}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        <Button
          onClick={handleNext}
          disabled={isSaving}
          size="lg"
          className="px-12 py-4 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 shadow-strong disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Começar Jornada"}
          {!isSaving && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>
        
        <p className="text-muted-foreground text-sm mt-6">
          Você pode ajustar seus hábitos a qualquer momento
        </p>
      </div>
    </div>
  );
};

export default Onboarding;