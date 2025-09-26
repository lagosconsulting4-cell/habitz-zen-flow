import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";
import { Brain, Clock, Volume2, Play } from "lucide-react";
import { meditationTips } from "@/data/meditation";

const categories = ["Todos", "Respiracao", "Visualizacao", "Silencio", "Reset", "Preparacao", "Mindfulness", "Sono"];

const Meditation = () => {
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredTips = selectedCategory === "Todos"
    ? meditationTips
    : meditationTips.filter((tip) => tip.category === selectedCategory);

  const toggleTip = (tipId: number) => {
    setSelectedTip((prev) => (prev === tipId ? null : tipId));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-light mb-2">
            <span className="font-medium gradient-text">Meditacao</span> & Respiracao
          </h1>
          <p className="text-muted-foreground font-light">
            Tecnicas praticas para controle mental e foco
          </p>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-6 animate-slide-up">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredTips.map((tip, index) => (
            <Card
              key={tip.id}
              className={`glass-card p-6 hover:shadow-elegant transition-all duration-300 animate-slide-up ${
                selectedTip === tip.id ? "ring-2 ring-primary" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => toggleTip(tip.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground">{tip.focus}</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">{tip.description}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{tip.duration}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {tip.category}
                    </Badge>
                  </div>
                </div>

                <Button size="icon" variant="ghost">
                  <Play className="w-4 h-4" />
                </Button>
              </div>

              {selectedTip === tip.id && (
                <div className="mt-6 pt-6 border-top border-border/50 animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Passos:</h4>
                      <ol className="space-y-2">
                        {tip.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                              {stepIndex + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Sons ambiente
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tip.sounds.map((sound, soundIndex) => (
                          <Badge key={soundIndex} variant="secondary" className="text-xs">
                            {sound}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full mt-4 bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar sessao
                      </Button>
                    </div>
                  </div>
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

export default Meditation;
