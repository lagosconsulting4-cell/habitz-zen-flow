import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ArrowRight,
  Zap,
  Star,
  Users,
  BadgeCheck,
  Brain,
  Target,
  LineChart,
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
    gradient: "from-lime-400 to-lime-600",
    className: "col-span-1 md:col-span-2 lg:col-span-1",
  },
  {
    title: "Ajuste Dinâmico",
    description: "Teve um dia ruim? O sistema recalcula a rota para você não quebrar a constância.",
    icon: Brain,
    gradient: "from-emerald-400 to-emerald-600",
    className: "col-span-1 md:col-span-2 lg:col-span-1",
  },
  {
    title: "Visualização de Progresso",
    description: "Acompanhe sua evolução diária para gerar a dopamina que seu cérebro precisa.",
    icon: LineChart,
    gradient: "from-lime-300 to-emerald-400",
    className: "col-span-1 md:col-span-2 lg:col-span-1",
  },
];

const testimonials = [
  {
    name: "Camila Souza",
    age: 22,
    role: "Fundadora de Startup",
    photo: "https://i.ibb.co/7t5yRpDd/Gemini-Generated-Image-i7pejzi7pejzi7pe.png",
    quote: "Meu negócio decolou depois que comecei a usar o Bora. Antes era só correria e incêndio pra apagar. Agora consigo focar no que realmente importa. Meu faturamento dobrou em 3 meses!",
    rating: 5,
    metric: "Faturamento 2x em 3 meses",
  },
  {
    name: "Lucas Fernandes",
    age: 20,
    role: "Estagiário de Marketing",
    photo: "https://i.ibb.co/xtXmcTS3/Gemini-Generated-Image-ixzgp8ixzgp8ixzg.png",
    quote: "Achava que produtividade era pra 'gente grande', mas o Bora me mostrou que não. Entreguei todos os projetos no prazo e ainda tive tempo pra minha vida social. Me senti um pro!",
    rating: 5,
    metric: "100% de projetos no prazo",
  },
  {
    name: "Ana Clara Lima",
    age: 24,
    role: "Designer Freelancer",
    photo: "https://picsum.photos/seed/woman/150/150",
    quote: "Chega de procrastinar! O Bora me ajudou a organizar meus clientes, prazos e ainda sobrou tempo pra criar conteúdo pro meu portfólio. Finalmente consigo dar conta de tudo sem virar a noite.",
    rating: 5,
    metric: "Mais clientes, menos stress",
  },
  {
    name: "Pedro Henrique",
    age: 19,
    role: "Estudante e Vendedor",
    photo: "https://i.ibb.co/TMPp1Kw1/Gemini-Generated-Image-200v6k200v6k200v.png",
    quote: "Conciliar faculdade e trabalho era um caos. O Bora me deu um método pra otimizar meu tempo e energia. Agora consigo estudar, trabalhar e ainda ir pra academia sem me sentir esgotado.",
    rating: 5,
    metric: "Equilíbrio vida-estudo-trabalho",
  },
];

// ============ MAIN COMPONENT ============

const BoraLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const { trackCTA, trackScrollDepth } = useTracking();

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className="min-h-screen bg-[#0A0A0B] text-slate-50 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-lime-500/30 selection:text-lime-200">

      {/* ============ STICKY HEADER ============ */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <img
              src="/assets/logo_bora.png"
              alt="BORA Logo"
              className="w-8 h-8 object-contain group-hover:drop-shadow-[0_0_8px_rgba(163,230,53,0.5)] transition-all duration-300"
            />
          </a>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => handleCTA("header")}
              className="bg-white hover:bg-slate-200 text-slate-900 font-semibold px-6 py-2 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
            >
              Começar agora
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 pt-32 pb-16 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">

          {/* Text Content */}
          <motion.div
            className="text-center lg:text-left space-y-6 flex-1 max-w-2xl"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tighter text-white"
              variants={staggerItem}
            >
              Pare de depender da <span className="text-white/40">Motivação.</span><br />
              Automatize a sua <span className="text-lime-400">Disciplina.</span>
            </motion.h1>

            {/* Mobile Mockup Position (Visible on Mobile only/Interleaved) - user requested "entre headline e subhead" */}
            <motion.div
              className="lg:hidden relative w-full flex justify-center py-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <img
                src="/images/lp/hero_mockup.png"
                alt="App Interface"
                className="w-[280px] drop-shadow-2xl rotate-[-2deg]"
              />
            </motion.div>

            <motion.p
              className="text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              variants={staggerItem}
            >
              O Bora converte suas metas em micro-hábitos automáticos. Uma Rotina Personalizada que se adapta à sua rotina, sem cobrar perfeição.
            </motion.p>

            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            >
              <Button
                onClick={() => handleCTA("hero")}
                size="lg"
                className="bg-lime-400 hover:bg-lime-500 text-slate-950 text-lg px-8 py-7 rounded-full font-bold shadow-[0_0_30px_rgba(163,230,53,0.3)] hover:shadow-[0_0_50px_rgba(163,230,53,0.5)] transition-all duration-500"
              >
                Calibrar meu Sistema
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Stats/Hook */}
            <motion.div variants={staggerItem} className="pt-8 border-t border-white/10 flex flex-col gap-2">
              <p className="text-slate-500 text-sm uppercase tracking-wider font-bold">Por que 92% falham?</p>
              <p className="text-slate-300 max-w-md mx-auto lg:mx-0">
                Tentamos mudar tudo de uma vez. O Método Bora foca na <span className="text-lime-300 font-bold">'Densidade de Foco'</span>: fazer o essencial, todos os dias.
              </p>
            </motion.div>
          </motion.div>

          {/* Desktop Mockup (Hidden on Mobile) */}
          <motion.div
            className="hidden lg:flex relative items-center justify-end flex-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {/* Glow behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[600px] bg-gradient-to-tr from-lime-500/20 to-yellow-500/20 rounded-full blur-[80px]" />

            <img
              src="/images/lp/hero_mockup.png"
              alt="App Interface"
              className="relative z-10 w-[450px] drop-shadow-2xl rotate-[-4deg] hover:rotate-0 transition-transform duration-700 ease-out"
            />
          </motion.div>

        </div>
      </section>

      {/* ============ BENTO GRID FEATURES ============ */}
      <section className="py-20 px-4 sm:px-6 relative bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              O Loop do <span className="text-lime-400">Sistema</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Um ciclo de 3 passos projetado com neurociência para transformar intenção em ação automática.
            </p>
          </motion.div>

          {/* Bento Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorksNew.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`relative group bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 overflow-hidden hover:bg-white/[0.05] transition-colors duration-500 ${feature.className}`}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-400 to-yellow-400 flex items-center justify-center mb-6 shadow-lg shadow-lime-900/20`}>
                  <feature.icon className="w-7 h-7 text-[#0A0A0B]" strokeWidth={2.5} />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed relative z-10">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS (INFINITE SCROLL FEEL) ============ */}
      <section className="py-24 relative overflow-hidden bg-[#0A0A0B]">
        <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-7xl mx-auto px-4">
          <div className="mb-12 flex items-end justify-between">
            <div className="max-w-md">
              <h2 className="text-3xl font-bold text-white mb-2">Comunidade Ativa</h2>
              <p className="text-slate-400">Junte-se a mais de 2.000 pessoas que já calibraram seus sistemas.</p>
            </div>
            <div className="hidden md:flex gap-4">
              <CarouselPrevious className="static translate-y-0 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-lime-400" />
              <CarouselNext className="static translate-y-0 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-lime-400" />
            </div>
          </div>

          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 h-full flex flex-col hover:border-lime-500/30 transition-colors duration-300">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-lime-500" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 flex-grow leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover grayscale opacity-70"
                    />
                    <div>
                      <p className="text-white font-bold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-lime-900/20 to-[#0A0A0B]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
            Descubra onde está o seu <span className="text-lime-400">gargalo.</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Responda algumas perguntas rápidas. Vamos gerar uma Rotina Personalizada para destravar sua produtividade em 2 minutos.
          </p>

          <Button
            onClick={() => handleCTA("final_cta")}
            className="group bg-white text-slate-900 hover:bg-lime-400 text-lg px-12 py-8 rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(163,230,53,0.4)] transition-all duration-500"
          >
            INICIAR ANÁLISE DE ROTINA
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />
    </div>
  );
};

export default BoraLanding;
