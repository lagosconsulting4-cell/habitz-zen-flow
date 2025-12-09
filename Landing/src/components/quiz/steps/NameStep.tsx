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
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#A3E635]/10 flex items-center justify-center">
          <User className="w-8 h-8 text-[#A3E635]" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          Como podemos te chamar?
        </h2>
        <p className="text-slate-600">
          Queremos personalizar sua experiência
        </p>
      </div>

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
