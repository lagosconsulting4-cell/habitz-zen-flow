import { useState } from "react";
import { useQuiz } from "../QuizProvider";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";

export const EmailStep = () => {
  const { email, setEmail } = useQuiz();
  const [localEmail, setLocalEmail] = useState(email || "");
  const [error, setError] = useState("");

  const validateEmail = (e: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(e);
  };

  const handleBlur = () => {
    if (localEmail && !validateEmail(localEmail)) {
      setError("Por favor, insira um email válido");
    } else {
      setError("");
      setEmail(localEmail);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalEmail(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#A3E635]/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-[#A3E635]" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          Qual é o seu email?
        </h2>
        <p className="text-slate-600">
          Enviaremos sua rotina personalizada por email
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Input
          type="email"
          placeholder="seu@email.com"
          value={localEmail}
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
