import { useEffect, useState } from "react";
import { motion } from "motion/react";
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
        return "bg-primary text-primary-foreground border-primary";
      case "Moderado":
        return "bg-primary/30 text-primary border-primary/30";
      case "Leve":
        return "bg-primary/10 text-primary border-primary/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-6 max-w-4xl"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground flex items-center gap-3 mb-2">
            <Lightbulb className="w-8 h-8 text-primary" />
            Dicas Práticas
          </h1>
          <p className="text-muted-foreground">
            Rotina e nutrição para desenvolvimento masculino
          </p>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          <button
            onClick={() => setActiveTab("rotina")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "rotina"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary border border-border text-foreground hover:bg-muted"
            }`}
          >
            <Target className="w-4 h-4" />
            Rotina & Hábitos
          </button>
          <button
            onClick={() => setActiveTab("nutricao")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "nutricao"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary border border-border text-foreground hover:bg-muted"
            }`}
          >
            <Utensils className="w-4 h-4" />
            Nutrição
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {tipsForTab.map((tip, index) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="rounded-2xl bg-card border border-border p-6 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getTabIcon(activeTab)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{tip.title}</h3>
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

                  <Badge className={`text-xs font-semibold ${getImpactColor(tip.impact)}`}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Impacto {tip.impact}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <NavigationBar />
    </div>
  );
};

export default Tips;
