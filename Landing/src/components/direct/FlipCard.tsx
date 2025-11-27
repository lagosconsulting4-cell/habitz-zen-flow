import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface FlipCardData {
  id: number;
  time: string;
  title: string;
  dor: {
    emoji: string;
    text: string;
    stress: string; // e.g., "+12%"
  };
  bora: {
    emoji: string;
    text: string;
    stress: string; // e.g., "-15%"
  };
}

interface FlipCardProps {
  data: FlipCardData;
  isFlipped: boolean;
  onFlip: () => void;
  autoFlip?: boolean;
  className?: string;
}

const FlipCard: React.FC<FlipCardProps> = ({
  data,
  isFlipped,
  onFlip,
  autoFlip = false,
  className,
}) => {
  const [localFlipped, setLocalFlipped] = useState(false);
  const shouldFlip = autoFlip ? localFlipped : isFlipped;

  const handleClick = () => {
    if (autoFlip) {
      setLocalFlipped(!localFlipped);
    }
    onFlip();
  };

  // Vibrate on flip (if supported)
  React.useEffect(() => {
    if (shouldFlip && typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }, [shouldFlip]);

  return (
    <div
      className={cn(
        "relative w-full max-w-[320px] h-[280px] cursor-pointer select-none",
        "[perspective:1000px]",
        className
      )}
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{ rotateY: shouldFlip ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* FRONT - DOR (Pain) */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-2xl",
            "[backface-visibility:hidden]",
            "bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent",
            "border-2 border-red-500/30",
            "shadow-lg",
            "overflow-hidden"
          )}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-dots opacity-20" />

          {/* Content */}
          <div className="relative h-full p-6 flex flex-col justify-between">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-semibold text-red-400">
                  {data.time}
                </span>
                <motion.span
                  className="text-xs font-bold px-2 py-1 rounded-full bg-red-500/20 text-red-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {data.dor.stress}
                </motion.span>
              </div>
              <h3 className="text-lg font-bold text-foreground">{data.title}</h3>
            </div>

            {/* Center - Emoji */}
            <div className="flex items-center justify-center">
              <motion.div
                className="text-6xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {data.dor.emoji}
              </motion.div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.dor.text}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-red-400/60">
                <span>Toque para ver a solução</span>
                <motion.span
                  animate={{ rotate: [0, 180] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                >
                  ↻
                </motion.span>
              </div>
            </div>
          </div>

          {/* DOR label */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
            <span className="text-xs font-bold text-red-400">DOR</span>
          </div>
        </div>

        {/* BACK - BORA (Solution) */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-2xl",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            "bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent",
            "border-2 border-green-500/30",
            "shadow-lg",
            "overflow-hidden"
          )}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-dots opacity-20" />

          {/* Content */}
          <div className="relative h-full p-6 flex flex-col justify-between">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-semibold text-green-400">
                  {data.time}
                </span>
                <motion.span
                  className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/20 text-green-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {data.bora.stress}
                </motion.span>
              </div>
              <h3 className="text-lg font-bold text-foreground">{data.title}</h3>
            </div>

            {/* Center - Emoji */}
            <div className="flex items-center justify-center">
              <motion.div
                className="text-6xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {data.bora.emoji}
              </motion.div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.bora.text}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-green-400/60">
                <span>Toque para voltar</span>
                <motion.span
                  animate={{ rotate: [0, -180] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                >
                  ↻
                </motion.span>
              </div>
            </div>
          </div>

          {/* BORA label */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
            <span className="text-xs font-bold text-green-400">BORA</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
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
