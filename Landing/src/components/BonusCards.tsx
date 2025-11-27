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

// Dados detalhados dos bônus
const bonusDetails = [
  {
    id: 1,
    title: "Programa de 30 Dias",
    value: 297,
    icon: Calendar,
    gradient: "from-primary via-emerald-500 to-teal-500",
    shadowColor: "shadow-primary/30",
    description:
      "Jornada completa de transformação com 7 módulos progressivos. Conteúdo disponível em vídeo, áudio e e-book para você aprender do seu jeito.",
    features: [
      { icon: Play, text: "28 aulas em vídeo HD" },
      { icon: Headphones, text: "Versão em áudio para ouvir anywhere" },
      { icon: FileText, text: "E-books complementares" },
      { icon: Target, text: "Exercícios práticos diários" },
    ],
    highlight: "Acesso vitalício",
  },
  {
    id: 2,
    title: "Jornada Guiada 4 Semanas",
    value: 197,
    icon: Flame,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    shadowColor: "shadow-orange-500/30",
    description:
      "Roteiro dia a dia do que fazer. Nada de ficar perdido. Cada manhã você sabe exatamente qual é sua missão.",
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
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    shadowColor: "shadow-purple-500/30",
    description:
      "10 técnicas de respiração e meditação usadas por Navy SEALs, CEOs e atletas de elite para foco extremo e controle emocional.",
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
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    shadowColor: "shadow-blue-500/30",
    description:
      "Biblioteca curada com os melhores livros de produtividade, hábitos e mentalidade. Resumos executivos + insights práticos.",
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
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    shadowColor: "shadow-rose-500/30",
    description:
      "27 hacks comprovados de rotina, sono, alimentação e energia. Pequenas mudanças que geram resultados enormes.",
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
              {/* Card */}
              <div className="relative h-full bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl border border-primary/20 overflow-hidden shadow-lg hover:border-primary/40 transition-all duration-300">
                {/* Top gradient bar */}
                <div
                  className={`h-2 bg-gradient-to-r ${bonus.gradient}`}
                />

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${bonus.gradient} flex items-center justify-center shadow-lg ${bonus.shadowColor}`}
                    >
                      <bonus.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground line-through">
                        R$ {bonus.value}
                      </p>
                      <Badge className="bg-primary/20 text-primary border-primary/30 font-bold">
                        GRÁTIS
                      </Badge>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-xl mb-2">{bonus.title}</h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {bonus.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {bonus.features.map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-foreground">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Highlight badge */}
                  <div className="pt-4 border-t border-primary/10">
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20"
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
