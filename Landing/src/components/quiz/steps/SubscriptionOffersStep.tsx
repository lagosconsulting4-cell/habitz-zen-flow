import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, Gift, HelpCircle } from "lucide-react";
import { buttonHoverTap } from "@/hooks/useAnimations";
import { useState } from "react";
import { PixIncentiveModal } from "@/components/PixIncentiveModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Links de pagamento
const STRIPE_LINK_WEEKLY = "https://buy.stripe.com/14A4gz7r62b01ocdBW9oc02";
const STRIPE_LINK_MONTHLY = "https://buy.stripe.com/cNidR9dPuaHwaYM41m9oc03";
const STRIPE_LINK_ANNUAL = "https://payfast.greenn.com.br/154673/offer/IdSMYu?ch_id=135346&b_id_1=154675&b_offer_1=lkH71W";
const STRIPE_LINK_ANNUAL_PIX = "https://payfast.greenn.com.br/154673/offer/IdSMYu";

// FAQ
const faqs = [
  {
    question: "Quanto tempo preciso dedicar por dia?",
    answer: "De 5 a 15 minutos na média. O app se adapta ao SEU tempo disponível. Se você disse que tem 5 minutos, vai receber só hábitos de 5 minutos. Sem forçar.",
  },
  {
    question: "Funciona mesmo se eu já tentei de tudo?",
    answer: "Sim! O BORA é diferente porque funciona automático. Você não precisa 'aprender' nada ou fazer esforço. Só seguir o que o app manda. Simples assim.",
  },
  {
    question: "E se eu não gostar?",
    answer: "Tem garantia de 7 dias. Não curtiu? Pega o dinheiro de volta. Sem enrolação, sem perguntas.",
  },
  {
    question: "Preciso baixar algum app?",
    answer: "Não precisa baixar nada! Funciona direto no navegador do seu celular. Salva na tela inicial e usa como app. Offline e tudo.",
  },
];

export const SubscriptionOffersStep = () => {

  return (
    <div className="w-full flex flex-col items-center">
      {/* Background decorations - removed to fix white bg issue */}

      <motion.div
        className="relative z-10 max-w-6xl w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-lime-500/10 mb-4 ring-1 ring-lime-500/20 shadow-[0_0_30px_rgba(132,204,22,0.2)]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Gift className="w-10 h-10 text-lime-400" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Seu Protocolo de <span className="text-lime-400">Desbloqueio</span> está pronto
          </h2>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Você está a poucos passos de construir a sua nova versão, escolha o plano que faz mais sentido para você
          </p>
        </div>

        {/* Pricing Cards - 3 PLANOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card Anual - PRIMEIRO */}
          <motion.div
            className="relative bg-gradient-to-br from-lime-500/10 to-lime-600/5 rounded-3xl p-6 shadow-2xl hover:shadow-lime-500/20 transition-all duration-300 hover:-translate-y-2 border border-lime-500/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            style={{ transform: 'scale(1.05)' }}
          >
            <div className="space-y-5 relative z-10">
              {/* Badge */}
              <Badge className="bg-lime-400 text-slate-900 border-0 text-xs px-3 py-1 font-bold shadow-[0_0_15px_rgba(163,230,53,0.4)]">
                72% OFF
              </Badge>

              {/* Plan Name */}
              <div>
                <h3 className="text-2xl font-bold text-white">Anual</h3>
                <p className="text-sm text-lime-400 mt-1 font-semibold">
                  Comprometimento total
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">R$ 9,97</span>
                <span className="text-base text-slate-500">/mês</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                (menos de R$ 0,33 por dia)
              </p>
            </div>


            {/* Features */}
            <ul className="space-y-2.5 mt-4">
              {[
                "Tudo do Mensal +",
                "🏆 Programa de 12 meses",
                "🎁 27 dicas práticas",
                "📖 Biblioteca completa",
                "🌟 Suporte prioritário",
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="text-sm text-slate-200 font-bold">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <motion.div {...buttonHoverTap} className="flex flex-col items-center">
              <Button
                onClick={() => window.location.href = STRIPE_LINK_ANNUAL}
                size="lg"
                className="w-full bg-lime-400 hover:bg-lime-500 text-slate-900 text-base font-bold py-5 rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] transition-all"
              >
                <Crown className="w-4 h-4 mr-2" />
                COMEÇAR AGORA
              </Button>
              <div className="flex flex-col items-center mt-3 space-y-1">
                {/* Link removido a pedido */}
              </div>
            </motion.div>
          </motion.div>

          {/* Card Mensal */}
          <motion.div
            className="relative bg-[#1A1A1C] rounded-3xl p-6 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-lime-500/30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="space-y-5">

              {/* Plan Name */}
              <div>
                <h3 className="text-2xl font-bold text-white">Mensal</h3>
                <p className="text-sm text-slate-400 mt-1">Equilíbrio perfeito</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">R$ 29,90</span>
                <span className="text-base text-slate-500">/mês</span>
              </div>

              {/* Features */}
              <ul className="space-y-2.5">
                {[
                  "Rotina personalizada",
                  "🧘 Meditações guiadas",
                  "📚 Hub de livros",
                  "🎯 Jornada guiada de 30 dias",
                  "Acesso imediato",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.div {...buttonHoverTap}>
                <Button
                  onClick={() => window.location.href = STRIPE_LINK_MONTHLY}
                  variant="outline"
                  size="lg"
                  className="w-full text-base font-bold py-5 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-lime-500/50 transition-all"
                >
                  Começar agora
                </Button>
              </motion.div>
            </div>
          </motion.div >

        </div >

        {/* Trust indicators */}
        < motion.div
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-lime-400" />
            <span>Pagamento 100% seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-lime-400" />
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-lime-400" />
            <span>Sem taxas ocultas</span>
          </div>
        </motion.div >

        {/* Guarantee */}
        < motion.div
          className="max-w-2xl mx-auto bg-[#1A1A1C] rounded-2xl p-6 border border-white/10 hover:border-lime-500/30 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-lime-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">
                Garantia de 7 Dias
              </h4>
              <p className="text-sm text-slate-400">
                Não curtiu? Pega o dinheiro de volta. Sem enrolação, sem perguntas.
              </p>
            </div>
          </div>
        </motion.div >

        {/* FAQ Section */}
        < motion.div
          className="max-w-2xl mx-auto mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-lime-400" />
              <h3 className="text-xl font-bold text-white">
                Dúvidas frequentes
              </h3>
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-[#1A1A1C] rounded-xl border border-white/10 px-5 shadow-sm hover:border-lime-500/30 transition-colors data-[state=open]:border-lime-500/50 data-[state=open]:bg-[#1A1A1C]"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-4 text-sm text-white hover:text-lime-400 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 pb-4 text-sm leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div >
      </motion.div >


    </div >
  );
};
