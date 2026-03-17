import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';

export interface QuizData {
  name: string | null;
  email: string;
  phone: string | null;
  objective: string | null;
  challenges: string[];
  energy_peak: string | null;
  time_available: string | null;
  profession: string | null;
  age_range: string | null;
  gender: string | null;
  years_promising: string | null;
  consistency_feeling: string | null;
  projected_feeling: string | null;
}

export interface UseQuizDataResult {
  quizData: QuizData | null;
  isLoading: boolean;
  hasQuizData: boolean;
  quizResponseId: string | null;
}

export function useQuizData(): UseQuizDataResult {
  const { user } = useAuth();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizResponseId, setQuizResponseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    async function fetchQuizData() {
      try {
        // Busca pelo email (case-insensitive) e pega o mais recente
        const { data, error } = await supabase
          .from('quiz_responses')
          .select('*')
          .ilike('email', user!.email!)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!data) {
          setQuizData(null);
          return;
        }

        setQuizResponseId(data.id);
        setQuizData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          objective: data.objective,
          challenges: (data.challenges as string[]) || [],
          energy_peak: data.energy_peak,
          time_available: data.time_available,
          profession: data.profession,
          age_range: data.age_range,
          gender: data.gender,
          years_promising: data.years_promising,
          consistency_feeling: data.consistency_feeling,
          projected_feeling: data.projected_feeling,
        });

        // Vincular quiz_response ao user_id se ainda não estiver vinculado
        if (!data.user_id) {
          await supabase
            .from('quiz_responses')
            .update({ user_id: user!.id, linked_at: new Date().toISOString() } as never)
            .eq('id', data.id);
        }
      } catch (err) {
        console.error('Failed to fetch quiz data:', err);
        setQuizData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuizData();
  }, [user?.email]);

  return {
    quizData,
    isLoading,
    hasQuizData: quizData !== null,
    quizResponseId,
  };
}
