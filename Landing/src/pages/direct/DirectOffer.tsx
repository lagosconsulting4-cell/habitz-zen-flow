import React, { useEffect } from "react";
import { usePathAwareNavigate } from "@/contexts/PathPrefixContext";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
  Clock,
  Star,
  Users,
  Rocket,
  HeartCrack,
  AlertCircle,
  TrendingDown,
  Brain,
  Target,
  Flame,
  Trophy,
  Gift,
  BadgeCheck,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/hooks/useAnimations";
import { CountdownTimer } from "@/components/CountdownTimer";

// ============ DATA ============

const beforeProblems = [
  { icon: AlertCircle, text: "Acordar sem energia ou motivação" },
  { icon: TrendingDown, text: "Procrastinar tarefas importantes" },
  { icon: Brain, text: "Mente sobrecarregada e ansiosa" },
  { icon: HeartCrack, text: "Dormir com sensação de fracasso" },
];

const afterBenefits = [
  { icon: Zap, text: "Despertar com clareza e energia" },
  { icon: Target, text: "Foco nas prioridades certas" },
  { icon: Flame, text: "Consistência sem esforço" },
  { icon: Trophy, text: "Orgulho real das suas conquistas" },
];

const testimonials = [
  {
    name: "Lucas Mendes",
    age: 28,
    role: "Designer",
    photo: "https://i.ibb.co/xtXmcTS3/Gemini-Generated-Image-ixzgp8ixzgp8ixzg.png",
    quote: "Em 14 dias, passei de acordar às 10h para às 6h30 naturalmente. Minha produtividade aumentou 40% e finalmente entrego projetos no prazo.",
    rating: 5,
    metric: "14 dias para acordar cedo",
  },
  {
    name: "Mariana Costa",
    age: 24,
    role: "Estudante",
    photo: "https://i.ibb.co/TMPp1Kw1/Gemini-Generated-Image-200v6k200v6k200v.png",
    quote: "Completei 21 dias de streak consecutivos! Antes não conseguia manter nada por mais de 3 dias. Passei em 2 concursos estudando só 2h/dia com foco.",
    rating: 5,
    metric: "21 dias de streak",
  },
  {
    name: "Rafael Silva",
    age: 32,
    role: "Empreendedor",
    photo: "https://i.ibb.co/Rkx7XcKT/Gemini-Generated-Image-vy66g8vy66g8vy66.png",
    quote: "Em 30 dias, perdi 4kg e dobrei o faturamento da empresa. O segredo foi ter clareza do que fazer a cada momento do dia.",
    rating: 5,
    metric: "30 dias = -4kg + 2x faturamento",
  },
  {
    name: "Ana Paula",
    age: 29,
    role: "Médica",
    photo: "https://i.ibb.co/7t5yRpDd/Gemini-Generated-Image-i7pejzi7pejzi7pe.png",
    quote: "Mesmo com plantões de 24h, mantenho 87% de consistência nos meus hábitos. O BORA se adapta quando minha rotina muda.",
    rating: 5,
    metric: "87% de consistência",
  },
];

// Consolidated bonus data for "O Que Você Recebe" section
const bonusItems = [
  {
    id: 1,
    title: "Programa 30 Dias",
    subtitle: "Transformação completa",
    value: 297,
    image: "/images/lp/programa_completo_bonus_capa.webp",
  },
  {
    id: 2,
    title: "Jornada Guiada",
    subtitle: "4 semanas de acompanhamento",
    value: 197,
    image: "/images/lp/jornada_guiada_bonus_capa.webp",
  },
  {
    id: 3,
    title: "Meditações & Respiração",
    subtitle: "Acalme sua mente",
    value: 147,
    image: "/images/lp/meditações_bonus_capa.webp",
  },
  {
    id: 4,
    title: "Hub de Livros",
    subtitle: "Biblioteca de desenvolvimento",
    value: 97,
    image: "/images/lp/hub_de_livros_bonus_capa.webp",
  },
  {
    id: 5,
    title: "27 Dicas Práticas",
    subtitle: "Hacks de produtividade",
    value: 67,
    image: "/images/lp/dicas_praticas_hack_bonus_capa.webp",
  },
];

const faqs = [
  {
    question: "Quanto tempo preciso dedicar por dia?",
    answer: "Apenas 7 minutos! Nosso método foi desenhado para se encaixar na rotina mais corrida. São micro-hábitos que geram macro resultados.",
  },
  {
    question: "Funciona mesmo se eu já tentei de tudo?",
    answer: "Sim! O BORA é diferente porque não tenta mudar tudo de uma vez. Começamos com pequenas vitórias que criam momentum para mudanças maiores.",
  },
  {
    question: "E se eu não gostar?",
    answer: "Oferecemos garantia de 7 dias. Se não sentir diferença na sua rotina, devolvemos 100% do seu investimento. Sem perguntas, sem burocracia.",
  },
  {
    question: "Preciso baixar algum app?",
    answer: "Não precisa baixar nada! O BORA funciona direto do seu celular pelo navegador. Você pode salvar na tela inicial como um app e usar offline.",
  },
];

