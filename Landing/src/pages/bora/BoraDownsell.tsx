import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
  Clock,
  Star,
  AlertCircle,
  Brain,
  Target,
  Flame,
  Heart,
  X,
  Gift,
  Calendar,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/hooks/useAnimations";
import { useTracking } from "@/hooks/useTracking";

// ============ DATA ============

const pricingPlans = [
  {
    id: "weekly",
    name: "Semanal",
    price: "19,90",
    period: "por semana",
    stripeLink: "https://buy.stripe.com/14A4gz7r62b01ocdBW9oc02",
    features: [
      "✨ 3 dias de teste GRÁTIS",
      "Rotina personalizada",
      "Checklists diários",
      "Progresso visual",
      "Lembretes inteligentes",
      "Cancele quando quiser",
    ],
    badge: "TESTE",
    badgeColor: "bg-slate-500",
    description: "Experimente sem compromisso",
  },
  {
    id: "monthly",
    name: "Mensal",
    price: "29,90",
    period: "por mês",
    stripeLink: "https://buy.stripe.com/cNidR9dPuaHwaYM41m9oc03",
    features: [
      "✨ 3 dias de teste GRÁTIS",
      "Tudo do plano Semanal +",
      "🧘 Meditações guiadas",
      "📚 Hub de livros e conteúdos",
      "🎯 Jornada guiada de 30 dias",
      "Economia de 25%",
    ],
    badge: "POPULAR",
    badgeColor: "bg-blue-500",
    description: "Melhor custo-benefício",
    highlighted: true,
  },
  {
    id: "annual",
    name: "Anual",
    price: "129,90",
    period: "por ano",
    monthlyPrice: "10,82",
    stripeLink: "https://buy.stripe.com/14AeVd9zedTI7MA69u9oc04",
    features: [
      "✨ 3 dias de teste GRÁTIS",
      "Tudo do plano Mensal +",
      "🏆 Programa completo de 12 meses",
      "🎁 27 dicas práticas exclusivas",
      "📖 Biblioteca de desenvolvimento",
      "💰 Economia de 64%",
      "🌟 Apenas R$10,82/mês",
    ],
    badge: "MELHOR OFERTA",
    badgeColor: "bg-gradient-to-r from-emerald-500 to-teal-500",
    description: "Transformação completa",
    mostPopular: false,
  },
];

// ============ MAIN COMPONENT ============

