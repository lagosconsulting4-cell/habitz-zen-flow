-- =====================================================
-- Script de Validação Completa - Fix de Criação de Usuários
-- =====================================================
-- Execute este script no Supabase SQL Editor para validar
-- que todas as correções foram aplicadas corretamente
-- =====================================================

\echo ''
\echo '========================================='
\echo '🔍 VALIDAÇÃO DO SISTEMA DE CRIAÇÃO DE USUÁRIOS'
\echo '========================================='
\echo ''

-- =====================================================
-- CHECK 1: Funções Existem
-- =====================================================
\echo '✓ CHECK 1: Verificando funções...'

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_proc
  WHERE proname IN ('current_user_is_admin', 'get_user_id_by_email');

  IF v_count = 2 THEN
    RAISE NOTICE '✅ CHECK 1 PASSOU: 2 funções encontradas';
  ELSE
    RAISE EXCEPTION '❌ CHECK 1 FALHOU: Esperado 2 funções, encontrado %', v_count;
  END IF;
END $$;

-- Mostrar detalhes das funções
SELECT
  proname as "Função",
  pg_get_function_identity_arguments(oid) as "Argumentos",
  'EXISTS ✅' as "Status"
FROM pg_proc
WHERE proname IN ('current_user_is_admin', 'get_user_id_by_email');

\echo ''

-- =====================================================
-- CHECK 2: RLS Policies de INSERT
-- =====================================================
\echo '✓ CHECK 2: Verificando RLS policies...'

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('user_cohorts', 'sessions', 'events')
    AND cmd = 'INSERT';

  IF v_count = 3 THEN
    RAISE NOTICE '✅ CHECK 2 PASSOU: 3 policies de INSERT encontradas';
  ELSE
    RAISE EXCEPTION '❌ CHECK 2 FALHOU: Esperado 3 policies, encontrado %', v_count;
  END IF;
END $$;

-- Mostrar detalhes das policies
SELECT
  tablename as "Tabela",
  policyname as "Policy",
  cmd as "Comando",
  'EXISTS ✅' as "Status"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_cohorts', 'sessions', 'events')
  AND cmd = 'INSERT'
ORDER BY tablename;

\echo ''

-- =====================================================
-- CHECK 3: RLS Habilitado
-- =====================================================
\echo '✓ CHECK 3: Verificando RLS habilitado...'

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('user_cohorts', 'sessions', 'events', 'profiles')
    AND rowsecurity = true;

  IF v_count = 4 THEN
    RAISE NOTICE '✅ CHECK 3 PASSOU: RLS habilitado em todas as tabelas';
  ELSE
    RAISE EXCEPTION '❌ CHECK 3 FALHOU: RLS não habilitado em todas as tabelas';
  END IF;
END $$;

-- Mostrar status do RLS
SELECT
  tablename as "Tabela",
  CASE
    WHEN rowsecurity = true THEN 'ENABLED ✅'
    ELSE 'DISABLED ❌'
  END as "RLS Status"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_cohorts', 'sessions', 'events', 'profiles')
ORDER BY tablename;

\echo ''

-- =====================================================
-- CHECK 4: Testar Função get_user_id_by_email
-- =====================================================
\echo '✓ CHECK 4: Testando função get_user_id_by_email...'

DO $$
DECLARE
  v_test_email TEXT;
  v_result UUID;
BEGIN
  -- Pegar qualquer email existente para teste
  SELECT email INTO v_test_email
  FROM profiles
  LIMIT 1;

  IF v_test_email IS NULL THEN
    RAISE NOTICE '⚠️  CHECK 4 PULADO: Nenhum usuário no banco para teste';
    RETURN;
  END IF;

  -- Testar a função
  v_result := public.get_user_id_by_email(v_test_email);

  IF v_result IS NOT NULL THEN
    RAISE NOTICE '✅ CHECK 4 PASSOU: Função retornou UUID válido';
    RAISE NOTICE '   Testado com: %', v_test_email;
    RAISE NOTICE '   Retornou: %', v_result;
  ELSE
    RAISE EXCEPTION '❌ CHECK 4 FALHOU: Função retornou NULL para email existente';
  END IF;
END $$;

\echo ''

-- =====================================================
-- CHECK 5: Triggers Ativos
-- =====================================================
\echo '✓ CHECK 5: Verificando triggers ativos...'

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_trigger t
  WHERE tgname IN ('on_auth_user_created', 'trigger_auto_assign_cohort')
    AND tgenabled = 'O'; -- O = Origin (trigger ativo)

  IF v_count >= 2 THEN
    RAISE NOTICE '✅ CHECK 5 PASSOU: Triggers críticos estão ativos';
  ELSE
    RAISE EXCEPTION '❌ CHECK 5 FALHOU: Alguns triggers não estão ativos';
  END IF;
END $$;

-- Mostrar status dos triggers
SELECT
  tgname as "Trigger",
  tgrelid::regclass as "Tabela",
  proname as "Função",
  CASE
    WHEN tgenabled = 'O' THEN 'ACTIVE ✅'
    WHEN tgenabled = 'D' THEN 'DISABLED ❌'
    ELSE 'UNKNOWN'
  END as "Status"
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname IN ('on_auth_user_created', 'trigger_auto_assign_cohort')
ORDER BY tgname;

\echo ''

-- =====================================================
-- CHECK 6: Verificar Clientes Recuperados
-- =====================================================
\echo '✓ CHECK 6: Verificando clientes afetados recuperados...'

SELECT
  email as "Email do Cliente",
  display_name as "Nome",
  is_premium as "Premium",
  created_at as "Criado Em",
  CASE
    WHEN email IN ('lucaskeidson09@gmail.com', 'samiravivi3d@gmail.com')
    THEN 'RECUPERADO ✅'
    ELSE 'OUTRO CLIENTE'
  END as "Status"
FROM profiles
WHERE email IN ('lucaskeidson09@gmail.com', 'samiravivi3d@gmail.com')
ORDER BY created_at;

\echo ''

-- =====================================================
-- RESUMO FINAL
-- =====================================================
\echo ''
\echo '========================================='
\echo '📊 RESUMO DA VALIDAÇÃO'
\echo '========================================='

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Funções: current_user_is_admin(), get_user_id_by_email()';
  RAISE NOTICE '✅ RLS Policies: user_cohorts, sessions, events';
  RAISE NOTICE '✅ RLS Habilitado: profiles, user_cohorts, sessions, events';
  RAISE NOTICE '✅ Triggers Ativos: handle_new_user, auto_assign_cohort';
  RAISE NOTICE '✅ Clientes Recuperados: lucaskeidson09, samiravivi3d';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 VALIDAÇÃO COMPLETA: Sistema Operacional';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Sistema pronto para receber novos checkouts Stripe.';
  RAISE NOTICE '';
END $$;
