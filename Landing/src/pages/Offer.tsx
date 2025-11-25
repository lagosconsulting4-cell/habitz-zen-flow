import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { TestimonialCard } from "@/components/premium/TestimonialCard";
import { FeatureCard } from "@/components/premium/FeatureCard";
import SiriOrb from "@/components/smoothui/siri-orb";
import {
  Sun,
  Target,
  Zap,
  Moon,
  CheckCircle,
  BarChart3,
  Rocket,
  Unlock,
  Users,
  Clock,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  fadeInUp,
  buttonHoverTap,
  staggerContainer,
  staggerItem,
  springTransition,
} from "@/hooks/useAnimations";

interface Testimonial {
  name: string;
  age: number;
  role: string;
  before: string;
  after: string;
}

interface RoutineItem {
  icon: LucideIcon;
  text: string;
}

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Lucas Mendes",
    age: 28,
    role: "Designer",
    before: "Vivia prometendo começar e nunca conseguia.",
    after:
      "O BORA foi o único que me fez manter uma rotina sem me sentir sobrecarregado.",
  },
  {
    name: "Mariana Costa",
    age: 24,
    role: "Estudante",
    before: "Acordava sem propósito e dormia frustrada.",
    after: "Em 7 dias, já tava dormindo melhor e focando mais.",
  },
  {
    name: "Rafael Silva",
    age: 32,
    role: "Empreendedor",
    before: "Sentia que estava estagnado há anos.",
    after: "Finalmente tenho clareza do que fazer todos os dias. Virei o jogo.",
  },
];

const routineItems: RoutineItem[] = [
  { icon: Sun, text: "Acordar com propósito e energia" },
  { icon: Target, text: "3 hábitos de alto impacto" },
  { icon: Zap, text: "Foco absoluto durante o dia" },
  { icon: Moon, text: "Reflexão e encerramento consciente" },
];

const benefits: Benefit[] = [
  {
    icon: Target,
    title: "Rotina sob medida",
    description: "Personalizada para seu objetivo real",
  },
  {
    icon: CheckCircle,
    title: "Checklists diários",
    description: "Simples e práticos de seguir",
  },
  {
    icon: BarChart3,
    title: "Acompanhamento visual",
    description: "Veja seu progresso crescer",
  },
  {
    icon: Rocket,
    title: "Transformação real",
    description: "Sem teoria, só execução",
  },
];

const playClickSound = () => {
  const audio = new Audio(
    "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PWKzn7aVXFAxTqOXzu2sfBTCA0fTRfi4GIG/B7uSaRw0QWrTn7aRXFAxRqOPyu2wcBi+A0vPSgDEGH2/B7uOaSQ0PXLbn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVX"
  );
  audio.play().catch(() => {});
};

const Offer = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-30" />

      {/* SiriOrb decorative elements */}
      <div className="absolute top-20 -right-40 opacity-15 pointer-events-none blur-sm">
        <SiriOrb
          size="450px"
          colors={{
            bg: "oklch(10% 0.01 120)",
            c1: "oklch(72% 0.18 125)",
            c2: "oklch(68% 0.15 130)",
            c3: "oklch(75% 0.12 118)",
          }}
          animationDuration={30}
        />
      </div>
      <div className="absolute bottom-40 -left-48 opacity-10 pointer-events-none blur-md">
        <SiriOrb
          size="550px"
          colors={{
            bg: "oklch(10% 0.01 120)",
            c1: "oklch(65% 0.14 128)",
            c2: "oklch(70% 0.12 122)",
            c3: "oklch(60% 0.10 135)",
          }}
          animationDuration={40}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 space-y-20">
        {/* Hero Section */}
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="badge-glow inline-flex"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={springTransition}
          >
            <CheckCircle className="h-4 w-4" />
            <span className="font-semibold text-sm">Sua rotina está pronta</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Em menos de 7 minutos por dia,
            <span className="block gradient-text mt-2">você vira o jogo</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Baseado nas suas respostas, montamos um plano personalizado para
            você{" "}
            <strong className="text-foreground">sair da estagnação</strong> e
            criar <strong className="text-foreground">consistência real</strong>
            .
          </p>
        </motion.div>

        {/* Routine Preview */}
        <motion.div
          className="glass-card p-8 md:p-12 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <div className="icon-container icon-container-lg mx-auto mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Sua rotina personalizada
            </h2>
          </div>

          <motion.div
            className="grid md:grid-cols-2 gap-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {routineItems.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <motion.div
                  key={index}
                  className="feature-card"
                  variants={staggerItem}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="icon-container icon-container-md">
                      <ItemIcon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-lg font-semibold">{item.text}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground pt-4">
            <Clock className="h-4 w-4 text-primary" />
            <span>Cada passo leva menos de 2 minutos</span>
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="space-y-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="icon-container icon-container-lg mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Quem já virou o jogo
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={`${testimonial.name}, ${testimonial.age}`}
                role={testimonial.role}
                quote={testimonial.after}
                beforeAfter={{
                  before: testimonial.before,
                  after: testimonial.after,
                }}
                rating={5}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Benefits */}
        <motion.div
          className="rounded-3xl bg-primary p-8 md:p-12 space-y-8"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              O que você vai ter no BORA
            </h2>
          </div>

          <motion.div
            className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-start gap-4"
                  variants={staggerItem}
                  whileHover={{ x: 4 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <BenefitIcon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-primary-foreground/70 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="text-center space-y-8 py-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Sua nova rotina está pronta
              <span className="block gradient-text mt-2">
                para começar agora.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Desbloqueie o acesso ao BORA e{" "}
              <strong className="text-foreground">vire o jogo</strong> em menos
              de 7 minutos por dia.
            </p>
          </div>

          {/* CTA Button */}
          <motion.div {...buttonHoverTap}>
            <Button
              onClick={playClickSound}
              variant="premium"
              size="2xl"
              className="group animate-pulse-glow w-full md:w-auto"
            >
              <Unlock className="h-6 w-6 mr-2" />
              <span>Desbloquear agora</span>
              <Sparkles className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>
                <strong className="text-foreground">+5.000</strong> pessoas já
                transformaram suas vidas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Garantia de satisfação</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Offer;
