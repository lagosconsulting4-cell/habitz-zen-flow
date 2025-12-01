-- Guided journey content
CREATE TABLE public.guided_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week smallint NOT NULL CHECK (week BETWEEN 1 AND 52),
  day smallint NOT NULL CHECK (day BETWEEN 1 AND 7),
  global_day smallint NOT NULL GENERATED ALWAYS AS ((week - 1) * 7 + day) STORED,
  title text NOT NULL,
  description text,
  estimated_minutes smallint,
  type text NOT NULL CHECK (type IN ('action', 'reflection', 'challenge')),
  audio_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week, day),
  UNIQUE (global_day)
);

CREATE INDEX guided_days_week_day_idx ON public.guided_days (week, day);

-- User state
CREATE TABLE public.guided_user_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  started_at date NOT NULL DEFAULT current_date,
  last_completed_global_day smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Day completions
CREATE TABLE public.guided_day_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  global_day smallint NOT NULL REFERENCES public.guided_days (global_day) ON DELETE CASCADE,
  completed_at date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, global_day)
);

CREATE INDEX guided_day_completions_user_day_idx ON public.guided_day_completions (user_id, global_day);
CREATE INDEX guided_day_completions_date_idx ON public.guided_day_completions (completed_at);

-- RLS
ALTER TABLE public.guided_user_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guided_day_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their journey state"
  ON public.guided_user_state
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view their completions"
  ON public.guided_day_completions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their completions"
  ON public.guided_day_completions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Helper function to check whether user can complete a day
CREATE OR REPLACE FUNCTION public.can_complete_guided_day(target_global_day smallint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  state_record public.guided_user_state;
  allowed_by_time integer;
  last_completed smallint;
BEGIN
  SELECT * INTO state_record
  FROM public.guided_user_state
  WHERE user_id = auth.uid();

  IF state_record IS NULL THEN
    RETURN FALSE;
  END IF;

  allowed_by_time := (current_date - state_record.started_at) + 1;

  IF target_global_day > allowed_by_time THEN
    RETURN FALSE;
  END IF;

  SELECT COALESCE(MAX(global_day), 0) INTO last_completed
  FROM public.guided_day_completions
  WHERE user_id = auth.uid();

  IF target_global_day <> last_completed + 1 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

CREATE POLICY "Users insert allowed completions"
  ON public.guided_day_completions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND completed_at = current_date
    AND public.can_complete_guided_day(global_day)
  );

-- Trigger to update timestamps and last completed day
CREATE OR REPLACE FUNCTION public.update_guided_state()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.guided_user_state
  SET
    last_completed_global_day = COALESCE((
      SELECT MAX(global_day)
      FROM public.guided_day_completions
      WHERE user_id = NEW.user_id
    ), 0),
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NULL;
END;
$$;

CREATE TRIGGER guided_day_completed
  AFTER INSERT OR DELETE ON public.guided_day_completions
  FOR EACH ROW EXECUTE FUNCTION public.update_guided_state();

CREATE TRIGGER update_guided_days_updated_at
  BEFORE UPDATE ON public.guided_days
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guided_user_state_updated_at
  BEFORE UPDATE ON public.guided_user_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
