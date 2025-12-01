# Fluxo Pós-Compra Bora - Integração n8n

## Resumo Executivo

Este documento descreve a integração completa do fluxo pós-compra do app **Bora** (Habitz) utilizando n8n para automação. O fluxo é acionado quando um cliente finaliza a compra no **Kirvano** e automaticamente:

1. Gera um token de acesso único
2. Salva o token no Supabase
3. Envia email de boas-vindas com link para criar senha

---

## Infraestrutura

### Servidores e Credenciais

| Serviço | URL | Credencial |
|---------|-----|------------|
| **n8n** | `https://n8n-evo-n8n.harxon.easypanel.host/` | JWT Token (configurado no MCP) |
| **Supabase** | `jbucnphyrziaxupdsnbn.supabase.co` | Credencial: `Supabase_Habitz` |
| **Gmail** | OAuth2 | Credencial: `Lumen_Gmail` |
| **App Bora** | `https://habitz.life/app/` | - |

### MCP n8n Configurado

Arquivo: `C:\Users\bruno\Documents\Black\Habitz\Prod\.mcp.json`

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "env": {
        "N8N_API_URL": "https://n8n-evo-n8n.harxon.easypanel.host/",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTUxYmUxMC1jOWIxLTRmYjktYjNjMS1jZWE0NDg5OWQ1OGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNDkyNjg1fQ.x9HuQQvznG0dpbbbge4Kwj-uWygw2bjJOreIREX7308"
      }
    }
  }
}
```

---

## Workflow n8n: `bora_pós_compra`

### Estrutura do Workflow

```
┌─────────────────────────────────┐
│  Pagamento_confirmado_kirvano   │  ← Webhook POST recebe payload do Kirvano
│  (Webhook Trigger)              │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│    Gerar Token de Acesso        │  ← Extrai dados e gera token único
│    (Code Node)                  │
└─────────────┬───────────────────┘
              │
      ┌───────┴───────┐
      │               │
      ▼               ▼
┌───────────┐   ┌─────────────────────┐
│  Salvar   │   │  Montar Template    │
│  Token    │   │  HTML               │
│  Supabase │   └──────────┬──────────┘
└───────────┘              │
                           ▼
                  ┌─────────────────────┐
                  │  Extrair Dados      │
                  │  Antes Email        │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Enviar Email via   │  ← PENDENTE: Re-autenticar OAuth
                  │  Gmail              │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Registrar Log      │
                  │  (Opcional)         │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Responder Webhook  │
                  └─────────────────────┘
```

### Webhook URL (Teste)

```
https://n8n-evo-n8n.harxon.easypanel.host/webhook-test/loter-ai-welcome
```

### Payload do Kirvano (Estrutura)

O Kirvano envia webhooks com a seguinte estrutura:

```json
{
  "event": "SALE_APPROVED",
  "Product": {
    "name": "Bora - Programa 30 dias TDAH"
  },
  "Customer": {
    "email": "cliente@email.com",
    "full_name": "Nome do Cliente",
    "first_name": "Nome"
  }
}
```

---

## Nodes do Workflow - Detalhes

### 1. Pagamento_confirmado_kirvano (Webhook)

- **Tipo**: Webhook Trigger
- **Método**: POST
- **Path**: `loter-ai-welcome`
- **Função**: Recebe o payload do Kirvano quando pagamento é aprovado

### 2. Gerar Token de Acesso (Code Node)

**Código JavaScript:**

```javascript
const result = items.map(item => {
  // Extract data from Kirvano webhook payload structure
  const body = item.json.body || {};
  const email = body.Customer?.email;
  const name = body.Customer?.full_name || body.Customer?.first_name || 'Cliente';
  const event = body.event;
  const productName = body.Product?.name;

  if (!email) {
    throw new Error(`Missing required field: email="${email}"`);
  }

  // Generate secure random token (64 characters hex)
  const token = (
    Math.random().toString(16).substring(2) +
    Math.random().toString(16).substring(2) +
    Math.random().toString(16).substring(2) +
    Math.random().toString(16).substring(2) +
    Date.now().toString(16)
  ).substring(0, 64);

  // Token expires in 24 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  return {
    json: {
      email,
      name,
      token,
      expiresAt: expiresAt.toISOString(),
      event,
      productName
    }
  };
});

