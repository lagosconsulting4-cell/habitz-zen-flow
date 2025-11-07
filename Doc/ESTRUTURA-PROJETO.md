# 📚 Documentação Completa - Estrutura do Projeto Habitz

**Data:** 07/11/2025
**Autor:** Bruno Falci
**Versão:** 1.0

---

## 🎯 Visão Geral

Este projeto é um **monorepo** que contém dois projetos independentes mas integrados:

1. **Landing Page** - HTML/CSS/JS com Vite para captação de leads
2. **App React** - Aplicação completa em React/Vite para gestão de hábitos

Ambos são servidos pelo **mesmo domínio** (www.habitz.life) através do **Vercel**:
- **Raiz** (`/`) → Landing Page
- **Rota `/app`** → Aplicação React

---

## 📁 Estrutura de Diretórios

```
Prod/
├── vercel.json                    # ⚠️ CRÍTICO - Configuração principal do Vercel
├── .gitignore                     # Arquivos ignorados pelo Git
├── README.md                      # Documentação do projeto
├── Landing/                       # Landing Page (HTML/Vite)
│   ├── package.json               # Dependências da Landing
│   ├── vite.config.js             # Configuração do Vite
│   ├── index.html                 # Página principal
│   ├── obrigado.html              # Página de agradecimento
│   ├── style.css                  # Estilos da LP
│   ├── script.js                  # Scripts da LP
│   ├── assets/                    # Imagens e recursos
│   │   └── images/                # Imagens WebP
│   ├── public/                    # Assets públicos
│   │   └── audio/                 # Arquivos de áudio
│   └── dist/                      # ⚠️ Build output (gerado)
├── App/                           # Aplicação React
│   ├── package.json               # Dependências do React App
│   ├── vite.config.ts             # ⚠️ CRÍTICO - Configuração do Vite
│   ├── tsconfig.json              # Configuração TypeScript
│   ├── tailwind.config.ts         # Configuração Tailwind
│   ├── components.json            # Configuração shadcn/ui
│   ├── index.html                 # HTML base do React
│   ├── src/                       # Código fonte React
│   │   ├── App.tsx                # ⚠️ CRÍTICO - Componente principal
│   │   ├── main.tsx               # Entry point
│   │   ├── pages/                 # Páginas do app
│   │   ├── components/            # Componentes reutilizáveis
│   │   ├── layouts/               # Layouts
│   │   └── services/              # Serviços (Supabase, etc)
│   ├── public/                    # Assets públicos
│   └── dist/                      # ⚠️ Build output (gerado)
├── scripts/                       # Scripts de automação
│   └── prepare-dist.cjs           # ⚠️ CRÍTICO - Organiza builds
├── dist/                          # ⚠️ Output final servido pelo Vercel
│   ├── index.html                 # Landing Page na raiz
│   ├── obrigado.html              # Página de agradecimento
│   ├── assets/                    # Assets da Landing
│   ├── audio/                     # Áudios da Landing
│   └── app/                       # Aplicação React
│       ├── index.html             # React App
│       ├── assets/                # Assets do React
│       └── favicon.*              # Favicons
└── Doc/                           # 📖 VOCÊ ESTÁ AQUI
    ├── ESTRUTURA-PROJETO.md
    ├── DIAGRAMA-DEPLOY.md
    ├── TROUBLESHOOTING.md
    └── MELHORES-PRATICAS.md
```

---

## ⚙️ Como Funciona o Build

### 1. Vercel Detecta o Push

Quando você faz `git push`, o Vercel:
1. Lê o **`vercel.json` NA RAIZ** do repositório
2. Executa os comandos especificados nele

### 2. Configuração do `vercel.json` (Raiz)

**Localização:** `C:\Users\bruno\Documents\Black\Habitz\Prod\vercel.json`

```json
{
  "installCommand": "cd Landing && npm install && cd ../App && npm install",
  "buildCommand": "cd Landing && npm run build && cd ../App && npm run build && cd .. && node scripts/prepare-dist.cjs",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/obrigado", "destination": "/obrigado.html" },
    {
      "source": "/app/:path((?!.*\\.).*)",
      "destination": "/app/index.html"
    }
  ],
  "headers": [
    {
      "source": "/app/(.*)",
      "headers": [ { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" } ]
    }
  ]
}
```

**O que faz:**
- **installCommand:** Instala dependências de Landing e App
- **buildCommand:** Builda ambos os projetos e executa prepare-dist.cjs
- **outputDirectory:** Diz ao Vercel para servir o conteúdo de `dist/`
- **rewrites:** Configura rotas (importante para React Router)
- **headers:** Define cache para arquivos estáticos

