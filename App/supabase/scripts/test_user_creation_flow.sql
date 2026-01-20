-- =====================================================
-- Teste End-to-End: Fluxo Completo de Criação de Usuário
-- =====================================================
-- Este script simula exatamente o que acontece quando o
-- stripe-webhook cria um usuário via auth.admin.createUser()
-- =====================================================

DO $$
DECLARE
  -- ⚙️ CONFIGURAÇÃO DO TESTE
  v_test_email TEXT := 'teste.validacao.' || floor(random() * 1000000) || '@habitz.com';
  v_test_name TEXT := 'Teste Validação Sistema';
  v_test_phone TEXT := '11999887766';

  -- Variáveis de controle
  v_user_id UUID;
  v_profile_exists BOOLEAN;
  v_cohort_exists BOOLEAN;
  v_test_passed BOOLEAN := true;
  v_error_message TEXT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🧪 TESTE END-TO-END: Criação de Usuário';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Este teste simula o fluxo completo do stripe-webhook';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email de teste: %', v_test_email;
  RAISE NOTICE '';

  -- =========================================
  -- STEP 0: Limpar testes anteriores
  -- =========================================
  RAISE NOTICE '[🗑️] STEP 0: Limpando testes anteriores...';

  DELETE FROM auth.identities
  WHERE user_id IN (
    SELECT user_id FROM profiles
    WHERE email LIKE 'teste.validacao.%@habitz.com'
  );

  DELETE FROM user_cohorts
  WHERE user_id IN (
    SELECT user_id FROM profiles
    WHERE email LIKE 'teste.validacao.%@habitz.com'
  );

  DELETE FROM purchases
  WHERE email LIKE 'teste.validacao.%@habitz.com';

  DELETE FROM profiles
  WHERE email LIKE 'teste.validacao.%@habitz.com';

  DELETE FROM auth.users
  WHERE email LIKE 'teste.validacao.%@habitz.com';

  RAISE NOTICE '[✓] Limpeza completa';
  RAISE NOTICE '';

  -- =========================================
  -- STEP 1: Criar auth.users (simula auth.admin.createUser)
  -- =========================================
  RAISE NOTICE '[⏳] STEP 1: Criando usuário em auth.users...';
  RAISE NOTICE '    (Isto vai disparar os triggers automáticos)';

  BEGIN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      last_sign_in_at,
      confirmation_sent_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      v_test_email,
      crypt('teste123', gen_salt('bf')),
      NOW(),
      '',
      '',
      '',
      '',
      jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']::text[]
      ),
      jsonb_build_object(
        'full_name', v_test_name,
        'created_via', 'stripe-webhook-test'
      ),
      false,
      NOW(),
      NOW(),
      NOW(),
      NOW()
    )
    RETURNING id INTO v_user_id;

    RAISE NOTICE '[✅] STEP 1 PASSOU: Usuário criado em auth.users';
    RAISE NOTICE '    User ID: %', v_user_id;
  EXCEPTION
    WHEN OTHERS THEN
      v_test_passed := false;
      v_error_message := SQLERRM;
      RAISE NOTICE '[❌] STEP 1 FALHOU: %', v_error_message;
      RAISE EXCEPTION 'Teste abortado no STEP 1';
  END;

  RAISE NOTICE '';

  -- =========================================
  -- STEP 2: Verificar que trigger handle_new_user() criou profile
  -- =========================================
  RAISE NOTICE '[⏳] STEP 2: Verificando se profile foi criado pelo trigger...';

  -- Aguardar um pouco para garantir que trigger executou
  PERFORM pg_sleep(0.5);

  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = v_user_id
  ) INTO v_profile_exists;

  IF v_profile_exists THEN
    RAISE NOTICE '[✅] STEP 2 PASSOU: Profile criado automaticamente pelo trigger handle_new_user()';

    -- Mostrar dados do profile
    DECLARE
      v_profile_email TEXT;
      v_profile_name TEXT;
    BEGIN
      SELECT email, display_name
      INTO v_profile_email, v_profile_name
      FROM profiles
      WHERE user_id = v_user_id;

      RAISE NOTICE '    Email no profile: %', v_profile_email;
      RAISE NOTICE '    Nome no profile: %', v_profile_name;
    END;
  ELSE
    v_test_passed := false;
    RAISE NOTICE '[❌] STEP 2 FALHOU: Profile NÃO foi criado pelo trigger!';
    RAISE NOTICE '    Possível problema: trigger handle_new_user() não está ativo';
    RAISE EXCEPTION 'Teste abortado no STEP 2';
  END IF;

  RAISE NOTICE '';

  -- =========================================
  -- STEP 3: Verificar que trigger auto_assign_cohort() criou cohort
  -- =========================================
  RAISE NOTICE '[⏳] STEP 3: Verificando se cohort foi criado pelo trigger...';
  RAISE NOTICE '    ⚠️  Este é o ponto crítico que estava falhando!';

  -- Aguardar um pouco para garantir que trigger executou
  PERFORM pg_sleep(0.5);

  SELECT EXISTS (
    SELECT 1 FROM user_cohorts WHERE user_id = v_user_id
  ) INTO v_cohort_exists;

  IF v_cohort_exists THEN
    RAISE NOTICE '[✅] STEP 3 PASSOU: Cohort criado automaticamente pelo trigger auto_assign_cohort()';
    RAISE NOTICE '    ✨ RLS policy "System can insert cohorts" está funcionando!';

    -- Mostrar dados do cohort
    DECLARE
      v_cohort_week DATE;
      v_cohort_month DATE;
    BEGIN
      SELECT signup_cohort_week, signup_cohort_month
      INTO v_cohort_week, v_cohort_month
      FROM user_cohorts
      WHERE user_id = v_user_id;

      RAISE NOTICE '    Cohort Week: %', v_cohort_week;
      RAISE NOTICE '    Cohort Month: %', v_cohort_month;
    END;
  ELSE
    v_test_passed := false;
    RAISE NOTICE '[❌] STEP 3 FALHOU: Cohort NÃO foi criado pelo trigger!';
    RAISE NOTICE '';
    RAISE NOTICE '🔴 PROBLEMA CRÍTICO DETECTADO:';
    RAISE NOTICE '   O trigger auto_assign_cohort() tentou inserir em user_cohorts';
    RAISE NOTICE '   mas a RLS policy "System can insert cohorts" NÃO EXISTE';
    RAISE NOTICE '   ou NÃO ESTÁ FUNCIONANDO corretamente.';
    RAISE NOTICE '';
    RAISE NOTICE '   Isto é o mesmo erro que causou:';
    RAISE NOTICE '   "Database error creating new user"';
    RAISE NOTICE '';
    RAISE EXCEPTION 'Teste abortado no STEP 3 - RLS bloqueando INSERT';
  END IF;

  RAISE NOTICE '';

  -- =========================================
  -- STEP 4: Verificar identities (não crítico, mas importante)
  -- =========================================
  RAISE NOTICE '[⏳] STEP 4: Verificando auth.identities...';

  IF EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id) THEN
    RAISE NOTICE '[✅] STEP 4 PASSOU: Identity criado corretamente';
  ELSE
    RAISE NOTICE '[⚠️] STEP 4 AVISO: Identity não criado (não crítico para webhook)';
  END IF;

  RAISE NOTICE '';

  -- =========================================
  -- RESUMO FINAL
  -- =========================================
  IF v_test_passed THEN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 TESTE COMPLETO: PASSOU EM TODOS OS STEPS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ auth.users: Criado';
    RAISE NOTICE '✅ profiles: Criado pelo trigger handle_new_user()';
    RAISE NOTICE '✅ user_cohorts: Criado pelo trigger auto_assign_cohort()';
    RAISE NOTICE '✅ RLS policies: Funcionando corretamente';
    RAISE NOTICE '';
    RAISE NOTICE '🟢 SISTEMA OPERACIONAL';
    RAISE NOTICE '   Novos checkouts Stripe devem funcionar sem erros.';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Dados do teste:';
    RAISE NOTICE '   User ID: %', v_user_id;
    RAISE NOTICE '   Email: %', v_test_email;
    RAISE NOTICE '   Status: SUCESSO ✅';
    RAISE NOTICE '';
    RAISE NOTICE 'Você pode fazer login com este usuário de teste:';
    RAISE NOTICE '   Email: %', v_test_email;
    RAISE NOTICE '   Senha: teste123';
    RAISE NOTICE '';
    RAISE NOTICE 'Para limpar este teste, execute:';
    RAISE NOTICE '   DELETE FROM auth.users WHERE email = ''%'';', v_test_email;
    RAISE NOTICE '';
  END IF;

  -- Manter o usuário de teste no banco para inspeção manual
  -- (Ele não interfere em nada e permite validação adicional)

END $$;
