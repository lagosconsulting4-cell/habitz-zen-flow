import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

// No SiriOrb import - using clean gradient backgrounds instead

interface TimeBlock {
  id: string;
  time: string;
  period: string;
  icon: React.ElementType;
  title: string;
  description: string;
  emotion: string;
  emotionIcon: React.ElementType;
  // Natural sky gradient colors (top to bottom)
  skyGradient: string;
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
    // Dawn: soft pink, peach, warm yellow - early morning light
    skyGradient: "from-rose-300/40 via-orange-200/30 to-yellow-100/20",
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
    // Midday: bright yellow, warm white - strong sunlight
    skyGradient: "from-yellow-200/40 via-amber-100/30 to-orange-50/20",
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
    // Sunset: orange, pink, warm tones - golden hour
    skyGradient: "from-orange-400/40 via-rose-300/30 to-pink-200/20",
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
    // Night: deep dark tones, no purple - just darkness
    skyGradient: "from-slate-900/60 via-slate-800/40 to-slate-700/20",
    details: [
      "Mente acelerada com arrependimentos",
      "Ansiedade sobre o amanhã",
      "O ciclo se repete há meses",
    ],
  },
];

interface EmotionAccent {
  wrapper: string;
  iconWrapper: string;
  badge: string;
}

const emotionAccents: Record<string, EmotionAccent> = {
  default: {
    wrapper: "bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-primary/30",
    iconWrapper: "bg-primary/20 text-primary-foreground border-white/15",
    badge: "border-white/30 text-white/80 bg-white/5",
  },
  morning: {
    wrapper: "bg-gradient-to-r from-rose-500/20 via-orange-400/15 to-amber-200/10 border-rose-200/40",
    iconWrapper: "bg-white/15 text-rose-50 border-rose-100/50",
    badge: "border-rose-100/70 text-rose-50/90 bg-rose-500/15",
  },
  noon: {
    wrapper: "bg-gradient-to-r from-amber-400/20 via-yellow-300/15 to-lime-200/10 border-amber-200/40",
    iconWrapper: "bg-white/15 text-amber-100 border-amber-100/40",
    badge: "border-amber-100/70 text-amber-50/90 bg-amber-500/15",
  },
  afternoon: {
    wrapper: "bg-gradient-to-r from-orange-500/20 via-rose-400/15 to-pink-300/10 border-orange-200/40",
    iconWrapper: "bg-white/15 text-orange-50 border-orange-100/40",
    badge: "border-orange-100/70 text-orange-50/90 bg-orange-500/15",
  },
  night: {
    wrapper: "bg-gradient-to-r from-slate-800/40 via-purple-900/20 to-indigo-900/10 border-indigo-300/30",
    iconWrapper: "bg-white/10 text-indigo-50 border-indigo-200/40",
    badge: "border-indigo-200/70 text-indigo-50/90 bg-indigo-500/15",
  },
};

const getEmotionAccent = (id: string): EmotionAccent => emotionAccents[id] ?? emotionAccents.default;

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
      {/* Dynamic sky gradient background - top to bottom */}
      <AnimatePresence mode="wait">
        <motion.div
          key={openItem}
          className={`absolute inset-0 bg-gradient-to-b ${currentBlock.skyGradient}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

      {/* Subtle light effect at top */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

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
                const emotionAccent = getEmotionAccent(block.id);

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
                            className={`relative overflow-hidden rounded-2xl border p-5 shadow-lg shadow-black/20 backdrop-blur-sm ${emotionAccent.wrapper}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_65%)]" />
                            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                              <div
                                className={`w-16 h-16 rounded-2xl border flex items-center justify-center backdrop-blur ${emotionAccent.iconWrapper}`}
                              >
                                <EmotionIcon className="w-7 h-7" />
                              </div>
                              <div className="flex-1 text-white space-y-1">
                                <Badge
                                  variant="outline"
                                  className={`w-fit tracking-[0.35em] uppercase text-[0.6rem] font-semibold ${emotionAccent.badge}`}
                                >
                                  Sensação do momento
                                </Badge>
                                <p className="text-sm font-medium text-white/70">
                                  Como você se sente agora?
                                </p>
                                <p className="text-2xl font-semibold leading-tight drop-shadow">
                                  {block.emotion}
                                </p>
                              </div>
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
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-emerald-600 p-6 space-y-5 shadow-2xl shadow-primary/30"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={springTransition}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white">E se pudesse ser diferente?</h3>
                      <p className="text-sm text-white/80">
                        Criamos uma rotina sob medida para você
                      </p>
                    </div>
                  </div>

                  <div className="relative flex items-center gap-6 text-sm text-white/90">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-white" />
                      <span><strong className="text-white">7 min</strong>/dia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-white" />
                      <span>100% personalizada</span>
                    </div>
                  </div>

                  <motion.div {...buttonHoverTap} className="relative">
                    <Button
                      onClick={() => navigate("/offer")}
                      size="xl"
                      className="w-full group bg-white/95 text-slate-900 hover:bg-white border border-white/30 font-bold shadow-xl shadow-black/20"
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
