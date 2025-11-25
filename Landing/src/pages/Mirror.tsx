import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Coffee,
  Sunset,
  Moon,
  Sparkles,
  ArrowRight,
  HeartCrack,
  Clock,
  type LucideIcon,
} from "lucide-react";
import {
  fadeInUp,
  buttonHoverTap,
  springTransition,
} from "@/hooks/useAnimations";

interface Scenario {
  time: string;
  icon: LucideIcon;
  gradient: string;
  title: string;
  description: string;
  emotion: string;
}

const scenarios: Scenario[] = [
  {
    time: "07:00",
    icon: Sun,
    gradient: "from-amber-500/20 to-orange-500/10",
    title: "Mais um dia igual",
    description:
      "Acordou cansado. Pegou o celular antes de levantar. 40 minutos já se passaram e você nem saiu da cama.",
    emotion: "Culpa",
  },
  {
    time: "12:30",
    icon: Coffee,
    gradient: "from-blue-500/20 to-cyan-500/10",
    title: "Almoço e procrastinação",
    description:
      "Prometeu começar depois do almoço. Está rolando o feed há 30 minutos enquanto a tarde escapa.",
    emotion: "Frustração",
  },
  {
    time: "18:00",
    icon: Sunset,
    gradient: "from-orange-500/20 to-red-500/10",
    title: "Final do dia",
    description:
      "Olha pra trás e percebe: mais um dia perdido sem fazer o que realmente importa. De novo.",
    emotion: "Decepção profunda",
  },
  {
    time: "23:00",
    icon: Moon,
    gradient: "from-indigo-500/20 to-purple-500/10",
    title: "Antes de dormir",
    description:
      '"Amanhã vai ser diferente", você pensa. Mas lá no fundo, sabe que não será. Nunca é.',
    emotion: "Sensação de estar ficando pra trás",
  },
];

const playClickSound = () => {
  const audio = new Audio(
    "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PWKzn7aVXFAxTqOXzu2sfBTCA0fTRfi4GIG/B7uSaRw0QWrTn7aRXFAxRqOPyu2wcBi+A0vPSgDEGH2/B7uOaSQ0PXLbn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVX"
  );
  audio.play().catch(() => {});
};

const Mirror = () => {
  const navigate = useNavigate();
  const [currentScene, setCurrentScene] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handleNext = () => {
    playClickSound();
    if (currentScene < scenarios.length - 1) {
      setCurrentScene(currentScene + 1);
    } else {
      setShowModal(true);
    }
  };

  // Final modal - transition to hope
  if (showModal) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <motion.div
            className="max-w-3xl w-full text-center space-y-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Sparkle icon */}
            <motion.div
              className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...springTransition, delay: 0.2 }}
            >
              <Sparkles className="h-10 w-10 text-primary" />
            </motion.div>

            {/* Message */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                E se pudesse ser
                <span className="block gradient-text mt-2">diferente?</span>
              </h2>
            </motion.div>

            {/* Hope card */}
            <motion.div
              className="glass-card p-8 text-left space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-xl font-semibold">
                Baseado nas suas respostas, criamos uma{" "}
                <span className="text-primary">rotina sob medida</span> que
                resolve exatamente os bloqueios que você enfrenta hoje.
              </p>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-primary font-bold">
                    Menos de 7 minutos por dia.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>100% adaptada pra sua vida real.</span>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div {...buttonHoverTap}>
                <Button
                  onClick={() => {
                    playClickSound();
                    navigate("/offer");
                  }}
                  variant="premium"
                  size="2xl"
                  className="group w-full md:w-auto"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  <span>Ver minha rotina personalizada</span>
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const scene = scenarios[currentScene];
  const SceneIcon = scene.icon;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Themed gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${scene.gradient} pointer-events-none transition-all duration-700`}
      />
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative z-10 w-full px-6 pt-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm">
              <HeartCrack className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Espelho do Futuro
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Um dia típico se nada mudar...
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scene content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            className="max-w-2xl w-full space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            {/* Time and icon */}
            <div className="flex items-center gap-4">
              <motion.div
                className="icon-container icon-container-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springTransition}
              >
                <SceneIcon className="h-8 w-8 text-primary" />
              </motion.div>
              <div className="text-5xl md:text-6xl font-bold text-primary">
                {scene.time}
              </div>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            {/* Scene text */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">{scene.title}</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {scene.description}
              </p>
            </div>

            {/* Emotion card */}
            <motion.div
              className="glass-card p-6 border-l-4 border-destructive"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="section-label text-destructive mb-1">
                Como você se sente:
              </p>
              <div className="flex items-center gap-2">
                <HeartCrack className="h-5 w-5 text-destructive" />
                <p className="text-lg font-semibold text-destructive">
                  {scene.emotion}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress and navigation */}
      <div className="relative z-10 px-6 pb-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex gap-2">
            {scenarios.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentScene
                    ? "w-10 bg-primary"
                    : index < currentScene
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-border"
                }`}
                initial={index === currentScene ? { scale: 0.8 } : {}}
                animate={index === currentScene ? { scale: 1 } : {}}
              />
            ))}
          </div>

          {/* Next button */}
          <motion.div {...buttonHoverTap}>
            <Button
              onClick={handleNext}
              variant="premium"
              size="lg"
              className="group"
            >
              <span>
                {currentScene === scenarios.length - 1
                  ? "Próximo"
                  : "Continuar"}
              </span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Mirror;
