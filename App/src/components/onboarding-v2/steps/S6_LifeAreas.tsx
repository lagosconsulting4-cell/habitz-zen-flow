import { motion } from "motion/react";
import { Briefcase, Dumbbell, Brain, Heart } from "lucide-react";
import { useOnboardingV2, type LifeArea } from "../OnboardingProviderV2";

const LIFE_AREA_OPTIONS = [
  { value: "work" as LifeArea,          label: "Trabalho",      Icon: Briefcase },
  { value: "physical" as LifeArea,      label: "Saúde física",  Icon: Dumbbell },
  { value: "mind" as LifeArea,          label: "Mente",         Icon: Brain },
  { value: "relationships" as LifeArea, label: "Relações",      Icon: Heart },
] as const;

export const S6LifeAreas = () => {
  const { lifeAreas, toggleLifeArea } = useOnboardingV2();

  return (
    <div className="h-full flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-foreground">
          O que mais importa pra você agora?
        </h2>
        <p className="text-base text-muted-foreground mt-2">
          Escolha as áreas que você quer trabalhar. Pode marcar mais de uma.
        </p>
      </motion.div>

      {/* Chips */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
          {LIFE_AREA_OPTIONS.map(({ value, label, Icon }, index) => {
            const isSelected = lifeAreas.includes(value);
            const isDisabled = lifeAreas.length >= 4 && !isSelected;

            return (
              <motion.button
                key={value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.1 + index * 0.08,
                  duration: 0.35,
                  type: "spring",
                  stiffness: 300,
                  damping: 22,
                }}
                whileTap={{ scale: isDisabled ? 1 : 0.94 }}
                onClick={() => !isDisabled && toggleLifeArea(value)}
                disabled={isDisabled}
                className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : isDisabled
                      ? "border-border/40 bg-muted/10 opacity-40 cursor-not-allowed"
                      : "border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5 active:border-primary/40 active:bg-primary/5"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`text-sm font-semibold leading-tight ${
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Microcopy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-sm text-muted-foreground/70 text-center mt-6"
        >
          Suas escolhas definem os hábitos. Quanto mais honesto, melhor a rotina.
        </motion.p>
      </div>
    </div>
  );
};
