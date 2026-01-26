-- Initialize Existing Users for Gamification System
-- Migração de dados para usuários já existentes
-- Executa APÓS os seeds de avatars e achievements

-- ============================================================================
-- 1. INICIALIZAR USER_GEMS (Gems Retroativas)
-- ============================================================================
-- 10 gems por hábito completado, máximo de 5000 gems iniciais

INSERT INTO public.user_gems (user_id, current_gems, lifetime_gems_earned)
SELECT
  up.user_id,
  LEAST(up.total_habits_completed * 10, 5000) AS current_gems,
  up.total_habits_completed * 10 AS lifetime_gems_earned
FROM public.user_progress up
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_gems ug WHERE ug.user_id = up.user_id
);

-- Registrar transação de gems retroativas
INSERT INTO public.gem_transactions (user_id, amount, transaction_type, metadata)
SELECT
  ug.user_id,
  ug.current_gems,
  'retroactive_migration',
  jsonb_build_object(
    'source', 'initial_migration',
    'habits_completed', up.total_habits_completed,
    'capped_at', 5000
  )
FROM public.user_gems ug
JOIN public.user_progress up ON ug.user_id = up.user_id
WHERE ug.current_gems > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.gem_transactions gt
    WHERE gt.user_id = ug.user_id AND gt.transaction_type = 'retroactive_migration'
  );

-- ============================================================================
-- 2. INICIALIZAR AVATAR PADRÃO (Smile Basic para todos)
-- ============================================================================

-- Dar avatar inicial para todos os usuários
INSERT INTO public.user_avatars (user_id, avatar_id, is_equipped)
SELECT
  up.user_id,
  'smile_basic',
  true
FROM public.user_progress up
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_avatars ua
  WHERE ua.user_id = up.user_id AND ua.avatar_id = 'smile_basic'
);

-- Atualizar perfil com emoji do avatar equipado
UPDATE public.profiles p
SET equipped_avatar_emoji = '😊'
WHERE EXISTS (SELECT 1 FROM public.user_progress up WHERE up.user_id = p.user_id)
  AND (p.equipped_avatar_emoji IS NULL OR p.equipped_avatar_emoji = '');

-- ============================================================================
-- 3. DESBLOQUEAR AVATARES POR NÍVEL
-- ============================================================================
-- Usuários em níveis altos recebem avatares correspondentes

INSERT INTO public.user_avatars (user_id, avatar_id, is_equipped)
SELECT DISTINCT up.user_id, a.id, false
FROM public.user_progress up
CROSS JOIN public.avatars a
WHERE a.unlock_level IS NOT NULL
  AND up.current_level >= a.unlock_level
  AND NOT EXISTS (
    SELECT 1 FROM public.user_avatars ua
    WHERE ua.user_id = up.user_id AND ua.avatar_id = a.id
  );

-- ============================================================================
-- 4. INICIALIZAR STREAK FREEZES (1 grátis para todos)
-- ============================================================================

INSERT INTO public.user_streak_freezes (user_id, available_freezes, total_freezes_earned, last_free_freeze_date)
SELECT
  up.user_id,
  1,
  1,
  CURRENT_DATE
FROM public.user_progress up
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_streak_freezes usf WHERE usf.user_id = up.user_id
);

-- Registrar evento de freeze inicial
INSERT INTO public.streak_freeze_events (user_id, event_type, source, metadata)
SELECT
  usf.user_id,
  'earned',
  'initial_migration',
  jsonb_build_object('reason', 'Welcome bonus - initial migration')
FROM public.user_streak_freezes usf
WHERE NOT EXISTS (
  SELECT 1 FROM public.streak_freeze_events sfe
  WHERE sfe.user_id = usf.user_id AND sfe.source = 'initial_migration'
);

-- ============================================================================
-- 5. DESBLOQUEAR ACHIEVEMENTS RETROATIVOS
-- ============================================================================
-- Achievements já atingidos são desbloqueados automaticamente

-- Achievement: first_habit (1 hábito completado)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'first_habit',
  jsonb_build_object('habits_completed', up.total_habits_completed, 'retroactive', true)
FROM public.user_progress up
WHERE up.total_habits_completed >= 1
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'first_habit'
  );

-- Achievement: habit_10 (10 hábitos)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'habit_10',
  jsonb_build_object('habits_completed', up.total_habits_completed, 'retroactive', true)
FROM public.user_progress up
WHERE up.total_habits_completed >= 10
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'habit_10'
  );

-- Achievement: habit_50 (50 hábitos)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'habit_50',
  jsonb_build_object('habits_completed', up.total_habits_completed, 'retroactive', true)
FROM public.user_progress up
WHERE up.total_habits_completed >= 50
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'habit_50'
  );

-- Achievement: habit_100 (100 hábitos)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'habit_100',
  jsonb_build_object('habits_completed', up.total_habits_completed, 'retroactive', true)
FROM public.user_progress up
WHERE up.total_habits_completed >= 100
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'habit_100'
  );

-- Achievement: habit_500 (500 hábitos)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'habit_500',
  jsonb_build_object('habits_completed', up.total_habits_completed, 'retroactive', true)
