-- ============================================
-- Extend advance_journey_to_next_day to return phase_badge_name
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
  v_phase_badge_name text := NULL;
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

    -- 9. Check if phase was completed + get badge name
    SELECT jp.badge_name INTO v_phase_badge_name
    FROM public.journey_phases jp
    WHERE jp.journey_id = p_journey_id
      AND jp.day_end = v_state.current_day;

    v_phase_completed := v_phase_badge_name IS NOT NULL;
  END IF;

  RETURN jsonb_build_object(
    'next_day', v_next_day,
    'new_habits', COALESCE(v_new_habits, '[]'::jsonb),
    'phase_completed', v_phase_completed,
    'phase_badge_name', v_phase_badge_name,
    'journey_completed', v_journey_completed,
    'days_completed', v_state.days_completed + 1,
    'completion_percent', CASE
      WHEN v_journey_completed THEN 100
      ELSE ((v_state.days_completed + 1) * 100 / v_journey_duration)
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
