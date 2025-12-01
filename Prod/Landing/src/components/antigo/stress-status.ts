import { AlertTriangle, Heart, Zap } from "lucide-react";

export type StressPhase = "dor" | "colapso" | "transicao" | "bora" | "comparison" | "mirror";

type StatusIcon = typeof AlertTriangle;

export interface StressStatus {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor?: string;
  textColor: string;
  icon: StatusIcon;
  pulse: boolean;
}

const EMOJI_COLLAPSE = "\u{1F631}"; // 😱
const EMOJI_ALERT = "\u26A0\uFE0F"; // ⚠️
const EMOJI_CALM = "\u{1F60C}"; // 😌
const EMOJI_FOCUS = "\u{1F4AA}"; // 💪

const getMirrorStatus = (level: number): StressStatus => {
  if (level >= 100) {
    return {
      label: "COLAPSO!",
      emoji: EMOJI_COLLAPSE,
      color: "from-red-600 to-red-500",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/40",
      textColor: "text-red-400",
      icon: AlertTriangle,
      pulse: true,
    };
  }
  if (level > 80) {
    return {
      label: "Critico",
      emoji: EMOJI_COLLAPSE,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/40",
      textColor: "text-red-400",
      icon: AlertTriangle,
      pulse: true,
    };
  }
  if (level > 40) {
    return {
      label: "Atencao",
      emoji: EMOJI_ALERT,
      color: "from-amber-500 to-yellow-500",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-500/40",
      textColor: "text-amber-400",
      icon: Zap,
      pulse: false,
    };
  }
  return {
    label: "Sob Controle",
    emoji: EMOJI_CALM,
    color: "from-emerald-500 to-green-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/40",
    textColor: "text-emerald-400",
    icon: Heart,
    pulse: false,
  };
};

export const getStressStatus = (level: number, phase: StressPhase): StressStatus => {
  if (phase === "mirror") {
    return getMirrorStatus(level);
  }

  // COLAPSO only for colapso phase or dor phase with level >= 100
  if (phase === "colapso" || (phase !== "bora" && level >= 100)) {
    return {
      label: "COLAPSO",
      emoji: EMOJI_COLLAPSE,
      color: "from-red-600 to-red-500",
      bgColor: "bg-red-500/20",
      textColor: "text-red-400",
      icon: AlertTriangle,
      pulse: true,
    };
  }

  // For both phases, use level-based thresholds
  // This ensures yellow/amber intermediate state is shown during stress reduction
  if (level >= 70) {
    return {
      label: phase === "bora" ? "ALTO" : "URGENTE",
      emoji: EMOJI_COLLAPSE,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/40",
      textColor: "text-red-400",
      icon: AlertTriangle,
      pulse: true,
    };
  }
  if (level >= 40) {
    return {
      label: phase === "bora" ? "MODERADO" : "ALERTA",
      emoji: EMOJI_ALERT,
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500/40",
      textColor: "text-orange-400",
      icon: Zap,
      pulse: false,
    };
  }

  // Low stress - green for both phases
  return {
    label: "EM PAZ",
    emoji: EMOJI_CALM,
    color: "from-green-500 to-emerald-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-emerald-500/40",
    textColor: "text-green-400",
    icon: Heart,
    pulse: false,
  };
};
