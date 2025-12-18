import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { AlertCircle, Clock, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";

export const UrgencyStep = () => {
  const { consistencyFeeling, primaryChallenge, currentDate, objective } = useQuiz();
  const { trackUrgencyScreenView } = useTracking();

  // Map consistency feeling to emotional copy
  const feelingMessages: Record<string, string> = {
    frustrado: "Sabemos que você está frustrado com a falta de resultados",
    evitando: "Você tem evitado enfrentar isso por muito tempo",
    conformado: "Não se conforme com uma vida abaixo do seu potencial",
    determinado: "Sua determinação é o primeiro passo, mas você precisa de um plano"
  };

  // Map challenges to readable format
  const challengeLabels: Record<string, string> = {
    procrastination: "procrastinação",
    "low-energy": "baixa energia",
    stress: "estresse",
    distraction: "distrações constantes",
    "no-time": "falta de tempo",
    motivation: "falta de motivação"
  };

  // Map objectives to action verbs
  const objectiveActions: Record<string, string> = {
    productivity: "ser mais produtivo",
    health: "melhorar sua saúde",
    routine: "organizar sua vida",
    avoid: "eliminar vícios",
    mental: "ter paz mental"
  };

  const feelingText = consistencyFeeling ? feelingMessages[consistencyFeeling] : "Você merece uma vida melhor";
  const challengeText = primaryChallenge ? challengeLabels[primaryChallenge] : "suas dificuldades";
  const objectiveText = objective ? objectiveActions[objective] : "mudar";

  // Calculate current day of year
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const daysRemaining = 365 - dayOfYear;

  useEffect(() => {
    trackUrgencyScreenView(
      consistencyFeeling || "unknown",
      primaryChallenge || "unknown",
      dayOfYear
    );
  }, [trackUrgencyScreenView, consistencyFeeling, primaryChallenge, dayOfYear]);

  return (
    <div className="flex flex-col items-center">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-600" />
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
          {feelingText}
        </h2>
        <p className="text-base text-slate-700 mb-2">
          Você identificou que <strong className="text-red-600">{challengeText}</strong> está impedindo você de {objectiveText}.
        </p>
        <p className="text-base text-slate-700">
          Cada dia que passa é um dia a menos para conquistar o que você sempre quis.
        </p>
      </motion.div>

      {/* Urgency Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="w-full max-w-md mb-6"
      >
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-slate-900">O tempo está passando</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-slate-700">Dia do ano:</span>
              <span className="text-2xl font-bold text-red-600">{dayOfYear}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-slate-700">Dias restantes em {today.getFullYear()}:</span>
              <span className="text-2xl font-bold text-orange-600">{daysRemaining}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-sm font-semibold text-red-800">
              Não deixe mais um ano passar sem conquistar seus objetivos
            </p>
          </div>
        </div>
      </motion.div>

      {/* Success Stat */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-br from-lime-50 to-lime-100 border-2 border-lime-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-lime-600" />
            <h3 className="text-lg font-bold text-slate-900">Mas ainda há tempo!</h3>
          </div>

          <p className="text-3xl font-bold text-lime-700 mb-2">12 semanas</p>
          <p className="text-sm text-slate-700">
            É tudo que você precisa para transformar completamente sua vida com o Bora
          </p>

          <div className="mt-4 pt-4 border-t border-lime-200">
            <p className="text-sm font-semibold text-lime-800">
              Usuários que começam hoje têm <strong>94% de chance</strong> de alcançar seus objetivos em 3 meses
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
