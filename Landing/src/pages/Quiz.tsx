import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useAnimation, type PanInfo } from "motion/react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  MessageCircle,
  RefreshCw,
  Frown,
  Construction,
  BarChart3,
  Brain,
  Zap,
  Sprout,
  Compass,
  Heart,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  fadeInUp,
  buttonHoverTap,
  springTransition,
  staggerContainer,
  staggerItem,
} from "@/hooks/useAnimations";
import SiriOrb from "@/components/smoothui/siri-orb";

interface Question {
  id: number;
  icon: LucideIcon;
  question: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 1,
    icon: Target,
    question: "Quão difícil é criar uma rotina que realmente funciona?",
    options: [
      "Impossível — sempre desisto",
      "Começo empolgado, mas perco o ritmo em dias",
      "Às vezes consigo manter, mas não é consistente",
      "Consigo seguir com disciplina",
    ],
  },
  {
    id: 2,
    icon: MessageCircle,
    question: "O que você sente ao ver alguém evoluindo enquanto você está parado?",
    options: [
      "Frustração profunda — sinto que fiquei pra trás",
      "Inveja disfarçada de motivação",
      "Indiferença — cada um no seu tempo",
      "Inspiração real — quero fazer igual",
    ],
  },
  {
    id: 3,
    icon: RefreshCw,
    question: "Quantas vezes você prometeu a si mesmo que ia mudar... e não mudou?",
    options: [
      "Perdí a conta — virou piada interna",
      "Umas 5 a 10 vezes só esse ano",
      "Algumas vezes, mas tento não pensar nisso",
      "Raramente prometo, prefiro agir",
    ],
  },
  {
    id: 4,
    icon: Frown,
    question: "Qual dessas frases mais dói quando você pensa nela?",
    options: [
      '"Estou estagnado e cansado de mim mesmo"',
      '"Sinto que o tempo tá passando e eu não saí do lugar"',
      '"Não sei nem por onde começar"',
      '"Estou fazendo meu melhor e crescendo"',
    ],
  },
  {
    id: 5,
    icon: Construction,
    question: "O que realmente te impede de viver como você quer?",
    options: [
      "Falta de disciplina — sempre deixo pra depois",
      "Paralisia — não sei por onde começar",
      "Falta de tempo — minha rotina é caótica",
      "Nada — estou construindo meu caminho",
    ],
  },
  {
    id: 6,
    icon: BarChart3,
    question: "Quando você cria uma meta, o que geralmente acontece?",
    options: [
      "Desisto em 2 semanas ou menos",
      "Começo bem, mas perco a energia rápido",
      "Mantenho algumas metas, outras caem no esquecimento",
      "Geralmente atinjo o que estabeleço",
    ],
  },
  {
    id: 7,
    icon: Brain,
    question: "Qual pensamento mais aparece na sua mente ultimamente?",
    options: [
      '"Segunda eu começo..." (mas nunca começa)',
      '"Mais um dia que eu desperdicei"',
      '"Por que diabos eu não consigo mudar?"',
      '"Estou evoluindo, um passo de cada vez"',
    ],
  },
  {
    id: 8,
    icon: Zap,
    question: "Como anda sua energia durante o dia?",
    options: [
      "Sempre exausto, vivo no piloto automático",
      "Minha energia despenca do nada — muito instável",
      "Razoável, mas podia ser bem melhor",
      "Acordo disposto e mantenho o ritmo",
    ],
  },
  {
    id: 9,
    icon: Sprout,
    question: "Olhando pro último ano, você sente que evoluiu de verdade?",
    options: [
      "Não. Estou no mesmo lugar (ou pior)",
      "Quase nada — mudou pouca coisa",
      "Evoluí um pouco, mas muito devagar",
      "Sim, vejo progresso real",
    ],
  },
  {
    id: 10,
    icon: Compass,
    question: "Se você continuar exatamente como está hoje, onde vai estar daqui a 1 ano?",
    options: [
      "No mesmo lugar — mais velho, mais arrependido",
      "Provavelmente igual... ou até pior",
      "Talvez diferente, mas não tenho certeza",
      "Em outro nível — estou construindo meu futuro agora",
    ],
  },
];

