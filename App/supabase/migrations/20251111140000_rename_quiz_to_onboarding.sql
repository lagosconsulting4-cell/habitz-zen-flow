-- Migration: Renomear sistema de quiz/diagnóstico para onboarding
-- Data: 2025-11-11
-- Objetivo: Transformar o sistema de avaliação TDAH em onboarding simples

-- ==============================================================================
-- 1. RENOMEAR TABELAS
-- ==============================================================================

-- Renomear tabela principal de assessment para onboarding
ALTER TABLE IF EXISTS public.assessment_responses
RENAME TO onboarding_responses;

-- Renomear tabela de análises para legacy (preservar histórico)
ALTER TABLE IF EXISTS public.analysis_summaries
RENAME TO legacy_analysis_summaries;

-- Atualizar comentários das tabelas
COMMENT ON TABLE public.onboarding_responses IS
'Respostas do fluxo de onboarding inicial. Coleta dados demográficos, desafios, sentimentos e preferências. Substituiu o antigo sistema de quiz/diagnóstico TDAH.';

COMMENT ON TABLE public.legacy_analysis_summaries IS
'[LEGACY] Sumários de análise do antigo sistema de diagnóstico TDAH. Mantido apenas para referência histórica. Não é mais utilizado no sistema atual.';

-- ==============================================================================
-- 2. ATUALIZAR ÍNDICES
-- ==============================================================================

-- Verificar se existem índices com nomes antigos e renomeá-los
DO $$
BEGIN
    -- Índice da tabela onboarding_responses (ex assessment_responses)
    IF EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'onboarding_responses'
        AND indexname = 'idx_assessment_responses_user_id'
    ) THEN
        ALTER INDEX idx_assessment_responses_user_id
        RENAME TO idx_onboarding_responses_user_id;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'onboarding_responses'
        AND indexname = 'idx_assessment_responses_session_id'
    ) THEN
        ALTER INDEX idx_assessment_responses_session_id
        RENAME TO idx_onboarding_responses_session_id;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'onboarding_responses'
        AND indexname = 'idx_assessment_responses_completed_at'
    ) THEN
        ALTER INDEX idx_assessment_responses_completed_at
        RENAME TO idx_onboarding_responses_completed_at;
    END IF;
END $$;

-- ==============================================================================
-- 3. ATUALIZAR VIEW user_progress_status
-- ==============================================================================

-- Dropar view antiga
DROP VIEW IF EXISTS public.user_progress_status;

-- Recriar view com nova estrutura
CREATE OR REPLACE VIEW public.user_progress_status AS
SELECT
  p.user_id,
  p.display_name,
  p.has_completed_onboarding,
  p.onboarding_goals,
  p.onboarding_completed_at,
  COUNT(DISTINCT onb.id) as completed_onboardings,
  MAX(onb.completed_at) as last_onboarding_at,
  CASE
    WHEN p.has_completed_onboarding THEN 'completed'
    ELSE 'needs_onboarding'
  END as status
FROM profiles p
LEFT JOIN onboarding_responses onb ON onb.user_id = p.user_id
GROUP BY
  p.user_id,
  p.display_name,
  p.has_completed_onboarding,
  p.onboarding_goals,
  p.onboarding_completed_at;

COMMENT ON VIEW public.user_progress_status IS
'View que mostra o status de progresso do onboarding de cada usuário.';

-- ==============================================================================
-- 4. MIGRAR USUÁRIOS EXISTENTES
-- ==============================================================================

-- Marcar como "has_completed_onboarding" todos os usuários que já completaram
-- o quiz antigo (assessment_responses)
UPDATE public.profiles
SET
  has_completed_onboarding = true,
  onboarding_completed_at = COALESCE(onboarding_completed_at, (
    SELECT MIN(completed_at)
    FROM public.onboarding_responses
    WHERE user_id = profiles.user_id
  ))
WHERE user_id IN (
  SELECT DISTINCT user_id
  FROM public.onboarding_responses
  WHERE user_id IS NOT NULL
  AND completed_at IS NOT NULL
)
AND has_completed_onboarding = false;

-- ==============================================================================
-- 5. ATUALIZAR POLICIES (RLS)
-- ==============================================================================

-- Verificar e atualizar policies da tabela onboarding_responses
DO $$
BEGIN
    -- Dropar policies antigas se existirem (com nome antigo)
    DROP POLICY IF EXISTS "Users can view their own assessments" ON public.onboarding_responses;
    DROP POLICY IF EXISTS "Users can insert their own assessments" ON public.onboarding_responses;
    DROP POLICY IF EXISTS "Allow anonymous assessment creation" ON public.onboarding_responses;

    -- Recriar policies com novos nomes (simplificado - apenas usuários autenticados)
    CREATE POLICY "Users can view their own onboarding responses"
    ON public.onboarding_responses
    FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own onboarding responses"
    ON public.onboarding_responses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
END $$;

-- ==============================================================================
-- 6. GRANTS E PERMISSÕES
-- ==============================================================================

-- Garantir que authenticated users possam acessar as tabelas
GRANT SELECT, INSERT ON public.onboarding_responses TO authenticated;
GRANT SELECT ON public.legacy_analysis_summaries TO authenticated;
GRANT SELECT ON public.user_progress_status TO authenticated;

-- Service role tem acesso total
GRANT ALL ON public.onboarding_responses TO service_role;
GRANT ALL ON public.legacy_analysis_summaries TO service_role;

-- ==============================================================================
-- 7. VALIDAÇÕES
-- ==============================================================================

-- Verificar que as tabelas foram renomeadas corretamente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'onboarding_responses') THEN
        RAISE EXCEPTION 'Erro: Tabela onboarding_responses não existe após migration';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'legacy_analysis_summaries') THEN
        RAISE NOTICE 'Aviso: Tabela legacy_analysis_summaries não existe (pode não ter sido criada antes)';
    END IF;

    RAISE NOTICE 'Migration concluída com sucesso!';
END $$;
