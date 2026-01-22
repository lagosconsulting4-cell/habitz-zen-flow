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
  Shield,
  Eye,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/hooks/useAnimations";
import { useTracking } from "@/hooks/useTracking";

// Checkout link for 33% discount offer
const CHECKOUT_LINK = "https://payfast.greenn.com.br/154673/offer/Y5uyP3";

const MiniLanding = () => {
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

    // Header and hero CTAs scroll to offer section
    if (location === "header" || location === "hero") {
      const offerSection = document.getElementById("offer");
      if (offerSection) {
        offerSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    // Only offer CTA goes to checkout
    else if (location === "offer") {
      window.location.href = CHECKOUT_LINK;
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
              onClick={() => handleCTA("header")}
              className="bg-[#A3E635] hover:bg-[#A3E635]/90 text-slate-900 font-semibold px-6 py-2 rounded-full shadow-lg shadow-[#A3E635]/25"
            >
              Começar agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* ============ HERO — ALÍVIO IMEDIATO ============ */}
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
                  <Shield className="w-4 h-4 mr-2" />
                  Sem pressão, sem culpa
                </Badge>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-slate-900"
                variants={staggerItem}
              >
                Se organizar não deveria{" "}
                <span className="text-[#A3E635] relative">
                  ser tão difícil.
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#A3E635]/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                variants={staggerItem}
              >
                Se você já tentou criar uma rotina, manter hábitos ou organizar seus dias
                e não conseguiu sustentar por muito tempo,{" "}
                <strong className="text-slate-900">isso não significa que tem algo errado com você.</strong>
              </motion.p>

              {/* CTA */}
              <motion.div variants={staggerItem} className="pt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleCTA("hero")}
                    size="lg"
                    className="group bg-[#A3E635] hover:bg-[#A3E635]/90 text-slate-900 text-base sm:text-lg px-8 py-6 rounded-full font-bold shadow-xl shadow-[#A3E635]/30"
                  >
                    👉 Quero organizar minha rotina do meu jeito
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
                  <source srcSet="/images/lp/hero_mockup.webp" type="image/webp" />
                  <img
                    src="/images/lp/mockup-app-vertical.png"
                    alt="Bora App Interface"
                    className="relative z-10 w-full h-auto drop-shadow-2xl"
                  />
                </picture>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ BLOCO 2 — NORMALIZAÇÃO DA DOR ============ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xl md:text-2xl font-bold text-slate-900 text-center leading-relaxed">
              A maioria das pessoas falha não por falta de disciplina, mas porque tenta encaixar sistemas irreais em uma vida real.
            </p>

            <div className="bg-white rounded-2xl p-8 md:p-10 border-2 border-slate-200 space-y-4">
              <ul className="space-y-3 text-base md:text-lg text-slate-700">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-slate-400 rounded-full flex-shrink-0"></span>
                  <span>Dias corridos.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-slate-400 rounded-full flex-shrink-0"></span>
                  <span>Energia baixa.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-slate-400 rounded-full flex-shrink-0"></span>
                  <span>Imprevistos.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-slate-400 rounded-full flex-shrink-0"></span>
                  <span>Cansaço mental.</span>
                </li>
              </ul>

              <p className="text-base text-slate-600 pt-4">
                Nenhuma rotina "perfeita" sobrevive a isso.
              </p>
            </div>

            <div className="text-center pt-6">
              <p className="text-lg md:text-xl text-slate-700 mb-2">
                E quando não funciona, a culpa sempre cai na mesma pessoa:
              </p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">
                você.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BLOCO 3 — QUEBRA DE CRENÇA ============ */}
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
                Talvez você só tenha tentado métodos que exigiam mais do que você tinha para dar:
              </p>

              <ul className="space-y-3 text-base md:text-lg text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>mais tempo,</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>mais foco,</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>mais força de vontade.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-5 text-base md:text-lg text-slate-700 pt-6">
              <p className="text-xl md:text-2xl font-bold text-[#A3E635] text-center">
                Aqui, a lógica é diferente.
              </p>

              <div className="space-y-3">
                <p>Não é sobre virar uma pessoa super organizada do dia pra noite.</p>
                <p>Não é sobre acordar às 5h, se não fizer sentido.</p>
                <p>Não é sobre fazer tudo certo todos os dias.</p>
              </div>

              <div className="bg-[#A3E635]/10 rounded-xl p-6 border border-[#A3E635]/30 mt-6">
                <p className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
                  É sobre entender como sua vida realmente funciona hoje.
                </p>
                <div className="space-y-2 text-slate-700">
                  <p>Sem se comparar.</p>
                  <p>Sem se cobrar.</p>
                  <p>Sem julgamento.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BLOCO 4 — O MECANISMO CENTRAL ============ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <Badge className="px-4 py-2 bg-[#A3E635]/10 text-[#A3E635] border border-[#A3E635]/30 text-sm font-semibold mb-6">
                <Eye className="w-4 h-4 mr-2" />
                Clareza em primeiro lugar
              </Badge>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Antes de qualquer mudança, vem a clareza.
              </h2>
            </div>

            <div className="space-y-5 text-base md:text-lg text-slate-700">
              <p className="text-center">Cada pessoa vive uma rotina diferente.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
                <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
                  <Calendar className="w-8 h-8 text-[#A3E635] mx-auto mb-3" />
                  <p className="font-semibold text-slate-900">Horários diferentes</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
                  <Zap className="w-8 h-8 text-[#A3E635] mx-auto mb-3" />
                  <p className="font-semibold text-slate-900">Níveis de energia diferentes</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
                  <Users className="w-8 h-8 text-[#A3E635] mx-auto mb-3" />
                  <p className="font-semibold text-slate-900">Responsabilidades diferentes</p>
                </div>
              </div>

              <p className="text-center text-slate-600">
                Então não faz sentido aplicar a mesma fórmula para todo mundo.
              </p>

              <div className="bg-[#A3E635] rounded-2xl p-8 md:p-10 text-slate-900 space-y-4 mt-8">
                <p className="text-xl md:text-2xl font-bold">
                  👉 O primeiro passo não é mudar.
                </p>
                <p className="text-xl md:text-2xl font-bold">
                  👉 O primeiro passo é entender.
                </p>
                <p className="text-lg mt-6 font-semibold">
                  O Bora foi criado para isso.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BLOCO 5 — O QUE É O BORA ============ */}
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
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                Um app que te ajuda a organizar sua rotina de forma simples, flexível e possível.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 md:p-10 border-2 border-slate-200">
              <p className="text-lg text-slate-700 mb-6 font-semibold">
                Ele funciona assim:
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#A3E635] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <span className="text-base md:text-lg text-slate-700 pt-1">
                    Você entende como seus dias realmente são
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#A3E635] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <span className="text-base md:text-lg text-slate-700 pt-1">
                    Cria uma estrutura mínima que caiba na sua rotina
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#A3E635] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <span className="text-base md:text-lg text-slate-700 pt-1">
                    Ajusta tudo conforme sua energia, tempo e contexto
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#A3E635] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <span className="text-base md:text-lg text-slate-700 pt-1">
                    Mantém constância sem depender de motivação
                  </span>
                </li>
              </ul>

              <div className="mt-8 pt-8 border-t border-slate-300 space-y-2 text-center">
                <p className="text-base text-slate-600">Nada rígido.</p>
                <p className="text-base text-slate-600">Nada fora da sua realidade.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BLOCO 6 — COMO FUNCIONA NA PRÁTICA ============ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <Badge className="px-4 py-2 bg-[#A3E635]/10 text-[#A3E635] border border-[#A3E635]/30 text-sm font-semibold mb-6">
                <Lightbulb className="w-4 h-4 mr-2" />
                Na prática
              </Badge>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                No Bora, você não começa fazendo mais.
                <br />
                <span className="text-[#A3E635]">Você começa fazendo caber.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-[#A3E635] mb-3" />
                <p className="font-semibold text-slate-900 mb-2">Rotinas pequenas e ajustáveis</p>
                <p className="text-sm text-slate-600">Começam simples e crescem com você</p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-[#A3E635] mb-3" />
                <p className="font-semibold text-slate-900 mb-2">Organização sem sobrecarga mental</p>
                <p className="text-sm text-slate-600">Clareza visual sem complicação</p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-[#A3E635] mb-3" />
                <p className="font-semibold text-slate-900 mb-2">Estrutura que funciona até nos dias cansativos</p>
                <p className="text-sm text-slate-600">Se adapta à sua energia real</p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-[#A3E635] mb-3" />
                <p className="font-semibold text-slate-900 mb-2">Clareza no lugar de culpa</p>
                <p className="text-sm text-slate-600">Entendimento, não julgamento</p>
              </div>
            </div>

            <div className="text-center pt-6 space-y-3">
              <p className="text-lg text-slate-700">
                Não é sobre transformar a sua vida em 5 dias.
              </p>
              <p className="text-xl md:text-2xl font-bold text-slate-900">
                É sobre construir a sua melhor versão do futuro.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BLOCO 7 — PARA QUEM É ============ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center">
              O Bora é para você se:
            </h2>

            <div className="space-y-4">
              <div className="bg-[#A3E635]/10 rounded-xl p-6 border border-[#A3E635]/30">
                <p className="text-base md:text-lg text-slate-800">
                  – Vive tentando se organizar, mas nunca sustenta
                </p>
              </div>

              <div className="bg-[#A3E635]/10 rounded-xl p-6 border border-[#A3E635]/30">
                <p className="text-base md:text-lg text-slate-800">
                  – Se sente cansado só de pensar em "rotina"
                </p>
              </div>

              <div className="bg-[#A3E635]/10 rounded-xl p-6 border border-[#A3E635]/30">
                <p className="text-base md:text-lg text-slate-800">
                  – Já tentou métodos que não cabiam na sua realidade
                </p>
              </div>

              <div className="bg-[#A3E635]/10 rounded-xl p-6 border border-[#A3E635]/30">
                <p className="text-base md:text-lg text-slate-800">
                  – Quer mais clareza, não mais cobrança
                </p>
              </div>
            </div>

            <div className="bg-slate-100 rounded-xl p-6 text-center border border-slate-300 mt-8">
              <p className="text-base text-slate-700">
                E <strong>não é</strong> para quem busca fórmulas mágicas ou mudanças radicais.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BLOCO 8 — CONVITE SUAVE + OFERTA ============ */}
      <section id="offer" className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Convite suave */}
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-[#A3E635]/20 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-[#A3E635]" />
              </div>

              <div className="space-y-3 text-lg md:text-xl text-slate-700">
                <p>Você não precisa estar motivado.</p>
                <p>Não precisa mudar tudo agora.</p>
                <p>Não precisa "começar direito".</p>
              </div>

              <p className="text-2xl md:text-3xl font-bold text-slate-900 pt-4">
                Você só precisa começar do jeito que dá.
              </p>

              <p className="text-lg text-slate-600 pt-6">
                Se fizer sentido, você pode testar o Bora agora.
              </p>
            </div>

            {/* Offer Card */}
            <div className="bg-gradient-to-br from-[#A3E635] to-lime-400 rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-[#84cc16]">
              <div className="space-y-6 text-center">
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
                  <p className="text-base text-slate-900 font-semibold mt-2">
                    Plano Anual
                  </p>
                </div>

                {/* Benefits */}
                <ul className="space-y-3 text-left max-w-md mx-auto">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-900">Acesso completo ao app</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-900">Rotina que se adapta a você</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-900">Organização sem sobrecarga</span>
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
                    👉 Quero construir a minha melhor versão
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

export default MiniLanding;
