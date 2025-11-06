import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useProgram,
  useModuleProgress,
  getLessonStatus,
  getModuleCompletion,
  getProgramProgress,
  ModuleWithLessons,
  ModuleLesson,
  ModuleResource
} from "@/hooks/useProgram";
import { downloadFile } from "@/lib/storage";
import {
  CheckCircle2,
  PlayCircle,
  Clock,
  BookOpen,
  Headphones,
  FileText,
  Download,
  Award,
  TrendingUp
} from "lucide-react";

const PersonalPlan = () => {
  const { modules, userProgress, isLoading } = useProgram();
  const { markLessonComplete, markLessonInProgress } = useModuleProgress();
  const [selectedLesson, setSelectedLesson] = useState<ModuleLesson | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleWithLessons | null>(null);

  const programProgress = getProgramProgress(modules, userProgress);

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="w-4 h-4" />;
      case "audio":
        return <Headphones className="w-4 h-4" />;
      case "text":
        return <FileText className="w-4 h-4" />;
      case "ebook":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getWeekModules = (week: number) => {
    if (!modules) return [];
    return modules.filter((m) => m.week_assignment === week);
  };

  const handleLessonClick = (lesson: ModuleLesson, module: ModuleWithLessons) => {
    setSelectedLesson(lesson);
    setSelectedModule(module);
    markLessonInProgress.mutate(lesson.id);
  };

  const handleMarkComplete = () => {
    if (selectedLesson) {
      markLessonComplete.mutate(selectedLesson.id);
      setSelectedLesson(null);
      setSelectedModule(null);
    }
  };

  const handleDownloadResource = async (resource: ModuleResource) => {
    if (!resource.file_url) {
      toast.error("Link de download não disponível");
      return;
    }

    toast.loading("Preparando download...");

    try {
      // Se o file_url contém um caminho no storage, usa o downloadFile
      // Caso contrário, abre o link diretamente
      if (resource.file_url.startsWith("bonus-ebooks/")) {
        const success = await downloadFile(
          "bonus-ebooks",
          resource.file_url.replace("bonus-ebooks/", ""),
          resource.title + ".pdf"
        );

        if (success) {
          toast.success("Download iniciado!");
        } else {
          toast.error("Erro ao baixar arquivo");
        }
      } else {
        // Link externo, abre em nova aba
        window.open(resource.file_url, "_blank");
        toast.success("Abrindo recurso...");
      }
    } catch (error) {
      console.error("Erro ao baixar:", error);
      toast.error("Erro ao baixar arquivo");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu plano personalizado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Seu Programa de 30 Dias
            </h1>
            <p className="text-gray-600 mt-2">
              Plano personalizado para transformar sua rotina com TDAH
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Award className="w-5 h-5 mr-2" />
            {programProgress.percentage}% concluído
          </Badge>
        </div>

        {/* Progress Bar */}
        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progresso geral</span>
              <span>{programProgress.completedLessons} de {programProgress.totalLessons} aulas</span>
            </div>
            <Progress value={programProgress.percentage} className="h-3" />
          </div>
        </Card>
      </div>

      {/* Timeline by Weeks */}
      <Tabs defaultValue="week1" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="week1">Semana 1</TabsTrigger>
          <TabsTrigger value="week2">Semana 2</TabsTrigger>
          <TabsTrigger value="week3">Semana 3</TabsTrigger>
          <TabsTrigger value="week4">Semana 4</TabsTrigger>
        </TabsList>

        {[1, 2, 3, 4].map((week) => (
          <TabsContent key={week} value={`week${week}`} className="space-y-6 mt-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Semana {week}</h2>
              <p className="text-gray-600">
                {week === 1 && "Fundamentos e motivação para começar sua jornada"}
                {week === 2 && "Expandindo sua zona de conforto e enfrentando desafios"}
                {week === 3 && "Definindo e consolidando seus mini-hábitos"}
                {week === 4 && "Superando procrastinação e mantendo consistência"}
              </p>
            </div>

            {/* Modules for this week */}
            <div className="grid gap-6">
              {getWeekModules(week).map((module) => {
                const completion = getModuleCompletion(module, userProgress);

                return (
                  <Card key={module.id} className="overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-white text-purple-700">
                              {module.title}
                            </Badge>
                            {module.is_bonus && (
                              <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">
                                BÔNUS
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-2xl font-bold">{module.subtitle}</h3>
                          <p className="text-purple-100 mt-2">{module.description}</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">{completion}%</div>
                          <div className="text-sm text-purple-100">concluído</div>
                        </div>
                      </div>
                    </div>

                    {/* Lessons */}
                    <div className="p-6 space-y-3">
                      {module.lessons && module.lessons.length > 0 ? (
                        module.lessons.map((lesson) => {
                          const status = getLessonStatus(lesson.id, userProgress);
                          const isCompleted = status === "completed";
                          const isInProgress = status === "in_progress";

                          return (
                            <div
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson, module)}
                              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                isCompleted
                                  ? "bg-green-50 border-green-200"
                                  : isInProgress
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isCompleted
                                      ? "bg-green-500 text-white"
                                      : isInProgress
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                  ) : (
                                    getLessonIcon(lesson.lesson_type)
                                  )}
                                </div>

                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">
                                    Aula {lesson.lesson_number}: {lesson.title}
                                  </h4>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      {getLessonIcon(lesson.lesson_type)}
                                      {lesson.lesson_type === "video" && "Vídeo"}
                                      {lesson.lesson_type === "audio" && "Áudio"}
                                      {lesson.lesson_type === "text" && "Texto"}
                                      {lesson.lesson_type === "ebook" && "E-book"}
                                    </span>
                                    {lesson.duration_minutes && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {lesson.duration_minutes} min
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <Button
                                variant={isCompleted ? "outline" : "default"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLessonClick(lesson, module);
                                }}
                              >
                                {isCompleted ? "Revisar" : isInProgress ? "Continuar" : "Iniciar"}
                              </Button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-500 text-center py-4">Nenhuma aula disponível</p>
                      )}

                      {/* Resources */}
                      {module.resources && module.resources.length > 0 && (
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Recursos Extras
                          </h4>
                          <div className="grid gap-3">
                            {module.resources.map((resource) => (
                              <div
                                key={resource.id}
                                className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <BookOpen className="w-5 h-5 text-orange-600" />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{resource.title}</p>
                                    <p className="text-sm text-gray-600">{resource.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {resource.is_bonus && (
                                    <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">
                                      BÔNUS
                                    </Badge>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadResource(resource)}
                                    className="bg-white hover:bg-orange-100"
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Baixar
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Bonus Modules */}
      {modules && modules.some((m) => m.is_bonus) && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            Conteúdo Bônus
          </h2>

          <div className="grid gap-6">
            {modules
              .filter((m) => m.is_bonus)
              .map((module) => {
                const completion = getModuleCompletion(module, userProgress);

                return (
                  <Card key={module.id} className="overflow-hidden border-2 border-yellow-300">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 text-gray-900">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge variant="secondary" className="bg-white text-yellow-700 mb-2">
                            {module.title} - BÔNUS
                          </Badge>
                          <h3 className="text-2xl font-bold">{module.subtitle}</h3>
                          <p className="text-gray-800 mt-2">{module.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Similar lesson rendering as above */}
                      {module.lessons && module.lessons.length > 0 ? (
                        <div className="space-y-3">
                          {module.lessons.map((lesson) => {
                            const status = getLessonStatus(lesson.id, userProgress);
                            const isCompleted = status === "completed";

                            return (
                              <div
                                key={lesson.id}
                                onClick={() => handleLessonClick(lesson, module)}
                                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                  isCompleted
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-gray-200 hover:border-yellow-300 hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      isCompleted ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                      getLessonIcon(lesson.lesson_type)
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        {getLessonIcon(lesson.lesson_type)}
                                        {lesson.lesson_type}
                                      </span>
                                      {lesson.duration_minutes && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {lesson.duration_minutes} min
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  variant={isCompleted ? "outline" : "default"}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLessonClick(lesson, module);
                                  }}
                                >
                                  {isCompleted ? "Revisar" : "Iniciar"}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}

                      {module.resources && module.resources.length > 0 && (
                        <div className="mt-6 space-y-3">
                          {module.resources.map((resource) => (
                            <div
                              key={resource.id}
                              className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <BookOpen className="w-5 h-5 text-orange-600" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{resource.title}</p>
                                  <p className="text-sm text-gray-600">{resource.description}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadResource(resource)}
                                className="bg-white hover:bg-orange-100"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Baixar
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Lesson Dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={() => {
        setSelectedLesson(null);
        setSelectedModule(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedModule?.subtitle} - {selectedLesson?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedLesson?.lesson_type === "video" && "Vídeo"}
              {selectedLesson?.lesson_type === "audio" && "Áudio"}
              {selectedLesson?.lesson_type === "text" && "Conteúdo de texto"}
              {selectedLesson?.duration_minutes && ` - ${selectedLesson.duration_minutes} minutos`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Lesson Content */}
            {selectedLesson?.transcript ? (
              <div className="prose prose-purple max-w-none">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {selectedLesson.transcript}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                  <p className="text-lg font-semibold">Conteúdo em breve</p>
                  <p className="text-sm">Esta aula ainda não possui conteúdo disponível</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleMarkComplete}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marcar como Concluída
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLesson(null);
                  setSelectedModule(null);
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalPlan;
