import React from "react";
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
import { ValueStack } from "@/components/ValueStack";
import { BonusCards } from "@/components/BonusCards";

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
    avatar: "L",
    quote: "Em 14 dias, passei de acordar às 10h para às 6h30 naturalmente. Minha produtividade aumentou 40% e finalmente entrego projetos no prazo.",
    rating: 5,
    metric: "14 dias para acordar cedo",
  },
  {
    name: "Mariana Costa",
    age: 24,
    role: "Estudante",
    avatar: "M",
    quote: "Completei 21 dias de streak consecutivos! Antes não conseguia manter nada por mais de 3 dias. Passei em 2 concursos estudando só 2h/dia com foco.",
    rating: 5,
    metric: "21 dias de streak",
  },
  {
    name: "Rafael Silva",
    age: 32,
    role: "Empreendedor",
    avatar: "R",
    quote: "Em 30 dias, perdi 4kg e dobrei o faturamento da empresa. O segredo foi ter clareza do que fazer a cada momento do dia.",
    rating: 5,
    metric: "30 dias = -4kg + 2x faturamento",
  },
  {
    name: "Ana Paula",
    age: 29,
    role: "Médica",
    avatar: "A",
    quote: "Mesmo com plantões de 24h, mantenho 87% de consistência nos meus hábitos. O BORA se adapta quando minha rotina muda.",
    rating: 5,
    metric: "87% de consistência",
  },
];

const faqs = [
  {
    question: "O que está incluso nos R$ 47?",
    answer: "Você recebe TUDO: App BORA completo por 1 ano + Programa de 30 Dias (R$ 297) + Jornada Guiada 4 Semanas (R$ 197) + Meditações & Respiração (R$ 147) + Hub de Livros (R$ 97) + Dicas Práticas (R$ 67). São R$ 805 em valor por apenas R$ 47 — economia de 94%.",
  },
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

const DirectOffer = () => {
  const navigate = usePathAwareNavigate();

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

        <motion.div
          className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={staggerItem}>
            <Badge className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30 text-sm animate-pulse">
              <Clock className="w-4 h-4 mr-2" />
              Oferta expira em 48 horas
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight px-2"
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
            className="text-base md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto px-2"
            variants={staggerItem}
          >
            Chega de acordar sem energia. Chega de procrastinar.{" "}
            <strong className="text-foreground">Seu plano personalizado</strong> vai
            te dar clareza e consistência em{" "}
            <strong className="text-foreground">apenas 7 minutos por dia</strong>.
          </motion.p>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 md:gap-16 pt-8"
            variants={staggerItem}
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

          {/* Countdown Timer */}
          <motion.div variants={staggerItem} className="pt-6">
            <CountdownTimer variant="hero" />
          </motion.div>

          {/* CTA */}
          <motion.div variants={staggerItem} className="pt-4 px-2">
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

      {/* ============ VALUE STACK SECTION ============ */}
      <ValueStack />

      {/* ============ BONUS CARDS SECTION ============ */}
      <BonusCards />

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
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-emerald-500/5 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px]" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-teal-500/20 rounded-full blur-[100px]" />

        <div className="max-w-lg mx-auto relative z-10">
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
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-emerald-500 to-teal-500 rounded-[2rem] blur-lg opacity-50 animate-pulse" />

            <div className="relative bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl border-2 border-primary/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

              <div className="flex justify-center mb-4">
                <Badge className="bg-gradient-to-r from-primary to-emerald-500 text-white border-0 px-5 py-2 text-sm shadow-lg shadow-primary/30">
                  <Gift className="w-4 h-4 mr-2" />
                  Oferta Especial de Lançamento
                </Badge>
              </div>

              <div className="mb-6">
                <CountdownTimer variant="pricing" />
              </div>

              <div className="text-center mb-8 relative z-10">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <p className="text-muted-foreground line-through text-xl sm:text-2xl">R$ 805</p>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs font-bold animate-pulse">
                    -94%
                  </Badge>
                </div>
                <div className="relative inline-block">
                  <span className="text-5xl sm:text-7xl md:text-8xl font-black text-primary">
                    R$ 47
                  </span>
                  <div className="absolute inset-0 text-5xl sm:text-7xl md:text-8xl font-black text-primary blur-2xl opacity-30">
                    R$ 47
                  </div>
                </div>
                <p className="text-muted-foreground mt-3 text-sm sm:text-lg">
                  pagamento único • <span className="text-primary font-semibold">1 ano de acesso completo</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6 relative z-10">
                <p className="text-center text-sm sm:text-base text-foreground">
                  <span className="font-bold text-primary">Incluso:</span> App BORA + Programa 30 Dias + Jornada Guiada + Meditações + Hub de Livros + Dicas Práticas
                </p>
              </div>

              <motion.div
                className="relative group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-all duration-500 animate-pulse" />
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

              <motion.div
                className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-teal-500/10 border border-primary/20"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-bold text-foreground text-lg">Garantia Incondicional de 7 dias</p>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Se em até 7 dias você não sentir que sua rotina está mais organizada,
                      devolvemos <strong className="text-primary">100% do seu dinheiro</strong>. Sem perguntas.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
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
          <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-emerald-300/20 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-4 sm:space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
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
              className="pt-2 sm:pt-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleCTA}
                size="lg"
                className="bg-white hover:bg-gray-100 !text-emerald-600 font-black text-sm sm:text-lg md:text-xl shadow-2xl shadow-white/30 group px-4 sm:px-8 py-5 sm:py-6 w-full sm:w-auto border-0"
              >
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 mr-2 animate-pulse flex-shrink-0 text-emerald-600" />
                <span className="text-emerald-600">QUERO MINHA ROTINA</span>
                <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 ml-2 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0 text-emerald-600" />
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

export default DirectOffer;
