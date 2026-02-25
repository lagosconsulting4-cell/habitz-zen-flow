import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useQuiz } from "../QuizProvider";

export const HeroStep = () => {
  const { nextStep } = useQuiz();

  return (
    <div className="relative w-full h-[100dvh] bg-[#080809] overflow-hidden">

      {/* Background image — 5% zoom via scale */}
      <img
        src="https://i.ibb.co/6L8MPQ8/Gemini-Generated-Image-xe5limxe5limxe5l.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ transform: "scale(1.05)", transformOrigin: "center center" }}
        aria-hidden
      />

      {/* Dark scrim */}
      <div className="absolute inset-0 bg-[#080809]/55 pointer-events-none" />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col h-[100dvh] px-6"
        style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top, 0px))" }}
      >
        {/* Logo + headline */}
        <div className="flex flex-col items-center pt-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <img
              src="https://i.ibb.co/CstYtpdH/meditar.png"
              alt="Bora"
              className="w-10 h-10 object-contain"
            />
          </motion.div>

          <div className="text-center space-y-3 max-w-xs">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-[30px] font-black text-white leading-tight"
            >
              Vire a sua{" "}
              <span className="text-lime-400">melhor versão</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base text-white/75 italic font-light"
            >
              Não é mágica. É ciência
            </motion.p>
          </div>
        </div>

        <div className="flex-1" />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-full max-w-sm mx-auto"
          style={{
            paddingBottom: "max(2rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))",
          }}
        >
          <Button
            size="lg"
            onClick={nextStep}
            className="w-full h-14 text-base font-black uppercase tracking-wide bg-lime-400 hover:bg-lime-500 text-slate-900 shadow-[0_0_30px_rgba(163,230,53,0.5)] hover:shadow-[0_0_45px_rgba(163,230,53,0.7)] transition-all rounded-2xl"
          >
            Iniciar jornada →
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
