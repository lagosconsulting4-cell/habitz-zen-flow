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
          src="https://i.ibb.co/dwTpGdc8/Headline-5.png"
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
      <div className="relative z-10 flex flex-col items-center min-h-[100dvh] px-6 pt-8 pb-6">

        {/* Logo Bora - Top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <img
            src="https://i.ibb.co/CstYtpdH/meditar.png"
            alt="Bora"
            className="w-12 h-12 object-contain"
          />
        </motion.div>

        {/* Headline - Top area */}
        <div className="text-center space-y-3 mb-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[32px] font-bold text-white leading-tight px-4"
          >
            Vire a sua melhor versão
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-white/90 italic font-medium"
          >
            Não é mágica. É ciência
          </motion.p>
        </div>

        {/* Universities + CTA - Bottom */}
        <div className="w-full max-w-sm space-y-6 mt-auto pt-12">
          {/* Universities Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center space-y-4"
          >
            <p className="text-xs text-white/80 italic px-4">
              Desenvolvido com base em + de 2.847 estudos de universidades como:
            </p>
            <img
              src="https://i.ibb.co/67K16Ttk/Headline-6.png"
              alt="Yale e Stanford"
              className="w-full max-w-[260px] mx-auto h-auto object-contain"
            />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button
              size="lg"
              onClick={nextStep}
              className="w-full h-14 text-base font-bold uppercase tracking-wide bg-lime-400 hover:bg-lime-500 text-slate-900 shadow-[0_0_20px_rgba(163,230,53,0.4)] hover:shadow-[0_0_30px_rgba(163,230,53,0.6)] transition-all rounded-full"
            >
              Iniciar jornada
            </Button>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
