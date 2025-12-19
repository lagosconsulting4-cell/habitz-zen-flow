import { useState, useCallback, useEffect } from "react";
import { usePathAwareNavigate } from "@/contexts/PathPrefixContext";
import { motion, AnimatePresence, useAnimation, type PanInfo } from "motion/react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useTracking } from "@/hooks/useTracking";
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
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  fadeInUp,
  buttonHoverTap,
  springTransition,
} from "@/hooks/useAnimations";
import SiriOrb from "@/components/smoothui/siri-orb";
import { getQuizResult, saveQuizResult, type QuizResult } from "@/lib/quizScoring";

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


const Quiz = () => {
  const navigate = usePathAwareNavigate();
  const { trackQuizAnswer, trackQuizAbandoned, trackEvent } = useTracking();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showMidFeedback, setShowMidFeedback] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(null);
  const controls = useAnimation();
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [quizStartTime] = useState<number>(Date.now());

  // Scroll to top on mount - using requestAnimationFrame to ensure DOM is ready
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, []);

  // Track quiz abandonment on unmount
  useEffect(() => {
    return () => {
      // Only track if quiz was not completed
      const answersCount = Object.keys(answers).length;
      if (answersCount > 0 && !showCelebration) {
        trackQuizAbandoned({
          last_step: currentQuestion,
          total_steps: questions.length,
          time_spent: Math.floor((Date.now() - quizStartTime) / 1000),
          answers_given: answersCount
        });
      }
    };
  }, [currentQuestion, answers, showCelebration, quizStartTime, trackQuizAbandoned]);

  // Track mid-feedback view
  useEffect(() => {
    if (showMidFeedback) {
      trackEvent("quiz_mid_feedback_viewed", { step: 5 });
    }
  }, [showMidFeedback, trackEvent]);

  // Track celebration screen
  useEffect(() => {
    if (showCelebration && quizResult) {
      trackEvent("quiz_celebration_viewed", {
        score: quizResult.score,
        severity: quizResult.severity,
        percentage: quizResult.percentage
      });
    }
  }, [showCelebration, quizResult, trackEvent]);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const hasCurrentAnswer = answers[currentQuestion] !== undefined;

  const handleAnswer = (answer: string) => {
    const question = questions[currentQuestion];
    const timeOnQuestion = Math.floor((Date.now() - questionStartTime) / 1000);
    const answerIndex = question.options.indexOf(answer);

    // Track quiz answer
    trackQuizAnswer({
      step: currentQuestion,
      question_text: question.question,
      answer_text: answer,
      answer_index: answerIndex,
      time_on_question: timeOnQuestion
    });

    setAnswers({ ...answers, [currentQuestion]: answer });

    // Reset timer for next question
    setQuestionStartTime(Date.now());
  };

  const handleNext = useCallback(() => {
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
      // Calcular resultado e mostrar celebração
      const result = getQuizResult(answers, questions);
      setQuizResult(result);
      saveQuizResult(result, answers);
      setShowCelebration(true);
    }
  }, [currentQuestion, showMidFeedback, answers]);

  const handleGoToMirror = useCallback(() => {
    navigate("/mirror");
  }, [navigate]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {setCurrentQuestion(currentQuestion - 1);
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

  // Celebration screen after completing quiz
  if (showCelebration && quizResult) {
    const severityColors = {
      leve: "from-emerald-500 to-teal-500",
      moderado: "from-amber-500 to-orange-500",
      severo: "from-red-500 to-rose-500",
    };

    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Confetti-like particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-3 h-3 rounded-full ${
                i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-amber-400" : "bg-emerald-400"
              }`}
              initial={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400),
                y: -20,
                scale: Math.random() * 0.5 + 0.5,
                opacity: 1,
              }}
              animate={{
                y: typeof window !== "undefined" ? window.innerHeight + 20 : 800,
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                opacity: 0,
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 0.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
        <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br ${severityColors[quizResult.severity]} rounded-full blur-[150px] opacity-30`} />

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <motion.div
            className="max-w-2xl w-full text-center space-y-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Trophy icon with pulse */}
            <motion.div
              className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${severityColors[quizResult.severity]} flex items-center justify-center shadow-2xl`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...springTransition, delay: 0.2 }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="h-12 w-12 text-white" />
              </motion.div>
            </motion.div>

            {/* Score display */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm uppercase tracking-wider text-muted-foreground">
                Seu diagnóstico está pronto
              </p>
              <h2 className="text-4xl md:text-6xl font-black">
                <span className={`bg-gradient-to-r ${severityColors[quizResult.severity]} bg-clip-text text-transparent`}>
                  {quizResult.emoji} {quizResult.title}
                </span>
              </h2>
            </motion.div>

            {/* Score bar */}
            <motion.div
              className="max-w-md mx-auto space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Seu score</span>
                <span className="font-bold text-foreground">{quizResult.score}/{quizResult.maxScore}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${severityColors[quizResult.severity]} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${quizResult.percentage}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-lg text-muted-foreground max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {quizResult.description}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div {...buttonHoverTap}>
                <Button
                  onClick={handleGoToMirror}
                  variant="premium"
                  size="xl"
                  className="group"
                >
                  <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
                  <span>Ver minha solução personalizada</span>
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

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

            {/* Options - simplified animations to prevent blinking */}
            <RadioGroup
              value={answers[currentQuestion]}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              <div className="space-y-3">
                {currentQ.options.map((option, index) => {
                  const isSelected = answers[currentQuestion] === option;

                  return (
                    <motion.div
                      key={`${currentQuestion}-${option}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div
                        className={`quiz-option-card min-h-[56px] ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => handleAnswer(option)}
                      >
                        <div className="flex items-center gap-4">
                          <RadioGroupItem
                            value={option}
                            id={`option-${currentQuestion}-${index}`}
                            className="border-2"
                          />
                          <Label
                            htmlFor={`option-${currentQuestion}-${index}`}
                            className="text-base md:text-lg cursor-pointer flex-1 leading-relaxed"
                          >
                            {option}
                          </Label>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                              <CheckCircle className="h-5 w-5 text-primary" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
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
