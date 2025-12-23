# ✅ Quiz Integration - Salvamento de Dados e Notificação por Email

## 📋 O que foi implementado:

### 1. **Tabela no Supabase: `quiz_responses`**
- ✅ Arquivo: `App/supabase/migrations/20251223000000_create_quiz_responses.sql`
- ✅ Armazena todos os dados do quiz (nome, email, telefone, respostas)
- ✅ Políticas RLS configuradas (public insert, authenticated read)
- ✅ Índices para performance
- ✅ Trigger para updated_at automático

**Campos salvos:**
- **Dados Pessoais:** name, email, phone
- **Demografia:** age_range, profession, work_schedule, gender, financial_range
- **Preferências:** energy_peak, time_available, objective, challenges (array)
- **Emocional:** consistency_feeling, projected_feeling, years_promising
- **Rotina:** week_days, week_days_preset, recommended_habits
- **Metadata:** created_at, updated_at, completed, converted_to_customer, user_id
- **Analytics:** source, utm_source, utm_medium, utm_campaign

### 2. **Edge Function: `quiz-notification`**
- ✅ Arquivo: `App/supabase/functions/quiz-notification/index.ts`
- ✅ Envia email para `scalewithlumen@gmail.com` quando alguém completa o quiz
- ✅ Email HTML formatado com todos os dados do lead
- ✅ Usa Resend API para envio de emails
- ✅ CORS configurado

**Email inclui:**
- 📋 Dados pessoais (nome, email, telefone)
- 👤 Perfil (idade, profissão, gênero, faixa financeira)
- 🎯 Preferências (objetivo, tempo disponível, pico de energia)
- 💪 Desafios selecionados
- 💭 Estado emocional

### 3. **Integração no Quiz (Landing)**
- ✅ Arquivo modificado: `Landing/src/components/quiz/steps/DataCollectionStep.tsx`
- ✅ Criado: `Landing/src/integrations/supabase/client.ts`
- ✅ Criado: `Landing/.env.local` com credenciais Supabase
- ✅ Salva dados no Supabase quando usuário preenche nome/email/telefone
- ✅ Envia notificação por email automaticamente (não-bloqueante)
- ✅ Tratamento de erros

---

## 🚀 Passo a Passo para Deploy:

### **Passo 1: Aplicar Migration no Supabase**

1. Abrir **Supabase Dashboard** → **SQL Editor**
2. Copiar e executar o SQL de: `App/supabase/migrations/20251223000000_create_quiz_responses.sql`
3. Verificar se a tabela `quiz_responses` foi criada

**OU via CLI:**
```bash
cd App
npx supabase db push
```

### **Passo 2: Configurar Resend (Email Service)**

1. **Criar conta no Resend:**
   - Ir para: https://resend.com
   - Criar conta gratuita (50 emails/dia grátis)
   - Verificar email

2. **Obter API Key:**
   - Dashboard → **API Keys**
   - Clicar em **"Create API Key"**
   - Nome: `Habitz Quiz Notifications`
   - Copiar a chave (começa com `re_`)

3. **Configurar domínio (OPCIONAL - mas recomendado):**
   - Dashboard → **Domains**
   - Adicionar: `habitz.life`
   - Seguir instruções para verificar DNS
   - **OU** usar domínio de teste: `onboarding.resend.dev` (mas emails vão para spam)

### **Passo 3: Adicionar Secret no Supabase**

1. **Supabase Dashboard** → **Settings** → **Edge Functions**
2. Clicar em **"Manage Secrets"**
3. Adicionar novo secret:
   - **Nome:** `RESEND_API_KEY`
   - **Valor:** (colar a API key do Resend)
4. Salvar

### **Passo 4: Deploy da Edge Function**

1. **Via Supabase Dashboard (Recomendado):**
   - **Edge Functions** → **"Create new function"**
   - Nome: `quiz-notification`
   - Copiar código de: `App/supabase/functions/quiz-notification/index.ts`
   - Clicar em **"Deploy"**

2. **OU via CLI:**
```bash
cd App
npx supabase functions deploy quiz-notification --project-ref jbucnphyrziaxupdsnbn
```

### **Passo 5: Deploy do Landing (Vercel/Netlify)**

O código do Landing já foi atualizado. Basta fazer commit e push:

```bash
git add .
git commit -m "feat(quiz): integrate Supabase storage and email notifications"
git push
```

Se você usa deploy automático (Vercel/Netlify), ele vai fazer o deploy automaticamente.

