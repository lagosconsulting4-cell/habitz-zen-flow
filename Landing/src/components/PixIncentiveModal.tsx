import { X, Gift, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";

interface PixIncentiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  planType?: "annual" | "monthly";
}

export const PixIncentiveModal = ({
  isOpen,
  onClose,
  onAccept,
  planType = "annual",
}: PixIncentiveModalProps) => {
  const { trackEvent } = useTracking();

  // Track when modal opens
  useEffect(() => {
    if (isOpen) {
      trackEvent("pix_incentive_modal_opened", {
        plan_type: planType,
        source: "pricing_card_click",
      });
    }
  }, [isOpen, planType, trackEvent]);

  const handleAccept = () => {
    trackEvent("pix_incentive_accepted", {
      plan_type: planType,
    });
    onAccept();
  };

  const handleClose = () => {
    trackEvent("pix_incentive_declined", {
      plan_type: planType,
    });
    onClose();
  };

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>

              {/* Content */}
              <div className="p-6 text-center">
                {/* Icon */}
                <motion.div
                  className="w-12 h-12 mx-auto mb-4"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Gift className="w-full h-full text-slate-800" />
                </motion.div>

                {/* Title */}
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Você ganhou uma condição especial
                </h2>

                {/* Big Discount */}
                <div className="mb-4">
                  <div className="text-6xl font-black text-[#A3E635] leading-none mb-1">
                    20%
                  </div>
                  <p className="text-sm text-slate-700 font-medium">
                    de desconto exclusivo
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 mb-4">
                  Assine o <strong>plano anual</strong> e faça o compromisso com você mesmo de focar por um ano inteiro
                </p>

                {/* Price */}
                <div className="mb-4">
                  <div className="text-slate-400 line-through text-sm mb-1">
                    De R$ 129,90
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    R$ 103,92<span className="text-base text-slate-600">/ano</span>
                  </div>
                </div>

                {/* Benefits */}
                <ul className="space-y-2 mb-4 text-left">
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-[#A3E635] flex-shrink-0" />
                    <span>Um ano inteiro de foco</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-[#A3E635] flex-shrink-0" />
                    <span>Pagamento único via Pix</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-[#A3E635] flex-shrink-0" />
                    <span>Garantia de 7 dias</span>
                  </li>
                </ul>

                {/* Emotional Copy */}
                <p className="text-xs text-slate-600 italic mb-6">
                  Porque quem se compromete de verdade merece ser valorizado.
                </p>

                {/* CTA */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mb-3"
                >
                  <Button
                    onClick={handleAccept}
                    className="w-full bg-[#A3E635] hover:bg-[#84cc16] text-slate-900 font-bold text-base py-5 rounded-xl shadow-lg"
                  >
                    Ativar desconto agora
                  </Button>
                </motion.div>

                {/* Decline */}
                <button
                  onClick={handleClose}
                  className="text-slate-500 hover:text-slate-700 text-xs transition-colors"
                >
                  Não, quero continuar com o plano que escolhi
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
