import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { dailyQuotes } from "@/data/quotes";

const DailyQuote = () => {
  const [dailyQuote, setDailyQuote] = useState(dailyQuotes[0]);

  useEffect(() => {
    // Get a consistent quote based on the current date
    const today = new Date().toDateString();
    const quoteIndex = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % dailyQuotes.length;
    setDailyQuote(dailyQuotes[quoteIndex]);
  }, []);

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