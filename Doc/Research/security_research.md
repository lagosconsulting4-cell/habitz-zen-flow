# Guia Completo de Cibersegurança para React PWA com Supabase e Vercel

Um aplicativo de gerenciamento de hábitos com repositório público no GitHub enfrenta **riscos elevados de exposição de credenciais e vazamento de dados pessoais**. Este guia mapeia todos os pontos críticos de segurança na sua stack específica, priorizando as implementações mais urgentes. A boa notícia: o Supabase oferece Row Level Security robusto e o Vercel fornece HTTPS automático, mas a configuração incorreta pode expor completamente seu banco de dados. Os três erros mais fatais nessa arquitetura são: (1) não habilitar RLS em tabelas públicas, (2) expor a `service_role` key no frontend, e (3) commitar arquivos `.env` no repositório público.

---

## 1. Segurança do Supabase: o coração da proteção de dados

O Supabase é simultaneamente seu maior aliado e ponto de vulnerabilidade mais crítico. Sem Row Level Security (RLS) configurado, **qualquer usuário autenticado pode ler e modificar todos os dados do banco**.

### Row Level Security (RLS) - CRÍTICO

Tabelas criadas via SQL Editor **NÃO** têm RLS habilitado por padrão (diferente do Dashboard). Este é o erro mais comum:

```sql
-- Tabela de hábitos com RLS completo
CREATE TABLE public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CRÍTICO: Habilitar RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Políticas por operação
CREATE POLICY "Users can view own habits"
ON public.habits FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
ON public.habits FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
ON public.habits FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
ON public.habits FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Criar índice para performance das políticas RLS
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
```

### Proteção de API Keys - CRÍTICO

A `anon key` pode ser exposta no frontend. A `service_role` key **JAMAIS**:

| Tipo de Key | Exposição | Uso Correto |
|-------------|-----------|-------------|
| `anon` / Publishable | Segura no cliente | Browser, React app |
| `service_role` / Secret | **NUNCA expor** | Apenas servidor/backend |

```javascript
// ✅ SEGURO: Cliente com anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ⚠️ APENAS NO SERVIDOR: service_role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // SEM prefixo NEXT_PUBLIC_
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

### Configurações de Autenticação Recomendadas

No Dashboard do Supabase → Authentication → Settings:

- **Senha mínima**: 12 caracteres (o padrão é 8)
- **Exigir**: dígitos, maiúsculas, minúsculas, símbolos
- **Prevenir senhas vazadas**: Ativar (usa HaveIBeenPwned API - Plano Pro+)
- **Confirmação de email**: Obrigatório
- **CAPTCHA**: Ativar Turnstile ou hCaptcha
- **Detectar tokens comprometidos**: Ativar

### Proteção contra SQL Injection

O cliente Supabase **parametriza automaticamente** todas as queries. O único padrão perigoso é interpolação de strings no filtro `.or()`:

```javascript
// ❌ VULNERÁVEL: String interpolation
const { data } = await supabase
  .from('habits')
  .select()
  .or(`user_id.eq.${untrustedInput}`); // SQL INJECTION!

// ✅ SEGURO: Métodos do cliente
const { data } = await supabase
  .from('habits')
  .select()
  .eq('user_id', userId);
```

---

## 2. Segurança do Frontend React PWA

### Proteção contra XSS - CRÍTICO

O React escapa JSX automaticamente, mas existem **3 APIs perigosas** que bypassam essa proteção:

```jsx
// ❌ PERIGOSO: Bypassa escape do React
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ❌ PERIGOSO: URLs javascript:
<a href={userControlledUrl}>Link</a>

// ❌ PERIGOSO: Manipulação direta do DOM
ref.current.innerHTML = userInput;

// ✅ SEGURO: Sanitização obrigatória se usar dangerouslySetInnerHTML
import DOMPurify from 'dompurify';
const sanitizedHtml = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
  ALLOWED_ATTR: ['href', 'title']
});
<div dangerouslySetInnerHTML={{__html: sanitizedHtml}} />

