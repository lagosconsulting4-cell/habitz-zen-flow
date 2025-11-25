# 🚨 Guia de Acesso de Emergência - Habitz

**Cenário:** Cliente pagou mas o webhook falhou e ele não consegue acessar.
**Tempo total:** 2-3 minutos
**Requisito:** Acesso ao Supabase Dashboard

---

## ⚡ Solução Rápida (MÉTODO 1 - RECOMENDADO)

### Usar Email de Recuperação do Supabase

**Tempo:** 30 segundos
**Vantagem:** Mais rápido, sem SQL

#### Passo 1: Criar usuário via Dashboard (se não existir)

1. Vá em: **Supabase → Authentication → Users**
2. Clique em: **Add User**
3. Preencha:
   - **Email:** email do cliente
   - **Password:** Deixe em branco (vazio)
   - **Auto Confirm Email:** ✅ Marcado
4. Clique: **Create User**

#### Passo 2: Criar purchase via SQL

Supabase → SQL Editor:

```sql
-- Cole o email do cliente aqui:
DO $$
DECLARE
  cliente_email TEXT := 'email.do.cliente@exemplo.com'; -- ← ALTERAR AQUI
  user_id_var UUID;
BEGIN
  -- Pegar ID do usuário
  SELECT id INTO user_id_var FROM auth.users WHERE email = cliente_email;

  -- Criar purchase
  INSERT INTO purchases (
    user_id,
    provider,
    provider_session_id,
    provider_payment_intent,
    amount_cents,
    currency,
    status
  )
  VALUES (
    user_id_var,
    'kirvano',
    'manual-emergency-' || gen_random_uuid()::text,
    'manual-emergency-' || gen_random_uuid()::text,
    9700, -- R$ 97,00
    'BRL',
    'paid'
  );

  RAISE NOTICE 'Purchase criada para %', cliente_email;
END $$;
```

#### Passo 3: Enviar email de acesso

**Opção A - Via Dashboard (Rápido):**

1. **Supabase → Authentication → Users**
2. Encontre o usuário pelo email
3. Clique nos **3 pontinhos** ao lado dele
4. Clique em: **Send Magic Link**
5. Cliente receberá email instantâneo

**Opção B - Via SQL (se não tiver botão):**

```sql
-- Enviar email de recuperação
SELECT auth.send_magic_link('email.do.cliente@exemplo.com');
```

#### Passo 4: Instruir cliente

Envie esta mensagem via WhatsApp/Email:

```
Olá! Liberamos seu acesso ao Habitz.

Você receberá um email de noreply@mail.app.supabase.io
com o assunto "Confirm Your Signup" ou "Magic Link".

Clique no link do email para definir sua senha.

Se não receber em 5 min, verifique:
- Caixa de Spam/Promoções
- Procure por "Supabase" ou "Habitz"

Qualquer dúvida, estou aqui!

Link direto: https://www.habitz.life/app/auth
```

---

## 🔧 Solução Completa (MÉTODO 2 - COM SQL)

**Tempo:** 2 minutos
**Vantagem:** Controle total, pode definir senha

### Script SQL All-in-One

Cole isto no **Supabase → SQL Editor** e altere apenas o email e senha:

```sql
DO $$
DECLARE
  -- ⬇️ ALTERAR APENAS ESTAS 2 LINHAS:
  cliente_email TEXT := 'email.do.cliente@exemplo.com';
  cliente_senha TEXT := 'senhaTemporaria123';
  -- ⬆️ FIM DAS ALTERAÇÕES

  user_id_var UUID;
  user_exists BOOLEAN;
BEGIN
  -- Verificar se usuário já existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = cliente_email) INTO user_exists;

  IF user_exists THEN
    RAISE NOTICE 'Usuário já existe';
    SELECT id INTO user_id_var FROM auth.users WHERE email = cliente_email;
  ELSE
    RAISE NOTICE 'Criando novo usuário';
    -- Criar usuário
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      cliente_email,
      crypt(cliente_senha, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('display_name', split_part(cliente_email, '@', 1)),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO user_id_var;

    -- Trigger criará profile automaticamente
  END IF;

  -- Garantir que profile existe e tem email
  UPDATE profiles
  SET email = cliente_email
  WHERE user_id = user_id_var AND email IS NULL;

  -- Criar purchase se não existir
  IF NOT EXISTS(SELECT 1 FROM purchases WHERE user_id = user_id_var AND status = 'paid') THEN
    INSERT INTO purchases (
      user_id,
      provider,
      provider_session_id,
      provider_payment_intent,
      amount_cents,
      currency,
      status
    )
    VALUES (
      user_id_var,
      'kirvano',
      'manual-emergency-' || gen_random_uuid()::text,
      'manual-emergency-' || gen_random_uuid()::text,
      9700,
      'BRL',
      'paid'
    );
    RAISE NOTICE 'Purchase criada';
  ELSE
    RAISE NOTICE 'Purchase já existe';
  END IF;

  RAISE NOTICE '✅ ACESSO LIBERADO PARA: %', cliente_email;
  RAISE NOTICE 'Email: %', cliente_email;
  RAISE NOTICE 'Senha temporária: %', cliente_senha;
  RAISE NOTICE 'Link de acesso: https://www.habitz.life/app/auth';
END $$;
```

