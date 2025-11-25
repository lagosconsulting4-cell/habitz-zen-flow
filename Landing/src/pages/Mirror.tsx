import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sun,
  Coffee,
  Sunset,
  Moon,
  Sparkles,
  ArrowRight,
  HeartCrack,
  Clock,
  ChevronDown,
  AlertCircle,
  TrendingDown,
  Brain,
  Zap,
} from "lucide-react";
import { buttonHoverTap, springTransition } from "@/hooks/useAnimations";
import SiriOrb from "@/components/smoothui/siri-orb";

interface TimeBlock {
  id: string;
  time: string;
  period: string;
  icon: React.ElementType;
  title: string;
  description: string;
  emotion: string;
  emotionIcon: React.ElementType;
  gradient: {
    from: string;
    via?: string;
    to: string;
  };
  orbColors: {
    bg: string;
    c1: string;
    c2: string;
    c3: string;
  };
  details: string[];
}

const timeBlocks: TimeBlock[] = [
  {
    id: "morning",
    time: "07:00",
    period: "Manhã",
    icon: Sun,
    title: "Mais um dia igual",
    description:
      "Acordou cansado. Pegou o celular antes de levantar. 40 minutos já se passaram e você nem saiu da cama.",
    emotion: "Culpa",
    emotionIcon: HeartCrack,
    gradient: {
      from: "from-amber-500/30",
      via: "via-orange-400/20",
      to: "to-yellow-500/10",
    },
    orbColors: {
      bg: "oklch(15% 0.02 60)",
      c1: "oklch(75% 0.15 70)",
      c2: "oklch(70% 0.18 50)",
      c3: "oklch(80% 0.12 80)",
    },
    details: [
      "Scrollou redes sociais por 40 minutos",
      "Pulou o café da manhã de novo",
      "Começou o dia já atrasado",
    ],
  },
  {
    id: "noon",
    time: "12:30",
    period: "Meio-dia",
    icon: Coffee,
    title: "Almoço e procrastinação",
    description:
      "Prometeu começar depois do almoço. Está rolando o feed há 30 minutos enquanto a tarde escapa.",
    emotion: "Frustração",
    emotionIcon: AlertCircle,
    gradient: {
      from: "from-sky-500/30",
      via: "via-blue-400/20",
      to: "to-cyan-500/10",
    },
    orbColors: {
      bg: "oklch(15% 0.02 220)",
      c1: "oklch(70% 0.12 220)",
      c2: "oklch(65% 0.15 200)",
      c3: "oklch(75% 0.10 240)",
    },
    details: [
      "Deixou tarefas importantes para depois",
      "Não conseguiu focar em nada produtivo",
      "A lista de pendências só aumenta",
    ],
  },
  {
    id: "afternoon",
    time: "18:00",
    period: "Fim de Tarde",
    icon: Sunset,
    title: "Final do dia",
    description:
      "Olha pra trás e percebe: mais um dia perdido sem fazer o que realmente importa. De novo.",
    emotion: "Decepção profunda",
    emotionIcon: TrendingDown,
    gradient: {
      from: "from-orange-500/30",
      via: "via-rose-400/20",
      to: "to-red-500/10",
    },
    orbColors: {
      bg: "oklch(12% 0.03 30)",
      c1: "oklch(65% 0.18 30)",
      c2: "oklch(60% 0.20 15)",
      c3: "oklch(70% 0.15 45)",
    },
    details: [
      "Nenhuma meta foi concluída",
      "Sensação de tempo desperdiçado",
      "Promessas não cumpridas",
    ],
  },
  {
    id: "night",
    time: "23:00",
    period: "Noite",
    icon: Moon,
    title: "Antes de dormir",
    description:
      '"Amanhã vai ser diferente", você pensa. Mas lá no fundo, sabe que não será. Nunca é.',
    emotion: "Sensação de estar ficando pra trás",
    emotionIcon: Brain,
    gradient: {
      from: "from-indigo-500/30",
      via: "via-purple-400/20",
      to: "to-violet-500/10",
    },
    orbColors: {
      bg: "oklch(8% 0.03 280)",
      c1: "oklch(55% 0.15 280)",
      c2: "oklch(50% 0.18 300)",
      c3: "oklch(60% 0.12 260)",
    },
    details: [
      "Mente acelerada com arrependimentos",
      "Ansiedade sobre o amanhã",
      "O ciclo se repete há meses",
    ],
  },
];

