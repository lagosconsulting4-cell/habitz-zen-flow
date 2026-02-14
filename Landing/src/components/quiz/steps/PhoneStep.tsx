import { motion } from "motion/react";
import { useState } from "react";
import { useQuiz } from "../QuizProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTracking } from "@/hooks/useTracking";
import { trackLead, trackCompleteRegistration } from "@/lib/utmify-tracking";

export const PhoneStep = () => {
    const {
        setPhone,
        nextStep,
        name,
        email,
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

    const [phoneInput, setPhoneInput] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Phone mask for Brazilian format: (XX) XXXXX-XXXX
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numbers = phoneInput.replace(/\D/g, "");
        if (!numbers) {
            setError("WhatsApp é obrigatório");
            return;
        }
        if (numbers.length < 10) {
            setError("Número incompleto");
            return;
        }

        setIsSubmitting(true);

        try {
            setPhone(numbers);
            trackPhoneEntered(true);
            trackDataCollectionComplete(["name", "email", "phone"]);

            // All quiz data for Supabase
            const quizData = {
                name: (name || "").trim(),
                email: (email || "").trim().toLowerCase(),
                phone: numbers,
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
                source: "landing_quiz",
            };

            const { error: saveError } = await supabase.from("quiz_responses").insert(quizData);
            if (saveError) {
                console.error("Error saving quiz data:", saveError);
            } else {
                console.log("✅ Quiz data saved to Supabase");
            }

            // UTMify tracking
            const nameParts = (name || "").trim().split(" ");
            trackCompleteRegistration({
                email: (email || "").trim().toLowerCase(),
                phone: numbers,
                firstName: nameParts[0] || (name || "").trim(),
                lastName: nameParts.slice(1).join(" ") || "",
                age: ageRange,
                gender,
                profession,
            });

            // Google notification (non-blocking)
            supabase.functions
                .invoke("quiz-notification-google", { body: quizData })
                .then(({ error: emailError }) => {
                    if (emailError) console.warn("Email notification failed:", emailError);
                    else console.log("✅ Email notification sent");
                })
                .catch((err) => console.warn("Email notification error:", err));

            nextStep();
        } catch (error) {
            console.error("Error submitting data:", error);
            nextStep(); // Fallback
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
                    <Phone className="w-10 h-10 text-lime-400" />
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
                    Qual é o seu melhor número?
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
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => {
                            setPhoneInput(formatPhone(e.target.value));
                            setError("");
                        }}
                        maxLength={15}
                        placeholder="(00) 00000-0000"
                        className={`w-full bg-transparent border-0 border-b-2 pb-3 text-lg text-white placeholder:text-slate-500 focus:outline-none transition-colors ${
                            error ? "border-red-500" : "border-white/20 focus:border-lime-500"
                        }`}
                        autoFocus
                        disabled={isSubmitting}
                    />
                </div>
                {error && <p className="text-sm text-red-500 -mt-2">{error}</p>}

                {/* Privacy */}
                <div className="bg-[#1A1A1C] border border-white/10 rounded-lg p-3">
                    <p className="text-xs text-slate-400">
                        🔒 Seus dados estão seguros. Ao continuar, você concorda com nossos{" "}
                        <a href="/termos" className="text-lime-400 hover:underline">Termos</a> e{" "}
                        <a href="/privacidade" className="text-lime-400 hover:underline">Privacidade</a>.
                    </p>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg font-bold bg-lime-500 hover:bg-lime-600 text-slate-900 transition-all shadow-[0_0_20px_rgba(132,204,22,0.3)]"
                    disabled={isSubmitting || phoneInput.replace(/\D/g, "").length < 10}
                >
                    {isSubmitting ? "Enviando..." : "Criar meu Plano"}
                </Button>
            </motion.form>
        </div>
    );
};
