import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { ContinueButton } from "../ContinueButton";

const feelingMap: { [key: string]: string } = {
  anxiety: "Ansiedade",
  procrastination: "Frustração",
  tiredness: "Cansaço",
  focus: "Frustração",
  forgetfulness: "Frustração",
  motivation: "Frustração",
};

export const ValueBridgeStep = () => {
  const { primaryChallenge, objective } = useQuiz();
  // const feeling = primaryChallenge ? feelingMap[primaryChallenge] : "Frustração";

  const comparisons: any = {
    productivity: {
      before: "Acorda atrasado, corre o dia todo e sente que não fez nada.",
      after: "Acorda com plano pronto, foca no essencial e termina o dia livre.",
      cost: "Mais um ano estagnado na carreira"
    },
    health: {
      before: "Promete treinar, mas a preguiça vence. Come mal por pressa.",
      after: "Treino automático de 15min. Alimentação planejada sem esforço.",
      cost: "Sua saúde cobrando o preço em breve"
    },
    routine: {
      before: "Casa bagunçada, prazos estourados, viver apagando incêndio.",
      after: "Controle total da agenda. Tempo para lazer sem culpa.",
      cost: "Viver sempre cansado e sobrecarregado"
    },
    default: {
      before: "Tenta mudar na força de vontade e desiste em 3 dias.",
      after: "Segue um sistema biológico que torna a disciplina automática.",
      cost: "Continuar no ciclo da frustração"
    }
  };

  const currentComparison = comparisons[objective as string] || comparisons.default;

  return (
    <div className="flex flex-col text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          A escolha é sua
        </h2>

        <div className="grid gap-4 mb-6">
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-left">
            <p className="text-xs font-bold text-red-500 uppercase mb-1">Caminho Atual</p>
            <p className="text-slate-300 text-sm">{currentComparison.before}</p>
          </div>

          <div className="bg-lime-500/10 border border-lime-500/20 rounded-xl p-4 text-left relative overflow-hidden">
            <div className="absolute inset-0 bg-lime-500/5 animate-pulse pointer-events-none" />
            <p className="text-xs font-bold text-lime-400 uppercase mb-1 relative z-10">Caminho BORA</p>
            <p className="text-white text-sm font-medium relative z-10">{currentComparison.after}</p>
          </div>
        </div>

        <p className="text-sm text-slate-500">
          O preço de não agir? <span className="text-white">{currentComparison.cost}</span>.
        </p>
      </motion.div>

      <ContinueButton label="Quero investir em mim" />
    </div>
  );
};
