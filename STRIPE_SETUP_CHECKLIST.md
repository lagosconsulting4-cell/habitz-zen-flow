# ✅ Checklist de Configuração Stripe

Use este checklist para garantir que todos os passos foram concluídos corretamente.

---

## 📋 Parte 1: Configurar Payment Links (Success URL)

### Link Mensal (R$ 19,90)

- [ ] Acessar Stripe Dashboard → Payment Links
- [ ] Encontrar link: `https://buy.stripe.com/eVq14n6n216Wff29lG9oc01`
- [ ] Clicar em **"⋯"** → **"Edit link"**
- [ ] Rolar até **"After payment"**
- [ ] Configurar **Success URL:**
  ```
  https://habitz.life/app?session_id={CHECKOUT_SESSION_ID}
  ```
- [ ] (Opcional) Configurar **Cancel URL:**
  ```
  https://habitz.life/bora
  ```
- [ ] Clicar em **"Save"**

### Link Anual (R$ 99,90)

- [ ] Acessar Stripe Dashboard → Payment Links
- [ ] Encontrar link: `https://buy.stripe.com/6oU3cv3aQ16Wd6UeG09oc00`
- [ ] Clicar em **"⋯"** → **"Edit link"**
- [ ] Rolar até **"After payment"**
- [ ] Configurar **Success URL:**
  ```
  https://habitz.life/app?session_id={CHECKOUT_SESSION_ID}
  ```
- [ ] (Opcional) Configurar **Cancel URL:**
  ```
  https://habitz.life/bora
  ```
- [ ] Clicar em **"Save"**

---

## 🔗 Parte 2: Configurar Webhook

### Criar Endpoint

- [ ] Acessar Stripe Dashboard → Developers → Webhooks
- [ ] Clicar em **"Add endpoint"**
- [ ] Configurar **Endpoint URL:**
  ```
  https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/stripe-webhook
  ```
- [ ] Configurar **Description:**
  ```
  Habitz Supabase Webhook (Payments & Subscriptions)
  ```
- [ ] Clicar em **"Select events"**

### Selecionar Eventos

- [ ] Marcar: `checkout.session.completed`
- [ ] Marcar: `payment_intent.succeeded`
- [ ] Marcar: `customer.subscription.created`
- [ ] Marcar: `customer.subscription.updated`
- [ ] Marcar: `customer.subscription.deleted`
- [ ] Marcar: `invoice.paid`
- [ ] Marcar: `invoice.payment_failed`
- [ ] Clicar em **"Add events"**

### Finalizar e Copiar Secret

- [ ] Clicar em **"Add endpoint"**
- [ ] Copiar o **Signing secret** (começa com `whsec_...`)
- [ ] Guardar o secret em local seguro (vai precisar no próximo passo)

---

## 🔐 Parte 3: Configurar Secrets no Supabase

### Via Supabase Dashboard (Recomendado)

- [ ] Acessar https://supabase.com/dashboard
- [ ] Entrar no projeto `jbucnphyrziaxupdsnbn`
- [ ] Menu lateral → **Settings** → **Edge Functions**
- [ ] Rolar até **"Environment Variables"**
- [ ] Verificar se existe `STRIPE_WEBHOOK_SECRET`
  - [ ] Se não existir, clicar em **"Add new secret"**
  - [ ] **Name:** `STRIPE_WEBHOOK_SECRET`
  - [ ] **Value:** `whsec_...` (o secret copiado do Stripe)
  - [ ] Clicar em **"Save"**

### Verificar STRIPE_SECRET_KEY

- [ ] Verificar se existe `STRIPE_SECRET_KEY` nas variáveis de ambiente
- [ ] Se não existir:
  - [ ] Ir ao Stripe Dashboard → Developers → API Keys
  - [ ] Copiar a **Secret key** (começa com `sk_live_...` ou `sk_test_...`)
  - [ ] Adicionar no Supabase como `STRIPE_SECRET_KEY`

---

## ✅ Parte 4: Testar Configuração

### Teste de Webhook (Via Stripe Dashboard)

