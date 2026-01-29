-- ============================================================================
-- FREEZE PROTECTION LOGIC
-- Modifica update_streak() para consumir freezes automaticamente
-- ============================================================================

-- Substituir função update_streak para suportar proteção por freeze
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id uuid)
RETURNS TABLE (
  current_streak integer,
  is_new_record boolean,
  freeze_used boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_activity date;
  v_current_streak integer;
  v_longest_streak integer;
  v_new_streak integer;
  v_is_record boolean;
  v_freeze_available boolean := false;
  v_freeze_used boolean := false;
BEGIN
  -- Buscar dados atuais
  SELECT last_activity_date, user_progress.current_streak, longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM user_progress
  WHERE user_id = p_user_id;

  -- Se não existe registro, criar
  IF NOT FOUND THEN
    INSERT INTO user_progress (user_id, current_streak, last_activity_date)
    VALUES (p_user_id, 1, CURRENT_DATE);

    RETURN QUERY SELECT 1::integer, true::boolean, false::boolean;
    RETURN;
  END IF;

  -- ============================================================================
  -- LÓGICA DE FREEZE PROTECTION
  -- ============================================================================
  IF v_last_activity IS NULL OR v_last_activity < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Usuário perdeu um dia - verificar se tem freeze disponível
    SELECT available_freezes > 0 INTO v_freeze_available
    FROM user_streak_freezes
    WHERE user_id = p_user_id;

    IF v_freeze_available THEN
      -- ✅ TEM FREEZE: Consumir e MANTER STREAK
      v_new_streak := v_current_streak; -- Não reseta!
      v_freeze_used := true;

      -- Deduzir 1 freeze do inventário
      UPDATE user_streak_freezes
      SET
        available_freezes = available_freezes - 1,
        total_freezes_used = total_freezes_used + 1,
        updated_at = now()
      WHERE user_id = p_user_id;

      -- Registrar evento de uso automático
      INSERT INTO streak_freeze_events (user_id, event_type, source, protected_date, metadata)
      VALUES (
        p_user_id,
        'used',
        'auto_protection',
        CURRENT_DATE,
        jsonb_build_object(
          'streak_saved', v_current_streak,
          'auto_consumed', true,
          'protected_from_loss', true
        )
      );
    ELSE
      -- ❌ SEM FREEZE: Resetar streak normalmente
      v_new_streak := 1;
      v_freeze_used := false;
    END IF;
  ELSIF v_last_activity = CURRENT_DATE THEN
    -- Já registrou hoje, manter streak
    v_new_streak := v_current_streak;
    v_freeze_used := false;
  ELSE
    -- Continuou o streak (última atividade foi ontem)
    v_new_streak := v_current_streak + 1;
    v_freeze_used := false;
  END IF;

  -- Verificar se é novo recorde
  v_is_record := v_new_streak > v_longest_streak;

  -- Atualizar progresso
  UPDATE user_progress
  SET
    current_streak = v_new_streak,
    longest_streak = GREATEST(longest_streak, v_new_streak),
    last_activity_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Retornar (agora incluindo freeze_used)
  RETURN QUERY SELECT v_new_streak, v_is_record, v_freeze_used;
END;
$$;

-- Re-conceder permissão na função atualizada
GRANT EXECUTE ON FUNCTION public.update_streak(uuid) TO authenticated;

-- Atualizar comentário
COMMENT ON FUNCTION public.update_streak IS 'Atualiza streak do usuário baseado na última atividade. Consome freeze automaticamente se disponível quando streak iria quebrar.';
