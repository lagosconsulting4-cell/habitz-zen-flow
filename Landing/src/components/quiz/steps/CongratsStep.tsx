import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { Trophy, Clock, Target, CheckCircle, TrendingUp, Calendar } from "lucide-react";

export const CongratsStep = () => {
  const { objective, timeAvailable, challenges, workSchedule } = useQuiz();

  // Map objective to readable format
  const objectiveLabels: Record<string, string> = {
    productivity: "Aumentar Produtividade",
    health: "Melhorar Saúde Física",
    routine: "Ser Mais Organizado",
    avoid: "Eliminar Vícios",
    mental: "Melhorar Qualidade de Vida"
  };

  // Map time to habit count
  const habitCounts: Record<string, string> = {
    "5min": "2 hábitos",
    "15min": "3 hábitos",
    "30min": "4-5 hábitos",
    "1h": "6-7 hábitos"
  };

  // Map work schedule to best time
  const bestTimes: Record<string, string> = {
    commercial: "Manhã (antes do trabalho) ou Noite (após 18h)",
    morning: "Tarde ou Noite",
    evening: "Manhã ou Início da Tarde",
    flexible: "Horários flexíveis durante o dia"
  };

  const objectiveText = objective ? objectiveLabels[objective] : "Transformar sua Vida";
  const habitCount = timeAvailable ? habitCounts[timeAvailable] : "3-5 hábitos";
  const bestTime = workSchedule ? bestTimes[workSchedule] : "Horários personalizados";

  return (
    <div className="flex flex-col items-center">
      {/* Trophy Icon with Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          {/* Celebration rings */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
            className="absolute inset-0 w-28 h-28 -m-2 bg-lime-500 rounded-full"
          />

          <div className="w-24 h-24 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center shadow-2xl">
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Main Congrats Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-center mb-8 px-4"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          🎉 Parabéns!
        </h1>
        <h2 className="text-xl sm:text-2xl font-bold text-lime-400 mb-3">
          Seu plano personalizado está pronto!
        </h2>
        <p className="text-base text-slate-400">
          Com base nas suas respostas, criamos uma rotina que vai te ajudar a conquistar seus objetivos
        </p>
      </motion.div>

      {/* Plan Summary Cards */}
      <div className="w-full max-w-2xl px-4 space-y-4 mb-8">
        {/* Objective Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Seu Objetivo Principal</h3>
          </div>
          <p className="text-2xl font-bold text-blue-300">{objectiveText}</p>
        </motion.div>

        {/* Daily Recommendation Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="bg-lime-500/10 border border-lime-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-6 h-6 text-lime-400" />
            <h3 className="text-lg font-bold text-white">Recomendação Diária</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-slate-400">Hábitos recomendados:</span>
              <span className="text-xl font-bold text-lime-300">{habitCount}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-slate-400">Melhor horário:</span>
              <span className="text-base font-semibold text-lime-300">{bestTime}</span>
            </div>
          </div>
        </motion.div>

        {/* Challenges Card */}
        {challenges && challenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Focos de Melhoria</h3>
            </div>
            <p className="text-sm text-slate-400">
              Vamos trabalhar juntos em: <strong className="text-purple-300">{challenges.length} desafios identificados</strong>
            </p>
          </motion.div>
        )}

        {/* Success Projection Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-bold text-white">Como Alcançar</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <p><strong>Semanas 1-4:</strong> Construir consistência com hábitos simples</p>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <p><strong>Semanas 5-8:</strong> Aumentar dificuldade e manter 80%+ de consistência</p>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <p><strong>Semanas 9-12:</strong> Rotina consolidada, resultados visíveis</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Final Motivation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="text-center px-4 max-w-xl"
      >
        <div className="bg-gradient-to-r from-lime-500 to-lime-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-lg font-bold mb-2">
            Você está a um passo de transformar sua vida! 🚀
          </p>
          <p className="text-sm opacity-90">
            Crie sua conta agora e comece sua jornada rumo aos seus objetivos
          </p>
        </div>
      </motion.div>
    </div>
  );
};
