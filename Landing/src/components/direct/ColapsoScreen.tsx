import React from "react";
import { motion } from "motion/react";
import { AlertTriangle, Zap } from "lucide-react";

interface ColapsoScreenProps {
  onContinue: () => void;
}

const ColapsoScreen: React.FC<ColapsoScreenProps> = ({ onContinue }) => {
  // Auto-continue after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950/20 via-background to-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
        className="max-w-md w-full text-center space-y-8 relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Critical alert icon */}
        <motion.div
          className="relative mx-auto w-32 h-32"
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
            <AlertTriangle className="w-16 h-16 text-red-400" />
          </div>
        </motion.div>

        {/* Stress level indicator */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border-2 border-red-500/40"
            animate={{ borderColor: ["rgba(239, 68, 68, 0.4)", "rgba(239, 68, 68, 0.8)", "rgba(239, 68, 68, 0.4)"] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Zap className="w-4 h-4 text-red-400" />
            <span className="font-bold text-sm text-red-400">NÍVEL CRÍTICO: 150%</span>
          </motion.div>

          <motion.h1
            className="text-3xl md:text-4xl font-bold text-red-400"
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
          className="space-y-2"
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
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ColapsoScreen;
