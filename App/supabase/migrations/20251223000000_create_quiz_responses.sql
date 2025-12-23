-- Migration: Create quiz_responses table for landing page quiz data
-- Created: 2025-12-23

-- Create quiz_responses table
CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados pessoais
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,

  -- Demografia
  age_range text,
  profession text,
  work_schedule text,
  gender text,
  financial_range text,

  -- Preferências
  energy_peak text,
  time_available text,
  objective text,
  challenges jsonb DEFAULT '[]'::jsonb,

  -- Emocional/Psicológico
  consistency_feeling text,
  projected_feeling text,
  years_promising text,

  -- Configuração de Rotina
  week_days jsonb DEFAULT '[]'::jsonb,
  week_days_preset text,
  recommended_habits jsonb DEFAULT '[]'::jsonb,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Status de conversão
  completed boolean DEFAULT true,
  converted_to_customer boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Analytics
  source text DEFAULT 'landing_quiz',
  utm_source text,
  utm_medium text,
  utm_campaign text
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS quiz_responses_email_idx ON public.quiz_responses (email);
CREATE INDEX IF NOT EXISTS quiz_responses_created_at_idx ON public.quiz_responses (created_at DESC);
CREATE INDEX IF NOT EXISTS quiz_responses_converted_idx ON public.quiz_responses (converted_to_customer);
CREATE INDEX IF NOT EXISTS quiz_responses_user_id_idx ON public.quiz_responses (user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow public insert (landing page can submit)
CREATE POLICY "Allow public insert quiz responses"
  ON public.quiz_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy: Allow authenticated users to read their own data
CREATE POLICY "Allow users to read own quiz responses"
  ON public.quiz_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR email = auth.jwt()->>'email');

-- Create policy: Allow service role full access (for admin/backend)
CREATE POLICY "Allow service role full access to quiz responses"
  ON public.quiz_responses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_quiz_response_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER quiz_response_updated_at
  BEFORE UPDATE ON public.quiz_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_quiz_response_updated_at();

-- Add comment to table
COMMENT ON TABLE public.quiz_responses IS 'Stores quiz responses from landing page. Used for lead tracking and conversion analytics.';
