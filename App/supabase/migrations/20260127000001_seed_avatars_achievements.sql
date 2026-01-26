-- Seed Data: Avatars and Achievements Catalog
-- 20 avatares em 4 tiers de raridade
-- 15 achievements em 4 categorias

-- ============================================================================
-- 1. AVATARS CATALOG (20 avatares)
-- ============================================================================
-- Tiers: common (500 gems), rare (1000 gems), epic (1500 gems), legendary (2000 gems)

INSERT INTO public.avatars (id, name, emoji, tier, gem_cost, unlock_level, display_order) VALUES
  -- COMMON (5 avatares) - 500 gems ou unlock por nível
  ('smile_basic', 'Sorriso Básico', '😊', 'common', NULL, 1, 1),        -- Grátis inicial para todos
  ('star_eyes', 'Estrela nos Olhos', '🤩', 'common', 500, 2, 2),        -- Nível 2 ou 500 gems
  ('cool_shades', 'Óculos Escuros', '😎', 'common', 500, NULL, 3),      -- Apenas gems
  ('heart_eyes', 'Apaixonado', '😍', 'common', 500, NULL, 4),           -- Apenas gems
  ('thinking', 'Pensativo', '🤔', 'common', 500, NULL, 5),              -- Apenas gems

  -- RARE (7 avatares) - 1000 gems ou unlock por nível 4+
  ('fire_warrior', 'Guerreiro de Fogo', '🔥', 'rare', 1000, 4, 6),      -- Nível 4 ou 1000 gems
  ('rocket_boost', 'Foguete Turbo', '🚀', 'rare', 1000, NULL, 7),       -- Apenas gems
  ('trophy_winner', 'Campeão', '🏆', 'rare', 1000, 5, 8),               -- Nível 5 ou 1000 gems
  ('brain_power', 'Poder Mental', '🧠', 'rare', 1000, NULL, 9),         -- Apenas gems
  ('diamond_flex', 'Diamante Flex', '💎', 'rare', 1000, 6, 10),         -- Nível 6 ou 1000 gems
  ('lightning_fast', 'Raio Veloz', '⚡', 'rare', 1000, NULL, 11),       -- Apenas gems
  ('target_locked', 'Alvo Trancado', '🎯', 'rare', 1000, NULL, 12),     -- Apenas gems

  -- EPIC (5 avatares) - 1500 gems ou unlock por nível 7+
  ('crown_royalty', 'Realeza', '👑', 'epic', 1500, 7, 13),              -- Nível 7 ou 1500 gems
  ('unicorn_magic', 'Magia Unicórnio', '🦄', 'epic', 1500, NULL, 14),   -- Apenas gems
  ('dragon_master', 'Mestre Dragão', '🐉', 'epic', 1500, 8, 15),        -- Nível 8 ou 1500 gems
  ('ninja_stealth', 'Ninja Furtivo', '🥷', 'epic', 1500, NULL, 16),     -- Apenas gems
  ('wizard_sage', 'Sábio Mago', '🧙', 'epic', 1500, NULL, 17),          -- Apenas gems

  -- LEGENDARY (3 avatares) - 2000 gems ou unlock por nível 10
  ('phoenix_rebirth', 'Fênix Renascida', '🔥', 'legendary', 2000, NULL, 18),   -- Apenas gems (emoji especial)
  ('galaxy_brain', 'Cérebro Galáctico', '🌌', 'legendary', 2000, 10, 19),      -- Nível 10 ou 2000 gems
  ('zen_master', 'Mestre Zen', '🧘', 'legendary', 2000, NULL, 20)              -- Apenas gems
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  tier = EXCLUDED.tier,
  gem_cost = EXCLUDED.gem_cost,
  unlock_level = EXCLUDED.unlock_level,
  display_order = EXCLUDED.display_order;

-- ============================================================================
-- 2. ACHIEVEMENTS CATALOG (15 achievements em 4 categorias)
-- ============================================================================
-- Categorias: habits, streaks, levels, special
-- Tiers: common, uncommon, rare, epic, legendary

INSERT INTO public.achievements (id, name, description, emoji, category, tier, condition_type, condition_value, gem_reward, is_secret, display_order) VALUES
  -- CATEGORIA: HABITS (5 achievements)
  ('first_habit', 'Primeiro Passo', 'Complete seu primeiro hábito', '👣', 'habits', 'common', 'habit_count', 1, 50, false, 1),
  ('habit_10', 'Começando Forte', 'Complete 10 hábitos', '💪', 'habits', 'common', 'habit_count', 10, 100, false, 2),
  ('habit_50', 'Consistência Crescente', 'Complete 50 hábitos', '📈', 'habits', 'uncommon', 'habit_count', 50, 150, false, 3),
  ('habit_100', 'Centenário', 'Complete 100 hábitos', '💯', 'habits', 'rare', 'habit_count', 100, 200, false, 4),
  ('habit_500', 'Mestre dos Hábitos', 'Complete 500 hábitos', '🏆', 'habits', 'epic', 'habit_count', 500, 500, false, 5),

  -- CATEGORIA: STREAKS (5 achievements)
  ('streak_3', 'Aquecendo', 'Mantenha uma sequência de 3 dias', '🔥', 'streaks', 'common', 'streak_days', 3, 50, false, 6),
  ('streak_7', 'Uma Semana Forte', 'Mantenha uma sequência de 7 dias', '📅', 'streaks', 'uncommon', 'streak_days', 7, 100, false, 7),
  ('streak_30', 'Mês de Fogo', 'Mantenha uma sequência de 30 dias', '🔥', 'streaks', 'rare', 'streak_days', 30, 250, false, 8),
  ('streak_100', 'Inabalável', 'Mantenha uma sequência de 100 dias', '💎', 'streaks', 'epic', 'streak_days', 100, 500, false, 9),
  ('streak_365', 'Lendário', 'Mantenha uma sequência de 365 dias', '🌟', 'streaks', 'legendary', 'streak_days', 365, 1000, false, 10),

  -- CATEGORIA: LEVELS (3 achievements)
  ('level_5', 'Prata Brilhante', 'Alcance o nível 5 (Prata II)', '🥈', 'levels', 'uncommon', 'level_reached', 5, 150, false, 11),
  ('level_7', 'Ouro Reluzente', 'Alcance o nível 7 (Ouro I)', '🥇', 'levels', 'rare', 'level_reached', 7, 250, false, 12),
  ('level_10', 'Diamante Eterno', 'Alcance o nível 10 (Diamante)', '💎', 'levels', 'epic', 'level_reached', 10, 500, false, 13),

  -- CATEGORIA: SPECIAL (2 achievements - alguns secretos)
  ('perfect_week', 'Semana Perfeita', 'Complete 100% dos hábitos por 7 dias seguidos', '✨', 'special', 'rare', 'perfect_days', 7, 300, false, 14),
  ('early_bird', 'Madrugador Mestre', 'Complete 30 hábitos antes das 8h da manhã', '🌅', 'special', 'rare', 'early_completions', 30, 300, true, 15)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  category = EXCLUDED.category,
  tier = EXCLUDED.tier,
  condition_type = EXCLUDED.condition_type,
  condition_value = EXCLUDED.condition_value,
  gem_reward = EXCLUDED.gem_reward,
  is_secret = EXCLUDED.is_secret,
  display_order = EXCLUDED.display_order;

-- ============================================================================
-- 3. COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.avatars IS 'Catálogo de avatares desbloqueáveis. 20 avatares em 4 tiers de raridade.';
COMMENT ON TABLE public.achievements IS 'Catálogo de conquistas. 15 achievements em 4 categorias.';