// ✅ SEGURO: Validação de URLs
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};
```

### Content Security Policy (CSP) - CRÍTICO

Configure no `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        }
      ]
    }
  ]
}
```

### Armazenamento Seguro de Tokens - CRÍTICO

**Nunca use localStorage para tokens de autenticação** em aplicações que processam dados pessoais:

| Método | Vulnerável a XSS | Vulnerável a CSRF | Recomendação |
|--------|------------------|-------------------|--------------|
| localStorage | ✅ Sim | ❌ Não | ❌ Não usar |
| sessionStorage | ✅ Sim | ❌ Não | ⚠️ Sessões curtas |
| HttpOnly Cookies | ❌ Não | ✅ Sim (mitigável) | ✅ Recomendado |
| Memória (state) | Mínimo | ❌ Não | ✅ Para access tokens |

O Supabase Auth gerencia tokens automaticamente, mas configure `persistSession` adequadamente:

```javascript
const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage, // Aceitável para apps de hábitos
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

### Service Worker Seguro - CRÍTICO

```javascript
// sw.js - Regras de segurança para cache
const ALLOWED_ORIGINS = [
  self.location.origin,
  'https://fonts.googleapis.com'
];

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // NUNCA cachear requisições de API com tokens
  if (request.url.includes('/api/') || 
      request.url.includes('supabase.co')) {
    return; // Não interceptar
  }
  
  // Verificar origem permitida
  if (!ALLOWED_ORIGINS.some(origin => request.url.startsWith(origin))) {
    return;
  }
  
  // Cache apenas para assets estáticos GET
  if (request.method !== 'GET') return;
  
  // ...implementação de cache
});
```

---

## 3. Segurança do GitHub com repositório público

Em 2024, o GitHub detectou **mais de 1 milhão de secrets vazados** em repositórios públicos nas primeiras 8 semanas do ano. Com repositório público, qualquer credencial commitada fica **permanentemente exposta** no histórico do Git.

### O que NUNCA commitar - CRÍTICO

```gitignore
# .gitignore COMPLETO para sua stack

# ========== CRÍTICO: SECRETS ==========
.env
.env.*
!.env.example
*.pem
*.key
credentials.json
service-account*.json
secrets/

# ========== Dependencies ==========
node_modules/

# ========== Build ==========
.next/
out/
dist/
build/

# ========== Vercel ==========
.vercel

# ========== IDE ==========
.vscode/
.idea/

# ========== OS ==========
.DS_Store
Thumbs.db

# ========== Logs ==========
*.log
logs/

# ========== Database ==========
*.sqlite
*.db
```

### Configurações de Segurança do GitHub - CRÍTICO

Ative em **Settings → Code security and analysis**:

| Feature | Prioridade | Ação |
|---------|------------|------|
| Secret Scanning | CRÍTICO | Detecta 200+ tipos de secrets |
| Push Protection | CRÍTICO | Bloqueia commits com secrets (ativo por padrão desde 2024) |
| Dependabot Alerts | CRÍTICO | Alerta sobre dependências vulneráveis |
| Dependabot Security Updates | IMPORTANTE | PRs automáticos para fixes |
| CodeQL/Code Scanning | IMPORTANTE | Análise estática de segurança |

### Workflow de Segurança para GitHub Actions

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Semanal

permissions:
  contents: read
  security-events: write

