import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export const WelcomeStep = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6 text-center">
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
        className="text-3xl font-bold mb-4"
      >
        Bem-vindo ao Bora
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg text-muted-foreground max-w-md"
      >
        Vamos criar uma rotina personalizada que funciona para você
      </motion.p>
    </div>
  );
};
