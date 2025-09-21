import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Heart, Brain, Utensils, Clock } from "lucide-react";

const tips = [
  {
    category: "Leitura",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    tip: "Leia por 20 minutos pela manhã para começar o dia com clareza mental.",
    tag: "Mente"
  },
  {
    category: "Meditação", 
    icon: Brain,
    color: "bg-purple-50 text-purple-600 border-purple-200",
    tip: "5 minutos de respiração profunda podem reduzir ansiedade e melhorar o foco.",
    tag: "Bem-estar"
  },
  {
    category: "Hábitos",
    icon: Clock,
    color: "bg-green-50 text-green-600 border-green-200", 
    tip: "Conecte novos hábitos a rotinas existentes para facilitar a adaptação.",
    tag: "Produtividade"
  },
  {
    category: "Alimentação",
    icon: Utensils,
    color: "bg-orange-50 text-orange-600 border-orange-200",
    tip: "Beba um copo d'água ao acordar para ativar o metabolismo.",
    tag: "Saúde"
  },
  {
    category: "Exercício",
    icon: Heart,
    color: "bg-red-50 text-red-600 border-red-200",
    tip: "10 minutos de movimento já fazem diferença no seu humor e energia.",
    tag: "Corpo"
  }
];

const QuickTips = () => {
  // Show a random tip each time
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  const Icon = randomTip.icon;

  return (
    <Card className="glass-card p-6 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${randomTip.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-foreground">{randomTip.category}</h3>
            <Badge variant="outline" className="text-xs">
              {randomTip.tag}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {randomTip.tip}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default QuickTips;