### Instruções para cliente:

```
Olá! Seu acesso foi liberado manualmente.

Email: [email do cliente]
Senha: senhaTemporaria123

Acesse: https://www.habitz.life/app/auth

IMPORTANTE: Após fazer login, vá em Perfil e altere sua senha.

Qualquer dúvida, estou aqui!
```

---

## 📋 Solução Express (MÉTODO 3 - MAIS RÁPIDO)

**Tempo:** 20 segundos
**Quando usar:** Urgência máxima

### SQL Ultra-Rápido

```sql
-- Altere apenas o email:
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'email@cliente.com', -- ← ALTERAR AQUI
    crypt('habitz123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id
)
INSERT INTO purchases (user_id, provider, status, amount_cents, currency, provider_session_id, provider_payment_intent)
SELECT id, 'kirvano', 'paid', 9700, 'BRL', gen_random_uuid()::text, gen_random_uuid()::text
FROM new_user;
```

**Credenciais:**
- Email: [email do cliente]
- Senha: `habitz123`

---

## 🎯 Comparação dos Métodos

| Método | Tempo | Complexidade | Melhor para |
|--------|-------|--------------|-------------|
| **Método 1 (Magic Link)** | 30s | Baixa | Cliente tech-savvy, horário comercial |
| **Método 2 (SQL Completo)** | 2min | Média | Controle total, validação |
| **Método 3 (Express)** | 20s | Baixa | Urgência, fora do horário |

---

## 🔍 Validação Pós-Acesso

Após liberar acesso, execute para confirmar:

```sql
-- Verificar se deu tudo certo
SELECT
  u.email as "Email do Usuário",
  u.email_confirmed_at as "Email Confirmado",
  p.email as "Email no Profile",
  pu.status as "Status da Compra",
  pu.amount_cents / 100.0 as "Valor (R$)",
  pu.created_at as "Data da Compra"
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
LEFT JOIN purchases pu ON pu.user_id = u.id
WHERE u.email = 'email@cliente.com' -- ← ALTERAR AQUI
ORDER BY pu.created_at DESC
LIMIT 1;
```

**Resultado esperado:**
```
Email do Usuário    | email@cliente.com
Email Confirmado    | 2025-11-07 18:00:00
Email no Profile    | email@cliente.com
Status da Compra    | paid
Valor (R$)          | 97.00
Data da Compra      | 2025-11-07 18:00:00
```

---

## 📧 Templates de Mensagem para Cliente

### Template 1: Via Magic Link

```
Olá [NOME]! 👋

Liberamos seu acesso ao Habitz.

Você receberá um EMAIL em instantes de:
📧 noreply@mail.app.supabase.io

O assunto será: "Confirm Your Signup"

➡️ Clique no link do email para criar sua senha.

NÃO RECEBEU?
• Verifique Spam/Promoções
• Aguarde até 5 minutos
• Adicione o remetente aos contatos

Após criar a senha:
🔗 https://www.habitz.life/app/auth

Dúvidas? Responda esta mensagem!

Equipe Habitz 🚀
```

### Template 2: Com Senha Temporária

```
Olá [NOME]! 👋

Seu acesso ao Habitz foi liberado manualmente.

📧 Email: [email do cliente]
🔑 Senha: habitz123

🔗 Acesse agora: https://www.habitz.life/app/auth

⚠️ IMPORTANTE:
Após fazer login, vá em "Perfil" e altere sua senha.

Qualquer dúvida, estou aqui!

Equipe Habitz 🚀
```

### Template 3: Problema Técnico

```
Olá [NOME]! 👋

Identificamos um problema técnico que atrasou
a liberação automática do seu acesso.

Já corrigimos e seu acesso está 100% liberado!

📧 Email: [email]
🔑 Senha: [senha temporária]
🔗 https://www.habitz.life/app/auth

Pedimos desculpas pelo transtorno.
Como compensação, vamos [OFERECER ALGO].

Equipe Habitz 🚀
```

---

## 🚨 Checklist de Emergência

Quando cliente reportar problema de acesso:

