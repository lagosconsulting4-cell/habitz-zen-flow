import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight, Lightbulb } from "lucide-react";
import { useTips } from "@/hooks/useSupabaseData";

const QuickTips = () => {
  const { tips, loading } = useTips();
  const [currentTip, setCurrentTip] = useState<any>(null);

  useEffect(() => {
    if (tips.length > 0 && !currentTip) {
      setCurrentTip(tips[0]);
    }
  }, [tips, currentTip]);

  useEffect(() => {
    if (tips.length === 0) return;
    
    // Rotate tips every 10 seconds
    const interval = setInterval(() => {
      setCurrentTip((prev: any) => {
        const currentIndex = tips.findIndex(tip => tip.id === prev?.id);
        const nextIndex = (currentIndex + 1) % tips.length;
        return tips[nextIndex];
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [tips]);

  if (loading || !currentTip) {
    return (
      <Card className="glass-card p-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-accent/10 rounded-lg flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 animate-pulse">
            <div className="h-4 bg-white/20 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-accent/10 rounded-lg flex-shrink-0">
          <span className="text-lg">{currentTip.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-foreground mb-2">{currentTip.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {currentTip.content}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );
};

export default QuickTips;