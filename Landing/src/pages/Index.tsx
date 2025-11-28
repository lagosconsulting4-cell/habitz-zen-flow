import { useEffect } from "react";
import { usePathAwareNavigate } from "@/contexts/PathPrefixContext";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HeroCircle } from "@/components/HeroCircle";
import {
  ArrowRight,
  Users,
  Sparkles,
  CheckCircle,
  Target,
  Zap,
} from "lucide-react";
import {
  fadeInUp,
  fadeIn,
  buttonHoverTap,
  staggerContainer,
  staggerItem,
  floatAnimation,
} from "@/hooks/useAnimations";

const Index = () => {
  const navigate = usePathAwareNavigate();

  // Scroll to top on mount - using requestAnimationFrame to ensure DOM is ready
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-50" />

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/5 blur-2xl"
        {...floatAnimation}
      />
      <motion.div
        className="absolute bottom-40 right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
        <motion.div
          className="max-w-4xl w-full text-center space-y-10"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={staggerItem}>
            <div className="badge-glow inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-sm">App BORA</span>
            </div>
          </motion.div>

          {/* Hero Circle - Interactive preview */}
          <motion.div
            className="flex justify-center"
            variants={staggerItem}
          >
            <HeroCircle
              iconKey="target"
              color="#A3E635"
              animated={true}
              size="lg"
            />
          </motion.div>

          {/* Headline */}
          <motion.div className="space-y-4" variants={staggerItem}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Pare de prometer.
              <span className="block gradient-text mt-2">Comece a fazer.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Descubra em 2 minutos por que você não consegue manter uma rotina — e como mudar isso de verdade.
            </p>
          </motion.div>

          {/* Features mini-list */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 md:gap-6"
            variants={staggerItem}
          >
            {[
              { icon: Target, text: "Rotina personalizada" },
              { icon: Zap, text: "Resultados rápidos" },
              { icon: CheckCircle, text: "Método comprovado" },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                className="flex items-center gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <feature.icon className="h-4 w-4 text-primary" />
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="flex flex-col items-center gap-4"
            variants={staggerItem}
          >
            <motion.div {...buttonHoverTap}>
              <Button
                onClick={() => navigate("/quiz")}
                variant="premium"
                size="2xl"
                className="group animate-pulse-glow"
              >
                <span>Descobrir agora</span>
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Secondary CTA text */}
            <p className="text-xs text-muted-foreground">
              Grátis • 2 minutos • Sem cadastro
            </p>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="pt-8 border-t border-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Avatar stack */}
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-background flex items-center justify-center"
                  >
                    <span className="text-xs font-bold text-primary/70">
                      {String.fromCharCode(64 + i)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>
                  <strong className="text-foreground">+5.000</strong> pessoas já
                  viraram o jogo
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default Index;