### 3. Build da Landing Page

**Landing/package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Landing/vite.config.js:**
```javascript
export default defineConfig({
  plugins: [/* ... */],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
```

**O que acontece:**
1. `npm run build` executa `vite build`
2. Vite processa HTML, CSS, JS
3. Output vai para `Landing/dist/`

### 4. Build do App React

**App/package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

**App/vite.config.ts (⚠️ CRÍTICO):**
```typescript
export default defineConfig(({ mode }) => {
  const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
  const forcedBase = process.env.VITE_BASE_PATH;
  const base =
    forcedBase ??
    (mode === "production"
      ? isGitHubPages
        ? "/habitz-zen-flow/"
        : "/app/"  // ⚠️ IMPORTANTE!
      : "/");

  return {
    base,
    plugins: [react()],
    // ...
  };
});
```

**Por quê `base: "/app/"` é importante:**
- Diz ao Vite que a aplicação será servida em `/app/`
- Gera paths corretos: `/app/assets/...` em vez de `/assets/...`
- Sem isso, CSS/JS dão 404

**App/src/App.tsx (⚠️ CRÍTICO):**
```tsx
const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename="/app">  {/* ⚠️ IMPORTANTE! */}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* ... outras rotas ... */}
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);
```

**Por quê `basename="/app"` é importante:**
- Diz ao React Router que todas as rotas têm prefixo `/app/`
- Sem isso, o React Router não encontra as rotas
- Resultado: 404 interno no React App

### 5. Script `prepare-dist.cjs` (⚠️ CRÍTICO)

**Localização:** `scripts/prepare-dist.cjs`

```javascript
const { cpSync, existsSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const rootDir = process.cwd();
const landingDist = join(rootDir, "Landing", "dist");
const appDist = join(rootDir, "App", "dist");
const outputDir = join(rootDir, "dist");

if (!existsSync(landingDist)) {
  console.error(`Build da landing não encontrado`);
  process.exit(1);
}

if (!existsSync(appDist)) {
  console.error(`Build do app não encontrado`);
  process.exit(1);
}

rmSync(outputDir, { recursive: true, force: true });
cpSync(landingDist, outputDir, { recursive: true });

// Vite builds with base "/app/" but outputs to dist/ directly
cpSync(appDist, join(outputDir, "app"), { recursive: true });

console.log("[prepare-dist] Landing publicada na raiz e app disponível em /app/.");
```

**O que faz:**
1. Limpa a pasta `dist/` anterior
2. Copia **TODO** o conteúdo de `Landing/dist/` para `dist/` (raiz)
3. Copia `App/dist/` para `dist/app/`

**Resultado final:**
```
dist/
├── index.html              ← Landing Page (raiz)
├── obrigado.html
├── assets/                 ← Assets da Landing
├── audio/
└── app/                    ← App React
    ├── index.html
    ├── assets/
    │   ├── index-*.js
    │   └── index-*.css
    └── favicon.ico
```

### 6. Vercel Serve o Conteúdo

O Vercel pega `dist/` e serve:
- `www.habitz.life/` → `dist/index.html` (LP)
- `www.habitz.life/obrigado` → `dist/obrigado.html`
- `www.habitz.life/app` → `dist/app/index.html` (React)
- `www.habitz.life/app/dashboard` → `dist/app/index.html` (React Router)

---

## 🔧 Configuração do Vercel (Dashboard)

### Settings → General

#### 1. Root Directory
- **Valor:** ❌ **DEIXAR VAZIO** (ou `.`)
- **Por quê:** O build script já navega para as pastas corretas

#### 2. Build & Development Settings
- **Framework Preset:** Other
- **Build Command:** ❌ NÃO SOBRESCREVER (usa do vercel.json)
- **Output Directory:** ❌ NÃO SOBRESCREVER (usa do vercel.json)
- **Install Command:** ❌ NÃO SOBRESCREVER (usa do vercel.json)

⚠️ **IMPORTANTE:** Os overrides só devem ser usados se o `vercel.json` não estiver funcionando.

### Settings → Domains

Domínios configurados:
- `www.habitz.life` (Production)
- `habitz.life` (redirect para www)

---

## 🔄 Rewrites e Roteamento

**Localização:** `vercel.json`

