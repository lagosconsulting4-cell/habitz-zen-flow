-- =====================================================
-- Fix: Add error handling to all user creation triggers
-- =====================================================
-- These triggers run on auth.users INSERT and can block user creation
-- if they fail without proper error handling.

-- 1. Fix handle_new_user() - creates profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Fix assign_user_to_cohort() - assigns user to analytics cohorts
CREATE OR REPLACE FUNCTION public.assign_user_to_cohort(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_signup_date date;
  v_first_habit_date date;
  v_first_completion_date date;
BEGIN
  -- Get user signup date
  SELECT created_at::date INTO v_signup_date
  FROM profiles
  WHERE user_id = p_user_id;

  -- Get first habit creation date
  SELECT MIN(created_at::date) INTO v_first_habit_date
  FROM habits
  WHERE user_id = p_user_id;

  -- Get first completion date
  SELECT MIN(completed_at) INTO v_first_completion_date
  FROM habit_completions
  WHERE user_id = p_user_id;

  -- Insert or update cohort assignment
  INSERT INTO user_cohorts (
    user_id,
    signup_cohort_week,
    signup_cohort_month,
    first_habit_date,
    first_completion_date
  ) VALUES (
    p_user_id,
    date_trunc('week', COALESCE(v_signup_date, CURRENT_DATE))::date,
    date_trunc('month', COALESCE(v_signup_date, CURRENT_DATE))::date,
    v_first_habit_date,
    v_first_completion_date
  )
  ON CONFLICT (user_id) DO UPDATE SET
    first_habit_date = COALESCE(EXCLUDED.first_habit_date, user_cohorts.first_habit_date),
    first_completion_date = COALESCE(EXCLUDED.first_completion_date, user_cohorts.first_completion_date);
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'assign_user_to_cohort failed for user %: %', p_user_id, SQLERRM;
END;
$$;

-- 3. Fix auto_assign_cohort() - trigger function that calls assign_user_to_cohort
CREATE OR REPLACE FUNCTION public.auto_assign_cohort()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.assign_user_to_cohort(NEW.user_id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'auto_assign_cohort failed for user %: %', NEW.user_id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Comments
COMMENT ON FUNCTION public.handle_new_user IS
'Creates profile for new users. Includes error handling to prevent blocking user creation.';

COMMENT ON FUNCTION public.assign_user_to_cohort IS
'Assigns user to analytics cohorts. Includes error handling to prevent blocking user creation.';

COMMENT ON FUNCTION public.auto_assign_cohort IS
'Trigger function for auto-assigning cohorts. Includes error handling to prevent blocking user creation.';
