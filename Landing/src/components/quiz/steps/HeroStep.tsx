import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export const HeroStep = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Video Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl mb-8"
      >
        <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
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
          Tenha uma rotina saudável
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          em apenas <span className="text-lime-600">7 minutos por dia</span>
        </h2>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="w-full max-w-md mb-6"
      >
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold bg-lime-500 hover:bg-lime-600 text-slate-900"
        >
          Iniciar Quiz
        </Button>
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
