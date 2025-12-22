import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { fadeInUp, buttonHoverTap } from "@/hooks/useAnimations";

// Links de pagamento do Stripe
const STRIPE_LINK_MONTHLY = "https://buy.stripe.com/eVq14n6n216Wff29lG9oc01";
const STRIPE_LINK_ANNUAL = "https://buy.stripe.com/6oU3cv3aQ16Wd6UeG09oc00";

export const SubscriptionOffersStep = () => {
  const handleSubscribe = (plan: "monthly" | "annual") => {
    const link = plan === "monthly" ? STRIPE_LINK_MONTHLY : STRIPE_LINK_ANNUAL;
    window.location.href = link;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-5xl w-full space-y-8"
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
            <Crown className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            Queremos que você teste a sua rotina personalizada por{" "}
            <span className="text-[#A3E635]">3 dias</span>
          </h2>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Você receberá um aviso no app para cancelar, caso deseje.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Card Mensal */}
          <motion.div
            className="relative bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="space-y-6">
              {/* Plan Name */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Plano Mensal</h3>
                <p className="text-sm text-slate-600 mt-1">Flexibilidade total</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900">R$ 19,90</span>
                <span className="text-lg text-slate-600">/mês</span>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {[
                  "Rotina 100% personalizada",
                  "Checklists diários inteligentes",
                  "Progresso e streak tracking",
                  "Lembretes personalizados",
                  "Meditações guiadas",
                  "Cancelamento a qualquer momento",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#A3E635] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.div {...buttonHoverTap}>
                <Button
                  onClick={() => handleSubscribe("monthly")}
                  variant="outline"
                  size="lg"
                  className="w-full text-lg font-bold py-6 rounded-xl border-2 border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Assinar Mensal
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Card Anual - DESTAQUE */}
          <motion.div
            className="relative bg-gradient-to-br from-[#A3E635] to-lime-400 rounded-3xl p-8 shadow-2xl hover:shadow-[#A3E635]/50 transition-all duration-300 hover:-translate-y-2 border-2 border-[#84cc16]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-slate-900 text-white border-0 text-sm px-4 py-2 font-bold shadow-lg">
                <Zap className="w-4 h-4 mr-1" />
                MAIS ESCOLHIDO
              </Badge>
            </div>

            <div className="space-y-6">
              {/* Plan Name */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Plano Anual</h3>
                <p className="text-sm text-slate-900/70 mt-1 font-semibold">
                  Melhor custo-benefício
                </p>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900">R$ 99,90</span>
                  <span className="text-lg text-slate-900/70">/ano</span>
                </div>
                <p className="text-sm text-slate-900/70 mt-2 font-semibold">
                  Equivale a ~R$ 8,33/mês
                </p>
              </div>

              {/* Savings Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-bold text-slate-900">
                  💰 Economize R$ 139,00/ano
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {[
                  "Tudo do plano mensal",
                  "Acesso a novos recursos primeiro",
                  "Suporte prioritário",
                  "Sessões bônus exclusivas",
                  "Desconto em produtos parceiros",
                  "Garantia de 7 dias",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-slate-900 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.div {...buttonHoverTap}>
                <Button
                  onClick={() => handleSubscribe("annual")}
                  size="lg"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold py-6 rounded-xl shadow-xl"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Assinar Anual
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
                Se você não gostar, devolvemos 100% do seu dinheiro. Sem perguntas, sem complicação.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
