import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  Target,
  Zap,
  Moon,
  CheckCircle,
  Rocket,
  Unlock,
  Users,
  Clock,
  Shield,
  Sparkles,
  Star,
  HeartCrack,
  AlertCircle,
  TrendingDown,
  Brain,
  Coffee,
  ArrowRight,
  Gift,
  Flame,
  Trophy,
  Calendar,
  Bell,
  LineChart,
  Crown,
  Check,
} from "lucide-react";
import { buttonHoverTap, springTransition } from "@/hooks/useAnimations";

// ============ DATA ============

const routineTimeline = [
  {
    time: "07:00",
    label: "Manhã",
    icon: Sun,
    description: "Despertar com propósito",
    color: "from-amber-500 to-orange-500",
  },
  {
    time: "12:00",
    label: "Meio-dia",
    icon: Coffee,
    description: "Check-in de progresso",
    color: "from-yellow-500 to-amber-500",
  },
  {
    time: "18:00",
    label: "Tarde",
    icon: Target,
    description: "Revisão de metas",
    color: "from-orange-500 to-rose-500",
  },
  {
    time: "22:00",
    label: "Noite",
    icon: Moon,
    description: "Reflexão e gratidão",
    color: "from-indigo-500 to-purple-500",
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
    avatar: "L",
    quote: "O BORA foi o único que me fez manter uma rotina sem me sentir sobrecarregado. Em 2 semanas já estava acordando antes do alarme.",
    rating: 5,
  },
  {
    name: "Mariana Costa",
    age: 24,
    role: "Estudante",
    avatar: "M",
    quote: "Achei que seria mais um app de hábitos. Me surpreendi. Em 7 dias já estava dormindo melhor e focando mais nos estudos.",
    rating: 5,
  },
  {
    name: "Rafael Silva",
    age: 32,
    role: "Empreendedor",
    avatar: "R",
    quote: "Finalmente tenho clareza do que fazer todos os dias. Virei o jogo no meu negócio e na minha saúde ao mesmo tempo.",
    rating: 5,
  },
  {
    name: "Ana Paula",
    age: 29,
    role: "Médica",
    avatar: "A",
    quote: "Com plantões loucos, achava impossível ter rotina. O BORA se adaptou à minha realidade. Incrível.",
    rating: 5,
  },
];

const features = [
  {
    icon: Target,
    title: "Rotina Sob Medida",
    description: "Criada especificamente para seus objetivos e estilo de vida",
    size: "large",
  },
  {
    icon: Calendar,
    title: "Checklists Diários",
    description: "Simples e práticos",
    size: "small",
  },
  {
    icon: LineChart,
    title: "Progresso Visual",
    description: "Veja sua evolução",
    size: "small",
  },
  {
    icon: Bell,
    title: "Lembretes Inteligentes",
    description: "No momento certo, sem ser invasivo",
    size: "medium",
  },
  {
    icon: Rocket,
    title: "Transformação Real",
    description: "Sem teoria, só execução prática",
    size: "medium",
  },
];

