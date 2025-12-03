import { motion } from "motion/react";
import { Lock, Sparkles, Sun, Cloud, Moon, Clock } from "lucide-react";
import { useQuiz } from "./QuizProvider";
import { Button } from "@/components/ui/button";
import type { RecommendedHabit } from "@/lib/quizConfig";
import { cn } from "@/lib/utils";

interface LockedRoutinePreviewProps {
  onClose: () => void;
}

// Agrupa hábitos por período
const groupByPeriod = (habits: RecommendedHabit[]) => {
  return {
    morning: habits.filter((h) => h.period === "morning"),
    afternoon: habits.filter((h) => h.period === "afternoon"),
    evening: habits.filter((h) => h.period === "evening"),
  };
};

// Componente de hábito visível
const VisibleHabitCard = ({ habit }: { habit: RecommendedHabit }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm"
  >
    <div
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center text-xl",
        habit.color || "bg-slate-100"
      )}
    >
      {habit.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-slate-900 text-sm truncate">{habit.name}</p>
      <div className="flex items-center gap-1 text-xs text-slate-400">
        <Clock className="w-3 h-3" />
        <span>{habit.suggested_time}</span>
      </div>
    </div>
  </motion.div>
);

// Componente de hábito bloqueado
const LockedHabitCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
  >
    {/* Overlay com blur */}
    <div className="absolute inset-0 flex items-center justify-center z-10 rounded-xl bg-slate-50/80 backdrop-blur-[1px]">
      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
        <Lock className="w-4 h-4 text-slate-400" />
      </div>
    </div>
    {/* Placeholder content */}
    <div className="w-10 h-10 rounded-xl bg-slate-200" />
    <div className="flex-1">
      <div className="h-4 bg-slate-200 rounded w-24 mb-1" />
      <div className="h-3 bg-slate-100 rounded w-16" />
    </div>
  </motion.div>
);

// Componente de seção de período
const PeriodSection = ({
  title,
  icon: Icon,
  habits,
  lockedCount,
  delay,
}: {
  title: string;
  icon: typeof Sun;
  habits: RecommendedHabit[];
  lockedCount: number;
  delay: number;
}) => {
  if (habits.length === 0 && lockedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          {title}
        </h3>
        <span className="text-xs text-slate-400">
          ({habits.length + lockedCount} hábitos)
        </span>
      </div>
      <div className="space-y-2">
        {habits.map((habit, i) => (
          <VisibleHabitCard key={habit.id} habit={habit} />
        ))}
        {Array.from({ length: lockedCount }).map((_, i) => (
          <LockedHabitCard key={`locked-${i}`} />
        ))}
      </div>
    </motion.div>
  );
};

export const LockedRoutinePreview = ({ onClose }: LockedRoutinePreviewProps) => {
  const { recommendedHabits, isGeneratingRoutine } = useQuiz();

  // Calcula quantos hábitos mostrar (50%) e quantos bloquear
  const totalHabits = recommendedHabits.length;
  const visibleCount = Math.ceil(totalHabits / 2);
  const lockedCount = totalHabits - visibleCount;

  // Separa hábitos visíveis dos bloqueados
  const visibleHabits = recommendedHabits.slice(0, visibleCount);
  const grouped = groupByPeriod(visibleHabits);

  // Distribui os bloqueados proporcionalmente por período
  const totalGrouped =
    grouped.morning.length + grouped.afternoon.length + grouped.evening.length;
  const lockedByPeriod = {
    morning: Math.round((grouped.morning.length / totalGrouped) * lockedCount) || 0,
    afternoon: Math.round((grouped.afternoon.length / totalGrouped) * lockedCount) || 0,
    evening: Math.round((grouped.evening.length / totalGrouped) * lockedCount) || 0,
  };

  // Garante que a soma dos bloqueados seja exata
  const lockedSum =
    lockedByPeriod.morning + lockedByPeriod.afternoon + lockedByPeriod.evening;
  if (lockedSum < lockedCount) {
    lockedByPeriod.evening += lockedCount - lockedSum;
  }

  // Handler para scroll até pricing e fechar modal
  const handleUnlock = () => {
    onClose();
    setTimeout(() => {
      const pricingSection = document.getElementById("pricing");
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  if (isGeneratingRoutine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Sparkles className="w-full h-full text-[#A3E635]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Gerando sua rotina...
          </h2>
          <p className="text-slate-500">
            Analisando seu perfil e criando hábitos personalizados
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#A3E635]/20 rounded-full mb-3">
          <Sparkles className="w-4 h-4 text-[#65a30d]" />
          <span className="text-sm font-medium text-[#65a30d]">Rotina personalizada</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {totalHabits} hábitos criados para você!
        </h2>
        <p className="text-sm text-slate-500">
          Baseado no seu perfil, objetivos e desafios
        </p>
      </motion.div>

      {/* Hábitos por período */}
      <div className="mb-6">
        <PeriodSection
          title="Manhã"
          icon={Sun}
          habits={grouped.morning}
          lockedCount={lockedByPeriod.morning}
          delay={0.2}
        />
        <PeriodSection
          title="Tarde"
          icon={Cloud}
          habits={grouped.afternoon}
          lockedCount={lockedByPeriod.afternoon}
          delay={0.3}
        />
        <PeriodSection
          title="Noite"
          icon={Moon}
          habits={grouped.evening}
          lockedCount={lockedByPeriod.evening}
          delay={0.4}
        />
      </div>

      {/* CTA de desbloqueio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#A3E635]/20 rounded-full mb-3">
          <Lock className="w-3 h-3 text-[#A3E635]" />
          <span className="text-xs font-medium text-[#A3E635]">
            {lockedCount} hábitos bloqueados
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          Desbloqueie sua rotina completa
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Acesse todos os hábitos personalizados e comece sua transformação hoje
        </p>

        <Button
          onClick={handleUnlock}
          size="lg"
          className="w-full bg-[#A3E635] hover:bg-[#84cc16] text-slate-900 font-bold py-6 text-lg"
        >
          <Lock className="w-5 h-5 mr-2" />
          DESBLOQUEAR ROTINA COMPLETA
        </Button>

        <p className="text-slate-500 text-xs mt-3">
          Acesso vitalício por apenas{" "}
          <span className="text-[#A3E635] font-bold">R$ 47</span>
        </p>
      </motion.div>
    </div>
  );
};
