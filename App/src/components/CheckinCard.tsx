import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCheckins, getMoodEmoji, getMoodLabel } from "@/hooks/useCheckins";
import { motion } from "motion/react";
import { Heart } from "lucide-react";

const CheckinCard = () => {
  const { hasCheckedInToday, createCheckin, isLoading } = useCheckins();

  // Se já fez check-in hoje, não mostra o card
  if (hasCheckedInToday()) {
    return null;
  }

  const handleMoodClick = (level: number) => {
    createCheckin.mutate(level);
  };

  return (
    <Card className="mb-8 animate-slide-up bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800/40">
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">
              Como você está hoje?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Um check-in rápido ajuda a acompanhar seu bem-estar emocional
            </p>
          </div>
        </div>

        {/* Emojis de humor */}
        <div className="flex flex-wrap gap-3 justify-center items-center py-4 sm:flex-nowrap">
          {[1, 2, 3, 4, 5].map((level) => (
            <motion.button
              key={level}
              onClick={() => handleMoodClick(level)}
              disabled={createCheckin.isPending || isLoading}
              className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group flex-1 min-w-[72px] max-w-[96px]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Registrar humor: ${getMoodLabel(level)}`}
            >
              <span className="text-4xl transition-transform group-hover:scale-110">
                {getMoodEmoji(level)}
              </span>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                {getMoodLabel(level)}
              </span>
            </motion.button>
          ))}
        </div>

        {createCheckin.isPending && (
          <div className="text-center text-sm text-muted-foreground mt-2">
            Registrando...
          </div>
        )}
      </div>
    </Card>
  );
};

export default CheckinCard;
