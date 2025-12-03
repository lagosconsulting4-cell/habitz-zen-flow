import { motion } from "motion/react";
import { useOnboarding } from "./OnboardingProvider";

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

      {/* Step Counter - Compact */}
      <div className="flex justify-start items-center mt-1.5">
        <motion.p
          className="text-xs font-medium text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {currentStep + 1}/{totalSteps}
        </motion.p>
      </div>
    </div>
  );
};
