# 🎯 Configuração Completa: UTMify + Meta Pixel + Stripe

Este guia mostra como configurar o tracking completo de conversões do Habitz usando UTMify como intermediário para o Meta Pixel.

---

## 📊 Visão Geral do Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRACKING COMPLETO                             │
└─────────────────────────────────────────────────────────────────┘

1️⃣ FRONTEND (Landing):
   Usuário preenche quiz → UTMify Pixel captura dados
   └→ Envia evento "CompleteRegistration" com Advanced Matching
      └→ UTMify → Meta Pixel (Lead, CompleteRegistration)

2️⃣ CHECKOUT:
   Usuário clica em "Assinar" → Evento "InitiateCheckout"
   └→ UTMify → Meta Pixel (InitiateCheckout)

3️⃣ BACKEND (Stripe Webhook):
   Pagamento aprovado → Stripe Webhook → UTMify API
   └→ UTMify envia "Purchase" para Meta Pixel
      └→ Meta otimiza campanhas com dados de conversão

```

---

## 🚀 Passo 1: Configurar Meta Pixel no Painel UTMify

### **1.1. Acessar UTMify Dashboard**

1. Ir para: https://app.utmify.com.br
2. Fazer login com sua conta
3. No menu lateral, clicar em **"Pixels"** ou **"Configurações"**

### **1.2. Conectar Meta Pixel**

1. Procurar seção **"Integrações"** ou **"Pixels do Meta"**
2. Clicar em **"Adicionar Pixel do Meta"** ou **"Conectar Facebook Pixel"**
3. Inserir os dados do seu Meta Pixel:
   - **Pixel ID**: (pegar no Meta Events Manager)
   - **Token de Acesso** (Access Token): (gerar no Meta Business)

### **1.3. Obter Pixel ID do Meta**

1. Ir para: https://business.facebook.com/events_manager2
2. Selecionar seu Pixel
3. Copiar o **Pixel ID** (geralmente 15-16 dígitos)

### **1.4. Gerar Access Token do Meta (Conversions API)**

Para enviar eventos server-side (Purchase), o Meta precisa de um Access Token:

1. Ir para: https://business.facebook.com/events_manager2
2. Selecionar seu Pixel → **Settings** → **Conversions API**
3. Clicar em **"Generate Access Token"**
4. Copiar o token e salvar no UTMify

### **1.5. Verificar Conexão**

Após configurar, o UTMify deve mostrar:
- ✅ Pixel conectado
- ✅ Status: Ativo
- ✅ Eventos sendo enviados

---

## 🔧 Passo 2: Configurar API Key do UTMify no Supabase

Para o webhook do Stripe enviar eventos para o UTMify, você precisa configurar a API Key:

### **2.1. Obter API Key do UTMify**

1. UTMify Dashboard → **Configurações** → **API** ou **Integrações**
2. Procurar por **"Credencial de API"** ou **"API Key"**
3. Copiar a chave (geralmente começa com `utmfy_` ou similar)

### **2.2. Adicionar no Supabase**

1. **Supabase Dashboard** → Seu projeto → **Settings** → **Edge Functions**
2. Clicar em **"Manage Secrets"**
3. Adicionar novo secret:
   - **Nome:** `UTMIFY_API_KEY`
   - **Valor:** (colar a API Key copiada)
4. Adicionar outro secret (opcional, já está hardcoded):
   - **Nome:** `UTMIFY_PIXEL_ID`
   - **Valor:** `6928b75029dffcb87ec192fd`
5. Salvar

---

## 📝 Passo 3: Deploy das Alterações

### **3.1. Deploy do Landing (Frontend)**

As alterações no frontend já foram feitas:
- ✅ UTMify tracking adicionado em `DataCollectionStep`
- ✅ Envia evento `CompleteRegistration` com dados ricos

**Deploy automático via Vercel:**
```bash
git add .
git commit -m "feat(tracking): add UTMify advanced matching for Meta Pixel"
git push
```

O Vercel vai fazer deploy automático em ~2-3 minutos.

### **3.2. Deploy do Stripe Webhook (Backend)**

**Via Supabase CLI:**
```bash
cd App
npx supabase functions deploy stripe-webhook --project-ref jbucnphyrziaxupdsnbn
```

**OU via Supabase Dashboard:**
1. **Edge Functions** → `stripe-webhook`
2. Atualizar o código com as mudanças
3. Clicar em **"Deploy"**

---

## 🧪 Passo 4: Testar a Integração

### **4.1. Testar Evento CompleteRegistration (Quiz)**

1. Ir para: https://habitz.life/bora
2. Completar o quiz
3. Preencher nome, email e telefone
4. Clicar em **"Criar Minha Conta Grátis"**

**Verificar:**
- ✅ No Console do navegador: `[UTMify] Event tracked: CompleteRegistration`
- ✅ No UTMify Dashboard → **Eventos**: Ver evento `CompleteRegistration`
- ✅ No Meta Events Manager → **Test Events**: Ver evento `CompleteRegistration`

### **4.2. Testar Evento Purchase (Stripe)**

1. Fazer uma compra de teste no Stripe
2. Completar o pagamento

**Verificar:**
- ✅ Logs do Supabase Edge Function: `[UTMify] Purchase event sent successfully`
- ✅ UTMify Dashboard → **Conversões**: Ver compra registrada
- ✅ Meta Events Manager: Ver evento `Purchase` com valor

---

## 📊 Eventos Rastreados

| Evento | Quando | Onde é Enviado | Dados Incluídos |
|--------|--------|----------------|-----------------|
| **PageView** | Carrega página /bora | UTMify Pixel → Meta | URL, UTMs |
| **Lead** | Clica em CTA do quiz | UTMify Pixel → Meta | Email, phone (se capturado) |
| **CompleteRegistration** | Completa quiz | UTMify Pixel → Meta | Email, phone, firstName, lastName, age, gender, profession |
| **InitiateCheckout** | Clica em "Assinar" | UTMify Pixel → Meta | Valor do plano |
| **Purchase** | Pagamento aprovado | Stripe → UTMify API → Meta | Email, phone, valor, transactionId, subscriptionId |

---

## 🎯 Advanced Matching (Otimização)

O UTMify automaticamente envia **Advanced Matching** para o Meta Pixel com os seguintes dados (quando disponíveis):

### **Dados Enviados:**
- ✅ **Email** (hasheado com SHA-256)
- ✅ **Telefone** (hasheado com SHA-256)
- ✅ **Nome** (firstName + lastName, hasheado)
- ✅ **Cidade, Estado, CEP** (da geolocalização IP)
- ✅ **IP Address**
- ✅ **User Agent**
- ✅ **FBC** (Facebook Click ID)
- ✅ **FBP** (Facebook Pixel cookie)

### **Benefícios:**
- 🎯 **Melhor atribuição**: Meta consegue conectar eventos mesmo sem cookies
- 📈 **Audiences melhores**: Lookalike mais precisos
- 💰 **Menor CPA**: Algoritmo aprende mais rápido com dados ricos

---

## ⚙️ Configurações Avançadas no UTMify

### **Marcar InitiateCheckout Automático**

O UTMify Pixel pode detectar automaticamente quando um botão de checkout é clicado.

**Configurar:**
1. UTMify Dashboard → Seu pixel → **Configurações**
2. Procurar **"InitiateCheckout Automático"**
3. Adicionar palavras-chave dos botões:
   - `assinar`
   - `começar agora`
   - `garantir vaga`
   - `criar conta`

Ou configurar via **CSS Match**:
- `.checkout-button`
- `.subscription-cta`

---

## 🔍 Troubleshooting

### **Problema 1: Eventos não aparecem no Meta**

**Verificar:**
1. Meta Pixel está conectado no UTMify?
2. Access Token do Meta está válido?
3. Domínio `habitz.life` está verificado no Meta Business Manager?

**Solução:**
- Ir para Meta Events Manager → **Diagnostics**
- Verificar erros de conexão

### **Problema 2: Purchase não é enviado**

**Verificar:**
1. `UTMIFY_API_KEY` está configurada no Supabase?
2. Webhook do Stripe está ativo?
3. Logs da Edge Function mostram erros?

**Solução:**
```bash
# Ver logs da edge function
npx supabase functions logs stripe-webhook --project-ref jbucnphyrziaxupdsnbn
```

### **Problema 3: Advanced Matching não funciona**

**Verificar:**
1. Dados de email/phone estão sendo capturados?
2. UTMify está fazendo hash correto?

**Solução:**
- Abrir Console do navegador
- Verificar: `localStorage.getItem('lead')`
- Deve conter email, phone, firstName, lastName

---

## 📚 Recursos Adicionais

- **UTMify Central de Ajuda**: https://utmify.help.center
- **Meta Pixel Documentation**: https://developers.facebook.com/docs/meta-pixel
- **Meta Conversions API**: https://developers.facebook.com/docs/marketing-api/conversions-api

---

## ✅ Checklist Final

Antes de rodar campanha no Meta Ads:

- [ ] Meta Pixel conectado no painel do UTMify
- [ ] Access Token do Meta configurado no UTMify
- [ ] UTMIFY_API_KEY configurada no Supabase
- [ ] Landing deployado com código de tracking
- [ ] Stripe webhook deployado
- [ ] Teste de CompleteRegistration funcionando
- [ ] Teste de Purchase funcionando
- [ ] Domínio verificado no Meta Business Manager
- [ ] Pixel ativo no Meta Events Manager
- [ ] Conversions API ativa (servidor para servidor)

---

**Status:** ✅ Código implementado
**Próximo:** Configurar Meta Pixel no UTMify + Testar
**Última atualização:** 2025-12-23
