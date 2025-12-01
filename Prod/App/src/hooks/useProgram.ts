import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type ProgramModule = Tables<"program_modules">;
export type ModuleLesson = Tables<"module_lessons">;
export type ModuleResource = Tables<"module_resources">;
export type ModuleProgress = Tables<"module_progress">;
export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface ModuleWithLessons extends ProgramModule {
  lessons: ModuleLesson[];
  resources?: ModuleResource[];
}

const isLessonStatus = (status: string | null | undefined): status is LessonStatus => {
  return status === "not_started" || status === "in_progress" || status === "completed";
};

export const useProgram = () => {
  // Fetch all modules with their lessons
  const { data: modules, isLoading: loadingModules } = useQuery({
    queryKey: ["program-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_modules")
        .select(`
          *,
          lessons:module_lessons(*),
          resources:module_resources(*)
        `)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as ModuleWithLessons[];
    },
  });

  // Fetch user progress
  const { data: userProgress, isLoading: loadingProgress } = useQuery({
    queryKey: ["module-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("module_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as ModuleProgress[];
    },
  });

  return {
    modules,
    userProgress,
    isLoading: loadingModules || loadingProgress,
  };
};

export const useModuleProgress = () => {
  const queryClient = useQueryClient();

  const markLessonComplete = useMutation({
    mutationFn: async (lessonId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("module_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: "completed",
          completed_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,lesson_id"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module-progress"] });
      toast.success("Aula marcada como concluída!");
    },
    onError: (error) => {
      console.error("Error marking lesson complete:", error);
      toast.error("Erro ao marcar aula como concluída");
    },
  });

  const markLessonInProgress = useMutation({
    mutationFn: async (lessonId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("module_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: "in_progress",
        }, {
          onConflict: "user_id,lesson_id"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module-progress"] });
    },
    onError: (error) => {
      console.error("Error marking lesson in progress:", error);
    },
  });

  return {
    markLessonComplete,
    markLessonInProgress,
  };
};

// Helper to get lesson status
export const getLessonStatus = (
  lessonId: string,
  progress: ModuleProgress[] | undefined
): LessonStatus => {
  if (!progress) return "not_started";
  const lessonProgress = progress.find((p) => p.lesson_id === lessonId);
  const status = lessonProgress?.status;
  return isLessonStatus(status) ? status : "not_started";
};

// Helper to calculate module completion percentage
export const getModuleCompletion = (
  module: ModuleWithLessons,
  progress: ModuleProgress[] | undefined
): number => {
  if (!module.lessons || module.lessons.length === 0) return 0;

  const completedLessons = module.lessons.filter((lesson) => {
    const status = getLessonStatus(lesson.id, progress);
    return status === "completed";
  });

  return Math.round((completedLessons.length / module.lessons.length) * 100);
};

// Helper to get total program progress
export const getProgramProgress = (
  modules: ModuleWithLessons[] | undefined,
  progress: ModuleProgress[] | undefined
): {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
} => {
  if (!modules || modules.length === 0) {
    return { completedLessons: 0, totalLessons: 0, percentage: 0 };
  }

  const totalLessons = modules.reduce((acc, module) => {
    return acc + (module.lessons?.length || 0);
  }, 0);

  const completedLessons = progress?.filter((p) => p.status === "completed").length || 0;

  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    completedLessons,
    totalLessons,
    percentage,
  };
};
