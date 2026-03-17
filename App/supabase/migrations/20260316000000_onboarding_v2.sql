-- ============================================================================
-- Onboarding V2 — Schema Changes
-- Adds fields to profiles, quiz_responses, habits
-- Creates journey_recommendation_scores table
-- ============================================================================

-- Adicionar campos na tabela profiles para dados do novo onboarding
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_version text DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS quiz_linked_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_v2_data jsonb DEFAULT '{}'::jsonb;

-- Adicionar campos no quiz_responses para rastrear vínculo com usuário
ALTER TABLE public.quiz_responses
  ADD COLUMN IF NOT EXISTS linked_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Índice para lookup por email no onboarding
CREATE INDEX IF NOT EXISTS quiz_responses_email_lower_idx
  ON public.quiz_responses (lower(email));

-- RLS: permitir que usuários autenticados vinculem seu próprio quiz_response por email
CREATE POLICY "Users can link own quiz response"
  ON public.quiz_responses FOR UPDATE
  TO authenticated
  USING (lower(email) = lower(auth.jwt()->>'email'))
  WITH CHECK (lower(email) = lower(auth.jwt()->>'email'));

-- Tabela de scores de jornadas (para uso futuro e dashboard)
CREATE TABLE IF NOT EXISTS public.journey_recommendation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  dominant_signal text,
  calculated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, journey_id)
);

ALTER TABLE public.journey_recommendation_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own journey scores"
  ON public.journey_recommendation_scores FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journey scores"
  ON public.journey_recommendation_scores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Tabela de hábitos v2 com suporte a variantes semanais
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS habit_type text DEFAULT 'anchor',
  ADD COLUMN IF NOT EXISTS week_variation jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_version text DEFAULT 'v1';

COMMENT ON COLUMN public.habits.habit_type IS 'Tipo do hábito conforme Doc 2: anchor, directed, rhythm, support, complement';
COMMENT ON COLUMN public.habits.week_variation IS 'Variação de horário/duração entre dias úteis e fim de semana';