return result;
```

**Output:**
```json
{
  "email": "cliente@email.com",
  "name": "Nome do Cliente",
  "token": "c5caa4e9b95b3a239dd6bf431d4f48505176346014571acb59119abd59c90b",
  "expiresAt": "2025-11-26T23:29:29.355Z",
  "event": "SALE_APPROVED",
  "productName": "Bora - Programa 30 dias TDAH"
}
```

### 3. Salvar Token no Supabase

- **Credencial**: `Supabase_Habitz`
- **Tabela**: `access_tokens`
- **Operação**: Create Row
- **Campos**:
  - `email`: `{{ $json.email }}`
  - `token`: `{{ $json.token }}`
  - `type`: `password_setup`
  - `expires_at`: `{{ $json.expiresAt }}`

### 4. Montar Template HTML

Gera o HTML do email com:
- Logo Bora com gradiente laranja/âmbar
- Confirmação de pagamento
- Botão CTA "CRIAR MINHA SENHA"
- Link de fallback
- Dados de acesso
- Lista de benefícios
- Botão WhatsApp para suporte

**Link gerado:**
```
https://habitz.life/app/criar-senha?token={{token}}
```

### 5. Enviar Email via Gmail

- **Credencial**: `Lumen_Gmail` (OAuth2)
- **Resource**: Message
- **Operation**: Send
- **Configuração**:
  - **To**: `{{ $json.email }}`
  - **Subject**: `🎉 Seu acesso ao Bora está liberado!`
  - **Email Type**: HTML
  - **Message**: `{{ $json.html }}`
  - **Sender Name**: `Equipe Bora`
  - **Reply To**: `scalewithlumen@gmail.com`

---

## Banco de Dados Supabase

### Tabela: `access_tokens`

**Migration file:** `App/supabase/migrations/20251125100000_access_tokens.sql`

```sql
CREATE TABLE IF NOT EXISTS public.access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'password_setup'
    CHECK (type IN ('password_setup', 'password_reset', 'email_verification')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS access_tokens_token_idx ON public.access_tokens (token);
CREATE INDEX IF NOT EXISTS access_tokens_email_idx ON public.access_tokens (lower(email));
CREATE INDEX IF NOT EXISTS access_tokens_expires_idx ON public.access_tokens (expires_at);

-- RLS enabled
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;
```

### Funções SQL

**validate_access_token(p_token text)**
- Valida se token existe, não foi usado, e não expirou
- Retorna: `is_valid`, `token_email`, `token_type`, `error_message`

**consume_access_token(p_token text)**
- Marca token como usado (sets `used_at = now()`)
- Retorna: boolean

---

## App React - Página CriarSenha

**Arquivo:** `App/src/pages/CriarSenha.tsx`

**Rota:** `/criar-senha?token=xxx`

### Fluxo da Página

1. **Validação do Token**
   - Chama `supabase.rpc("validate_access_token", { p_token: token })`
   - Estados: `loading`, `valid`, `invalid`, `expired`, `used`

2. **Formulário de Senha** (se token válido)
   - Campos: senha, confirmar senha
   - Validação: mínimo 6 caracteres

3. **Criação da Conta**
   - `supabase.auth.signUp({ email: tokenEmail, password })`
   - Consome o token: `supabase.rpc("consume_access_token", { p_token: token })`
   - Atualiza perfil: `profiles.is_premium = true`

4. **Redirecionamento**
   - Sucesso → `/auth` (página de login)

---

## Status da Implementação

### Concluído

- [x] Subject do email: `🎉 Seu acesso ao Bora está liberado!`
- [x] Sender Name: `Equipe Bora`
- [x] Tabela `access_tokens` no Supabase
- [x] Página `/criar-senha` no App
- [x] Template HTML do email com branding Bora
- [x] Credencial Supabase atualizada para `Supabase_Habitz`
- [x] Código do node "Gerar Token de Acesso" corrigido
- [x] Node Supabase testado e funcionando
- [x] MCP n8n configurado com credenciais corretas

### Pendente

- [ ] **Re-autenticar credencial Gmail** (`Lumen_Gmail`)
  - Erro: "The provided authorization grant...is invalid, expired, revoked..."
  - Ação: Fazer OAuth2 novamente no n8n
  - Client ID: `818190458772-7qhvvr0ce4r3lko65ibbbbp73m29v4pp.apps.googleusercontent.com`

- [ ] Testar fluxo completo end-to-end
- [ ] Ativar workflow para produção (trocar webhook-test por webhook)

---

## Como Testar

### 1. Testar via Curl (Webhook)

```bash
curl -X POST "https://n8n-evo-n8n.harxon.easypanel.host/webhook-test/loter-ai-welcome" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "SALE_APPROVED",
    "Product": {
      "name": "Bora - Programa 30 dias TDAH"
    },
    "Customer": {
      "email": "seu-email@teste.com",
      "full_name": "Seu Nome"
    }
  }'
```

### 2. Verificar Token no Supabase

```sql
SELECT * FROM access_tokens ORDER BY created_at DESC LIMIT 5;
```

### 3. Testar Página de Criar Senha

Acesse:
```
https://habitz.life/app/criar-senha?token=TOKEN_GERADO
```

---

## Troubleshooting

### Erro: "email=undefined"

**Causa:** Código do node estava acessando estrutura errada do payload.

**Solução:** O código foi atualizado para acessar:
- `body.Customer?.email` (correto)
- Em vez de `body.email` (incorreto)

### Erro: Gmail OAuth Expired

**Causa:** Token de refresh do OAuth2 expirou ou foi revogado.

**Solução:**
1. Abrir workflow no n8n
2. Clicar no node "Enviar Email via Gmail"
3. Clicar no ícone de editar credencial
4. Clicar "Sign in with Google"
5. Completar autenticação
6. Salvar credencial

### Erro: Supabase Connection

**Causa:** Credencial errada (estava usando `Loteria.sup`).

**Solução:** Alterada para `Supabase_Habitz`.

---

## Contatos e Suporte

- **WhatsApp Suporte:** +55 11 99337-1766
- **Email Reply-To:** scalewithlumen@gmail.com

---

## Changelog

| Data | Alteração |
|------|-----------|
| 2025-11-25 | Criação inicial do fluxo |
| 2025-11-25 | Correção do código de extração do payload Kirvano |
| 2025-11-25 | Atualização da credencial Supabase |
| 2025-11-25 | Configuração do MCP n8n |
| 2025-11-25 | Identificado problema com OAuth Gmail (pendente) |

---

## Próximos Passos

1. **Imediato:** Re-autenticar Gmail OAuth no n8n
2. **Após Gmail:** Executar teste completo do fluxo
3. **Produção:** Ativar workflow (mudar de webhook-test para webhook)
4. **Monitoramento:** Configurar alertas para falhas no workflow
