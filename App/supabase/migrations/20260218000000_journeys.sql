-- ============================================
-- JOURNEYS SYSTEM — Phase 1 Migration
-- Creates all tables for the journey feature
-- ============================================

-- ============================================
-- 1. CATÁLOGO DE JORNADAS (10 total: 5 temas x 2 níveis)
-- ============================================
CREATE TABLE IF NOT EXISTS public.journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  theme_slug text NOT NULL,
  title text NOT NULL,
  subtitle text,
  promise text,
  description text,
  level smallint NOT NULL DEFAULT 1,
  duration_days smallint NOT NULL DEFAULT 30,
  illustration_key text NOT NULL,
  cover_image_url text,
  target_audience text,
  expected_result text,
  prerequisite_journey_slug text,
  prerequisite_min_percent smallint DEFAULT 80,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order smallint DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. FASES DA JORNADA (4 por jornada = semanas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.journey_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  phase_number smallint NOT NULL,
  title text NOT NULL,
  subtitle text,
  description text,
  day_start smallint NOT NULL,
  day_end smallint NOT NULL,
  badge_illustration_key text,
  badge_name text,
  UNIQUE(journey_id, phase_number)
);

-- ============================================
-- 3. DIAS DA JORNADA (30 por jornada)
-- ============================================
CREATE TABLE IF NOT EXISTS public.journey_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  phase_id uuid NOT NULL REFERENCES public.journey_phases(id) ON DELETE CASCADE,
  day_number smallint NOT NULL,
  title text NOT NULL,
  card_content text NOT NULL,
  motivational_note text,
  is_rest_day boolean DEFAULT false,
  is_review_day boolean DEFAULT false,
  is_cliff_day boolean DEFAULT false,
  estimated_minutes smallint,
  UNIQUE(journey_id, day_number)
);

-- ============================================
-- 4. TEMPLATES DE HÁBITOS DA JORNADA
-- ============================================
CREATE TABLE IF NOT EXISTS public.journey_habit_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  name text NOT NULL,
  emoji text DEFAULT '📋',
  illustration_key text,
  category text NOT NULL DEFAULT 'outro',
  period text NOT NULL DEFAULT 'morning',
  tracking_type text NOT NULL DEFAULT 'checkbox',
  unit text DEFAULT 'none',
  initial_goal_value numeric,
  start_day smallint NOT NULL DEFAULT 1,
  end_day smallint,
  frequency_type text DEFAULT 'daily',
  days_of_week int2[] DEFAULT '{0,1,2,3,4,5,6}',
  goal_progression jsonb DEFAULT '[]',
  canonical_key text,
  sort_order smallint DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_jht_journey ON public.journey_habit_templates(journey_id);
CREATE INDEX IF NOT EXISTS idx_jht_canonical ON public.journey_habit_templates(canonical_key)
  WHERE canonical_key IS NOT NULL;

-- ============================================
-- 5. ESTADO DA JORNADA DO USUÁRIO
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_journey_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  started_at date NOT NULL DEFAULT CURRENT_DATE,
  current_day smallint NOT NULL DEFAULT 1,
  current_phase smallint NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active',
  days_completed smallint DEFAULT 0,
  completion_percent smallint DEFAULT 0,
  completed_at timestamptz,
  paused_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, journey_id)
);

CREATE INDEX IF NOT EXISTS idx_ujs_active ON public.user_journey_state(user_id)
  WHERE status = 'active';

-- ============================================
-- 6. CONCLUSÕES DE DIAS DA JORNADA
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_journey_day_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  day_number smallint NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, journey_id, day_number)
);

-- ============================================
-- 7. LINK: HÁBITOS GERENCIADOS PELA JORNADA
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_journey_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  journey_habit_template_id uuid REFERENCES public.journey_habit_templates(id),
  canonical_key text,
  introduced_on_day smallint NOT NULL,
  expires_on_day smallint,
  current_goal_value numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, journey_id, journey_habit_template_id)
);

CREATE INDEX IF NOT EXISTS idx_ujh_user ON public.user_journey_habits(user_id, journey_id)
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ujh_habit ON public.user_journey_habits(habit_id);

-- ============================================
-- 8. ADD source COLUMN TO habits TABLE (if not exists)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'source'
  ) THEN
    ALTER TABLE public.habits ADD COLUMN source text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'habits' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE public.habits ADD COLUMN template_id uuid DEFAULT NULL;
  END IF;
END $$;

-- ============================================
-- 9. RLS POLICIES
-- ============================================

-- Journeys catalog: everyone can read
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "journeys_select" ON public.journeys;
CREATE POLICY "journeys_select" ON public.journeys
  FOR SELECT USING (true);

-- Journey phases: everyone can read
ALTER TABLE public.journey_phases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "journey_phases_select" ON public.journey_phases;
CREATE POLICY "journey_phases_select" ON public.journey_phases
  FOR SELECT USING (true);

-- Journey days: everyone can read
ALTER TABLE public.journey_days ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "journey_days_select" ON public.journey_days;
CREATE POLICY "journey_days_select" ON public.journey_days
  FOR SELECT USING (true);

-- Journey habit templates: everyone can read
ALTER TABLE public.journey_habit_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "journey_habit_templates_select" ON public.journey_habit_templates;
CREATE POLICY "journey_habit_templates_select" ON public.journey_habit_templates
  FOR SELECT USING (true);