**IMPORTANTE:** Adicionar variáveis de ambiente no Vercel/Netlify:
- `VITE_SUPABASE_URL` = `https://jbucnphyrziaxupdsnbn.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (a chave já está no código)

---

## 🧪 Como Testar:

### **Teste Completo:**

1. Ir para: https://habitz.life/bora
2. Clicar em **"Começar agora"** ou **"Fazer Quiz"**
3. Responder todas as perguntas do quiz
4. Preencher nome, email e telefone no final
5. Clicar em **"Criar Minha Conta Grátis"**

### **Verificar se Funcionou:**

**1. Dados salvos no Supabase:**
```sql
-- Executar no SQL Editor do Supabase
SELECT * FROM quiz_responses ORDER BY created_at DESC LIMIT 5;
```

**Resultado esperado:**
- Ver o registro com nome, email, telefone
- Ver todas as respostas do quiz preenchidas
- `created_at` com timestamp recente

**2. Email recebido:**
- Verificar inbox de `scalewithlumen@gmail.com`
- Subject: `🎉 Novo Lead: [Nome] ([email])`
- Email HTML formatado com todos os dados do quiz

**3. Logs da Edge Function:**
- **Supabase Dashboard** → **Edge Functions** → `quiz-notification`
- Aba **"Logs"**
- Ver: `"Email sent successfully"`

---

## 📊 Consultas SQL Úteis:

### **Ver todos os leads do quiz:**
```sql
SELECT
  name,
  email,
  phone,
  age_range,
  profession,
  objective,
  created_at,
  converted_to_customer
FROM quiz_responses
ORDER BY created_at DESC;
```

### **Ver leads que ainda não viraram clientes:**
```sql
SELECT
  name,
  email,
  phone,
  objective,
  challenges,
  created_at
FROM quiz_responses
WHERE converted_to_customer = false
ORDER BY created_at DESC;
```

### **Taxa de conversão:**
```sql
SELECT
  COUNT(*) as total_leads,
  SUM(CASE WHEN converted_to_customer THEN 1 ELSE 0 END) as convertidos,
  ROUND(
    SUM(CASE WHEN converted_to_customer THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100,
    2
  ) as taxa_conversao_percent
FROM quiz_responses;
```

### **Leads por objetivo:**
```sql
SELECT
  objective,
  COUNT(*) as total,
  SUM(CASE WHEN converted_to_customer THEN 1 ELSE 0 END) as convertidos
FROM quiz_responses
WHERE objective IS NOT NULL
GROUP BY objective
ORDER BY total DESC;
```

---

## 🔗 Vincular Lead com Cliente Pagante:

Quando alguém paga no Stripe, você pode vincular o lead com a compra:

```sql
-- Atualizar quando cliente comprar
UPDATE quiz_responses
SET
  converted_to_customer = true,
  user_id = (SELECT id FROM auth.users WHERE email = 'cliente@email.com'),
  updated_at = now()
WHERE email = 'cliente@email.com';
```

Ou criar um trigger automático quando purchase for criada! (Posso implementar depois se quiser)

---

## ⚠️ Troubleshooting:

### **Erro: "Failed to save quiz data"**
- **Causa:** Tabela `quiz_responses` não foi criada
- **Solução:** Executar migration SQL no Supabase

### **Erro: "Email notification failed"**
- **Causa:** RESEND_API_KEY não configurada
- **Solução:** Adicionar secret no Supabase (Passo 3)
- **Verificar:** Edge Function está deployada

### **Email não chegou**
- **Verificar:** Spam/Lixeira de `scalewithlumen@gmail.com`
- **Verificar:** Logs da edge function no Supabase
- **Causa comum:** Domínio não verificado no Resend (emails vão para spam)
- **Solução:** Verificar domínio `habitz.life` no Resend

### **Erro: "Supabase client not configured"**
- **Causa:** Variáveis de ambiente não configuradas no Vercel/Netlify
- **Solução:** Adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no deploy

---

## 📧 Formato do Email que Você Vai Receber:

```
De: BORA Quiz <noreply@habitz.life>
Para: scalewithlumen@gmail.com
Assunto: 🎉 Novo Lead: João Silva (joao@email.com)

[Email HTML bonito com:]

🎉 Novo Lead do Quiz BORA!
Alguém completou o quiz e está pronto para assinar

📋 Dados Pessoais
Nome: João Silva
Email: joao@email.com
Telefone: (11) 99999-9999

👤 Perfil
Idade: 25-34 anos
Profissão: Designer
Gênero: Masculino
Faixa Financeira: R$ 3.000 - R$ 6.000

🎯 Preferências
Objetivo: Produtividade
Tempo Disponível: 15-30 minutos
Pico de Energia: Manhã
Horário de Trabalho: Comercial (9h-18h)

💪 Desafios
Procrastinação | Falta de foco | Ansiedade

💭 Estado Emocional
Sentimento de Consistência: Frustrante
Como se Projeta: Esperançoso
Anos Prometendo: 1-3 anos

🚀 Próximos Passos
Este lead completou o quiz e está na página de assinatura.
Entre em contato em até 24h para aumentar conversão!
```

---

## 🎯 Próximos Passos (Opcional):

Depois que estiver funcionando, posso implementar:

1. **Dashboard de Leads** - Ver todos os leads em tempo real
2. **Remarketing Automático** - Email automático para quem abandonou
3. **Integração com WhatsApp** - Notificação no WhatsApp quando novo lead
4. **CRM Simples** - Marcar leads como "Contatado", "Negociando", etc.
5. **Vincular automaticamente** - Quando alguém paga, marcar como convertido

---

**Status:** ✅ Código implementado
**Próximo:** Executar os 5 passos de deploy acima
**Tempo estimado:** 15-20 minutos

---

**Última atualização:** 2025-12-23 (00:15)
**Responsável:** Claude Code
