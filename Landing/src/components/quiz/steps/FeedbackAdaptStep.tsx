import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { Heart, Users } from "lucide-react";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";

export const FeedbackAdaptStep = () => {
  const { financialRange, profession } = useQuiz();
  const { trackFeedbackView } = useTracking();

  // Map financial range to readable format
  const rangeLabels: Record<string, string> = {
    "1600-3000": "R$1.600-3.000",
    "3000-7000": "R$3.000-7.000",
    "7000-20000": "R$7.000-20.000",
    "20000+": "R$20.000+",
  };

  // Map profession to readable format
  const professionLabels: Record<string, string> = {
    student: "estudantes",
    employed: "empregados",
    entrepreneur: "empreendedores",
    freelancer: "freelancers",
    other: "profissionais",
  };

  const rangeText = financialRange ? rangeLabels[financialRange] || "sua faixa de renda" : "sua faixa de renda";
  const professionText = profession ? professionLabels[profession] || "profissionais" : "profissionais";

  useEffect(() => {
    trackFeedbackView("adapt", { financialRange: rangeText, profession: professionText });
  }, [trackFeedbackView, rangeText, professionText]);

  return (
    <div className="flex flex-col items-center">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center ring-1 ring-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <Heart className="w-10 h-10 text-blue-400" />
        </div>
      </motion.div>

      {/* Main Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-center mb-6 px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Fique Tranquilo!
        </h2>
        <p className="text-base text-slate-400 mb-4 leading-relaxed">
          O Bora foi feito para se adaptar à sua rotina e realidade, sem planos surreais e impossíveis de serem cumpridos.
        </p>
      </motion.div>

      {/* Statistic Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#121214] border border-blue-500/20 rounded-2xl p-6 shadow-lg shadow-blue-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-3 relative z-10">
            <Users className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Comunidade forte</h3>
          </div>
          <p className="text-4xl font-bold text-blue-400 mb-2 relative z-10">+87%</p>
          <p className="text-sm text-slate-400 relative z-10 leading-relaxed">
            dos nossos usuários com <strong className="text-blue-300">{rangeText}</strong> e <strong className="text-blue-300">{professionText}</strong> mantém os hábitos e finalmente conquistam a vida dos sonhos
          </p>
          <div className="mt-3 pt-3 border-t border-white/10 relative z-10">
            <p className="text-xs text-blue-300/80">
              <strong className="text-blue-400">🧠 Como funciona:</strong> Repetir a mesma coisa no mesmo horário "treina" seu cérebro. Com o tempo, você faz no automático — tipo escovar os dentes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Continue */}
      <ContinueButton />
    </div>
  );
};