const Mirror = () => {
  const navigate = useNavigate();
  const [openItem, setOpenItem] = useState<string>("morning");
  const [visitedItems, setVisitedItems] = useState<Set<string>>(new Set(["morning"]));
  const [showFinalCTA, setShowFinalCTA] = useState(false);

  const currentBlock = timeBlocks.find((b) => b.id === openItem) || timeBlocks[0];
  const allVisited = visitedItems.size === timeBlocks.length;

  useEffect(() => {
    if (openItem) {
      setVisitedItems((prev) => new Set([...prev, openItem]));
    }
  }, [openItem]);

  useEffect(() => {
    if (allVisited && !showFinalCTA) {
      const timer = setTimeout(() => setShowFinalCTA(true), 500);
      return () => clearTimeout(timer);
    }
  }, [allVisited, showFinalCTA]);

  const handleAccordionChange = (value: string) => {
    if (value) {
      setOpenItem(value);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic gradient background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${currentBlock.gradient.from} ${currentBlock.gradient.via || ""} ${currentBlock.gradient.to} transition-all duration-1000`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={openItem}
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />

      {/* Animated SiriOrb background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={openItem}
          className="absolute top-1/4 right-0 translate-x-1/3 opacity-40 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
          animate={{ opacity: 0.4, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotate: 20 }}
          transition={{ duration: 1 }}
        >
          <SiriOrb
            size="600px"
            colors={currentBlock.orbColors}
            animationDuration={25}
          />
        </motion.div>
      </AnimatePresence>

      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-transparent to-background/50 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div
          className="w-full px-6 pt-8 pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springTransition}
            >
              <HeartCrack className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                Espelho do Futuro
              </span>
            </motion.div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Um dia típico se{" "}
              <span className="text-destructive">nada mudar</span>...
            </h1>
            <p className="text-muted-foreground text-sm">
              Toque em cada momento do dia para ver seu reflexo
            </p>
          </div>
        </motion.div>

        {/* Timeline Accordion */}
        <div className="flex-1 px-6 py-4 overflow-auto">
          <div className="max-w-2xl mx-auto">
            <Accordion
              type="single"
              value={openItem}
              onValueChange={handleAccordionChange}
              className="space-y-4"
            >
              {timeBlocks.map((block, index) => {
                const BlockIcon = block.icon;
                const EmotionIcon = block.emotionIcon;
                const isOpen = openItem === block.id;
                const isVisited = visitedItems.has(block.id);

                return (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AccordionItem
                      value={block.id}
                      className={`
                        rounded-2xl border-2 overflow-hidden transition-all duration-500
                        ${isOpen
                          ? "border-primary/50 bg-card/95 shadow-2xl shadow-primary/10"
                          : isVisited
                            ? "border-primary/20 bg-card/60"
                            : "border-border/50 bg-card/40"
                        }
                      `}
                    >
                      <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                        <div className="flex items-center gap-4 w-full">
                          {/* Time indicator */}
                          <motion.div
                            className={`
                              w-14 h-14 rounded-xl flex items-center justify-center
                              transition-all duration-300
                              ${isOpen
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                                : isVisited
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }
                            `}
                            animate={{ scale: isOpen ? 1.05 : 1 }}
                          >
                            <BlockIcon className="w-7 h-7" />
                          </motion.div>

                          {/* Time and title */}
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className={`
                                text-2xl font-bold tabular-nums
                                ${isOpen ? "text-primary" : "text-foreground"}
                              `}>
                                {block.time}
                              </span>
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {block.period}
                              </span>
                            </div>
                            <p className={`
                              text-sm mt-1 transition-colors
                              ${isOpen ? "text-foreground" : "text-muted-foreground"}
                            `}>
                              {block.title}
                            </p>
                          </div>

                          {/* Status indicator */}
                          {isVisited && !isOpen && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"
                            >
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </motion.div>
                          )}

                          {/* Chevron */}
                          <ChevronDown className={`
                            w-5 h-5 transition-transform duration-300
                            ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"}
                          `} />
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-6 pb-6">
                        <motion.div
                          className="space-y-5 pt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {/* Description */}
                          <p className="text-lg text-foreground/90 leading-relaxed">
                            {block.description}
                          </p>

                          {/* Details list */}
                          <div className="space-y-2">
                            {block.details.map((detail, i) => (
                              <motion.div
                                key={i}
                                className="flex items-center gap-3 text-muted-foreground"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive/60" />
                                <span className="text-sm">{detail}</span>
                              </motion.div>
                            ))}
                          </div>

                          {/* Emotion card */}
                          <motion.div
                            className="flex items-center gap-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                              <EmotionIcon className="w-6 h-6 text-destructive" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-destructive/70 uppercase tracking-wider">
                                Como você se sente
                              </p>
                              <p className="text-lg font-semibold text-destructive">
                                {block.emotion}
                              </p>
                            </div>
                          </motion.div>
                        </motion.div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                );
              })}
            </Accordion>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="relative z-20 px-6 py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showFinalCTA ? 1 : 0.5, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-2xl mx-auto">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {timeBlocks.map((block) => (
                <motion.div
                  key={block.id}
                  className={`
                    h-1.5 rounded-full transition-all duration-300
                    ${visitedItems.has(block.id)
                      ? "w-8 bg-primary"
                      : "w-3 bg-muted"
                    }
                  `}
                  animate={{ scale: openItem === block.id ? 1.2 : 1 }}
                />
              ))}
            </div>

            {/* CTA Card */}
            <AnimatePresence>
              {showFinalCTA && (
                <motion.div
                  className="glass-card p-6 space-y-4 border-primary/30"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={springTransition}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">E se pudesse ser diferente?</h3>
                      <p className="text-sm text-muted-foreground">
                        Criamos uma rotina sob medida para você
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span><strong className="text-foreground">7 min</strong>/dia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>100% personalizada</span>
                    </div>
                  </div>

                  <motion.div {...buttonHoverTap} className="pt-2">
                    <Button
                      onClick={() => navigate("/offer")}
                      variant="premium"
                      size="xl"
                      className="w-full group"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      <span>Ver minha rotina personalizada</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint text when not all visited */}
            {!showFinalCTA && (
              <motion.p
                className="text-center text-sm text-muted-foreground"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Explore todos os momentos do dia para continuar
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Mirror;
