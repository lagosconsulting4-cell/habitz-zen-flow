import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import {
  fadeInUp,
  buttonHoverTap,
  springTransition,
  staggerContainer,
  staggerItem,
} from "@/hooks/useAnimations";

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

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    playClickSound();
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
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
  };

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
  const hasAnswer = answers[currentQuestion] !== undefined;
  const QuestionIcon = currentQ.icon;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-30" />

      {/* Progress header */}
      <div className="relative z-10 w-full px-6 pt-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="progress-premium">
            <motion.div
              className="progress-premium-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Question counter */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-muted-foreground">
              Pergunta{" "}
              <span className="text-foreground font-medium">
                {currentQuestion + 1}
              </span>{" "}
              de {questions.length}
            </p>
            <p className="text-sm text-primary font-medium">
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            className="max-w-2xl w-full space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
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

            {/* Options */}
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
                      key={index}
                      variants={staggerItem}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div
                        className={`quiz-option-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => handleAnswer(option)}
                      >
                        <div className="flex items-center gap-4">
                          <RadioGroupItem
                            value={option}
                            id={`option-${index}`}
                            className="border-2"
                          />
                          <Label
                            htmlFor={`option-${index}`}
                            className="text-base md:text-lg cursor-pointer flex-1 leading-relaxed"
                          >
                            {option}
                          </Label>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={springTransition}
                            >
                              <CheckCircle className="h-5 w-5 text-primary" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </RadioGroup>

            {/* Next button */}
            <motion.div {...buttonHoverTap}>
              <Button
                onClick={handleNext}
                disabled={!hasAnswer}
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quiz;
