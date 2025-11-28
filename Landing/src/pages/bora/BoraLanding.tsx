import React, { useEffect, useState } from "react";
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
  Calendar,
  LineChart,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/hooks/useAnimations";

// ============ DATA ============

const pillars = [
  {
    title: "Simplicidade",
    subtitle: "7 minutos por dia",
    description: "Micro-hábitos que cabem na rotina mais corrida. Sem complicação.",
    icon: Clock,
    gradient: "from-emerald-500 to-teal-500",
    bgGlow: "bg-emerald-500/20",
  },
  {
    title: "Personalização",
    subtitle: "Feito para você",
    description: "Quiz personalizado. Rotina que aprende e se adapta ao seu ritmo.",
    icon: Target,
    gradient: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/20",
  },
  {
    title: "Resultados",
    subtitle: "30 dias de transformação",
    description: "5000+ usuários. 94% mantém consistência. Garantia de 7 dias.",
    icon: Trophy,
    gradient: "from-primary to-emerald-600",
    bgGlow: "bg-primary/20",
  },
];

const features = [
  { icon: Target, title: "Rotina Sob Medida", description: "Criada para seus objetivos", size: "large" },
  { icon: Calendar, title: "Checklists Diários", description: "Simples e práticos", size: "small" },
  { icon: LineChart, title: "Progresso Visual", description: "Veja sua evolução", size: "small" },
  { icon: Bell, title: "Lembretes Inteligentes", description: "No momento certo", size: "medium" },
  { icon: Brain, title: "Adapta ao Seu Ritmo", description: "Reorganiza quando precisa", size: "medium" },
  { icon: Flame, title: "Streaks e Conquistas", description: "Gamificação motivadora", size: "small" },
  { icon: Rocket, title: "Transformação Real", description: "7 min/dia, resultados em 30 dias", size: "large" },
];

const howItWorks = [
  {
    step: "01",
    title: "Faça o Quiz",
    description: "3 minutos para entendermos você",
    image: "/images/lp/mockup-app-vertical.webp",
  },
  {
    step: "02",
    title: "Receba sua Rotina",
    description: "Plano único baseado nos seus objetivos",
    image: "/images/lp/mockup-app-horizontal.webp",
  },
  {
    step: "03",
    title: "Acompanhe seu Progresso",
    description: "7 minutos por dia, resultados em 30 dias",
    image: "/images/lp/mockup-horizontal.webp",
  },
];

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

const BoraLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, []);

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCTA = () => {
    window.location.href = "https://pay.kirvano.com/5dc4f0b1-fc02-490a-863d-dd1c680f1cac";
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full max-w-full font-['Plus_Jakarta_Sans',sans-serif]">

      {/* ============ STICKY HEADER ============ */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">BORA</span>
          </a>

          {/* CTA Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={scrollToPricing}
              className="bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white font-semibold px-6 py-2 rounded-full shadow-lg shadow-primary/25"
            >
              Começar agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 pt-24 pb-16 w-full">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-emerald-50/30" />
        <div className="absolute top-20 right-0 w-48 md:w-[500px] h-48 md:h-[500px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-48 md:w-[400px] h-48 md:h-[400px] bg-emerald-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left side - Text content (7 cols) */}
            <motion.div
              className="lg:col-span-7 text-center lg:text-left space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Badge */}
              <motion.div variants={staggerItem} className="flex justify-center lg:justify-start">
                <Badge className="px-4 py-2 bg-primary/10 text-primary border-primary/20 text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Transforme sua rotina em 30 dias
                </Badge>
              </motion.div>

              {/* Title with gradient */}
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-slate-900"
                variants={staggerItem}
              >
                Sua rotina personalizada{" "}
                <span className="bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
                  em 7 minutos por dia
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0"
                variants={staggerItem}
              >
                Chega de acordar sem energia. Chega de procrastinar.{" "}
                <strong className="text-slate-900">Seu plano personalizado</strong> vai
                te dar clareza e consistência — <strong className="text-primary">ou seu dinheiro de volta</strong>.
              </motion.p>

              {/* Stats */}
              <motion.div
                className="flex flex-wrap justify-center lg:justify-start gap-6 md:gap-10 pt-4"
                variants={staggerItem}
              >
                <div className="text-center">
                  <AnimatedCounter value={7} />
                  <p className="text-sm text-slate-500 mt-1">minutos/dia</p>
                </div>
                <div className="text-center">
                  <AnimatedCounter value={5000} suffix="+" />
                  <p className="text-sm text-slate-500 mt-1">vidas transformadas</p>
                </div>
                <div className="text-center">
                  <AnimatedCounter value={94} suffix="%" />
                  <p className="text-sm text-slate-500 mt-1">mantêm a rotina</p>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div variants={staggerItem} className="pt-4 flex justify-center lg:justify-start">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={scrollToPricing}
                    size="lg"
                    className="group bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white text-base sm:text-lg px-8 py-6 rounded-full font-bold shadow-xl shadow-primary/30"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    QUERO MINHA ROTINA
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right side - App Mockup (5 cols) */}
            <motion.div
              className="lg:col-span-5 relative flex justify-center lg:justify-end order-first lg:order-last"
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
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/20"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -left-4 w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-amber-500/20"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <Flame className="w-7 h-7 text-amber-500" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ 3 PILLARS SECTION ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              Por que funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              O BORA é <span className="text-primary">diferente</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Três pilares que fazem a transformação acontecer
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                {/* Glassmorphism card */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 overflow-hidden">
                  {/* Background glow on hover */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 ${pillar.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                    <pillar.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-primary font-semibold text-sm mb-3">
                    {pillar.subtitle}
                  </p>
                  <p className="text-slate-600">
                    {pillar.description}
                  </p>

                  {/* Animated underline */}
                  <div className={`h-1 w-0 group-hover:w-16 bg-gradient-to-r ${pillar.gradient} rounded-full mt-6 transition-all duration-500`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES BENTO GRID ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-slate-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Rocket className="w-3 h-3 mr-1" />
              Funcionalidades
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              O que o BORA faz <span className="text-primary">por você</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tudo que você precisa para transformar sua rotina
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px]">
            {features.map((feature, index) => {
              const sizeClass = feature.size === "large"
                ? "col-span-2 row-span-2"
                : feature.size === "medium"
                ? "col-span-2 row-span-1"
                : "col-span-1 row-span-1";

              return (
                <motion.div
                  key={feature.title}
                  className={`group relative ${sizeClass}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="h-full bg-white rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 flex flex-col justify-between overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className={`font-bold text-slate-900 mb-2 ${feature.size === "large" ? "text-2xl" : "text-lg"}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-slate-600 ${feature.size === "large" ? "text-base" : "text-sm"}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS CAROUSEL ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Target className="w-3 h-3 mr-1" />
              Passo a passo
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Como <span className="text-primary">funciona</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simples como deveria ser
            </p>
          </motion.div>

          <Carousel opts={{ align: "center", loop: true }} className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {howItWorks.map((step, index) => (
                <CarouselItem key={index} className="md:basis-1/1 lg:basis-1/1">
                  <motion.div
                    className="p-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 md:p-12 border border-slate-200/50 shadow-xl overflow-hidden">
                      {/* Step number */}
                      <div className="absolute top-6 left-6 md:top-8 md:left-8">
                        <span className="text-7xl md:text-9xl font-black text-primary/10">
                          {step.step}
                        </span>
                      </div>

                      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        {/* Image */}
                        <div className="w-full md:w-1/2">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-auto rounded-2xl shadow-xl"
                          />
                        </div>

                        {/* Content */}
                        <div className="w-full md:w-1/2 text-center md:text-left">
                          <Badge className="mb-4 bg-primary text-white border-0">
                            Passo {step.step}
                          </Badge>
                          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                            {step.title}
                          </h3>
                          <p className="text-lg text-slate-600">
                            {step.description}
                          </p>
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

      {/* ============ BEFORE/AFTER SECTION ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white">
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              A diferença que o <span className="text-primary font-extrabold">BORA</span> faz
            </h2>
          </motion.div>

          <Tabs defaultValue="after" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-14 sm:h-16 p-1.5 sm:p-2 bg-slate-200 rounded-2xl border-0">
              <TabsTrigger
                value="before"
                className="text-xs sm:text-base font-semibold rounded-xl h-full transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900"
              >
                <HeartCrack className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Sem o </span>BORA
              </TabsTrigger>
              <TabsTrigger
                value="after"
                className="text-xs sm:text-base font-semibold rounded-xl h-full transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Com o </span>BORA
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="before" className="mt-0">
                <motion.div
                  className="relative rounded-3xl bg-gradient-to-br from-red-50 via-white to-rose-50 border-2 border-red-200 p-6 sm:p-10 overflow-hidden shadow-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-200/50 rounded-full blur-[100px]" />
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {beforeProblems.map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-red-200 shadow-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/30">
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-slate-900 font-medium text-lg pt-2">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>
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
                  className="relative rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-primary/30 p-6 sm:p-10 overflow-hidden shadow-xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-[80px]" />
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {afterBenefits.map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-primary/20 shadow-lg group hover:border-primary/40 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-slate-900 font-medium text-lg pt-2">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>
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

      {/* ============ TESTIMONIALS CAROUSEL ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-white">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]" />

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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
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
                    <div className="relative bg-white rounded-3xl p-8 h-full shadow-xl border border-slate-200 flex flex-col overflow-hidden group hover:border-primary/30 transition-colors">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {testimonial.metric && (
                        <div className="mb-3 relative z-10">
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
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

                      <blockquote className="text-slate-700 leading-relaxed flex-grow mb-6 text-lg relative z-10">
                        "{testimonial.quote}"
                      </blockquote>

                      <div className="flex items-center gap-4 pt-4 border-t border-slate-200 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-emerald-500 to-teal-500 p-0.5 shadow-lg shadow-primary/30">
                          {testimonial.photo ? (
                            <img
                              src={testimonial.photo}
                              alt={`Foto de ${testimonial.name}`}
                              className="w-full h-full rounded-full object-cover border-2 border-white"
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
                          <p className="font-bold text-slate-900 text-lg">
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

      {/* ============ BONUS SECTION ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-slate-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto relative z-10">
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tudo isso por apenas{" "}
              <span className="text-primary font-extrabold">11x de R$5,17</span>
            </h2>
            <div className="flex items-center justify-center gap-3 text-lg sm:text-xl">
              <span className="line-through text-slate-400">R$ 805</span>
              <Badge className="bg-red-500 text-white border-0 text-sm font-bold px-3 py-1 animate-pulse">
                94% OFF
              </Badge>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {bonusItems.map((bonus, index) => (
              <motion.div
                key={bonus.id}
                className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-primary/50 transition-all duration-300 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={bonus.image}
                    alt={bonus.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary text-white border-0 text-[10px] sm:text-xs font-bold px-2 py-0.5">
                      INCLUSO
                    </Badge>
                  </div>
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

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-slate-900 font-medium">
                <strong className="text-primary">R$ 805</strong> em valor → Por apenas{" "}
                <strong className="text-primary">11x R$5,17</strong>
              </span>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={scrollToPricing}
                size="lg"
                className="group bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white text-base px-8 py-4 rounded-full font-bold shadow-xl shadow-primary/30"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                GARANTIR MINHA VAGA
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ FAQ SECTION ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-white">
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <AlertCircle className="w-3 h-3 mr-1" />
              Tire suas dúvidas
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Perguntas <span className="text-primary font-extrabold">frequentes</span>
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
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
                  className="bg-slate-50 rounded-2xl border border-slate-200 px-6 shadow-lg hover:border-primary/20 transition-colors data-[state=open]:border-primary/30 data-[state=open]:shadow-xl data-[state=open]:border-l-4 data-[state=open]:border-l-primary"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5 text-lg text-slate-900">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-5 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============ PRICING SECTION (DARK) ============ */}
      <section id="pricing" className="py-24 px-4 sm:px-6 relative overflow-hidden bg-slate-900">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />

        <div className="max-w-lg mx-auto relative z-10">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-primary to-emerald-500 text-white border-0 shadow-lg shadow-primary/30 text-sm px-4 py-2">
              <Gift className="w-4 h-4 mr-2" />
              Melhor investimento do ano
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Invista em <span className="text-primary">você</span>
            </h2>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-emerald-500 to-primary rounded-[2rem] blur-xl opacity-40 animate-pulse" />

            <div className="relative bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl border-2 border-primary/30 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

              {/* Price display */}
              <div className="text-center mb-8 relative z-10">
                <motion.div
                  className="inline-flex mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 text-xl sm:text-2xl font-black px-6 py-3 shadow-xl shadow-red-500/40">
                    94% OFF
                  </Badge>
                </motion.div>

                <div className="mb-2">
                  <span className="text-slate-400 line-through text-2xl sm:text-3xl">
                    De R$ 805
                  </span>
                </div>

                <div className="relative inline-block mb-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl font-bold text-primary/80 mb-1">11x de</span>
                    <motion.span
                      className="text-6xl sm:text-7xl md:text-8xl font-black bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent"
                      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{ backgroundSize: "200% 200%" }}
                    >
                      R$5,17
                    </motion.span>
                  </div>
                  {/* Glow behind price */}
                  <div className="absolute inset-0 flex items-center justify-center text-6xl sm:text-7xl md:text-8xl font-black text-primary blur-2xl opacity-30">
                    R$5,17
                  </div>
                </div>

                <p className="text-slate-400 text-sm sm:text-base">
                  ou R$47 à vista • <span className="text-primary font-semibold">1 ano de acesso</span>
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-3 mb-8 relative z-10">
                {[
                  "App BORA completo",
                  "Todos os 5 bônus inclusos (R$ 805 em valor)",
                  "1 ano de acesso",
                  "Garantia incondicional de 7 dias",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base text-white">{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.div
                className="relative group mb-6"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-primary via-emerald-500 to-primary rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-all duration-500 animate-pulse" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-emerald-500 to-teal-500 rounded-xl opacity-100" />

                <button
                  onClick={handleCTA}
                  className="relative w-full overflow-hidden bg-gradient-to-r from-primary via-emerald-500 to-primary hover:from-primary/90 hover:via-emerald-500/90 hover:to-primary/90 text-white font-black text-lg sm:text-xl md:text-2xl py-6 md:py-7 px-8 rounded-xl shadow-2xl shadow-primary/50 transition-all duration-300 tracking-wide flex items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7 animate-pulse flex-shrink-0" />
                  <span className="relative z-10">QUERO MINHA ROTINA</span>
                  <ArrowRight className="w-6 h-6 md:w-7 md:h-7 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
                </button>
              </motion.div>

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-3 text-sm text-slate-400 relative z-10">
                <Shield className="w-5 h-5 text-primary" />
                <span>
                  <strong className="text-white">Garantia 7 dias</strong> - 100% do seu dinheiro de volta
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-br from-primary via-emerald-500 to-teal-500">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />

        <motion.div
          className="max-w-3xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Sua transformação começa agora
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Cada dia que passa é um dia a menos na sua transformação. Não deixe para depois.
          </p>

          {/* APP MOCKUP */}
          <motion.div
            className="relative mb-10"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src="/images/lp/mockup-horizontal.webp"
              alt="App BORA - Telas do aplicativo"
              className="w-full max-w-2xl mx-auto h-auto rounded-2xl shadow-2xl"
              loading="lazy"
            />
            <div className="absolute inset-0 -z-10 bg-white/10 blur-3xl opacity-50 scale-110" />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleCTA}
              size="lg"
              className="group bg-white text-primary hover:bg-white/90 text-lg px-10 py-7 rounded-full font-bold shadow-2xl shadow-black/20"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              COMEÇAR POR 11x R$5,17
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Garantia 7 dias</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Acesso imediato</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Resultados rápidos</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-12 px-4 sm:px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BORA</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} BORA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BoraLanding;
