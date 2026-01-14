import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Gift,
  ArrowRight,
  Shield,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const ExitIntentModal: React.FC<ExitIntentModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>

              {/* Gradient background accent */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500" />

              {/* Content */}
              <div className="p-8 md:p-12">
                {/* Alert badge */}
                <div className="flex justify-center mb-6">
                  <Badge className="px-4 py-2 bg-amber-500 text-white border-0 shadow-lg animate-pulse">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Espera! Última chance
                  </Badge>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4">
                  E se você pudesse testar{" "}
                  <span className="text-blue-500">GRÁTIS por 3 dias?</span>
                </h2>

                {/* Subtitle */}
                <p className="text-lg text-center text-slate-600 mb-8">
                  Sem compromisso. Sem risco.{" "}
                  <strong className="text-slate-900">
                    Apenas 3 dias para sentir a diferença.
                  </strong>
                </p>

                {/* Benefits grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    {
                      icon: Gift,
                      title: "3 dias grátis",
                      subtitle: "Teste completo",
                    },
                    {
                      icon: Shield,
                      title: "Sem cobrança",
                      subtitle: "Nos primeiros dias",
                    },
                    {
                      icon: Sparkles,
                      title: "Acesso total",
                      subtitle: "Todos os recursos",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-4 text-center border border-blue-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mx-auto mb-2">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-bold text-slate-900 text-sm">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-600">{item.subtitle}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Visual comparison */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {/* Without */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <X className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="font-semibold text-slate-900 text-sm">
                        Sem o BORA
                      </p>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600">
                      <li>• Só organização básica</li>
                      <li>• Sem transformação real</li>
                      <li>• Mesma rotina de sempre</li>
                    </ul>
                  </div>

                  {/* With */}
                  <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-4 border-2 border-blue-500">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-semibold text-slate-900 text-sm">
                        Com o BORA
                      </p>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      <li>• Rotina personalizada</li>
                      <li>• Transformação em 30 dias</li>
                      <li>• Foco e energia reais</li>
                    </ul>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  {/* Primary CTA */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={onAccept}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 rounded-full font-bold shadow-xl shadow-blue-500/30 text-base"
                    >
                      <Gift className="w-5 h-5 mr-2" />
                      SIM! QUERO TESTAR 3 DIAS GRÁTIS
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>

                  {/* Secondary CTA */}
                  <button
                    onClick={onClose}
                    className="w-full text-slate-500 hover:text-slate-700 text-sm underline transition-colors"
                  >
                    Não, prefiro continuar sem testar
                  </button>
                </div>

                {/* Trust badge */}
                <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-600">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>
                    Sem cobrança nos 3 dias • Cancele a qualquer momento
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
