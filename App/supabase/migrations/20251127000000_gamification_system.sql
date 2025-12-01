-- Gamification System Migration
-- Sistema de XP, níveis e desbloqueáveis para engajamento do usuário
-- Bronze I-III (0-1000 XP), Prata I-III (1000-5000 XP), Ouro I-III (5000-15000 XP), Diamante (15000+ XP)

-- ============================================================================
-- 1. USER PROGRESS TABLE
-- ============================================================================
-- Rastreia o progresso geral do usuário: XP, nível, streaks, dias perfeitos

CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- XP e Nível
  total_xp integer NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  current_level integer NOT NULL DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 10),

  -- Streaks
  current_streak integer NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak integer NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date date,

  -- Conquistas
  perfect_days integer NOT NULL DEFAULT 0 CHECK (perfect_days >= 0), -- Dias com 100% dos hábitos completos
  total_habits_completed integer NOT NULL DEFAULT 0 CHECK (total_habits_completed >= 0),

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS user_progress_user_id_idx ON public.user_progress (user_id);
CREATE INDEX IF NOT EXISTS user_progress_total_xp_idx ON public.user_progress (total_xp DESC);
CREATE INDEX IF NOT EXISTS user_progress_current_level_idx ON public.user_progress (current_level DESC);
CREATE INDEX IF NOT EXISTS user_progress_current_streak_idx ON public.user_progress (current_streak DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_progress_updated_at();

-- ============================================================================
-- 2. USER UNLOCKS TABLE
-- ============================================================================
-- Rastreia itens desbloqueados: ícones, widgets, meditações, templates, jornadas

CREATE TABLE IF NOT EXISTS public.user_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo e ID do desbloqueável
  unlock_type text NOT NULL CHECK (unlock_type IN ('icon', 'widget', 'meditation', 'template', 'journey')),
  unlock_id text NOT NULL,

  -- Metadados
  unlocked_at timestamptz NOT NULL DEFAULT now(),

  -- Garantir que cada item só pode ser desbloqueado uma vez por usuário
  UNIQUE(user_id, unlock_type, unlock_id)
);

-- Índices para queries rápidas
CREATE INDEX IF NOT EXISTS user_unlocks_user_id_idx ON public.user_unlocks (user_id);
CREATE INDEX IF NOT EXISTS user_unlocks_type_idx ON public.user_unlocks (unlock_type);
CREATE INDEX IF NOT EXISTS user_unlocks_user_type_idx ON public.user_unlocks (user_id, unlock_type);

-- ============================================================================
-- 3. XP EVENTS TABLE
-- ============================================================================
-- Histórico de todos os eventos de XP para auditoria e analytics

