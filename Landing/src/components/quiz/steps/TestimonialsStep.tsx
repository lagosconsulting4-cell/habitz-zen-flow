import { motion } from "motion/react";
import { TestimonialCard } from "@/components/premium/TestimonialCard";
import { Users, Star } from "lucide-react";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";

const TESTIMONIALS = [
  {
    name: "Ana Paula Silva",
    role: "Estudante de Marketing",
    avatar: "https://i.ibb.co/7t5yRpDd/Gemini-Generated-Image-i7pejzi7pejzi7pe.png",
    quote: "Consegui finalmente criar uma rotina de estudos que funciona! Em 3 meses minha produtividade aumentou absurdamente.",
    rating: 5,
    beforeAfter: {
      before: "Procrastinava todos os dias",
      after: "2h de estudo focado diário"
    }
  },
  {
    name: "Carlos Eduardo",
    role: "Desenvolvedor",
    avatar: "https://i.ibb.co/Rkx7XcKT/Gemini-Generated-Image-vy66g8vy66g8vy66.png",
    quote: "O Bora me ajudou a equilibrar trabalho e saúde. Perdi 8kg em 2 meses sem sacrificar meu emprego.",
    rating: 5,
    beforeAfter: {
      before: "Sedentário, 92kg",
      after: "Treino 5x/semana, 84kg"
    }
  },
  {
    name: "Mariana Costa",
    role: "Empreendedora",
    avatar: "https://i.ibb.co/TMPp1Kw1/Gemini-Generated-Image-200v6k200v6k200v.png",
    quote: "Achei que seria mais um app genérico, mas o plano personalizado realmente se adapta à minha rotina corrida. Mudou minha vida!",
    rating: 5,
    beforeAfter: {
      before: "Desorganizada e estressada",
      after: "Rotina equilibrada e produtiva"
    }
  }
];

export const TestimonialsStep = () => {
  const { trackTestimonialsView } = useTracking();

  useEffect(() => {
    trackTestimonialsView(TESTIMONIALS.length);
  }, [trackTestimonialsView]);

  return (
    <div className="flex flex-col">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Users className="w-6 h-6 text-lime-600" />
          <h3 className="text-lg font-bold text-slate-900">
            Mais de 2.000 usuários transformaram suas vidas
          </h3>
        </div>

        {/* 5-star rating display */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 text-lime-600 fill-lime-600"
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-700">5.0</span>
        </div>

        <p className="text-sm text-slate-500">
          Avaliação média de nossos usuários
        </p>
      </motion.div>

      {/* Main Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-center mb-6 px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Veja o que nossos usuários falam
        </h2>
        <p className="text-base text-slate-600">
          Pessoas reais com resultados reais
        </p>
      </motion.div>

      {/* Testimonials Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 mb-6"
      >
        {TESTIMONIALS.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            name={testimonial.name}
            role={testimonial.role}
            avatar={testimonial.avatar}
            quote={testimonial.quote}
            rating={testimonial.rating}
            beforeAfter={testimonial.beforeAfter}
            index={index}
            className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          />
        ))}
      </motion.div>

      {/* Bottom CTA message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="text-center px-4"
      >
        <div className="bg-gradient-to-br from-lime-50 to-lime-100 border-2 border-lime-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-lime-800">
            Você também pode alcançar esses resultados. Continue para criar seu plano personalizado.
          </p>
        </div>
      </motion.div>

      <ContinueButton />
    </div>
  );
};