-- User journey state: own data only
ALTER TABLE public.user_journey_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ujs_select" ON public.user_journey_state;
CREATE POLICY "ujs_select" ON public.user_journey_state
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "ujs_insert" ON public.user_journey_state;
CREATE POLICY "ujs_insert" ON public.user_journey_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "ujs_update" ON public.user_journey_state;
CREATE POLICY "ujs_update" ON public.user_journey_state
  FOR UPDATE USING (auth.uid() = user_id);

-- User journey day completions: own data only
ALTER TABLE public.user_journey_day_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ujdc_select" ON public.user_journey_day_completions;
CREATE POLICY "ujdc_select" ON public.user_journey_day_completions
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "ujdc_insert" ON public.user_journey_day_completions;
CREATE POLICY "ujdc_insert" ON public.user_journey_day_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User journey habits: own data only
ALTER TABLE public.user_journey_habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ujh_select" ON public.user_journey_habits;
CREATE POLICY "ujh_select" ON public.user_journey_habits
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "ujh_insert" ON public.user_journey_habits;
CREATE POLICY "ujh_insert" ON public.user_journey_habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "ujh_update" ON public.user_journey_habits;
CREATE POLICY "ujh_update" ON public.user_journey_habits
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 10. RPC: advance_journey_to_next_day
-- ============================================
CREATE OR REPLACE FUNCTION public.advance_journey_to_next_day(
  p_user_id uuid,
  p_journey_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_state record;
  v_next_day smallint;
  v_new_habits jsonb := '[]';
  v_phase_completed boolean := false;
  v_journey_completed boolean := false;
  v_journey_duration smallint;
BEGIN
  -- 1. Verify caller
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2. Fetch current state
  SELECT * INTO v_state FROM public.user_journey_state
  WHERE user_id = p_user_id AND journey_id = p_journey_id AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active journey found';
  END IF;

  -- 3. Get journey duration
  SELECT duration_days INTO v_journey_duration FROM public.journeys WHERE id = p_journey_id;
  v_next_day := v_state.current_day + 1;

  -- 4. Record day completion
  INSERT INTO public.user_journey_day_completions (user_id, journey_id, day_number)
  VALUES (p_user_id, p_journey_id, v_state.current_day)
  ON CONFLICT (user_id, journey_id, day_number) DO NOTHING;

  -- 5. Check if journey is now complete
  IF v_next_day > v_journey_duration THEN
    UPDATE public.user_journey_state SET
      status = 'completed',
      completed_at = now(),
      days_completed = v_state.days_completed + 1,
      completion_percent = 100,
      updated_at = now()
    WHERE id = v_state.id;
    v_journey_completed := true;
  ELSE
    -- 6. Advance to next day
    UPDATE public.user_journey_state SET
      current_day = v_next_day,
      days_completed = v_state.days_completed + 1,
      completion_percent = ((v_state.days_completed + 1) * 100 / v_journey_duration),
      current_phase = COALESCE(
        (SELECT jp.phase_number FROM public.journey_phases jp
         WHERE jp.journey_id = p_journey_id
           AND v_next_day BETWEEN jp.day_start AND jp.day_end
         LIMIT 1),
        v_state.current_phase
      ),
      updated_at = now()
    WHERE id = v_state.id;

    -- 7. Find new habits to create for next day
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'id', jht.id,
      'name', jht.name,
      'emoji', jht.emoji,
      'category', jht.category,
      'period', jht.period,
      'tracking_type', jht.tracking_type,
      'unit', jht.unit,
      'initial_goal_value', jht.initial_goal_value,
      'frequency_type', jht.frequency_type,
      'days_of_week', jht.days_of_week,
      'canonical_key', jht.canonical_key
    )), '[]'::jsonb)
    INTO v_new_habits
    FROM public.journey_habit_templates jht
    WHERE jht.journey_id = p_journey_id
      AND jht.start_day = v_next_day;

    -- 8. Update progressive goals
    UPDATE public.user_journey_habits ujh
    SET current_goal_value = (
      SELECT (elem->>'goal_value')::numeric
      FROM public.journey_habit_templates jht,
           jsonb_array_elements(jht.goal_progression) elem
      WHERE jht.id = ujh.journey_habit_template_id
        AND (elem->>'from_day')::smallint = v_next_day
      LIMIT 1
    )
    WHERE ujh.user_id = p_user_id
      AND ujh.journey_id = p_journey_id
      AND ujh.is_active = true
      AND EXISTS (
        SELECT 1 FROM public.journey_habit_templates jht,
               jsonb_array_elements(jht.goal_progression) elem
        WHERE jht.id = ujh.journey_habit_template_id
          AND (elem->>'from_day')::smallint = v_next_day
      );

    -- 9. Check if phase was completed
    SELECT EXISTS(
      SELECT 1 FROM public.journey_phases jp
      WHERE jp.journey_id = p_journey_id
        AND jp.day_end = v_state.current_day
    ) INTO v_phase_completed;
  END IF;

  RETURN jsonb_build_object(
    'next_day', v_next_day,
    'new_habits', COALESCE(v_new_habits, '[]'::jsonb),
    'phase_completed', v_phase_completed,
    'journey_completed', v_journey_completed,
    'days_completed', v_state.days_completed + 1,
    'completion_percent', CASE
      WHEN v_journey_completed THEN 100
      ELSE ((v_state.days_completed + 1) * 100 / v_journey_duration)
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
