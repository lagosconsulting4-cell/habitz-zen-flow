import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";
import { Lightbulb, Clock, TrendingUp, Utensils, Target } from "lucide-react";
import { routineTips, type RoutineTip } from "@/data/routine-tips";
import { nutritionTips, type NutritionTip } from "@/data/nutrition-tips";
import { useNavigate } from "react-router-dom";
import { isBonusEnabled } from "@/config/bonusFlags";

type TabKey = "rotina" | "nutricao";
type TipItem = RoutineTip | NutritionTip;

const isRoutineTip = (tip: TipItem): tip is RoutineTip => "time_suggestion" in tip;

const Tips = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("rotina");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isBonusEnabled("tips")) {
      navigate("/bonus", { replace: true });
    }
  }, [navigate]);

  const getTabIcon = (tab: TabKey) => {
    switch (tab) {
      case "rotina":
        return <Target className="w-4 h-4" />;
      case "nutricao":
        return <Utensils className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const tipsForTab: TipItem[] = activeTab === "rotina" ? routineTips : nutritionTips;

  const getSecondaryLabel = (tip: TipItem) =>
    isRoutineTip(tip) ? tip.category : tip.meal_time;

  const getImpactColor = (impact: TipItem["impact"]) => {
    switch (impact) {
      case "Alto":
        return "text-green-600 bg-green-50 border-green-200";
      case "Moderado":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Leve":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-muted-foreground bg-muted border-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-light mb-2">
            <span className="font-medium gradient-text">Dicas</span> praticas
          </h1>
          <p className="text-muted-foreground font-light">
            Rotina e nutricao para desenvolvimento masculino
          </p>
        </div>

        <div className="flex gap-2 mb-6 animate-slide-up">
          <Button
            variant={activeTab === "rotina" ? "default" : "outline"}
            onClick={() => setActiveTab("rotina")}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Rotina & Habitos
          </Button>
          <Button
            variant={activeTab === "nutricao" ? "default" : "outline"}
            onClick={() => setActiveTab("nutricao")}
            className="flex items-center gap-2"
          >
            <Utensils className="w-4 h-4" />
            Nutricao
          </Button>
        </div>

        <div className="space-y-4 mb-8">
          {tipsForTab.map((tip, index) => (
            <Card
              key={tip.id}
              className="glass-card p-6 hover:shadow-elegant transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getTabIcon(activeTab)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{getSecondaryLabel(tip)}</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{tip.description}</p>

              <div className="flex items-center gap-3 flex-wrap">
                {isRoutineTip(tip) && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{tip.time_suggestion}</span>
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
            </Card>
          ))}
        </div>
      </div>

      <NavigationBar />
    </div>
  );
};

export default Tips;
