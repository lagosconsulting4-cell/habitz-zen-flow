import React, { useState, useCallback, useEffect } from "react";
import { usePathAwareNavigate } from "@/contexts/PathPrefixContext";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Brain,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import QuizLoadingScreen from "@/components/antigo/QuizLoadingScreen";
import FeedbackGraph from "@/components/antigo/FeedbackGraph";

// Quiz questions data - 10 questions as specified
const quizQuestions = [
  {
    id: 1,
    question: "Quantas horas por noite você costuma dormir?",
    options: [
      { value: "A", label: "Menos de 5 horas", weight: 4 },
      { value: "B", label: "Entre 5 e 6 horas", weight: 3 },
      { value: "C", label: "Entre 6 e 7 horas", weight: 2 },
      { value: "D", label: "Mais de 7 horas", weight: 1 },
    ],
  },
  {
    id: 2,
    question: "Com que frequência você se sente sobrecarregado(a)?",
    options: [
      { value: "A", label: "Todos os dias", weight: 4 },
      { value: "B", label: "Várias vezes por semana", weight: 3 },
      { value: "C", label: "Algumas vezes por mês", weight: 2 },
      { value: "D", label: "Raramente", weight: 1 },
    ],
  },
  {
    id: 3,
    question: "Você consegue se concentrar em uma tarefa por quanto tempo?",
    options: [
      { value: "A", label: "Menos de 10 minutos", weight: 4 },
      { value: "B", label: "Entre 10 e 25 minutos", weight: 3 },
      { value: "C", label: "Entre 25 e 45 minutos", weight: 2 },
      { value: "D", label: "Mais de 45 minutos", weight: 1 },
    ],
  },
  {
    id: 4,
    question: "Com que frequência você procrastina tarefas importantes?",
    options: [
      { value: "A", label: "Sempre", weight: 4 },
      { value: "B", label: "Frequentemente", weight: 3 },
      { value: "C", label: "Às vezes", weight: 2 },
      { value: "D", label: "Raramente", weight: 1 },
    ],
  },
  {
    id: 5,
    question: "Como você descreveria seu nível de ansiedade no dia a dia?",
    options: [
      { value: "A", label: "Muito alto — difícil de controlar", weight: 4 },
      { value: "B", label: "Alto — frequentemente preocupado(a)", weight: 3 },
      { value: "C", label: "Moderado — algumas preocupações", weight: 2 },
      { value: "D", label: "Baixo — geralmente tranquilo(a)", weight: 1 },
    ],
  },
  {
    id: 6,
    question: "Você consegue desligar a mente antes de dormir?",
    options: [
      { value: "A", label: "Nunca — pensamentos não param", weight: 4 },
      { value: "B", label: "Raramente — demoro muito para relaxar", weight: 3 },
      { value: "C", label: "Às vezes — depende do dia", weight: 2 },
      { value: "D", label: "Sim — durmo facilmente", weight: 1 },
    ],
  },
  {
    id: 7,
    question: "Com que frequência você se sente culpado(a) por não ser produtivo(a)?",
    options: [
      { value: "A", label: "Todos os dias", weight: 4 },
      { value: "B", label: "Várias vezes por semana", weight: 3 },
      { value: "C", label: "Algumas vezes por mês", weight: 2 },
      { value: "D", label: "Raramente", weight: 1 },
    ],
  },
  {
    id: 8,
    question: "Você sente que tem controle sobre sua rotina?",
    options: [
      { value: "A", label: "Nenhum controle — vivo no caos", weight: 4 },
      { value: "B", label: "Pouco controle — as coisas escapam", weight: 3 },
      { value: "C", label: "Algum controle — algumas áreas ok", weight: 2 },
      { value: "D", label: "Muito controle — bem organizado(a)", weight: 1 },
    ],
  },
  {
    id: 9,
    question: "Quantas vezes você checa o celular por hora?",
    options: [
      { value: "A", label: "Mais de 10 vezes", weight: 4 },
      { value: "B", label: "Entre 5 e 10 vezes", weight: 3 },
      { value: "C", label: "Entre 2 e 5 vezes", weight: 2 },
      { value: "D", label: "Menos de 2 vezes", weight: 1 },
    ],
  },
  {
    id: 10,
    question: "Você sente que está progredindo em direção aos seus objetivos?",
    options: [
      { value: "A", label: "Não — estou estagnado(a)", weight: 4 },
      { value: "B", label: "Pouco — progresso muito lento", weight: 3 },
      { value: "C", label: "Moderadamente — algumas conquistas", weight: 2 },
      { value: "D", label: "Sim — avanço consistente", weight: 1 },
    ],
  },
];

// Quiz phases
type QuizPhase = "loading" | "questions" | "feedback" | "result";

