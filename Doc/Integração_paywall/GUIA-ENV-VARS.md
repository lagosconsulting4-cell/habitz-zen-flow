# 🔧 Guia Completo de Environment Variables - Habitz

**Data:** 10/11/2025
**Objetivo:** Configurar todas as variáveis de ambiente necessárias para Edge Functions

---

## 📍 Onde Configurar

**Supabase Dashboard:**
1. Vá em: **Settings** (engrenagem no lado esquerdo)
2. Clique em: **Edge Functions**
3. Role até: **Environment Variables**
4. Clique em: **Add Variable**

---

## 📋 Variáveis Obrigatórias

### 1. SUPABASE_URL (ou PROJECT_URL)

**Descrição:** URL do projeto Supabase

**Valor:**
```
https://jbucnphyrziaxupdsnbn.supabase.co
```

**Observação:** Alguns Edge Functions usam `SUPABASE_URL`, outros `PROJECT_URL`. Configure **ambos** para compatibilidade:

```
SUPABASE_URL=https://jbucnphyrziaxupdsnbn.supabase.co
PROJECT_URL=https://jbucnphyrziaxupdsnbn.supabase.co
```

---

### 2. SUPABASE_SERVICE_ROLE_KEY (ou SERVICE_ROLE_KEY)

**Descrição:** Chave de admin para bypassa RLS e criar usuários

**Valor:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg
```

**⚠️ IMPORTANTE:** Esta chave é **SENSÍVEL**! Nunca commite no Git, nunca exponha no frontend.

**Onde encontrar:**
- Settings → API → Project API keys → **service_role key (secret)**

Configure **ambos** os nomes:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SERVICE_ROLE_KEY=eyJhbGci...
```

---

### 3. SUPABASE_ANON_KEY

**Descrição:** Chave pública para operações client-side (envio de email de recuperação)

**Valor:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTgwMDAsImV4cCI6MjA3NDI5NDAwMH0.efSqtvDu7LZ5r_J0pH7xXsE6TUpC3ZY5C1hhsCfpJJw
```

**Onde encontrar:**
- Settings → API → Project API keys → **anon public key**

```
SUPABASE_ANON_KEY=eyJhbGci...
```

---

### 4. APP_URL

**Descrição:** URL do app React para redirect após criação de senha

**Valor:**
```
https://www.habitz.life/app
```

**⚠️ SEM barra final!**

```
APP_URL=https://www.habitz.life/app
```

---

### 5. KIRVANO_WEBHOOK_TOKEN

**Descrição:** Token secreto para validar requests da Kirvano

**Como gerar:**

Opção A - Terminal (Node.js):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Opção B - Terminal (OpenSSL):
```bash
openssl rand -hex 32
```

Opção C - Manual:
```
habitz_kirvano_2025_super_secreto_xyz123abc
```

**Exemplo de valor:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Adicione:**
```
KIRVANO_WEBHOOK_TOKEN=a1b2c3d4e5f6...
```

**⚠️ CRÍTICO:** O **MESMO TOKEN** deve ser configurado na **Kirvano**!

---

## 📊 Resumo das Variáveis

Copie e cole no Supabase (ajuste os valores):

```bash
# URLs
SUPABASE_URL=https://jbucnphyrziaxupdsnbn.supabase.co
PROJECT_URL=https://jbucnphyrziaxupdsnbn.supabase.co
APP_URL=https://www.habitz.life/app

# Keys
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTgwMDAsImV4cCI6MjA3NDI5NDAwMH0.efSqtvDu7LZ5r_J0pH7xXsE6TUpC3ZY5C1hhsCfpJJw

# Webhook Token (GERAR UM NOVO)
KIRVANO_WEBHOOK_TOKEN=seu_token_secreto_aqui
```

---

## 🔐 Configurar Token na Kirvano

Depois de configurar `KIRVANO_WEBHOOK_TOKEN` no Supabase:

### Passo 1: Acessar Dashboard Kirvano

1. Login em: https://app.kirvano.com
2. Vá em: **Configurações** → **Webhooks**

### Passo 2: Adicionar Webhook

**URL:**
```
https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/kirvano-webhook
```

**Método:** POST

**Headers:**
```
Content-Type: application/json
x-kirvano-token: [MESMO TOKEN DO SUPABASE]
```

**Eventos:**
- ✅ Marque: `SALE_APPROVED`

### Passo 3: Testar

Clique em "Testar Webhook" para enviar payload de teste.

**Resultado esperado:**
```json
{
  "success": true,
  "user_id": "...",
  "is_new_user": true,
  "sale_id": "...",
  "product": "..."
}
```

---

## 🧪 Validar Configuração

### Teste 1: Verificar env vars no Supabase

```bash
# Via curl (teste se Edge Function consegue acessar as vars)
curl -X POST https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/kirvano-webhook \
  -H "Content-Type: application/json" \
  -H "x-kirvano-token: SEU_TOKEN" \
  -d '{"event":"SALE_APPROVED","customer":{"email":"teste@test.com"},"sale_id":"test-001","total_price":"97.00"}'
