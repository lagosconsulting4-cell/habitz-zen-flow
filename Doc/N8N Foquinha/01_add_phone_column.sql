-- =============================================
-- Habitz WhatsApp Integration
-- Step 1: Add phone column to profiles table
-- =============================================

-- Adicionar coluna phone na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;

-- Criar índice para buscas rápidas por telefone
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- =============================================
-- IMPORTANTE: Inserir números de teste manualmente
-- =============================================

-- Exemplo de como vincular um número a um usuário existente:
-- UPDATE profiles SET phone = '5511999999999' WHERE user_id = 'uuid-do-usuario';

-- Formato do número: código do país + DDD + número (sem espaços ou caracteres especiais)
-- Exemplo Brasil: 5511987654321
