import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import StressBar from "./StressBar";

interface ColapsoScreenProps {
  onContinue: () => void;
}

const ColapsoScreen: React.FC<ColapsoScreenProps> = ({ onContinue }) => {
  const [showSkip, setShowSkip] = useState(false);

  // Show skip button after 2 seconds
  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 2000);
    return () => clearTimeout(skipTimer);
  }, []);

  // Auto-continue after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950/20 via-background to-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* StressBar at top - fixed, pulsing at 150% */}
      <StressBar stressLevel={150} phase="colapso" visible={true} />
      {/* Dark pulsing overlay */}
      <motion.div
        className="absolute inset-0 bg-red-500/5"
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Glitch effect background */}
      <motion.div
        className="absolute inset-0 bg-dots opacity-30"
        animate={{ x: [0, 2, -2, 0], y: [0, -2, 2, 0] }}
        transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
      />

      <motion.div
        className="max-w-md w-full text-center space-y-6 sm:space-y-8 relative z-10 pt-16 sm:pt-20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Critical alert icon */}
        <motion.div
          className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Outer pulsing rings */}
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500/20 border-2 border-red-500/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500/30 border-2 border-red-500/50"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          />

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-red-500/20 border-4 border-red-500/60">
            <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            COLAPSO MENTAL
          </motion.h1>
        </motion.div>

        {/* Message */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg text-foreground font-medium">
            Sua mente ultrapassou o limite.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Este é o momento em que tudo desmorona. Seu corpo está em modo de
            sobrevivência. Você não aguenta mais.
          </p>
        </motion.div>

        {/* Warning box */}
        <motion.div
          className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-5 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-sm text-red-400 font-semibold">
            Consequências do colapso:
          </p>
          <ul className="text-xs text-muted-foreground space-y-2 text-left">
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              • Exaustão extrema e burnout
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
            >
              • Incapacidade de tomar decisões
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 }}
            >
              • Isolamento social e conflitos
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 }}
            >
              • Risco de problemas de saúde graves
            </motion.li>
          </ul>
        </motion.div>

        {/* Bottom text */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <p className="text-sm text-muted-foreground">
            Mas ainda há uma saída...
          </p>
          <motion.div
            className="flex justify-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-red-400"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>

          {/* Skip button - appears after 2s */}
          <AnimatePresence>
            {showSkip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={onContinue}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <span className="text-xs">Continuar</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ColapsoScreen;
