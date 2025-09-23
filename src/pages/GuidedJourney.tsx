import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";
import { Crown, Target, CheckCircle2, Circle, Play, Clock, Lock } from "lucide-react";
import { guidedJourney } from "@/data/guided-journey";

const GuidedJourney = () => {
  const isPremium = false; // This would come from user subscription status
  const [selectedWeek, setSelectedWeek] = useState(null);

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-light mb-2">
              Modo <span className="font-medium gradient-text">Guiado</span>
            </h1>
            <p className="text-muted-foreground font-light">
              Trilha de 4 semanas para transformação completa
            </p>
          </div>

          {/* Premium Teaser */}
          <Card className="glass-card p-8 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors animate-fade-in">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-6 bg-gradient-primary rounded-full">
                  <Crown className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-medium mb-4">Trilha de Transformação Premium</h2>
                <p className="text-muted-foreground font-light text-lg mb-8 leading-relaxed">
                  Um programa estruturado de 4 semanas para quebrar padrões, disciplinar o corpo, 
                  fortalecer a mente e forjar uma nova identidade.
                </p>
                
                {/* Journey Preview */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {guidedJourney.map((week, index) => (
                    <div 
                      key={week.id}
                      className="p-6 bg-muted/20 rounded-xl text-left animate-slide-up"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Semana {week.week}</h3>
                          <p className="text-sm text-muted-foreground">{week.title}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">{week.theme}</p>
                      
                      <div className="space-y-2">
                        {week.daily_tasks.slice(0, 3).map((task, taskIndex) => (
                          <div key={taskIndex} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Lock className="w-3 h-3" />
                            <span>Dia {task.day}: {task.title}</span>
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground italic">+ 4 tarefas adicionais</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Target className="w-6 h-6 text-primary" />
                    <span>28 Desafios Diários</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Play className="w-6 h-6 text-primary" />
                    <span>Áudios Motivacionais</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                    <span>Tracking de Progresso</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Crown className="w-6 h-6 text-primary" />
                    <span>Suporte Premium</span>
                  </div>
                </div>
              </div>

              <Button 
                size="lg"
                className="w-full bg-gradient-primary hover:shadow-elegant transition-all duration-300 text-lg py-6"
              >
                <Crown className="w-5 h-5 mr-2" />
                Desbloquear Modo Guiado - R$ 247/ano
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Transformação garantida em 28 dias • Cancele quando quiser
              </p>
            </div>
          </Card>
        </div>

        <NavigationBar />
      </div>
    );
  }

  // Premium version (when user has subscription)
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-light mb-2">
            Modo <span className="font-medium gradient-text">Guiado</span>
          </h1>
          <p className="text-muted-foreground font-light">
            Sua trilha de transformação em 4 semanas
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="glass-card p-6 mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Progresso Geral</h2>
            <Badge variant="default" className="bg-gradient-primary">
              Semana 2 - Ativa
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted/30 rounded-full h-2">
              <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "45%" }}></div>
            </div>
            <span className="text-sm text-muted-foreground">45% completo</span>
          </div>
        </Card>

        {/* Weeks */}
        <div className="space-y-6">
          {guidedJourney.map((week, index) => (
            <Card 
              key={week.id}
              className={`glass-card p-6 cursor-pointer hover:shadow-elegant transition-all duration-300 animate-slide-up ${
                selectedWeek?.id === week.id ? 'ring-2 ring-primary' : ''
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => setSelectedWeek(selectedWeek?.id === week.id ? null : week)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">Semana {week.week}: {week.title}</h3>
                    <p className="text-muted-foreground font-light">{week.theme}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={week.week <= 2 ? "default" : "outline"}>
                    {week.week <= 2 ? "Completa" : "Bloqueada"}
                  </Badge>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">{week.summary}</p>
              
              {selectedWeek?.id === week.id && (
                <div className="mt-6 pt-6 border-t border-border/50 animate-fade-in">
                  <h4 className="font-medium mb-4">Tarefas da Semana:</h4>
                  
                  <div className="grid gap-3">
                    {week.daily_tasks.map((task, taskIndex) => (
                      <div 
                        key={taskIndex}
                        className="flex items-start gap-3 p-4 bg-muted/20 rounded-xl"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {week.week <= 2 ? 
                            <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          }
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">Dia {task.day}: {task.title}</h5>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {task.estimated_time}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                            >
                              {task.type === "action" ? "Ação" : 
                               task.type === "reflection" ? "Reflexão" : "Desafio"}
                            </Badge>
                            
                            {week.week <= 2 && (
                              <Button size="sm" variant="ghost" className="text-xs">
                                <Play className="w-3 h-3 mr-1" />
                                Ver Detalhes
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {week.audio_guide && week.week <= 2 && (
                    <div className="mt-6 pt-4 border-t border-border/50">
                      <Button className="w-full bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                        <Play className="w-4 h-4 mr-2" />
                        Ouvir Áudio Motivacional da Semana
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      <NavigationBar />
    </div>
  );
};

export default GuidedJourney;