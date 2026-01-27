import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  X,
  RefreshCw,
  Brain,
  Sparkles,
} from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/hooks/useAnimations";
import { useTracking } from "@/hooks/useTracking";

// Checkout link for Exclusive Condition offer
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

    // All CTAs scroll to offer section for warm lead flow
    if (location === "hero" || location === "bridge") {
      const offerSection = document.getElementById("offer");
      if (offerSection) {
        offerSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    // Offer CTA goes to checkout
    else if (location === "offer") {
      window.location.href = CHECKOUT_LINK;
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden w-full max-w-full font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ============ TOP BAR (STICKY) ============ */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-[#A3E635]/10 backdrop-blur-sm border-b border-[#A3E635]/20"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-[#A3E635]" />
          <p className="text-sm font-medium text-slate-700">
            <span className="font-semibold">Status:</span> Condição de Condição Exclusiva liberada para o seu perfil.
          </p>
        </div>
      </motion.div>

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 pt-32 pb-20 w-full overflow-hidden bg-gradient-to-b from-white via-[#A3E635]/5 to-white">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#A3E635_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.08]" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-[#A3E635]/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-0 w-[350px] h-[350px] bg-[#A3E635]/10 rounded-full blur-[100px]" />

        <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
          <motion.div
            className="space-y-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Headline */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] text-slate-900"
              variants={staggerItem}
            >
              Pare de brigar com o seu cérebro.{" "}
              <span className="text-[#A3E635] relative inline-block">
                O sistema que funciona nos seus "dias ruins" está pronto.
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#A3E635]/30"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,8 Q50,0 100,8 T200,8"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
              variants={staggerItem}
            >
              Você já entendeu que a rigidez destrói a constância. Agora, ative o único sistema
              desenhado para a realidade — e não para um mundo perfeito que não existe.
            </motion.p>

            {/* App Mockup */}
            <motion.div
              className="relative w-full max-w-sm mx-auto py-8"
              variants={staggerItem}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#A3E635]/20 to-lime-400/20 rounded-3xl blur-3xl" />
                <picture>
                  <source srcSet="/images/lp/hero_mockup.webp" type="image/webp" />
                  <img
                    src="/images/lp/mockup-app-vertical.png"
                    alt="Bora App Interface"
                    className="relative z-10 w-full h-auto drop-shadow-2xl rounded-2xl"
                  />
                </picture>
              </div>
            </motion.div>

            {/* CTA Principal */}
            <motion.div variants={staggerItem} className="pt-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => handleCTA("hero")}
                  size="lg"
                  className="group bg-[#A3E635] hover:bg-[#A3E635]/90 text-slate-900 text-lg font-bold px-10 py-7 rounded-xl shadow-2xl shadow-[#A3E635]/40 transition-all"
                >
                  QUERO MUDAR A MINHA ROTINA
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              {/* Microcopy */}
              <motion.p
                className="text-sm text-slate-500 mt-4 flex items-center justify-center gap-2"
                variants={staggerItem}
              >
                <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
                Garantia Blindada de 7 dias ou seu dinheiro de volta
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ SEÇÃO: A PONTE LÓGICA ============ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-2 border-[#A3E635]/30 shadow-xl bg-white">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900">
                  Por que esse preço especial?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-base md:text-lg text-slate-700 leading-relaxed">
                <p>
                  Se você chegou aqui, é porque nós conversamos no WhatsApp. Você faz parte de um
                  grupo seleto que já entendeu a verdade: o problema não é a sua{" "}
                  <strong className="text-slate-900">"falta de vergonha na cara"</strong>, é um{" "}
                  <strong className="text-[#A3E635]">Erro de Design de Rotina</strong>.
                </p>

                <p>
                  A maioria dos apps exige que você seja um robô.{" "}
                  <strong className="text-slate-900">O Bora foi desenhado para humanos.</strong>
                </p>

                <p>
                  Eu não quero que o preço seja uma barreira para você testar essa nova lógica.{" "}
                  <strong className="text-slate-900">
                    Por isso, liberei manualmente esta condição para o seu perfil.
                  </strong>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ============ SEÇÃO: O MECANISMO ============ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Título */}
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center">
              O que muda quando você ativa o Bora:
            </h2>

            {/* Grid de 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Adeus, Culpa */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full border-2 border-slate-200 hover:border-[#A3E635]/50 transition-colors shadow-md hover:shadow-xl">
                  <CardHeader className="text-center pb-3">
                    <div className="w-16 h-16 bg-[#A3E635]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <X className="w-8 h-8 text-[#A3E635]" strokeWidth={2.5} />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      Adeus, Culpa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-center leading-relaxed">
                      Se você não marcar "feito", o sistema não te pune. Ele recalcula a rota.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card 2: Adaptação Automática */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full border-2 border-slate-200 hover:border-[#A3E635]/50 transition-colors shadow-md hover:shadow-xl">
                  <CardHeader className="text-center pb-3">
                    <div className="w-16 h-16 bg-[#A3E635]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <RefreshCw className="w-8 h-8 text-[#A3E635]" strokeWidth={2.5} />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      Adaptação Automática
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-center leading-relaxed">
                      Dias de baixa energia? O sistema sugere o mínimo viável. Dias de alta energia? Ele libera o fluxo.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card 3: Neuro-Compatível */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="h-full border-2 border-slate-200 hover:border-[#A3E635]/50 transition-colors shadow-md hover:shadow-xl">
                  <CardHeader className="text-center pb-3">
                    <div className="w-16 h-16 bg-[#A3E635]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-[#A3E635]" strokeWidth={2.5} />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      Neuro-Compatível
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-center leading-relaxed">
                      Desenhado para liberar dopamina pelo progresso, não pela perfeição.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Frase de destaque */}
            <motion.div
              className="text-center pt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-2xl md:text-3xl font-bold text-slate-900">
                Não é sobre fazer mais.{" "}
                <span className="text-[#A3E635]">É sobre fazer caber.</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ SEÇÃO: AVERSÃO À PERDA (Fundo Escuro) ============ */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-slate-900 text-white relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black opacity-90" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#A3E635]/5 rounded-full blur-[150px]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center leading-tight">
              Uma pergunta sincera:{" "}
              <span className="text-[#A3E635]">
                Quanto custa continuar exatamente como você está?
              </span>
            </h2>

            {/* Texto principal */}
            <div className="space-y-6 text-base md:text-lg text-slate-300 leading-relaxed">
              <p>
                Faça um exercício mental rápido. Imagine que é Janeiro do ano que vem. Você olha
                para trás e vê que o ano passou voando.
              </p>

              <p>
                Você sente aquela mesma angústia no peito. A sensação de que correu, correu, mas
                não saiu do lugar. As mesmas metas engavetadas. A mesma culpa ao deitar no
                travesseiro.
              </p>

              {/* Destaque */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 my-8">
                <p className="text-xl md:text-2xl font-bold text-white text-center">
                  Esse é o custo real. Não é sobre o dinheiro.{" "}
                  <span className="text-[#A3E635]">É sobre o tempo de vida que não volta.</span>
                </p>
              </div>

              <p>
                Você tem <strong className="text-white">dois caminhos</strong> agora:
              </p>

              <div className="space-y-4 pl-4 border-l-4 border-[#A3E635]/30">
                <p>
                  <strong className="text-white">1.</strong> Continuar tentando "na força do ódio"
                  e falhando.
                </p>
                <p>
                  <strong className="text-white">2.</strong> Ou pagar o preço de um café por mês
                  para ter um Sistema que carrega esse peso por você.
                </p>
              </div>

              <p className="text-xl font-semibold text-white text-center pt-6">
                Não deixe mais um ano passar no "quase".
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ SEÇÃO DE OFERTA (Pricing Card Destacado) ============ */}
      <section id="offer" className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(#A3E635_1px,transparent_1px)] bg-[size:30px_30px] opacity-[0.05]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#A3E635]/10 rounded-full blur-[150px]" />

        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Pricing Card */}
            <Card className="border-4 border-[#A3E635] shadow-2xl bg-white overflow-hidden">
              {/* Header com Badge */}
              <CardHeader className="text-center bg-gradient-to-br from-[#A3E635]/10 to-transparent pb-8">
                <Badge className="mx-auto mb-4 px-4 py-2 bg-[#A3E635] text-slate-900 text-sm font-bold border-0">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sua condição de Condição Exclusiva
                </Badge>

                <CardTitle className="text-3xl md:text-4xl font-black text-slate-900">
                  Ative agora por:
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-8 pt-6 pb-10">
                {/* Preço De/Por */}
                <div className="text-center">
                  <p className="text-lg text-slate-500 line-through mb-3">De R$ 129,90</p>

                  {/* Preço Parcelado Simplificado */}
                  <div>
                    <div className="flex items-baseline justify-center gap-2 flex-wrap">
                      <span className="text-2xl md:text-3xl text-slate-700">Por apenas</span>
                      <span className="text-5xl md:text-6xl font-black text-slate-900">
                        12x
                      </span>
                      <span className="text-2xl md:text-3xl text-slate-700">de</span>
                      <span className="text-5xl md:text-6xl font-black text-[#A3E635]">
                        R$ 8,95
                      </span>
                    </div>
                    <p className="text-base text-slate-600 mt-3 font-medium">
                      por mês
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Plano Anual Completo
                    </p>
                  </div>
                </div>

                {/* Lista de Benefícios */}
                <ul className="space-y-4 max-w-md mx-auto">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#A3E635] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-base text-slate-700 font-medium">
                      ✅ Acesso Total ao App Bora
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#A3E635] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-base text-slate-700 font-medium">
                      ✅ Atualizações do Sistema Flexível
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#A3E635] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-base text-slate-700 font-medium">
                      ✅ Garantia de 7 dias (Risco Zero)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#A3E635] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-base text-slate-700 font-medium">
                      ✅ Suporte Direto (WhatsApp)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#A3E635] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-base text-slate-700 font-medium">
                      ✅ Estrutura Prontinha (Comece em 3 min)
                    </span>
                  </li>
                </ul>

                {/* CTA Principal */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleCTA("offer")}
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#A3E635] to-lime-400 hover:from-[#A3E635]/90 hover:to-lime-400/90 text-slate-900 text-xl font-black py-8 rounded-xl shadow-2xl shadow-[#A3E635]/40 border-2 border-[#84cc16]"
                  >
                    🎯 ATIVAR MINHA ROTINA AGORA
                  </Button>
                </motion.div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-4">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>Cancele quando quiser</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>Sem fidelidade</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Garantia Reforçada */}
            <motion.div
              className="bg-slate-900 rounded-2xl p-8 text-center border-2 border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-[#A3E635]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#A3E635]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Garantia Blindada de 7 Dias
              </h3>
              <p className="text-slate-300 leading-relaxed max-w-lg mx-auto">
                Se por qualquer motivo você sentir que o Bora não é pra você, é só pedir o
                reembolso. Sem burocracia, sem perguntas. O risco é todo meu.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-12 px-4 md:px-6 bg-slate-900 text-slate-300 border-t border-slate-800">
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
          <p className="text-xs text-slate-500">
            Feito para humanos, não para robôs.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MiniLanding;
