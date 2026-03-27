-- Backfill: Enable push reminders for all journey-sourced habits.
-- Previously, journey habits were created with reminder_enabled=false,
-- which caused the habit-reminder-scheduler to skip them entirely.

UPDATE habits
SET notification_pref = jsonb_set(
  COALESCE(notification_pref, '{}'::jsonb),
  '{reminder_enabled}',
  'true'
)
WHERE source = 'journey'
  AND (
    notification_pref IS NULL
    OR (notification_pref->>'reminder_enabled')::boolean IS NOT TRUE
  );
