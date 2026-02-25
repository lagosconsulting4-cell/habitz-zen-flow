import { motion } from "motion/react";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";

const TESTIMONIALS = [
  {
    name: "Marcos A.",
    city: "São Paulo, SP",
    avatar: "MA",
    avatarBg: "from-blue-500 to-blue-700",
    quote: "cara eu to sem palavras... na segunda semana ja tava acordando sem precisar de alarme. nunca achei q ia conseguir isso",
    result: "✅ 4 meses de consistência",
    src: "https://i.ibb.co/5Wtxy3SP/download-15.jpg",
  },
  {
    name: "Juliana S.",
    city: "Belo Horizonte, MG",
    avatar: "JS",
    avatarBg: "from-pink-500 to-rose-600",
    quote: "tentei de tudo mesmo. planner, academia, dieta... nada durava. o Bora foi o unico q se adaptou a mim, nao eu a ele 😅",
    result: "✅ Perdeu 6kg em 10 semanas",
    src: "https://i.ibb.co/PZx78q3m/download-16.jpg",
  },
  {
    name: "Rafael C.",
    city: "Fortaleza, CE",
    avatar: "RC",
    avatarBg: "from-orange-500 to-amber-600",
    quote: "to mais disposto, dormindo melhor, mais focado no trampo. tudo isso sem mudar minha vida de cabeca pra baixo",
    result: "✅ Produtividade no pico",
    src: "https://i.ibb.co/5xYjH4q6/jin.jpg",
  },
  {
    name: "Larissa M.",
    city: "Recife, PE",
    avatar: "LM",
    avatarBg: "from-purple-500 to-violet-600",
    quote: "achei q ia ser complicado mas e muito simples. tipo o duolingo mas pra habitos. ja to a 2 meses sem pular um dia 🔥",
    result: "✅ 2 meses sem pular um dia",
    src: "https://i.ibb.co/V6PdXHc/download-17.jpg",
  },
];

export const TestimonialsStep = () => {
  const { trackTestimonialsView } = useTracking();

  useEffect(() => {
    trackTestimonialsView(TESTIMONIALS.length);
  }, [trackTestimonialsView]);

  return (
    <div className="relative w-full min-h-[100dvh] flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-[#0d1a0d] to-[#0A0A0B] pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1 px-4 pt-10 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-lime-400 mb-2">Quem já mudou</p>
          <h2 className="text-3xl font-black text-white leading-tight">
            Mais de <span className="text-lime-400">2.000 pessoas</span>{" "}
            já transformaram suas vidas
          </h2>
        </motion.div>

        {/* Testimonial cards */}
        <div className="flex flex-col gap-4 flex-1">
          {TESTIMONIALS.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.12, duration: 0.4 }}
              className="bg-[#141416] border border-white/8 rounded-2xl p-4 flex flex-col gap-3"
            >
              {/* Quote mark */}
              <span className="text-4xl leading-none text-lime-500 font-black select-none" aria-hidden>❝</span>

              {/* Quote text */}
              <p className="text-sm text-slate-200 leading-relaxed -mt-3">
                {t.quote}
              </p>

              {/* Result badge */}
              <div className="inline-flex self-start items-center gap-1.5 bg-lime-500/10 border border-lime-500/25 rounded-full px-3 py-1">
                <span className="text-xs font-semibold text-lime-400">{t.result}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-1 border-t border-white/5">
                <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={t.src}
                    alt={t.name}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = "none";
                      const parent = el.parentElement;
                      if (parent) {
                        parent.classList.add(`bg-gradient-to-br`, ...t.avatarBg.split(" "));
                        parent.innerHTML = `<span class="w-full h-full flex items-center justify-center text-white text-xs font-bold">${t.avatar}</span>`;
                      }
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.city}</p>
                </div>
                {/* Stars */}
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lime-400 text-xs">★</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-6"
        >
          <ContinueButton />
        </motion.div>
      </div>
    </div>
  );
};
