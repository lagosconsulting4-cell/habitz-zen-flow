import { motion } from "motion/react";
import { TestimonialCard } from "@/components/premium/TestimonialCard";
import { Users, Star } from "lucide-react";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";

const TESTIMONIALS = [
  {
    name: "João Vitor",
    role: "Estudante de Engenharia",
    avatar: "https://i.ibb.co/xtXmcTS3/Gemini-Generated-Image-ixzgp8ixzgp8ixzg.png",
    quote: "Consegui conciliar faculdade e estágio sem surtar. O app me ajudou a organizar meu tempo de um jeito que realmente funciona.",
    rating: 5,
    beforeAfter: {
      before: "Procrastinava no TikTok",
      after: "1h de estudo sem sofrer"
    }
  },
  {
    name: "Beatriz Oliveira",
    role: "Analista Júnior",
    avatar: "https://i.ibb.co/TMPp1Kw1/Gemini-Generated-Image-200v6k200v6k200v.png",
    quote: "Trabalho 8h por dia e antes não sobrava energia pra nada. Agora consigo treinar, ler e ainda ter tempo livre sem me sentir culpada.",
    rating: 5,
    beforeAfter: {
      before: "Zero energia à noite",
      after: "Treino rápido + Leitura"
    }
  },
  {
    name: "Lucas Santos",
    role: "Designer Freelancer",
    avatar: "https://i.pravatar.cc/150?u=joao",
    quote: "Minha rotina era um caos total. Agora tenho horário pra tudo, entrego projetos no prazo e ainda sobra tempo pro lazer. Mudou minha vida!",
    rating: 5,
    beforeAfter: {
      before: "Caos total",
      after: "Rotina organizada"
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
          <Users className="w-6 h-6 text-lime-500" />
          <h3 className="text-lg font-bold text-white">
            Mais de 2.000 usuários transformaram suas vidas
          </h3>
        </div>

        {/* 5-star rating display */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 text-lime-500 fill-lime-500"
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-300">5.0</span>
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
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Veja o que nossos usuários falam
        </h2>
        <p className="text-base text-slate-400">
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
            className=""
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
        <div className="bg-[#1A1A1C] border border-lime-500/20 rounded-xl p-4 inline-block">
          <p className="text-sm font-semibold text-lime-400">
            Você também pode alcançar esses resultados. Continue para criar seu plano personalizado.
          </p>
        </div>
      </motion.div>

      <ContinueButton />
    </div>
  );
};
