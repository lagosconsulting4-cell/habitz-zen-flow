import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const quotes = [
  {
    text: "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    author: "Robert Collier"
  },
  {
    text: "Você não precisa ser perfeito. Você só precisa ser consistente.",
    author: "Habitz"
  },
  {
    text: "A disciplina é a ponte entre metas e realizações.",
    author: "Jim Rohn"
  },
  {
    text: "Pequenos progressos diários levam a grandes resultados.",
    author: "Satya Nani"
  },
  {
    text: "O que fazemos hoje constrói o que seremos amanhã.",
    author: "Habitz"
  },
  {
    text: "Consistência é mais importante que perfeição.",
    author: "Habitz"
  },
  {
    text: "Cada dia é uma nova oportunidade de evoluir.",
    author: "Habitz"
  }
];

const DailyQuote = () => {
  const [dailyQuote, setDailyQuote] = useState(quotes[0]);

  useEffect(() => {
    // Get a consistent quote based on the current date
    const today = new Date().toDateString();
    const quoteIndex = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % quotes.length;
    setDailyQuote(quotes[quoteIndex]);
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