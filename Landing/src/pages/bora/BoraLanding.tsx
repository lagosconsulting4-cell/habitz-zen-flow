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

const pillars = [
  {
    title: "Simplicidade",
    subtitle: "7 minutos por dia",
    description: "Abre o app. Segue o plano. Pronto. Funciona automático.",
    icon: Zap,
    gradient: "from-[#A3E635] to-lime-300",
    bgGlow: "bg-[#A3E635]/20",
  },
  {
    title: "Personalização",
    subtitle: "Feito para você",
    description: "Rotina do seu jeito. Se adapta sozinha ao seu tempo e energia.",
    icon: Brain,
    gradient: "from-[#A3E635] to-lime-400",
    bgGlow: "bg-[#A3E635]/20",
  },
  {
    title: "Resultados",
    subtitle: "30 dias de transformação",
    description: "Foco volta. Energia aumenta. Sono melhora. 5000+ já mudaram.",
    icon: Flame,
    gradient: "from-[#A3E635] to-lime-300",
    bgGlow: "bg-[#A3E635]/20",
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
    description: "3 minutos para entendermos você em detalhes",
    image: "/images/lp/quiz_mockup.png",
  },
  {
    step: "02",
    title: "Receba sua rotina",
    description: "Plano único baseado nos seus objetivos e limites",
    image: "/images/lp/quiz_mockup.png",
  },
  {
    step: "03",
    title: "Se organize de forma fácil e prática",
    description: "Agenda visual e cards de ação para clarear seu dia",
    image: "/images/lp/dashboard_mockup.png",
  },
  {
    step: "04",
    title: "Acompanhe seu progresso",
    description: "Gráficos e streaks para manter a consistência sem esforço",
    image: "/images/lp/progresso_mockup.png",
  },
];

const beforeProblems: { icon: LucideIcon; text: string }[] = [
  {
    icon: Moon,
    text: "Acordar sem energia ou motivação",
  },
  {
    icon: Clock,
    text: "Procrastinar tarefas importantes",
  },
  {
    icon: Pause,
    text: "Mente sobrecarregada e ansiosa",
  },
  {
    icon: Ban,
    text: "Dormir com sensação de fracasso",
  },
];

const afterBenefits: { icon: LucideIcon; text: string }[] = [
  {
    icon: Sunrise,
    text: "Despertar com clareza e energia",
  },
  {
    icon: Target,
    text: "Foco nas prioridades certas",
  },
  {
    icon: ListChecks,
    text: "Consistência sem esforço",
  },
  {
    icon: Heart,
    text: "Orgulho real das suas conquistas",
  },
];

