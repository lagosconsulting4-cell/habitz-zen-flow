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
    <Card className="mb-8 animate-slide-up bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              Como você está hoje?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
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
              className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group flex-1 min-w-[72px] max-w-[96px]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Registrar humor: ${getMoodLabel(level)}`}
            >
              <span className="text-4xl transition-transform group-hover:scale-110">
                {getMoodEmoji(level)}
              </span>
              <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
                {getMoodLabel(level)}
              </span>
            </motion.button>
          ))}
        </div>

        {createCheckin.isPending && (
          <div className="text-center text-sm text-gray-500 mt-2">
            Registrando...
          </div>
        )}
      </div>
    </Card>
  );
};

export default CheckinCard;
