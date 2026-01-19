import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, Gift } from "lucide-react";
import { buttonHoverTap } from "@/hooks/useAnimations";
import { useState } from "react";
import { PixIncentiveModal } from "@/components/PixIncentiveModal";

// Links de pagamento
const STRIPE_LINK_WEEKLY = "https://buy.stripe.com/14A4gz7r62b01ocdBW9oc02";
const STRIPE_LINK_MONTHLY = "https://buy.stripe.com/cNidR9dPuaHwaYM41m9oc03";
const STRIPE_LINK_ANNUAL = "https://payfast.greenn.com.br/154673";
const STRIPE_LINK_ANNUAL_PIX = "https://payfast.greenn.com.br/154673/offer/x31A0y";

export const SubscriptionOffersStep = () => {
  const [showPixModal, setShowPixModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly" | "annual">("annual");

  const handleSubscribe = (plan: "weekly" | "monthly" | "annual") => {
    setSelectedPlan(plan);
    setShowPixModal(true);
  };

  const handlePixAccept = () => {
    // Sempre redireciona para o link PIX do plano anual (20% desconto)
    window.location.href = STRIPE_LINK_ANNUAL_PIX;
  };

  const handlePixDecline = () => {
    setShowPixModal(false);
    // Redireciona para o plano que foi originalmente escolhido
    let link = STRIPE_LINK_MONTHLY;
    if (selectedPlan === "weekly") link = STRIPE_LINK_WEEKLY;
    if (selectedPlan === "monthly") link = STRIPE_LINK_MONTHLY;
    if (selectedPlan === "annual") link = STRIPE_LINK_ANNUAL;
    window.location.href = link;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-6xl w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#A3E635] to-lime-400 mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Gift className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            Escolha seu plano e comece{" "}
            <span className="text-[#A3E635]">sua transformação</span>
          </h2>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Você pode testar com calma. Se não fizer sentido, é só cancelar. Sem pressão. Sem pegadinha.
          </p>
        </div>

        {/* Pricing Cards - 3 PLANOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Card Semanal */}
          <motion.div
            className="relative bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="space-y-5">
              {/* Badge */}
              <Badge className="bg-slate-500 text-white border-0 text-xs px-3 py-1">
                FLEXÍVEL
              </Badge>

              {/* Plan Name */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Semanal</h3>
                <p className="text-sm text-slate-600 mt-1">Ideal pra estudante</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">R$ 19,90</span>
                <span className="text-base text-slate-600">/semana</span>
              </div>

              {/* Features */}
              <ul className="space-y-2.5">
                {[
                  "Rotina personalizada",
                  "Checklists diários",
                  "Progresso visual",
                  "Lembretes inteligentes",
                  "Cancele quando quiser",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#A3E635] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.div {...buttonHoverTap}>
                <Button
                  onClick={() => handleSubscribe("weekly")}
                  variant="outline"
                  size="lg"
                  className="w-full text-base font-bold py-5 rounded-xl border-2 border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  Começar agora
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Card Mensal */}
          <motion.div
            className="relative bg-white rounded-3xl p-6 border-2 border-blue-500 shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="space-y-5">
              {/* Badge */}
              <Badge className="bg-blue-500 text-white border-0 text-xs px-3 py-1">
                MELHOR CUSTO-BENEFÍCIO
              </Badge>

              {/* Plan Name */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Mensal</h3>
                <p className="text-sm text-slate-600 mt-1">Equilíbrio perfeito</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">R$ 29,90</span>
                <span className="text-base text-slate-600">/mês</span>
              </div>

              {/* Features */}
              <ul className="space-y-2.5">
                {[
                  "Tudo do Semanal +",
                  "🧘 Meditações guiadas",
                  "📚 Hub de livros",
                  "🎯 Jornada guiada de 30 dias",
                  "Economia de 25%",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-sm text-slate-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.div {...buttonHoverTap}>
                <Button
                  onClick={() => handleSubscribe("monthly")}
                  size="lg"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base font-bold py-5 rounded-xl shadow-xl"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Começar agora
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Card Anual */}
          <motion.div
            className="relative bg-gradient-to-br from-[#A3E635] to-lime-400 rounded-3xl p-6 shadow-2xl hover:shadow-[#A3E635]/50 transition-all duration-300 hover:-translate-y-2 border-2 border-[#84cc16]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            style={{ transform: 'scale(1.05)' }}
          >
            <div className="space-y-5">
              {/* Badge */}
              <Badge className="bg-white/30 backdrop-blur-sm text-slate-900 border-0 text-xs px-3 py-1 font-bold">
                ACOMPANHAMENTO COMPLETO
              </Badge>

              {/* Plan Name */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Anual</h3>
                <p className="text-sm text-slate-900/70 mt-1 font-semibold">
                  Comprometimento total
                </p>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">R$ 129,90</span>
                  <span className="text-base text-slate-900/70">/ano</span>
                </div>
                <p className="text-sm text-slate-900/80 mt-2 font-bold">
                  Ou 12x de R$ 13,36
                </p>
              </div>

              {/* Savings Badge */}
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                <span className="text-sm font-bold text-slate-900">
                  💰 Economize R$ 229/ano (64%)
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-2.5">
                {[
                  "Tudo do Mensal +",
                  "🏆 Programa de 12 meses",
                  "🎁 27 dicas práticas",
                  "📖 Biblioteca completa",
                  "🌟 Suporte prioritário",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-slate-900 flex-shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-sm text-slate-900 font-bold">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.div {...buttonHoverTap}>
                <Button
                  onClick={() => handleSubscribe("annual")}
                  size="lg"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-base font-bold py-5 rounded-xl shadow-2xl"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Começar agora
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Trust indicators */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#A3E635]" />
            <span>Pagamento 100% seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#A3E635]" />
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#A3E635]" />
            <span>Sem taxas ocultas</span>
          </div>
        </motion.div>

        {/* Guarantee */}
        <motion.div
          className="max-w-2xl mx-auto bg-slate-50 rounded-2xl p-6 border border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#A3E635]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">
                Garantia de 7 Dias
              </h4>
              <p className="text-sm text-slate-600">
                Não curtiu? Pega o dinheiro de volta. Sem enrolação, sem perguntas.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* PIX Incentive Modal */}
      <PixIncentiveModal
        isOpen={showPixModal}
        onClose={handlePixDecline}
        onAccept={handlePixAccept}
        planType="annual"
      />
    </div>
  );
};
