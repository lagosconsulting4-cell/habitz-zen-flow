-- Gamification Extended: Gems, Avatars, Achievements, Streak Freezes
-- Extensão do sistema de gamificação existente com economia virtual
-- Baseado no modelo Duolingo: moeda virtual, avatares desbloqueáveis, conquistas e proteção de streaks

-- ============================================================================
-- 1. USER GEMS TABLE
-- ============================================================================
-- Sistema de moeda virtual para economia interna

CREATE TABLE IF NOT EXISTS public.user_gems (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Saldo e histórico
  current_gems integer NOT NULL DEFAULT 0 CHECK (current_gems >= 0),
  lifetime_gems_earned integer NOT NULL DEFAULT 0 CHECK (lifetime_gems_earned >= 0),
  lifetime_gems_spent integer NOT NULL DEFAULT 0 CHECK (lifetime_gems_spent >= 0),

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para queries rápidas
CREATE INDEX IF NOT EXISTS user_gems_user_id_idx ON public.user_gems (user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_gems_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_gems_updated_at ON public.user_gems;
CREATE TRIGGER user_gems_updated_at
  BEFORE UPDATE ON public.user_gems
  FOR EACH ROW
  EXECUTE FUNCTION update_user_gems_updated_at();

-- ============================================================================
-- 2. GEM TRANSACTIONS TABLE
-- ============================================================================
-- Audit trail completo de todas as transações de gems

CREATE TABLE IF NOT EXISTS public.gem_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Detalhes da transação
  amount integer NOT NULL, -- Positivo = ganho, negativo = gasto
  transaction_type text NOT NULL, -- habit_complete, level_up, purchase_avatar, purchase_freeze, achievement_unlock, etc.

  -- Contexto opcional
  related_entity_type text, -- avatar, streak_freeze, achievement, habit
  related_entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para queries e analytics
CREATE INDEX IF NOT EXISTS gem_transactions_user_id_idx ON public.gem_transactions (user_id);
CREATE INDEX IF NOT EXISTS gem_transactions_created_at_idx ON public.gem_transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS gem_transactions_user_date_idx ON public.gem_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS gem_transactions_type_idx ON public.gem_transactions (transaction_type);

-- ============================================================================
-- 3. AVATARS TABLE (Catálogo)
-- ============================================================================
-- Catálogo de avatares desbloqueáveis com sistema de raridade

CREATE TABLE IF NOT EXISTS public.avatars (
  id text PRIMARY KEY,

  -- Identificação
  name text NOT NULL,
  emoji text NOT NULL,
  description text,

  -- Raridade e custo
  tier text NOT NULL CHECK (tier IN ('common', 'rare', 'epic', 'legendary')),
  gem_cost integer, -- NULL = não comprável com gems
  unlock_level integer, -- NULL = não desbloqueia por nível
  unlock_achievement_id text, -- NULL = não requer achievement

  -- Configurações
  is_starter boolean NOT NULL DEFAULT false, -- Avatar inicial gratuito
  is_premium_exclusive boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para queries
CREATE INDEX IF NOT EXISTS avatars_tier_idx ON public.avatars (tier, display_order);
CREATE INDEX IF NOT EXISTS avatars_display_order_idx ON public.avatars (display_order);

-- ============================================================================
-- 4. USER AVATARS TABLE
-- ============================================================================
-- Avatares desbloqueados pelo usuário + qual está equipado

CREATE TABLE IF NOT EXISTS public.user_avatars (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_id text NOT NULL REFERENCES public.avatars(id) ON DELETE CASCADE,

  -- Status
  is_equipped boolean NOT NULL DEFAULT false,
  unlocked_at timestamptz NOT NULL DEFAULT now(),

  -- Chave primária composta
  PRIMARY KEY (user_id, avatar_id)
);

-- Índices para queries
CREATE INDEX IF NOT EXISTS user_avatars_user_id_idx ON public.user_avatars (user_id);
CREATE INDEX IF NOT EXISTS user_avatars_equipped_idx ON public.user_avatars (user_id) WHERE is_equipped = true;

-- ============================================================================
-- 5. ACHIEVEMENTS TABLE (Catálogo)
-- ============================================================================
-- Catálogo de conquistas com condições e recompensas

CREATE TABLE IF NOT EXISTS public.achievements (
  id text PRIMARY KEY,

  -- Identificação
  name text NOT NULL,
  description text NOT NULL,
  emoji text NOT NULL,

  -- Categorização
  category text NOT NULL CHECK (category IN ('habits', 'streaks', 'levels', 'special')),
  tier text NOT NULL CHECK (tier IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),

  -- Condição de desbloqueio
  condition_type text NOT NULL, -- habit_count, streak_days, perfect_days, level_reached, early_completions
  condition_value integer NOT NULL,

  -- Recompensa
  gem_reward integer NOT NULL DEFAULT 0,

  -- Configurações
  is_secret boolean NOT NULL DEFAULT false, -- Achievements secretos não mostram condição até desbloquear
  display_order integer NOT NULL DEFAULT 0,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para queries
CREATE INDEX IF NOT EXISTS achievements_category_idx ON public.achievements (category, display_order);
CREATE INDEX IF NOT EXISTS achievements_tier_idx ON public.achievements (tier);
CREATE INDEX IF NOT EXISTS achievements_display_order_idx ON public.achievements (display_order);

-- ============================================================================
-- 6. USER ACHIEVEMENTS TABLE
-- ============================================================================
-- Conquistas desbloqueadas pelo usuário

CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,

  -- Snapshot do progresso no momento do desbloqueio
  progress_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamp
  unlocked_at timestamptz NOT NULL DEFAULT now(),

  -- Chave primária composta
  PRIMARY KEY (user_id, achievement_id)
);

-- Índices para queries
CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON public.user_achievements (user_id);
CREATE INDEX IF NOT EXISTS user_achievements_unlocked_at_idx ON public.user_achievements (unlocked_at DESC);

-- ============================================================================
-- 7. USER STREAK FREEZES TABLE
-- ============================================================================
-- Inventário de streak freezes do usuário

CREATE TABLE IF NOT EXISTS public.user_streak_freezes (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Inventário
  available_freezes integer NOT NULL DEFAULT 1 CHECK (available_freezes >= 0), -- Começa com 1 grátis
  total_freezes_earned integer NOT NULL DEFAULT 1 CHECK (total_freezes_earned >= 0),
  total_freezes_used integer NOT NULL DEFAULT 0 CHECK (total_freezes_used >= 0),

  -- Controle de freeze mensal grátis
  last_free_freeze_date date NOT NULL DEFAULT CURRENT_DATE,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_streak_freezes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_streak_freezes_updated_at ON public.user_streak_freezes;
CREATE TRIGGER user_streak_freezes_updated_at
  BEFORE UPDATE ON public.user_streak_freezes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak_freezes_updated_at();

-- ============================================================================
-- 8. STREAK FREEZE EVENTS TABLE
-- ============================================================================
-- Histórico de uso e obtenção de streak freezes

CREATE TABLE IF NOT EXISTS public.streak_freeze_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Detalhes do evento
  event_type text NOT NULL CHECK (event_type IN ('earned', 'purchased', 'used')),
  source text NOT NULL, -- monthly_free, level_up, gem_purchase, manual_use

  -- Para eventos 'used'
  protected_date date,

  -- Metadados extras
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para queries
CREATE INDEX IF NOT EXISTS streak_freeze_events_user_id_idx ON public.streak_freeze_events (user_id);
CREATE INDEX IF NOT EXISTS streak_freeze_events_created_at_idx ON public.streak_freeze_events (created_at DESC);
CREATE INDEX IF NOT EXISTS streak_freeze_events_user_date_idx ON public.streak_freeze_events (user_id, created_at DESC);

-- ============================================================================
-- 9. MODIFICAÇÃO NA TABELA PROFILES
-- ============================================================================
-- Adicionar coluna para avatar equipado (denormalizado para performance)

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS equipped_avatar_emoji text DEFAULT '😊';

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.user_gems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gem_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streak_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_freeze_events ENABLE ROW LEVEL SECURITY;

-- Políticas para user_gems
CREATE POLICY "Users can view own gems"
  ON public.user_gems FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gems"
  ON public.user_gems FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gems"
  ON public.user_gems FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para gem_transactions
CREATE POLICY "Users can view own gem transactions"
  ON public.gem_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gem transactions"
  ON public.gem_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para avatars (catálogo público para autenticados)
CREATE POLICY "Anyone can view avatars"
  ON public.avatars FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para user_avatars
CREATE POLICY "Users can view own avatars"
  ON public.user_avatars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own avatars"
  ON public.user_avatars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avatars"
  ON public.user_avatars FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para achievements (catálogo público para autenticados)
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para user_achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para user_streak_freezes
CREATE POLICY "Users can view own streak freezes"
  ON public.user_streak_freezes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak freezes"
  ON public.user_streak_freezes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak freezes"
  ON public.user_streak_freezes FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para streak_freeze_events
CREATE POLICY "Users can view own streak freeze events"
  ON public.streak_freeze_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak freeze events"
  ON public.streak_freeze_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 11. HELPER FUNCTIONS
-- ============================================================================

-- Função para adicionar gems com validação e audit trail
CREATE OR REPLACE FUNCTION public.add_gems(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_related_entity_type text DEFAULT NULL,
  p_related_entity_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  new_balance integer,
  transaction_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
  v_transaction_id uuid;
BEGIN
  -- Criar registro de gems se não existir
  INSERT INTO user_gems (user_id, current_gems, lifetime_gems_earned, lifetime_gems_spent)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Atualizar saldo (com lock para evitar race conditions)
  UPDATE user_gems
  SET
    current_gems = current_gems + p_amount,
    lifetime_gems_earned = CASE WHEN p_amount > 0 THEN lifetime_gems_earned + p_amount ELSE lifetime_gems_earned END,
    lifetime_gems_spent = CASE WHEN p_amount < 0 THEN lifetime_gems_spent + ABS(p_amount) ELSE lifetime_gems_spent END,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING current_gems INTO v_new_balance;

  -- Validar que o saldo não ficou negativo
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient gems. Current balance would be %', v_new_balance
      USING ERRCODE = 'insufficient_funds';
  END IF;

  -- Criar registro de transação
  INSERT INTO gem_transactions (user_id, amount, transaction_type, related_entity_type, related_entity_id, metadata)
  VALUES (p_user_id, p_amount, p_transaction_type, p_related_entity_type, p_related_entity_id, p_metadata)
  RETURNING id INTO v_transaction_id;

  -- Retornar novo saldo e ID da transação
  RETURN QUERY SELECT v_new_balance, v_transaction_id;
END;
$$;

-- Função para desbloquear avatar
CREATE OR REPLACE FUNCTION public.unlock_avatar(
  p_user_id uuid,
  p_avatar_id text,
  p_auto_equip boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_already_unlocked boolean;
BEGIN
  -- Verificar se já desbloqueou
  SELECT EXISTS(
    SELECT 1 FROM user_avatars
    WHERE user_id = p_user_id AND avatar_id = p_avatar_id
  ) INTO v_already_unlocked;

  IF v_already_unlocked THEN
    RETURN false; -- Já tinha, não fez nada
  END IF;

  -- Se auto_equip, desequipar outros primeiro
  IF p_auto_equip THEN
    UPDATE user_avatars
    SET is_equipped = false
    WHERE user_id = p_user_id AND is_equipped = true;
  END IF;

  -- Desbloquear avatar
  INSERT INTO user_avatars (user_id, avatar_id, is_equipped)
  VALUES (p_user_id, p_avatar_id, p_auto_equip)
  ON CONFLICT (user_id, avatar_id) DO NOTHING;

  RETURN true; -- Novo desbloqueio
END;
$$;

-- Função para equipar avatar
CREATE OR REPLACE FUNCTION public.equip_avatar(
  p_user_id uuid,
  p_avatar_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_emoji text;
BEGIN
  -- Verificar se o avatar está desbloqueado
  IF NOT EXISTS(SELECT 1 FROM user_avatars WHERE user_id = p_user_id AND avatar_id = p_avatar_id) THEN
    RAISE EXCEPTION 'Avatar not unlocked'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Desequipar todos os avatares do usuário
  UPDATE user_avatars
  SET is_equipped = false
  WHERE user_id = p_user_id;

  -- Equipar o avatar escolhido
  UPDATE user_avatars
  SET is_equipped = true
  WHERE user_id = p_user_id AND avatar_id = p_avatar_id;

  -- Buscar emoji do avatar
  SELECT emoji INTO v_emoji FROM avatars WHERE id = p_avatar_id;

  -- Atualizar perfil com o emoji (denormalizado para performance)
  UPDATE profiles
  SET equipped_avatar_emoji = v_emoji
  WHERE user_id = p_user_id;
END;
$$;

-- Função para desbloquear achievement e dar gems automaticamente
CREATE OR REPLACE FUNCTION public.unlock_achievement(
  p_user_id uuid,
  p_achievement_id text,
  p_progress_snapshot jsonb DEFAULT '{}'::jsonb
)
RETURNS integer -- Retorna gems ganhas (0 se já desbloqueado)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gem_reward integer;
  v_already_unlocked boolean;
BEGIN
  -- Verificar se já desbloqueou
  SELECT EXISTS(
    SELECT 1 FROM user_achievements
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id
  ) INTO v_already_unlocked;

  IF v_already_unlocked THEN
    RETURN 0; -- Já tinha, não dá gems
  END IF;

  -- Buscar recompensa em gems
  SELECT gem_reward INTO v_gem_reward
  FROM achievements
  WHERE id = p_achievement_id;

  IF v_gem_reward IS NULL THEN
    RAISE EXCEPTION 'Achievement not found: %', p_achievement_id
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Desbloquear achievement
  INSERT INTO user_achievements (user_id, achievement_id, progress_snapshot)
  VALUES (p_user_id, p_achievement_id, p_progress_snapshot)
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  -- Dar gems automaticamente (se houver recompensa)
  IF v_gem_reward > 0 THEN
    PERFORM add_gems(
      p_user_id,
      v_gem_reward,
      'achievement_unlock',
      'achievement',
      p_achievement_id,
      jsonb_build_object('achievement_id', p_achievement_id, 'gem_reward', v_gem_reward)
    );
  END IF;

  RETURN v_gem_reward;
END;
$$;

-- Função para usar streak freeze
CREATE OR REPLACE FUNCTION public.use_streak_freeze(
  p_user_id uuid,
  p_protected_date date DEFAULT CURRENT_DATE
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available integer;
BEGIN
  -- Verificar se tem freeze disponível
  SELECT available_freezes INTO v_available
  FROM user_streak_freezes
  WHERE user_id = p_user_id;

  IF v_available IS NULL OR v_available < 1 THEN
    RAISE EXCEPTION 'No streak freezes available'
      USING ERRCODE = 'insufficient_funds';
  END IF;

  -- Deduzir freeze do inventário
  UPDATE user_streak_freezes
  SET
    available_freezes = available_freezes - 1,
    total_freezes_used = total_freezes_used + 1,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Registrar evento de uso
  INSERT INTO streak_freeze_events (user_id, event_type, source, protected_date)
  VALUES (p_user_id, 'used', 'manual_use', p_protected_date);

  RETURN true;
END;
$$;

-- Função para comprar streak freeze com gems
CREATE OR REPLACE FUNCTION public.purchase_streak_freeze(
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_freeze_cost integer := 200; -- Custo fixo em gems
BEGIN
  -- Deduzir gems (função add_gems já valida se tem saldo)
  PERFORM add_gems(
    p_user_id,
    -v_freeze_cost,
    'purchase_streak_freeze',
    'streak_freeze',
    NULL,
    jsonb_build_object('cost', v_freeze_cost)
  );

  -- Criar registro de freezes se não existir
  INSERT INTO user_streak_freezes (user_id, available_freezes, total_freezes_earned)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Adicionar freeze ao inventário
  UPDATE user_streak_freezes
  SET
    available_freezes = available_freezes + 1,
    total_freezes_earned = total_freezes_earned + 1,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Registrar evento de compra
  INSERT INTO streak_freeze_events (user_id, event_type, source, metadata)
  VALUES (p_user_id, 'purchased', 'gem_purchase', jsonb_build_object('cost', v_freeze_cost));

  RETURN true;
END;
$$;

-- ============================================================================
-- 12. GRANTS
-- ============================================================================

-- Conceder acesso às funções para usuários autenticados
GRANT EXECUTE ON FUNCTION public.add_gems(uuid, integer, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_avatar(uuid, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.equip_avatar(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_achievement(uuid, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_streak_freeze(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_streak_freeze(uuid) TO authenticated;

-- ============================================================================
-- 13. COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.user_gems IS 'Saldo de moeda virtual (gems) do usuário';
COMMENT ON TABLE public.gem_transactions IS 'Histórico de transações de gems para auditoria';
COMMENT ON TABLE public.avatars IS 'Catálogo de avatares desbloqueáveis';
COMMENT ON TABLE public.user_avatars IS 'Avatares desbloqueados pelo usuário';
COMMENT ON TABLE public.achievements IS 'Catálogo de conquistas';
COMMENT ON TABLE public.user_achievements IS 'Conquistas desbloqueadas pelo usuário';
COMMENT ON TABLE public.user_streak_freezes IS 'Inventário de streak freezes do usuário';
COMMENT ON TABLE public.streak_freeze_events IS 'Histórico de uso e obtenção de streak freezes';

COMMENT ON FUNCTION public.add_gems IS 'Adiciona/remove gems com validação e audit trail';
COMMENT ON FUNCTION public.unlock_avatar IS 'Desbloqueia avatar para usuário (idempotente)';
COMMENT ON FUNCTION public.equip_avatar IS 'Equipa avatar desbloqueado';
COMMENT ON FUNCTION public.unlock_achievement IS 'Desbloqueia achievement e dá gems automaticamente';
COMMENT ON FUNCTION public.use_streak_freeze IS 'Usa um streak freeze para proteger a sequência';
COMMENT ON FUNCTION public.purchase_streak_freeze IS 'Compra streak freeze com gems';
