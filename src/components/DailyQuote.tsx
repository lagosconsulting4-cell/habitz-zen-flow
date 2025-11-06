import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useQuotes } from "@/hooks/useSupabaseData";

const DailyQuote = () => {
  const { getDailyQuote, loading } = useQuotes();
  const dailyQuote = getDailyQuote();

  if (loading || !dailyQuote) {
    return (
      <Card className="glass-card p-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <Quote className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="animate-pulse">
              <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
          <Quote className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <blockquote className="text-foreground font-medium italic leading-relaxed">
            "{dailyQuote.text}"
          </blockquote>
          <cite className="text-muted-foreground text-sm mt-2 block">
            — {dailyQuote.author}
          </cite>
        </div>
      </div>
    </Card>
  );
};

export default DailyQuote;