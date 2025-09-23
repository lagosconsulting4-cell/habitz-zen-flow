import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";
import { Lightbulb, Clock, TrendingUp, Lock, Crown, Utensils, Target } from "lucide-react";
import { routineTips } from "@/data/routine-tips";
import { nutritionTips } from "@/data/nutrition-tips";

const Tips = () => {
  const isPremium = false; // This would come from user subscription status
  const [activeTab, setActiveTab] = useState("rotina");

  const getTabIcon = (tab: string) => {
    switch(tab) {
      case "rotina": return <Target className="w-4 h-4" />;
      case "nutricao": return <Utensils className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const currentTips = activeTab === "rotina" ? routineTips : nutritionTips;
  const availableTips = currentTips.filter(tip => !tip.premium_only || isPremium);
  const lockedTips = currentTips.filter(tip => tip.premium_only && !isPremium);

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case "Alto": return "text-green-600 bg-green-50 border-green-200";
      case "Moderado": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Leve": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-muted-foreground bg-muted border-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-light mb-2">
            <span className="font-medium gradient-text">Dicas</span> Práticas
          </h1>
          <p className="text-muted-foreground font-light">
            Rotina e nutrição para desenvolvimento masculino
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 animate-slide-up">
          <Button
            variant={activeTab === "rotina" ? "default" : "outline"}
            onClick={() => setActiveTab("rotina")}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Rotina & Hábitos
          </Button>
          <Button
            variant={activeTab === "nutricao" ? "default" : "outline"}
            onClick={() => setActiveTab("nutricao")}
            className="flex items-center gap-2"
          >
            <Utensils className="w-4 h-4" />
            Nutrição
          </Button>
        </div>

        {/* Available Tips */}
        <div className="space-y-4 mb-8">
          {availableTips.map((tip, index) => (
            <Card 
              key={tip.id}
              className="glass-card p-6 hover:shadow-elegant transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getTabIcon(activeTab)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activeTab === "rotina" ? (tip as any).category : (tip as any).meal_time}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{tip.description}</p>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    {activeTab === "rotina" && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{(tip as any).time_suggestion}</span>
                      </div>
                    )}
                    
                    <Badge 
                      variant="outline" 
                      className={`text-xs border ${getImpactColor(tip.impact)}`}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Impacto {tip.impact}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Locked Premium Content */}
        {lockedTips.length > 0 && !isPremium && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Dicas Premium
            </h3>
            
            {lockedTips.slice(0, 3).map((tip, index) => (
              <Card 
                key={tip.id}
                className="glass-card p-6 opacity-60 animate-slide-up"
                style={{ animationDelay: `${(availableTips.length + index) * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg text-muted-foreground">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {activeTab === "rotina" ? (tip as any).category : (tip as any).meal_time}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{tip.description}</p>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        Premium
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs border ${getImpactColor(tip.impact)}`}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Impacto {tip.impact}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="glass-card p-6 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Crown className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Dicas Exclusivas Premium</h3>
                  <p className="text-muted-foreground font-light mb-4">
                    Acesse {lockedTips.length} dicas de alto impacto para rotina e nutrição avançada
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>Rotinas avançadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      <span>Nutrição estratégica</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Alto impacto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Otimização de tempo</span>
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
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default Tips;