jobs:
  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: npm audit --audit-level=high

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false
      
      - name: TruffleHog Secret Scan
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified
```

### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "security"
    groups:
      production-dependencies:
        patterns:
          - "*"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

## 4. Segurança do Vercel

### Headers de Segurança HTTP - CRÍTICO

```json
// vercel.json completo
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, no-cache, must-revalidate"
        }
      ]
    }
  ]
}
```

### Variáveis de Ambiente no Vercel - CRÍTICO

- Use **Sensitive Environment Variables** para API keys (não podem ser descriptografadas após criação)
- **NUNCA** use prefixo `NEXT_PUBLIC_` para secrets - serão expostos no bundle
- Separe valores por ambiente: Development/Preview/Production

```
Settings → Environment Variables
├── SUPABASE_SERVICE_ROLE_KEY (Sensitive: ✓) → Production only
├── NEXT_PUBLIC_SUPABASE_URL → All environments
└── NEXT_PUBLIC_SUPABASE_ANON_KEY → All environments
```

### Proteção DDoS e Rate Limiting

O Vercel oferece proteção automática contra DDoS em camadas L3, L4 e L7. Para **rate limiting adicional**, use middleware:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Bloquear padrões suspeitos
  const blockedPatterns = ['/wp-admin', '/xmlrpc.php', '/.env', '/.git'];
  if (blockedPatterns.some(p => request.nextUrl.pathname.includes(p))) {
    return new NextResponse(null, { status: 404 });
  }
  
  // Adicionar request ID para rastreamento
  response.headers.set('X-Request-ID', crypto.randomUUID());
  
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 5. Segurança do domínio na Hostinger

### DNS Security Checklist

| Configuração | Prioridade | Local no hPanel |
|--------------|------------|-----------------|
| SSL/TLS Certificate | CRÍTICO | SSL → Force HTTPS |
| Domain Lock | CRÍTICO | Domains → Security → Enable |
| WHOIS Privacy | CRÍTICO | Domains → Privacy Protection |
| CAA Records | IMPORTANTE | DNS Zone → Add CAA Record |
| 2FA na conta | CRÍTICO | Account Settings |

### Configuração de CAA Records

Restrinja quais CAs podem emitir certificados para seu domínio:

```dns
; Permitir apenas Let's Encrypt
example.com.  CAA  0 issue "letsencrypt.org"
example.com.  CAA  0 issuewild "letsencrypt.org"

; Notificações de tentativas
example.com.  CAA  0 iodef "mailto:security@seudominio.com"
```

---

## 6. Integração segura com Kirvano (Gateway de Pagamento)

### Regras Fundamentais - CRÍTICO

1. **NUNCA armazene dados de cartão** - use tokenização
2. **Valide assinatura de todos os webhooks**
3. **Use HTTPS exclusivamente** para páginas de pagamento
4. **Implemente idempotência** para evitar cobranças duplicadas

### Validação de Webhook - CRÍTICO

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  // Comparação timing-safe previne timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${hmac}`)
  );
}

