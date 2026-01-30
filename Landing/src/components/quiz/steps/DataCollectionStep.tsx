import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, Phone, Loader2 } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { supabase } from "@/integrations/supabase/client";
import { trackLead, trackCompleteRegistration } from "@/lib/utmify-tracking";

export const DataCollectionStep = () => {
  const {
    phone,
    setPhone,
    setName: setQuizName,
    setEmail: setQuizEmail,
    nextStep,
    // Get all quiz data for submission
    ageRange,
    profession,
    workSchedule,
    gender,
    financialRange,
    energyPeak,
    timeAvailable,
    objective,
    challenges,
    consistencyFeeling,
    projectedFeeling,
    yearsPromising,
    weekDays,
    weekDaysPreset,
    recommendedHabits,
  } = useQuiz();
  const { trackPhoneEntered, trackDataCollectionComplete } = useTracking();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneInput, setPhoneInput] = useState(phone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Phone mask for Brazilian format: (XX) XXXXX-XXXX
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhoneInput(formatted);
    setErrors({ ...errors, phone: "" });
  };

  const validateName = (value: string) => {
    if (!value.trim()) return "Nome é obrigatório";
    if (value.trim().length < 2) return "Nome deve ter pelo menos 2 caracteres";
    return "";
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email é obrigatório";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Email inválido";
    return "";
  };

  const validatePhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "Telefone é obrigatório";
    if (numbers.length < 10) return "Telefone incompleto";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phoneInput);

    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError
    });

    // If any errors, don't submit
    if (nameError || emailError || phoneError) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Save phone to quiz context
      const cleanPhone = phoneInput.replace(/\D/g, "");
      setPhone(cleanPhone);
      setQuizName(name);
      setQuizEmail(email);

      // Track data collection
      trackPhoneEntered(!!cleanPhone);
      trackDataCollectionComplete(["name", "email", "phone"]);

      // Prepare quiz data for submission
      const quizData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        age_range: ageRange,
        profession,
        work_schedule: workSchedule,
        gender,
        financial_range: financialRange,
        energy_peak: energyPeak,
        time_available: timeAvailable,
        objective,
        challenges: challenges || [],
        consistency_feeling: consistencyFeeling,
        projected_feeling: projectedFeeling,
        years_promising: yearsPromising,
        week_days: weekDays || [],
        week_days_preset: weekDaysPreset,
        recommended_habits: recommendedHabits || [],
        completed: true,
        source: 'landing_quiz',
      };

      // Save to Supabase
      const { error: saveError } = await supabase
        .from('quiz_responses')
        .insert(quizData);

      if (saveError) {
        console.error("Error saving quiz data:", saveError);
        throw new Error("Erro ao salvar dados do quiz");
      }

      console.log("✅ Quiz data saved to Supabase");

      // Track CompleteRegistration event in UTMify (Meta Pixel)
      const nameParts = name.trim().split(" ");
      trackCompleteRegistration({
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        firstName: nameParts[0] || name.trim(),
        lastName: nameParts.slice(1).join(" ") || "",
        age: ageRange,
        gender,
        profession,
      });

      // Send notification via Google Apps Script (non-blocking - don't wait for it)
      supabase.functions
        .invoke('quiz-notification-google', { body: quizData })
        .then(({ error: emailError }) => {
          if (emailError) {
            console.warn("Email notification failed:", emailError);
          } else {
            console.log("✅ Email notification sent via Google Apps Script");
          }
        })
        .catch((err) => console.warn("Email notification error:", err));

      // Move to next step (subscription offers page)
      nextStep();
    } catch (error) {
      console.error("Error submitting data:", error);
      // Fallback for local dev or network errors: proceed anyway so user isn't stuck
      console.log("⚠️ Proceeding with local fallback...");
      nextStep();
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Main Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-center mb-8 px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Quase lá! Últimos detalhes
        </h2>
        <p className="text-base text-slate-400">
          Precisamos apenas de algumas informações para criar sua conta e enviar seu plano personalizado
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
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold text-white">
            Nome Completo
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: "" });
              }}
              onBlur={(e) => setErrors({ ...errors, name: validateName(e.target.value) })}
              placeholder="Seu nome completo"
              className={`pl-11 h-12 bg-[#1A1A1C] border-white/10 text-white placeholder:text-slate-500 focus:border-lime-500/50 ${errors.name ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-white">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: "" });
              }}
              onBlur={(e) => setErrors({ ...errors, email: validateEmail(e.target.value) })}
              placeholder="seu@email.com"
              className={`pl-11 h-12 bg-[#1A1A1C] border-white/10 text-white placeholder:text-slate-500 focus:border-lime-500/50 ${errors.email ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold text-white">
            Telefone
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="phone"
              type="tel"
              value={phoneInput}
              onChange={handlePhoneChange}
              onBlur={(e) => setErrors({ ...errors, phone: validatePhone(e.target.value) })}
              placeholder="(00) 00000-0000"
              maxLength={15}
              className={`pl-11 h-12 bg-[#1A1A1C] border-white/10 text-white placeholder:text-slate-500 focus:border-lime-500/50 ${errors.phone ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="bg-[#1A1A1C] border border-white/10 rounded-lg p-3">
          <p className="text-xs text-slate-400">
            Ao continuar, você concorda com nossos{" "}
            <a href="/termos" className="text-lime-400 hover:underline">Termos de Uso</a>
            {" "}e{" "}
            <a href="/privacidade" className="text-lime-400 hover:underline">Política de Privacidade</a>.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full h-14 text-lg font-bold bg-lime-500 hover:bg-lime-600 text-slate-900 transition-all shadow-[0_0_20px_rgba(132,204,22,0.3)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Minha Conta"
          )}
        </Button>
      </motion.form>

      {/* Security Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-xs text-slate-500">
          🔒 Seus dados estão seguros e protegidos
        </p>
      </motion.div>
    </div >
  );
};
