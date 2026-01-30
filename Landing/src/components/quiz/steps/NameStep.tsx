import { useState } from "react";
import { useQuiz } from "../QuizProvider";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";

export const NameStep = () => {
  const { name, setName } = useQuiz();
  const [localName, setLocalName] = useState(name || "");
  const [error, setError] = useState("");

  const validateName = (n: string) => {
    return n.trim().length >= 2;
  };

  const handleBlur = () => {
    if (localName && !validateName(localName)) {
      setError("Por favor, insira um nome válido (mínimo 2 caracteres)");
    } else {
      setError("");
      setName(localName.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-center mb-8 px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Como podemos te chamar?
        </h2>
        <p className="text-base text-slate-400">
          Para personalizar seu plano
        </p>
      </motion.div>

      <div className="max-w-md mx-auto">
        <Input
          type="text"
          placeholder="Seu nome"
          value={localName}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`text-base ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
        />
        {error && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <span>⚠️</span>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
