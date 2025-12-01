import React, { useEffect } from "react";
import { motion } from "motion/react";
import { Brain, BarChart3 } from "lucide-react";

interface QuizLoadingScreenProps {
  onComplete: () => void;
}

const QuizLoadingScreen: React.FC<QuizLoadingScreenProps> = ({ onComplete }) => {
  // Auto-complete after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        className="max-w-md w-full text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Brain Animation */}
        <motion.div
          className="relative mx-auto w-24 h-24"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Pulsing rings */}
          <motion.div
            className="absolute inset-0 rounded-full bg-orange-500/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-orange-500/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
          />

          {/* Brain icon container */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-orange-500/10 border-2 border-orange-500/30">
            <Brain className="w-12 h-12 text-orange-500" />
          </div>
        </motion.div>

        {/* Loading Text */}
        <div className="space-y-2">
          <motion.h2
            className="text-2xl font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Analisando seu perfil...
          </motion.h2>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Processando dados para um diagnóstico preciso
          </motion.p>
        </div>

        {/* Progress bar */}
        <motion.div
          className="relative h-2 bg-muted rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Statistics Card */}
        <motion.div
          className="bg-muted/30 rounded-2xl p-6 space-y-4 border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center justify-center gap-2 text-orange-400">
            <BarChart3 className="w-5 h-5" />
            <span className="font-semibold">Você sabia?</span>
          </div>

          <div className="space-y-3">
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
            >
              <span className="text-muted-foreground text-sm">Brasileiros com sobrecarga mental</span>
              <span className="text-2xl font-bold text-orange-400">80%</span>
            </motion.div>

            <motion.div
              className="h-3 bg-muted rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "80%" }}
                transition={{ delay: 1.6, duration: 1, ease: "easeOut" }}
              />
            </motion.div>

            <motion.p
              className="text-xs text-muted-foreground text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              Fonte: Pesquisa ISMA-BR, 2023
            </motion.p>
          </div>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          className="flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-orange-500"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuizLoadingScreen;
