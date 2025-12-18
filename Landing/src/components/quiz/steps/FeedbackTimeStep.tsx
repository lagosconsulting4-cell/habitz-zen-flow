import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { Clock, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";

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
        className="text-center mb-6 px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          Com <span className="text-lime-600">{timeText}</span> é extremamente possível mudar!
        </h2>
        <p className="text-base text-slate-700">
          O mais importante é a consistência, mesmo nos dias que você não está afim de cumprir a rotina
        </p>
      </motion.div>

      {/* Statistic Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-br from-lime-50 to-lime-100 border-2 border-lime-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-lime-600" />
            <h3 className="text-lg font-bold text-slate-900">Consistência comprovada</h3>
          </div>
          <p className="text-3xl font-bold text-lime-700 mb-2">94%</p>
          <p className="text-sm text-slate-700">
            dos usuários do Bora mantém a consistência de <strong>80%</strong> nos seus hábitos ideais
          </p>
        </div>
      </motion.div>
    </div>
  );
};