// ============ COMPONENTS ============

const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary"
    >
      {value.toLocaleString()}{suffix}
    </motion.span>
  );
};

// ============ MAIN COMPONENT ============

const DirectOffer = () => {
  const navigate = usePathAwareNavigate();

  // Scroll to top on mount - using requestAnimationFrame to ensure DOM is ready
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, []);

  const handleCTA = () => {
    window.location.href = "https://pay.kirvano.com/5dc4f0b1-fc02-490a-863d-dd1c680f1cac";
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full max-w-full">
      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 md:px-6 py-20 w-full">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 md:w-96 h-48 md:h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Text content */}
            <motion.div
              className="text-center lg:text-left space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Badge */}
              <motion.div variants={staggerItem} className="flex justify-center lg:justify-start">
                <Badge className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30 text-sm animate-pulse">
                  <Clock className="w-4 h-4 mr-2" />
                  Oferta expira em 15 minutos
                </Badge>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
                variants={staggerItem}
              >
                Transforme sua rotina em{" "}
                <span className="text-primary">30 dias</span>
                <br />
                <span className="text-primary">
                  ou seu dinheiro de volta
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0"
                variants={staggerItem}
              >
                Chega de acordar sem energia. Chega de procrastinar.{" "}
                <strong className="text-foreground">Seu plano personalizado</strong> vai
                te dar clareza e consistência em{" "}
                <strong className="text-foreground">apenas 7 minutos por dia</strong>.
              </motion.p>

              {/* Stats */}
              <motion.div
                className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-8 pt-4"
                variants={staggerItem}
              >
                <div className="text-center">
                  <AnimatedCounter value={7} />
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">minutos/dia</p>
                </div>
                <div className="text-center">
                  <AnimatedCounter value={5000} suffix="+" />
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">vidas transformadas</p>
                </div>
                <div className="text-center">
                  <AnimatedCounter value={94} suffix="%" />
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">mantêm a rotina</p>
                </div>
              </motion.div>

              {/* Countdown Timer */}
              <motion.div variants={staggerItem} className="pt-2">
                <CountdownTimer variant="hero" />
              </motion.div>

              {/* CTA */}
              <motion.div variants={staggerItem} className="pt-2 flex justify-center lg:justify-start">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                    variant="premium"
                    size="lg"
                    className="group w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4 font-bold"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    QUERO MINHA ROTINA
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right side - App Mockup */}
            <motion.div
              className="relative flex justify-center lg:justify-end order-first lg:order-last"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            >
              {/* Glow effect behind mockup */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-emerald-500/20 to-transparent rounded-full blur-[80px] scale-75" />

              {/* Mockup image */}
              <motion.img
                src="/images/lp/mockup-app-vertical.webp"
                alt="App BORA - Mockup"
                className="relative z-10 w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[380px] h-auto drop-shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ BEFORE/AFTER SECTION ============ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-primary to-emerald-500 text-white border-0 shadow-lg shadow-primary/25">
              <Zap className="w-3 h-3 mr-1" />
              Transformação garantida
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              A diferença que o <span className="text-primary font-extrabold">BORA</span> faz
            </h2>
          </motion.div>

          <Tabs defaultValue="after" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-14 sm:h-16 p-1.5 sm:p-2 bg-zinc-800/80 rounded-2xl border-0">
              <TabsTrigger
                value="before"
                className="text-xs sm:text-base font-semibold rounded-xl h-full transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:!bg-gradient-to-r data-[state=active]:!from-red-500 data-[state=active]:!to-rose-500 data-[state=active]:!text-white data-[state=active]:!shadow-none data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-white"
              >
                <HeartCrack className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Sem o </span>BORA
              </TabsTrigger>
              <TabsTrigger
                value="after"
                className="text-xs sm:text-base font-semibold rounded-xl h-full transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:!bg-gradient-to-r data-[state=active]:!from-emerald-500 data-[state=active]:!to-teal-500 data-[state=active]:!text-white data-[state=active]:!shadow-none data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-white"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Com o </span>BORA
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="before" className="mt-0">
                <motion.div
                  className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-red-500/10 via-card to-rose-500/10 border-2 border-red-500/30 p-4 sm:p-8 md:p-12 overflow-hidden shadow-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[100px]" />
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 relative z-10">
                    {/* Problems grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                      {beforeProblems.map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-card to-red-500/5 border border-red-500/20 shadow-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/30">
                            <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <span className="text-foreground font-medium text-sm sm:text-lg pt-1 sm:pt-2">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Character illustration */}
                    <motion.div
                      className="hidden md:flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <img
                        src="/images/lp/personagem_triste.webp"
                        alt="Pessoa estressada"
                        className="w-40 lg:w-48 h-auto drop-shadow-lg"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="after" className="mt-0">
                <motion.div
                  className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/10 via-card to-emerald-500/10 border-2 border-primary/30 p-4 sm:p-8 md:p-12 overflow-hidden shadow-xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-[80px]" />
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 relative z-10">
                    {/* Benefits grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                      {afterBenefits.map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-card to-primary/5 border border-primary/20 shadow-lg group hover:border-primary/40 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                            <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <span className="text-foreground font-medium text-sm sm:text-lg pt-1 sm:pt-2">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Character illustration - meditating */}
                    <motion.div
                      className="hidden md:flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <img
                        src="/images/lp/meditação_personagem.webp"
                        alt="Pessoa em paz meditando"
                        className="w-40 lg:w-48 h-auto drop-shadow-lg"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </section>

      {/* ============ O QUE VOCÊ RECEBE - CONSOLIDATED ============ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Background neutro escuro */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-muted/30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header com valor total BEM VISÍVEL */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/30">
              <Gift className="w-3 h-3 mr-1" />
              Pacote Completo
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo isso por apenas{" "}
              <span className="text-primary font-extrabold">11x de R$5,17</span>
            </h2>
            <div className="flex items-center justify-center gap-3 text-lg sm:text-xl">
              <span className="line-through text-muted-foreground">R$ 805</span>
              <Badge className="bg-red-500 text-white border-0 text-sm font-bold px-3 py-1 animate-pulse">
                94% OFF
              </Badge>
            </div>
          </motion.div>

          {/* Grid de bônus com capas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
            {bonusItems.map((bonus, index) => (
              <motion.div
                key={bonus.id}
                className="group relative rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Imagem da capa */}
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={bonus.image}
                    alt={bonus.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badge "INCLUSO" */}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary text-white border-0 text-[10px] sm:text-xs font-bold px-2 py-0.5">
                      INCLUSO
                    </Badge>
                  </div>

                  {/* Info no bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm sm:text-base leading-tight mb-1">
                      {bonus.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-xs line-through">
                        R$ {bonus.value}
                      </span>
                      <span className="text-primary text-xs font-bold">
                        GRÁTIS
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Valor total e CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">
                <strong className="text-primary">R$ 805</strong> em valor → Por apenas{" "}
                <strong className="text-primary">11x R$5,17</strong>
              </span>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                variant="premium"
                size="lg"
                className="group text-base px-8 py-4 font-bold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                GARANTIR MINHA VAGA
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ TESTIMONIALS CAROUSEL ============ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-emerald-500/5 to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-primary to-emerald-500 text-white border-0 shadow-lg shadow-primary/25">
              <Users className="w-3 h-3 mr-1" />
              Histórias reais
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Quem já <span className="text-primary font-extrabold">virou o jogo</span>
            </h2>
          </motion.div>

          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/2">
                  <motion.div
                    className="h-full"
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="relative bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl p-8 h-full shadow-xl border border-primary/20 flex flex-col overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {testimonial.metric && (
                        <div className="mb-3 relative z-10">
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-semibold">
                            <BadgeCheck className="w-3 h-3 mr-1" />
                            {testimonial.metric}
                          </Badge>
                        </div>
                      )}

                      <div className="flex gap-1 mb-4 relative z-10">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 text-amber-400"
                            fill={i < testimonial.rating ? "#fbbf24" : "transparent"}
                            strokeWidth={i < testimonial.rating ? 0 : 1.5}
                          />
                        ))}
                      </div>

                      <blockquote className="text-foreground leading-relaxed flex-grow mb-6 text-lg relative z-10">
                        "{testimonial.quote}"
                      </blockquote>

                      <div className="flex items-center gap-4 pt-4 border-t border-primary/10 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-emerald-500 to-teal-500 p-0.5 shadow-lg shadow-primary/30">
                          {testimonial.photo ? (
                            <img
                              src={testimonial.photo}
                              alt={`Foto de ${testimonial.name}`}
                              className="w-full h-full rounded-full object-cover border border-white/20"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary via-emerald-500 to-teal-500 flex items-center justify-center">
                              <span className="text-white font-bold text-xl">
                                {testimonial.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-lg">
                            {testimonial.name}, {testimonial.age}
                          </p>
                          <p className="text-sm text-primary font-medium">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-8">
              <CarouselPrevious className="static translate-y-0 bg-primary/10 border-primary/20 hover:bg-primary hover:text-white" />
              <CarouselNext className="static translate-y-0 bg-primary/10 border-primary/20 hover:bg-primary hover:text-white" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* ============ FAQ SECTION ============ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />

        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-primary to-emerald-500 text-white border-0 shadow-lg shadow-primary/25">
              <AlertCircle className="w-3 h-3 mr-1" />
              Tire suas dúvidas
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Perguntas <span className="text-primary font-extrabold">frequentes</span>
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <AccordionItem
                  value={`faq-${index}`}
                  className="bg-gradient-to-br from-card to-primary/5 rounded-xl sm:rounded-2xl border border-primary/10 px-4 sm:px-6 shadow-lg hover:border-primary/20 transition-colors data-[state=open]:border-primary/30 data-[state=open]:shadow-xl"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-4 sm:py-5 text-sm sm:text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 sm:pb-5 text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============ PRICING SECTION ============ */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Background laranja/dourado para destacar conversão */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/15 rounded-full blur-[150px]" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px]" />

        <div className="max-w-lg mx-auto relative z-10">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/30 text-sm px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              Oferta por tempo limitado
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Garanta sua <span className="text-amber-500 font-extrabold">vaga agora</span>
            </h2>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            {/* Glow dourado pulsante */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-[2rem] blur-xl opacity-50 animate-pulse" />

            <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl border-2 border-amber-500/40 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />

              {/* Timer */}
              <div className="mb-6">
                <CountdownTimer variant="pricing" />
              </div>

              {/* MEGA DESCONTO - Destacado */}
              <div className="text-center mb-6 relative z-10">
                {/* Badge 94% OFF gigante */}
                <motion.div
                  className="inline-flex mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 text-xl sm:text-2xl font-black px-6 py-3 shadow-xl shadow-red-500/40">
                    94% OFF
                  </Badge>
                </motion.div>

                {/* Preço antigo riscado */}
                <div className="mb-2">
                  <span className="text-muted-foreground line-through text-2xl sm:text-3xl">
                    De R$ 805
                  </span>
                </div>

                {/* Preço novo MEGA destaque */}
                <div className="relative inline-block mb-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl font-bold text-amber-400/80 mb-1">11x de</span>
                    <motion.span
                      className="text-6xl sm:text-7xl md:text-8xl font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
                      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{ backgroundSize: "200% 200%" }}
                    >
                      R$5,17
                    </motion.span>
                  </div>
                  {/* Glow atrás do preço */}
                  <div className="absolute inset-0 flex items-center justify-center text-6xl sm:text-7xl md:text-8xl font-black text-amber-400 blur-2xl opacity-40">
                    R$5,17
                  </div>
                </div>

                <p className="text-muted-foreground text-sm sm:text-base">
                  ou R$47 à vista • <span className="text-amber-400 font-semibold">1 ano de acesso</span>
                </p>
              </div>

              {/* Checklist compacto */}
              <div className="space-y-2 mb-6 relative z-10">
                {[
                  "App BORA completo",
                  "Todos os 5 bônus inclusos (R$ 805 em valor)",
                  "1 ano de acesso",
                  "Garantia 7 dias",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button - Laranja/Dourado */}
              <motion.div
                className="relative group mb-6"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-xl opacity-100" />

                <button
                  onClick={handleCTA}
                  className="relative w-full overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:via-orange-400 hover:to-amber-400 text-white font-black text-base sm:text-xl md:text-2xl py-5 sm:py-6 md:py-7 px-6 sm:px-8 rounded-xl shadow-2xl shadow-orange-500/50 transition-all duration-300 tracking-wide flex items-center justify-center gap-2 sm:gap-3"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 animate-pulse flex-shrink-0" />
                  <span className="relative z-10">QUERO MINHA ROTINA</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
                </button>
              </motion.div>

              {/* Garantia dentro do card */}
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground relative z-10">
                <Shield className="w-5 h-5 text-primary" />
                <span>
                  <strong className="text-foreground">Garantia 7 dias</strong> - 100% do seu dinheiro de volta
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FINAL CTA - Simplificado ============ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Não deixe para depois
          </h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">
            Cada dia que passa é um dia a menos na sua transformação.
          </p>

          {/* APP MOCKUP */}
          <motion.div
            className="relative mb-8"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src="/images/lp/mockup-horizontal.webp"
              alt="App BORA - Telas do aplicativo"
              className="w-full h-auto rounded-2xl"
              loading="lazy"
            />
            {/* Glow effect behind mockup */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 via-emerald-500/20 to-primary/20 blur-3xl opacity-50 scale-110" />
          </motion.div>

          {/* CTA Button - Mobile optimized */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleCTA}
              variant="premium"
              size="lg"
              className="group w-full sm:w-auto text-sm sm:text-lg px-6 sm:px-8 py-5 font-bold flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">COMEÇAR POR 11x R$5,17</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-muted-foreground text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Garantia 7 dias</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Acesso imediato</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Resultados rápidos</span>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default DirectOffer;
