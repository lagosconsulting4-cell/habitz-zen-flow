import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import {
  Trophy,
  Clock,
  Sun,
  Cloud,
  Moon,
  Calendar,
  Target,
  TrendingUp,
  Zap,
  Sunrise,
  ListChecks,
  Timer,
  Mail,
  BarChart3,
  Dumbbell,
  Droplets,
  Utensils,
  Sparkles,
  Footprints,
  Pill,
  BookOpen,
  Heart,
  PhoneOff,
  BookMarked,
  Flower2,
  BedDouble,
  Brush,
  UtensilsCrossed,
  FolderOpen,
  AlarmClock,
  Smartphone,
  Ban,
  Wine,
  Tv,
  Star,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RecommendedHabit } from "@/lib/quizConfig";
import { ContinueButton } from "../ContinueButton";

// Mapeamento de emoji para ícone Lucide
const EMOJI_TO_ICON: Record<string, LucideIcon> = {
  "🌅": Sunrise,
  "📋": ListChecks,
  "🎯": Target,
  "🍅": Timer,
  "📧": Mail,
  "📊": BarChart3,
  "💪": Dumbbell,
  "💧": Droplets,
  "🥗": Utensils,
  "😴": Moon,
  "🧘": Sparkles,
  "🚶": Footprints,
  "💊": Pill,
  "📔": BookOpen,
  "🙏": Heart,
  "😮‍💨": Sparkles,
  "📵": PhoneOff,
  "📖": BookMarked,
  "🌸": Flower2,
  "🛏️": BedDouble,
  "🧹": Brush,
  "🍱": UtensilsCrossed,
  "📅": Calendar,
  "🗂️": FolderOpen,
  "🌙": Moon,
  "☀️": Sun,
  "⏰": AlarmClock,
  "📱": Smartphone,
  "🍔": Ban,
  "⚡": Zap,
  "🚫": Ban,
  "🍷": Wine,
  "📺": Tv,
};

// Componente para exibir ícone do hábito
const HabitIcon = ({
  emoji,
  className = "w-6 h-6",
}: {
  emoji: string;
  className?: string;
}) => {
  const Icon = EMOJI_TO_ICON[emoji] || Activity;
  return <Icon className={className} />;
};

// Helper: Group habits by period
const groupByPeriod = (habits: RecommendedHabit[]) => ({
  morning: habits.filter((h) => h.period === "morning"),
  afternoon: habits.filter((h) => h.period === "afternoon"),
  evening: habits.filter((h) => h.period === "evening"),
});

// Labels for categories
const categoryLabels: Record<string, string> = {
  productivity: "Produtividade",
  health: "Saúde",
  mental: "Bem-Estar",
  routine: "Rotina",
  avoid: "Eliminar",
};

// Labels for objective
const objectiveLabels: Record<string, string> = {
  productivity: "Mais Produtividade",
  health: "Saúde Física",
  routine: "Organização",
  avoid: "Eliminar Vícios",
  mental: "Qualidade de Vida",
};

// Labels for goal units
const goalUnitLabels: Record<string, string> = {
  none: "vez",
  minutes: "min",
  hours: "h",
  times: "vezes",
  pages: "páginas",
  ml: "ml",
  steps: "passos",
};

