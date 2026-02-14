import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, HelpCircle, Shield, Zap } from "lucide-react";
import { buttonHoverTap } from "@/hooks/useAnimations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Links de pagamento
const STRIPE_LINK_MONTHLY = "https://buy.stripe.com/cNidR9dPuaHwaYM41m9oc03";
const STRIPE_LINK_ANNUAL = "https://pay.hub.la/91TKYeHy1alHwSXn8yJz";

const faqs = [
  {
    question: "Quanto tempo preciso dedicar por dia?",
    answer: "De 5 a 15 minutos na média. O app se adapta ao SEU tempo disponível.",
  },
  {
    question: "Funciona mesmo se eu já tentei de tudo?",
    answer: "Sim! O BORA funciona automático. Você não precisa aprender nada — só seguir o que o app manda.",
  },
  {
    question: "E se eu não gostar?",
    answer: "Tem garantia de 7 dias. Não curtiu? Pega o dinheiro de volta. Sem enrolação.",
  },
  {
    question: "Preciso baixar algum app?",
    answer: "Não! Funciona direto no navegador do celular. Salva na tela inicial e usa como app.",
  },
];

export const SubscriptionOffersStep = () => {
  return (
    <div className="w-full flex flex-col items-center">
      <motion.div
        className="relative z-10 max-w-6xl w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Seu plano de <span className="text-lime-400">evolução personalizado</span> está pronto
          </h2>
          <p className="text-base text-slate-400 max-w-xl mx-auto">
            Escolha o plano que faz mais sentido para você
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card Anual - DESTAQUE */}
          <motion.div
            className="relative bg-gradient-to-br from-lime-500/10 to-lime-600/5 rounded-3xl p-6 shadow-2xl border border-lime-500/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ transform: "scale(1.03)" }}
          >
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-lime-400 text-slate-900 border-0 px-4 py-1 font-bold text-xs shadow-[0_0_20px_rgba(163,230,53,0.4)]">
                MAIS POPULAR • 72% OFF
              </Badge>
            </div>

            <div className="space-y-5 pt-2">
              <div>
                <h3 className="text-2xl font-bold text-white">Anual</h3>
                <p className="text-sm text-lime-400 mt-1 font-semibold">Comprometimento total</p>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-slate-500 line-through">R$ 35,88</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-5xl font-black text-white">R$ 9,86</span>
                  <span className="text-base text-slate-500">/mês</span>
                </div>
                <p className="text-xs text-lime-400/70 mt-1 font-medium">
                  = R$ 0,32 por dia • Menos que um café
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5">
                {[
                  "Rotina personalizada por IA",
                  "Meditações guiadas",
                  "Hub de livros completo",
                  "Programa de 12 meses",
                  "27 dicas práticas exclusivas",
                  "Suporte prioritário",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-sm text-slate-200 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.div {...buttonHoverTap}>
                <Button
                  onClick={() => (window.location.href = STRIPE_LINK_ANNUAL)}
                  size="lg"
                  className="w-full bg-lime-400 hover:bg-lime-500 text-slate-900 text-base font-bold py-6 rounded-xl shadow-[0_0_25px_rgba(163,230,53,0.3)] hover:shadow-[0_0_35px_rgba(163,230,53,0.5)] transition-all"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Começar a minha evolução
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Card Mensal */}
          <motion.div
            className="relative bg-[#1A1A1C] rounded-3xl p-6 border border-white/10 shadow-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-bold text-white">Mensal</h3>
                <p className="text-sm text-slate-400 mt-1">Sem compromisso</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">R$ 29,90</span>
                <span className="text-base text-slate-500">/mês</span>
              </div>

              <ul className="space-y-2.5">
                {[
                  "Rotina personalizada",
                  "Meditações guiadas",
                  "Hub de livros",
                  "Jornada de 30 dias",
                  "Acesso imediato",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.div {...buttonHoverTap}>
                <Button
                  onClick={() => (window.location.href = STRIPE_LINK_MONTHLY)}
                  variant="outline"
                  size="lg"
                  className="w-full text-base font-bold py-5 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-lime-500/50 transition-all"
                >
                  Começar agora
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Social Proof Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-lime-500/5 border border-lime-500/20 rounded-full px-5 py-2.5">
            <Zap className="w-4 h-4 text-lime-400" />
            <span className="text-sm text-slate-300">
              <strong className="text-lime-400">847 pessoas</strong> começaram nos últimos 7 dias
            </span>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-lime-400" />
            <span>Pagamento seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-lime-400" />
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-lime-400" />
            <span>Sem taxas ocultas</span>
          </div>
        </motion.div>

        {/* Guarantee */}
        <motion.div
          className="max-w-2xl mx-auto bg-[#1A1A1C] rounded-2xl p-6 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-lime-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Garantia de 7 Dias</h4>
              <p className="text-sm text-slate-400">
                Teste sem risco. Não curtiu? Devolução integral. Sem perguntas.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          className="max-w-2xl mx-auto mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-lime-400" />
              <h3 className="text-xl font-bold text-white">Dúvidas frequentes</h3>
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-[#1A1A1C] rounded-xl border border-white/10 px-5 shadow-sm hover:border-lime-500/30 transition-colors data-[state=open]:border-lime-500/50"
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
        </motion.div>
      </motion.div>
    </div>
  );
};
