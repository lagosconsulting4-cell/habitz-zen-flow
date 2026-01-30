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
        <Badge className="mb-4 bg-lime-500/10 text-lime-400 border border-lime-500/20 shadow-lg shadow-lime-500/10">
          <Gift className="w-3 h-3 mr-1" />
          Oferta Exclusiva
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Sua rotina + todos os bônus
        </h2>
        <p className="text-slate-400 text-lg">
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
            className="group relative rounded-2xl overflow-hidden bg-[#1A1A1C] border border-white/10 shadow-lg hover:shadow-xl hover:border-lime-500/30 transition-all"
          >
            <div className="aspect-[3/4] relative">
              <img
                src={bonus.coverImage}
                alt={bonus.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-bold text-sm leading-tight mb-1">
                  {bonus.title}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs line-through">
                    R$ {bonus.value}
                  </span>
                  <span className="text-lime-400 text-xs font-bold">
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
        className="bg-gradient-to-br from-[#1A1A1C] to-[#121214] border border-gray-800 rounded-3xl p-6 md:p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-lime-500/30 to-transparent" />

        <div className="mb-6 relative z-10">
          <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-xl font-bold px-6 py-2 shadow-lg mb-4 animate-pulse">
            {discount}% OFF
          </Badge>
          <div className="text-slate-500 line-through text-2xl mb-2">
            De R$ {totalValue}
          </div>
          <div className="mb-2">
            <div className="text-lime-400 text-lg font-bold mb-1">Por apenas</div>
            <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(132,204,22,0.3)]">
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
          className="w-full bg-lime-400 hover:bg-lime-500 text-slate-900 font-black text-xl py-7 rounded-xl shadow-[0_0_30px_rgba(163,230,53,0.3)] hover:shadow-[0_0_40px_rgba(163,230,53,0.5)] transition-all"
        >
          <Sparkles className="w-6 h-6 mr-2" />
          GARANTIR MINHA VAGA
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>

        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <CheckCircle2 className="w-4 h-4 text-lime-500" />
          Garantia incondicional de 7 dias
        </div>
      </motion.div>

      {/* Guarantee Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-3 p-4 bg-[#1A1A1C] rounded-2xl border border-white/5"
      >
        <Shield className="w-8 h-8 text-lime-400" />
        <div className="text-left">
          <p className="font-bold text-white text-sm">100% Garantido</p>
          <p className="text-xs text-slate-400">
            Se não gostar, devolvemos seu dinheiro. Sem perguntas.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
