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
          src="/images/hero-cover.png"
          alt="Vire a sua melhor versão"
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://images.unsplash.com/photo-1544367563-12123d896589?q=80&w=1080&auto=format&fit=crop";
          }}
        />
        {/* Shadow overlay at bottom to ensure button visibility */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-transparent" />
      </div>

      {/* Content Overlay - Button only */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-auto"
        >
          <Button
            size="lg"
            onClick={nextStep}
            className="w-auto px-10 min-w-[16rem] h-14 text-lg font-bold uppercase tracking-wide bg-lime-400 hover:bg-lime-500 text-slate-900 shadow-[0_0_20px_rgba(163,230,53,0.4)] hover:shadow-[0_0_30px_rgba(163,230,53,0.6)] transition-all rounded-full"
          >
            INICIAR JORNADA
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
