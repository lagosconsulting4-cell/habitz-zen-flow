-- ============================================================
-- Migration: Times Per Day Feature
-- Permite configurar quantas vezes por dia um hábito deve ser completado
-- ============================================================

-- 1. Adicionar times_per_day à tabela habits
ALTER TABLE public.habits
ADD COLUMN IF NOT EXISTS times_per_day INTEGER NOT NULL DEFAULT 1
CHECK (times_per_day >= 1 AND times_per_day <= 10);

-- 2. Adicionar completion_count à tabela habit_completions
ALTER TABLE public.habit_completions
ADD COLUMN IF NOT EXISTS completion_count INTEGER NOT NULL DEFAULT 1
CHECK (completion_count >= 0);

-- 3. Atualizar RPC toggle_habit_atomic para suportar incremento/decremento
CREATE OR REPLACE FUNCTION public.toggle_habit_atomic(
  p_user_id uuid,
  p_habit_id uuid,
  p_completed_at date,
  p_xp_amount int DEFAULT 10
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_completion_id uuid;
  v_action text;
  v_new_streak int;
  v_completion_count int := 0;
  v_times_per_day int;
  v_current_count int := 0;
  v_is_fully_completed boolean := false;
  v_was_fully_completed boolean := false;
BEGIN
  -- Buscar configuração de times_per_day do hábito
  SELECT COALESCE(times_per_day, 1) INTO v_times_per_day
  FROM habits
  WHERE id = p_habit_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'habit_not_found');
  END IF;

  -- Verificar se já existe completion para hoje
  SELECT id, COALESCE(completion_count, 1) INTO v_completion_id, v_current_count
  FROM habit_completions
  WHERE habit_id = p_habit_id
    AND user_id = p_user_id
    AND completed_at = p_completed_at;

  v_was_fully_completed := (v_current_count >= v_times_per_day) AND (v_completion_id IS NOT NULL);

  IF v_completion_id IS NOT NULL THEN
    IF v_current_count >= v_times_per_day THEN
      -- Já completo → decrementar (undo)
      v_completion_count := v_current_count - 1;

      IF v_completion_count = 0 THEN
        -- Chegou a 0 → deletar row
        DELETE FROM habit_completions WHERE id = v_completion_id;
        v_action := 'removed';
        v_completion_id := NULL;
      ELSE
        UPDATE habit_completions
        SET completion_count = v_completion_count
        WHERE id = v_completion_id;
        v_action := 'decremented';
      END IF;
    ELSE
      -- Não completo → incrementar
      v_completion_count := v_current_count + 1;
      UPDATE habit_completions
      SET completion_count = v_completion_count
      WHERE id = v_completion_id;
      v_action := 'incremented';
    END IF;
  ELSE
    -- Não existe → criar com count=1
    INSERT INTO habit_completions (habit_id, user_id, completed_at, completion_count)
    VALUES (p_habit_id, p_user_id, p_completed_at, 1)
    RETURNING id INTO v_completion_id;

    v_completion_count := 1;
    v_action := 'added';
  END IF;

  v_is_fully_completed := (v_completion_count >= v_times_per_day);

  -- Streak/XP só muda na transição completo↔incompleto
  IF v_is_fully_completed AND NOT v_was_fully_completed THEN
    -- Acabou de completar → incrementar streak + XP
    UPDATE habits SET streak = streak + 1
    WHERE id = p_habit_id
    RETURNING streak INTO v_new_streak;

    PERFORM add_xp(p_user_id, p_xp_amount, 'habit_complete', p_habit_id, null);
    PERFORM update_streak(p_user_id);

    UPDATE user_progress
    SET last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;

  ELSIF NOT v_is_fully_completed AND v_was_fully_completed THEN
    -- Desfez completação → decrementar streak
    UPDATE habits SET streak = GREATEST(0, streak - 1)
    WHERE id = p_habit_id
    RETURNING streak INTO v_new_streak;
  ELSE
    SELECT streak INTO v_new_streak FROM habits WHERE id = p_habit_id;
  END IF;

  RETURN jsonb_build_object(
    'action', v_action,
    'completion_id', v_completion_id,
    'new_streak', COALESCE(v_new_streak, 0),
    'completion_count', v_completion_count,
    'times_per_day', v_times_per_day,
    'is_fully_completed', v_is_fully_completed
  );
END;
$$;
