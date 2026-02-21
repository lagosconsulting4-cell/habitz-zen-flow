import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useQuiz } from "../QuizProvider";
import { Star, Check } from "lucide-react";

const LOADING_STEPS = [
  { label: "Definindo metas", duration: 2000 },
  { label: "Selecionando estratégias", duration: 2500 },
  { label: "Salvando seu plano", duration: 2000 },
];

const TESTIMONIALS = [
  {
    text: "O Bora me ajudou a criar uma rotina que finalmente funciona! Antes eu tentava de tudo e desistia em 3 dias. Agora já são 2 meses mantendo meus hábitos 🚀",
    author: "Camila R.",
  },
  {
    text: "Finalmente um app que entende que eu não tenho tempo pra planos complicados. O Bora se adapta à minha rotina, não o contrário.",
    author: "Rafael M.",
  },
  {
    text: "Eu tinha ansiedade só de pensar no tanto de coisa que precisava fazer. O Bora me deu um plano claro e agora sei exatamente o que fazer a cada momento.",
    author: "Ana Paula S.",
  },
  {
    text: "Melhor investimento que já fiz em mim. Em 45 dias consegui resultados que tentei por anos. O método realmente funciona!",
    author: "Lucas F.",
  },
];

export const LoadingPlanStep = () => {
  const { nextStep } = useQuiz();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState<number[]>([0, 0, 0]);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    let currentIndex = 0;
    let currentProgress = 0;

    const interval = setInterval(() => {
      if (currentIndex >= LOADING_STEPS.length) {
        // All steps complete - move to next
        clearInterval(interval);
        setTimeout(() => nextStep(), 800);
        return;
      }

      const step = LOADING_STEPS[currentIndex];
      const increment = (100 / step.duration) * 50; // Update every 50ms
      currentProgress += increment;

      if (currentProgress >= 100) {
        // This step is done, move to next
        setProgress(prev => {
          const newProgress = [...prev];
          newProgress[currentIndex] = 100;
          return newProgress;
        });
        currentIndex++;
        setCurrentStepIndex(currentIndex);
        currentProgress = 0;
      } else {
        // Update current step progress
        setProgress(prev => {
          const newProgress = [...prev];
          newProgress[currentIndex] = Math.min(Math.round(currentProgress), 100);
          return newProgress;
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [nextStep]);

  // Rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex(prev => (prev + 1) % TESTIMONIALS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Criando seu <br />
          <span className="text-lime-400">Plano Personalizado</span>
        </h2>
      </motion.div>

      {/* Loading Steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {LOADING_STEPS.map((step, index) => {
          const isActive = index === currentStepIndex && progress[index] < 100;
          const isCompleted = progress[index] === 100;
          const stepProgress = progress[index];

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <Check className="w-4 h-4 text-lime-400" />
                  )}
                  <span
                    className={`text-sm font-semibold transition-colors ${
                      isActive
                        ? "text-lime-400"
                        : isCompleted
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                <span
                  className={`text-sm font-bold transition-colors ${
                    isActive
                      ? "text-lime-400"
                      : isCompleted
                      ? "text-lime-400"
                      : "text-slate-600"
                  }`}
                >
                  {stepProgress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    isActive || isCompleted ? "bg-lime-400" : "bg-slate-700"
                  }`}
                  style={{ width: `${stepProgress}%` }}
                />
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Testimonials - Dynamic rotation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-4"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={testimonialIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-[#1A1A1C] border border-white/10 rounded-2xl p-5 space-y-3"
          >
            {/* Stars */}
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-lime-400 fill-lime-400" />
              ))}
            </div>

            {/* Text */}
            <p className="text-sm text-slate-300 leading-relaxed">
              {TESTIMONIALS[testimonialIndex].text}
            </p>

            {/* Author */}
            <p className="text-xs text-slate-500 font-semibold">
              — {TESTIMONIALS[testimonialIndex].author}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-3">
          {TESTIMONIALS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === testimonialIndex ? "w-4 bg-lime-400" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
