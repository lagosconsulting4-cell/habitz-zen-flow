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
  AlertCircle,
  Brain,
  Target,
  Flame,
  Gift,
  BadgeCheck,
  Calendar,
  LineChart,
  Bell,
  Menu,
  X,
  Lock,
  Sun,
  Heart,
  ChevronRight,
  Play,
  Trophy,
  // Ícones para seção "A diferença que o BORA faz"
  Moon,
  Pause,
  Ban,
  Sunrise,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/hooks/useAnimations";
import { QuizModal } from "@/components/quiz/QuizModal";
import { useTracking } from "@/hooks/useTracking";

// ============ DATA ============







const howItWorksNew = [
  {
    title: "Definição de Foco",
    description: "Você escolhe a meta. O algoritmo quebra ela em tarefas pequenas que cabem no seu dia.",
    icon: Target,
    gradient: "from-[#A3E635] to-lime-300",
    bgGlow: "bg-[#A3E635]/20",
  },
  {
    title: "Ajuste Dinâmico",
    description: "Teve um dia ruim? O sistema recalcula a rota para você não quebrar a constância.",
    icon: Brain,
    gradient: "from-[#A3E635] to-lime-400",
    bgGlow: "bg-[#A3E635]/20",
  },
  {
    title: "Visualização de Progresso",
    description: "Acompanhe sua evolução diária para gerar a dopamina que seu cérebro precisa.",
    icon: LineChart,
    gradient: "from-[#A3E635] to-lime-300",
    bgGlow: "bg-[#A3E635]/20",
  },
];