const playClickSound = () => {
  const audio = new Audio(
    "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PWKzn7aVXFAxTqOXzu2sfBTCA0fTRfi4GIG/B7uSaRw0QWrTn7aRXFAxRqOPyu2wcBi+A0vPSgDEGH2/B7uOaSQ0PXLbn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVX"
  );
  audio.play().catch(() => {});
};

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showMidFeedback, setShowMidFeedback] = useState(false);
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(null);
  const controls = useAnimation();

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const hasCurrentAnswer = answers[currentQuestion] !== undefined;

  const handleAnswer = (answer: string) => {
    playClickSound();
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = useCallback(() => {
    playClickSound();

    if (currentQuestion === 4 && !showMidFeedback) {
      setShowMidFeedback(true);
      return;
    }

    if (showMidFeedback) {
      setShowMidFeedback(false);
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      navigate("/mirror");
    }
  }, [currentQuestion, showMidFeedback, navigate]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      playClickSound();
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);

  // Swipe gesture handler
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 100;
      const velocity = 500;

      // Swipe left - next question (if answered)
      if ((info.offset.x < -threshold || info.velocity.x < -velocity) && hasCurrentAnswer) {
        handleNext();
      }
      // Swipe right - previous question
      else if ((info.offset.x > threshold || info.velocity.x > velocity) && currentQuestion > 0) {
        handlePrevious();
      }

      setDragDirection(null);
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
    },
    [hasCurrentAnswer, currentQuestion, handleNext, handlePrevious, controls]
  );

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x < -50) {
        setDragDirection("left");
      } else if (info.offset.x > 50) {
        setDragDirection("right");
      } else {
        setDragDirection(null);
      }
    },
    []
  );

  // Mid-quiz feedback screen
  if (showMidFeedback) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <motion.div
            className="max-w-2xl w-full text-center space-y-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Celebration icon */}
            <motion.div
              className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...springTransition, delay: 0.2 }}
            >
              <Heart className="h-10 w-10 text-primary" fill="currentColor" />
            </motion.div>

            {/* Message */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                A gente entende.
                <span className="block gradient-text mt-2">
                  Você não está sozinho nisso.
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Mais de 5.000 pessoas já sentiram essa mesma dor… e conseguiram
                virar o jogo com uma rotina de menos de 7 minutos por dia.
              </p>
            </motion.div>

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div {...buttonHoverTap}>
                <Button
                  onClick={handleNext}
                  variant="premium"
                  size="xl"
                  className="group"
                >
                  <span>Continuar</span>
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const QuestionIcon = currentQ.icon;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-30" />

      {/* SiriOrb decorative elements */}
      <div className="absolute -top-32 -right-32 opacity-20 pointer-events-none blur-sm">
        <SiriOrb
          size="400px"
          colors={{
            bg: "oklch(10% 0.01 120)",
            c1: "oklch(70% 0.18 125)",
            c2: "oklch(65% 0.15 130)",
            c3: "oklch(75% 0.12 118)",
          }}
          animationDuration={25}
        />
      </div>
      <div className="absolute -bottom-40 -left-40 opacity-15 pointer-events-none blur-md">
        <SiriOrb
          size="500px"
          colors={{
            bg: "oklch(10% 0.01 120)",
            c1: "oklch(68% 0.16 128)",
            c2: "oklch(72% 0.14 122)",
            c3: "oklch(60% 0.10 135)",
          }}
          animationDuration={35}
        />
      </div>

      {/* Swipe indicators */}
      <AnimatePresence>
        {dragDirection === "left" && hasCurrentAnswer && (
          <motion.div
            className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <span className="text-sm text-primary font-medium">Próxima</span>
            <ChevronRight className="h-5 w-5 text-primary" />
          </motion.div>
        )}
        {dragDirection === "right" && currentQuestion > 0 && (
          <motion.div
            className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 border border-border/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Anterior</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress header - Clean & Minimal */}
      <div className="relative z-10 w-full px-6 pt-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Premium Progress Bar */}
          <div className="progress-premium">
            <motion.div
              className="progress-premium-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>

          {/* Step indicators with checks */}
          <div className="flex justify-between items-center">
            {questions.map((_, index) => {
              const isCompleted = index < currentQuestion;
              const isCurrent = index === currentQuestion;

              return (
                <motion.div
                  key={index}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-300 border-2
                    ${isCompleted
                      ? "bg-primary border-primary"
                      : isCurrent
                        ? "border-primary bg-primary/20"
                        : "border-muted bg-transparent"
                    }
                  `}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <CheckCircle className="w-5 h-5 text-primary-foreground" />
                    </motion.div>
                  ) : (
                    <span className={`text-xs font-bold ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                      {index + 1}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Back button only */}
          {currentQuestion > 0 && (
            <motion.button
              onClick={handlePrevious}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Question content with swipe */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            className="max-w-2xl w-full space-y-8 touch-pan-y select-none"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Question header */}
            <div className="space-y-4">
              <div className="icon-container icon-container-md inline-flex">
                <QuestionIcon className="h-6 w-6 text-primary" />
              </div>

              <h2 className="text-2xl md:text-4xl font-bold leading-tight">
                {currentQ.question}
              </h2>
            </div>

            {/* Options with enhanced micro-animations */}
            <RadioGroup
              value={answers[currentQuestion]}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-3"
              >
                {currentQ.options.map((option, index) => {
                  const isSelected = answers[currentQuestion] === option;

                  return (
                    <motion.div
                      key={option}
                      variants={staggerItem}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      layout
                    >
                      <motion.div
                        className={`quiz-option-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => handleAnswer(option)}
                        animate={isSelected ? {
                          scale: [1, 1.02, 1],
                          transition: { duration: 0.3 }
                        } : {}}
                      >
                        <div className="flex items-center gap-4">
                          <motion.div
                            animate={isSelected ? {
                              scale: [1, 1.2, 1],
                              transition: { duration: 0.3 }
                            } : {}}
                          >
                            <RadioGroupItem
                              value={option}
                              id={`option-${index}`}
                              className="border-2"
                            />
                          </motion.div>
                          <Label
                            htmlFor={`option-${index}`}
                            className="text-base md:text-lg cursor-pointer flex-1 leading-relaxed"
                          >
                            {option}
                          </Label>
                          <AnimatePresence mode="wait">
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 20
                                }}
                              >
                                <CheckCircle className="h-5 w-5 text-primary" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </RadioGroup>

            {/* Next button with swipe hint */}
            <div className="space-y-3">
              <motion.div {...buttonHoverTap}>
                <Button
                  onClick={handleNext}
                  disabled={!hasCurrentAnswer}
                  variant="premium"
                  size="xl"
                  className="w-full group"
                >
                  <span>
                    {currentQuestion === questions.length - 1
                      ? "Ver meu resultado"
                      : "Próxima"}
                  </span>
                  {currentQuestion === questions.length - 1 ? (
                    <Target className="h-5 w-5 ml-2" />
                  ) : (
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              </motion.div>

              {/* Swipe hint for mobile */}
              <motion.p
                className="text-center text-xs text-muted-foreground md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Deslize para navegar entre perguntas
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quiz;
