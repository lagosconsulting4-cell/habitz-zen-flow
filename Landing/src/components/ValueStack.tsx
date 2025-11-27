import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  BookOpen,
  Calendar,
  Brain,
  Lightbulb,
  Library,
  Check,
  Gift,
  Flame,
} from "lucide-react";

// Dados dos bônus com valores atribuídos
const bonuses = [
  {
    id: 1,
    title: "Programa de 30 Dias",
    subtitle: "Transformação completa",
    value: 297,
    description: "7 módulos • 28 aulas • Vídeo + Áudio + E-books",
    icon: Calendar,
    gradient: "from-primary via-emerald-500 to-teal-500",
    shadowColor: "shadow-primary/30",
    highlights: [
      "Jornada estruturada dia a dia",
      "Conteúdo em múltiplos formatos",
      "Do básico ao avançado",
    ],
  },
  {
    id: 2,
    title: "Jornada Guiada 4 Semanas",
    subtitle: "Acompanhamento diário",
    value: 197,
    description: "28 dias de tarefas estruturadas",
    icon: Flame,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    shadowColor: "shadow-orange-500/30",
    highlights: [
      "Missões diárias personalizadas",
      "Progressão gradual de dificuldade",
      "Checkpoints semanais",
    ],
  },
  {
    id: 3,
    title: "Meditações & Respiração",
    subtitle: "Foco e clareza mental",
    value: 147,
    description: "10 técnicas com áudio guiado",
    icon: Brain,
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    shadowColor: "shadow-purple-500/30",
    highlights: [
      "Navy SEAL Breathing",
      "Box Breathing",
      "Wim Hof Method",
    ],
  },
  {
    id: 4,
    title: "Hub de Livros",
    subtitle: "Biblioteca curada",
    value: 97,
    description: "Os melhores livros de desenvolvimento pessoal",
    icon: Library,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    shadowColor: "shadow-blue-500/30",
    highlights: [
      "Resumos executivos",
      "Insights práticos",
      "Curadoria de especialistas",
    ],
  },
  {
    id: 5,
    title: "Dicas Práticas",
    subtitle: "Ação imediata",
    value: 67,
    description: "27 hacks de rotina e nutrição",
    icon: Lightbulb,
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    shadowColor: "shadow-rose-500/30",
    highlights: [
      "Aplicáveis hoje",
      "Baseados em ciência",
      "Zero enrolação",
    ],
  },
];

const totalValue = bonuses.reduce((sum, bonus) => sum + bonus.value, 0);

export const ValueStack = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px]" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-4 bg-gradient-to-r from-primary to-emerald-500 text-white border-0 shadow-lg shadow-primary/25">
            <Gift className="w-3 h-3 mr-1" />
            Bônus Exclusivos
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Tudo que você vai receber <span className="text-primary">HOJE</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Você receberia R$ {totalValue} em conteúdo premium...
            <br />
            <span className="text-primary font-semibold">Mas hoje leva TUDO por apenas R$ 47</span>
          </p>
        </motion.div>

        {/* Bonus Cards Stack */}
        <div className="space-y-4">
          {bonuses.map((bonus, index) => (
            <motion.div
              key={bonus.id}
              className="relative group"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Card */}
              <div className="relative bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl border border-primary/20 p-4 sm:p-6 overflow-hidden shadow-lg hover:border-primary/40 transition-all duration-300">
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${bonus.gradient} flex items-center justify-center flex-shrink-0 shadow-lg ${bonus.shadowColor}`}
                  >
                    <bonus.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-2">
                      <div>
                        <h3 className="font-bold text-lg sm:text-xl text-foreground">
                          {bonus.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {bonus.subtitle}
                        </p>
                      </div>
                      {/* Value badge */}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-muted-foreground line-through border-muted-foreground/30 text-sm"
                        >
                          R$ {bonus.value}
                        </Badge>
                        <Badge className="bg-primary/20 text-primary border-primary/30 font-bold">
                          GRÁTIS
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      {bonus.description}
                    </p>
                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2">
                      {bonus.highlights.map((highlight, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs text-primary/80 bg-primary/10 rounded-full px-2 py-1"
                        >
                          <Check className="w-3 h-3" />
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total Value Summary */}
        <motion.div
          className="mt-8 relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-emerald-500 to-teal-500 rounded-2xl blur opacity-30" />

          <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-primary/20 rounded-2xl p-6 sm:p-8 border-2 border-primary/40 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Value breakdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-muted-foreground text-sm sm:text-base mb-1">
                    VALOR TOTAL DOS BÔNUS
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-muted-foreground line-through">
                    R$ {totalValue}
                  </p>
                </div>
                <div className="h-px sm:h-12 sm:w-px bg-primary/30" />
                <div className="text-right">
                  <p className="text-muted-foreground text-sm sm:text-base mb-1">
                    HOJE VOCÊ PAGA
                  </p>
                  <p className="text-4xl sm:text-5xl font-black text-primary">
                    R$ 47
                  </p>
                </div>
              </div>

              {/* Savings highlight */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                <p className="text-center sm:text-left">
                  <span className="text-primary font-bold text-lg sm:text-xl">
                    Economia de {Math.round(((totalValue - 47) / totalValue) * 100)}%
                  </span>
                  <span className="text-muted-foreground text-sm sm:text-base block sm:inline sm:ml-2">
                    — Isso é menos que um jantar que você vai esquecer amanhã
                  </span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValueStack;
