import React, { useEffect } from 'react';
import { X, Zap, CreditCard, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracking } from '@/hooks/useTracking';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPix: () => void;
  onSelectCreditCard: () => void;
  pixPrice: number;
  creditCardPrice: number;
}

export function PaymentMethodModal({
  isOpen,
  onClose,
  onSelectPix,
  onSelectCreditCard,
  pixPrice,
  creditCardPrice,
}: PaymentMethodModalProps) {
  const savings = creditCardPrice - pixPrice;
  const { trackPaymentMethodSelected, trackEvent } = useTracking();

  // Track when modal opens
  useEffect(() => {
    if (isOpen) {
      trackEvent("payment_method_modal_opened", { source: 'offer_page' });
    }
  }, [isOpen, trackEvent]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-4xl md:max-w-3xl lg:max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Header */}
              <div className="text-center pt-8 md:pt-12 pb-4 md:pb-8 px-4 md:px-8">
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3 text-gray-900"
                >
                  Escolha sua forma de pagamento
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 text-sm md:text-base lg:text-lg"
                >
                  5% de desconto no PIX ou parcele no cartão
                </motion.p>
              </div>

              {/* Payment Options */}
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 px-4 md:px-8 pb-6 md:pb-12">
                {/* PIX Option - Recommended */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  onClick={() => {
                    trackPaymentMethodSelected('pix', pixPrice);
                    onSelectPix();
                  }}
                  className="relative cursor-pointer group"
                >
                  {/* Minimalist 5% Badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="px-3 py-1 rounded-full text-sm font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #A3E635 0%, #10b981 100%)',
                        boxShadow: '0 4px 12px rgba(163, 230, 53, 0.4)',
                      }}
                    >
                      5%
                    </motion.div>
                  </div>

                  {/* Card */}
                  <div
                    className="relative overflow-hidden rounded-2xl p-4 md:p-6 lg:p-8 border-2 transition-all duration-300"
                    style={{
                      borderColor: '#A3E635',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                      boxShadow: '0 10px 40px rgba(163, 230, 53, 0.15)',
                    }}
                  >
                    {/* Glow effect on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(163, 230, 53, 0.1) 0%, transparent 70%)',
                      }}
                    />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-4 md:mb-6"
                        style={{
                          background: 'linear-gradient(135deg, #A3E635 0%, #84cc16 100%)',
                        }}
                      >
                        <Zap className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" fill="white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                        PIX Instantâneo
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm mb-4 md:mb-6">
                        Pagamento aprovado na hora
                      </p>

                      {/* Price */}
                      <div className="mb-4 md:mb-6">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-3xl md:text-4xl font-bold text-gray-900">
                            R$ {pixPrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 line-through">
                            R$ {creditCardPrice.toFixed(2).replace('.', ',')}
                          </span>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: '#A3E635' }}
                          >
                            Economize R$ {savings.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>

                      {/* Benefits */}
                      <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-8">
                        <li className="flex items-center text-xs md:text-sm text-gray-700">
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" style={{ color: '#A3E635' }} />
                          Pagamento instantâneo
                        </li>
                        <li className="flex items-center text-xs md:text-sm text-gray-700">
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" style={{ color: '#A3E635' }} />
                          Acesso liberado em segundos
                        </li>
                        <li className="flex items-center text-xs md:text-sm text-gray-700">
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" style={{ color: '#A3E635' }} />
                          5% de desconto exclusivo
                        </li>
                      </ul>

                      {/* CTA Button */}
                      <button
                        className="w-full py-3 md:py-4 rounded-xl font-bold text-white text-base md:text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #A3E635 0%, #84cc16 100%)',
                          boxShadow: '0 4px 16px rgba(163, 230, 53, 0.3)',
                        }}
                      >
                        Pagar com PIX
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Credit Card Option */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  onClick={() => {
                    trackPaymentMethodSelected('credit_card', creditCardPrice);
                    onSelectCreditCard();
                  }}
                  className="relative cursor-pointer group"
                >
                  {/* Card */}
                  <div className="relative overflow-hidden rounded-2xl p-4 md:p-6 lg:p-8 border-2 border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-xl h-full">
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Icon */}
                      <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 md:mb-6">
                        <CreditCard className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-gray-700" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                        Cartão de Crédito
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm mb-4 md:mb-6">
                        Parcele em até 11x
                      </p>

                      {/* Price */}
                      <div className="mb-4 md:mb-6">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-3xl md:text-4xl font-bold text-gray-900">
                            R$ {creditCardPrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">
                          ou 11x de R$ 4,49
                        </div>
                      </div>

                      {/* Benefits */}
                      <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-8 flex-grow">
                        <li className="flex items-center text-xs md:text-sm text-gray-700">
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0 text-gray-400" />
                          Parcele sem juros
                        </li>
                        <li className="flex items-center text-xs md:text-sm text-gray-700">
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0 text-gray-400" />
                          Todas as bandeiras
                        </li>
                        <li className="flex items-center text-xs md:text-sm text-gray-700">
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0 text-gray-400" />
                          Pagamento seguro
                        </li>
                      </ul>

                      {/* CTA Button */}
                      <button className="w-full py-3 md:py-4 rounded-xl font-bold text-gray-700 text-base md:text-lg bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                        Pagar com Cartão
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 md:px-8 py-4 md:py-6 text-center border-t border-gray-100">
                <p className="text-xs md:text-sm text-gray-600 flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pagamento 100% seguro • 7 dias de garantia incondicional
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