// Express.js endpoint
app.post('/webhook/payment', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  
  if (!verifyWebhookSignature(req.body, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(req.body);
  
  // Verificações anti-fraude adicionais
  // 1. Validar se o valor corresponde ao esperado
  // 2. Verificar se transação já foi processada (idempotência)
  // 3. Confirmar identidade do cliente
  
  res.status(200).send('OK');
});
```

### PCI-DSS para Pequenas Aplicações

Se você usa página hospedada de pagamento (redirect para Kirvano), está elegível para **SAQ-A** (o nível mais simples):

- ✅ Use hosted payment page (redirect)
- ✅ Nunca manipule números de cartão no servidor
- ✅ Use iframes para formulários de pagamento
- ✅ Armazene apenas tokens/IDs de transação
- ✅ HTTPS em todas as páginas

---

## 7. Segurança de Notificações Push

### VAPID Keys - CRÍTICO

```javascript
const webpush = require('web-push');

// Gerar APENAS UMA VEZ e armazenar em variáveis de ambiente
const vapidKeys = webpush.generateVAPIDKeys();
// VAPID_PUBLIC_KEY=...
// VAPID_PRIVATE_KEY=... (NUNCA expor)

webpush.setVapidDetails(
  'mailto:admin@seudominio.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
```

### Validação de Subscription - CRÍTICO

```javascript
function validatePushSubscription(subscription) {
  if (!subscription?.endpoint) {
    throw new Error('Invalid subscription');
  }
  
  const url = new URL(subscription.endpoint);
  const allowedHosts = [
    'fcm.googleapis.com',
    'updates.push.services.mozilla.com',
    'wns.windows.com',
    'web.push.apple.com'
  ];
  
  if (!allowedHosts.some(host => url.hostname.endsWith(host))) {
    throw new Error('Untrusted push service');
  }
  
  if (!subscription.keys?.p256dh || !subscription.keys?.auth) {
    throw new Error('Missing encryption keys');
  }
  
  return true;
}
```

### Service Worker para Push

```javascript
// sw.js
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    return; // Dados inválidos
  }
  
  if (!data.title) return;
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body || '',
      icon: '/icons/notification.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  // Validar que URL é da mesma origem (segurança)
  const url = new URL(urlToOpen, self.location.origin);
  if (url.origin !== self.location.origin) {
    return; // Bloquear navegação externa
  }
  
  event.waitUntil(clients.openWindow(url.href));
});
```

---

## 8. Compliance com a LGPD

Como seu app processa **dados pessoais de hábitos e comportamentos** de brasileiros, está sujeito à LGPD. Se rastreia hábitos de saúde (exercícios, sono, alimentação), trata-se de **dados sensíveis** com requisitos ainda mais rigorosos.

### Requisitos Mínimos Obrigatórios - CRÍTICO

| Requisito | Descrição | Status |
|-----------|-----------|--------|
| Base Legal | Identificar base legal para cada tratamento (Art. 7) | ☐ |
| Política de Privacidade | Obrigatória, em português, acessível | ☐ |
| Canal para Direitos | Mecanismo para usuários exercerem direitos | ☐ |
| Medidas de Segurança | Proteção técnica e administrativa (Art. 46) | ☐ |
| Notificação de Incidentes | Procedimentos para vazamentos | ☐ |

### Bases Legais Recomendadas para App de Hábitos

| Tipo de Dado | Base Legal Recomendada |
|--------------|----------------------|
| Dados de conta (email, nome) | Execução de Contrato + Consentimento |
| Dados de rastreamento de hábitos | Execução de Contrato |
| Analytics de uso | Legítimo Interesse |
| Comunicações de marketing | Consentimento Explícito |
| **Hábitos de saúde** | **Consentimento Específico e Destacado** (dado sensível!) |

### Direitos dos Titulares (Art. 18) - Implementação Obrigatória

| Direito | Prazo de Resposta | Implementação |
|---------|-------------------|---------------|
| Confirmação de tratamento | 15 dias (30 para pequenas empresas) | Endpoint ou formulário |
| Acesso aos dados | 15 dias | Exportação em JSON/CSV |
| Correção | Prazo razoável | Edição no perfil |
| Exclusão | Prazo razoável | Botão "Excluir minha conta" |
| Portabilidade | Quando regulamentado | Exportação estruturada |
| Revogação de consentimento | Imediato | Toggle nas configurações |

### Elementos Obrigatórios da Política de Privacidade

```markdown
POLÍTICA DE PRIVACIDADE - [NOME DO APP]
Última atualização: [DATA]

