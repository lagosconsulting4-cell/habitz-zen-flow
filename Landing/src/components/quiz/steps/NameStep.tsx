import { motion } from "motion/react";
import { useState } from "react";
import { useQuiz } from "../QuizProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

export const NameStep = () => {
  const { name, setName, nextStep } = useQuiz();
  const [localName, setLocalName] = useState(name || "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    if (localName.trim().length < 2) {
      setError("Nome deve ter pelo menos 2 caracteres");
      return;
    }
    setName(localName.trim());
    nextStep();
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
          <User className="w-10 h-10 text-lime-400" />
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-center mb-8 px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Como podemos te chamar?
        </h2>
        <p className="text-sm text-slate-400">
          Para personalizar seu diagnóstico
        </p>
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
            type="text"
            value={localName}
            onChange={(e) => {
              setLocalName(e.target.value);
              setError("");
            }}
            placeholder="Seu primeiro nome"
            className={`w-full bg-transparent border-0 border-b-2 pb-3 text-lg text-white placeholder:text-slate-500 focus:outline-none transition-colors ${
              error ? "border-red-500" : "border-white/20 focus:border-lime-500"
            }`}
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-red-500 -mt-2">{error}</p>}

        <Button
          type="submit"
          size="lg"
          className="w-full h-14 text-lg font-bold bg-lime-500 hover:bg-lime-600 text-slate-900 transition-all shadow-[0_0_20px_rgba(132,204,22,0.3)]"
          disabled={!localName.trim()}
        >
          Continuar
        </Button>
      </motion.form>
    </div>
  );
};
