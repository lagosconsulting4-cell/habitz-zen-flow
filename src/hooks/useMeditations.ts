import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MeditationSession {
  id: string;
  slug: string;
  title: string;
  description: string;
  focus: string | null;
  steps: string[];
  duration_seconds: number;
  duration_label: string;
  ambient_sounds: string[];
  category: string;
  category_label: string;
  premium_only: boolean;
  audio_path: string;
  cover_image_url: string | null;
  sort_order: number;
}

interface SignedUrlCache {
  [path: string]: string;
}

const BUCKET = "meditation-audios";

export const useMeditations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [audioUrls, setAudioUrls] = useState<SignedUrlCache>({});
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);

  const query = useQuery<{ data: MeditationSession[] }, Error, MeditationSession[]>({
    queryKey: ["meditations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meditations")
        .select(
          "id, slug, title, description, focus, steps, duration_seconds, duration_label, ambient_sounds, category, category_label, premium_only, audio_path, cover_image_url, sort_order"
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as MeditationSession[];
    },
    onError: () => {
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as meditações agora.",
        variant: "destructive",
      });
    },
    staleTime: 60_000,
  });

  const sessions = useMemo(() => query.data ?? [], [query.data]);

  const getSignedUrl = useCallback(
    async (session: MeditationSession) => {
      if (!session.audio_path) {
        toast({
          title: "Sem áudio",
          description: "Sessão ainda não possui áudio configurado.",
          variant: "destructive",
        });
        return null;
      }

      if (audioUrls[session.audio_path]) {
        return audioUrls[session.audio_path];
      }

      setLoadingAudioId(session.id);
      try {
        const { data, error } = await supabase
          .storage
          .from(BUCKET)
          .createSignedUrl(session.audio_path, 60 * 60); // 1h

        if (error || !data?.signedUrl) {
          throw error ?? new Error("signed url ausente");
        }

        setAudioUrls((prev) => ({ ...prev, [session.audio_path]: data.signedUrl }));
        return data.signedUrl;
      } catch (error) {
        console.error("Failed to create signed url", error);
        toast({
          title: "Erro ao iniciar áudio",
          description: "Tente novamente em instantes.",
          variant: "destructive",
        });
        return null;
      } finally {
        setLoadingAudioId(null);
      }
    },
    [audioUrls, toast]
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["meditations"] });
  }, [queryClient]);

  return {
    sessions,
    isLoading: query.isLoading,
    isError: query.isError,
    loadingAudioId,
    getSignedUrl,
    refresh,
  };
};

export default useMeditations;
