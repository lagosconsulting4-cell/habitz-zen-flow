import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Target, CheckCircle, AlertCircle, Sparkles, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoadingPhase {
  label: string;
  icon: typeof Target;
  duration: number;
  color: string;
}

const LOADING_PHASES: LoadingPhase[] = [
  {
    label: "Analisando suas metas...",
    icon: Target,
    duration: 1000,
    color: "text-blue-600"
  },
  {
    label: "Aplicando ciência de hábitos...",
    icon: Brain,
    duration: 1200,
    color: "text-purple-600"
  },
  {
    label: "Mapeando objetivos...",
    icon: CheckCircle,
    duration: 1000,
    color: "text-lime-600"
  },
  {
    label: "Ajustando dificuldades...",
    icon: AlertCircle,
    duration: 1000,
    color: "text-orange-600"
  },
  {
    label: "Finalizando seu plano...",
    icon: Sparkles,
    duration: 1000,
    color: "text-purple-600"
  }
];

interface LoadingStepProps {
  onComplete?: () => void;
}

export const LoadingStep: React.FC<LoadingStepProps> = ({ onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = LOADING_PHASES.reduce((sum, phase) => sum + phase.duration, 0);
    let elapsed = 0;

    // Progress animation
    const progressInterval = setInterval(() => {
      elapsed += 50;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= totalDuration) {
        clearInterval(progressInterval);
        if (onComplete) {
          setTimeout(onComplete, 300);
        }
      }
    }, 50);

    // Phase transitions
    let phaseElapsed = 0;
    const phaseInterval = setInterval(() => {
      phaseElapsed += LOADING_PHASES[currentPhase]?.duration || 1000;

      if (currentPhase < LOADING_PHASES.length - 1) {
        setCurrentPhase(prev => prev + 1);
      } else {
        clearInterval(phaseInterval);
      }
    }, LOADING_PHASES[currentPhase]?.duration || 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phaseInterval);
    };
  }, [currentPhase, onComplete]);

  const CurrentIcon = LOADING_PHASES[currentPhase]?.icon || Target;
  const currentColor = LOADING_PHASES[currentPhase]?.color || "text-blue-600";

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-8"
      >
        <div className="relative">
          {/* Spinning ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-24 h-24"
          >
            <div className="w-full h-full rounded-full border-4 border-t-lime-500 border-r-transparent border-b-transparent border-l-transparent" />
          </motion.div>

          {/* Center icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-lime-50 to-lime-100 rounded-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentIcon className={`w-12 h-12 ${currentColor}`} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Phase Label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {LOADING_PHASES[currentPhase]?.label}
          </h2>
          <p className="text-sm text-slate-400">
            Estamos criando seu plano personalizado
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="w-full max-w-md px-4">
        <Progress value={progress} className="h-3 mb-2" />
        <p className="text-center text-xs text-slate-400">
          {Math.round(progress)}% concluído
        </p>
      </div>

      {/* Phase Indicators */}
      <div className="flex gap-2 mt-6">
        {LOADING_PHASES.map((phase, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index <= currentPhase
                ? "bg-lime-500 scale-125"
                : "bg-slate-300"
              }`}
          />
        ))}
      </div>

      {/* Motivational Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center px-4"
      >
        <p className="text-sm text-slate-400 max-w-md">
          Criando uma rotina que funciona com o jeito que seu cérebro aprende — pequena, repetida, e fácil de virar automática.
        </p>
      </motion.div>
    </div>
  );
};
