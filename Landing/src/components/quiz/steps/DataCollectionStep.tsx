import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export const DataCollectionStep = () => {
  const { setEmail: setQuizEmail, nextStep } = useQuiz();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email é obrigatório";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Email inválido";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsSubmitting(true);
    setQuizEmail(email.trim().toLowerCase());
    nextStep();
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className="w-20 h-20 bg-lime-500/10 rounded-full flex items-center justify-center ring-1 ring-lime-500/20 shadow-[0_0_20px_rgba(132,204,22,0.2)]">
          <Mail className="w-10 h-10 text-lime-400" />
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-center mb-8 px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Salve o seu plano personalizado
        </h2>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        onSubmit={handleSubmit}
        className="w-full max-w-md px-4 space-y-5"
      >
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="seu@email.com"
            className={`w-full bg-transparent border-0 border-b-2 pb-3 text-lg text-white placeholder:text-slate-500 focus:outline-none transition-colors ${
              error ? "border-red-500" : "border-white/20 focus:border-lime-500"
            }`}
            autoFocus
            disabled={isSubmitting}
          />
        </div>
        {error && <p className="text-sm text-red-500 -mt-2">{error}</p>}

        <Button
          type="submit"
          size="lg"
          className="w-full h-14 text-lg font-bold bg-lime-500 hover:bg-lime-600 text-slate-900 transition-all shadow-[0_0_20px_rgba(132,204,22,0.3)]"
          disabled={isSubmitting || !email.trim()}
        >
          Continuar
        </Button>

        <p className="text-xs text-slate-500 text-center">
          🔒 Seus dados estão seguros e protegidos
        </p>
      </motion.form>
    </div>
  );
};
