-- ============================================================================
-- MONTHLY FREE FREEZE CRON JOB
-- Concede 1 freeze grátis por mês para usuários ativos
-- ============================================================================

-- Desagendar job anterior se existir (para evitar duplicatas)
SELECT cron.unschedule('grant-monthly-free-freeze')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'grant-monthly-free-freeze'
);

-- Agendar novo job
SELECT cron.schedule(
  'grant-monthly-free-freeze',
  '0 3 1 * *',  -- Todo dia 1 do mês, 03:00 UTC
  $$
  -- Dar 1 freeze grátis para usuários ativos no mês anterior
  UPDATE public.user_streak_freezes
  SET
    available_freezes = available_freezes + 1,
    total_freezes_earned = total_freezes_earned + 1,
    last_free_freeze_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id IN (
    SELECT user_id FROM public.user_progress
    WHERE last_activity_date >= CURRENT_DATE - INTERVAL '30 days'
  );

  -- Registrar eventos de concessão de freeze mensal
  INSERT INTO public.streak_freeze_events (user_id, event_type, source, metadata)
  SELECT
    user_id,
    'earned',
    'monthly_free',
    jsonb_build_object(
      'month', to_char(CURRENT_DATE, 'YYYY-MM'),
      'free_monthly_grant', true
    )
  FROM public.user_streak_freezes
  WHERE last_free_freeze_date = CURRENT_DATE;
  $$
);

COMMENT ON TABLE public.streak_freeze_events IS 'Histórico de eventos de freeze: earned (ganhado via compra ou mensal), used (consumido para proteger), purchased (comprado com gems)';