```json
{
  "rewrites": [
    { "source": "/obrigado", "destination": "/obrigado.html" },
    {
      "source": "/app/:path((?!.*\\.).*)",
      "destination": "/app/index.html"
    }
  ]
}
```

**O que faz:**

1. `/obrigado` → `obrigado.html` (rewrite simples)

2. `/app/:path((?!.*\\.).*)`  → `/app/index.html`
   - Regex `(?!.*\\.)` = "não contém ponto"
   - Captura: `/app`, `/app/dashboard`, `/app/auth`
   - NÃO captura: `/app/assets/file.js`, `/app/assets/style.css`
   - Permite que React Router funcione

**Resultado:**
- ✅ `/app` → React App carrega
- ✅ `/app/dashboard` → React Router renderiza Dashboard
- ✅ `/app/auth` → React Router renderiza Auth
- ✅ `/app/assets/index.js` → Serve arquivo JS corretamente

---

## ⚠️ ARQUIVOS CRÍTICOS - NÃO DELETAR

### 1. `vercel.json` (RAIZ do repositório)
- **Path:** `Prod/vercel.json`
- **Por quê:** Sem ele, o Vercel não sabe como buildar
- **Sintomas se deletado:** Build falha ou apenas 900ms

### 2. `scripts/prepare-dist.cjs`
- **Por quê:** Organiza Landing + App no mesmo `dist/`
- **Sintomas se deletado:** LP e App não aparecem juntos

### 3. `Landing/package.json` e `App/package.json`
- **Por quê:** Define scripts de build
- **Sintomas se alterado:** Build pode quebrar

### 4. `App/vite.config.ts`
- **Por quê:** Define `base: "/app/"` para paths corretos
- **Sintomas se alterado:** CSS/JS dão 404

### 5. `App/src/App.tsx`
- **Por quê:** Define `basename="/app"` no React Router
- **Sintomas se alterado:** Rotas internas dão 404

---

## 📊 Como Verificar se o Deploy Funcionou

### 1. Logs do Vercel (Dashboard)

Um build **bem-sucedido** deve mostrar:

```
Running "install" command: cd Landing && npm install && cd ../App && npm install
✓ Landing dependencies installed
✓ App dependencies installed

> habitz-landing@0.0.0 build
> vite build
✓ built in 500ms

> vite_react_shadcn_ts@0.0.0 build
> vite build
✓ built in 11s

[prepare-dist] Landing publicada na raiz e app disponível em /app/.

Build Completed in /vercel/output [15-20s]
```

**Duração esperada:** 15-25 segundos

### 2. Testar no Navegador

- ✅ `www.habitz.life/` → Mostra a Landing Page
- ✅ `www.habitz.life/obrigado` → Mostra página de agradecimento
- ✅ `www.habitz.life/app` → **Redireciona para** `/app/dashboard`
- ✅ `www.habitz.life/app/dashboard` → Dashboard carrega
- ✅ `www.habitz.life/app/auth` → Auth carrega
- ✅ **DevTools Console:** Sem erros 404 nos assets

### 3. Checklist de Verificação

```
□ Build demorou > 10 segundos
□ Logs mostram "[prepare-dist] Landing publicada..."
□ www.habitz.life/ abre a LP
□ www.habitz.life/app redireciona para /app/dashboard
□ Console do navegador sem erros 404
□ Assets CSS/JS carregam (Network tab)
```

---

## 🔑 Conceitos Importantes

### Case Sensitivity (Linux vs Windows)

⚠️ **MUITO IMPORTANTE:**

- **Windows:** `Landing` = `landing` (case-insensitive)
- **Linux (Vercel):** `Landing` ≠ `landing` (case-sensitive)

**Problema que tivemos:**
```bash
# Git tinha:
landing/index.html  ← minúsculo

# vercel.json referenciava:
cd Landing && npm install  ← maiúsculo

# Resultado no Vercel (Linux):
sh: cd: Landing: No such file or directory
```

**Solução:**
```bash
git mv landing Landing_temp
git mv Landing_temp Landing
git commit -m "fix: rename to match case"
```

### Vite Base Path

**O que é:** O caminho base onde a aplicação será servida.

```typescript
// Vite config
export default defineConfig({
  base: "/app/",  // Aplicação em /app/
})
```

**Resultado:**
```html
<!-- index.html gerado -->
<script src="/app/assets/index.js"></script>  ✅ Correto
<!-- Sem base -->
<script src="/assets/index.js"></script>      ❌ 404!
```

### React Router Basename

**O que é:** Prefixo para todas as rotas do React Router.

