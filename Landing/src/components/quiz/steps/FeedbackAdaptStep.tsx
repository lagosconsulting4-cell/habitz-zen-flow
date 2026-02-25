import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";
import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const COMMUNITY_AVATARS = [
  {
    src: "https://i.ibb.co/8vZWj0M/pedrogodyebue-alo-alo-bahia.jpg",
    fallback: "PG",
  },
  {
    src: "https://i.ibb.co/cSMHmLND/jovem-brasileira-cria-gel-combate-aedes-aegypti-2-conexao-planeta.jpg",
    fallback: "JB",
  },
  {
    src: "https://i.ibb.co/yFqB0xsb/images.jpg",
    fallback: "LC",
  },
  {
    src: "https://i.ibb.co/vvk56XT8/homem-elegante-e-confiante-com-tatuagens-posando-na-varanda-do-apartamento-74855-2711.avif",
    fallback: "HE",
  },
  {
    src: "https://i.ibb.co/LhQHgZxb/photo-1695927621677-ec96e048dce2.avif",
    fallback: "MB",
  },
];

export const FeedbackAdaptStep = () => {
  const { financialRange, profession } = useQuiz();
  const { trackFeedbackView } = useTracking();

  const professionLabels: Record<string, string> = {
    student: "estudantes",
    employed: "empregados",
    entrepreneur: "empreendedores",
    freelancer: "freelancers",
    other: "profissionais",
  };

  const professionText = profession ? professionLabels[profession] || "profissionais" : "profissionais";

  useEffect(() => {
    trackFeedbackView("adapt", { profession: professionText });
  }, [trackFeedbackView, professionText]);

  return (
    <div className="relative w-full h-full min-h-[100dvh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/images/community-bg.png"
          alt="Community Background"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1920&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/70 via-[#0A0A0B]/85 to-[#0A0A0B]" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, var(--q-bg-tint) 0%, transparent 65%)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6 py-20">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-black text-white mb-3 text-center leading-tight"
        >
          Fique Tranquilo!
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg md:text-xl text-slate-400 mb-16 text-center"
        >
          O sistema se adapta à sua realidade
        </motion.p>

        {/* Community Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full max-w-md mb-16"
        >
          <div className="bg-[#0A0A0B]/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center">
            {/* Avatars */}
            <div className="flex justify-center mb-6 -space-x-3">
              {COMMUNITY_AVATARS.map((avatar, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                >
                  <Avatar className="w-14 h-14 border-4 border-[#0A0A0B]">
                    <AvatarImage src={avatar.src} alt={avatar.fallback} className="object-cover object-center" />
                    <AvatarFallback className="bg-gradient-to-br from-lime-500 to-lime-600 text-white font-bold">
                      {avatar.fallback}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              ))}
            </div>

            {/* Label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-lime-400 text-sm font-bold uppercase tracking-wider mb-4"
            >
              Comunidade Forte
            </motion.p>

            {/* Percentage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
              className="mb-4"
            >
              <CountingNumber
                number={87}
                fromNumber={0}
                delay={1.6}
                duration={2}
                prefix="+"
                suffix="%"
                className="text-7xl md:text-8xl font-black text-lime-400"
              />
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="text-slate-300 text-base leading-relaxed"
            >
              dos <span className="text-white font-bold">{professionText}</span> mantêm hábitos <br />
              por <span className="text-lime-400 font-bold">6+ meses</span> com o Bora.
            </motion.p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <ContinueButton />
        </motion.div>
      </div>
    </div>
  );
};
