import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { bonusDetails } from "@/components/BonusCards";

// Link de pagamento Stripe - Plano Anual
const STRIPE_LINK_ANNUAL = "https://buy.stripe.com/6oU3cv3aQ16Wd6UeG09oc00";

export const OfferSlide = () => {
  const totalValue = 805; // Soma dos bônus
  const offerPrice = 99.90; // Preço anual
  const monthlyEquivalent = "8,33"; // R$ 99,90 / 12 meses
  const discount = 88; // % desconto (de R$ 805 para R$ 99,90)

  const handleSubscribe = () => {
    window.location.href = STRIPE_LINK_ANNUAL;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
          <Gift className="w-3 h-3 mr-1" />
          Oferta Exclusiva
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Sua rotina + todos os bônus
        </h2>
        <p className="text-slate-600 text-lg">
          Transformação completa por menos de um café por dia
        </p>
      </motion.div>

      {/* Countdown Timer */}
      <div className="flex justify-center">
        <CountdownTimer variant="pricing" />
      </div>

      {/* Bônus Grid - REUTILIZA estrutura de BonusCards.tsx */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {bonusDetails.map((bonus, index) => (
          <motion.div
            key={bonus.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="aspect-[3/4] relative">
              <img
                src={bonus.coverImage}
                alt={bonus.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-bold text-sm leading-tight mb-1">
                  {bonus.title}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-xs line-through">
                    R$ {bonus.value}
                  </span>
                  <span className="text-[#A3E635] text-xs font-bold">
                    GRÁTIS
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Value Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-center"
      >
        <div className="mb-6">
          <Badge className="bg-red-500 text-white border-0 text-2xl font-black px-6 py-3 shadow-xl mb-4 animate-pulse">
            {discount}% OFF
          </Badge>
          <div className="text-slate-400 line-through text-2xl mb-2">
            De R$ {totalValue}
          </div>
          <div className="mb-2">
            <div className="text-[#A3E635] text-lg font-bold mb-1">Por apenas</div>
            <div className="text-6xl font-black bg-gradient-to-r from-[#A3E635] via-lime-300 to-[#A3E635] bg-clip-text text-transparent">
              R${offerPrice}
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            1 ano de acesso • Equivale a R${monthlyEquivalent}/mês
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleSubscribe}
          size="lg"
          className="w-full bg-[#A3E635] hover:bg-[#84cc16] text-slate-900 font-black text-xl py-7 rounded-xl shadow-xl shadow-[#A3E635]/30"
        >
          <Sparkles className="w-6 h-6 mr-2" />
          GARANTIR MINHA VAGA
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>

        <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
          Garantia incondicional de 7 dias
        </div>
      </motion.div>

      {/* Guarantee Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-3 p-4 bg-[#A3E635]/10 rounded-2xl border border-[#A3E635]/30"
      >
        <Shield className="w-8 h-8 text-[#A3E635]" />
        <div className="text-left">
          <p className="font-bold text-slate-900 text-sm">100% Garantido</p>
          <p className="text-xs text-slate-600">
            Se não gostar, devolvemos seu dinheiro. Sem perguntas.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