CREATE TABLE IF NOT EXISTS public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Detalhes do evento
  amount integer NOT NULL, -- Pode ser negativo para penalidades
  reason text NOT NULL, -- 'habit_complete', 'streak_bonus', 'perfect_day', 'level_up_bonus', etc.

  -- Contexto opcional
  habit_id uuid REFERENCES public.habits(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb, -- Dados extras (streak count, level, etc.)

  -- Timestamp
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para queries e analytics
CREATE INDEX IF NOT EXISTS xp_events_user_id_idx ON public.xp_events (user_id);
CREATE INDEX IF NOT EXISTS xp_events_created_at_idx ON public.xp_events (created_at DESC);
CREATE INDEX IF NOT EXISTS xp_events_user_date_idx ON public.xp_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS xp_events_reason_idx ON public.xp_events (reason);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- Políticas para user_progress
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para user_unlocks
CREATE POLICY "Users can view own unlocks"
  ON public.user_unlocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unlocks"
  ON public.user_unlocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para xp_events
CREATE POLICY "Users can view own xp events"
  ON public.xp_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp events"
  ON public.xp_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Função para calcular o nível baseado no XP total
-- Níveis: 1-3 Bronze (0-1000), 4-6 Prata (1000-5000), 7-9 Ouro (5000-15000), 10 Diamante (15000+)
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(p_total_xp integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Diamante (nível 10): 15000+ XP
  IF p_total_xp >= 15000 THEN
    RETURN 10;
  -- Ouro III (nível 9): 12000-14999 XP
  ELSIF p_total_xp >= 12000 THEN
    RETURN 9;
  -- Ouro II (nível 8): 9000-11999 XP
  ELSIF p_total_xp >= 9000 THEN
    RETURN 8;
  -- Ouro I (nível 7): 5000-8999 XP
  ELSIF p_total_xp >= 5000 THEN
    RETURN 7;
  -- Prata III (nível 6): 3500-4999 XP
  ELSIF p_total_xp >= 3500 THEN
    RETURN 6;
  -- Prata II (nível 5): 2000-3499 XP
  ELSIF p_total_xp >= 2000 THEN
    RETURN 5;
  -- Prata I (nível 4): 1000-1999 XP
  ELSIF p_total_xp >= 1000 THEN
    RETURN 4;
  -- Bronze III (nível 3): 500-999 XP
  ELSIF p_total_xp >= 500 THEN
    RETURN 3;
  -- Bronze II (nível 2): 100-499 XP
  ELSIF p_total_xp >= 100 THEN
    RETURN 2;
  -- Bronze I (nível 1): 0-99 XP
  ELSE
    RETURN 1;
  END IF;
END;
$$;

-- Função para adicionar XP e atualizar nível automaticamente
CREATE OR REPLACE FUNCTION public.add_xp(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_habit_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  new_total_xp integer,
  new_level integer,
  leveled_up boolean,
  previous_level integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_xp integer;
  v_current_level integer;
  v_new_xp integer;
  v_new_level integer;
  v_leveled_up boolean;
BEGIN
  -- Buscar progresso atual (ou criar se não existir)
  INSERT INTO user_progress (user_id, total_xp, current_level)
  VALUES (p_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  -- Buscar valores atuais
  SELECT total_xp, current_level
  INTO v_current_xp, v_current_level
  FROM user_progress
  WHERE user_id = p_user_id;

  -- Calcular novo XP (não pode ser negativo)
  v_new_xp := GREATEST(0, v_current_xp + p_amount);

  -- Calcular novo nível
  v_new_level := calculate_level_from_xp(v_new_xp);

  -- Verificar se subiu de nível
  v_leveled_up := v_new_level > v_current_level;

  -- Atualizar progresso
  UPDATE user_progress
  SET
    total_xp = v_new_xp,
    current_level = v_new_level,
    total_habits_completed = CASE
      WHEN p_reason = 'habit_complete' THEN total_habits_completed + 1
      ELSE total_habits_completed
    END,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Registrar evento de XP
  INSERT INTO xp_events (user_id, amount, reason, habit_id, metadata)
  VALUES (p_user_id, p_amount, p_reason, p_habit_id, p_metadata);

  -- Se subiu de nível, registrar evento de level up
  IF v_leveled_up THEN
    INSERT INTO xp_events (user_id, amount, reason, metadata)
    VALUES (
      p_user_id,
      0,
      'level_up',
      jsonb_build_object('from_level', v_current_level, 'to_level', v_new_level)
    );
  END IF;

  -- Retornar resultados
  RETURN QUERY SELECT
    v_new_xp,
    v_new_level,
    v_leveled_up,
    v_current_level;
END;
$$;

-- Função para atualizar streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id uuid)
RETURNS TABLE (
  current_streak integer,
  is_new_record boolean
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

    RETURN QUERY SELECT 1::integer, true::boolean;
    RETURN;
  END IF;

  -- Verificar streak
  IF v_last_activity IS NULL OR v_last_activity < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Streak quebrou, resetar
    v_new_streak := 1;
  ELSIF v_last_activity = CURRENT_DATE THEN
    -- Já registrou hoje, manter streak
    v_new_streak := v_current_streak;
  ELSE
    -- Continuou o streak (última atividade foi ontem)
    v_new_streak := v_current_streak + 1;
  END IF;

  -- Verificar se é novo recorde
  v_is_record := v_new_streak > v_longest_streak;

  -- Atualizar
  UPDATE user_progress
  SET
    current_streak = v_new_streak,
    longest_streak = GREATEST(longest_streak, v_new_streak),
    last_activity_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Retornar
  RETURN QUERY SELECT v_new_streak, v_is_record;
END;
$$;

-- Função para verificar se usuário desbloqueou um item
CREATE OR REPLACE FUNCTION public.check_unlock(
  p_user_id uuid,
  p_unlock_type text,
  p_unlock_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_unlocks
    WHERE user_id = p_user_id
      AND unlock_type = p_unlock_type
      AND unlock_id = p_unlock_id
  );
END;
$$;

-- Função para desbloquear item (idempotente)
CREATE OR REPLACE FUNCTION public.unlock_item(
  p_user_id uuid,
  p_unlock_type text,
  p_unlock_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_unlocks (user_id, unlock_type, unlock_id)
  VALUES (p_user_id, p_unlock_type, p_unlock_id)
  ON CONFLICT (user_id, unlock_type, unlock_id) DO NOTHING;

  -- Retornar true se inseriu (novo desbloqueio), false se já existia
  RETURN FOUND;
END;
$$;

-- ============================================================================
-- 6. GRANTS
-- ============================================================================

-- Conceder acesso às funções
GRANT EXECUTE ON FUNCTION public.calculate_level_from_xp(integer) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.add_xp(uuid, integer, text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_streak(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_unlock(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_item(uuid, text, text) TO authenticated;

-- ============================================================================
-- 7. COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.user_progress IS 'Rastreia progresso de gamificação: XP, níveis, streaks, dias perfeitos';
COMMENT ON TABLE public.user_unlocks IS 'Itens desbloqueados: ícones, widgets, meditações, templates, jornadas';
COMMENT ON TABLE public.xp_events IS 'Histórico de eventos de XP para auditoria e analytics';

COMMENT ON FUNCTION public.add_xp IS 'Adiciona XP ao usuário, atualiza nível automaticamente e registra evento';
COMMENT ON FUNCTION public.update_streak IS 'Atualiza streak do usuário baseado na última atividade';
COMMENT ON FUNCTION public.check_unlock IS 'Verifica se usuário já desbloqueou determinado item';
COMMENT ON FUNCTION public.unlock_item IS 'Desbloqueia item para usuário (idempotente)';
