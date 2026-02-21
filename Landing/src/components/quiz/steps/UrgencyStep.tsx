import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { AlertCircle, Clock, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";

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
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <img
          src="https://i.ibb.co/1GzHD2QR/time-3d-icon-png-download-13124854.webp"
          alt="Tempo passando"
          className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]"
        />
      </motion.div>

      {/* Main Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-center mb-6 px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          {feelingText}
        </h2>
        <p className="text-base text-slate-400">
          Você identificou que <strong className="text-red-400">{challengeText}</strong> está no caminho. Cada dia sem agir é mais um dia perdido.
        </p>
      </motion.div>

      {/* Urgency Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="w-full max-w-md mb-6"
      >
        <div className="bg-[#121214] border border-red-500/20 rounded-2xl p-6 shadow-lg shadow-red-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-4 relative z-10">
            <Clock className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-bold text-white">O tempo está passando</h3>
          </div>

          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-slate-400">Dia do ano:</span>
              <span className="text-2xl font-bold text-red-500">{dayOfYear}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-slate-400">Dias restantes em {today.getFullYear()}:</span>
              <span className="text-2xl font-bold text-orange-500">{daysRemaining}</span>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Debriefing */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="text-sm text-center text-slate-400 px-4 max-w-md my-4"
      >
        Não é falta de força de vontade. Nunca foi.{" "}
        <span className="text-white font-semibold">É que você nunca teve o sistema certo.</span>
      </motion.p>

      {/* Success Stat */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#121214] border border-lime-500/20 rounded-2xl p-6 shadow-lg shadow-lime-500/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[150px] h-[150px] bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-3 relative z-10">
            <TrendingUp className="w-6 h-6 text-lime-400" />
            <h3 className="text-lg font-bold text-white">12 semanas mudam tudo</h3>
          </div>

          <p className="text-sm font-semibold text-lime-300/80 relative z-10">
            Quem começa hoje tem <strong className="text-lime-400">94% de chance</strong> de alcançar seus objetivos em 3 meses
          </p>
        </div>
      </motion.div>

      <ContinueButton />
    </div>
  );
};
