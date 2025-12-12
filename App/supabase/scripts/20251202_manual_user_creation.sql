-- ============================================================================
-- SCRIPT DE CRIAÇÃO MANUAL DE USUÁRIOS PARA HABITZ
-- ============================================================================
--
-- Este script cria usuários manualmente no Supabase, incluindo:
-- - Autenticação (auth.users com senha criptografada)
-- - Profile do usuário (com status premium)
-- - Purchase record (se premium)
-- - Sistema de gamificação (user_progress)
-- - Identidade de autenticação (auth.identities)
--
-- USE CASE:
-- - Testes e demos
-- - Provisionar usuários específicos
-- - Criar usuários premium manualmente
-- - Contornar processo de signup quando necessário
--
-- SEGURANÇA:
-- - Senhas são criptografadas com bcrypt (gen_salt('bf'))
-- - Email é marcado como confirmado (skip verificação)
-- - Apenas para ambiente de teste/demo
--
-- ============================================================================
-- INSTRUÇÕES DE USO:
-- ============================================================================
-- 1. Editar as variáveis abaixo (v_email, v_password, etc)
-- 2. Executar o script no Supabase SQL Editor
-- 3. Observar as mensagens RAISE NOTICE no output
-- 4. Validar com as queries de verificação no final deste arquivo
--
-- ============================================================================
-- VARIÁVEIS EDITÁVEIS - ALTERE AQUI PARA CADA USUÁRIO
-- ============================================================================

DO $$
DECLARE
  -- EMAIL DO USUÁRIO (ALTERE)
  v_email TEXT := 'usuario.teste@habitz.com';

  -- SENHA DO USUÁRIO - vai ser criptografada automaticamente (ALTERE)
  -- Recomendação: Use uma senha forte para teste (ex: Test@12345)
  v_password TEXT := 'Test@12345';

  -- NOME DE EXIBIÇÃO (ALTERE)
  v_display_name TEXT := 'Usuário Teste Habitz';

  -- PREMIUM? true = premium, false = free (ALTERE)
  v_is_premium BOOLEAN := true;

  -- VALOR DA COMPRA EM CENTAVOS (apenas se premium)
  -- Exemplos: 14700 = R$ 147,00 | 29900 = R$ 299,00
  -- (ALTERE SE NECESSÁRIO)
  v_purchase_amount_cents INTEGER := 14700;

  -- Variável interna para armazenar ID do usuário criado
  v_user_id UUID;

