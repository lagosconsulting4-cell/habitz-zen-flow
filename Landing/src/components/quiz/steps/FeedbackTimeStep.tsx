import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";
import { TypingText } from "@/components/animate-ui/primitives/texts/typing";

export const FeedbackTimeStep = () => {
  const { timeAvailable } = useQuiz();
  const { trackFeedbackView } = useTracking();

  const timeLabels: Record<string, string> = {
    "5min": "5 minutos",
    "15min": "15 minutos",
    "30min": "30 minutos",
    "1h": "1 hora",
  };

  const timeText = timeAvailable ? timeLabels[timeAvailable] || "alguns minutos" : "alguns minutos";

  useEffect(() => {
    trackFeedbackView("time", { timeAvailable: timeText });
  }, [trackFeedbackView, timeText]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Main Title */}
      <motion.h2
        className="text-5xl md:text-6xl font-bold text-white mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Perfeito.
      </motion.h2>

      {/* Description */}
      <motion.p
        className="text-xl md:text-2xl text-slate-300 mb-12 text-center max-w-2xl leading-relaxed"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Com <strong className="text-white font-bold">{timeText}</strong>, o sistema ajusta tudo pra você evoluir sem travar.
      </motion.p>

      {/* Typing Text - Constância > Intensidade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-12"
      >
        <TypingText
          text="Constância > Intensidade"
          className="text-3xl md:text-4xl font-bold text-lime-400"
          delay={0.8}
          duration={1.5}
          cursor={false}
        />
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <ContinueButton />
      </motion.div>
    </div>
  );
};
