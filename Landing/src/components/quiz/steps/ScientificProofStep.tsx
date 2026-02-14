import { motion } from "motion/react";
import { ContinueButton } from "../ContinueButton";
import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number";

const UNIVERSITIES = [
  {
    name: "Harvard University",
    field: "Psicologia Comportamental",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_coat_of_arms.svg/240px-Harvard_University_coat_of_arms.svg.png",
  },
  {
    name: "Stanford University",
    field: "Neurociência do Hábito",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Leland_Stanford_Junior_University.svg/240px-Seal_of_Leland_Stanford_Junior_University.svg.png",
  },
  {
    name: "Yale University",
    field: "Ciência da Motivação",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Yale_University_Shield_1.svg/240px-Yale_University_Shield_1.svg.png",
  },
];

export const ScientificProofStep = () => {
  return (
    <div className="relative w-full h-full min-h-[100dvh] overflow-hidden">
      {/* Background Image - DNA */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/images/dna-bg.jpg"
          alt="DNA Background"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?q=80&w=1920&auto=format&fit=crop";
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
          className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 max-w-4xl leading-tight"
        >
          Baseado em{" "}
          <span className="text-lime-400">milhares</span>{" "}
          de artigos científicos
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg md:text-xl text-slate-300 mb-16 max-w-2xl"
        >
          O método Bora foi construído com base em pesquisas das melhores universidades do mundo
        </motion.p>

        {/* University Logos - Horizontal Line */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex items-center justify-center gap-12 md:gap-20 mb-16"
        >
          {UNIVERSITIES.map((uni, index) => (
            <motion.div
              key={uni.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.2, duration: 0.5 }}
              className="group"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                {/* Logo */}
                <img
                  src={uni.logo}
                  alt={uni.name}
                  className="w-20 h-20 md:w-28 md:h-28 object-contain filter brightness-90 group-hover:brightness-110 transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://ui-avatars.com/api/?name=${uni.name.charAt(0)}&size=200&background=84cc16&color=fff&bold=true`;
                  }}
                />

                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 rounded-full bg-lime-400/0 group-hover:bg-lime-400/10 blur-xl transition-all duration-300" />
              </motion.div>

              {/* University Name - Visible on Hover */}
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="mt-3 text-xs md:text-sm text-slate-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                {uni.name}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats - 2.847+ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="text-6xl md:text-7xl font-black text-lime-400 mb-3">
            <CountingNumber
              number={2847}
              fromNumber={0}
              delay={1.8}
              duration={2.5}
              suffix="+"
            />
          </div>
          <p className="text-base md:text-lg text-slate-300 font-medium">
            artigos revisados para criar seu protocolo
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          <ContinueButton />
        </motion.div>
      </div>
    </div>
  );
};
