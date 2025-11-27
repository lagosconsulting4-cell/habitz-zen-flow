import React, { useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw } from "lucide-react";

// Content structure for the card
export interface CardContent {
  time: string;
  title: string;
  emoji: string;
  description: string;
  stressChange: string;
}

// Original data structure (kept for compatibility)
export interface FlipCardData {
  id: number;
  time: string;
  title: string;
  dor: {
    emoji: string;
    text: string;
    stress: string;
  };
  bora: {
    emoji: string;
    text: string;
    stress: string;
  };
}

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
            "shadow-lg overflow-hidden"
          )}
          onClick={!isFlipped ? onFlip : undefined}
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
              <motion.div
                className="text-5xl sm:text-6xl"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {content.emoji}
              </motion.div>
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
            "shadow-lg overflow-hidden"
          )}
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

            {/* Action Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className={`w-full min-h-[48px] ${colors.button} text-white font-semibold`}
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

            {/* Tap to flip back hint */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFlip();
              }}
              className={`mt-3 flex items-center justify-center gap-2 ${colors.hint} text-xs hover:opacity-80 transition-opacity`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Voltar para capa</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper function to get content from card data based on phase
export const getCardContent = (card: FlipCardData, phase: "dor" | "bora"): CardContent => {
  const data = phase === "dor" ? card.dor : card.bora;
  return {
    time: card.time,
    title: card.title,
    emoji: data.emoji,
    description: data.text,
    stressChange: data.stress,
  };
};

// Export the 8 moments data
export const flipCardsData: FlipCardData[] = [
  {
    id: 1,
    time: "06:00",
    title: "Acordar",
    dor: {
      emoji: "😫",
      text: "Alarme toca. Você já está exausto antes de levantar.",
      stress: "+12%",
    },
    bora: {
      emoji: "🌅",
      text: "Respira fundo. Luz natural. Corpo desperta com calma.",
      stress: "-15%",
    },
  },
  {
    id: 2,
    time: "08:00",
    title: "Começar o Dia",
    dor: {
      emoji: "🤯",
      text: "Trânsito, notificações, já atrasado. Caos mental.",
      stress: "+18%",
    },
    bora: {
      emoji: "☕",
      text: "Ritual matinal. Café com calma. Foco na primeira tarefa.",
      stress: "-10%",
    },
  },
  {
    id: 3,
    time: "12:00",
    title: "Meio do Dia",
    dor: {
      emoji: "😵‍💫",
      text: "Reuniões sem parar. Almoço correndo. Cansaço batendo.",
      stress: "+22%",
    },
    bora: {
      emoji: "🍃",
      text: "Pausa consciente. Refeição tranquila. Energia renovada.",
      stress: "-12%",
    },
  },
  {
    id: 4,
    time: "15:00",
    title: "Tarde",
    dor: {
      emoji: "😩",
      text: "Procrastinação. Tarefas acumulando. Culpa crescendo.",
      stress: "+25%",
    },
    bora: {
      emoji: "🎯",
      text: "Foco no essencial. Progresso visível. Sensação de controle.",
      stress: "-18%",
    },
  },
  {
    id: 5,
    time: "18:00",
    title: "Fim do Expediente",
    dor: {
      emoji: "😓",
      text: "Sentimento de fracasso. Nada foi concluído. Leva trabalho pra casa.",
      stress: "+20%",
    },
    bora: {
      emoji: "✨",
      text: "Dia produtivo. Tarefas concluídas. Desconexão tranquila.",
      stress: "-14%",
    },
  },
  {
    id: 6,
    time: "20:00",
    title: "Noite",
    dor: {
      emoji: "📱",
      text: "Scroll infinito. Tempo passa. Vazio aumenta.",
      stress: "+15%",
    },
    bora: {
      emoji: "🌙",
      text: "Tempo de qualidade. Conexões reais. Presença plena.",
      stress: "-16%",
    },
  },
  {
    id: 7,
    time: "22:00",
    title: "Antes de Dormir",
    dor: {
      emoji: "😰",
      text: "Mente acelerada. Preocupações girando. Insônia chegando.",
      stress: "+28%",
    },
    bora: {
      emoji: "🛌",
      text: "Ritual de sono. Mente tranquila. Corpo relaxado.",
      stress: "-20%",
    },
  },
  {
    id: 8,
    time: "00:00",
    title: "Madrugada",
    dor: {
      emoji: "😱",
      text: "Acordado. Ansiedade. Amanhã será pior ainda.",
      stress: "+30%",
    },
    bora: {
      emoji: "💤",
      text: "Sono profundo. Recuperação total. Energia renovada.",
      stress: "-25%",
    },
  },
];

export default FlipCard;
