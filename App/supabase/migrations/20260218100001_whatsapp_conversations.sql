-- Create whatsapp_conversations table for multi-turn state management
-- Reutiliza design de Doc/N8N Foquinha/07_whatsapp_conversations_table.sql

DO $$
BEGIN
  CREATE TYPE public.whatsapp_message_role AS ENUM ('user', 'assistant');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  phone TEXT NOT NULL UNIQUE,
  messages JSONB DEFAULT '[]'::jsonb,
  pending_action TEXT,
  pending_data JSONB DEFAULT '{}'::jsonb,
  awaiting_input TEXT,
  last_interaction TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_phone
  ON public.whatsapp_conversations(phone);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_user_id
  ON public.whatsapp_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_last_interaction
  ON public.whatsapp_conversations(last_interaction DESC);

CREATE OR REPLACE FUNCTION public.update_whatsapp_conversations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_whatsapp_conversations_updated_at ON public.whatsapp_conversations;
CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_whatsapp_conversations_timestamp();
