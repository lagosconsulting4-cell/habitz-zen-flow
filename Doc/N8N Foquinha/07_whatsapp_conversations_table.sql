-- Criar tabela whatsapp_conversations para gerenciar state de conversas multi-turno
-- Autor: Claude Code Assistant
-- Data: 2025-12-01

-- Enum para facilitar controle de tipos de dados no Postgres
DO $$
BEGIN
  CREATE TYPE public.whatsapp_message_role AS ENUM ('user', 'assistant');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

-- Tabela principal: whatsapp_conversations
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referência ao usuário (optional - pode ser null se não registrado)
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,

  -- Identificador único: número do WhatsApp
  phone TEXT NOT NULL UNIQUE,

  -- Histórico de mensagens (JSONB array com role e content)
  -- Formato: [{ "role": "user|assistant", "content": "...", "timestamp": "2025-12-01T..." }]
  messages JSONB DEFAULT '[]'::jsonb,

  -- Estado pendente para ações multi-turno
  -- Ex: "create_habit", "edit_habit", "complete_habit"
  pending_action TEXT,

  -- Dados parciais coletados durante ação pendente
  -- Ex: {"name": "Yoga", "period": "morning"}
  pending_data JSONB DEFAULT '{}'::jsonb,

  -- O que a IA está aguardando do usuário
  -- Ex: "period", "confirmation", "name"
  awaiting_input TEXT,

  -- Metadata
  last_interaction TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_phone
  ON public.whatsapp_conversations(phone);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_user_id
  ON public.whatsapp_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_last_interaction
  ON public.whatsapp_conversations(last_interaction DESC);

-- Políticas RLS (Row Level Security) - opcional, para segurança
-- ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can only see their own conversations"
--   ON public.whatsapp_conversations
--   FOR SELECT
--   USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_whatsapp_conversations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_whatsapp_conversations_timestamp();

-- Verificação
SELECT
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'whatsapp_conversations';
