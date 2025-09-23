import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";
import { Brain, Clock, Volume2, Lock, Play } from "lucide-react";
import { meditationTips } from "@/data/meditation";

const Meditation = () => {
  const [selectedTip, setSelectedTip] = useState(null);
  const isPremium = false; // This would come from user subscription status

  const categories = ["Todos", "Respiração", "Visualização", "Silêncio", "Reset", "Preparação", "Mindfulness", "Sono"];
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredTips = selectedCategory === "Todos" 
    ? meditationTips 
    : meditationTips.filter(tip => tip.category === selectedCategory);

  const availableTips = filteredTips.filter(tip => !tip.premium_only || isPremium);
  const lockedTips = filteredTips.filter(tip => tip.premium_only && !isPremium);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-light mb-2">
            <span className="font-medium gradient-text">Meditação</span> & Respiração
          </h1>
          <p className="text-muted-foreground font-light">
            Técnicas práticas para controle mental e foco
          </p>
        </div>

        {/* Categories */}
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

        {/* Available Techniques */}
        <div className="space-y-4 mb-8">
          {availableTips.map((tip, index) => (
            <Card 
              key={tip.id} 
              className={`glass-card p-6 cursor-pointer hover:shadow-elegant transition-all duration-300 animate-slide-up ${
                selectedTip?.id === tip.id ? 'ring-2 ring-primary' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedTip(selectedTip?.id === tip.id ? null : tip)}
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

              {selectedTip?.id === tip.id && (
                <div className="mt-6 pt-6 border-t border-border/50 animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Passos:</h4>
                      <ol className="space-y-2">
                        {tip.steps.map((step, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Sons Ambiente:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tip.sounds.map((sound, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {sound}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button className="w-full mt-4 bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar Sessão
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Locked Premium Content */}
        {lockedTips.length > 0 && !isPremium && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Técnicas Premium
            </h3>
            
            {lockedTips.map((tip, index) => (
              <Card 
                key={tip.id}
                className="glass-card p-6 opacity-60 animate-slide-up"
                style={{ animationDelay: `${(availableTips.length + index) * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-muted-foreground">{tip.title}</h3>
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
                        Premium
                      </Badge>
                    </div>
                  </div>
                  
                  <Button size="icon" variant="ghost" disabled>
                    <Lock className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}

            <Card className="glass-card p-6 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
              <div className="text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full mx-auto w-fit">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Desbloqueie Meditações Avançadas</h3>
                  <p className="text-muted-foreground font-light mb-4">
                    Acesse técnicas exclusivas, visualizações guiadas e áudios premium
                  </p>
                </div>

                <Button className="w-full bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                  <Lock className="w-4 h-4 mr-2" />
                  Upgrade para Premium
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  R$ 247/ano • Cancele quando quiser
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default Meditation;