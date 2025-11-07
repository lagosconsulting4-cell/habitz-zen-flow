# 🎨 Diagrama Visual - Fluxo de Deploy do Habitz

**Data:** 07/11/2025
**Versão:** 1.0

---

## 📊 Fluxo Completo do Deploy

```
┌─────────────────────────────────────────────────────────────────┐
│  DESENVOLVEDOR                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Edita arquivos:                                       │  │
│  │     - Landing: index.html, style.css, script.js          │  │
│  │     - App: src/**/*.tsx                                   │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  2. git add . && git commit -m "..." && git push         │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ PUSH
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  GITHUB                                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Repositório: lagosconsulting4-cell/habitz-zen-flow      │  │
│  │  Branch: main                                             │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ WEBHOOK
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  VERCEL - Início do Build                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Clone do repositório (1-2 segundos)                  │  │
│  │     git clone github.com/.../habitz-zen-flow             │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  2. Lê vercel.json NA RAIZ                               │  │
│  │     Prod/vercel.json                                     │  │
│  │                                                           │  │
│  │     {                                                     │  │
│  │       "installCommand": "cd Landing && ...",             │  │
│  │       "buildCommand": "cd Landing && ...",               │  │
│  │       "outputDirectory": "dist"                          │  │
│  │     }                                                     │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  3. Executa installCommand                               │  │
│  │     cd Landing && npm install                            │  │
│  │     cd ../App && npm install                             │  │
│  │     (~2-3 segundos com cache)                            │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  4. Executa buildCommand (parte 1)                       │  │
│  │     cd Landing && npm run build                          │  │
│  │                                                           │  │
│  │     → vite build                                          │  │
│  │     → Processa HTML, CSS, JS                             │  │
│  │     → Gera Landing/dist/                                 │  │
│  │     (~500ms)                                             │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  5. Executa buildCommand (parte 2)                       │  │
│  │     cd ../App && npm run build                           │  │
│  │                                                           │  │
│  │     → vite build (base: "/app/")                         │  │
│  │     → Processa React/TypeScript                          │  │
│  │     → Gera App/dist/ com paths /app/assets/...          │  │
│  │     (~10-12 segundos)                                    │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  6. Executa buildCommand (parte 3)                       │  │
│  │     node scripts/prepare-dist.cjs                        │  │
│  │                                                           │  │
│  │     • Limpa dist/ anterior                               │  │
│  │     • Copia Landing/dist/* → dist/ (raiz)               │  │
│  │     • Copia App/dist/* → dist/app/                      │  │
│  │                                                           │  │
│  │     Resultado:                                            │  │
│  │     dist/                                                │  │
│  │     ├── index.html     ← Landing                         │  │
│  │     ├── obrigado.html                                    │  │
│  │     ├── assets/        ← Landing assets                  │  │
│  │     └── app/           ← React App                       │  │
│  │         └── index.html                                   │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  7. Vercel pega dist/ e faz deploy                      │  │
│  │     Duração total: ~15-25 segundos                       │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ DEPLOY
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PRODUÇÃO - www.habitz.life                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Rotas servidas:                                          │  │
│  │                                                           │  │
│  │  GET /                  → dist/index.html (LP)           │  │
│  │  GET /obrigado          → dist/obrigado.html             │  │
│  │  GET /assets/style.css  → dist/assets/style.css          │  │
│  │  GET /audio/audio.mp3   → dist/audio/audio.mp3           │  │
│  │                                                           │  │
│  │  GET /app               → dist/app/index.html (React)    │  │
│  │  GET /app/dashboard     → dist/app/index.html (rewrite)  │  │
│  │  GET /app/auth          → dist/app/index.html (rewrite)  │  │
│  │  GET /app/profile       → dist/app/index.html (rewrite)  │  │
│  │  GET /app/assets/*.js   → dist/app/assets/*.js           │  │
│  │  GET /app/assets/*.css  → dist/app/assets/*.css          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Estrutura de Arquivos Detalhada

```
Prod/
│
├── 📄 vercel.json ⚠️ CRÍTICO
│   └── Diz ao Vercel como instalar, buildar e servir
│
├── 📁 Landing/  ← LANDING PAGE
│   │
│   ├── 📄 package.json
│   │   └── Scripts: dev, build, preview
│   │
│   ├── 📄 vite.config.js
│   │   └── Configuração do Vite (build simples)
│   │
│   ├── 📄 index.html
│   │   └── Página principal da LP
│   │
│   ├── 📄 obrigado.html
│   │   └── Página de agradecimento
│   │
│   ├── 📄 style.css
│   │   └── Estilos da Landing
│   │
│   ├── 📄 script.js
│   │   └── Scripts da Landing
│   │
│   ├── 📁 assets/
│   │   └── images/
│   │       └── *.webp (imagens otimizadas)
│   │
│   ├── 📁 public/
│   │   └── audio/
│   │       └── *.mp3
│   │
│   └── 📁 dist/  ← Build output (gerado)
│       ├── index.html
│       ├── obrigado.html
│       ├── assets/ (hasheados)
│       └── audio/
│
├── 📁 App/  ← APLICAÇÃO REACT
│   │
│   ├── 📄 package.json
│   │   └── Scripts: dev, build
│   │
│   ├── 📄 vite.config.ts ⚠️ CRÍTICO
│   │   └── base: "/app/" (importante!)
│   │
│   ├── 📄 index.html
│   │   └── Template HTML base
│   │
│   ├── 📁 src/
│   │   ├── 📄 App.tsx ⚠️ CRÍTICO
│   │   │   └── BrowserRouter basename="/app"
│   │   │
│   │   ├── 📄 main.tsx
│   │   │   └── Entry point
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Auth.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── ... (outras páginas)
│   │   │
│   │   ├── 📁 components/
│   │   │   └── Componentes reutilizáveis
│   │   │
│   │   ├── 📁 layouts/
│   │   │   └── ProtectedLayout.tsx
│   │   │
│   │   └── 📁 services/
│   │       └── Supabase, etc
│   │
│   ├── 📁 public/
│   │   ├── favicon.ico
│   │   └── robots.txt
│   │
│   └── 📁 dist/  ← Build output (gerado)
│       ├── index.html (com paths /app/assets/...)
│       ├── assets/
│       │   ├── index-[hash].js
│       │   └── index-[hash].css
│       └── favicon.ico
│
├── 📁 scripts/
│   └── 📄 prepare-dist.cjs ⚠️ CRÍTICO
│       └── Junta Landing/dist + App/dist → dist/
│
└── 📁 dist/  ← OUTPUT FINAL (gerado)
    ├── index.html          (da Landing/dist/)
    ├── obrigado.html       (da Landing/dist/)
    ├── assets/             (da Landing/dist/)
    ├── audio/              (da Landing/dist/)
    └── app/                (da App/dist/)
        ├── index.html
        ├── assets/
        │   ├── index-[hash].js
        │   └── index-[hash].css
        └── favicon.ico