1. IDENTIFICAÇÃO DO CONTROLADOR (nome, CNPJ, contato)
2. DADOS COLETADOS (categorias específicas)
3. FINALIDADES DO TRATAMENTO (para que cada dado)
4. BASES LEGAIS (Art. 7 para cada tratamento)
5. COMPARTILHAMENTO (terceiros que recebem dados)
6. TRANSFERÊNCIA INTERNACIONAL (se usa Supabase/Vercel = SIM)
7. RETENÇÃO (quanto tempo cada dado é mantido)
8. SEGURANÇA (medidas de proteção)
9. DIREITOS DO TITULAR (como exercer cada direito)
10. COOKIES (se aplicável)
11. CANAL DE COMUNICAÇÃO/DPO
12. ALTERAÇÕES DA POLÍTICA
```

### DPO (Encarregado) - Quando é Obrigatório

**Pequenas empresas estão DISPENSADAS** de nomear DPO (Resolução ANPD nº 2/2022) se:
- Microempresa (receita ≤ R$4,8 milhões) ou
- Startup (receita ≤ R$16 milhões) ou
- Sem fins lucrativos

**MAS** deve manter um **canal de comunicação** com titulares. Perdem a isenção se houver:
- Tratamento em larga escala E
- Dados sensíveis OU tecnologias inovadoras OU vigilância

### Notificação de Incidentes

| Destinatário | Prazo | Prazo Pequenas Empresas |
|--------------|-------|-------------------------|
| ANPD | 3 dias úteis | 6 dias úteis |
| Titulares afetados | Prazo razoável | Prazo razoável |

### Penalidades

- **Advertência** com prazo para correção
- **Multa simples**: até 2% do faturamento, máximo **R$50 milhões por infração**
- **Multa diária**
- **Bloqueio ou eliminação dos dados**
- **Suspensão de atividades de tratamento**

---

## 9. Autenticação e autorização

### Checklist de Autenticação Segura

#### CRÍTICO
- [ ] RLS habilitado em TODAS as tabelas públicas
- [ ] service_role key NUNCA exposta no frontend
- [ ] Validação de JWT em todas as requisições protegidas
- [ ] Confirmação de email obrigatória
- [ ] Senha mínima 12 caracteres com complexidade
- [ ] CAPTCHA habilitado (hCaptcha/Turnstile)

#### IMPORTANTE
- [ ] MFA disponível para usuários
- [ ] Rate limiting em endpoints de auth
- [ ] Proteção contra brute force (Supabase usa fail2ban)
- [ ] Mensagens de erro genéricas ("Credenciais inválidas" vs "Usuário não existe")

#### RECOMENDADO
- [ ] OAuth com PKCE flow
- [ ] Validação de `email_verified` em social logins
- [ ] Refresh token rotation
- [ ] Logout que invalida sessões no servidor

### MFA com Supabase Auth

```sql
-- Política RLS exigindo MFA para operações sensíveis
CREATE POLICY "Require MFA for sensitive operations"
ON public.user_settings
AS RESTRICTIVE FOR UPDATE TO authenticated
USING ((SELECT auth.jwt()->>'aal') = 'aal2');
```

---

## 10. Monitoramento e resposta a incidentes

### Ferramentas Recomendadas

| Ferramenta | Propósito | Custo |
|------------|-----------|-------|
| **Supabase Dashboard Logs** | Monitoramento de auth/DB | Incluído |
| **Vercel Analytics** | Monitoramento de edge | Incluído |
| **Sentry** | Error tracking React | Free tier |
| **Better Stack** | Log management + alerting | Free tier |
| **GitHub Secret Scanning** | Detecção de credenciais | Free |

### Logs de Auditoria no Supabase

```sql
-- Consultar logs de autenticação
SELECT * FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Habilitar audit trail em tabelas sensíveis
CREATE EXTENSION IF NOT EXISTS supa_audit CASCADE;
SELECT audit.enable_tracking('public.habits'::regclass);
```

### Plano de Resposta a Incidentes - Resumo

1. **Detecção**: Monitorar alertas de segurança
2. **Contenção**: Isolar sistemas afetados, rotacionar credenciais
3. **Erradicação**: Remover acesso malicioso, patchar vulnerabilidades
4. **Recuperação**: Restaurar de backups limpos
5. **Lições Aprendidas**: Documentar e implementar melhorias

**Tempos de Resposta Recomendados**:
| Severidade | Tempo de Resposta | Meta de Resolução |
|------------|-------------------|-------------------|
| Crítica | 15 minutos | 4 horas |
| Alta | 1 hora | 24 horas |
| Média | 4 horas | 72 horas |

---

## 11. OWASP Top 10 mapeado para sua stack

| Vulnerabilidade | Risco na sua Stack | Mitigação |
|-----------------|-------------------|-----------|
| **A01 Broken Access Control** | RLS não configurado; autorização só no frontend | RLS obrigatório; auth.uid() em todas as políticas |
| **A02 Cryptographic Failures** | API keys expostas; dados não criptografados | Environment variables; HTTPS; encrypt at rest |
| **A03 Injection** | SQL injection em queries raw | Usar cliente Supabase (parametrizado); sanitizar inputs |
| **A05 Security Misconfiguration** | service_role exposta; headers faltando | Configurar vercel.json; auditar secrets |
| **A06 Vulnerable Components** | npm dependencies vulneráveis | npm audit; Dependabot; Snyk |
| **A07 Auth Failures** | Senhas fracas; sem MFA; sessões expostas | Políticas de senha; MFA; HttpOnly cookies |

### Ferramentas de Teste de Segurança

| Tipo | Ferramenta | Propósito |
|------|------------|-----------|
| SAST | GitHub CodeQL | Análise estática de código |
| SAST | Semgrep | Detecção de padrões inseguros |
| DAST | OWASP ZAP | Scan de vulnerabilidades web |
| SCA | npm audit | Vulnerabilidades em dependências |
| SCA | Snyk | Dependency scanning + fixes |
| Secrets | TruffleHog | Detecção de credenciais vazadas |

---

## 12. Checklist consolidado por prioridade

### 🔴 CRÍTICO - Implementar ANTES de ir para produção

**Supabase**
- [ ] RLS habilitado em TODAS as tabelas públicas
- [ ] service_role key em variável de ambiente (não NEXT_PUBLIC_)
- [ ] Confirmação de email ativada
- [ ] Políticas RLS testadas com usuários reais

**GitHub**
- [ ] .gitignore completo (sem .env, sem keys)
- [ ] Secret Scanning e Push Protection ativados
- [ ] Dependabot ativado
- [ ] Nenhuma credencial no histórico do Git

**Vercel**
- [ ] Headers de segurança configurados (HSTS, CSP, X-Frame-Options)
- [ ] Variáveis sensíveis marcadas como Sensitive
- [ ] HTTPS forçado

**Frontend**
- [ ] Sem dangerouslySetInnerHTML ou com DOMPurify
- [ ] URLs validadas antes de usar em href/src
- [ ] Service Worker não cacheia dados sensíveis

**LGPD**
- [ ] Política de Privacidade publicada (português)
- [ ] Canal de comunicação para direitos dos titulares
- [ ] Base legal definida para cada tratamento

**Pagamentos**
- [ ] Webhook signatures validadas
- [ ] Nenhum dado de cartão armazenado
- [ ] HTTPS em páginas de checkout

### 🟡 IMPORTANTE - Implementar em até 2 semanas

- [ ] MFA disponível para usuários
- [ ] npm audit no CI/CD
- [ ] Workflow de segurança no GitHub Actions
- [ ] Rate limiting em endpoints de autenticação
- [ ] Logs de auditoria habilitados
- [ ] CAA records configurados no DNS
- [ ] Domain Lock ativado na Hostinger
- [ ] CAPTCHA em formulários de auth
- [ ] Registro de Atividades de Tratamento (LGPD)

### 🟢 RECOMENDADO - Implementar em até 30 dias

- [ ] DAST scan antes de releases
- [ ] Penetration testing básico
- [ ] Plano de resposta a incidentes documentado
- [ ] Backup e disaster recovery testados
- [ ] Security awareness para equipe
- [ ] CodeQL/Semgrep no CI/CD
- [ ] Monitoramento em tempo real configurado

---

## Conclusão: proteção em camadas é a chave

A segurança desta aplicação depende de **múltiplas camadas de defesa** trabalhando juntas. O Supabase com RLS bem configurado é sua primeira linha de defesa no banco de dados. Os headers de segurança do Vercel protegem contra ataques no navegador. O gerenciamento rigoroso de secrets no GitHub previne o vazamento mais comum em repositórios públicos.

Para um app de hábitos sujeito à LGPD, os três investimentos de segurança com maior retorno são: **(1)** RLS 100% configurado no Supabase, **(2)** headers de segurança completos no Vercel, e **(3)** política de privacidade com mecanismo de exercício de direitos. Essas três implementações, combinadas com o `.gitignore` correto e secret scanning ativo, colocam sua aplicação em um patamar de segurança significativamente superior à média de projetos similares.

A regra de ouro: **assuma que todo código no repositório público será lido por atacantes**. Isso significa zero tolerância para credenciais no código, validação de segurança em múltiplas camadas (frontend E backend), e monitoramento contínuo para detectar anomalias rapidamente.