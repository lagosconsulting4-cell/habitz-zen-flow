import { motion } from "motion/react";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";
import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number";
import { AvatarGroup } from "@/components/animate-ui/components/animate/avatar-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const USER_AVATARS = [
  {
    src: "https://i.ibb.co/VYFg60D5/images-1.jpg",
    fallback: "JV",
  },
  {
    src: "https://i.ibb.co/3t9Gz73/163684537661904740a5094-1636845376-3x2-md.jpg",
    fallback: "BO",
  },
  {
    src: "https://i.ibb.co/hRW0GZbj/young-brazilian-woman-isolated-on-260nw-2605475869.webp",
    fallback: "LS",
  },
  {
    src: "https://i.ibb.co/6RvR1xnL/istockphoto-852415974-612x612.jpg",
    fallback: "MC",
  },
  {
    src: "https://i.ibb.co/VcnRgK1z/jovem-e-bonita-mulher-brasileira-ao-ar-livre-com-oculos-1368-499497.avif",
    fallback: "AR",
  },
  {
    src: "https://i.ibb.co/r9RXQ3x/10592418-m.jpg",
    fallback: "FS",
  },
];

export const TestimonialsStep = () => {
  const { trackTestimonialsView } = useTracking();

  useEffect(() => {
    trackTestimonialsView(6);
  }, [trackTestimonialsView]);

  return (
    <div className="relative w-full h-full min-h-[100dvh] overflow-hidden">
      {/* Background Image - Full Screen */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/images/network-bg.png"
          alt="Network Background"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop";
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/70 via-[#0A0A0B]/85 to-[#0A0A0B]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6 py-20 text-center">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 max-w-4xl leading-tight"
        >
          Mais de{" "}
          <span className="text-lime-400">
            <CountingNumber
              number={2000}
              fromNumber={0}
              delay={0.5}
              duration={2}
              suffix="+"
              className="inline"
            />
          </span>{" "}
          pessoas já transformaram suas vidas
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl"
        >
          Junte-se a milhares de pessoas que estão construindo hábitos que realmente duram
        </motion.p>

        {/* Avatar Group */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-12"
        >
          <AvatarGroup max={6}>
            {USER_AVATARS.map((avatar, index) => (
              <Avatar key={index} className="w-16 h-16 md:w-20 md:h-20 border-4 border-[#0A0A0B]">
                <AvatarImage src={avatar.src} alt={avatar.fallback} className="object-cover object-center" />
                <AvatarFallback className="bg-gradient-to-br from-lime-500 to-lime-600 text-white font-bold text-lg">
                  {avatar.fallback}
                </AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-16"
        >
          {/* Community Count */}
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-black text-lime-400 mb-2">
              <CountingNumber
                number={2000}
                fromNumber={0}
                delay={1.2}
                duration={2}
                suffix="+"
              />
            </div>
            <div className="text-sm md:text-base text-slate-400 font-semibold uppercase tracking-wider">
              Usuários ativos
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-16 bg-slate-700" />

          {/* Rating Score */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="text-5xl md:text-6xl font-black text-lime-400">
                <CountingNumber
                  number={5.0}
                  fromNumber={0}
                  delay={1.5}
                  duration={2}
                />
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2 + (i * 0.1), duration: 0.3 }}
                  >
                    <Star className="w-6 h-6 md:w-7 md:h-7 text-lime-400 fill-lime-400" />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="text-sm md:text-base text-slate-400 font-semibold uppercase tracking-wider">
              Avaliação média
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <ContinueButton />
        </motion.div>
      </div>
    </div>
  );
};
