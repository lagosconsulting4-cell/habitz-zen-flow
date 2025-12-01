import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProgram, getProgramProgress } from "@/hooks/useProgram";
import { CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdherenceCard = () => {
  const { modules, userProgress, isLoading } = useProgram();
  const navigate = useNavigate();

  if (isLoading || !modules || modules.length === 0) {
    return null;
  }

  const programProgress = getProgramProgress(modules, userProgress);

  // Calcular aderência ao plano
  const calculateAdherence = () => {
    // Encontrar a data mais antiga de progresso (quando o usuário começou)
    if (!userProgress || userProgress.length === 0) {
      return { status: "not-started", week: 0, expectedWeek: 1 };
    }

    // Pegar a data do primeiro progresso registrado
    const firstProgress = userProgress
      .filter((p) => p.status === "completed")
      .sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime())[0];

    if (!firstProgress) {
      return { status: "in-progress", week: 1, expectedWeek: 1 };
    }

    const startDate = new Date(firstProgress.completed_at!);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calcular semana esperada (cada semana = 7 dias)
    const expectedWeek = Math.min(Math.floor(daysSinceStart / 7) + 1, 4);

    // Calcular semana atual baseada nas aulas completadas
    const completedLessons = programProgress.completedLessons;
    const lessonsPerWeek = Math.ceil(programProgress.totalLessons / 4); // ~9 aulas por semana
    const currentWeek = Math.min(Math.ceil(completedLessons / lessonsPerWeek), 4);

    // Determinar status
    let status: "on-track" | "slightly-behind" | "behind";
    if (currentWeek >= expectedWeek) {
      status = "on-track";
    } else if (currentWeek === expectedWeek - 1) {
      status = "slightly-behind";
    } else {
      status = "behind";
    }

    return { status, week: currentWeek || 1, expectedWeek };
  };

  const adherence = calculateAdherence();

  const getStatusConfig = () => {
    switch (adherence.status) {
      case "on-track":
        return {
          icon: CheckCircle,
          iconColor: "text-green-500",
          bgColor: "from-green-50 to-emerald-50",
          borderColor: "border-green-200",
          title: "Você está no ritmo!",
          subtitle: "Continue assim, seu progresso está ótimo",
          badgeText: "No ritmo",
          badgeColor: "bg-green-500 text-white",
        };
      case "slightly-behind":
        return {
          icon: Clock,
          iconColor: "text-yellow-500",
          bgColor: "from-yellow-50 to-orange-50",
          borderColor: "border-yellow-200",
          title: "Quase lá!",
          subtitle: "Você está um pouco atrasado, mas pode recuperar",
          badgeText: "Levemente atrasado",
          badgeColor: "bg-yellow-500 text-white",
        };
      case "behind":
        return {
          icon: AlertCircle,
          iconColor: "text-orange-500",
          bgColor: "from-orange-50 to-red-50",
          borderColor: "border-orange-200",
          title: "Não desista!",
          subtitle: "Vamos retomar o ritmo juntos",
          badgeText: "Retome o ritmo",
          badgeColor: "bg-orange-500 text-white",
        };
      default:
        return {
          icon: TrendingUp,
          iconColor: "text-purple-500",
          bgColor: "from-purple-50 to-pink-50",
          borderColor: "border-purple-200",
          title: "Comece seu programa!",
          subtitle: "O plano de 30 dias está te esperando",
          badgeText: "Iniciar",
          badgeColor: "bg-purple-500 text-white",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card
      className={`mb-8 animate-slide-up bg-gradient-to-br ${config.bgColor} ${config.borderColor} cursor-pointer hover:shadow-lg transition-all duration-300`}
      style={{ animationDelay: "100ms" }}
      onClick={() => navigate("/plano")}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
              <Badge className={config.badgeColor}>{config.badgeText}</Badge>
            </div>

            <p className="text-sm text-gray-700 mb-4">{config.subtitle}</p>

            <div className="space-y-3">
              {/* Indicador de semana */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Você está na <strong>semana {adherence.week} de 4</strong> do programa
                </span>
              </div>

              {/* Progresso geral */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progresso Geral</span>
                  <span className="font-semibold text-gray-900">
                    {programProgress.completedLessons} de {programProgress.totalLessons} aulas
                  </span>
                </div>
                <Progress value={programProgress.percentage} className="h-2" />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {programProgress.percentage}% concluído
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdherenceCard;
