# ✅ Guia de Validação - Sistema de Criação de Usuários

**Objetivo**: Confirmar que o erro "Database error creating new user" foi completamente resolvido

---

## 🔍 Validação em 3 Níveis

### Nível 1: Banco de Dados (Mais Rápido) ⚡
### Nível 2: Webhook Local (Moderado) 🔧
### Nível 3: Stripe End-to-End (Completo) 🎯

---

## 📊 NÍVEL 1: Validação SQL (5 minutos)

Execute estes queries no **Supabase SQL Editor**:
`https://supabase.com/dashboard/project/jbucnphyrziaxupdsnbn/sql/new`

### ✅ Checklist 1: Funções Criadas

```sql
-- Deve retornar 2 funções
SELECT
  proname as function_name,
  prosrc as source_code,
  'EXISTS ✅' as status
FROM pg_proc
WHERE proname IN ('current_user_is_admin', 'get_user_id_by_email');
```

**Resultado Esperado**:
- 2 linhas retornadas
- `current_user_is_admin` ✅
- `get_user_id_by_email` ✅

**Se retornar 0 linhas**: ❌ Migration não foi aplicada!

---

### ✅ Checklist 2: RLS Policies de INSERT

```sql
-- Deve retornar 3 policies
SELECT
  tablename,
  policyname,
  cmd as command,
  'EXISTS ✅' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_cohorts', 'sessions', 'events')
  AND cmd = 'INSERT';
```

**Resultado Esperado**:
| tablename | policyname | command | status |
|-----------|------------|---------|--------|
| user_cohorts | System can insert cohorts | INSERT | EXISTS ✅ |
| sessions | System can insert sessions | INSERT | EXISTS ✅ |
| events | System can insert events | INSERT | EXISTS ✅ |

**Se retornar menos de 3 linhas**: ❌ Alguma policy está faltando!

---

### ✅ Checklist 3: RLS Habilitado

```sql
-- Verificar que RLS está ativo nas tabelas
SELECT
  tablename,
  CASE
    WHEN rowsecurity = true THEN 'ENABLED ✅'
    ELSE 'DISABLED ❌'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_cohorts', 'sessions', 'events', 'profiles');
```

**Resultado Esperado**: Todas as tabelas com `ENABLED ✅`

---

### ✅ Checklist 4: Testar a Função get_user_id_by_email

```sql
-- Testar com um cliente que existe
SELECT public.get_user_id_by_email('lucaskeidson09@gmail.com');
```

**Resultado Esperado**: Retorna um UUID (user_id do Lucas)

**Se retornar NULL**: ❌ Função não está funcionando corretamente!

---

### ✅ Checklist 5: Verificar Triggers Ativos

```sql
-- Verificar que os triggers estão ativos
SELECT
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name,
  tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname IN (
  'on_auth_user_created',
  'trigger_auto_assign_cohort'
);
```

**Resultado Esperado**:
- `on_auth_user_created` → `handle_new_user()` → enabled = 'O'
- `trigger_auto_assign_cohort` → `auto_assign_cohort()` → enabled = 'O'

('O' significa trigger ativo)

---

## 🔧 NÍVEL 2: Teste Local do Webhook (10 minutos)

### Passo 1: Preparar Ambiente Local

```bash
cd App/supabase/functions/stripe-webhook

# Instalar dependências (se necessário)
deno cache index.ts
```

### Passo 2: Criar Payload de Teste

Crie o arquivo `test_webhook_payload.json`:

```json
{
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_test_123",
      "customer": "cus_test_123",
      "status": "active",
      "items": {
        "data": [
          {
            "price": {
              "id": "price_123",
              "unit_amount": 17900,
              "currency": "brl"
            }
          }
        ]
      }
    }
  }
}
```

### Passo 3: Simular Criação de Usuário

Execute este script SQL no Supabase (cria usuário de teste):

