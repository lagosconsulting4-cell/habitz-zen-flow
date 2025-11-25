import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import NavigationBar from "@/components/NavigationBar";
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
import { useNavigate } from "react-router-dom";
import { isBonusEnabled } from "@/config/bonusFlags";

const PersonalPlan = () => {
  const navigate = useNavigate();
  const { modules, userProgress, isLoading } = useProgram();
  const { markLessonComplete, markLessonInProgress } = useModuleProgress();
  const [selectedLesson, setSelectedLesson] = useState<ModuleLesson | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleWithLessons | null>(null);

  const programProgress = getProgramProgress(modules, userProgress);

  useEffect(() => {
    if (!isBonusEnabled("plano")) {
      navigate("/bonus", { replace: true });
    }
  }, [navigate]);

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
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400 mx-auto mb-4" />
          <p className="text-white/60">Carregando seu plano personalizado...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] pb-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container max-w-4xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-white">
                Seu Programa de 30 Dias
              </h1>
              <p className="text-white/60 mt-2">
                Plano personalizado para transformar sua rotina com TDAH
              </p>
            </div>
            <Badge className="bg-lime-400 text-black border-0 text-base px-4 py-2 font-semibold">
              <Award className="w-5 h-5 mr-2" />
              {programProgress.percentage}% concluído
            </Badge>
          </div>

          {/* Progress Bar */}
          <Card className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Progresso geral</span>
                <span className="text-white font-semibold">{programProgress.completedLessons} de {programProgress.totalLessons} aulas</span>
              </div>
              <Progress value={programProgress.percentage} className="h-3 bg-white/10" />
            </div>
          </Card>
        </div>

      {/* Timeline by Weeks */}
      <Tabs defaultValue="week1" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="week1" className="data-[state=active]:bg-lime-400 data-[state=active]:text-black font-semibold">Semana 1</TabsTrigger>
          <TabsTrigger value="week2" className="data-[state=active]:bg-lime-400 data-[state=active]:text-black font-semibold">Semana 2</TabsTrigger>
          <TabsTrigger value="week3" className="data-[state=active]:bg-lime-400 data-[state=active]:text-black font-semibold">Semana 3</TabsTrigger>
          <TabsTrigger value="week4" className="data-[state=active]:bg-lime-400 data-[state=active]:text-black font-semibold">Semana 4</TabsTrigger>
        </TabsList>

        {[1, 2, 3, 4].map((week) => (
          <TabsContent key={week} value={`week${week}`} className="space-y-6 mt-6">
            <Card className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-xl font-bold uppercase tracking-wide text-white mb-2">Semana {week}</h2>
              <p className="text-white/60">
                {week === 1 && "Fundamentos e motivação para começar sua jornada"}
                {week === 2 && "Expandindo sua zona de conforto e enfrentando desafios"}
                {week === 3 && "Definindo e consolidando seus mini-hábitos"}
                {week === 4 && "Superando procrastinação e mantendo consistência"}
              </p>
            </Card>

            {/* Modules for this week */}
            <div className="grid gap-6">
              {getWeekModules(week).map((module) => {
                const completion = getModuleCompletion(module, userProgress);

                return (
                  <Card key={module.id} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="bg-lime-400 p-6 text-black">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-black text-lime-400 border-0 font-semibold">
                              {module.title}
                            </Badge>
                            {module.is_bonus && (
                              <Badge className="bg-black text-lime-400 border-0 font-semibold">
                                BÔNUS
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold uppercase tracking-wide">{module.subtitle}</h3>
                          <p className="text-black/80 mt-2">{module.description}</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">{completion}%</div>
                          <div className="text-[10px] font-semibold uppercase tracking-widest text-black/60">concluído</div>
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
                              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                isCompleted
                                  ? "bg-lime-400/10 border-lime-400/30"
                                  : isInProgress
                                  ? "bg-white/10 border-white/20"
                                  : "bg-white/5 border-white/10 hover:border-lime-400/50 hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isCompleted
                                      ? "bg-lime-400 text-black"
                                      : isInProgress
                                      ? "bg-white/20 text-white"
                                      : "bg-white/10 text-white/60"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                  ) : (
                                    getLessonIcon(lesson.lesson_type)
                                  )}
                                </div>

                                <div className="flex-1">
                                  <h4 className="font-semibold text-white">
                                    Aula {lesson.lesson_number}: {lesson.title}
                                  </h4>
                                  <div className="flex items-center gap-4 mt-1 text-xs">
                                    <span className="flex items-center gap-1 text-white/60">
                                      {getLessonIcon(lesson.lesson_type)}
                                      {lesson.lesson_type === "video" && "Vídeo"}
                                      {lesson.lesson_type === "audio" && "Áudio"}
                                      {lesson.lesson_type === "text" && "Texto"}
                                      {lesson.lesson_type === "ebook" && "E-book"}
                                    </span>
                                    {lesson.duration_minutes && (
                                      <span className="flex items-center gap-1 text-white/60">
                                        <Clock className="w-3 h-3" />
                                        {lesson.duration_minutes} min
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLessonClick(lesson, module);
                                }}
                                className={`font-semibold ${
                                  isCompleted
                                    ? "bg-white/10 border border-white/20 hover:bg-white/20 text-white"
                                    : "bg-lime-400 text-black hover:bg-lime-500"
                                }`}
                              >
                                {isCompleted ? "Revisar" : isInProgress ? "Continuar" : "Iniciar"}
                              </Button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-white/40 text-center py-4">Nenhuma aula disponível</p>
                      )}

                      {/* Resources */}
                      {module.resources && module.resources.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <Download className="w-4 h-4 text-lime-400" />
                            Recursos Extras
                          </h4>
                          <div className="grid gap-3">
                            {module.resources.map((resource) => (
                              <div
                                key={resource.id}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <BookOpen className="w-5 h-5 text-lime-400" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-white">{resource.title}</p>
                                    <p className="text-xs text-white/60">{resource.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {resource.is_bonus && (
                                    <Badge className="bg-lime-400 text-black border-0 font-semibold">
                                      BÔNUS
                                    </Badge>
                                  )}
                                  <Button
                                    size="sm"
                                    onClick={() => handleDownloadResource(resource)}
                                    className="bg-lime-400 text-black hover:bg-lime-500 font-semibold"
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
          <h2 className="text-xl font-bold uppercase tracking-wide text-white mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-lime-400" />
            Conteúdo Bônus
          </h2>

          <div className="grid gap-6">
            {modules
              .filter((m) => m.is_bonus)
              .map((module) => {
                const completion = getModuleCompletion(module, userProgress);

                return (
                  <Card key={module.id} className="rounded-2xl bg-white/5 border-2 border-lime-400/50 overflow-hidden">
                    <div className="bg-lime-400 p-6 text-black">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge className="bg-black text-lime-400 border-0 font-semibold mb-2">
                            {module.title} - BÔNUS
                          </Badge>
                          <h3 className="text-xl font-bold uppercase tracking-wide">{module.subtitle}</h3>
                          <p className="text-black/80 mt-2">{module.description}</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">{completion}%</div>
                          <div className="text-[10px] font-semibold uppercase tracking-widest text-black/60">concluído</div>
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
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                  isCompleted
                                    ? "bg-lime-400/10 border-lime-400/30"
                                    : "bg-white/5 border-white/10 hover:border-lime-400/50 hover:bg-white/10"
                                }`}
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      isCompleted ? "bg-lime-400 text-black" : "bg-white/10 text-white/60"
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                      getLessonIcon(lesson.lesson_type)
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    <h4 className="font-semibold text-white">{lesson.title}</h4>
                                    <div className="flex items-center gap-4 mt-1 text-xs">
                                      <span className="flex items-center gap-1 text-white/60">
                                        {getLessonIcon(lesson.lesson_type)}
                                        {lesson.lesson_type}
                                      </span>
                                      {lesson.duration_minutes && (
                                        <span className="flex items-center gap-1 text-white/60">
                                          <Clock className="w-3 h-3" />
                                          {lesson.duration_minutes} min
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLessonClick(lesson, module);
                                  }}
                                  className={`font-semibold ${
                                    isCompleted
                                      ? "bg-white/10 border border-white/20 hover:bg-white/20 text-white"
                                      : "bg-lime-400 text-black hover:bg-lime-500"
                                  }`}
                                >
                                  {isCompleted ? "Revisar" : "Iniciar"}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}

                      {module.resources && module.resources.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                          {module.resources.map((resource) => (
                            <div
                              key={resource.id}
                              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <BookOpen className="w-5 h-5 text-lime-400" />
                                <div className="flex-1">
                                  <p className="font-semibold text-white">{resource.title}</p>
                                  <p className="text-xs text-white/60">{resource.description}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleDownloadResource(resource)}
                                className="bg-lime-400 text-black hover:bg-lime-500 font-semibold"
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#000000] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-wide text-white">
              {selectedModule?.subtitle} - {selectedLesson?.title}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {selectedLesson?.lesson_type === "video" && "Vídeo"}
              {selectedLesson?.lesson_type === "audio" && "Áudio"}
              {selectedLesson?.lesson_type === "text" && "Conteúdo de texto"}
              {selectedLesson?.duration_minutes && ` - ${selectedLesson.duration_minutes} minutos`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Lesson Content */}
            {selectedLesson?.transcript ? (
              <div className="prose prose-invert max-w-none">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="whitespace-pre-wrap text-white/90 leading-relaxed">
                    {selectedLesson.transcript}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-8 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-lime-400" />
                  <p className="text-lg font-semibold text-white">Conteúdo em breve</p>
                  <p className="text-sm text-white/60">Esta aula ainda não possui conteúdo disponível</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleMarkComplete}
                className="flex-1 bg-lime-400 text-black hover:bg-lime-500 font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marcar como Concluída
              </Button>
              <Button
                onClick={() => {
                  setSelectedLesson(null);
                  setSelectedModule(null);
                }}
                className="bg-white/10 border border-white/20 hover:bg-white/20 text-white"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </motion.div>

      <NavigationBar />
    </div>
  );
};

export default PersonalPlan;
