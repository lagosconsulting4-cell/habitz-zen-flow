import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useQuiz } from "../QuizProvider";

export const HeroStep = () => {
  const { nextStep } = useQuiz();

  return (
    <div className="flex flex-col items-center">
      {/* Video Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm mb-8"
      >
        <div className="relative aspect-[9/16] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/quiz-hero.mp4" type="video/mp4" />
            Seu navegador não suporta vídeo HTML5.
          </video>
        </div>
      </motion.div>

      {/* Main Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
          Vamos entender como sua rotina
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          <span className="text-lime-600">realmente funciona hoje</span>
        </h2>
        <p className="text-base text-slate-600 mt-4">
          Sem fórmulas prontas. Sem cobrança.<br/>
          Só algumas perguntas para mapear sua realidade.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="w-full max-w-md mb-2"
      >
        <Button
          size="lg"
          onClick={nextStep}
          className="w-full h-14 text-lg font-bold bg-lime-500 hover:bg-lime-600 text-slate-900"
        >
          Começar agora
        </Button>
      </motion.div>

      {/* Microtexto */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="text-center mb-6"
      >
        <p className="text-sm text-slate-500">
          Leva cerca de 2 minutos • Sem compromisso
        </p>
      </motion.div>

      {/* Login Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        <a
          href="/app/login"
          className="text-sm text-slate-600 hover:text-slate-900 underline"
        >
          Já tem uma conta? Entre Aqui
        </a>
      </motion.div>

      {/* Language Selector (Optional) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="absolute top-4 right-4"
      >
        <button className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
          🇧🇷 PT-BR
        </button>
      </motion.div>
    </div>
  );
};