- [ ] Acessar Stripe Dashboard → Developers → Webhooks
- [ ] Clicar no endpoint criado
- [ ] Ir para aba **"Send test webhook"**
- [ ] Selecionar evento: `checkout.session.completed`
- [ ] Clicar em **"Send test webhook"**
- [ ] Verificar em **"Recent deliveries"** se status é **"Succeeded"** (código 200)
- [ ] Se houver erro, verificar logs do Supabase

### Teste de Pagamento (Modo Test - Recomendado)

**IMPORTANTE:** Use modo test do Stripe antes de testar em produção

- [ ] Criar payment links de teste no Stripe
- [ ] Acessar um dos links de teste
- [ ] Usar cartão de teste: `4242 4242 4242 4242`
  - CVV: qualquer 3 dígitos
  - Data: qualquer data futura
  - CEP: qualquer
- [ ] Completar o pagamento
- [ ] Verificar:
  - [ ] Redirecionou para `habitz.life/app?session_id=...`
  - [ ] Webhook foi chamado (verificar em Stripe → Webhooks → Recent deliveries)
  - [ ] Registro criado na tabela `purchases` (verificar no Supabase)
  - [ ] Campo `is_premium` atualizado em `profiles` (verificar no Supabase)

### Verificar Logs do Supabase

- [ ] Acessar Supabase Dashboard
- [ ] Menu lateral → **Edge Functions** → `stripe-webhook`
- [ ] Verificar aba **"Logs"**
- [ ] Procurar por erros ou warnings
- [ ] Confirmar que evento foi processado com sucesso

---

## 🎯 Resultado Esperado

Quando tudo estiver configurado corretamente:

1. ✅ Usuário completa quiz em `habitz.life/bora`
2. ✅ Clica em plano mensal ou anual
3. ✅ É redirecionado para Stripe Checkout
4. ✅ Preenche dados de pagamento
5. ✅ Após pagamento bem-sucedido:
   - É redirecionado para `habitz.life/app?session_id=xyz`
   - Webhook Stripe chama edge function automaticamente
   - Registro é criado na tabela `purchases`
   - Trigger PostgreSQL atualiza `is_premium = true` automaticamente
6. ✅ App detecta `session_id` e pode fazer auto-login (próxima etapa)

---

## 🚨 Problemas Comuns

### "Invalid signature" no webhook

**Causa:** `STRIPE_WEBHOOK_SECRET` está incorreto ou não foi configurado

**Solução:**
- Verificar se o secret foi copiado corretamente (completo, incluindo `whsec_`)
- Reconfigurar o secret no Supabase
- Fazer redeploy da edge function: `npx supabase functions deploy stripe-webhook`

### Webhook não é chamado

**Causa:** URL do endpoint está incorreta ou edge function não está deployada

**Solução:**
- Verificar URL: `https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/stripe-webhook`
- Fazer deploy: `npx supabase functions deploy stripe-webhook`
- Verificar se edge function está ativa no Supabase Dashboard

### "Missing environment variables"

**Causa:** Secrets não foram configurados no Supabase

**Solução:**
- Verificar secrets via CLI: `npx supabase secrets list --project-ref jbucnphyrziaxupdsnbn`
- Adicionar secrets faltantes via Dashboard ou CLI

### Redirecionamento não funciona

**Causa:** Success URL não foi configurada nos payment links

**Solução:**
- Verificar configuração em Stripe Dashboard → Payment Links → Edit
- Confirmar que `{CHECKOUT_SESSION_ID}` está presente na URL

---

## 📞 Suporte

Se encontrar problemas:

1. **Verificar logs do Stripe:** Dashboard → Developers → Webhooks → Recent deliveries
2. **Verificar logs do Supabase:** Dashboard → Edge Functions → stripe-webhook → Logs
3. **Consultar documentação:**
   - `STRIPE_INTEGRATION_NEXT_STEPS.md` (arquitetura completa)
   - `configure-stripe-secrets.md` (configuração de secrets)

---

**Última atualização:** 2025-12-22
