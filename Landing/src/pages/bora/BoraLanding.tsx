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
  Check,
  Zap,
  Star,
  Users,
  ShieldCheck,
  Brain,
  Target,
  LineChart,
  Sparkles,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/hooks/useAnimations";
import { QuizModal } from "@/components/quiz/QuizModal";
import { useTracking } from "@/hooks/useTracking";

// /bora agora é landing direta pro checkout (sem quiz). Link do checkout anual (Hubla);
// o preço (R$47/ano) é configurado no provedor — aqui só exibimos e mandamos pra lá.
const CHECKOUT_ANUAL_URL = "https://pay.hub.la/91TKYeHy1alHwSXn8yJz";

// Telas reais do app (Landing/public/images/lp) — showcase "por dentro do app".
// Mock "top" da tela de pricing do quiz (phone "App Bora").
const FEATURE_MOCK = "https://i.ibb.co/8gCMLMS8/image-10.png";
const APP_FEATURES = [
  { title: "Seu dia, organizado", desc: "A rotina de hoje já vem montada. Você não decide nada de manhã, só executa." },
  { title: "Feita pra você", desc: "Responde umas perguntas rápidas e sua rotina nasce pronta, do seu jeito." },
  { title: "Sua evolução visível", desc: "Streak, consistência e o quanto você já avançou. Todo dia." },
];

// ============ DATA ============

const howItWorksNew = [
  {
    title: "Caminho do Menor Esforço",
    description: "Não dependa de força de vontade. Tornamos o comportamento certo a ação mais fácil do seu dia.",
    icon: Zap,
    gradient: "from-lime-400/20 to-lime-600/20",
    className: "col-span-1 md:col-span-2 lg:col-span-1",
    number: "01",
  },
  {
    title: "Identidade > Hábito",
    description: "Pare de 'tentar' e comece a 'ser'. Moldamos sua autoimagem para que a disciplina venha de dentro para fora, sem sofrimento.",
    icon: Brain,
    gradient: "from-emerald-400/20 to-emerald-600/20",
    className: "col-span-1 md:col-span-2 lg:col-span-1",
    number: "02",
  },
  {
    title: "O Poder do 1%",
    description: "Melhore 1% todos os dias. É como juros compostos: pequenos passos consistentes viram uma diferença enorme ao longo do ano.",
    icon: LineChart,
    gradient: "from-lime-300/20 to-emerald-400/20",
    className: "col-span-1 md:col-span-2 lg:col-span-1",
    number: "03",
  },
];

