import { motion } from "motion/react";
import { useOnboarding } from "./OnboardingProvider";
import { cn } from "@/lib/utils";

export const OnboardingProgress = () => {
  const { currentStep, totalSteps } = useOnboarding();

  // Calculate progress percentage (0-100%)
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar Container */}
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        {/* Animated Progress Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
          }}
        />

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Counter */}
      <div className="flex justify-between items-center mt-3">
        <motion.p
          className="text-xs font-medium text-muted-foreground"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Passo {currentStep + 1} de {totalSteps}
        </motion.p>

        <motion.p
          className="text-xs font-bold text-primary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {Math.round(progress)}%
        </motion.p>
      </div>

      {/* Step Dots */}
      <div className="flex gap-1.5 mt-4 justify-center">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index <= currentStep ? "bg-primary w-8" : "bg-muted w-1.5"
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.03 }}
          />
        ))}
      </div>
    </div>
  );
};
