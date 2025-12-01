import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransicaoScreenProps {
  onContinue: () => void;
}

const transitionPreviewImages = {
  before: "/images/mirror/bruno-falci-10.webp",
  after: "/images/mirror/feliz.webp",
};

const TransicaoScreen: React.FC<TransicaoScreenProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-950/10 to-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background light rays */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-purple-500/20 via-transparent to-transparent blur-3xl" />
      </motion.div>

      <motion.div
        className="max-w-md w-full text-center space-y-6 sm:space-y-8 relative z-10 pt-16 sm:pt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Transition icon */}
        <motion.div
          className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1, delay: 0.2 }}
        >
          {/* Glowing background */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 via-blue-500/20 to-green-500/30 blur-xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* Icon container */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-green-500/20 border-2 border-purple-500/40">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400" />
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Heart className="w-4 h-4" />
          <span className="font-semibold text-sm">Momento de Transição</span>
        </motion.div>

        {/* Title */}
        <motion.div
          className="space-y-2 sm:space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            E se fosse diferente?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Você acabou de ver como está vivendo.
            <br />
            Agora veja como <span className="text-purple-400 font-semibold">poderia</span> ser.
          </p>
        </motion.div>

        {/* Divider with gradient */}
        <motion.div
          className="relative h-px"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        </motion.div>

        {/* Message */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="text-base text-foreground leading-relaxed">
            Os mesmos 8 momentos do seu dia.
            <br />
            Mas com uma escolha diferente em cada um deles.
          </p>
          <p className="text-sm text-muted-foreground">
            A diferença entre viver no caos e viver em paz está em pequenas
            mudanças — não em revoluções impossíveis.
          </p>
        </motion.div>

        {/* Transformation preview */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-2">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-background/40 border border-red-500/30 overflow-hidden flex items-center justify-center">
              <img
                src={transitionPreviewImages.before}
                alt="Seu estado atual"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="text-xs text-red-400 font-semibold text-center uppercase tracking-wide">
              ANTES
            </div>
            <div className="text-xs text-muted-foreground text-center">Estresse: 150%</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-2">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-background/40 border border-green-500/30 overflow-hidden flex items-center justify-center">
              <img
                src={transitionPreviewImages.after}
                alt="Seu novo dia"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="text-xs text-green-400 font-semibold text-center uppercase tracking-wide">
              DEPOIS
            </div>
            <div className="text-xs text-muted-foreground text-center">Estresse: 12%</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 hover:from-purple-600 hover:via-blue-600 hover:to-green-600 text-white shadow-lg shadow-purple-500/25"
          >
            <span className="font-semibold">Ver Meu Novo Caminho</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TransicaoScreen;
