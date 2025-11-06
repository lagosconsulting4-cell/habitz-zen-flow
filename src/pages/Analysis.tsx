import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAppMetrics } from "@/hooks/useAppMetrics";
import { generateDiagnosisResult, QuizAnswers } from "@/lib/quizAnalysis";
import { Download, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Analysis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { track } = useAppMetrics();
  const assessmentId = searchParams.get("assessment_id");

  const [loading, setLoading] = useState(true);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const loadAnalysis = async () => {
      if (!assessmentId) {
        toast.error("ID de avaliação não encontrado");
        navigate("/quiz");
        return;
      }

      try {
        // Fetch assessment response
        const { data: assessment, error } = await supabase
          .from("assessment_responses")
          .select("*")
          .eq("id", assessmentId)
          .single();

        if (error) throw error;

        if (!assessment) {
          toast.error("Avaliação não encontrada");
          navigate("/quiz");
          return;
        }

        // Generate diagnosis
        const result = generateDiagnosisResult(assessment.answers as QuizAnswers);
        setDiagnosisResult(result);

        // Track analysis generated
        track("analysis_generated", {
          assessment_id: assessmentId,
          diagnosis_type: result.type,
          probability_score: result.probabilityScore
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading analysis:", error);
        toast.error("Erro ao carregar análise");
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [assessmentId, navigate, track]);

  const generateAndDownloadPDF = async () => {
    if (!diagnosisResult || !assessmentId) return;

    setIsGeneratingPDF(true);

    try {
      // Get the analysis card element
      const element = document.getElementById("analysis-content");
      if (!element) throw new Error("Element not found");

      // Generate canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Download PDF
      pdf.save(`analise-habitz-${assessmentId}.pdf`);

      // Save to Supabase (would need storage bucket configured)
      // For now, we'll just save the record that PDF was generated
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("analysis_summaries").insert({
        assessment_id: assessmentId,
        user_id: user?.id || null,
        diagnosis_type: diagnosisResult.type,
        probability_score: diagnosisResult.probabilityScore,
        summary_pdf_url: null // Would be storage URL in production
      });

      track("analysis_pdf_downloaded", {
        assessment_id: assessmentId,
        diagnosis_type: diagnosisResult.type
      });

      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGetPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // User is logged in, save suggested habits to localStorage for later import
      if (diagnosisResult) {
        localStorage.setItem("habitz:suggested-habits", JSON.stringify({
          habits: diagnosisResult.suggestedHabits,
          rewardStrategy: diagnosisResult.rewardStrategy,
          diagnosisType: diagnosisResult.type,
          timestamp: new Date().toISOString()
        }));
      }

      // Check if user has a profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Redirect to the personal plan page
      if (profile) {
        navigate("/plano");
      } else {
        navigate("/pricing");
      }
    } else {
      // User not logged in, save suggested habits and redirect to auth
      if (diagnosisResult) {
        localStorage.setItem("habitz:suggested-habits", JSON.stringify({
          habits: diagnosisResult.suggestedHabits,
          rewardStrategy: diagnosisResult.rewardStrategy,
          diagnosisType: diagnosisResult.type,
          timestamp: new Date().toISOString()
        }));
      }
      navigate("/auth", { state: { from: `/analise?assessment_id=${assessmentId}` } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Gerando sua análise personalizada...</p>
        </div>
      </div>
    );
  }

  if (!diagnosisResult) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Análise Completa</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Sua Análise Personalizada
          </h1>
          <p className="text-gray-600">
            Baseada em suas respostas, preparamos esta análise inicial
          </p>
        </div>

        {/* Main Analysis Content */}
        <div id="analysis-content" className="space-y-6">
          {/* Diagnosis Card */}
          <Card className="p-6 md:p-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <div className="text-center">
              <Badge className="bg-white text-purple-700 mb-4 text-lg px-4 py-1">
                {diagnosisResult.title}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Seu Perfil TDAH
              </h2>
              <p className="text-purple-50 text-lg max-w-2xl mx-auto">
                {diagnosisResult.description}
              </p>
            </div>
          </Card>

          {/* Probability Score */}
          <Card className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Probabilidade de Melhora em 30 Dias
              </h3>
              <div className="relative inline-block">
                <div className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  {diagnosisResult.probabilityScore}%
                </div>
              </div>
            </div>

            <Progress
              value={diagnosisResult.probabilityScore}
              className="h-3 mb-4"
            />

            <p className="text-center text-gray-600 text-sm">
              Com dedicação ao programa personalizado, essa é sua chance de transformação
            </p>
          </Card>

          {/* Primary Symptoms */}
          <Card className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
              Sintomas Identificados
            </h3>
            <div className="grid gap-3">
              {diagnosisResult.primarySymptoms.map((symptom: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{symptom}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Suggested Habits */}
          <Card className="p-6 md:p-8 bg-gradient-to-br from-orange-50 to-pink-50">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Mini-Hábitos Sugeridos para Você
            </h3>
            <p className="text-gray-600 mb-4">
              Comece pequeno. Estes hábitos são especialmente adequados para o seu perfil:
            </p>
            <div className="space-y-3">
              {diagnosisResult.suggestedHabits.map((habit: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-gray-800 font-medium">{habit}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Reward Strategy */}
          <Card className="p-6 md:p-8 bg-gradient-to-br from-yellow-50 to-orange-50">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Estratégia de Recompensa Personalizada
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {diagnosisResult.rewardStrategy}
            </p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <Button
            onClick={handleGetPlan}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
          >
            Quero meu Plano Personalizado Completo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            onClick={generateAndDownloadPDF}
            variant="outline"
            size="lg"
            className="w-full"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Baixar Resumo em PDF
              </>
            )}
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>Aviso importante:</strong> Esta análise é baseada em um questionário de autoavaliação e não substitui um diagnóstico médico profissional.
            Para um diagnóstico formal de TDAH, consulte um médico especialista.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