const BoraDownsell = () => {
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
    trackCTA(`downsell_${location}_${planId}`);
    const plan = pricingPlans.find((p) => p.id === planId);
    if (plan) {
      window.location.href = plan.stripeLink;
    }
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
              onClick={() => handleCTA("monthly", "header")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg shadow-blue-500/25"
            >
              Testar 3 dias grátis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* ============ HERO SECTION - WAIT! ============ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 pt-24 pb-16 w-full overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.08]" />
        <div className="absolute top-20 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-emerald-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 w-full max-w-5xl mx-auto">
          <motion.div
            className="text-center space-y-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Alert Badge */}
            <motion.div variants={staggerItem} className="flex justify-center">
              <Badge className="px-4 py-2 bg-amber-500 text-white border-0 text-sm font-semibold shadow-lg shadow-amber-500/30 animate-pulse">
                <AlertCircle className="w-4 h-4 mr-2" />
                Espera! Antes de ir...
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-slate-900"
              variants={staggerItem}
            >
              E se você pudesse testar o BORA{" "}
              <span className="text-blue-500 relative">
                GRÁTIS por 3 dias?
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-500/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
              variants={staggerItem}
            >
              Sem compromisso. Sem cartão de crédito. Sem risco.
              <br />
              <strong className="text-slate-900">Apenas 3 dias para você descobrir</strong> se o BORA é o que faltava na sua vida.
            </motion.p>

            {/* Visual comparison */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-8"
              variants={staggerItem}
            >
              {/* Only Foquinha */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <X className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900">Sem o BORA</h3>
                </div>
                <ul className="space-y-2 text-left text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    Só organização básica
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    Sem rotina personalizada
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    Sem transformação real
                  </li>
                </ul>
              </div>

              {/* With BORA */}
              <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl p-6 border-2 border-blue-500 shadow-xl relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Badge className="bg-blue-500 text-white border-0 text-xs">3 DIAS GRÁTIS</Badge>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900">Com o BORA</h3>
                </div>
                <ul className="space-y-2 text-left text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    Rotina personalizada que funciona
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    Transformação real em 30 dias
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    Foco e energia multiplicados
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Trial CTA */}
            <motion.div variants={staggerItem} className="pt-4">
              <div className="inline-flex flex-col items-center gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleCTA("monthly", "hero")}
                    size="lg"
                    className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 rounded-full font-bold shadow-2xl shadow-blue-500/40"
                  >
                    <Gift className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">QUERO TESTAR 3 DIAS GRÁTIS</span>
                    <span className="sm:hidden">TESTAR GRÁTIS</span>
                    <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>

                <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Sem cobrança nos 3 dias</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-blue-500" />
                    <span>Cancele a qualquer momento</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ WHY 3 DAYS SECTION ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-white">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Calendar className="w-3 h-3 mr-1" />
              Por que 3 dias?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              É tempo suficiente para <span className="text-blue-500">sentir a diferença</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                day: "Dia 1",
                title: "Descubra sua rotina",
                description: "Faça o quiz personalizado e receba seu plano único",
                icon: Brain,
                color: "blue",
              },
              {
                day: "Dia 2",
                title: "Sinta o foco",
                description: "Experimente a clareza de ter uma rotina que funciona",
                icon: Target,
                color: "emerald",
              },
              {
                day: "Dia 3",
                title: "Veja os resultados",
                description: "Energia pela manhã, consistência durante o dia",
                icon: Flame,
                color: "amber",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center mb-4`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-500`} />
                </div>
                <Badge className="mb-3 bg-slate-100 text-slate-700 border-0 text-xs">
                  {item.day}
                </Badge>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl p-8 border-2 border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <p className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
                Depois dos 3 dias, você decide:
              </p>
              <p className="text-slate-600">
                Quer continuar transformando sua vida? Ótimo, a cobrança começa automaticamente.
                <br />
                Não sentiu diferença? Cancele com 1 clique. Sem perguntas, sem complicação.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ PRICING SECTION ============ */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-blue-500 text-white border-0 mb-4 shadow-lg shadow-blue-500/30 text-sm px-4 py-2">
              🎁 3 DIAS GRÁTIS EM TODOS OS PLANOS
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Escolha seu plano e comece agora
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Teste grátis por 3 dias. Sem compromisso. Cancele quando quiser.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className={`relative rounded-3xl p-6 md:p-8 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-blue-50 via-white to-blue-50 border-4 border-blue-500 shadow-2xl shadow-blue-500/20 md:scale-105 z-10"
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

                {/* Free Trial Badge */}
                <div className="absolute -top-3 -right-3 z-20">
                  <div className={`${
                    plan.highlighted ? "bg-blue-500" : "bg-emerald-500"
                  } text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg transform rotate-12`}>
                    <span className="text-xs font-semibold">GRÁTIS</span>
                    <span className="text-lg font-bold leading-none">3 dias</span>
                  </div>
                </div>

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
                        <p className="text-emerald-600 font-bold text-lg">
                          Apenas R${plan.monthlyPrice}/mês
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2">Após 3 dias de teste grátis</p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 ${
                        plan.highlighted ? "text-blue-500" : "text-emerald-500"
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
                      plan.highlighted
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    } py-6 rounded-full font-bold shadow-lg text-base`}
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    Começar teste grátis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>

                {/* Trust badges */}
                <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Shield className="w-4 h-4" />
                  <span>Sem cobrança nos 3 dias • Cancele quando quiser</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final reassurance */}
          <motion.div
            className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-slate-900 font-semibold">
                  100% Sem Risco • Cancele Com 1 Clique
                </span>
              </div>

              <p className="text-lg text-slate-700">
                Você não paga nada nos primeiros 3 dias. Use o BORA completamente, teste tudo, veja os resultados.
              </p>

              <p className="text-slate-600">
                Se em algum momento você decidir que não é pra você, basta cancelar com 1 clique no app. Simples assim.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FINAL URGENCY CTA ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />

        <motion.div
          className="max-w-3xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Não deixe essa chance passar
          </h2>
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Você já deu o primeiro passo com a Foquinha.{" "}
            <strong className="text-slate-900">Agora experimente o próximo nível</strong> - sem risco, sem compromisso.
          </p>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-blue-500/30 mb-8">
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">3 dias grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">7 minutos/dia</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">5.000+ transformações</span>
              </div>
            </div>

            {/* Main CTA */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mb-4"
            >
              <Button
                onClick={() => handleCTA("monthly", "final_cta")}
                size="lg"
                className="group w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base sm:text-lg px-6 sm:px-10 py-6 sm:py-7 rounded-full font-bold shadow-2xl shadow-blue-500/40"
              >
                <Gift className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">COMEÇAR TESTE DE 3 DIAS GRÁTIS</span>
                <span className="sm:hidden">TESTAR GRÁTIS</span>
                <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Secondary CTA - No thanks */}
            <button
              onClick={() => window.location.href = "/obrigado"}
              className="text-slate-500 hover:text-slate-700 text-sm underline transition-colors"
            >
              Não, prefiro só a Foquinha mesmo
            </button>
          </div>

          {/* Guarantee */}
          <div className="flex items-center justify-center gap-3 text-slate-600">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-sm">
              <strong>Sem cobrança nos 3 dias</strong> • Cancele a qualquer momento
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
              <a href="#" className="hover:text-blue-500 transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Contato</a>
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

export default BoraDownsell;
