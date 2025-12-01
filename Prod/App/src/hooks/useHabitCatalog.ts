import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type HabitCategory = Tables<"habit_categories">;
export type HabitTemplate = Tables<"habit_templates">;

interface UseHabitCatalogResult {
  categories: HabitCategory[];
  templates: HabitTemplate[];
  isLoading: boolean;
  error: unknown;
}

/**
 * Busca catálogo de hábitos (categorias e templates) no Supabase.
 * Mantém interface simples para uso em telas de criação/edição.
 */
export const useHabitCatalog = (): UseHabitCatalogResult => {
  const categoriesQuery = useQuery({
    queryKey: ["habit-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as HabitCategory[];
    },
    staleTime: 60_000,
  });

  const templatesQuery = useQuery({
    queryKey: ["habit-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_templates")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as HabitTemplate[];
    },
    staleTime: 60_000,
  });

  return {
    categories: categoriesQuery.data ?? [],
    templates: templatesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading || templatesQuery.isLoading,
    error: categoriesQuery.error ?? templatesQuery.error,
  };
};

export default useHabitCatalog;
