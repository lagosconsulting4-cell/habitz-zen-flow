import React, { useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { CardContent } from "@/components/direct/flip-card-data";

interface FlipCardProps {
  content: CardContent;
  phase: "dor" | "bora";
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  isLastCard?: boolean;
  className?: string;
}

const FlipCard: React.FC<FlipCardProps> = ({
  content,
  phase,
  isFlipped,
  onFlip,
  onNext,
  isLastCard = false,
  className,
}) => {
  const isDor = phase === "dor";

  // Haptic feedback on flip
  useEffect(() => {
    if (isFlipped && typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }, [isFlipped]);

  // Color scheme based on phase
  const colors = isDor
    ? {
        gradient: "from-red-500/10 via-orange-500/5 to-transparent",
        border: "border-red-500/30",
        text: "text-red-400",
        badge: "bg-red-500/20 text-red-400 border-red-500/30",
        button: "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600",
        hint: "text-red-400/60",
      }
    : {
        gradient: "from-green-500/10 via-emerald-500/5 to-transparent",
        border: "border-green-500/30",
        text: "text-green-400",
        badge: "bg-green-500/20 text-green-400 border-green-500/30",
        button: "bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500",
        hint: "text-green-400/60",
      };

  return (
    <div
      className={cn(
        // Responsive sizing - mobile first
        "relative w-full max-w-[90vw] sm:max-w-[320px]",
        "h-[280px] sm:h-[300px]",
        "cursor-pointer select-none",
        "[perspective:1000px]",
        className
      )}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* FRONT - CAPA (Preview) */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-2xl",
            "[backface-visibility:hidden]",
            `bg-gradient-to-br ${colors.gradient}`,
            `border-2 ${colors.border}`,
            "shadow-lg overflow-hidden transition-opacity duration-300",
            isFlipped && "opacity-0"
          )}
          onClick={!isFlipped ? onFlip : undefined}
          aria-hidden={isFlipped}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-dots opacity-20" />

          {/* Content */}
          <div className="relative h-full p-4 sm:p-6 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className={`text-base sm:text-lg font-mono font-bold ${colors.text}`}>
                {content.time}
              </span>
              <div className={`px-2 sm:px-3 py-1 rounded-full border ${colors.badge}`}>
                <span className="text-xs font-bold uppercase">
                  {isDor ? "DOR" : "BORA"}
                </span>
              </div>
            </div>

            {/* Center - Emoji + Title */}
            <div className="flex flex-col items-center justify-center flex-1 space-y-3">
              {content.image ? (
                <motion.div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-background/40 border border-white/10 overflow-hidden shadow-inner"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src={content.image}
                    alt={content.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </motion.div>
              ) : (
                <motion.div
                  className="text-5xl sm:text-6xl"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {content.emoji}
                </motion.div>
              )}
              <h3 className="text-xl sm:text-2xl font-bold text-foreground text-center">
                {content.title}
              </h3>
            </div>

            {/* CTA Hint */}
            <div className="flex items-center justify-center gap-2">
              <motion.div
                className={`flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 ${colors.hint}`}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">Toque para detalhes</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* BACK - DETALHAMENTO */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-2xl",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            `bg-gradient-to-br ${colors.gradient}`,
            `border-2 ${colors.border}`,
            "shadow-lg overflow-hidden transition-opacity duration-300",
            !isFlipped && "opacity-0"
          )}
          aria-hidden={!isFlipped}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-dots opacity-20" />

          {/* Content */}
          <div className="relative h-full p-4 sm:p-6 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className={`text-base sm:text-lg font-mono font-bold ${colors.text}`}>
                {content.time}
              </span>
              <motion.div
                className={`px-3 py-1 rounded-full ${colors.badge}`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-sm sm:text-base font-bold">
                  {content.stressChange}
                </span>
              </motion.div>
            </div>

            {/* Title */}
            <h3 className={`text-lg sm:text-xl font-bold ${colors.text} text-center mt-2`}>
              {content.title}
            </h3>

            {/* Description */}
            <div className="flex-1 flex items-center justify-center py-4">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center max-w-[280px]">
                {content.description}
              </p>
            </div>

            {/* Action Button - High visibility with stronger shadow */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className={`w-full min-h-[52px] ${colors.button} text-white font-bold text-base shadow-lg ${isDor ? "shadow-red-500/30" : "shadow-green-500/30"}`}
            >
              <span>
                {isLastCard
                  ? isDor
                    ? "Ver o Colapso"
                    : "Comparar Caminhos"
                  : "Próximo Momento"}
              </span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
