import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExitIntentModalProps {
    discountLink: string;
    onClose: () => void;
}

export const ExitIntentModal = ({ discountLink, onClose }: ExitIntentModalProps) => {
    const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[#0A0A0B] border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden"
            >
                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-lime-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-lime-500/10 rounded-full blur-3xl" />

                {/* Close */}
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="relative z-10">
                    <span className="text-5xl mb-4 block">🔥</span>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        Espera! Última chance
                    </h2>

                    <p className="text-slate-400 text-sm mb-6">
                        Você já completou toda a análise. Não perca seu diagnóstico personalizado.
                    </p>

                    {/* Countdown */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
                        <p className="text-xs text-red-400 mb-2 font-semibold uppercase tracking-wider">
                            Oferta expira em
                        </p>
                        <p className="text-4xl font-black text-white font-mono">
                            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                        </p>
                    </div>

                    {/* Discount badge */}
                    <div className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/30 rounded-full px-4 py-2 mb-6">
                        <span className="text-lime-400 font-bold text-lg">50% OFF</span>
                        <span className="text-slate-400 text-sm">exclusivo agora</span>
                    </div>

                    {/* CTA */}
                    <Button
                        onClick={() => window.location.href = discountLink}
                        size="lg"
                        className="w-full h-14 text-lg font-bold bg-lime-400 hover:bg-lime-500 text-slate-900 rounded-xl shadow-[0_0_30px_rgba(163,230,53,0.3)] hover:shadow-[0_0_40px_rgba(163,230,53,0.5)] transition-all"
                    >
                        Quero 50% de desconto
                    </Button>

                    <button onClick={onClose} className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors">
                        Não, obrigado
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};
