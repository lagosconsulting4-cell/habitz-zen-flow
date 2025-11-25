import { useState, useRef } from "react";
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
  BarChart3,
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
  ChevronRight,
  Gift,
  Flame,
  Trophy,
  Calendar,
  Bell,
  LineChart,
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
    answer: "Sim! O BORA é um aplicativo mobile disponível para Android e iOS. Você terá acesso imediato após a compra.",
  },
  {
    question: "Como funciona a personalização?",
    answer: "Baseado nas suas respostas do quiz, criamos uma rotina única para você. O app aprende com seu uso e se adapta ao longo do tempo.",
  },
];

// ============ COMPONENTS ============

const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-5xl font-bold text-primary"
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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ============ HERO SECTION ============ */}
      <motion.section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center px-6 py-20"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
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
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Em menos de{" "}
            <span className="text-primary">7 minutos</span> por dia,
            <br />
            <span className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-clip-text text-transparent">
              você vira o jogo
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
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
            className="flex flex-wrap justify-center gap-8 md:gap-16 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-center">
              <AnimatedCounter value={7} />
              <p className="text-muted-foreground mt-1">minutos/dia</p>
            </div>
            <div className="text-center">
              <AnimatedCounter value={5000} suffix="+" />
              <p className="text-muted-foreground mt-1">vidas transformadas</p>
            </div>
            <div className="text-center">
              <AnimatedCounter value={94} suffix="%" />
              <p className="text-muted-foreground mt-1">mantêm a rotina</p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-4"
          >
            <motion.div {...buttonHoverTap}>
              <Button
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                variant="premium"
                size="2xl"
                className="group"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Ver minha rotina personalizada
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ============ TIMELINE SECTION ============ */}
      <section className="py-20 px-6 bg-muted/30">
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
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              A diferença que o <span className="text-primary">BORA</span> faz
            </h2>
          </motion.div>

          <Tabs defaultValue="after" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-14">
              <TabsTrigger
                value="before"
                className="text-base data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive"
              >
                <HeartCrack className="w-4 h-4 mr-2" />
                Sem o BORA
              </TabsTrigger>
              <TabsTrigger
                value="after"
                className="text-base data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Com o BORA
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="before" className="mt-0">
                <motion.div
                  className="rounded-3xl bg-destructive/5 border-2 border-destructive/20 p-8 md:p-12"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {beforeProblems.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-xl bg-background/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-destructive" />
                        </div>
                        <span className="text-foreground font-medium pt-2">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="after" className="mt-0">
                <motion.div
                  className="rounded-3xl bg-primary/5 border-2 border-primary/20 p-8 md:p-12"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {afterBenefits.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-xl bg-background/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-foreground font-medium pt-2">{item.text}</span>
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
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Users className="w-3 h-3 mr-1" />
              Histórias reais
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Quem já <span className="text-primary">virou o jogo</span>
            </h2>
          </motion.div>

          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    className="h-full"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="bg-card rounded-3xl p-8 h-full shadow-lg border border-border/50 flex flex-col">
                      {/* Rating */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="text-foreground leading-relaxed flex-grow mb-6">
                        "{testimonial.quote}"
                      </blockquote>

                      {/* Author */}
                      <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {testimonial.avatar}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {testimonial.name}, {testimonial.age}
                          </p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-8">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* ============ FEATURES BENTO GRID ============ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              O que você vai ter no <span className="text-primary">BORA</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Large feature card */}
            <motion.div
              className="col-span-2 row-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-emerald-600 p-8 text-white"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Rotina Sob Medida</h3>
                <p className="text-white/80 text-lg">
                  Criada especificamente para seus objetivos e estilo de vida. Nada genérico.
                </p>
              </div>
            </motion.div>

            {/* Small cards */}
            {features.slice(1).map((feature, index) => (
              <motion.div
                key={index}
                className={`${feature.size === "medium" ? "col-span-2" : ""} bg-card rounded-2xl p-6 border border-border/50 shadow-sm`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING SECTION ============ */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-lg mx-auto">
          <motion.div
            className="relative bg-card rounded-3xl p-8 md:p-10 shadow-2xl border-2 border-primary/20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1.5 shadow-lg">
                <Gift className="w-4 h-4 mr-1" />
                Oferta Especial de Lançamento
              </Badge>
            </div>

            {/* Price */}
            <div className="text-center mb-8 pt-4">
              <p className="text-muted-foreground line-through text-xl">R$ 97</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-6xl font-bold text-primary">R$ 47</span>
              </div>
              <p className="text-muted-foreground mt-1">pagamento único • acesso vitalício</p>
            </div>

            {/* Benefits list */}
            <ul className="space-y-4 mb-8">
              {pricingBenefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA Button */}
            <motion.div {...buttonHoverTap}>
              <Button
                onClick={() => navigate("/checkout")}
                variant="premium"
                size="2xl"
                className="w-full group"
              >
                <Unlock className="w-6 h-6 mr-2" />
                Desbloquear Agora
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Guarantee */}
            <div className="flex items-center justify-center gap-2 mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm">
                <strong className="text-foreground">Garantia de 7 dias</strong>
                <span className="text-muted-foreground"> • Satisfação ou seu dinheiro de volta</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FAQ SECTION ============ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Perguntas <span className="text-primary">frequentes</span>
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
                  className="bg-card rounded-2xl border border-border/50 px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-3xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-emerald-600 p-10 md:p-16 text-center shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300/20 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={springTransition}
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <Rocket className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Sua nova rotina está pronta
              <br />
              <span className="text-white/90">para começar agora.</span>
            </h2>

            <p className="text-xl text-white/80 max-w-xl mx-auto">
              Junte-se a mais de 5.000 pessoas que já transformaram suas vidas com apenas 7 minutos por dia.
            </p>

            <motion.div {...buttonHoverTap} className="pt-4">
              <Button
                onClick={() => navigate("/checkout")}
                size="2xl"
                className="bg-white hover:bg-white/95 text-primary font-bold shadow-xl group"
              >
                <Unlock className="w-6 h-6 mr-2" />
                Começar minha transformação
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-white/80">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Garantia de 7 dias</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Acesso imediato</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Resultados em 7 dias</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Offer;
