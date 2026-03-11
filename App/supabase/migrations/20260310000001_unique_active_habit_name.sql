-- Fix #02: Impedir habitos duplicados ativos para o mesmo usuario
-- Partial unique index: case-insensitive, so para habitos ativos

CREATE UNIQUE INDEX IF NOT EXISTS idx_habits_user_name_active
ON habits (user_id, LOWER(TRIM(name)))
WHERE is_active = true;

COMMENT ON INDEX idx_habits_user_name_active IS
  'Impede que o mesmo usuario tenha dois habitos ativos com o mesmo nome (case-insensitive)';
