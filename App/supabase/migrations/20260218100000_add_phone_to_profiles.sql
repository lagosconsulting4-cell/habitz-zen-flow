-- Add phone column to profiles for WhatsApp integration
-- Reutiliza design de Doc/N8N Foquinha/01_add_phone_column.sql

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Formato do numero: codigo do pais + DDD + numero (sem espacos)
-- Exemplo Brasil: 5511987654321