const testimonials = [
  {
    name: "Camila Souza", // woman
    age: 22,
    role: "Fundadora de Startup",
    photo: "https://i.ibb.co/7t5yRpDd/Gemini-Generated-Image-i7pejzi7pejzi7pe.png", // WOMAN_PIC_1
    quote: "Meu negócio decolou depois que comecei a usar o Bora. Antes era só correria e incêndio pra apagar. Agora consigo focar no que realmente importa. Meu faturamento dobrou em 3 meses!",
    rating: 5,
    metric: "Faturamento 2x em 3 meses",
  },
  {
    name: "Lucas Fernandes", // man
    age: 20,
    role: "Estagiário de Marketing",
    photo: "https://i.ibb.co/xtXmcTS3/Gemini-Generated-Image-ixzgp8ixzgp8ixzg.png", // MAN_PIC_1
    quote: "Achava que produtividade era pra 'gente grande', mas o Bora me mostrou que não. Entreguei todos os projetos no prazo e ainda tive tempo pra minha vida social. Me senti um pro!",
    rating: 5,
    metric: "100% de projetos no prazo",
  },
  {
    name: "Ana Clara Lima", // woman
    age: 24,
    role: "Designer Freelancer",
    photo: "https://picsum.photos/seed/woman/150/150", // WOMAN_PIC_2_PLACEHOLDER
    quote: "Chega de procrastinar! O Bora me ajudou a organizar meus clientes, prazos e ainda sobrou tempo pra criar conteúdo pro meu portfólio. Finalmente consigo dar conta de tudo sem virar a noite.",
    rating: 5,
    metric: "Mais clientes, menos stress",
  },
  {
    name: "Pedro Henrique", // man
    age: 19,
    role: "Estudante e Vendedor",
    photo: "https://i.ibb.co/TMPp1Kw1/Gemini-Generated-Image-200v6k200v6k200v.png", // MAN_PIC_2
    quote: "Conciliar faculdade e trabalho era um caos. O Bora me deu um método pra otimizar meu tempo e energia. Agora consigo estudar, trabalhar e ainda ir pra academia sem me sentir esgotado.",
    rating: 5,
    metric: "Equilíbrio vida-estudo-trabalho",
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
    image: "/images/lp/meditacoes_bonus_capa.webp",
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
  const [quizOpen, setQuizOpen] = useState(false);
  const { trackCTA, trackScrollDepth } = useTracking();

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

  // Scroll depth tracking
  useEffect(() => {
    let lastDepth = 0;
    const checkpoints = [25, 50, 75, 100];

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      const nextCheckpoint = checkpoints.find((cp) => cp > lastDepth && scrollPercent >= cp);
      if (nextCheckpoint) {
        lastDepth = nextCheckpoint;
        trackScrollDepth(nextCheckpoint);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [trackScrollDepth]);

  const handleCTA = (location: string) => {
    trackCTA(location);
    setQuizOpen(true);
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
          <a href="#" className="flex items-center">
            <picture>
              <source srcSet="/assets/logo_bora.webp" type="image/webp" />
              <img
                src="/assets/logo_bora.png"
                alt="Bora"
                className="h-10 w-auto"
              />
            </picture>
          </a>

          {/* CTA Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => handleCTA("header")}
              className="bg-[#A3E635] hover:bg-[#A3E635]/90 text-slate-900 font-semibold px-6 py-2 rounded-full shadow-lg shadow-[#A3E635]/25"
            >
              Começar agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 pt-24 pb-16 w-full overflow-hidden bg-white">
        {/* Background - Clean white with subtle green accents */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#A3E635]/5 to-white" />

        {/* Dot pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#A3E635_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15]" />

        {/* Glow orbs with Bora Green */}
        <div className="absolute top-20 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#A3E635]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-[#A3E635]/15 rounded-full blur-[100px]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Text content */}
            <motion.div
              className="text-center lg:text-left space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Badge */}
              

              {/* Title with gradient */}
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-slate-900"
                variants={staggerItem}
              >
                Pare de depender da Motivação.{" "}
                <span className="text-[#A3E635] relative">
                  Automatize a sua disciplina.
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#A3E635]/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0"
                variants={staggerItem}
              >
                O Bora converte suas metas em micro-hábitos automáticos.{" "}
                <strong className="text-slate-900">Uma Jornada Personalizada flexível que se adapta à sua rotina, sem cobrar perfeição.</strong>
              </motion.p>

              {/* Stats cards */}
              <motion.div
                className="pt-4 max-w-xl mx-auto lg:mx-0 space-y-4"
                variants={staggerItem}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                  Por que 92% das rotinas falham?
                </h2>

                <p className="text-slate-600">
                  <strong className="text-slate-900">Porque tentamos mudar tudo de uma vez. Isso gera sobrecarga mental. O Método Bora foca na 'Densidade de Foco': fazer o essencial, todos os dias, até virar automático.</strong>
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div variants={staggerItem} className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleCTA("hero")}
                    size="lg"
                    className="group bg-[#A3E635] hover:bg-[#A3E635]/90 text-slate-900 text-base sm:text-lg px-8 py-6 rounded-full font-bold shadow-xl shadow-[#A3E635]/30"
                  >
                    Calibrar meu Sistema Agora
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                
              </motion.div>
            </motion.div>

            {/* Right side - Static hero mockup */}
            <motion.div
              className="relative flex justify-center lg:justify-end order-first lg:order-last"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            >
              {/* Subtle glow behind mockup */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#A3E635]/15 rounded-full blur-[120px]" />

              <motion.div
                className="relative z-10 w-full flex justify-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <picture>
                  <source srcSet="/images/lp/hero_mockup.webp" type="image/webp" />
                  <img
                    src="/images/lp/hero_mockup.png"
                    alt="Mockup do aplicativo BORA"
                    className="w-[260px] sm:w-[320px] lg:w-[420px] h-auto drop-shadow-2xl"
                  />
                </picture>
              </motion.div>
            </motion.div>
         </div>
       </div>
     </section>

      

      

      
      {/* ============ HOW IT WORKS SECTION ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-[#A3E635] text-slate-900 border-0 shadow-lg shadow-[#A3E635]/30">
              <Zap className="w-3 h-3 mr-1" />
              Como funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              O Loop do Sistema
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Um ciclo de 3 passos para construir consistência.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorksNew.map((step, index) => (
              <motion.div
                key={step.title}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                {/* Glassmorphism card */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-[#A3E635]/30 overflow-hidden">
                  {/* Background glow on hover */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 ${step.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600">
                    {step.description}
                  </p>

                  {/* Animated underline */}
                  <div className={`h-1 w-0 group-hover:w-16 bg-gradient-to-r ${step.gradient} rounded-full mt-6 transition-all duration-500`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Modal */}
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />

      

      

      {/* ============ TESTIMONIALS CAROUSEL ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-white">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-lime-500/10 rounded-full blur-[100px]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-primary to-lime-400 text-white border-0 shadow-lg shadow-primary/25">
              <Users className="hidden md:inline-block w-3 h-3" />
              <span>Mais de 2000 transformações</span>
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Mais de 2000 usuários mudaram a sua vida
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
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-lime-500 to-lime-300 p-0.5 shadow-lg shadow-primary/30">
                          {testimonial.photo ? (
                            <img
                              src={testimonial.photo}
                              alt={`Foto de ${testimonial.name}`}
                              className="w-full h-full rounded-full object-cover border-2 border-white"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary via-lime-500 to-lime-300 flex items-center justify-center">
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
      {/* SECTION REMOVED - Pricing and bonus details will be shown after quiz completion */}
      {/* <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-slate-50">
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
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#A3E635] via-[#84CC16] to-[#4ADE80] border border-[#65A30D] shadow-xl shadow-[#A3E635]/30 mb-6">
              <CheckCircle2 className="w-5 h-5 text-slate-900" />
              <span className="text-slate-900 font-semibold">
                <strong className="text-slate-900 font-black">R$ 805</strong> em valor – Por apenas{" "}
                <strong className="text-slate-900 font-black">11x R$5,17</strong>
              </span>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => handleCTA("bonus")}
                size="lg"
                className="group bg-[#A3E635] hover:bg-[#84CC16] text-slate-900 text-base px-10 py-5 rounded-full font-black shadow-2xl shadow-[#A3E635]/40 border border-transparent"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                GARANTIR MINHA VAGA
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section> */}

      {/* ============ FINAL CTA ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-lime-50/50 via-white to-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#A3E635]/15 rounded-full blur-[120px]" />

        <motion.div
          className="max-w-3xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Descubra onde está o seu <span className="text-[#A3E635]">gargalo.</span>
          </h2>
          <p className="text-slate-600 text-lg mb-8 max-w-xl mx-auto">
            Responda algumas perguntas rápidas sobre sua idade e rotina. Vamos gerar uma Jornada Personalizada Personalizada para destravar sua produtividade.
          </p>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => handleCTA("final_cta")}
              size="lg"
              className="group bg-[#A3E635] text-slate-900 hover:bg-[#A3E635]/90 text-lg px-10 py-7 rounded-full font-bold shadow-2xl shadow-[#A3E635]/40"
            >
              INICIAR ANÁLISE DE ROTINA
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-12 px-4 sm:px-6 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center">
              <picture>
                <source srcSet="/assets/logo_bora.webp" type="image/webp" />
                <img
                  src="/assets/logo_bora.png"
                  alt="Bora"
                  className="h-10 w-auto"
                />
              </picture>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-[#A3E635] transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-[#A3E635] transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-[#A3E635] transition-colors">Contato</a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} BORA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BoraLanding;





