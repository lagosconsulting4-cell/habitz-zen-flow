-- Add last_user_message to track when the USER last sent a message (not bot).
-- This is needed because last_interaction gets reset by proactive bot messages
-- (reminders, nudges), which prevents the 22h nudge from ever triggering.

ALTER TABLE whatsapp_conversations
ADD COLUMN IF NOT EXISTS last_user_message timestamptz;

-- Backfill: use last_interaction as baseline
UPDATE whatsapp_conversations
SET last_user_message = last_interaction
WHERE last_user_message IS NULL;