const pricingBenefits = [
  "Acesso vitalício ao app BORA",
  "Rotina 100% personalizada",
  "Checklists diários inteligentes",
  "Acompanhamento de progresso",
  "Lembretes personalizados",
  "Suporte prioritário",
  "Atualizações gratuitas",
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
    answer: "Oferecemos garantia de 7 dias. Se não sentir diferença na sua rotina, devolvemos 100% do seu investimento.",
  },
  {
    question: "Preciso baixar algum app?",
    answer: "Não precisa baixar nada! O BORA funciona direto do seu celular pelo navegador. Você pode salvar na tela inicial como um app e usar offline. Acesso imediato após a compra.",
  },
  {
    question: "Como funciona a personalização?",
    answer: "Baseado nas suas respostas do quiz, criamos uma rotina única para você. O sistema aprende com seu uso e se adapta ao longo do tempo.",
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

const Offer = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full max-w-full">
      {/* ============ HERO SECTION ============ */}
      <motion.section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center px-4 md:px-6 py-20 w-full"
        style={{ opacity: heroOpacity }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 md:w-96 h-48 md:h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springTransition}
          >
            <Badge className="px-4 py-2 bg-primary/10 text-primary border-primary/20 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Sua rotina personalizada está pronta
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-3xl md:text-5xl lg:text-7xl font-bold leading-tight px-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Em menos de{" "}
            <span className="text-primary">7 minutos</span> por dia,
            <br />
            <span className="text-primary">
              você vira o jogo
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Baseado nas suas respostas, criamos um plano{" "}
            <strong className="text-foreground">único para você</strong> sair da
            estagnação e criar{" "}
            <strong className="text-foreground">consistência real</strong>.
          </motion.p>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 md:gap-16 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-center min-w-[80px]">
              <AnimatedCounter value={7} />
              <p className="text-xs md:text-sm text-muted-foreground mt-1">minutos/dia</p>
            </div>
            <div className="text-center min-w-[100px]">
              <AnimatedCounter value={5000} suffix="+" />
              <p className="text-xs md:text-sm text-muted-foreground mt-1">vidas transformadas</p>
            </div>
            <div className="text-center min-w-[80px]">
              <AnimatedCounter value={94} suffix="%" />
              <p className="text-xs md:text-sm text-muted-foreground mt-1">mantêm a rotina</p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-4 px-2"
          >
            <motion.div {...buttonHoverTap}>
              <Button
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                variant="premium"
                size="lg"
                className="group w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Ver minha rotina personalizada
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ============ TIMELINE SECTION ============ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Clock className="w-3 h-3 mr-1" />
              Sua nova rotina
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Um dia na sua melhor versão
            </h2>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-border rounded-full hidden md:block" />
            <motion.div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full hidden md:block"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* Timeline items */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
              {routineTimeline.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <motion.div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <item.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <span className="text-3xl font-bold text-foreground">{item.time}</span>
                  <span className="text-sm font-medium text-primary">{item.label}</span>
                  <span className="text-sm text-muted-foreground mt-1">{item.description}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.p
            className="text-center text-muted-foreground mt-12 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Clock className="w-4 h-4 text-primary" />
            Cada momento leva menos de 2 minutos
          </motion.p>
        </div>
      </section>

      {/* ============ BEFORE/AFTER SECTION ============ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle background */}
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
            <TabsList className="grid w-full grid-cols-2 mb-8 h-14 sm:h-16 p-1 sm:p-1.5 bg-muted/50 rounded-2xl">
              <TabsTrigger
                value="before"
                className="text-xs sm:text-base font-semibold rounded-xl h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <HeartCrack className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Sem o </span>BORA
              </TabsTrigger>
              <TabsTrigger
                value="after"
                className="text-xs sm:text-base font-semibold rounded-xl h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Com o </span>BORA
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
                  {/* Decorative gradient */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[100px]" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 relative z-10">
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
                </motion.div>
              </TabsContent>

              <TabsContent value="after" className="mt-0">
                <motion.div
                  className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/10 via-card to-emerald-500/10 border-2 border-primary/30 p-4 sm:p-8 md:p-12 overflow-hidden shadow-xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {/* Decorative gradient */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-[80px]" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 relative z-10">
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
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </section>

      {/* ============ TESTIMONIALS CAROUSEL ============ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Gradient background */}
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

          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/2">
                  <motion.div
                    className="h-full"
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="relative bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl p-8 h-full shadow-xl border border-primary/20 flex flex-col overflow-hidden group">
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Rating - ESTRELAS PREENCHIDAS */}
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

                      {/* Quote */}
                      <blockquote className="text-foreground leading-relaxed flex-grow mb-6 text-lg relative z-10">
                        "{testimonial.quote}"
                      </blockquote>

                      {/* Author */}
                      <div className="flex items-center gap-4 pt-4 border-t border-primary/10 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-primary/30">
                          <span className="text-white font-bold text-xl">
                            {testimonial.avatar}
                          </span>
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

      {/* ============ FEATURES BENTO GRID ============ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-primary to-emerald-500 text-white border-0 shadow-lg shadow-primary/25">
              <Crown className="w-3 h-3 mr-1" />
              Recursos exclusivos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              O que você vai ter no <span className="text-primary font-extrabold">BORA</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Large feature card - HERO CARD */}
            <motion.div
              className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-emerald-500 to-teal-600 p-5 sm:p-8 text-white shadow-2xl shadow-primary/30"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Animated glow */}
              <div className="absolute top-0 right-0 w-40 sm:w-60 h-40 sm:h-60 bg-white/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-24 sm:w-40 h-24 sm:h-40 bg-emerald-300/30 rounded-full blur-3xl" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                    <Target className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">Rotina Sob Medida</h3>
                  <p className="text-white/90 text-sm sm:text-xl leading-relaxed">
                    Criada especificamente para seus objetivos e estilo de vida. Nada genérico.
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-4 sm:mt-6 text-white/80 text-xs sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>100% personalizada para você</span>
                </div>
              </div>
            </motion.div>

            {/* Checklists card - TOP RIGHT */}
            <motion.div
              className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-card to-orange-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-500/20 shadow-lg group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-amber-500/30">
                <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <h4 className="font-bold text-sm sm:text-xl mb-1">Checklists Diários</h4>
              <p className="text-muted-foreground text-xs sm:text-base">Simples e práticos</p>
            </motion.div>

            {/* Progresso card */}
            <motion.div
              className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-card to-indigo-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-blue-500/30">
                <LineChart className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <h4 className="font-bold text-sm sm:text-xl mb-1">Progresso Visual</h4>
              <p className="text-muted-foreground text-xs sm:text-base">Veja sua evolução</p>
            </motion.div>

            {/* Lembretes card */}
            <motion.div
              className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-card to-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-purple-500/30">
                <Bell className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <h4 className="font-bold text-sm sm:text-xl mb-1">Lembretes</h4>
              <p className="text-muted-foreground text-xs sm:text-base">No momento certo</p>
            </motion.div>

            {/* Transformação card */}
            <motion.div
              className="relative overflow-hidden bg-gradient-to-br from-rose-500/10 via-card to-red-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-rose-500/20 shadow-lg group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-rose-500/30">
                <Rocket className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <h4 className="font-bold text-sm sm:text-xl mb-1">Transformação</h4>
              <p className="text-muted-foreground text-xs sm:text-base">Execução prática</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ PRICING SECTION ============ */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Massive gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-emerald-500/5 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px]" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-teal-500/20 rounded-full blur-[100px]" />

        <div className="max-w-lg mx-auto relative z-10">
          {/* Section title */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Comece sua <span className="text-primary font-extrabold">transformação</span>
            </h2>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            {/* Outer glow ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-emerald-500 to-teal-500 rounded-[2rem] blur-lg opacity-50 animate-pulse" />

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl border-2 border-primary/30 overflow-hidden">
              {/* Inner decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

              {/* Badge - FIXED */}
              <div className="flex justify-center mb-6">
                <Badge className="bg-gradient-to-r from-primary to-emerald-500 text-white border-0 px-5 py-2 text-sm shadow-lg shadow-primary/30">
                  <Gift className="w-4 h-4 mr-2" />
                  Oferta Especial de Lançamento
                </Badge>
              </div>

              {/* Price - DESTACADO */}
              <div className="text-center mb-8 relative z-10">
                <p className="text-muted-foreground line-through text-lg sm:text-xl mb-2">R$ 97</p>
                <div className="relative inline-block">
                  <span className="text-5xl sm:text-7xl md:text-8xl font-black text-primary">
                    R$ 47
                  </span>
                  {/* Glow behind price */}
                  <div className="absolute inset-0 text-5xl sm:text-7xl md:text-8xl font-black text-primary blur-2xl opacity-30">
                    R$ 47
                  </div>
                </div>
                <p className="text-muted-foreground mt-3 text-sm sm:text-lg">
                  pagamento único • <span className="text-primary font-semibold">acesso vitalício</span>
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-8" />

              {/* Benefits list - DESTACADO */}
              <ul className="space-y-2 sm:space-y-4 mb-6 sm:mb-8 relative z-10">
                {pricingBenefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-primary/5 border border-primary/10"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-foreground font-medium text-sm sm:text-base">{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA Button - PREMIUM */}
              <motion.div
                {...buttonHoverTap}
                className="relative group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated glow effect */}
                <div className="absolute -inset-1 sm:-inset-1.5 bg-gradient-to-r from-primary via-emerald-400 to-teal-400 rounded-xl sm:rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-primary via-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl opacity-90" />

                <Button
                  onClick={() => window.open("https://pay.kirvano.com/5dc4f0b1-fc02-490a-863d-dd1c680f1cac", "_blank")}
                  size="lg"
                  className="relative w-full bg-gradient-to-r from-primary via-emerald-500 to-teal-500 hover:from-primary hover:via-emerald-400 hover:to-teal-400 text-white font-black text-sm sm:text-lg md:text-xl py-5 sm:py-6 md:py-8 rounded-xl shadow-2xl shadow-primary/50 transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3 animate-pulse flex-shrink-0" />
                  <span className="truncate">QUERO MINHA ROTINA</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
                </Button>
              </motion.div>

              {/* Guarantee - DESTACADO */}
              <motion.div
                className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-teal-500/10 border border-primary/20"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground text-lg">Garantia de 7 dias</p>
                    <p className="text-muted-foreground">Satisfação ou seu dinheiro de volta</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FAQ SECTION ============ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Background */}
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

      {/* ============ FINAL CTA ============ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <motion.div
          className="max-w-3xl mx-auto relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-primary to-emerald-600 p-6 sm:p-10 md:p-16 text-center shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-emerald-300/20 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-4 sm:space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={springTransition}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center mb-4 sm:mb-6">
                <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </motion.div>

            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight">
              Sua nova rotina está pronta
              <br />
              <span className="text-white/90">para começar agora.</span>
            </h2>

            <p className="text-base sm:text-xl text-white/80 max-w-xl mx-auto px-2">
              Junte-se a mais de 5.000 pessoas que já transformaram suas vidas com apenas 7 minutos por dia.
            </p>

            <motion.div
              {...buttonHoverTap}
              className="pt-2 sm:pt-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => window.open("https://pay.kirvano.com/5dc4f0b1-fc02-490a-863d-dd1c680f1cac", "_blank")}
                size="lg"
                className="bg-white hover:bg-white/95 text-primary font-black text-sm sm:text-lg md:text-xl shadow-2xl shadow-white/30 group px-4 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 mr-2 animate-pulse flex-shrink-0" />
                <span className="truncate">COMEÇAR TRANSFORMAÇÃO</span>
                <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 ml-2 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
              </Button>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-4 sm:pt-6 text-white/80 text-xs sm:text-base">
              <div className="flex items-center gap-1 sm:gap-2">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Garantia 7 dias</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Acesso imediato</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Resultados 7 dias</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Offer;
