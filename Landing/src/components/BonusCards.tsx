import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Brain,
  Lightbulb,
  Library,
  Flame,
  Check,
  Play,
  BookOpen,
  Headphones,
  FileText,
  Target,
  Zap,
  Clock,
  Trophy,
} from "lucide-react";

// Dados detalhados dos bônus com capas ilustradas
const bonusDetails = [
  {
    id: 1,
    title: "Programa de 30 Dias",
    value: 297,
    icon: Calendar,
    coverImage: "/images/lp/programa_completo_bonus_capa.png",
    gradient: "from-primary via-emerald-500 to-teal-500",
    shadowColor: "shadow-primary/30",
    description:
      "Jornada completa de transformação com 7 módulos progressivos. Conteúdo disponível em vídeo, áudio e e-book.",
    features: [
      { icon: Play, text: "28 aulas em vídeo HD" },
      { icon: Headphones, text: "Versão em áudio" },
      { icon: FileText, text: "E-books complementares" },
      { icon: Target, text: "Exercícios práticos diários" },
    ],
    highlight: "1 ano de acesso",
  },
  {
    id: 2,
    title: "Jornada Guiada 4 Semanas",
    value: 197,
    icon: Flame,
    coverImage: "/images/lp/jornada_guiada_bonus_capa.png",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    shadowColor: "shadow-orange-500/30",
    description:
      "Roteiro dia a dia do que fazer. Cada manhã você sabe exatamente qual é sua missão.",
    features: [
      { icon: Clock, text: "28 dias estruturados" },
      { icon: Target, text: "Missões diárias claras" },
      { icon: Trophy, text: "Checkpoints semanais" },
      { icon: Zap, text: "Progressão de dificuldade" },
    ],
    highlight: "Começa do zero",
  },
  {
    id: 3,
    title: "Meditações & Respiração",
    value: 147,
    icon: Brain,
    coverImage: "/images/lp/meditações_bonus_capa.png",
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    shadowColor: "shadow-purple-500/30",
    description:
      "10 técnicas de respiração e meditação para foco extremo e controle emocional.",
    features: [
      { icon: Headphones, text: "Áudios guiados em português" },
      { icon: Clock, text: "De 3 a 15 minutos" },
      { icon: Zap, text: "Navy SEAL Breathing" },
      { icon: Target, text: "Box Breathing & Wim Hof" },
    ],
    highlight: "Resultados em minutos",
  },
  {
    id: 4,
    title: "Hub de Livros",
    value: 97,
    icon: Library,
    coverImage: "/images/lp/hub_de_livros_bonus_capa.png",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    shadowColor: "shadow-blue-500/30",
    description:
      "Biblioteca curada com os melhores livros de produtividade, hábitos e mentalidade.",
    features: [
      { icon: BookOpen, text: "Curadoria de especialistas" },
      { icon: FileText, text: "Resumos executivos" },
      { icon: Lightbulb, text: "Insights aplicáveis" },
      { icon: Trophy, text: "Atualizações constantes" },
    ],
    highlight: "Economia de tempo",
  },
  {
    id: 5,
    title: "Dicas Práticas",
    value: 67,
    icon: Lightbulb,
    coverImage: "/images/lp/dicas_praticas_hack_bonus_capa.png",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    shadowColor: "shadow-rose-500/30",
    description:
      "27 hacks comprovados de rotina, sono, alimentação e energia.",
    features: [
      { icon: Zap, text: "27 dicas actionáveis" },
      { icon: Clock, text: "Aplicáveis em 5 minutos" },
      { icon: Target, text: "Baseados em ciência" },
      { icon: Trophy, text: "Zero enrolação" },
    ],
    highlight: "Ação imediata",
  },
];

export const BonusCards = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que está <span className="text-primary">incluso</span> em cada bônus
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cada bônus foi criado para resolver um problema específico da sua rotina
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bonusDetails.map((bonus, index) => (
            <motion.div
              key={bonus.id}
              className="relative group h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              {/* Card com imagem de capa */}
              <div className="relative h-full bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl border border-primary/20 overflow-hidden shadow-lg hover:border-primary/40 transition-all duration-300">
                {/* Cover Image */}
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${bonus.gradient} opacity-20`} />
                  <img
                    src={bonus.coverImage}
                    alt={bonus.title}
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                  {/* Price badges overlay */}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    <span className="text-xs text-white/80 line-through bg-black/30 px-2 py-0.5 rounded">
                      R$ {bonus.value}
                    </span>
                    <Badge className="bg-primary text-white border-0 font-bold shadow-lg">
                      GRÁTIS
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  {/* Title with icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${bonus.gradient} flex items-center justify-center shadow-md ${bonus.shadowColor} flex-shrink-0`}
                    >
                      <bonus.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg leading-tight">{bonus.title}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {bonus.description}
                  </p>

                  {/* Features - 2 columns on larger cards */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4">
                    {bonus.features.map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-2.5 h-2.5 text-primary" />
                        </div>
                        <span className="text-foreground/80 truncate">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Highlight badge */}
                  <div className="pt-3 border-t border-primary/10">
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20 text-xs"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      {bonus.highlight}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BonusCards;
