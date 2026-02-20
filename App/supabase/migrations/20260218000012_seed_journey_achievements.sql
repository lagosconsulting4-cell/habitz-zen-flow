-- ============================================
-- Add 'journey' category to achievements + seed journey achievements
-- ============================================

-- 1. Extend category CHECK constraint to include 'journey'
ALTER TABLE public.achievements DROP CONSTRAINT IF EXISTS achievements_category_check;
ALTER TABLE public.achievements ADD CONSTRAINT achievements_category_check
  CHECK (category IN ('habits', 'streaks', 'levels', 'special', 'journey'));

-- 2. Seed 6 journey achievements
INSERT INTO public.achievements (id, name, description, emoji, category, tier, condition_type, condition_value, gem_reward, is_secret, display_order) VALUES
  ('journey_explorer',    'Explorador',   'Comece sua primeira jornada',                    '🧭', 'journey', 'common',    'journey_started',       1,   50,  false, 16),
  ('journey_phase',       'Desbravador',  'Complete uma fase inteira de uma jornada',        '🏅', 'journey', 'uncommon',  'journey_phase_complete', 1,  100, false, 17),
  ('journey_l1_complete', 'Veterano',     'Complete uma jornada Nível 1',                    '🎓', 'journey', 'rare',      'journey_l1_complete',    1,  200, false, 18),
  ('journey_l2_complete', 'Mestre',       'Complete uma jornada Nível 2',                    '👑', 'journey', 'epic',      'journey_l2_complete',    1,  400, false, 19),
  ('journey_polymata',    'Polímata',     'Complete 3 jornadas Nível 1 diferentes',          '🌟', 'journey', 'epic',      'journey_l1_complete',    3,  500, false, 20),
  ('journey_completist',  'Completista',  'Complete todas as 5 jornadas Nível 1',            '💎', 'journey', 'legendary', 'journey_l1_complete',    5, 1000, false, 21)
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
