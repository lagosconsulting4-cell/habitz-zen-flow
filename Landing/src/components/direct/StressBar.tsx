import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Zap, Heart } from "lucide-react";

interface StressBarProps {
  stressLevel: number; // 0-150%
  phase: "dor" | "colapso" | "transicao" | "bora";
  visible?: boolean;
}

// Get status based on stress level
const getStatus = (level: number, phase: string) => {
  if (phase === "colapso" || level >= 100) {
    return {
      label: "COLAPSO",
      color: "from-red-600 to-red-500",
      bgColor: "bg-red-500/20",
      textColor: "text-red-400",
      icon: AlertTriangle,
      pulse: true,
    };
  }
  if (phase === "bora" || level <= 30) {
    return {
      label: "EM PAZ",
      color: "from-green-500 to-emerald-400",
      bgColor: "bg-green-500/20",
      textColor: "text-green-400",
      icon: Heart,
      pulse: false,
    };
  }
  if (level >= 70) {
    return {
      label: "URGENTE",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/20",
      textColor: "text-red-400",
      icon: AlertTriangle,
      pulse: true,
    };
  }
  if (level >= 40) {
    return {
      label: "ALERTA",
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-500/20",
      textColor: "text-orange-400",
      icon: Zap,
      pulse: false,
    };
  }
  return {
    label: "MODERADO",
    color: "from-yellow-500 to-green-400",
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-400",
    icon: Zap,
    pulse: false,
  };
};

const StressBar: React.FC<StressBarProps> = ({
  stressLevel,
  phase,
  visible = true,
}) => {
  const status = getStatus(stressLevel, phase);
  const Icon = status.icon;
  const displayLevel = Math.min(stressLevel, 150); // Cap at 150% for display
  const barWidth = Math.min(stressLevel, 100); // Cap bar at 100%

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="max-w-md mx-auto px-4 py-3">
            {/* Status row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.div
                  className={`p-1.5 rounded-lg ${status.bgColor}`}
                  animate={status.pulse ? { scale: [1, 1.1, 1] } : {}}
                  transition={
                    status.pulse
                      ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
                      : {}
                  }
                >
                  <Icon className={`w-4 h-4 ${status.textColor}`} />
                </motion.div>
                <span className="text-sm font-medium text-foreground">
                  Nível de Estresse
                </span>
              </div>

              <div className="flex items-center gap-2">
                <motion.span
                  className={`text-lg font-bold ${status.textColor}`}
                  key={stressLevel}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {displayLevel}%
                </motion.span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.bgColor} ${status.textColor}`}
                >
                  {status.label}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
              {/* Background pulse for critical levels */}
              {stressLevel >= 100 && (
                <motion.div
                  className="absolute inset-0 bg-red-500/30 rounded-full"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Progress fill */}
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${status.color}`}
                initial={{ width: "0%" }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />

              {/* Overflow indicator for >100% */}
              {stressLevel > 100 && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 4px,
                      rgba(239, 68, 68, 0.3) 4px,
                      rgba(239, 68, 68, 0.3) 8px
                    )`,
                  }}
                  animate={{ x: [0, 8] }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>

            {/* Warning message for critical levels */}
            {stressLevel >= 100 && (
              <motion.p
                className="text-xs text-red-400 mt-2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                ⚠️ Nível crítico - Sua mente está em colapso!
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StressBar;