// Depoimentos do quiz (mesma voz, mais reais) — TestimonialsStep.
const testimonials = [
  {
    name: "Marcos A.",
    role: "São Paulo, SP",
    photo: "https://i.ibb.co/5Wtxy3SP/download-15.jpg",
    quote: "cara eu to sem palavras... na segunda semana ja tava acordando sem precisar de alarme. nunca achei q ia conseguir isso",
    result: "4 meses de consistência",
  },
  {
    name: "Juliana S.",
    role: "Belo Horizonte, MG",
    photo: "https://i.ibb.co/PZx78q3m/download-16.jpg",
    quote: "tentei de tudo mesmo. planner, academia, dieta... nada durava. o Bora foi o unico q se adaptou a mim, nao eu a ele 😅",
    result: "10 semanas mantendo a rotina",
  },
  {
    name: "Rafael C.",
    role: "Fortaleza, CE",
    photo: "https://i.ibb.co/5xYjH4q6/jin.jpg",
    quote: "to mais disposto, dormindo melhor, mais focado no trampo. tudo isso sem mudar minha vida de cabeca pra baixo",
    result: "Produtividade no pico",
  },
  {
    name: "Larissa M.",
    role: "Recife, PE",
    photo: "https://i.ibb.co/V6PdXHc/download-17.jpg",
    quote: "achei q ia ser complicado mas e muito simples. tipo o duolingo mas pra habitos. ja to a 2 meses sem pular um dia 🔥",
    result: "2 meses sem pular um dia",
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
    // Vai direto pro checkout anual (R$47/ano), repassando UTMs (mesma lógica do funil).
    const currentParams = window.location.search;
    const sep = CHECKOUT_ANUAL_URL.includes("?") ? "&" : "?";
    let url = CHECKOUT_ANUAL_URL + (currentParams ? sep + currentParams.substring(1) : "");
    const sp = new URLSearchParams(currentParams);
    const utmContent = sp.get("utm_content") || sp.get("v");
    if (utmContent && !url.includes("src=")) url += `&src=${utmContent}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-50 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-lime-500/30 selection:text-lime-200">

      {/* ============ NAVBAR — liquid glass flutuante ============ */}
      <motion.header
        className="fixed inset-x-0 top-3 z-50 px-4"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/[0.07] px-3.5 py-2.5 backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_32px_rgba(0,0,0,0.45)]">
          <a href="#" className="group flex items-center gap-2.5">
            <img
              src="/assets/bora-app-icon.png"
              alt="Bora"
              className="h-9 w-9 rounded-[11px] object-cover shadow-lg ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-lg font-bold tracking-tight text-white">Bora</span>
          </a>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => handleCTA("header")}
              className="rounded-full bg-lime-400 px-5 py-2 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all hover:bg-lime-300"
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
              Seja a sua <br />
              <span className="text-lime-400">melhor versão.</span>
            </motion.h1>

            {/* Mobile Mockup Position (Visible on Mobile only/Interleaved) */}
            <motion.div
              className="lg:hidden relative w-full flex justify-center py-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <img
                src="/images/lp/hero_mockup.webp"
                alt="App Interface"
                className="w-[280px] drop-shadow-2xl rotate-[-2deg]"
              />
            </motion.div>



            <motion.p
              className="text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              variants={staggerItem}
            >
              Para ser sua melhor versão, você não precisa de sorte, precisa de um sistema. O Bora organiza sua rotina para que seus objetivos se tornem inevitáveis.
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
                Construir o meu novo eu
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Authority / Trust Badges */}
            <motion.div variants={staggerItem} className="pt-8 flex flex-wrap gap-6 justify-center lg:justify-start items-center opacity-80">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-3">
                  {[
                    "https://i.ibb.co/VYFg60D5/images-1.jpg",
                    "https://i.ibb.co/3t9Gz73/163684537661904740a5094-1636845376-3x2-md.jpg",
                    "https://i.ibb.co/hRW0GZbj/young-brazilian-woman-isolated-on-260nw-2605475869.webp",
                    "https://i.ibb.co/6RvR1xnL/istockphoto-852415974-612x612.jpg",
                    "https://i.ibb.co/VcnRgK1z/jovem-e-bonita-mulher-brasileira-ao-ar-livre-com-oculos-1368-499497.avif",
                    "https://i.ibb.co/r9RXQ3x/10592418-m.jpg",
                  ].map((src, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0A0B] bg-slate-700 overflow-hidden flex-shrink-0">
                      <img src={src} alt="Membro" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-white font-bold text-sm">2.000+</span>
                  <span className="text-slate-400 text-xs">Membros Ativos</span>
                </div>
              </div>

              <div className="w-px h-8 bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-lime-400 fill-lime-400" />
                  ))}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-white font-bold text-sm">4.9/5</span>
                  <span className="text-slate-400 text-xs">Avaliação Média</span>
                </div>
              </div>

              <div className="w-px h-8 bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-lime-400" />
                <div className="flex flex-col text-left">
                  <span className="text-white font-bold text-sm">Privacidade</span>
                  <span className="text-slate-400 text-xs">Dados Seguros</span>
                </div>
              </div>
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
              src="/images/lp/hero_mockup.webp"
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
              O Sistema <span className="text-lime-400">Bora</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Como o Bora ajuda você a construir sua melhor versão, dia após dia.
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
                className={`relative group bg-[#121214] border border-white/5 rounded-[2rem] p-8 overflow-hidden hover:border-lime-500/20 transition-all duration-500 ${feature.className}`}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`} />

                <div className="relative z-10 flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-lime-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-4xl font-bold text-white/5 font-mono group-hover:text-white/10 transition-colors">
                    {feature.number}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed relative z-10">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ APP SHOWCASE — telas reais do app ============ */}
      <section className="relative overflow-hidden bg-[#0A0A0B] py-24 px-4 sm:px-6">
        {/* glow ambiente */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-lime-500/10 blur-[140px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">Por dentro do app</span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Seu sistema, na <span className="text-lime-400">palma da mão</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
              Rotina clara no dia a dia, sua evolução visível e um plano montado pra você. Sem complicação.
            </p>
          </motion.div>

          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
            {/* Mock da tela de pricing do quiz (o "top") */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative mx-auto w-full max-w-md lg:max-w-lg flex-shrink-0"
            >
              <div className="absolute inset-0 -z-10 scale-90 rounded-[3rem] bg-gradient-to-tr from-lime-500/25 to-yellow-500/10 blur-3xl" />
              <img
                src={FEATURE_MOCK}
                alt="App Bora"
                loading="lazy"
                decoding="async"
                className="w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
              />
            </motion.div>

            {/* Benefícios */}
            <div className="flex-1 space-y-7">
              {APP_FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/10">
                    <Check className="h-5 w-5 text-lime-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
                  {testimonial.result && (
                    <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-400">
                      <Check className="h-3.5 w-3.5" /> {testimonial.result}
                    </span>
                  )}
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
            Torne seus objetivos <span className="text-lime-400">inevitáveis.</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Pare de lutar contra sua rotina. O sistema Bora alinha seus hábitos diários com quem você quer se tornar, no automático.
          </p>

          {/* Oferta — card glass */}
          <div className="mx-auto max-w-md rounded-[2rem] border border-lime-400/30 bg-white/[0.04] p-8 text-left shadow-[0_0_60px_rgba(163,230,53,0.12)] backdrop-blur-xl">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime-400">Acesso completo • 1 ano</span>
              <div className="mt-3 flex items-end justify-center gap-2">
                <span className="text-6xl font-black leading-none text-white">R$ 5,15</span>
                <span className="mb-2 text-sm text-slate-400">/mês</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">em até 12x, ou R$ 47 à vista. Menos que um café por mês.</p>
            </div>

            <ul className="mt-6 space-y-3">
              {[
                "Sua rotina personalizada, pronta pra começar",
                "Jornadas guiadas, meditações e hub de livros",
                "Progresso, streaks e conquistas pra te manter firme",
                "Funciona offline e instala na tela inicial",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-lime-400" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleCTA("final_cta")}
              className="group mt-7 w-full rounded-2xl bg-lime-400 py-7 text-base font-bold text-slate-950 shadow-[0_0_30px_rgba(163,230,53,0.3)] transition-all hover:bg-lime-300 hover:shadow-[0_0_50px_rgba(163,230,53,0.5)]"
            >
              QUERO MEU ACESSO
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-lime-400" /> 7 dias de garantia. Não curtiu, a gente devolve.
            </p>
          </div>
        </div>
      </section>

      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />
    </div>
  );
};

export default BoraLanding;
