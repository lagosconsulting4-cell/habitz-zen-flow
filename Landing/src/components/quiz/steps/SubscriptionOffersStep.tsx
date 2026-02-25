import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, HelpCircle, Lock, Zap } from "lucide-react";
import { buttonHoverTap } from "@/hooks/useAnimations";
import { useTracking } from "@/hooks/useTracking";
import { useQuiz } from "../QuizProvider";
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

// ─── Phone Mockup ────────────────────────────────────────────────────────────

const PhoneMockup = () => (
  <div className="relative w-full max-w-xs mx-auto select-none">
    {/* Glow under phone */}
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-10 blur-2xl rounded-full"
      style={{ background: "rgba(132,204,22,0.35)" }}
    />
    <img
      src="https://i.ibb.co/8gCMLMS8/image-10.png"
      alt="App Bora"
      className="relative w-full object-contain drop-shadow-2xl"
    />
  </div>
);

// ─── Trust Seals ─────────────────────────────────────────────────────────────

const TrustSeals = () => (
  <div className="flex items-center justify-center gap-4 flex-wrap">
    {[
      { icon: Lock, label: "Compra Segura" },
      { icon: "pix", label: "Pagamento via Pix" },
      { icon: "shield", label: "Garantia de 7 Dias" },
    ].map((seal, i) => (
      <div key={i} className="flex flex-col items-center gap-1">
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          {seal.icon === Lock && <Lock className="w-4 h-4 text-lime-400" />}
          {seal.icon === "pix" && <span className="text-base">💠</span>}
          {seal.icon === "shield" && <span className="text-base">🛡️</span>}
        </div>
        <span className="text-[10px] text-slate-500 text-center leading-tight max-w-[60px]">{seal.label}</span>
      </div>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const SubscriptionOffersStep = () => {
  const { trackEvent } = useTracking();
  const { name } = useQuiz();

  const handleAnnualCheckout = () => {
    trackEvent("checkout_button_clicked", {
      plan: "annual",
      price: 9.86,
      total_price: 118.32,
      provider: "kirvano",
      checkout_url: STRIPE_LINK_ANNUAL,
    });
    window.location.href = STRIPE_LINK_ANNUAL;
  };

  const handleMonthlyCheckout = () => {
    trackEvent("checkout_button_clicked", {
      plan: "monthly",
      price: 29.90,
      provider: "stripe",
      checkout_url: STRIPE_LINK_MONTHLY,
    });
    window.location.href = STRIPE_LINK_MONTHLY;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div
        className="relative z-10 max-w-lg w-full space-y-8 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center space-y-2 px-2">
          <p className="text-xs font-bold uppercase tracking-widest text-lime-400">Tudo pronto</p>
          <h2 className="text-2xl font-black text-white leading-tight">
            {name ? (
              <>{name}, seu <span className="text-lime-400">plano personalizado</span> está pronto</>
            ) : (
              <>Seu <span className="text-lime-400">plano personalizado</span> está pronto</>
            )}
          </h2>
          <p className="text-sm text-slate-400">Desbloqueie agora e comece ainda hoje</p>
        </div>

        {/* Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <PhoneMockup />
        </motion.div>

        {/* ─── Annual Card (MAIN) ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative bg-gradient-to-br from-lime-500/10 to-lime-600/5 rounded-3xl p-6 shadow-2xl border border-lime-500/30"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-lime-400 text-slate-900 border-0 px-4 py-1 font-bold text-xs shadow-[0_0_20px_rgba(163,230,53,0.4)]">
              MAIS POPULAR • 72% OFF
            </Badge>
          </div>

          <div className="space-y-5 pt-2">
            <div>
              <h3 className="text-2xl font-bold text-white">Anual</h3>
              <p className="text-sm text-lime-400 mt-1 font-semibold">Melhor Custo-Benefício</p>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-slate-500 line-through">R$ 35,88/mês</span>
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
                "Rotina do seu jeito, todo dia",
                "Hábitos que cabem na sua vida",
                "Meditações guiadas atualizadas",
                "Biblioteca de leituras motivadoras",
                "Acesso ilimitado ao app",
                "Suporte prioritário via chat",
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-lime-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-slate-900" strokeWidth={3.5} />
                  </div>
                  <span className="text-sm text-slate-200 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Main CTA */}
            <motion.div {...buttonHoverTap}>
              <Button
                onClick={handleAnnualCheckout}
                size="lg"
                className="w-full bg-lime-400 hover:bg-lime-500 text-slate-900 text-lg font-black py-7 rounded-2xl shadow-[0_0_30px_rgba(163,230,53,0.45)] hover:shadow-[0_0_45px_rgba(163,230,53,0.65)] transition-all"
              >
                Garantir meu plano
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* ─── Monthly Card (secondary) ───────────────────────────────────── */}
        <motion.div
          className="relative bg-[#1A1A1C] rounded-3xl p-5 border border-white/10 shadow-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white">Mensal</h3>
              <p className="text-sm text-slate-400 mt-1">Sem compromisso</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">R$ 29,90</span>
              <span className="text-base text-slate-500">/mês</span>
            </div>

            <ul className="space-y-2">
              {[
                "Rotina personalizada",
                "Meditações guiadas",
                "Biblioteca de leituras",
                "Acesso imediato",
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <motion.div {...buttonHoverTap}>
              <Button
                onClick={handleMonthlyCheckout}
                variant="outline"
                size="lg"
                className="w-full text-base font-bold py-5 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-lime-500/50 transition-all"
              >
                Começar agora
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Guarantee */}
        <motion.div
          className="max-w-2xl mx-auto bg-[#1A1A1C] rounded-2xl p-5 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-lime-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Garantia de 7 Dias</h4>
              <p className="text-sm text-slate-400">
                Teste sem risco. Não curtiu? Devolução integral. Sem perguntas, sem burocracia.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-center mb-4">
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

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};