```sql
-- Criar usuário de teste para validação
DO $$
DECLARE
  v_email TEXT := 'teste.webhook@habitz.com';
  v_user_id UUID;
BEGIN
  -- Limpar testes anteriores
  DELETE FROM auth.identities WHERE user_id IN (
    SELECT user_id FROM profiles WHERE email = v_email
  );
  DELETE FROM user_cohorts WHERE user_id IN (
    SELECT user_id FROM profiles WHERE email = v_email
  );
  DELETE FROM purchases WHERE email = v_email;
  DELETE FROM profiles WHERE email = v_email;
  DELETE FROM auth.users WHERE email = v_email;

  -- Tentar criar usuário (vai testar o fluxo completo)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_email,
    crypt('teste123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Teste Webhook"}'::jsonb,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_user_id;

  -- Verificar se profile foi criado pelo trigger
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = v_user_id) THEN
    RAISE NOTICE '✅ Profile criado pelo trigger handle_new_user()';
  ELSE
    RAISE EXCEPTION '❌ FALHOU: Profile não foi criado!';
  END IF;

  -- Verificar se cohort foi criado pelo trigger
  IF EXISTS (SELECT 1 FROM user_cohorts WHERE user_id = v_user_id) THEN
    RAISE NOTICE '✅ Cohort criado pelo trigger auto_assign_cohort()';
  ELSE
    RAISE EXCEPTION '❌ FALHOU: Cohort não foi criado - RLS pode estar bloqueando!';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ TESTE COMPLETO: Usuário criado com sucesso!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Email: %', v_email;
  RAISE NOTICE '';
  RAISE NOTICE 'Todos os triggers funcionaram corretamente.';
  RAISE NOTICE 'Sistema pronto para receber webhooks do Stripe.';

END $$;
```

**Resultado Esperado**:
```
✅ Profile criado pelo trigger handle_new_user()
✅ Cohort criado pelo trigger auto_assign_cohort()
========================================
✅ TESTE COMPLETO: Usuário criado com sucesso!
========================================
```

**Se aparecer "❌ FALHOU: Cohort não foi criado"**:
- A RLS policy ainda está bloqueando!
- Verifique que a migration `20260120000000_force_apply_auth_fix.sql` foi aplicada

---

## 🎯 NÍVEL 3: Teste End-to-End com Stripe (15 minutos)

### Opção A: Stripe Checkout Real (Recomendado)

#### Passo 1: Acessar Stripe Dashboard

```
https://dashboard.stripe.com/test/payments
```

#### Passo 2: Criar Link de Checkout de Teste

No Stripe Dashboard:
1. Acesse "Products" → Seu produto Habitz Premium
2. Clique em "Create payment link"
3. Configure:
   - Price: Seu preço de R$ 179,00
   - Success URL: `https://app.habitz.com.br/welcome`
   - Cancel URL: `https://app.habitz.com.br/checkout`
4. Copie o link gerado

#### Passo 3: Completar Checkout com Cartão de Teste

Use estes dados:
- **Email**: `validacao.stripe@teste.com` (novo email de teste)
- **Nome**: `Teste Validação Webhook`
- **Cartão**: `4242 4242 4242 4242`
- **Expiração**: Qualquer data futura (ex: 12/25)
- **CVC**: Qualquer 3 dígitos (ex: 123)
- **CEP**: Qualquer (ex: 12345)

#### Passo 4: Monitorar Logs do Supabase

Enquanto completa o checkout, abra em outra aba:

```
https://supabase.com/dashboard/project/jbucnphyrziaxupdsnbn/logs/edge-functions
```

**Filtros**:
- Function: `stripe-webhook`
- Level: `All logs`

#### Passo 5: Verificar Logs (O Que Procurar)

✅ **Logs de Sucesso** (deve aparecer):
```
Creating user account for: validacao.stripe@teste.com
✅ Auth user created: [uuid]
✅ Profile created with phone for new user: [uuid]
Purchase upserted for user [uuid], status: paid
```

❌ **Logs de Erro** (NÃO deve aparecer):
```
Database error creating new user
Failed to create auth user
RPC error fetching user
```

#### Passo 6: Confirmar no Banco de Dados

Execute no SQL Editor:

```sql
-- Verificar que o usuário foi criado completamente
SELECT
  'auth.users' as table_name,
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE email = 'validacao.stripe@teste.com'
  ) as exists
UNION ALL
SELECT
  'profiles',
  EXISTS (
    SELECT 1 FROM profiles
    WHERE email = 'validacao.stripe@teste.com'
  )
UNION ALL
SELECT
  'user_cohorts',
  EXISTS (
    SELECT 1 FROM user_cohorts uc
    JOIN profiles p ON p.user_id = uc.user_id
    WHERE p.email = 'validacao.stripe@teste.com'
  )
UNION ALL
SELECT
  'purchases',
  EXISTS (
    SELECT 1 FROM purchases
    WHERE email = 'validacao.stripe@teste.com'
    AND status = 'paid'
  );
```

**Resultado Esperado**: Todas as linhas com `exists = true`

---

### Opção B: Stripe CLI (Para Desenvolvedores)

Se você tem o Stripe CLI instalado:

```bash
# 1. Login
stripe login

# 2. Forward webhooks para função local
stripe listen --forward-to https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/stripe-webhook

# 3. Em outro terminal, trigger evento de teste
stripe trigger customer.subscription.created
```

Monitore os logs no terminal que está fazendo `stripe listen`.

---

## 📈 Checklist Final de Validação

Marque cada item conforme completa:

### Banco de Dados
- [ ] Função `current_user_is_admin()` existe
- [ ] Função `get_user_id_by_email()` existe
- [ ] RLS policy "System can insert cohorts" existe
- [ ] RLS policy "System can insert sessions" existe
- [ ] RLS policy "System can insert events" existe
- [ ] Todas as tabelas têm RLS habilitado
- [ ] Função `get_user_id_by_email()` retorna UUID corretamente

### Teste Local
- [ ] Script de teste SQL criou usuário com sucesso
- [ ] Profile foi criado pelo trigger `handle_new_user()`
- [ ] Cohort foi criado pelo trigger `auto_assign_cohort()`
- [ ] Nenhum erro de RLS bloqueando INSERT

### Teste End-to-End (Escolha uma opção)
- [ ] Checkout Stripe completado com sucesso
- [ ] Logs do webhook mostram "✅ Auth user created"
- [ ] Logs mostram "✅ Profile created"
- [ ] Logs mostram "Purchase upserted"
- [ ] Nenhum log de erro "Database error creating new user"
- [ ] Usuário existe em `auth.users`, `profiles`, `user_cohorts`, e `purchases`

---

## 🚨 O Que Fazer Se Falhar

### Se Nível 1 Falhar (SQL)
1. Verifique que migration foi aplicada:
   ```bash
   cd App
   npx supabase migration list --linked
   ```
2. Procure por `20260120000000` na lista
3. Se não aparecer, faça:
   ```bash
   npx supabase db push
   ```

### Se Nível 2 Falhar (Teste Local)
1. Erro "Cohort não foi criado" → RLS policy faltando
2. Execute novamente:
   ```bash
   cd App
   npx supabase db push
   ```
3. Force apply da migration mais recente

### Se Nível 3 Falhar (Stripe End-to-End)
1. Capture o erro exato dos logs do Supabase
2. Procure por mensagens começando com `❌` ou `Failed to`
3. Se aparecer "Database error creating new user":
   - Verifique Nível 1 novamente
   - Pode haver outra migration pendente

---

## ✅ Critério de Sucesso

**Sistema está validado quando**:
- ✅ Todas as 7 verificações do Nível 1 passam
- ✅ Script de teste do Nível 2 retorna sucesso
- ✅ Pelo menos 1 checkout Stripe do Nível 3 completa sem erros

**Quando isso acontecer**: 🎉 Sistema 100% operacional!

---

## 📞 Suporte Adicional

Se alguma validação falhar após seguir este guia:

1. Capture o erro exato (screenshot ou copie o texto)
2. Anote qual nível falhou (1, 2 ou 3)
3. Verifique o arquivo `FIX_SUMMARY.md` para contexto
4. Execute o script de verificação SQL completo do Nível 1

---

**Última Atualização**: 2026-01-20
**Válido Para**: Sistema pós-correção do erro "Database error creating new user"