FROM public.user_progress up
WHERE up.total_habits_completed >= 500
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'habit_500'
  );

-- Achievement: streak_3 (3 dias de streak)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'streak_3',
  jsonb_build_object('longest_streak', up.longest_streak, 'retroactive', true)
FROM public.user_progress up
WHERE up.longest_streak >= 3
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'streak_3'
  );

-- Achievement: streak_7 (7 dias de streak)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'streak_7',
  jsonb_build_object('longest_streak', up.longest_streak, 'retroactive', true)
FROM public.user_progress up
WHERE up.longest_streak >= 7
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'streak_7'
  );

-- Achievement: streak_30 (30 dias de streak)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'streak_30',
  jsonb_build_object('longest_streak', up.longest_streak, 'retroactive', true)
FROM public.user_progress up
WHERE up.longest_streak >= 30
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'streak_30'
  );

-- Achievement: streak_100 (100 dias de streak)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'streak_100',
  jsonb_build_object('longest_streak', up.longest_streak, 'retroactive', true)
FROM public.user_progress up
WHERE up.longest_streak >= 100
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'streak_100'
  );

-- Achievement: streak_365 (365 dias de streak)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'streak_365',
  jsonb_build_object('longest_streak', up.longest_streak, 'retroactive', true)
FROM public.user_progress up
WHERE up.longest_streak >= 365
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'streak_365'
  );

-- Achievement: level_5 (nível 5)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'level_5',
  jsonb_build_object('current_level', up.current_level, 'retroactive', true)
FROM public.user_progress up
WHERE up.current_level >= 5
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'level_5'
  );

-- Achievement: level_7 (nível 7)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'level_7',
  jsonb_build_object('current_level', up.current_level, 'retroactive', true)
FROM public.user_progress up
WHERE up.current_level >= 7
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'level_7'
  );

-- Achievement: level_10 (nível 10)
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'level_10',
  jsonb_build_object('current_level', up.current_level, 'retroactive', true)
FROM public.user_progress up
WHERE up.current_level >= 10
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'level_10'
  );

-- Achievement: perfect_week (7 dias perfeitos seguidos) - baseado em perfect_days
INSERT INTO public.user_achievements (user_id, achievement_id, progress_snapshot)
SELECT
  up.user_id,
  'perfect_week',
  jsonb_build_object('perfect_days', up.perfect_days, 'retroactive', true)
FROM public.user_progress up
WHERE up.perfect_days >= 7
  AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = up.user_id AND ua.achievement_id = 'perfect_week'
  );

-- ============================================================================
-- 6. CREDITAR GEMS PELOS ACHIEVEMENTS RETROATIVOS
-- ============================================================================
-- Dar gems apenas para achievements desbloqueados nesta migração

DO $$
DECLARE
  v_achievement RECORD;
  v_total_gems_awarded integer := 0;
BEGIN
  FOR v_achievement IN
    SELECT ua.user_id, ua.achievement_id, a.gem_reward
    FROM public.user_achievements ua
    JOIN public.achievements a ON ua.achievement_id = a.id
    WHERE (ua.progress_snapshot->>'retroactive')::boolean = true
      AND a.gem_reward > 0
      AND NOT EXISTS (
        SELECT 1 FROM public.gem_transactions gt
        WHERE gt.user_id = ua.user_id
          AND gt.transaction_type = 'achievement_unlock_retroactive'
          AND gt.related_entity_id = ua.achievement_id
      )
  LOOP
    -- Adicionar gems
    UPDATE public.user_gems
    SET
      current_gems = current_gems + v_achievement.gem_reward,
      lifetime_gems_earned = lifetime_gems_earned + v_achievement.gem_reward,
      updated_at = now()
    WHERE user_id = v_achievement.user_id;

    -- Registrar transação
    INSERT INTO public.gem_transactions (user_id, amount, transaction_type, related_entity_type, related_entity_id, metadata)
    VALUES (
      v_achievement.user_id,
      v_achievement.gem_reward,
      'achievement_unlock_retroactive',
      'achievement',
      v_achievement.achievement_id,
      jsonb_build_object('retroactive', true, 'migration_date', CURRENT_DATE)
    );

    v_total_gems_awarded := v_total_gems_awarded + v_achievement.gem_reward;
  END LOOP;

  RAISE NOTICE 'Total gems awarded for retroactive achievements: %', v_total_gems_awarded;
END $$;

-- ============================================================================
-- 7. COMENTÁRIOS E LOG
-- ============================================================================

COMMENT ON TABLE public.user_gems IS 'Saldo de gems do usuário. Inicializado com 10 gems por hábito completado (máx 5000).';
COMMENT ON TABLE public.user_avatars IS 'Avatares desbloqueados. Todos começam com smile_basic equipado.';
COMMENT ON TABLE public.user_achievements IS 'Achievements desbloqueados. Retroativos são marcados com retroactive: true.';
COMMENT ON TABLE public.user_streak_freezes IS 'Inventário de streak freezes. Todos começam com 1 freeze grátis.';