const testimonials = [
  {
    name: "João Silva",
    age: 23,
    role: "Estudante de Concurso",
    photo: "https://i.ibb.co/xtXmcTS3/Gemini-Generated-Image-ixzgp8ixzgp8ixzg.png",
    quote: "Passei em 2 concursos estudando apenas 2h/dia com foco total. O BORA me ensinou a eliminar distrações e criar uma rotina que funciona mesmo cansado do trabalho.",
    rating: 5,
    metric: "2 aprovações em concursos",
  },
  {
    name: "Matheus Costa",
    age: 21,
    role: "Estudante de Engenharia",
    photo: "https://i.ibb.co/TMPp1Kw1/Gemini-Generated-Image-200v6k200v6k200v.png",
    quote: "Melhorei meu foco nos estudos e passei no vestibular que eu queria. Antes eu procrastinava jogando o dia todo, agora consigo equilibrar estudo e lazer sem culpa.",
    rating: 5,
    metric: "Aprovado no vestibular",
  },
  {
    name: "Thiago Oliveira",
    age: 26,
    role: "Desenvolvedor",
    photo: "https://i.ibb.co/Rkx7XcKT/Gemini-Generated-Image-vy66g8vy66g8vy66.png",
    quote: "Consegui conciliar trampo CLT, academia 5x/semana e ainda sobra tempo pra games. Perdi 7kg em 2 meses sem sacrificar nada. Foco é tudo.",
    rating: 5,
    metric: "7kg perdidos + rotina equilibrada",
  },
  {
    name: "Ana Paula",
    age: 29,
    role: "Médica",
    photo: "https://i.ibb.co/7t5yRpDd/Gemini-Generated-Image-i7pejzi7pejzi7pe.png",
    quote: "Mesmo com plantões de 24h, mantenho 87% de consistência nos meus hábitos. O BORA se adapta quando minha rotina muda e me ajuda a cuidar da saúde mental.",
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

const faqs = [
  {
    question: "Quanto tempo preciso dedicar por dia?",
    answer: "De 5 a 15 minutos na média. O app se adapta ao SEU tempo disponível. Se você disse que tem 5 minutos, vai receber só hábitos de 5 minutos. Sem forçar.",
  },
  {
    question: "Funciona mesmo se eu já tentei de tudo?",
    answer: "Sim! O BORA é diferente porque funciona automático. Você não precisa 'aprender' nada ou fazer esforço. Só seguir o que o app manda. Simples assim.",
  },
  {
    question: "E se eu não gostar?",
    answer: "Tem garantia de 7 dias. Não curtiu? Pega o dinheiro de volta. Sem enrolação, sem perguntas.",
  },
  {
    question: "Preciso baixar algum app?",
    answer: "Não precisa baixar nada! Funciona direto no navegador do seu celular. Salva na tela inicial e usa como app. Offline e tudo.",
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

  const totalHowItWorksSteps = howItWorks.length;
  const formattedTotalHowItWorksSteps = totalHowItWorksSteps.toString().padStart(2, "0");

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
              <motion.div variants={staggerItem} className="flex justify-center lg:justify-start">
                <Badge className="px-4 py-2 bg-[#A3E635] text-slate-900 border-0 text-sm font-semibold shadow-lg shadow-[#A3E635]/30">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Transforme sua rotina em 30 dias
                </Badge>
              </motion.div>

              {/* Title with gradient */}
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-slate-900"
                variants={staggerItem}
              >
                Pare de se sentir sufocado.{" "}
                <span className="text-[#A3E635] relative">
                  Foco e energia voltam em 7 minutos
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#A3E635]/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0"
                variants={staggerItem}
              >
                Sem esforço. Sem complicação.{" "}
                <strong className="text-slate-900">Só abrir o app e seguir.</strong>{" "}
                7 minutos que mudam seu dia inteiro.{" "}
                <span className="block mt-2 text-base md:text-lg">
                  Funciona mesmo se você tem <strong className="text-[#A3E635]">só 5 minutos</strong> livres. Zero pressão.
                </span>
              </motion.p>

              {/* Stats with Bora Green */}
              <motion.div
                className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4"
                variants={staggerItem}
              >
                {[
                  { value: 7, label: "minutos/dia" },
                  { value: 5000, suffix: "+", label: "vidas transformadas" },
                  { value: 94, suffix: "%", label: "mantêm a rotina" },
                ].map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#A3E635]">
                      {stat.value.toLocaleString()}{stat.suffix || ""}
                    </span>
                    <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div variants={staggerItem} className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleCTA("hero")}
                    size="lg"
                    className="group bg-[#A3E635] hover:bg-[#A3E635]/90 text-slate-900 text-base sm:text-lg px-8 py-6 rounded-full font-bold shadow-xl shadow-[#A3E635]/30"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    QUERO MINHA ROTINA
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#A3E635]" />
                  Garantia de 7 dias
                </p>
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

      {/* ============ 3 PILLARS SECTION ============ */}
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
              Por que funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              O BORA é <span className="text-[#A3E635]">diferente</span>
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
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-[#A3E635]/30 overflow-hidden">
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

      {/* ============ DAILY TIMELINE SECTION ============ */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white">
        {/* Background subtle effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#A3E635]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#A3E635]/5 rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-[#A3E635] text-slate-900 border-0 shadow-lg shadow-[#A3E635]/30">
              <Clock className="w-3 h-3 mr-1" />
              Um dia usando o BORA
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Sua jornada de <span className="text-[#A3E635]">transformação</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Veja como 7 minutos por dia mudam tudo
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Central line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#A3E635]/20 via-[#A3E635] to-[#A3E635]/20 hidden md:block" />

            {/* Timeline items */}
            {[
              {
                time: "06:00",
                title: "Despertar",
                description: "Rotina matinal de 7 minutos que energiza seu dia",
                characterWebp: "/images/lp/personagem-manha.webp",
                characterPng: "/images/lp/personagem-manha.png",
                mood: "energizado",
                features: ["3 micro-hábitos", "Checklist matinal", "Lembrete suave"],
              },
              {
                time: "12:00",
                title: "Meio do Dia",
                description: "Check-in rápido para manter o foco e a produtividade",
                characterWebp: "/images/lp/personagem-meio-dia.webp",
                characterPng: "/images/lp/personagem-meio-dia.png",
                mood: "focado",
                features: ["Pausa consciente", "Revisão de tarefas", "Bloqueio de Distração"],
              },
              {
                time: "18:00",
                title: "Fim do Expediente",
                description: "Revisão do progresso e celebração das conquistas do dia",
                characterWebp: "/images/lp/personagem-tarde.webp",
                characterPng: "/images/lp/personagem-tarde.png",
                mood: "realizado",
                features: ["Streak atualizado", "Progresso visual", "Recompensas desbloqueadas"],
              },
              {
                time: "22:00",
                title: "Noite",
                description: "Desacelere a mente, cuide da saúde mental e prepare-se para um sono profundo",
                characterWebp: "/images/lp/personagem-noite.webp",
                characterPng: "/images/lp/personagem-noite.png",
                mood: "tranquilo",
                features: ["Meditação guiada", "Reflexão do dia", "Rotina de sono"],
              },
            ].map((item, index) => (
              <motion.div
                key={item.time}
                className={`relative flex items-center gap-8 mb-12 last:mb-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                {/* Time badge - center on desktop */}
                <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#A3E635] flex items-center justify-center shadow-lg shadow-[#A3E635]/30 z-10">
                    <span className="text-sm font-bold text-slate-900">{item.time}</span>
                  </div>
                </div>

                {/* Content card */}
                <div className={`flex-1 ${index % 2 === 0 ? "md:pr-16" : "md:pl-16"}`}>
                  <motion.div
                    className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-[#A3E635]/30"
                    whileHover={{ y: -5 }}
                  >
                    {/* Mobile time badge */}
                    <div className="flex items-center gap-3 mb-4 md:hidden">
                      <div className="w-12 h-12 rounded-full bg-[#A3E635] flex items-center justify-center shadow-lg">
                        <span className="text-xs font-bold text-slate-900">{item.time}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                        <Badge className="bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]/20 text-xs">
                          {item.mood}
                        </Badge>
                      </div>
                    </div>

                    {/* Desktop header */}
                    <div className="hidden md:block mb-4">
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">{item.title}</h3>
                      <Badge className="bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]/20 text-sm">
                        {item.mood}
                      </Badge>
                    </div>

                    <p className="text-slate-600 mb-4">{item.description}</p>

                    {/* Features list */}
                    <div className="flex flex-wrap gap-2">
                      {item.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Character image */}
                <div className={`hidden md:flex flex-1 items-center justify-center ${index % 2 === 0 ? "md:pl-16" : "md:pr-16"}`}>
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  >
                    <picture>
                      <source srcSet={item.characterWebp} type="image/webp" />
                      <img
                        src={item.characterPng}
                        alt={`Personagem ${item.mood}`}
                        className="w-40 h-auto drop-shadow-lg"
                        loading="lazy"
                      />
                    </picture>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA after timeline */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-slate-600 mb-6">
              <strong className="text-[#A3E635]">7 minutos</strong> que transformam as outras <strong>23 horas e 53 minutos</strong> do seu dia
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => handleCTA("timeline")}
                className="bg-[#A3E635] hover:bg-[#A3E635]/90 text-slate-900 font-bold px-8 py-6 rounded-full shadow-xl shadow-[#A3E635]/30"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                COMEÇAR MINHA TRANSFORMAÇÃO
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ INTERACTIVE QUIZ SECTION ============ */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#A3E635]/5 via-white to-[#A3E635]/10">
        {/* Background immersive effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#A3E635]/20 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-[#A3E635] text-slate-900 border-0 mb-4 shadow-lg shadow-[#A3E635]/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Experimente agora
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Descubra sua <span className="text-[#A3E635]">rotina ideal</span>
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Responda algumas perguntas e receba sua rotina personalizada em 2 minutos
            </p>
          </motion.div>

          {/* Quiz CTA Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-[#A3E635]/30 shadow-2xl shadow-[#A3E635]/10 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="p-8 md:p-12">
              {/* Icon illustration */}
              <div className="text-center mb-8">
                <motion.div
                  className="w-24 h-24 mx-auto bg-gradient-to-br from-[#A3E635] to-lime-400 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-[#A3E635]/30"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Quiz de Rotina Personalizada
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Baseado nas suas respostas, nosso algoritmo cria uma rotina única para você
                </p>
              </div>

              {/* Features list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Clock, text: "2 minutos", subtext: "tempo estimado" },
                  { icon: Target, text: "8 perguntas", subtext: "simples e rápidas" },
                  { icon: Brain, text: "IA Personalizada", subtext: "algoritmo inteligente" },
                ].map((item, index) => (
                  <motion.div
                    key={item.text}
                    className="text-center p-4 bg-slate-50 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <item.icon className="w-6 h-6 mx-auto mb-2 text-[#A3E635]" />
                    <p className="font-semibold text-slate-900">{item.text}</p>
                    <p className="text-xs text-slate-500">{item.subtext}</p>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="flex flex-col items-center">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleCTA("quiz_section")}
                    size="lg"
                    className="bg-[#A3E635] hover:bg-[#84cc16] text-slate-900 font-bold text-lg px-10 py-7 rounded-full shadow-xl shadow-[#A3E635]/30"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    FAZER QUIZ GRATUITO
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
                <p className="text-xs text-slate-400 mt-4">
                  Sem cadastro • 100% gratuito • Resultado imediato
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quiz Modal */}
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />

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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
              Como <span className="text-primary">funciona</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simples como deveria ser
            </p>
            <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-slate-400 mt-4">
              {totalHowItWorksSteps} passos guiados • arraste para ver todos
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
                      {/* Step number removido - usando dots abaixo */}

                      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 lg:gap-12">
                        {/* Image - sem border extra */}
                        <div className="w-full md:w-7/12">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-auto max-w-[420px] md:max-w-[580px] mx-auto rounded-[32px] shadow-2xl"
                          />
                        </div>

                        {/* Content */}
                        <div className="w-full md:w-5/12 text-center md:text-left">
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
            {/* Navigation with dots */}
            <div className="flex flex-col items-center gap-4 mt-8">
              {/* Dots indicator */}
              <div className="flex justify-center gap-2">
                {howItWorks.map((_, index) => (
                  <div
                    key={index}
                    className="w-2.5 h-2.5 rounded-full bg-primary/30 transition-all duration-300"
                  />
                ))}
              </div>
              {/* Navigation arrows */}
              <div className="flex justify-center gap-4">
                <CarouselPrevious className="static translate-y-0 bg-primary/10 border-primary/20 hover:bg-primary hover:text-white" />
                <CarouselNext className="static translate-y-0 bg-primary/10 border-primary/20 hover:bg-primary hover:text-white" />
              </div>
            </div>
          </Carousel>
        </div>
      </section>

      {/* ============ BEFORE/AFTER SECTION ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-lime-50/80 to-white" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-primary to-lime-400 text-white border-0 shadow-lg shadow-primary/25">
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
                className="text-xs sm:text-base font-semibold rounded-xl h-full transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 uppercase tracking-wide"
              >
                Sem o Bora
              </TabsTrigger>
              <TabsTrigger
                value="after"
                className="text-xs sm:text-base font-semibold rounded-xl h-full transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A3E635] data-[state=active]:to-lime-300 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 uppercase tracking-wide"
              >
                Com o Bora
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
                            <item.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
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
                      <picture>
                        <source srcSet="/images/lp/personagem_triste.webp" type="image/webp" />
                        <img
                          src="/images/lp/personagem_triste.png"
                          alt="Pessoa estressada"
                          className="w-40 lg:w-48 h-auto drop-shadow-lg"
                          loading="lazy"
                        />
                      </picture>
                    </motion.div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="after" className="mt-0">
                <motion.div
                  className="relative rounded-3xl bg-gradient-to-br from-lime-50 via-white to-lime-50 border-2 border-primary/30 p-6 sm:p-10 overflow-hidden shadow-xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-lime-500/20 rounded-full blur-[80px]" />
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
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-lime-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                            <item.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
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
                      <picture>
                        <source srcSet="/images/lp/meditação_personagem.webp" type="image/webp" />
                        <img
                          src="/images/lp/meditação_personagem.png"
                          alt="Pessoa em paz meditando"
                          className="w-40 lg:w-48 h-auto drop-shadow-lg"
                          loading="lazy"
                        />
                      </picture>
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
              Mais de 2000 usuários transformaram suas vidas
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
            Falta só <span className="text-[#A3E635]">2 minutos</span> pro teste grátis
          </h2>
          <p className="text-slate-600 text-lg mb-8 max-w-xl mx-auto">
            Responde o quiz. Recebe sua rotina. Testa grátis por 3 dias. Simples assim.
          </p>

          {/* APP MOCKUP */}
          <motion.div
            className="relative mb-10"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <picture>
              <source srcSet="/images/lp/mockup-horizontal.webp" type="image/webp" />
              <img
                src="/images/lp/mockup-horizontal.png"
                alt="App BORA - Telas do aplicativo"
                className="w-full max-w-2xl mx-auto h-auto rounded-2xl shadow-2xl"
                loading="lazy"
              />
            </picture>
            <div className="absolute inset-0 -z-10 bg-white/10 blur-3xl opacity-50 scale-110" />
          </motion.div>

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
              <Sparkles className="w-5 h-5 mr-2" />
              QUERO MINHA ROTINA
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-slate-600 text-sm">
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





