-- Fix #27: Add opted_out column to whatsapp_conversations
-- When a user requests cancellation ("quero cancelar"), the Foquinha chatbot
-- sets opted_out = true, which filters the user from all outbound pipelines
-- (reminders, nudges, reports, reengagement).

ALTER TABLE whatsapp_conversations
ADD COLUMN IF NOT EXISTS opted_out BOOLEAN DEFAULT false;

COMMENT ON COLUMN whatsapp_conversations.opted_out IS 'User requested to stop receiving messages. Set via chatbot cancellation intent.';
