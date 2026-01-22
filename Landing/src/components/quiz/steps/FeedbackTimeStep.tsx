import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { Clock, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";

export const FeedbackTimeStep = () => {
  const { timeAvailable } = useQuiz();
  const { trackFeedbackView } = useTracking();

  // Map time to readable format
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
    <div className="flex flex-col items-center">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center">
          <Clock className="w-10 h-10 text-lime-600" />
        </div>
      </motion.div>

      {/* Main Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-center mb-6 px-4 max-w-md"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
          Pouco tempo já é <span className="text-lime-600">suficiente</span>
        </h2>
        <p className="text-base text-slate-700 mb-3">
          Não é sobre fazer tudo.
          <br />
          É sobre fazer algo que caiba até nos dias cansativos.
        </p>
        <p className="text-base text-slate-700">
          <strong className="text-slate-900">Rotinas pequenas são mais fáceis de manter</strong> — especialmente quando o dia não ajuda.
        </p>
      </motion.div>

      {/* Science tip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="w-full max-w-md px-4 mb-6"
      >
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-600">
            <strong className="text-lime-600">💡 Ciência:</strong>{" "}
            Hábitos pequenos grudam mais. É tipo criar um caminho — quanto mais curto, mais fácil de repetir todo dia até virar automático.
          </p>
        </div>
      </motion.div>

      {/* Continue */}
      <ContinueButton />
    </div>
  );
};
