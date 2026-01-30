-- Adicionar campos para tracking de compras semanais
ALTER TABLE user_streak_freezes
ADD COLUMN IF NOT EXISTS weekly_purchases_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_purchase_week DATE;

-- Função para verificar e atualizar limite semanal
CREATE OR REPLACE FUNCTION check_weekly_freeze_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_week_start DATE;
  v_last_purchase_week DATE;
  v_weekly_count INT;
BEGIN
  -- Calcular início da semana atual (segunda-feira)
  v_current_week_start := date_trunc('week', CURRENT_DATE)::DATE;

  -- Buscar dados do usuário
  SELECT last_purchase_week, weekly_purchases_count
  INTO v_last_purchase_week, v_weekly_count
  FROM user_streak_freezes
  WHERE user_id = p_user_id;

  -- Se não encontrou registro, criar
  IF NOT FOUND THEN
    INSERT INTO user_streak_freezes (user_id, weekly_purchases_count, last_purchase_week)
    VALUES (p_user_id, 0, NULL);
    RETURN TRUE;  -- Primeira compra permitida
  END IF;

  -- Se mudou de semana, resetar contador
  IF v_last_purchase_week IS NULL OR v_last_purchase_week < v_current_week_start THEN
    UPDATE user_streak_freezes
    SET weekly_purchases_count = 0,
        last_purchase_week = v_current_week_start
    WHERE user_id = p_user_id;
    RETURN TRUE;  -- Nova semana, permitir compra
  END IF;

  -- Verificar se atingiu limite de 3
  RETURN v_weekly_count < 3;
END;
$$;

-- Modificar RPC de compra para incluir validação
CREATE OR REPLACE FUNCTION purchase_streak_freeze_with_limit(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_can_purchase BOOLEAN;
  v_current_gems INT;
  v_freeze_cost INT := 200;
BEGIN
  -- Verificar limite semanal
  v_can_purchase := check_weekly_freeze_limit(p_user_id);

  IF NOT v_can_purchase THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'weekly_limit_reached',
      'message', 'Você já comprou 3 freezes esta semana. Volte na próxima semana!'
    );
  END IF;

  -- Verificar saldo de gems
  SELECT current_gems INTO v_current_gems
  FROM user_gems
  WHERE user_id = p_user_id;

  IF v_current_gems < v_freeze_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_gems',
      'message', format('Você precisa de %s gems. Faltam %s gems.', v_freeze_cost, v_freeze_cost - v_current_gems)
    );
  END IF;

  -- Deduzir gems
  PERFORM add_gems(p_user_id, -v_freeze_cost, 'freeze_purchase', 'weekly_purchase');

  -- Adicionar freeze
  UPDATE user_streak_freezes
  SET available_freezes = available_freezes + 1,
      total_freezes_earned = total_freezes_earned + 1,
      weekly_purchases_count = weekly_purchases_count + 1,
      last_purchase_week = date_trunc('week', CURRENT_DATE)::DATE,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Registrar evento
  INSERT INTO streak_freeze_events (user_id, event_type, source, metadata)
  VALUES (p_user_id, 'earned', 'purchase', jsonb_build_object('cost', v_freeze_cost));

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_current_gems - v_freeze_cost,
    'available_freezes', (SELECT available_freezes FROM user_streak_freezes WHERE user_id = p_user_id),
    'weekly_purchases', (SELECT weekly_purchases_count FROM user_streak_freezes WHERE user_id = p_user_id)
  );
END;
$$;
