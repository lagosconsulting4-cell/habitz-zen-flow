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
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/40 via-transparent to-[#0A0A0B]/80" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-between min-h-[100dvh] px-6 py-8">

        {/* Logo Bora - Top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full flex justify-center pt-4"
        >
          <div className="w-16 h-16 bg-lime-400/10 rounded-2xl p-3 backdrop-blur-sm">
            <img
              src="https://i.ibb.co/CstYtpdH/meditar.png"
              alt="Bora"
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        {/* Headline - Center */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white leading-tight"
          >
            Vire a sua melhor versão
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="inline-block"
          >
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-2 border-purple-500/50 rounded-lg px-6 py-2 backdrop-blur-sm">
              <p className="text-lg md:text-xl font-semibold text-white italic">
                Não é mágica. É ciência
              </p>
            </div>
          </motion.div>
        </div>

        {/* Universities + CTA - Bottom */}
        <div className="w-full max-w-md space-y-6">
          {/* Universities Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center space-y-4"
          >
            <p className="text-sm text-white/90 font-medium italic px-4">
              Desenvolvido com base em + de 2.847 estudos de universidades como:
            </p>
            <img
              src="https://i.ibb.co/67K16Ttk/Headline-6.png"
              alt="Yale e Stanford"
              className="w-full max-w-[280px] mx-auto h-auto object-contain"
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
              className="w-full h-14 text-lg font-bold uppercase tracking-wide bg-lime-400 hover:bg-lime-500 text-slate-900 shadow-[0_0_20px_rgba(163,230,53,0.4)] hover:shadow-[0_0_30px_rgba(163,230,53,0.6)] transition-all rounded-full"
            >
              Iniciar jornada
            </Button>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
