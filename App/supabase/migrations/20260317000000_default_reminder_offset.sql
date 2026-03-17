-- Backfill: definir reminder_offset_minutes = 10 para users que nao configuraram
-- Nao cria coluna nova — apenas popula o JSONB existente em notification_preferences
UPDATE user_progress
SET notification_preferences = COALESCE(notification_preferences, '{}'::jsonb)
  || '{"reminder_offset_minutes": 10}'::jsonb
WHERE notification_preferences->>'reminder_offset_minutes' IS NULL;
