-- =====================================================
-- Migration: Add Onboarding and Quiz Tracking
-- =====================================================
-- Adiciona campos para tracking de onboarding e quiz
-- =====================================================

-- Adicionar campos de onboarding à tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_goals JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Adicionar campos de quiz tracking à tabela assessment_responses
ALTER TABLE public.assessment_responses
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.has_completed_onboarding IS
'Indica se o usuário completou o onboarding inicial (escolha de áreas de foco)';

COMMENT ON COLUMN public.profiles.onboarding_goals IS
'Array JSON com as áreas de foco escolhidas no onboarding (ex: ["productivity", "mindset", "fitness"])';

COMMENT ON COLUMN public.profiles.onboarding_completed_at IS
'Timestamp de quando o onboarding foi completado';

COMMENT ON COLUMN public.assessment_responses.completed_at IS
'Timestamp de quando o quiz foi completado (todas as etapas finalizadas)';

-- =====================================================
-- Função auxiliar: Marcar onboarding como completo
-- =====================================================
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  p_user_id UUID,
  p_goals JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET
    has_completed_onboarding = true,
    onboarding_goals = p_goals,
    onboarding_completed_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION public.complete_onboarding IS
'Marca o onboarding como completo e salva as áreas de foco escolhidas pelo usuário';

-- =====================================================
-- View: Status do usuário (onboarding + quiz)
-- =====================================================
CREATE OR REPLACE VIEW public.user_progress_status AS
SELECT
  p.user_id,
  p.display_name,
  p.has_completed_onboarding,
  p.onboarding_goals,
  p.onboarding_completed_at,
  COUNT(DISTINCT ar.id) FILTER (WHERE ar.completed_at IS NOT NULL) as completed_quizzes,
  MAX(ar.completed_at) as last_quiz_completed_at,
  CASE
    WHEN p.has_completed_onboarding = false THEN 'needs_onboarding'
    WHEN COUNT(DISTINCT ar.id) FILTER (WHERE ar.completed_at IS NOT NULL) = 0 THEN 'needs_quiz'
    ELSE 'completed'
  END as status
FROM public.profiles p
LEFT JOIN public.assessment_responses ar ON ar.user_id = p.user_id
GROUP BY p.user_id, p.display_name, p.has_completed_onboarding, p.onboarding_goals, p.onboarding_completed_at;

-- RLS para a view
ALTER VIEW public.user_progress_status SET (security_invoker = on);

COMMENT ON VIEW public.user_progress_status IS
'View que mostra o status de progresso do usuário (onboarding e quiz)';

-- =====================================================
-- Queries úteis (Exemplos)
-- =====================================================

-- Ver usuários que ainda não completaram onboarding
-- SELECT * FROM user_progress_status WHERE status = 'needs_onboarding';

-- Ver usuários que completaram onboarding mas não fizeram quiz
-- SELECT * FROM user_progress_status WHERE status = 'needs_quiz';

-- Buscar áreas de foco de um usuário específico
-- SELECT onboarding_goals FROM profiles WHERE user_id = auth.uid();

-- Contar quantos quizzes um usuário completou
-- SELECT COUNT(*) FROM assessment_responses
-- WHERE user_id = auth.uid() AND completed_at IS NOT NULL;
