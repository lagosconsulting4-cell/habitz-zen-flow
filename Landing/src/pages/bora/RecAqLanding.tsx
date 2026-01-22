import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Heart,
  Brain,
  Zap,
  Target,
  Calendar,
  Users,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/hooks/useAnimations";
import { useTracking } from "@/hooks/useTracking";

// Checkout link for 33% discount offer
const CHECKOUT_LINK = "https://payfast.greenn.com.br/154673/offer/Y5uyP3";

const RecAqLanding = () => {
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

  const handleCTA = (location: string) => {
    trackCTA(location);
    window.location.href = CHECKOUT_LINK;
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
              {/* Badge */}
              <motion.div variants={staggerItem} className="flex justify-center lg:justify-start">
                <Badge className="px-4 py-2 bg-[#A3E635] text-slate-900 border-0 text-sm font-semibold shadow-lg shadow-[#A3E635]/30">
                  <Heart className="w-4 h-4 mr-2" />
                  Você merece uma nova chance
                </Badge>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-slate-900"
                variants={staggerItem}
              >
                Dê uma chance pra você.{" "}
                <span className="text-[#A3E635] relative">
                  Você merece.
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
                Talvez manter uma rotina não seja difícil.{" "}
                <strong className="text-slate-900">Talvez você só tenha tentado do jeito errado.</strong>
              </motion.p>

              {/* CTA */}
              <motion.div variants={staggerItem} className="pt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleCTA("hero")}
                    size="lg"
                    className="group bg-[#A3E635] hover:bg-[#A3E635]/90 text-slate-900 text-base sm:text-lg px-8 py-6 rounded-full font-bold shadow-xl shadow-[#A3E635]/30"
                  >
                    👉 Quero começar
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right side - App mockup */}
            <motion.div
              className="relative flex justify-center items-center lg:justify-end"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-[#A3E635]/20 to-lime-400/20 rounded-3xl blur-3xl" />
                <picture>
                  <source srcSet="/images/lp/dashboard_mockup.webp" type="image/webp" />
                  <img
                    src="/images/lp/dashboard_mockup.png"
                    alt="Bora App Interface"
                    className="relative z-10 w-full h-auto drop-shadow-2xl"
                  />
                </picture>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ BLOCO 1 — IDENTIFICAÇÃO (SEM CULPA) ============ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4 text-lg md:text-xl text-slate-700 leading-relaxed">
              <p>Você já tentou se organizar.</p>
              <p>Já tentou criar hábitos.</p>
              <p>Já prometeu que dessa vez ia.</p>
              <p className="font-semibold">E não conseguiu manter.</p>

              <div className="pt-6 space-y-4">
                <p className="text-slate-900 font-bold text-xl md:text-2xl">
                  Isso não significa que você falhou.
                </p>
                <p>
                  Significa que sua rotina pediu mais do que você tinha pra dar.
                </p>
              </div>

              <div className="pt-4 space-y-2 text-base text-slate-600">
                <p>Energia varia.</p>
                <p>Dias que saem do controle.</p>
                <p className="italic">A vida simplesmente acontecendo.</p>
              </div>

              <p className="pt-4 text-slate-900 font-semibold text-lg">
                E nenhuma rotina rígida sobrevive a isso.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BLOCO 2 — QUEBRA DE CRENÇA ============ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center">
              Talvez o problema nunca tenha sido você.
            </h2>

            <div className="bg-slate-50 rounded-2xl p-8 md:p-10 border-2 border-slate-200">
              <p className="text-lg text-slate-700 mb-6">
                Talvez você só tenha tentado:
              </p>

              <ul className="space-y-4 text-base md:text-lg text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-slate-400 font-bold">–</span>
                  <span>métodos engessados</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-400 font-bold">–</span>
                  <span>promessas grandes demais</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-400 font-bold">–</span>
                  <span>sistemas que não cabem na vida real</span>
                </li>
              </ul>
            </div>

            <div className="text-center space-y-4 pt-6">
              <p className="text-xl md:text-2xl font-bold text-[#A3E635]">
                Aqui, a proposta é diferente.
              </p>

              <div className="space-y-3 text-base md:text-lg text-slate-700">
                <p>Não é sobre virar uma pessoa super organizada do dia pra noite.</p>
                <p>Não é sobre acordar cedo, se não fizer sentido.</p>
                <p>Não é sobre fazer tudo certo.</p>

                <p className="text-slate-900 font-bold text-xl md:text-2xl pt-4">
                  É sobre fazer dar certo. Pra você.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BLOCO 3 — STORYTELLING (O BORA) ============ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <Badge className="px-4 py-2 bg-[#A3E635]/10 text-[#A3E635] border border-[#A3E635]/30 text-sm font-semibold">
                <Sparkles className="w-4 h-4 mr-2" />
                Nossa história
              </Badge>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center">
              O Bora não nasceu de uma ideia de negócio.
              <br />
              <span className="text-[#A3E635]">Nasceu de frustração.</span>
            </h2>

            <div className="space-y-5 text-base md:text-lg text-slate-700 leading-relaxed">
              <p>A gente também já tentou organizar a rotina mil vezes.</p>
              <p>Já começou empolgado.</p>
              <p>Já abandonou.</p>
              <p>Já se culpou por não manter.</p>

              <p className="pt-4 font-semibold text-slate-900">
                Não porque faltava vontade.
              </p>
              <p>Mas porque a vida real não respeita planilhas perfeitas.</p>

              <div className="bg-slate-100 rounded-xl p-6 my-6">
                <p className="text-slate-600 italic">
                  Trabalho, estudo, cansaço, ansiedade, imprevistos.<br />
                  Sempre tinha algo que quebrava a rotina "ideal".
                </p>
              </div>

              <p className="font-bold text-slate-900 text-lg md:text-xl">
                Com o tempo, ficou claro:<br />
                o problema não era a gente.
              </p>
              <p>Eram os métodos que exigiam mais do que dava pra entregar.</p>

              <div className="pt-6 text-center">
                <p className="text-xl md:text-2xl font-bold text-[#A3E635]">
                  O Bora nasceu pra ser o oposto disso.
                </p>
                <p className="text-lg text-slate-700 mt-4">
                  Um lugar onde a rotina se adapta à sua vida —<br />
                  não o contrário.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BLOCO 4 — O QUE É O BORA ============ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                O que é o Bora
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Um app que usa neurociência para organizar sua vida de forma simples e sustentável
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <motion.div
                className="bg-gradient-to-br from-[#A3E635]/10 to-lime-100/50 rounded-2xl p-6 border border-[#A3E635]/20"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 bg-[#A3E635] rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Organizar sua rotina de forma simples
                </h3>
                <p className="text-slate-600 text-sm">
                  Clareza visual do que importa, sem sobrecarga
                </p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                className="bg-gradient-to-br from-[#A3E635]/10 to-lime-100/50 rounded-2xl p-6 border border-[#A3E635]/20"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 bg-[#A3E635] rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Criar hábitos possíveis
                </h3>
                <p className="text-slate-600 text-sm">
                  Pequenos, repetíveis, que cabem na sua vida real
                </p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                className="bg-gradient-to-br from-[#A3E635]/10 to-lime-100/50 rounded-2xl p-6 border border-[#A3E635]/20"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 bg-[#A3E635] rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Manter constância sem motivação
                </h3>
                <p className="text-slate-600 text-sm">
                  Funciona mesmo quando você não está "inspirado"
                </p>
              </motion.div>
            </div>

            <div className="text-center pt-6">
              <p className="text-xl font-semibold text-slate-900">
                Tudo começa pequeno.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BLOCO 5 — POR QUE FUNCIONA ============ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center">
              Por que funciona
            </h2>

            <div className="bg-white rounded-2xl p-8 md:p-10 border-2 border-slate-200 shadow-lg">
              <p className="text-lg md:text-xl text-slate-700 mb-6">
                Rotinas funcionam melhor quando respeitam:
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#A3E635]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-[#A3E635]" />
                  </div>
                  <span className="text-lg font-semibold text-slate-900">seu tempo</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#A3E635]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-[#A3E635]" />
                  </div>
                  <span className="text-lg font-semibold text-slate-900">sua energia</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#A3E635]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#A3E635]" />
                  </div>
                  <span className="text-lg font-semibold text-slate-900">seu momento de vida</span>
                </li>
              </ul>

              <div className="pt-6 border-t border-slate-200">
                <p className="text-lg md:text-xl text-slate-700 text-center">
                  Quando a rotina se adapta a você,{" "}
                  <span className="font-bold text-slate-900">
                    seguir deixa de ser um esforço constante.
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BLOCO 6 — OFERTA ============ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
              Dê uma chance pra você
            </h2>

            {/* Offer Card */}
            <div className="bg-gradient-to-br from-[#A3E635] to-lime-400 rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-[#84cc16]">
              <div className="space-y-6">
                {/* Badge */}
                <Badge className="bg-white/30 backdrop-blur-sm text-slate-900 border-0 text-sm px-4 py-2 font-bold">
                  CONDIÇÃO ESPECIAL
                </Badge>

                {/* Plan name */}
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Plano Anual
                </h3>

                {/* Discount */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 inline-block">
                  <span className="text-5xl md:text-6xl font-black text-slate-900">
                    33% OFF
                  </span>
                </div>

                {/* Price */}
                <div>
                  <div className="text-slate-900/70 line-through text-lg mb-2">
                    De R$ 129,90
                  </div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl md:text-6xl font-black text-slate-900">
                      R$ 87,00
                    </span>
                    <span className="text-xl text-slate-900/70">/ ano</span>
                  </div>
                </div>

                {/* Benefits */}
                <ul className="space-y-3 text-left max-w-md mx-auto">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-900">Acesso completo ao app</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-900">Rotina personalizada que se adapta</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-900">Todo conteúdo e funcionalidades</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-900">Garantia de 7 dias</span>
                  </li>
                </ul>

                {/* CTA */}
                <motion.div
                  className="pt-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => handleCTA("offer")}
                    size="lg"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold py-6 rounded-xl shadow-2xl"
                  >
                    👉 Quero tentar do meu jeito
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
                <span>Pagamento 100% seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
                <span>Cancele quando quiser</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
                <span>Garantia de 7 dias</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BLOCO FINAL — FECHAMENTO EMOCIONAL ============ */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-[#A3E635]/20 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-[#A3E635]" />
            </div>

            <p className="text-xl md:text-2xl text-slate-700 leading-relaxed">
              Você não precisa se transformar do dia para a noite.
            </p>

            <p className="text-2xl md:text-3xl font-bold text-slate-900">
              Basta construir uma versão que o seu eu do futuro se orgulhe.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-12 px-4 md:px-6 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <picture>
            <source srcSet="/assets/logo_bora.webp" type="image/webp" />
            <img
              src="/assets/logo_bora.png"
              alt="Bora"
              className="h-8 w-auto mx-auto opacity-70"
            />
          </picture>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Bora. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RecAqLanding;