const DirectQuiz = () => {
  const navigate = usePathAwareNavigate();
  const [phase, setPhase] = useState<QuizPhase>("loading");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const scrollToTop = useCallback((behavior: ScrollBehavior = "auto") => {
    if (typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior });
    });
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    scrollToTop();
  }, [scrollToTop]);

  // Scroll when phase changes to ensure each screen starts at the top
  useEffect(() => {
    scrollToTop("smooth");
  }, [phase, scrollToTop]);

  // Keep question transitions anchored at the top on mobile devices
  useEffect(() => {
    if (phase === "questions") {
      scrollToTop("smooth");
    }
  }, [currentQuestion, phase, scrollToTop]);

  // Calculate stress percentage (fixed at 78% as per spec, but we still track answers)
  const calculateStressLevel = useCallback(() => {
    // Always return 78% as specified in the plan
    return 78;
  }, []);

  // Handle loading complete
  const handleLoadingComplete = useCallback(() => {
    setPhase("questions");
  }, []);

  // Handle option selection
  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
  };

  // Handle next question
  const handleNext = () => {
    if (selectedOption === null) return;

    // Save answer
    setAnswers((prev) => ({
      ...prev,
      [quizQuestions[currentQuestion].id]: selectedOption,
    }));

    // Check if we should show feedback graph (after question 5)
    if (currentQuestion === 4) {
      setPhase("feedback");
      setSelectedOption(null);
      return;
    }

    // Check if quiz is complete
    if (currentQuestion === quizQuestions.length - 1) {
      setPhase("result");
      return;
    }

    // Move to next question
    setCurrentQuestion((prev) => prev + 1);
    setSelectedOption(null);
  };

  // Handle previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setSelectedOption(answers[quizQuestions[currentQuestion - 1].id] || null);
    }
  };

  // Handle feedback graph continue
  const handleFeedbackContinue = () => {
    setCurrentQuestion(5); // Move to question 6
    setPhase("questions");
  };

  // Handle result continue
  const handleResultContinue = () => {
    navigate("/mirror");
  };

  // Progress calculation
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  // Render loading phase
  if (phase === "loading") {
    return <QuizLoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Render feedback graph (mid-quiz)
  if (phase === "feedback") {
    return <FeedbackGraph onContinue={handleFeedbackContinue} />;
  }

  // Render result phase
  if (phase === "result") {
    const stressLevel = calculateStressLevel();

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
        <motion.div
          className="max-w-md w-full text-center space-y-6 sm:space-y-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Alert Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="font-bold text-xs sm:text-sm">RESULTADO: URGENTE</span>
          </motion.div>

          {/* Stress Level Circle */}
          <motion.div
            className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            {/* Background circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="url(#stressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="440"
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * stressLevel) / 100 }}
                transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="stressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-3xl sm:text-4xl font-bold text-red-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {stressLevel}%
              </motion.span>
              <motion.span
                className="text-xs sm:text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                nível de estresse
              </motion.span>
            </div>
          </motion.div>

          {/* Result Message */}
          <motion.div
            className="space-y-3 sm:space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Sua mente está em{" "}
              <span className="text-red-400">estado de alerta</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Seu nível de sobrecarga mental está <strong>acima da média</strong>.
              Isso significa que você está operando no limite — e seu corpo
              está pedindo socorro.
            </p>
          </motion.div>

          {/* Warning Box */}
          <motion.div
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 sm:p-4 space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs sm:text-sm text-red-400 font-medium">
              ⚠️ Se você não agir agora, o estresse crônico pode causar:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 text-left pl-4">
              <li>• Burnout e exaustão extrema</li>
              <li>• Problemas de memória e concentração</li>
              <li>• Ansiedade e insônia crônicas</li>
              <li>• Impacto nas relações pessoais</li>
            </ul>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              onClick={handleResultContinue}
              size="2xl"
              className="w-full min-h-[48px] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
            >
              <span className="font-bold text-sm sm:text-base">VER MEU DIAGNÓSTICO COMPLETO</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Render questions phase
  const question = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="max-w-md mx-auto space-y-3">
          {/* Question counter */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Pergunta {currentQuestion + 1} de {quizQuestions.length}
            </span>
            <span className="text-orange-400 font-medium">
              {Math.round(progress)}% completo
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <motion.div
          className="max-w-md w-full space-y-6 sm:space-y-8"
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Question */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-500/10 border border-orange-500/30">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">
              {question.question}
            </h2>
          </div>

          {/* Options - no stagger animation to prevent blinking */}
          <div className="space-y-3">
            {question.options.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedOption === option.value
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-border/50 bg-muted/30 hover:border-orange-500/50 hover:bg-muted/50"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedOption === option.value
                        ? "border-orange-500 bg-orange-500"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {selectedOption === option.value && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm md:text-base ${
                      selectedOption === option.value
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentQuestion > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={selectedOption === null}
              className={`flex-1 min-h-[44px] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white ${
                currentQuestion === 0 ? "w-full" : ""
              }`}
            >
              {currentQuestion === quizQuestions.length - 1 ? (
                <>
                  Ver Resultado
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Próxima
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DirectQuiz;
