import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Copy, CheckCircle2, Clock, QrCode as QrCodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuiz } from "./quiz/QuizProvider";
import { QRCodeSVG } from "qrcode.react";

interface PixCheckoutModalProps {
  onClose: () => void;
}

interface PixResponse {
  qr_code: string;
  qr_code_text: string;
  expires_at: string;
  transaction_id: string;
  external_id: string;
}

export const PixCheckoutModal = ({ onClose }: PixCheckoutModalProps) => {
  const { email, name } = useQuiz();
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Cria transação PIX ao montar
  useEffect(() => {
    createPixTransaction();
  }, []);

  // Polling para verificar pagamento
  useEffect(() => {
    if (!pixData) return;

    const interval = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(pixData.external_id);
        if (status === "paid") {
          setIsPaid(true);
          clearInterval(interval);
          // Redireciona para app após 3s
          setTimeout(() => {
            window.location.href = "https://app.habitz.com.br";
          }, 3000);
        }
      } catch (err) {
        console.error("Erro ao verificar status:", err);
      }
    }, 5000); // Check a cada 5s

    return () => clearInterval(interval);
  }, [pixData]);

  const createPixTransaction = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const externalId = `quiz-${Date.now()}-${email?.replace(/[^a-zA-Z0-9]/g, "")}`;

      const response = await fetch(
        "https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/buckpay-pix",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            external_id: externalId,
            amount: 4700, // R$ 47.00 em centavos
            buyer: {
              name: name || "Cliente",
              email: email || "",
            },
            product: {
              name: "BORA - Plano Anual",
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar PIX");
      }

      const data = await response.json();
      setPixData(data);
    } catch (err: any) {
      setError(err.message || "Erro ao gerar PIX. Tente novamente.");
      console.error("Erro ao criar PIX:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (externalId: string) => {
    try {
      const response = await fetch(
        "https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/buckpay-pix",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "status",
            external_id: externalId,
          }),
        }
      );

      const data = await response.json();
      return data.status;
    } catch (err) {
      console.error("Erro ao verificar status:", err);
      return null;
    }
  };

  const copyPixCode = () => {
    if (pixData?.qr_code_text) {
      navigator.clipboard.writeText(pixData.qr_code_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <QrCodeIcon className="w-full h-full text-[#A3E635]" />
              </motion.div>
              <p className="text-slate-600">Gerando seu QR Code PIX...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={createPixTransaction} variant="outline">
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Success State - Pagamento confirmado */}
          {isPaid && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-green-500" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Pagamento confirmado!
              </h3>
              <p className="text-slate-600">
                Redirecionando para o app...
              </p>
            </motion.div>
          )}

          {/* PIX Code Display */}
          {pixData && !isPaid && !isLoading && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Pague com PIX
                </h3>
                <p className="text-slate-600 text-sm">
                  Escaneie o QR Code ou copie o código
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white border-4 border-slate-100 rounded-2xl">
                  <QRCodeSVG
                    value={pixData.qr_code_text}
                    size={typeof window !== "undefined" && window.innerWidth < 640 ? 180 : 200}
                    level="M"
                  />
                </div>
              </div>

              {/* PIX Code Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Código PIX Copia e Cola
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pixData.qr_code_text}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono overflow-hidden text-ellipsis"
                  />
                  <Button
                    onClick={copyPixCode}
                    size="sm"
                    className={copied ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expire time */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>
                  Expira em{" "}
                  {new Date(pixData.expires_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Instructions */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-slate-900">Como pagar:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Abra o app do seu banco</li>
                  <li>Escolha pagar com PIX</li>
                  <li>Escaneie o QR Code ou cole o código</li>
                  <li>Confirme o pagamento de R$ 47,00</li>
                </ol>
              </div>

              {/* Waiting indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-[#A3E635]">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Clock className="w-4 h-4" />
                </motion.div>
                <span>Aguardando pagamento...</span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