```tsx
// Sem basename
<BrowserRouter>
  <Route path="/dashboard" />
</BrowserRouter>
// Rota final: /dashboard ❌ (esperado /app/dashboard)

// Com basename
<BrowserRouter basename="/app">
  <Route path="/dashboard" />
</BrowserRouter>
// Rota final: /app/dashboard ✅
```

### Rewrites vs Redirects

**Rewrites (mantém URL):**
```json
{ "source": "/app/dashboard", "destination": "/app/index.html" }
```
- URL no navegador: `/app/dashboard` ✅
- Arquivo servido: `/app/index.html`
- React Router processa a rota

**Redirects (muda URL):**
```json
{ "source": "/old", "destination": "/new" }
```
- URL no navegador: `/new`
- Faz redirect 301/302

---

## 🚀 Workflow de Deploy

### Para fazer alterações na Landing Page:

1. Edite os arquivos em `Landing/`
2. Teste localmente:
   ```bash
   cd Landing
   npm run dev  # localhost:5173
   ```
3. Commit e push:
   ```bash
   git add Landing/
   git commit -m "feat: Atualizar Landing Page"
   git push origin main
   ```
4. Vercel vai fazer deploy automático (~15-20s)

### Para fazer alterações no App React:

1. Edite os arquivos em `App/src/`
2. Teste localmente:
   ```bash
   cd App
   npm run dev  # localhost:8080
   ```
3. Commit e push:
   ```bash
   git add App/
   git commit -m "feat: Adicionar nova feature"
   git push origin main
   ```
4. Vercel vai fazer deploy automático (~15-20s)

### Para testar o build completo localmente:

```bash
# Na raiz do projeto (Prod/)
cd Landing && npm install && npm run build && cd ..
cd App && npm install && npm run build && cd ..
node scripts/prepare-dist.cjs

# Verificar estrutura
ls -la dist/
ls -la dist/app/
```

---

## 🐛 Erros Comuns

Veja o arquivo `TROUBLESHOOTING.md` para uma lista completa de problemas e soluções.

---

## 📝 Variáveis de Ambiente

### Landing Page
- Não usa variáveis de ambiente
- Configurações hardcoded nos scripts

### App React
- **Path:** `App/.env`
- Variáveis Supabase:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

⚠️ O `.env` está no `.gitignore` - não é commitado por segurança.

Para configurar no Vercel:
1. Settings → Environment Variables
2. Adicionar as variáveis
3. Redeploy

---

## 📅 Histórico de Mudanças

| Data       | Commit  | Mudança                                      |
|------------|---------|----------------------------------------------|
| 07/11/2025 | f44b5bf | Fix: rename landing → Landing (case)        |
| 07/11/2025 | d1d2e46 | Fix: Vite base para / (revertido depois)   |
| 07/11/2025 | b954bcc | Fix: Vite base /app/ + prepare-dist        |
| 07/11/2025 | 83c178b | Fix: Rewrites simplificados                 |
| 07/11/2025 | c5c6107 | Fix: BrowserRouter basename="/app"         |

---

## 📞 Contatos e Links Úteis

- **Repositório GitHub:** https://github.com/lagosconsulting4-cell/habitz-zen-flow
- **Domínio Production:** https://www.habitz.life
- **Documentação Vercel:** https://vercel.com/docs
- **Documentação Vite:** https://vitejs.dev/
- **Documentação React Router:** https://reactrouter.com/

---

**Última atualização:** 07/11/2025
**Mantido por:** Bruno Falci

---

## ⚡ Quick Reference

### Comandos Úteis

```bash
# Testar build localmente
cd Landing && npm run build && cd ..
cd App && npm run build && cd ..
node scripts/prepare-dist.cjs

# Ver estrutura do dist
ls -la dist/
ls -la dist/app/

# Verificar vercel.json
cat vercel.json

# Ver último deploy
git log --oneline -1

# Forçar novo deploy (commit vazio)
git commit --allow-empty -m "chore: Force redeploy" && git push
```

### Checklist de Arquivos Críticos

- [ ] `Prod/vercel.json` existe
- [ ] `scripts/prepare-dist.cjs` existe
- [ ] `Landing/package.json` tem script "build"
- [ ] `App/package.json` tem script "build"
- [ ] `App/vite.config.ts` tem `base: "/app/"`
- [ ] `App/src/App.tsx` tem `basename="/app"`
- [ ] Root Directory no Vercel está vazio

---

**FIM DA DOCUMENTAÇÃO**