BEGIN

  -- ============================================================================
  -- STEP 1: Criar Usuário em auth.users (Supabase Auth)
  -- ============================================================================

  v_user_id := gen_random_uuid();

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
    '00000000-0000-0000-0000-000000000000',  -- instance_id padrão
    v_user_id,                                -- UUID gerado
    'authenticated',                           -- audience
    'authenticated',                           -- role
    v_email,                                   -- email do usuário
    crypt(v_password, gen_salt('bf')),       -- senha criptografada com bcrypt
    NOW(),                                    -- email confirmado (skip verificação)
    '',                                       -- sem token de confirmação
    '',                                       -- sem token de recuperação
    '',                                       -- sem token de mudança de email
    '',                                       -- sem mudança de email
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('display_name', v_display_name),
    false,                                    -- não é super admin
    NOW(),                                    -- criado agora
    NOW(),                                    -- atualizado agora
    NOW(),                                    -- último login agora
    NOW()                                     -- confirmação enviada agora
  );

  RAISE NOTICE '[✓] STEP 1: auth.users criado com ID: %', v_user_id;

  -- ============================================================================
  -- STEP 2: Criar/Atualizar Profile
  -- ============================================================================
  -- Nota: O trigger on_auth_user_created() cria o profile automaticamente
  -- Mas usamos ON CONFLICT para garantir status premium correto

  INSERT INTO public.profiles (
    user_id,
    display_name,
    is_premium,
    premium_since,
    has_completed_onboarding,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    v_display_name,
    v_is_premium,
    CASE WHEN v_is_premium THEN NOW() ELSE NULL END,  -- data premium (se aplicável)
    true,                                              -- já completou onboarding
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    is_premium = EXCLUDED.is_premium,
    premium_since = EXCLUDED.premium_since,
    has_completed_onboarding = true,
    updated_at = NOW();

  RAISE NOTICE '[✓] STEP 2: Profile criado/atualizado para: %', v_email;

  -- ============================================================================
  -- STEP 3: Criar Purchase Record (se Premium)
  -- ============================================================================
  -- O trigger purchases_set_premium() vai auto-atualizar profiles.is_premium
  -- quando status='paid'

  IF v_is_premium THEN
    INSERT INTO public.purchases (
      user_id,
      email,
      provider,
      provider_session_id,
      provider_payment_intent,
      amount_cents,
      currency,
      status,
      product_names,
      payment_method,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      v_email,
      'manual',                                    -- provider = manual para usuários de teste
      'manual_' || v_user_id::text,              -- session ID fictício
      'pi_manual_' || v_user_id::text,           -- payment intent fictício
      v_purchase_amount_cents,                    -- valor em centavos
      'BRL',                                      -- moeda brasileira
      'paid',                                     -- status = paid (ativa premium)
      'Habitz Premium - Criação Manual',
      'manual_test',
      NOW(),
      NOW()
    );

    RAISE NOTICE '[✓] STEP 3: Purchase criada (status=paid) para: %', v_email;
  ELSE
    RAISE NOTICE '[✓] STEP 3: Pulado (usuário gratuito)';
  END IF;

  -- ============================================================================
  -- STEP 4: Inicializar Gamificação (user_progress)
  -- ============================================================================
  -- Cria registro com valores padrão de gamificação

  INSERT INTO public.user_progress (
    user_id,
    total_xp,
    current_level,
    current_streak,
    longest_streak,
    last_activity_date,
    perfect_days,
    total_habits_completed,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    0,                                           -- sem XP inicial
    1,                                           -- nível inicial (Bronze I)
    0,                                           -- sem streak
    0,                                           -- sem longest streak
    NULL,                                        -- sem atividade ainda
    0,                                           -- sem perfect days
    0,                                           -- sem hábitos completados
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE '[✓] STEP 4: Gamificação inicializada para: %', v_email;

  -- ============================================================================
  -- STEP 5: Criar auth.identities (Requerido pelo Supabase Auth)
  -- ============================================================================
  -- Vincula o provider de autenticação (email) ao usuário

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  RAISE NOTICE '[✓] STEP 5: auth.identities criado para: %', v_email;

  -- ============================================================================
  -- RESUMO DE SUCESSO
  -- ============================================================================

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ USUÁRIO CRIADO COM SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'User ID:       %', v_user_id;
  RAISE NOTICE 'Email:         %', v_email;
  RAISE NOTICE 'Password:      %', v_password;
  RAISE NOTICE 'Display Name:  %', v_display_name;
  RAISE NOTICE 'Premium:       %', CASE WHEN v_is_premium THEN 'SIM' ELSE 'NÃO' END;
  RAISE NOTICE 'Level:         Bronze I (nível 1)';
  RAISE NOTICE 'Onboarding:    Completo';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Para fazer login:';
  RAISE NOTICE '  Email: %', v_email;
  RAISE NOTICE '  Senha: %', v_password;
  RAISE NOTICE '';
  RAISE NOTICE 'Para verificar os dados, execute:';
  RAISE NOTICE '  SELECT * FROM auth.users WHERE id = ''%'';', v_user_id;
  RAISE NOTICE '';
  RAISE NOTICE '========================================';

END $$;

-- ============================================================================
-- QUERIES DE VALIDAÇÃO - Execute estas para verificar a criação
-- ============================================================================

-- 1. Verificar usuário criado em auth.users
-- Altere 'usuario.teste@habitz.com' para o email que você criou
SELECT
  u.id as user_id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  p.display_name,
  p.is_premium,
  p.premium_since,
  p.has_completed_onboarding
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE u.email = 'usuario.teste@habitz.com'
LIMIT 1;

-- ============================================================================

-- 2. Verificar status de compra e premium
-- Altere o UUID para o ID do usuário criado
-- SELECT
--   pur.id as purchase_id,
--   pur.email,
--   pur.status,
--   pur.amount_cents,
--   pur.provider,
--   pur.created_at,
--   prof.is_premium,
--   prof.premium_since
-- FROM public.purchases pur
-- JOIN auth.users u ON u.id = pur.user_id
-- JOIN public.profiles prof ON prof.user_id = pur.user_id
-- WHERE pur.user_id = 'COLE_O_UUID_AQUI'
-- LIMIT 1;

-- ============================================================================

-- 3. Verificar gamificação
-- Altere o UUID para o ID do usuário criado
-- SELECT
--   up.user_id,
--   up.total_xp,
--   up.current_level,
--   CASE
--     WHEN up.current_level >= 1 AND up.current_level <= 3 THEN 'Bronze'
--     WHEN up.current_level >= 4 AND up.current_level <= 6 THEN 'Silver'
--     WHEN up.current_level >= 7 AND up.current_level <= 9 THEN 'Gold'
--     WHEN up.current_level = 10 THEN 'Diamond'
--   END as tier,
--   up.current_streak,
--   up.longest_streak,
--   up.perfect_days,
--   up.total_habits_completed
-- FROM public.user_progress up
-- WHERE up.user_id = 'COLE_O_UUID_AQUI'
-- LIMIT 1;

-- ============================================================================

-- 4. Verificar auth.identities
-- Altere o UUID para o ID do usuário criado
-- SELECT
--   id,
--   user_id,
--   provider,
--   identity_data,
--   created_at
-- FROM auth.identities
-- WHERE user_id = 'COLE_O_UUID_AQUI'
-- LIMIT 1;

-- ============================================================================
-- QUERIES DE LIMPEZA - Use para deletar usuários de teste
-- ============================================================================

-- CUIDADO: Isto vai DELETAR permanentemente o usuário e TODOS seus dados
-- (hábitos, compras, progresso, etc) por causa do ON DELETE CASCADE

-- DELETE FROM auth.users WHERE email = 'usuario.teste@habitz.com';
-- COMMIT;

-- ============================================================================
-- CRIAÇÃO EM LOTE - Para criar múltiplos usuários de uma vez
-- ============================================================================
--
-- Descomente e adapte o código abaixo para criar vários usuários:
--
-- DO $$
-- DECLARE
--   v_users TEXT[][] := ARRAY[
--     ['user1@test.com', 'User One', 'Pass123!', 'true'],
--     ['user2@test.com', 'User Two', 'Pass456!', 'true'],
--     ['user3@test.com', 'User Three', 'Pass789!', 'false']
--   ];
--   v_user_data TEXT[];
--   v_email TEXT;
--   v_display_name TEXT;
--   v_password TEXT;
--   v_is_premium BOOLEAN;
-- BEGIN
--   FOREACH v_user_data SLICE 1 IN ARRAY v_users
--   LOOP
--     v_email := v_user_data[1];
--     v_display_name := v_user_data[2];
--     v_password := v_user_data[3];
--     v_is_premium := (v_user_data[4] = 'true');
--
--     -- Inserir código de criação de usuário aqui
--     RAISE NOTICE 'Criando usuário: %', v_email;
--   END LOOP;
-- END $$;
--
-- ============================================================================
