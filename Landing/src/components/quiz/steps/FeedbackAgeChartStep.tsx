import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";

// Maps an individual age (string "18"–"80") to a display bucket
const getBucket = (age: string): string => {
  const n = parseInt(age);
  if (isNaN(n)) return age; // legacy range passthrough
  if (n <= 24) return "18-24";
  if (n <= 34) return "25-34";
  if (n <= 44) return "35-44";
  if (n <= 54) return "45-54";
  return "55+";
};

const AGE_DATA = [
  { bucket: "18-24", percentage: 78, emoji: "⚡" },
  { bucket: "25-34", percentage: 91, emoji: "🏆" },
  { bucket: "35-44", percentage: 87, emoji: "💪" },
  { bucket: "45-54", percentage: 83, emoji: "🔥" },
  { bucket: "55+", percentage: 79, emoji: "⭐" },
];

export const FeedbackAgeChartStep = () => {
  const { ageRange } = useQuiz();
  const { trackChartView } = useTracking();
  const userBucket = getBucket(ageRange ?? "");

  useEffect(() => {
    trackChartView("age", ageRange || "unknown");
  }, [trackChartView, ageRange]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Nunca é tarde para mudar
        </h2>
        <p className="text-base text-slate-300">
          Veja quantas pessoas da <span className="text-lime-400 font-semibold">sua faixa etária</span> mantêm a rotina com o Bora
        </p>
      </motion.div>

      {/* Gamified Bars */}
      <div className="flex flex-col gap-3 px-2">
        {AGE_DATA.map((item, index) => {
          const isUser = item.bucket === userBucket;
          return (
            <motion.div
              key={item.bucket}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.08, duration: 0.35 }}
              className={`relative rounded-2xl p-3 ${isUser
                  ? "bg-lime-500/10 border border-lime-500/40"
                  : "bg-white/5 border border-white/5"
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{item.emoji}</span>
                <span className={`text-sm font-bold ${isUser ? "text-lime-400" : "text-slate-300"}`}>
                  {item.bucket} anos
                </span>
                {isUser && (
                  <span className="ml-auto text-[10px] font-black uppercase tracking-widest bg-lime-400 text-slate-900 px-2 py-0.5 rounded-full">
                    Você
                  </span>
                )}
                <span className={`${isUser ? "ml-0" : "ml-auto"} text-sm font-black ${isUser ? "text-lime-400" : "text-slate-400"}`}>
                  {item.percentage}%
                </span>
              </div>
              {/* Bar track */}
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ delay: 0.3 + index * 0.08, duration: 0.7, ease: "easeOut" }}
                  className={`h-full rounded-full relative overflow-hidden ${isUser
                      ? "bg-gradient-to-r from-lime-400 to-lime-300"
                      : "bg-gradient-to-r from-slate-600 to-slate-500"
                    }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insight card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="bg-lime-500/10 border border-lime-500/30 rounded-2xl p-4 text-center"
      >
        <p className="text-sm text-white font-medium">
          🎯 Mais de <span className="text-lime-400 font-black">9 em cada 10</span> pessoas da sua faixa etária{" "}
          mantêm consistência por <span className="text-lime-400 font-black">6+ meses</span>
        </p>
      </motion.div>

      <ContinueButton />
    </div>
  );
};
