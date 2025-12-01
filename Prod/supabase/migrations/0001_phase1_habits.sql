-- Phase 1: schema changes to pivot Habitz for streak-focused habit tracking

-- Enums --------------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE public.habit_unit AS ENUM ('none', 'steps', 'minutes', 'km', 'custom');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

DO $$
BEGIN
  CREATE TYPE public.habit_frequency_type AS ENUM ('fixed_days', 'times_per_week', 'times_per_month', 'every_n_days', 'daily');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

DO $$
BEGIN
  CREATE TYPE public.habit_auto_complete_source AS ENUM ('manual', 'health');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

DO $$
BEGIN
  CREATE TYPE public.habit_notification_type AS ENUM ('reminder', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

-- habits -------------------------------------------------------------------
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS icon_key text,
  ADD COLUMN IF NOT EXISTS unit public.habit_unit DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS goal_value numeric,
  ADD COLUMN IF NOT EXISTS frequency_type public.habit_frequency_type DEFAULT 'fixed_days',
  ADD COLUMN IF NOT EXISTS times_per_week int2,
  ADD COLUMN IF NOT EXISTS times_per_month int2,
  ADD COLUMN IF NOT EXISTS every_n_days int2,
  ADD COLUMN IF NOT EXISTS notification_pref jsonb,
  ADD COLUMN IF NOT EXISTS auto_complete_source public.habit_auto_complete_source DEFAULT 'manual';

-- habit_completions --------------------------------------------------------
ALTER TABLE public.habit_completions
  ADD COLUMN IF NOT EXISTS value numeric,
  ADD COLUMN IF NOT EXISTS completed_at_time time,
  ADD COLUMN IF NOT EXISTS note text;

-- habit_notifications ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  type public.habit_notification_type NOT NULL,
  time time NOT NULL,
  sound text,
  time_sensitive boolean DEFAULT false,
  channel text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- habit_categories ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon_key text,
  color text,
  sort_order int4,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- habit_templates ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.habit_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE,
  icon_key text,
  color text,
  default_unit public.habit_unit DEFAULT 'none',
  default_goal_value numeric,
  default_frequency_type public.habit_frequency_type DEFAULT 'fixed_days',
  default_days_of_week int2[],
  default_times_per_week int2,
  default_times_per_month int2,
  default_every_n_days int2,
  default_notifications jsonb,
  auto_complete_source public.habit_auto_complete_source DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index helpers ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS habit_notifications_habit_id_idx ON public.habit_notifications (habit_id);
CREATE INDEX IF NOT EXISTS habit_templates_category_id_idx ON public.habit_templates (category_id);
