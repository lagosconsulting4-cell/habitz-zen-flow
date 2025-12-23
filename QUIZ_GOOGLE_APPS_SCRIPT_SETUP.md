# ✅ Quiz Integration com Google Apps Script - SUPER SIMPLES!

## 🎯 Por que Google Apps Script é Melhor:

- ✅ **100% GRÁTIS** - Sem limites
- ✅ **Não vai para SPAM** - Email vem da sua conta Google
- ✅ **Dashboard Automático** - Google Sheets com todos os leads
- ✅ **Mais fácil** - Apenas 3 passos de 5 minutos

---

## 🚀 Setup Completo (3 Passos - 15 min):

### **📌 Passo 1: Aplicar Migration no Supabase (2 min)**

1. Abrir **Supabase Dashboard** → **SQL Editor**
2. Copiar e executar o SQL de:
```
App/supabase/migrations/20251223000000_create_quiz_responses.sql
```
3. Verificar se a tabela `quiz_responses` foi criada

---

### **📌 Passo 2: Configurar Google Apps Script (10 min)**

#### **2.1. Criar o Script:**

1. Ir para: **https://script.google.com**
2. Clicar em **"Novo projeto"**
3. Nomear: `Habitz Quiz Webhook`
4. Deletar o código padrão
5. Copiar e colar o código de:
```
google-apps-script-quiz-webhook.js
```
6. Clicar em **"Salvar"** (ícone de disquete)

#### **2.2. Testar o Script:**

1. Na função dropdown (topo), selecionar: `testWebhook`
2. Clicar em **"Executar"**
3. **PRIMEIRA VEZ:** Vai pedir permissões:
   - Clicar em **"Revisar permissões"**
   - Escolher sua conta Google
   - Clicar em **"Avançado"**
   - Clicar em **"Ir para Habitz Quiz Webhook (não seguro)"**
   - Clicar em **"Permitir"**
4. Executar novamente `testWebhook`
5. **Verificar:**
   - ✅ Email de teste chegou em `scalewithlumen@gmail.com`
   - ✅ Planilha criada no Google Drive: `Quiz Leads - Habitz`

#### **2.3. Deploy como Web App:**

1. Clicar em **"Implantar"** (topo direito) → **"Nova implantação"**
2. Clicar no ícone de **engrenagem** ⚙️ → **"Aplicativo da Web"**
3. Configurar:
   - **Descrição:** `Habitz Quiz Webhook v1`
   - **Executar como:** `Eu (seu-email@gmail.com)`
   - **Quem tem acesso:** `Qualquer pessoa`
4. Clicar em **"Implantar"**
5. **Copiar a URL** que aparece (algo como: `https://script.google.com/macros/s/AKfycby.../exec`)
6. Clicar em **"Concluído"**

**⚠️ IMPORTANTE:** Guarde essa URL! Você vai usar no próximo passo.

---

### **📌 Passo 3: Configurar Supabase Edge Function (3 min)**

#### **3.1. Adicionar URL no Supabase:**

1. **Supabase Dashboard** → **Settings** → **Edge Functions**
2. Clicar em **"Manage Secrets"**
3. Adicionar novo secret:
   - **Nome:** `GOOGLE_APPS_SCRIPT_URL`
   - **Valor:** (colar a URL copiada no passo 2.3)
4. Salvar

#### **3.2. Deploy da Edge Function:**

1. **Supabase Dashboard** → **Edge Functions** → **"Create new function"**
2. Nome: `quiz-notification-google`
3. Copiar código de:
```
App/supabase/functions/quiz-notification-google/index.ts
```
4. Clicar em **"Deploy"**

**OU via CLI:**
```bash
cd App
npx supabase functions deploy quiz-notification-google --project-ref jbucnphyrziaxupdsnbn
```

#### **3.3. Atualizar o Código do Quiz:**

No arquivo `Landing/src/components/quiz/steps/DataCollectionStep.tsx`, trocar:

**DE:**
```typescript
supabase.functions.invoke('quiz-notification', { body: quizData })
```

**PARA:**
```typescript
supabase.functions.invoke('quiz-notification-google', { body: quizData })
```

---

## ✅ Pronto! Agora Testar:

### **Teste Completo:**

1. Ir para: https://habitz.life/bora (ou localhost se ainda não fez deploy)
2. Clicar em **"Começar agora"**
3. Completar o quiz
4. Preencher nome/email/telefone
5. Clicar em **"Criar Minha Conta Grátis"**

### **Verificar:**

**1. Email chegou:**
- Verificar inbox de `scalewithlumen@gmail.com`
- Subject: `🎉 Novo Lead BORA: [Nome] ([email])`
- Email bonito com todos os dados

**2. Dados na planilha:**
- Abrir Google Drive: https://drive.google.com
- Procurar planilha: `Quiz Leads - Habitz`
- Ver nova linha com todos os dados do lead

**3. Dados no Supabase:**
```sql
SELECT * FROM quiz_responses ORDER BY created_at DESC LIMIT 5;
```

---

## 📊 Sua Planilha Automática:

A planilha `Quiz Leads - Habitz` vai ter todas as colunas:

| Data/Hora | Nome | Email | Telefone | Idade | Profissão | ... | Converteu? |
|-----------|------|-------|----------|-------|-----------|-----|------------|
| 23/12 10:30 | João Silva | joao@email.com | (11) 99999-9999 | 25-34 | Designer | ... | Não |

**Colunas:**
- Data/Hora
- Nome, Email, Telefone
- Idade, Profissão, Gênero, Faixa Financeira
- Objetivo, Tempo Disponível, Pico de Energia, Horário de Trabalho
- Desafios
- Sentimento Consistência, Projeção Futura, Anos Prometendo
- **Converteu?** (você pode marcar manualmente)
- Todas as Respostas (JSON backup completo)

---

## 🎨 Personalizações (Opcional):

### **Mudar Email de Destino:**

No Google Apps Script, linha 17:
```javascript
EMAIL_TO: "scalewithlumen@gmail.com", // TROCAR AQUI
```

### **Mudar Nome da Planilha:**

No Google Apps Script, linha 20:
```javascript
SHEET_NAME: "Quiz Leads - Habitz", // TROCAR AQUI
```

### **Customizar Email:**

Editar a função `buildEmailHtml` no Apps Script (linha 130+)

---

## 📧 Exemplo de Email que Você Vai Receber:

```
De: Seu Nome <seu-email@gmail.com>
Para: scalewithlumen@gmail.com
Assunto: 🎉 Novo Lead BORA: João Silva (joao@email.com)

[Email HTML formatado com:]

🎉 Novo Lead do Quiz BORA!

📋 Dados Pessoais
Nome: João Silva
Email: joao@email.com (clicável)
Telefone: (11) 99999-9999 (clicável)

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
[Procrastinação] [Falta de foco] [Ansiedade]

💭 Estado Emocional
Sentimento de Consistência: Frustrante
Como se Projeta: Esperançoso
Anos Prometendo: 1-3 anos

🚀 Próximos Passos
Este lead completou o quiz e está na página de assinatura.
Entre em contato em até 24h para aumentar conversão!
```

---

## 🔄 Atualizar o Script (Depois de Implantado):

Se você fizer mudanças no código do Apps Script:

1. Editar o código no **script.google.com**
2. Salvar (Ctrl+S)
3. **Implantar** → **Gerenciar implantações**
4. Clicar no ícone ✏️ da implantação ativa
5. Em **"Versão"**, selecionar: **"Nova versão"**
6. Clicar em **"Implantar"**

**⚠️ Importante:** A URL permanece a mesma! Não precisa atualizar no Supabase.

---

## ⚠️ Troubleshooting:

### **Email não chegou:**
- Verificar **Spam** de `scalewithlumen@gmail.com`
- Verificar **Logs** do Apps Script:
  - No script.google.com → **"Execuções"** (ícone de relógio)
  - Ver se teve erro
- Executar função `testWebhook` manualmente para testar

### **Erro "URL not configured":**
- Verificar se `GOOGLE_APPS_SCRIPT_URL` foi adicionado nos Secrets do Supabase
- URL deve terminar com `/exec`
- URL deve começar com `https://script.google.com/macros/s/`

### **Erro de permissão no Apps Script:**
- Seguir o fluxo de autorização completo (Passo 2.2)
- Pode precisar clicar em "Avançado" e "Ir para... (não seguro)"
- É seguro porque é o SEU próprio script

### **Planilha não está sendo criada:**
- Verificar **Google Drive** → Ordenar por **"Última modificação"**
- Nome padrão: `Quiz Leads - Habitz`
- Se não aparecer, rodar `testWebhook` manualmente

---

## 📊 Analytics e Conversão:

### **Marcar Lead como Convertido:**

Quando alguém comprar, você pode:

1. **Na Planilha:**
   - Trocar "Não" para "Sim" na coluna **"Converteu?"**

2. **No Supabase:**
```sql
UPDATE quiz_responses
SET converted_to_customer = true
WHERE email = 'cliente@email.com';
```

### **Ver Taxa de Conversão:**

No Supabase:
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

Na Planilha:
- Usar fórmulas do Google Sheets para calcular automaticamente

---

## 🎁 BONUS: Adicionar Gráficos na Planilha:

1. Na planilha, clicar em **"Inserir"** → **"Gráfico"**
2. Tipo: **Gráfico de pizza** ou **Barra**
3. Dados: Selecionar coluna **"Objetivo"** ou **"Profissão"**
4. Criar dashboard visual dos seus leads!

---

## 🚀 Próximos Passos (Opcional):

Depois que estiver funcionando, posso ajudar com:

1. **Remarketing Automático** - Email automático 24h depois se não comprou
2. **WhatsApp Integration** - Notificação no WhatsApp quando novo lead
3. **Dashboard Avançado** - Google Data Studio conectado na planilha
4. **Auto-conversão** - Marcar automaticamente quando Stripe processar pagamento

---

**Status:** ✅ Código criado
**Tempo de setup:** ~15 minutos
**Custo:** R$ 0,00 (100% grátis!)

---

**Última atualização:** 2025-12-23 (00:45)
**Método:** Google Apps Script + Google Sheets