- [ ] 1. Confirmar que pagamento foi aprovado (Kirvano/Stripe)
- [ ] 2. Pegar email EXATO usado na compra
- [ ] 3. Verificar se usuário existe: `SELECT * FROM auth.users WHERE email = '...'`
- [ ] 4. Verificar se tem purchase: `SELECT * FROM purchases WHERE user_id = '...'`
- [ ] 5. Se não existe: Usar **Método 1** (Magic Link)
- [ ] 6. Se existe mas sem purchase: Usar **Método 2** (SQL Completo)
- [ ] 7. Enviar mensagem ao cliente com credenciais
- [ ] 8. Validar que cliente conseguiu acessar
- [ ] 9. Anotar caso para revisar webhook depois

---

## 🔧 Troubleshooting Rápido

### Cliente diz: "Não recebi o email"

**Checklist:**
```
✓ Verificou Spam/Promoções?
✓ Email está correto? (sem espaços, typos)
✓ Aguardou 5 minutos?
✓ Procurou por "Supabase", "Habitz", "noreply"?
```

**Solução:** Usar **Método 2** com senha temporária (não depende de email)

---

### Cliente diz: "Senha não funciona"

**Possíveis causas:**
1. Digitando email errado (espaços, maiúsculas)
2. Senha temporária copiou com espaço
3. Caps Lock ativado

**Solução rápida:**
```sql
-- Resetar senha
UPDATE auth.users
SET encrypted_password = crypt('novaSenha123', gen_salt('bf'))
WHERE email = 'email@cliente.com';
```

---

### Cliente diz: "Entra mas não tem acesso"

**Causa:** Purchase não está como "paid"

**Solução:**
```sql
UPDATE purchases
SET status = 'paid'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@cliente.com');
```

---

## 📊 Métricas de Sucesso

Para considerar o atendimento bem-sucedido:

- ⏱️ **Tempo de resposta:** < 5 minutos
- ✅ **Taxa de sucesso:** > 95%
- 😊 **Satisfação:** Cliente acessa e agradece

---

## 🎯 Prevenção de Emergências

### Como reduzir casos de emergência:

1. **Monitorar webhook:**
   - Criar alerta se webhook não executar em 2min após venda
   - Dashboard com status de webhooks

2. **Email automático:**
   - Kirvano deve enviar email de boas-vindas
   - Com link direto para página de obrigado

3. **FAQ na página de obrigado:**
   - "Não recebeu email? Clique aqui"
   - Botão para reenviar

4. **Teste semanal:**
   - Fazer compra teste toda semana
   - Validar que fluxo está funcionando

---

## 📝 Registro de Acessos de Emergência

Crie uma planilha/doc para registrar:

| Data | Email Cliente | Método Usado | Tempo | Causa Raiz | Resolvido? |
|------|---------------|--------------|-------|------------|------------|
| 07/11 | teste@email.com | Magic Link | 2min | Webhook falhou | ✅ |

**Por que registrar:**
- Identificar padrões
- Melhorar o sistema
- Justificar compensações

---

## 🎁 Compensação para Cliente

Se cliente esperou muito (>30min):

**Opções:**
1. 1 mês grátis adicional
2. Acesso antecipado a novos recursos
3. Sessão 1:1 de onboarding
4. Desconto na renovação

**Template:**
```
Olá [NOME],

Pedimos desculpas pelo atraso na liberação do acesso.

Como compensação, adicionamos [BENEFÍCIO] à sua conta.

Agradecemos sua paciência e compreensão!

Equipe Habitz
```

---

## ⚡ Resumo: 3 Comandos Mais Usados

### 1. Criar usuário + purchase (Mais comum)

```sql
DO $$
DECLARE cliente_email TEXT := 'email@cliente.com'; user_id_var UUID;
BEGIN
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', cliente_email, crypt('habitz123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW())
  RETURNING id INTO user_id_var;

  INSERT INTO purchases (user_id, provider, status, amount_cents, currency, provider_session_id, provider_payment_intent)
  VALUES (user_id_var, 'kirvano', 'paid', 9700, 'BRL', gen_random_uuid()::text, gen_random_uuid()::text);
END $$;
```

### 2. Criar purchase para usuário existente

```sql
INSERT INTO purchases (user_id, provider, status, amount_cents, currency, provider_session_id, provider_payment_intent)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'email@cliente.com'),
  'kirvano', 'paid', 9700, 'BRL', gen_random_uuid()::text, gen_random_uuid()::text
);
```

### 3. Resetar senha

```sql
UPDATE auth.users
SET encrypted_password = crypt('novaSenha123', gen_salt('bf'))
WHERE email = 'email@cliente.com';
```

---

## 📞 Suporte Rápido

**WhatsApp do cliente:**
```
Oi! Vi que você está com dificuldade para acessar.

Vou liberar manualmente agora mesmo.
Aguarde 2 minutos que te envio as credenciais!

Qual email você usou na compra?
```

**Após liberar:**
```
✅ LIBERADO!

Email: [email]
Senha: habitz123

Link: https://www.habitz.life/app/auth

Conseguiu entrar?
```

---

**Salve este guia e compartilhe com a equipe de suporte! 🚀**
