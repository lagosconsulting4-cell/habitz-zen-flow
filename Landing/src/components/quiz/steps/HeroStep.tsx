import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useQuiz } from "../QuizProvider";

export const HeroStep = () => {
  const { nextStep } = useQuiz();

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-[#0A0A0B] overflow-hidden">
      {/* Background Image - Full Screen */}
      <div className="absolute inset-0 w-full h-full bg-[#0A0A0B]">
        <img
          src="https://i.ibb.co/cXCVSpgL/Headline-7.png"
          alt="Vire a sua melhor versão"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://images.unsplash.com/photo-1544367563-12123d896589?q=80&w=1080&auto=format&fit=crop";
          }}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-between min-h-[100dvh] max-h-[100dvh] px-6 py-6">

        {/* Top Section - Logo + Headline */}
        <div className="flex flex-col items-center -mt-[1vh]">
          {/* Logo Bora - Top */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-shrink-0 mb-6"
          >
            <img
              src="https://i.ibb.co/CstYtpdH/meditar.png"
              alt="Bora"
              className="w-10 h-10 object-contain"
            />
          </motion.div>

          {/* Headline - Center */}
          <div className="text-center space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[28px] font-bold text-white leading-tight px-4"
          >
            Vire a sua melhor versão
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-base text-white/90 italic font-medium"
          >
            Não é mágica. É ciência
          </motion.p>
          </div>
        </div>

        {/* CTA - Bottom */}
        <div className="w-full max-w-sm mt-auto pb-[8vh]">
          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button
              size="lg"
              onClick={nextStep}
              className="w-full h-12 text-sm font-bold uppercase tracking-wide bg-lime-400 hover:bg-lime-500 text-slate-900 shadow-[0_0_20px_rgba(163,230,53,0.4)] hover:shadow-[0_0_30px_rgba(163,230,53,0.6)] transition-all rounded-full"
            >
              Iniciar jornada
            </Button>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