// Componente: DetailedHabitCard
const DetailedHabitCard = ({
  habit,
  index,
}: {
  habit: RecommendedHabit;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <Card className="hover:shadow-md transition-all duration-200 hover:border-lime-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-lime-100 text-lime-700">
            <HabitIcon emoji={habit.icon} className="w-6 h-6" />
          </div>

          {/* Info Principal */}
          <div className="flex-1 min-w-0">
            {/* Nome + Categoria */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-bold text-base text-slate-900">
                {habit.name}
              </h4>
              <Badge variant="outline" className="text-xs text-lime-700 bg-lime-50 border-lime-200">
                {categoryLabels[habit.category] || habit.category}
              </Badge>
            </div>

            {/* Horário e Duração */}
            <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {habit.suggested_time}
              </span>
              {habit.duration && <span className="text-slate-400">•</span>}
              {habit.duration && <span>{habit.duration} min</span>}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 text-sm mb-1">
              <Target className="w-3 h-3 text-lime-600" />
              <span className="text-slate-700">
                Meta: {habit.goal_value}{" "}
                {goalUnitLabels[habit.goal_unit] || habit.goal_unit}
              </span>
            </div>

            {/* Frequência */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>{habit.frequency_days.length}x por semana</span>
            </div>
          </div>

          {/* Score e Prioridade */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge
              variant={
                habit.recommendation_score >= 70 ? "default" : "secondary"
              }
              className="whitespace-nowrap"
            >
              <Zap className="w-3 h-3 mr-1" />
              {Math.round(habit.recommendation_score)}
            </Badge>

            {habit.priority >= 8 && (
              <Badge variant="outline" className="text-xs text-amber-600 bg-amber-50 border-amber-200">
                <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" /> Alta
              </Badge>
            )}
          </div>
        </div>

        {/* Fontes de Recomendação (expandível) */}
        {habit.recommendation_sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <details className="text-xs">
              <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
                Por que este hábito? ({habit.recommendation_sources.length}{" "}
                razões)
              </summary>
              <div className="mt-2 space-y-1">
                {habit.recommendation_sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-slate-600"
                  >
                    <span className="w-1 h-1 rounded-full bg-lime-500" />
                    <span>
                      {source
                        .replace("objective:", "Objetivo: ")
                        .replace("challenge:", "Desafio: ")}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// Componente: PeriodSection
const PeriodSection = ({
  title,
  icon: Icon,
  habits,
  delay,
}: {
  title: string;
  icon: typeof Sun;
  habits: RecommendedHabit[];
  delay: number;
}) => {
  if (habits.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100">
          <Icon className="w-5 h-5 text-slate-700" />
        </div>
        <h3 className="font-bold text-lg text-slate-900">{title}</h3>
        <Badge variant="secondary" className="ml-auto">{habits.length} hábitos</Badge>
      </div>

      <div className="space-y-2">
        {habits.map((habit, idx) => (
          <DetailedHabitCard key={habit.id} habit={habit} index={idx} />
        ))}
      </div>
    </motion.div>
  );
};

// Componente: RoadmapView
const RoadmapView = ({ habits }: { habits: RecommendedHabit[] }) => {
  // Agrupa por prioridade
  const highPriority = habits.filter((h) => h.priority >= 8);
  const mediumPriority = habits.filter(
    (h) => h.priority >= 6 && h.priority < 8
  );
  const lowerPriority = habits.filter((h) => h.priority < 6);

  return (
    <div className="space-y-4">
      {/* Fase 1: Semanas 1-4 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
            Semanas 1-4: Construir Fundação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Foco em criar consistência com{" "}
            <strong>{highPriority.length} hábitos essenciais</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {highPriority.map((h) => (
              <Badge key={h.id} variant="secondary" className="text-sm flex items-center gap-1.5">
                <HabitIcon emoji={h.icon} className="w-3.5 h-3.5" />
                {h.name}
              </Badge>
            ))}
          </div>
          <Separator />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Target className="w-3 h-3" />
            <span>Meta: 60% de consistência mínima</span>
          </div>
        </CardContent>
      </Card>

      {/* Fase 2: Semanas 5-8 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-lime-600" />
            Semanas 5-8: Expandir Rotina
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Adicionar{" "}
            <strong>{mediumPriority.length} hábitos complementares</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {mediumPriority.map((h) => (
              <Badge key={h.id} variant="outline" className="text-sm flex items-center gap-1.5">
                <HabitIcon emoji={h.icon} className="w-3.5 h-3.5" />
                {h.name}
              </Badge>
            ))}
          </div>
          <Separator />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Target className="w-3 h-3" />
            <span>Meta: 80% de consistência</span>
          </div>
        </CardContent>
      </Card>

      {/* Fase 3: Semanas 9-12 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-orange-600" />
            Semanas 9-12: Consolidar Resultados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Rotina completa com todos os <strong>{habits.length} hábitos</strong>
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {highPriority.length}
              </div>
              <div className="text-xs text-slate-600">Essenciais</div>
            </div>
            <div className="p-3 bg-lime-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-lime-600">
                {mediumPriority.length}
              </div>
              <div className="text-xs text-slate-600">Suporte</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {lowerPriority.length}
              </div>
              <div className="text-xs text-slate-600">Bônus</div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Target className="w-3 h-3" />
            <span>Meta: 90%+ de consistência, resultados visíveis</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente Principal: PersonalizedPlanView
export const PersonalizedPlanView = () => {
  const { recommendedHabits, objective, nextStep } = useQuiz();

  // Cálculos
  const totalDailyMinutes = recommendedHabits.reduce(
    (sum, h) => sum + (h.duration || 0),
    0
  );
  const averageScore = Math.round(
    recommendedHabits.reduce((sum, h) => sum + h.recommendation_score, 0) /
      recommendedHabits.length
  );
  const { morning, afternoon, evening } = groupByPeriod(recommendedHabits);

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Header de Celebração */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
          className="mb-6"
        >
          <div className="relative flex items-center justify-center">
            {/* Anel de celebração */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              className="absolute inset-0 w-28 h-28 -m-2 bg-lime-500 rounded-full"
            />

            <div className="w-24 h-24 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center shadow-2xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-center mb-8 px-4"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Personalizado!
          </h1>
          <p className="text-lg text-slate-700">
            {recommendedHabits.length} hábitos criados especialmente para você
          </p>
        </motion.div>
      </div>

      {/* 2. Summary Cards (4 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Card 1: Objetivo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Objetivo Principal</p>
                <p className="font-bold text-slate-900">
                  {objectiveLabels[objective || ""] || "Seu Objetivo"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: Tempo Total */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-8 h-8 text-lime-600" />
              <div>
                <p className="text-xs text-slate-500">Tempo Diário</p>
                <p className="font-bold text-slate-900">
                  ~{totalDailyMinutes} min
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Distribuição */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex gap-1">
                <Sun className="w-5 h-5 text-orange-500" />
                <Cloud className="w-5 h-5 text-blue-500" />
                <Moon className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Distribuição</p>
                <p className="font-bold text-slate-900 text-sm">
                  {morning.length} manhã, {afternoon.length} tarde,{" "}
                  {evening.length} noite
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: Score Médio */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-xs text-slate-500">Score de Relevância</p>
                <p className="font-bold text-slate-900">{averageScore}%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 3. Tabs: Por Período | Roadmap */}
      <Tabs defaultValue="period" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="period">Por Período do Dia</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap 12 Semanas</TabsTrigger>
        </TabsList>

        <TabsContent value="period" className="space-y-6 mt-6">
          <PeriodSection
            title="Manhã"
            icon={Sun}
            habits={morning}
            delay={0.3}
          />
          <PeriodSection
            title="Tarde"
            icon={Cloud}
            habits={afternoon}
            delay={0.4}
          />
          <PeriodSection
            title="Noite"
            icon={Moon}
            habits={evening}
            delay={0.5}
          />
        </TabsContent>

        <TabsContent value="roadmap" className="mt-6">
          <RoadmapView habits={recommendedHabits} />
        </TabsContent>
      </Tabs>

      <ContinueButton />
    </div>
  );
};
