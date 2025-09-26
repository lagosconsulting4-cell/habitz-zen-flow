import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";
import { Target, CheckCircle2, Circle, Play, Clock } from "lucide-react";
import { guidedJourney } from "@/data/guided-journey";

const GuidedJourney = () => {
  const [selectedWeek, setSelectedWeek] = useState<(typeof guidedJourney)[number] | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-light mb-2">
            Modo <span className="font-medium gradient-text">Guiado</span>
          </h1>
          <p className="text-muted-foreground font-light">
            Trilha de 4 semanas para transformar mente e corpo
          </p>
        </div>

        <Card className="glass-card p-6 mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Progresso geral</h2>
            <Badge variant="default" className="bg-gradient-primary">
              Semana 1 - Em andamento
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted/30 rounded-full h-2">
              <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "25%" }}></div>
            </div>
            <span className="text-sm text-muted-foreground">25% completo</span>
          </div>
        </Card>

        <div className="space-y-6">
          {guidedJourney.map((week, index) => (
            <Card
              key={week.id}
              className={`glass-card p-6 cursor-pointer hover:shadow-elegant transition-all duration-300 animate-slide-up ${
                selectedWeek?.id === week.id ? "ring-2 ring-primary" : ""
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
                <Badge variant="secondary">{week.summary ? "Disponivel" : "Em preparo"}</Badge>
              </div>

              <p className="text-muted-foreground mb-4">{week.summary}</p>

              {selectedWeek?.id === week.id && (
                <div className="mt-6 pt-6 border-t border-border/50 animate-fade-in">
                  <h4 className="font-medium mb-4">Tarefas da semana</h4>
                  <div className="grid gap-3">
                    {week.daily_tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
                        <div className="flex-shrink-0 mt-1">
                          {taskIndex === 0 ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
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
                          <Badge variant="outline" className="text-xs">
                            {task.type === "action" ? "Acao" : task.type === "reflection" ? "Reflexao" : "Desafio"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {week.audio_guide && (
                    <div className="mt-6 pt-4 border-t border-border/50">
                      <Button className="w-full bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                        <Play className="w-4 h-4 mr-2" />
                        Ouvir audio motivacional
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