```

**Se retornar 401 "Unauthorized":**
- ❌ `KIRVANO_WEBHOOK_TOKEN` não está configurado
- ❌ Ou token enviado está diferente

**Se retornar 500 "Misconfigured":**
- ❌ `SUPABASE_URL` ou `SERVICE_ROLE_KEY` não está configurado

**Se retornar 200 com JSON:**
- ✅ Tudo configurado corretamente!

---

### Teste 2: Verificar logs

Vá em: **Supabase → Edge Functions → kirvano-webhook → Logs**

Deve aparecer:
```
[kirvano-webhook] 🚀 === INÍCIO DA REQUISIÇÃO ===
[kirvano-webhook] 🔍 Method: POST
[kirvano-webhook] 🔐 Token validation: Token provided
[kirvano-webhook] ✅ Token válido
[kirvano-webhook] 📋 Event: SALE_APPROVED
[kirvano-webhook] 👤 Cliente: Cliente Habitz <teste@test.com>
[kirvano-webhook] ✨ Usuário não existe, criando...
[kirvano-webhook] ✅ Novo usuário criado: ...
[kirvano-webhook] ✅ Purchase registrada com sucesso
[kirvano-webhook] 🎉 Processamento concluído com sucesso!
```

Se NÃO aparecer logs:
- ❌ Edge Function não está sendo chamado
- ❌ Ou está falhando antes de qualquer log

---

## 🚨 Troubleshooting

### Erro: "Missing SUPABASE_URL or SERVICE_ROLE_KEY"

**Causa:** Env vars não configuradas

**Solução:**
1. Vá em Settings → Edge Functions → Environment Variables
2. Adicione:
   - `SUPABASE_URL` ou `PROJECT_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` ou `SERVICE_ROLE_KEY`
3. Salve
4. **Aguarde 1-2 minutos** para propagar
5. Teste novamente

---

### Erro: "Unauthorized" (401)

**Causa:** Token inválido ou não enviado

**Solução:**
1. Verifique se `KIRVANO_WEBHOOK_TOKEN` está configurado no Supabase
2. Verifique se está enviando header `x-kirvano-token` com o MESMO valor
3. Tokens são case-sensitive!

---

### Erro: "Internal Server Error" (500)

**Causas possíveis:**
1. Erro no código da Edge Function
2. Erro ao conectar no banco
3. Erro ao criar usuário

**Solução:**
1. Vá em: Edge Functions → Logs
2. Encontre o erro exato
3. Veja a stack trace

---

## 📝 Checklist de Configuração

Antes de fazer deploy:

- [ ] `SUPABASE_URL` configurado
- [ ] `PROJECT_URL` configurado (redundância)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
- [ ] `SERVICE_ROLE_KEY` configurado (redundância)
- [ ] `SUPABASE_ANON_KEY` configurado
- [ ] `APP_URL` configurado (sem barra final)
- [ ] `KIRVANO_WEBHOOK_TOKEN` gerado e configurado
- [ ] Mesmo token configurado na Kirvano
- [ ] Testado com curl
- [ ] Logs aparecendo no Supabase
- [ ] Webhook URL configurado na Kirvano: `https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/kirvano-webhook`

---

## 🔄 Após Mudanças

**IMPORTANTE:** Sempre que alterar env vars:

1. ✅ Salve as alterações
2. ✅ Aguarde 1-2 minutos para propagar
3. ✅ **NÃO precisa** redeploy da Edge Function (env vars são runtime)
4. ✅ Teste novamente

---

## 📦 Backup das Env Vars

Salve este documento com seus valores preenchidos em local seguro:

```bash
# BACKUP - HABITZ ENV VARS (NÃO COMMITAR NO GIT!)

SUPABASE_URL=https://jbucnphyrziaxupdsnbn.supabase.co
PROJECT_URL=https://jbucnphyrziaxupdsnbn.supabase.co
APP_URL=https://www.habitz.life/app

SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_ANON_KEY=eyJhbGci...

KIRVANO_WEBHOOK_TOKEN=seu_token_aqui
```

---

**Última atualização:** 10/11/2025
**Mantido por:** Bruno Falci

**Com todas as env vars configuradas, seu fluxo de pagamento funcionará perfeitamente! 🚀**
