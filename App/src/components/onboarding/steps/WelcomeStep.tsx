import { motion } from "motion/react";
import { Sparkles, Target, Zap } from "lucide-react";
import { hideGamification } from "@/config/featureFlags";

export const WelcomeStep = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-6 text-center">
      {/* Hero Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="mb-8"
      >
        <div className="relative">
          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Icon Container */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <Sparkles size={48} strokeWidth={2} className="text-primary-foreground" />
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
      >
        Bem-vindo ao Habitz
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg text-muted-foreground max-w-md mb-12"
      >
        Vamos criar uma rotina personalizada que funciona para você
      </motion.p>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl w-full">
        {/* Feature 1 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold text-base mb-2">Personalizado</h3>
          <p className="text-sm text-muted-foreground">
            Rotina adaptada aos seus objetivos e horários
          </p>
        </motion.div>

        {/* Feature 2 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold text-base mb-2">Rápido</h3>
          <p className="text-sm text-muted-foreground">
            Menos de 2 minutos para começar
          </p>
        </motion.div>

        {/* Feature 3 */}
        {!hideGamification && (
          <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold text-base mb-2">Gamificado</h3>
          <p className="text-sm text-muted-foreground">
            Ganhe XP e desbloqueie recompensas
          </p>
          </motion.div>
        )}
      </div>

      {/* Call to Action Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-sm text-muted-foreground mt-12"
      >
        Clique em <span className="font-bold text-primary">Continuar</span> para começar
      </motion.p>
    </div>
  );
};
