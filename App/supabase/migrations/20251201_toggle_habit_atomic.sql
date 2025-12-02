-- Create atomic habit toggle RPC function
-- Supports both marking and unmarking habits (toggle behavior)
-- Replaces complete_habit_atomic which only supported marking

CREATE OR REPLACE FUNCTION toggle_habit_atomic(
  p_user_id uuid,
  p_habit_id uuid,
  p_completed_at date,
  p_xp_amount int DEFAULT 10
) RETURNS jsonb AS $$
DECLARE
  v_completion_id uuid;
  v_action text;
  v_new_streak int;
BEGIN
  -- Check if completion already exists
  SELECT id INTO v_completion_id
  FROM habit_completions
  WHERE habit_id = p_habit_id
    AND user_id = p_user_id
    AND completed_at = p_completed_at;

  IF v_completion_id IS NOT NULL THEN
    -- UNMARK: Delete existing completion
    DELETE FROM habit_completions WHERE id = v_completion_id;

    -- Decrement streak (minimum 0)
    UPDATE habits SET streak = GREATEST(0, streak - 1)
    WHERE id = p_habit_id
    RETURNING streak INTO v_new_streak;

    v_action := 'removed';
    v_completion_id := NULL;
  ELSE
    -- MARK: Insert new completion
    INSERT INTO habit_completions (habit_id, user_id, completed_at)
    VALUES (p_habit_id, p_user_id, p_completed_at)
    RETURNING id INTO v_completion_id;

    -- Increment streak
    UPDATE habits SET streak = streak + 1
    WHERE id = p_habit_id
    RETURNING streak INTO v_new_streak;

    -- Award XP only when marking complete
    PERFORM add_xp(p_user_id, p_xp_amount, 'habit_complete', p_habit_id, null);

    -- Update user-level streak based on last activity date
    PERFORM update_streak(p_user_id);

    -- Track last activity date for streak calculation
    UPDATE user_progress
    SET last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;

    v_action := 'added';
  END IF;

  RETURN jsonb_build_object(
    'action', v_action,
    'completion_id', v_completion_id,
    'new_streak', v_new_streak
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
