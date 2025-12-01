import React from "react";
import { motion, AnimatePresence } from "motion/react";

import { getStressStatus, type StressPhase } from "@/components/antigo/stress-status";

interface StressBarProps {
  stressLevel: number; // 0-150%
  phase: StressPhase;
  visible?: boolean;
  inline?: boolean; // When true, renders as inline element instead of fixed header
  label?: string; // Custom label override
  compact?: boolean; // Smaller version for side-by-side comparison
}

const StressBar: React.FC<StressBarProps> = ({
  stressLevel,
  phase,
  visible = true,
  inline = false,
  label: customLabel,
  compact = false,
}) => {
  const status = getStressStatus(stressLevel, phase);
  const Icon = status.icon;
  const displayLevel = Math.min(stressLevel, 150); // Cap at 150% for display
  const barWidth = Math.min(stressLevel, 100); // Cap bar at 100%

  // Compact inline version for side-by-side comparison
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {customLabel || "Nível de estresse"}
          </span>
          <span className={`text-lg font-bold ${status.textColor}`}>
            {displayLevel}%
          </span>
        </div>
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${status.color}`}
            initial={{ width: "0%" }}
            animate={{ width: `${barWidth}%` }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  }

  // Inline version (embedded in page, not fixed)
  if (inline) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            className="w-full bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-3">
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
                    {customLabel || "Nível de Estresse"}
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
                {stressLevel >= 100 && (
                  <motion.div
                    className="absolute inset-0 bg-red-500/30 rounded-full"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <motion.div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${status.color}`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Show emoji for mirror phase, icon for others
  const showEmoji = phase === "mirror";

  // Default fixed header version
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div className="max-w-md mx-auto px-3 sm:px-4 py-2 sm:py-3">
            {/* Status row - more compact on mobile */}
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <motion.div
                  className={`p-1 sm:p-1.5 rounded-lg ${status.bgColor} ${showEmoji ? "text-lg sm:text-xl" : ""}`}
                  animate={status.pulse ? { scale: [1, 1.1, 1] } : {}}
                  transition={
                    status.pulse
                      ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
                      : {}
                  }
                >
                  {showEmoji ? (
                    <span role="img" aria-label={status.label}>{status.emoji}</span>
                  ) : (
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${status.textColor}`} />
                  )}
                </motion.div>
                <span className="text-xs sm:text-sm font-medium text-foreground hidden xs:inline">
                  {customLabel || "Estresse"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <motion.span
                  className={`text-base sm:text-lg font-bold ${status.textColor}`}
                  key={stressLevel}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {Math.round(displayLevel)}%
                </motion.span>
                <span
                  className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${status.bgColor} ${status.textColor}`}
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
