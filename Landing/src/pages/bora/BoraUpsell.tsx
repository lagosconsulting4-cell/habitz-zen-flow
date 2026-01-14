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
  BadgeCheck,
  Calendar,
  LineChart,
  Bell,
  Heart,
  Mail,
  Moon,
  Pause,
  Ban,
  Sunrise,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/hooks/useAnimations";
import { useTracking } from "@/hooks/useTracking";

// ============ DATA ============

const pillars = [
  {
    title: "Simplicidade",
    subtitle: "7 minutos por dia",
    description: "Micro-hábitos que cabem na rotina mais corrida. Sem complicação.",
    icon: Zap,
    gradient: "from-[#A3E635] to-lime-300",
    bgGlow: "bg-[#A3E635]/20",
  },
  {
    title: "Personalização",
    subtitle: "Feito para você",
    description: "Quiz personalizado. Rotina que aprende e se adapta ao seu ritmo.",
    icon: Brain,
    gradient: "from-[#A3E635] to-lime-400",
    bgGlow: "bg-[#A3E635]/20",
  },
  {
    title: "Resultados",
    subtitle: "30 dias de transformação",
    description: "Melhore foco, ansiedade e sono. 5000+ usuários. 94% mantêm consistência.",
    icon: Flame,
    gradient: "from-[#A3E635] to-lime-300",
    bgGlow: "bg-[#A3E635]/20",
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

const faqs = [
  {
    question: "Já tenho a Foquinha. Por que preciso do BORA?",
    answer: "A Foquinha organiza seu dia no WhatsApp - ela te lembra das tarefas e compromissos. O BORA transforma sua vida com uma rotina personalizada que melhora foco, energia e consistência. São complementares: enquanto a Foquinha mantém você organizado, o BORA cria hábitos que geram resultados reais.",
  },
  {
    question: "Posso usar os dois juntos?",
    answer: "Sim! E é exatamente por isso que essa oferta existe. A Foquinha mantém você organizado no WhatsApp, o BORA te guia na transformação de hábitos. Juntos, eles potencializam seus resultados - organização + transformação = imparável.",
  },
  {
    question: "Quanto tempo preciso dedicar por dia?",
    answer: "7 minutos. É rápido, prático e cabe em qualquer rotina. Se você tem tempo pra usar a Foquinha, tem tempo pro BORA. São micro-hábitos que geram macro resultados.",
  },
  {
    question: "E se eu não gostar?",
    answer: "Oferecemos garantia de 7 dias. Se não sentir diferença na sua rotina, devolvemos 100% do seu investimento. Sem perguntas, sem burocracia.",
  },
];

const pricingPlans = [
  {
    id: "weekly",
    name: "Semanal",
    price: "19,90",
    period: "por semana",
    stripeLink: "https://buy.stripe.com/00weVdaDig1Q4AofK49oc07",
    features: [
      "Rotina personalizada",
      "Checklists diários",
      "Progresso visual",
      "Lembretes inteligentes",
      "Cancele quando quiser",
      "Garantia de 7 dias",
    ],
    badge: "TESTE",
    badgeColor: "bg-slate-500",
    description: "Experimente por uma semana",
    savings: null,
  },
  {
    id: "monthly",
    name: "Mensal",
    price: "29,90",
    period: "por mês",
    stripeLink: "https://buy.stripe.com/3cI3cvbHm9Ds3wk69u9oc06",
    features: [
      "Tudo do plano Semanal +",
      "🧘 Meditações guiadas",
      "📚 Hub de livros e conteúdos",
      "🎯 Jornada guiada de 30 dias",
      "💪 Programa completo de hábitos",
      "Economia de 25% vs semanal",
      "Garantia de 7 dias",
    ],
    badge: "POPULAR",
    badgeColor: "bg-blue-500",
    description: "Compromisso com 30 dias de transformação",
    savings: "25%",
  },
  {
    id: "annual",
    name: "Anual",
    price: "129,90",
    period: "por ano",
    monthlyPrice: "10,82",
    stripeLink: "https://buy.stripe.com/bJeaEXh1G9Ds8QE2Xi9oc05",
    features: [
      "Tudo do plano Mensal +",
      "🏆 Programa completo de 12 meses",
      "🎁 27 dicas práticas exclusivas",
      "📖 Biblioteca de desenvolvimento",
      "🔥 Comprometimento total com mudança",
      "💰 Economia de 64% vs mensal",
      "🌟 Apenas R$10,82/mês",
      "Garantia de 7 dias",
    ],
    badge: "MELHOR OFERTA",
    badgeColor: "bg-gradient-to-r from-amber-500 to-orange-500",
    description: "Para quem quer os melhores 12 meses da vida",
    savings: "64%",
    mostPopular: true,
  },
];

// ============ MAIN COMPONENT ============

const BoraUpsell = () => {
  const [isScrolled, setIsScrolled] = useState(false);
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

  const handleCTA = (planId: string, location: string) => {
    trackCTA(`${location}_${planId}`);
    const plan = pricingPlans.find((p) => p.id === planId);
    if (plan) {
      window.location.href = plan.stripeLink;
    }
  };

  const totalHowItWorksSteps = howItWorks.length;

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
              onClick={() => handleCTA("monthly", "header")}
              className="bg-[#A3E635] hover:bg-[#A3E635]/90 text-slate-900 font-semibold px-6 py-2 rounded-full shadow-lg shadow-[#A3E635]/25"
            >
              Garantir agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* ============ HERO SECTION - THANK YOU + TRANSITION ============ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 pt-24 pb-16 w-full overflow-hidden bg-white">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#A3E635]/5 to-white" />
        <div className="absolute inset-0 bg-[radial-gradient(#A3E635_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15]" />
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
              {/* Success Badge */}
              <motion.div variants={staggerItem} className="flex justify-center lg:justify-start">
                <Badge className="px-4 py-2 bg-green-500 text-white border-0 text-sm font-semibold shadow-lg shadow-green-500/30">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Parabéns pela sua compra!
                </Badge>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-slate-900"
                variants={staggerItem}
              >
                Sua Foquinha já está{" "}
                <span className="text-green-500 relative">
                  a caminho
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-green-500/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
              </motion.h1>

              {/* Email Notice */}
              <motion.div
                className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
                variants={staggerItem}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 mb-1">Acesso enviado no e-mail</h3>
                    <p className="text-slate-600 text-sm">
                      Em alguns minutos, você receberá todas as instruções para ativar sua assistente no WhatsApp.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Transition */}
              <motion.div variants={staggerItem} className="pt-4">
                <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0">
                  Enquanto isso, deixa eu te contar uma coisa...
                </p>
              </motion.div>
            </motion.div>

            {/* Right side - Hero mockup */}
            <motion.div
              className="relative flex justify-center lg:justify-end order-first lg:order-last"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-green-500/15 rounded-full blur-[120px]" />

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

      {/* ============ TRANSITION SECTION ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
              Se você está <span className="text-[#A3E635]">REALMENTE comprometida(o)</span> com a mudança...
            </h2>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              A Foquinha vai organizar seu dia. Ela te lembra dos compromissos, mantém suas tarefas no lugar.
            </p>

            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200">
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
                Mas deixa eu te fazer uma pergunta:
              </p>

              <p className="text-xl md:text-2xl text-slate-700 mb-8">
                E se você pudesse ir <span className="text-[#A3E635] font-bold">ALÉM da organização</span>?
              </p>

              <p className="text-lg text-slate-600 mb-8">
                E se, além de lembrar das tarefas, você tivesse uma <strong>ROTINA PERSONALIZADA</strong> que:
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {[
                  { icon: Zap, text: "Acaba com a procrastinação", subtext: "Não só organiza, mas te MOVE pra ação" },
                  { icon: Brain, text: "Melhora seu foco real", subtext: "Rotina que treina sua mente para alta performance" },
                  { icon: Target, text: "Transforma hábitos em 30 dias", subtext: "Resultados visíveis, não só organização" },
                  { icon: Rocket, text: "Te dá energia de manhã", subtext: "Despertar com clareza e propósito" },
                  { icon: Flame, text: "Mantém consistência sem esforço", subtext: "Gamificação e progresso visual" },
                  { icon: Heart, text: "Gera orgulho real", subtext: "Conquistas que você sente no dia a dia" },
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A3E635] to-lime-400 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{benefit.text}</p>
                      <p className="text-sm text-slate-600 mt-1">{benefit.subtext}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BORA INTRODUCTION ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#A3E635]/10 rounded-full blur-[150px]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-[#A3E635] text-slate-900 border-0 shadow-lg shadow-[#A3E635]/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Conheça o BORA
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Sua rotina personalizada em{" "}
              <span className="text-[#A3E635]">7 minutos por dia</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-4">
              Mais de 5.000 pessoas já transformaram suas vidas. 94% mantêm a rotina todos os dias.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-6">
              {[
                { value: 7, label: "minutos/dia" },
                { value: 5000, suffix: "+", label: "vidas transformadas" },
                { value: 94, suffix: "%", label: "mantêm a rotina" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#A3E635]">
                    {stat.value.toLocaleString()}{stat.suffix || ""}
                  </span>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200 text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xl md:text-2xl font-bold text-slate-900">
              O BORA é diferente de tudo que você já tentou.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900">Foquinha</p>
                    <p className="text-slate-600 text-sm">Organiza seu dia no WhatsApp</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#A3E635] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900">BORA</p>
                    <p className="text-slate-600 text-sm">TRANSFORMA sua vida com rotina personalizada</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <p className="text-lg text-slate-700">
                São micro-hábitos personalizados que cabem na rotina mais corrida.
              </p>
              <p className="text-2xl font-bold text-[#A3E635] mt-2">
                7 minutos por dia que mudam as outras 23 horas e 53 minutos.
              </p>
            </div>
          </motion.div>
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
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-[#A3E635]/30 overflow-hidden">
                  <div className={`absolute -top-20 -right-20 w-40 h-40 ${pillar.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                    <pillar.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-primary font-semibold text-sm mb-3">
                    {pillar.subtitle}
                  </p>
                  <p className="text-slate-600">
                    {pillar.description}
                  </p>

                  <div className={`h-1 w-0 group-hover:w-16 bg-gradient-to-r ${pillar.gradient} rounded-full mt-6 transition-all duration-500`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS CAROUSEL ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
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
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 lg:gap-12">
                        <div className="w-full md:w-7/12">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-auto max-w-[420px] md:max-w-[580px] mx-auto rounded-[32px] shadow-2xl"
                          />
                        </div>

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
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="flex justify-center gap-2">
                {howItWorks.map((_, index) => (
                  <div
                    key={index}
                    className="w-2.5 h-2.5 rounded-full bg-primary/30 transition-all duration-300"
                  />
                ))}
              </div>
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
              Foquinha vs Foquinha + BORA
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              A diferença que o <span className="text-primary font-extrabold">COMBO</span> faz
            </h2>
          </motion.div>

          <Tabs defaultValue="combo" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-14 sm:h-16 p-1.5 sm:p-2 bg-slate-200 rounded-2xl border-0">
              <TabsTrigger
                value="only-foquinha"
                className="text-xs sm:text-base font-semibold rounded-xl h-full transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 uppercase tracking-wide"
              >
                Só Foquinha
              </TabsTrigger>
              <TabsTrigger
                value="combo"
                className="text-xs sm:text-base font-semibold rounded-xl h-full transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A3E635] data-[state=active]:to-lime-300 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 uppercase tracking-wide"
              >
                Foquinha + BORA
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="only-foquinha" className="mt-0">
                <motion.div
                  className="relative rounded-3xl bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 border-blue-200 p-6 sm:p-10 overflow-hidden shadow-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/50 rounded-full blur-[100px]" />
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Só com a Foquinha:</h3>
                    {[
                      { text: "Tarefas organizadas", icon: CheckCircle2 },
                      { text: "Lembretes no WhatsApp", icon: CheckCircle2 },
                      { text: "Compromissos no lugar", icon: CheckCircle2 },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-blue-200"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-slate-900 font-medium text-lg">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="combo" className="mt-0">
                <motion.div
                  className="relative rounded-3xl bg-gradient-to-br from-lime-50 via-white to-lime-50 border-2 border-primary/30 p-6 sm:p-10 overflow-hidden shadow-xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-lime-500/20 rounded-full blur-[80px]" />
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Foquinha + BORA (Combo Imparável):</h3>
                    {[
                      { text: "Tarefas organizadas", icon: CheckCircle2, fromFoquinha: true },
                      { text: "Lembretes no WhatsApp", icon: CheckCircle2, fromFoquinha: true },
                      { text: "Compromissos no lugar", icon: CheckCircle2, fromFoquinha: true },
                      { text: "Rotina personalizada de transformação", icon: Rocket, fromFoquinha: false },
                      { text: "Foco e energia multiplicados", icon: Flame, fromFoquinha: false },
                      { text: "Hábitos que viram resultados reais", icon: Target, fromFoquinha: false },
                      { text: "Progresso visual que motiva", icon: LineChart, fromFoquinha: false },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center gap-4 p-4 rounded-2xl ${
                          item.fromFoquinha
                            ? "bg-white border border-blue-200"
                            : "bg-white border border-primary/30 ring-2 ring-primary/20"
                        }`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={`w-10 h-10 rounded-full ${
                          item.fromFoquinha
                            ? "bg-blue-500"
                            : "bg-gradient-to-br from-primary to-lime-400"
                        } flex items-center justify-center flex-shrink-0`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-slate-900 font-medium text-lg">{item.text}</span>
                          {!item.fromFoquinha && (
                            <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs">
                              NOVO COM BORA
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </section>

      {/* ============ TESTIMONIALS CAROUSEL ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
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
              <span>Mais de 5000 transformações</span>
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Mais de 5000 usuários transformaram suas vidas
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

      {/* ============ PRICING SECTION ============ */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#A3E635]/20 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-amber-500 text-white border-0 mb-4 shadow-lg shadow-amber-500/30 text-sm px-4 py-2">
              🎁 OFERTA EXCLUSIVA - ACABOU DE ASSINAR A FOQUINHA
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Você já deu o primeiro passo.
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-[#A3E635] mb-6">
              Agora complete sua transformação com o BORA
            </h3>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8">
              Enquanto a Foquinha organiza, o BORA transforma. Juntos, eles são imparáveis.
            </p>

            {/* Bonus Section */}
            <motion.div
              className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-amber-200 max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-6">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg mb-3">
                  🎁 BÔNUS EXCLUSIVOS INCLUSOS
                </Badge>
                <h3 className="text-2xl font-bold text-slate-900">
                  Tudo isso está esperando por você
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: "🧘", title: "Meditações Guiadas", subtitle: "Acalme sua mente" },
                  { icon: "📚", title: "Hub de Livros", subtitle: "Biblioteca exclusiva" },
                  { icon: "🎯", title: "Jornada 30 Dias", subtitle: "Passo a passo completo" },
                  { icon: "🏆", title: "27 Dicas Práticas", subtitle: "Hacks de produtividade" },
                ].map((bonus, i) => (
                  <motion.div
                    key={i}
                    className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 border border-slate-200 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="text-4xl mb-2">{bonus.icon}</div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{bonus.title}</h4>
                    <p className="text-xs text-slate-600">{bonus.subtitle}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-900">Valor total dos bônus:</strong>{" "}
                  <span className="line-through text-slate-400">R$ 608,00</span>{" "}
                  <span className="text-amber-600 font-bold">→ GRÁTIS para você</span>
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className={`relative rounded-3xl p-6 md:p-8 ${
                  plan.mostPopular
                    ? "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-4 border-amber-500 shadow-2xl shadow-amber-500/30 md:scale-110 z-10"
                    : plan.id === "monthly"
                    ? "bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 border-blue-500 shadow-2xl shadow-blue-500/20"
                    : "bg-white border-2 border-slate-200 shadow-xl"
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <Badge className={`${plan.badgeColor} text-white border-0 shadow-lg text-xs font-bold px-4 py-1.5 uppercase tracking-wide`}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {/* Savings Badge */}
                {plan.savings && (
                  <div className="absolute -top-3 -right-3 z-20">
                    <div className={`${
                      plan.mostPopular ? "bg-amber-500" : "bg-blue-500"
                    } text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg transform rotate-12`}>
                      <span className="text-xs font-semibold">Economize</span>
                      <span className="text-lg font-bold leading-none">{plan.savings}</span>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6 pt-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 text-sm mb-4 min-h-[40px] flex items-center justify-center">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-slate-200/50">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-sm text-slate-500">R$</span>
                      <span className="text-4xl md:text-5xl font-bold text-slate-900">{plan.price}</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">{plan.period}</p>
                    {plan.monthlyPrice && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <p className={`${
                          plan.mostPopular ? "text-amber-600" : "text-[#A3E635]"
                        } font-bold text-lg`}>
                          Apenas R${plan.monthlyPrice}/mês
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 ${
                        plan.mostPopular ? "text-amber-500" :
                        plan.id === "monthly" ? "text-blue-500" :
                        "text-[#A3E635]"
                      } flex-shrink-0 mt-0.5`} />
                      <span className="text-slate-700 text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleCTA(plan.id, "pricing")}
                    className={`w-full ${
                      plan.mostPopular
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        : plan.id === "monthly"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    } py-6 rounded-full font-bold shadow-lg text-base`}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {plan.mostPopular ? "Quero Transformar Minha Vida" : "Garantir agora"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>

                {/* Trust badges */}
                <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Shield className="w-4 h-4" />
                  <span>Garantia de 7 dias • Cancele quando quiser</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Value Proposition Below Pricing */}
          <motion.div
            className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center space-y-6">
              <p className="text-xl md:text-2xl font-bold text-slate-900">
                💡 Pensa só: você acabou de assinar a Foquinha porque quer organizar sua vida.
              </p>

              <p className="text-lg text-slate-700">
                O BORA vai além. Ele <span className="text-[#A3E635] font-bold">TRANSFORMA</span>.
              </p>

              <div className="bg-gradient-to-r from-[#A3E635]/10 to-lime-50 rounded-2xl p-6 border border-[#A3E635]/20">
                <p className="text-lg font-semibold text-slate-900 mb-4">
                  Por menos de <span className="text-[#A3E635] text-2xl font-bold">R$11/mês</span> (no plano anual), você tem:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {[
                    "Rotina personalizada que funciona",
                    "Micro-hábitos que cabem no seu dia",
                    "Progresso visual que te mantém motivado",
                    "Consistência sem esforço",
                    "Resultados em 30 dias",
                    "Garantia de 7 dias",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#A3E635] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xl font-bold text-slate-900">
                Enquanto a Foquinha organiza, o BORA transforma.{" "}
                <span className="text-[#A3E635]">Juntos, eles são imparáveis.</span>
              </p>
            </div>
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

      {/* ============ FINAL CTA ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <div className="absolute inset-0 bg-gradient-to-b from-lime-50/50 via-white to-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#A3E635]/15 rounded-full blur-[120px]" />

        <motion.div
          className="max-w-3xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Sua transformação completa está a{" "}
            <span className="text-[#A3E635]">1 clique</span> de distância
          </h2>
          <p className="text-slate-600 text-lg mb-8 max-w-xl mx-auto">
            Você já tomou a decisão de mudar. Já assinou a Foquinha.
          </p>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-[#A3E635]/30 mb-8">
            <p className="text-xl md:text-2xl font-bold text-slate-900 mb-6">
              Agora, decida se você quer só <span className="text-blue-500">ORGANIZAR</span> ou se você quer{" "}
              <span className="text-[#A3E635]">TRANSFORMAR</span>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#A3E635]" />
                <span className="font-semibold">7 minutos por dia</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#A3E635]" />
                <span className="font-semibold">30 dias de transformação</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#A3E635]" />
                <span className="font-semibold">5.000+ vidas mudadas</span>
              </div>
            </div>

            <p className="text-lg text-slate-700 mb-8">
              A escolha é sua.
            </p>

            {/* Main CTA */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mb-4"
            >
              <Button
                onClick={() => handleCTA("annual", "final_cta")}
                size="lg"
                className="group w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-base sm:text-lg px-6 sm:px-10 py-6 sm:py-7 rounded-full font-bold shadow-2xl shadow-amber-500/40"
              >
                <Sparkles className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">QUERO O COMBO COMPLETO (FOQUINHA + BORA)</span>
                <span className="sm:hidden">GARANTIR COMBO COMPLETO</span>
                <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Secondary CTA - No thanks */}
            <button
              onClick={() => window.location.href = "/downsell-bora"}
              className="text-slate-500 hover:text-slate-700 text-sm underline transition-colors"
            >
              Não, obrigado. Só quero a Foquinha por enquanto
            </button>
          </div>

          {/* Guarantee */}
          <div className="flex items-center justify-center gap-3 text-slate-600">
            <Shield className="w-5 h-5 text-[#A3E635]" />
            <span className="text-sm">
              <strong>Garantia de 7 dias</strong> - Teste sem risco. Se não fizer sentido, devolvemos 100%.
            </span>
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

export default BoraUpsell;