```

---

## 🔄 Fluxo de Dados - Build Script

```
vercel.json: "buildCommand"
        │
        ├─→ cd Landing && npm run build
        │        │
        │        └─→ vite build
        │             │
        │             └─→ 📂 Landing/dist/ criado
        │                  ├── index.html
        │                  ├── obrigado.html
        │                  ├── assets/
        │                  │   ├── style-[hash].css
        │                  │   ├── script-[hash].js
        │                  │   └── *.webp
        │                  └── audio/
        │
        ├─→ cd ../App && npm run build
        │        │
        │        └─→ vite build (base: "/app/")
        │             │
        │             └─→ 📂 App/dist/ criado
        │                  ├── index.html
        │                  │   (com <script src="/app/assets/index-[hash].js">)
        │                  ├── assets/
        │                  │   ├── index-[hash].js
        │                  │   └── index-[hash].css
        │                  └── favicon.ico
        │
        └─→ node scripts/prepare-dist.cjs
                 │
                 ├─→ 🗑️ Limpa dist/
                 │
                 ├─→ 📋 Copia Landing/dist/* → dist/
                 │        │
                 │        └─→ dist/index.html
                 │            dist/obrigado.html
                 │            dist/assets/
                 │            dist/audio/
                 │
                 └─→ 📋 Copia App/dist/* → dist/app/
                          │
                          └─→ dist/app/index.html
                              dist/app/assets/
                              dist/app/favicon.ico
```

---

## 🌐 Fluxo de Requisições HTTP

### Requisição: Landing Page

```
Usuário digita: www.habitz.life/
                        │
                        ▼
        ┌───────────────────────────────┐
        │  DNS resolve para Vercel      │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Vercel recebe requisição     │
        │  Host: www.habitz.life        │
        │  Path: /                      │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Vercel consulta vercel.json  │
        │  outputDirectory: dist        │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Path = / ?                   │
        │  Serve: dist/index.html       │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Retorna HTML da Landing Page │
        └───────────────────────────────┘
```

### Requisição: React App (com rewrite)

```
Usuário digita: www.habitz.life/app/dashboard
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Vercel recebe requisição     │
        │  Path: /app/dashboard         │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Vercel consulta rewrites     │
        │  /app/:path((?!.*\.).*) match!│
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Rewrite para:                │
        │  /app/index.html              │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Serve: dist/app/index.html   │
        │  URL mantém: /app/dashboard   │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  React App carrega            │
        │  BrowserRouter basename="/app"│
        │  vê rota: /dashboard          │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  React Router renderiza       │
        │  componente Dashboard         │
        └───────────────────────────────┘
```

### Requisição: Asset Estático

```
Navegador pede: /app/assets/index-ABC123.js
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Vercel recebe requisição     │
        │  Path: /app/assets/index.js   │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Vercel consulta rewrites     │
        │  Contém "." → NÃO match       │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Serve arquivo diretamente:   │
        │  dist/app/assets/index.js     │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Arquivo JS entregue          │
        │  Content-Type: text/javascript│
        └───────────────────────────────┘
```

---

## ⚙️ Configuração em Camadas

```
CAMADA 1: vercel.json (RAIZ)
├─ Define onde está o projeto: Prod/ (raiz do repo)
├─ Define como instalar: cd Landing && npm install && cd ../App && npm install
├─ Define como buildar: Landing build → App build → prepare-dist.cjs
└─ Define output: dist/
        │
        ▼
CAMADA 2: Landing/package.json
├─ Define o que é "npm run build"
│  └─ vite build
└─ Vite processa HTML/CSS/JS → Landing/dist/
        │
        ▼
CAMADA 3: App/package.json + vite.config.ts
├─ Define o que é "npm run build"
│  └─ vite build (base: "/app/")
└─ Vite processa React/TS com paths /app/assets/... → App/dist/
        │
        ▼
CAMADA 4: scripts/prepare-dist.cjs
├─ Junta Landing/dist/ (raiz) + App/dist/ (em app/)
└─ Cria estrutura final no dist/
        │
        ▼
CAMADA 5: vercel.json rewrites
├─ Define rewrites para /app/*
└─ React Router pode processar rotas SPA
        │
        ▼
CAMADA 6: App/src/App.tsx (BrowserRouter)
├─ basename="/app" diz onde o app está
└─ React Router processa rotas corretamente
        │
        ▼
RESULTADO: Aplicação funcionando em produção
```

---

## 🎯 Pontos Críticos de Falha

```
❌ SE deletar vercel.json (raiz)
    ↓
    Vercel não sabe como buildar
    ↓
    Build de 900ms apenas (sem processar)
    ↓
    404 em tudo

❌ SE deletar prepare-dist.cjs
    ↓
    dist/ não é criado corretamente
    ↓
    LP e App não ficam juntos
    ↓
    404 ou estrutura quebrada

❌ SE não usar basename="/app" no BrowserRouter
    ↓
    React Router não sabe que está em /app/
    ↓
    Todas as rotas internas dão 404
    ↓
    Página 404 do próprio React App

❌ SE não usar base="/app/" no Vite
    ↓
    Assets são referenciados como /assets/...
    ↓
    Em vez de /app/assets/...
    ↓
    404 nos CSS/JS, tela branca

❌ SE usar "Landing" no código mas "landing" no git (ou vice-versa)
    ↓
    Windows funciona (case-insensitive)
    ↓
    Linux/Vercel falha (case-sensitive)
    ↓
    sh: cd: Landing: No such file or directory

❌ SE remover rewrites do vercel.json
    ↓
    /app/dashboard, /app/auth dão 404
    ↓
    Apenas /app (com index.html direto) funciona
    ↓
    React Router não funciona
```

---

## ✅ Checklist de Sanidade

Antes de fazer qualquer mudança crítica, verifique:

```
□ vercel.json existe na raiz do repo
□ vercel.json tem installCommand, buildCommand, outputDirectory
□ scripts/prepare-dist.cjs existe
□ Landing/package.json tem script "build"
□ App/package.json tem script "build"
□ App/vite.config.ts tem base: "/app/"
□ App/src/App.tsx tem basename="/app"
□ Root Directory no Vercel está vazio
□ Nomes de pastas são case-consistent (Landing, App)
□ .gitignore exclui node_modules/, dist/, .env
□ Último deploy demorou > 10 segundos
□ Logs mostram "[prepare-dist] Landing publicada..."
```

Se algum item estiver ❌, investigar antes de prosseguir!

---

## 📈 Métricas de Build Saudável

| Métrica | Valor Esperado | Valor Problemático |
|---------|----------------|-------------------|
| Tempo total | 15-25 segundos | < 5s ou > 60s |
| Clone repo | 1-2 segundos | > 5s |
| npm install | 2-3 segundos (cache) | > 10s |
| Landing build | 300-600ms | > 2s |
| App build | 10-12 segundos | > 30s |
| prepare-dist | < 1 segundo | > 5s |
| Deploy | 2-3 segundos | > 10s |

---

## 🔍 Como Debugar no Vercel

### 1. Ver Logs Detalhados

Dashboard → Deployments → Click no deployment → Build Logs

Procure por:
```bash
✓ Running "install" command  # Deve aparecer
✓ Running "build" command    # Deve aparecer
✓ [prepare-dist] Landing...  # Deve aparecer
✓ Build Completed            # Deve aparecer
```

### 2. Ver Estrutura do Build

No final dos logs, procure:
```
Build Completed in /vercel/output [XYZ seconds]
```

Se aparecer algo como:
```
Build Completed in /vercel/output [900ms]
```

❌ Algo está errado! O build não rodou.

### 3. Testar Arquivos Individualmente

```
https://www.habitz.life/index.html        ← Landing
https://www.habitz.life/obrigado.html     ← Página obrigado
https://www.habitz.life/app/index.html    ← React App (direto)
https://www.habitz.life/app/assets/...    ← Assets do React
```

### 4. Ver Network Tab no DevTools

F12 → Network → Reload

Procure por:
- ✅ Status 200 nos arquivos principais
- ❌ Status 404 indica arquivo não encontrado
- ❌ Status 500 indica erro do servidor

---

**FIM DO DIAGRAMA**
