import { useEffect } from "react";
import { usePathAwareNavigate } from "@/contexts/PathPrefixContext";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HeroCircle } from "@/components/HeroCircle";
import {
  ArrowRight,
  Users,
  AlertTriangle,
  Brain,
  Clock,
  BatteryLow,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  fadeInUp,
  fadeIn,
  buttonHoverTap,
  staggerContainer,
  staggerItem,
  floatAnimation,
} from "@/hooks/useAnimations";

const spotlightPeople = [
  {
    id: "Lucas",
    name: "Lucas",
    description: "Engenheiro, 27",
    image: "https://i.ibb.co/wNvR7F3m/Gemini-Generated-Image-ut4kzyut4kzyut4k.png",
  },
  {
    id: "Felipe",
    name: "Felipe",
    description: "Pai solo, 35",
    image: "https://i.ibb.co/0pWzqSL6/Gemini-Generated-Image-he7bqrhe7bqrhe7b.png",
  },
  {
    id: "Helena",
    name: "Helena",
    description: "Empreendedora, 29",
    image: "https://i.ibb.co/r2YSQFS2/Gemini-Generated-Image-6u974r6u974r6u97.png",
  },
  {
    id: "Mariana",
    name: "Mariana",
    description: "Designer, 31",
    image: "https://i.ibb.co/nqcNvfhD/Gemini-Generated-Image-7t1mu67t1mu67t1m.png",
  },
  {
    id: "Rafael",
    name: "Rafael",
    description: "Veterano do mercado financeiro",
    image: "https://i.ibb.co/fYnD0RYg/Gemini-Generated-Image-o8l6fto8l6fto8l6.png",
  },
  {
    id: "Bianca",
    name: "Bianca",
    description: "Mãe de gêmeos, 33",
    image: "https://i.ibb.co/qL8BJzRq/Gemini-Generated-Image-ix0fkeix0fkeix0f.png",
  },
];

const DirectIndex = () => {
  const navigate = usePathAwareNavigate();

  // Scroll to top on mount - using requestAnimationFrame to ensure DOM is ready
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations - same visual identity */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-50" />

      {/* Floating decorative elements - anxiety-themed colors */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 rounded-full bg-orange-500/10 blur-2xl"
        {...floatAnimation}
      />
      <motion.div
        className="absolute bottom-40 right-10 w-32 h-32 rounded-full bg-red-500/10 blur-3xl"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-20 w-24 h-24 rounded-full bg-yellow-500/5 blur-2xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
        <motion.div
          className="max-w-4xl w-full text-center space-y-10"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Urgency Badge */}
          <motion.div variants={staggerItem}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold text-sm">Teste de Estresse Mental</span>
            </div>
          </motion.div>

          {/* Hero Circle - Brain/stress themed */}
          <motion.div
            className="flex justify-center"
            variants={staggerItem}
          >
            <HeroCircle
              iconKey="brain"
              color="#F97316"
              animated={true}
              size="lg"
            />
          </motion.div>

          {/* Headline - Urgency copy */}
          <motion.div className="space-y-6" variants={staggerItem}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Sua cabeça não para?
              <span className="block text-orange-400 mt-2">A culpa não é sua.</span>
            </h1>

            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Você vive no piloto automático — obrigações, prazos e preocupações que nunca param.
              </p>
              <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed">
                Acordar cansado, dormir culpado. No meio disso, a pergunta que insiste em voltar:
              </p>
              <p className="text-lg md:text-xl text-foreground font-medium italic">
                "Por que eu ainda não encontro tempo para mim?"
              </p>
            </div>
          </motion.div>

          {/* Pain points mini-list */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 md:gap-6"
            variants={staggerItem}
          >
            {[
              { icon: Brain, text: "Mente acelerada" },
              { icon: Clock, text: "Falta de tempo" },
              { icon: BatteryLow, text: "Energia esgotada" },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <feature.icon className="h-4 w-4 text-orange-400" />
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button - Urgency themed */}
          <motion.div
            className="flex flex-col items-center gap-4"
            variants={staggerItem}
          >
            <motion.div {...buttonHoverTap}>
              <Button
                onClick={() => navigate("/quiz")}
                size="2xl"
                className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
              >
                <span className="font-bold">FAZER O TESTE DE ESTRESSE</span>
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Secondary CTA text */}
            <p className="text-xs text-muted-foreground">
              Grátis • 2 minutos • Descubra seu nível de sobrecarga
            </p>
          </motion.div>

          {/* People carousel */}
          <motion.div
            className="mt-12 space-y-6 text-left"
            variants={staggerItem}
          >
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-orange-400/80">
                Inspirações reais
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
                Gente de carne e osso que decidiu sair do modo sobrevivência
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Cada um deles carregava uma história de esgotamento. Hoje, estão construindo
                rotinas com mais calma, energia e presença.
              </p>
            </div>

            <Carousel
              className="w-full max-w-5xl mx-auto"
              opts={{ align: "start" }}
            >
              <CarouselContent>
                {spotlightPeople.map((person) => (
                  <CarouselItem
                    key={person.id}
                    className="basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <div className="h-full bg-background/80 border border-border/40 rounded-3xl p-6 shadow-lg flex flex-col items-center text-center space-y-4">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden border border-border/50 shadow-inner">
                        <img
                          src={person.image}
                          alt={`Foto de ${person.name}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-foreground">
                          {person.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {person.description}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground/90 leading-relaxed">
                        "Achei que burnout era sobre trabalho demais. Descobri que era sobre
                        <span className="font-semibold text-foreground"> ignorar meu corpo </span>
                        e minha mente."
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default DirectIndex;
