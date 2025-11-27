import React from "react";
import { usePathAwareNavigate } from "@/contexts/PathPrefixContext";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Heart,
  Moon,
  Sun,
  Shield,
  Zap,
  Clock,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/hooks/useAnimations";

const DirectOffer = () => {
  const navigate = usePathAwareNavigate();

  const handleCTA = () => {
    // TODO: Integrate with payment/checkout
    window.location.href = "https://pay.kirvano.com/..."; // Replace with actual payment link
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-50" />

      {/* Glow effects */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-green-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-40 right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
        <motion.div
          className="max-w-3xl w-full space-y-12"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={staggerItem} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
              <Heart className="h-4 w-4" />
              <span className="font-semibold text-sm">Oferta Especial</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div className="text-center space-y-6" variants={staggerItem}>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              Destrave Sua Mente e Encontre a Calma
              <span className="block gradient-text mt-2">
                em Menos de 7 Minutos Por Dia
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A gente viu que a sua <strong className="text-orange-400">CABEÇA TÁ CHEIA</strong>.
              Criamos o único plano que vai te tirar do Buraco da Procrastinação
              e te dar <strong className="text-green-400">Foco e Alívio Sem Esforço</strong>.
            </p>
          </motion.div>

          {/* Timeline Section */}
          <motion.div
            className="bg-muted/30 border border-border/50 rounded-3xl p-8 md:p-10 space-y-8"
            variants={staggerItem}
          >
            <h2 className="text-2xl font-bold text-center">
              Seu Dia com o Sistema BORA
            </h2>

            <div className="space-y-6">
              {/* Morning */}
              <motion.div
                className="flex gap-4 items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border border-orange-500/30 flex items-center justify-center">
                  <Sun className="w-8 h-8 text-orange-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-orange-400">07:00</span>
                    <span className="text-sm text-muted-foreground">Manhã</span>
                  </div>
                  <p className="text-base text-foreground leading-relaxed">
                    Acorde sem <strong>PÂNICO</strong>. Comece o dia com a cabeça
                    focada e em paz.
                  </p>
                </div>
              </motion.div>

              {/* Divider */}
              <div className="relative h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Night */}
              <motion.div
                className="flex gap-4 items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/30 flex items-center justify-center">
                  <Moon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-400">22:00</span>
                    <span className="text-sm text-muted-foreground">Noite</span>
                  </div>
                  <p className="text-base text-foreground leading-relaxed">
                    Durma em <strong>Paz</strong>. A cabeça desliga e você descansa de verdade.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            className="grid md:grid-cols-3 gap-4"
            variants={staggerItem}
          >
            {[
              {
                icon: Shield,
                title: "Método Científico",
                description: "Baseado em neurociência e hábitos sustentáveis",
              },
              {
                icon: Zap,
                title: "Resultados Rápidos",
                description: "Sinta a diferença nos primeiros 7 dias",
              },
              {
                icon: Clock,
                title: "7 Min/Dia",
                description: "Sistema completo em menos de 7 minutos",
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="bg-muted/30 border border-border/50 rounded-2xl p-6 space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-bold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* What's Included */}
          <motion.div
            className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border-2 border-green-500/30 rounded-3xl p-8 space-y-6"
            variants={staggerItem}
          >
            <h3 className="text-xl font-bold text-center">
              O que você recebe:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Sistema completo de organização mental",
                "Rotinas personalizadas para seu perfil",
                "Técnicas de foco e clareza mental",
                "Estratégias de gestão de energia",
                "Suporte para criar hábitos sustentáveis",
                "Acesso vitalício ao app BORA",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Price & CTA */}
          <motion.div
            className="text-center space-y-6"
            variants={staggerItem}
          >
            {/* Price */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Investimento único para transformar sua rotina:
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg text-muted-foreground line-through">
                  R$ 97
                </span>
                <span className="text-5xl font-bold gradient-text">R$ 47</span>
              </div>
              <p className="text-xs text-green-400 font-semibold">
                Oferta por tempo limitado
              </p>
            </div>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleCTA}
                size="2xl"
                className="w-full max-w-md mx-auto bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white shadow-xl shadow-green-500/30 border-2 border-green-400/50"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                <span className="font-bold text-lg">
                  QUERO TIRAR ESSA TRAVA DA MINHA CABEÇA E TER PAZ!
                </span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Pagamento 100% seguro</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Acesso imediato</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-green-400" />
                <span>Garantia de 7 dias</span>
              </div>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            className="text-center space-y-4 pt-8 border-t border-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <p className="text-sm text-muted-foreground">
              Mais de <strong className="text-foreground">5.000 pessoas</strong>{" "}
              já transformaram suas rotinas com o Sistema BORA
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default DirectOffer;
