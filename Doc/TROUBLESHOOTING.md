# 🐛 Guia Completo de Troubleshooting - Habitz

**Data:** 07/11/2025
**Versão:** 1.0

---

## 📋 Índice de Problemas

1. [Diretório não encontrado - Case Sensitivity](#problema-1-diretório-não-encontrado)
2. [Assets CSS/JS dando 404](#problema-2-assets-cssjs-dando-404)
3. [React App com tela branca](#problema-3-react-app-com-tela-branca)
4. [Rota /app dando 404 do Vercel](#problema-4-rota-app-dando-404-do-vercel)
5. [Rota /app dando 404 interno do React](#problema-5-rota-app-dando-404-interno-do-react)
6. [Build muito rápido (< 1 segundo)](#problema-6-build-muito-rápido)
7. [Landing Page funciona mas App não](#problema-7-landing-funciona-mas-app-não)
8. [Deploy funciona localmente mas não no Vercel](#problema-8-funciona-localmente-mas-não-no-vercel)
9. [Alterações não aparecem em produção](#problema-9-alterações-não-aparecem)
10. [Erro de permissão no Git Push](#problema-10-erro-de-permissão-no-git-push)

---

## Problema #1: Diretório não encontrado

### Sintomas

```bash
# Log do Vercel:
sh: line 1: cd: Landing: No such file or directory
Error: Command "cd Landing && npm install..." exited with 1
```

### Causa

**Case sensitivity mismatch:**
- Windows: `Landing` = `landing` (case-insensitive)
- Linux (Vercel): `Landing` ≠ `landing` (case-sensitive)

O Git tinha o diretório como `landing` (minúsculo), mas o código referenciava `Landing` (maiúsculo).

### Como Identificar

```bash
# Ver arquivos no git:
git ls-tree HEAD | grep -i landing

# Se mostrar:
040000 tree abc123... landing  # ❌ minúsculo
```

### Solução

```bash
# Renomear no git (2 passos para forçar case change):
git mv landing Landing_temp
git mv Landing_temp Landing

# Verificar:
git status
# Deve mostrar: renamed: landing/... -> Landing/...

# Commit e push:
git commit -m "fix: rename landing to Landing for case-sensitive systems"
git push origin main
```

### Prevenção

- Sempre use PascalCase para pastas principais: `Landing`, `App`, `Scripts`
- Verifique com `git ls-tree HEAD` antes de fazer deploy
- Configure git para respeitar case:
  ```bash
  git config core.ignorecase false
  ```

---

## Problema #2: Assets CSS/JS dando 404

### Sintomas

```
Console do navegador:
❌ Failed to load resource: /assets/index-ABC123.js (404)
❌ Failed to load resource: /assets/index-ABC123.css (404)

Tela do navegador: Branca ou sem estilos
```

### Causa

O Vite está configurado com `base: "/"` mas o app está sendo servido em `/app/`.

**HTML gerado:**
```html
<script src="/assets/index.js"></script>  ❌ Errado
```

**Deveria ser:**
```html
<script src="/app/assets/index.js"></script>  ✅ Correto
```

### Como Identificar

1. Abra DevTools (F12) → Network
2. Recarregue a página
3. Veja assets com status 404
4. Veja que o path está sem `/app/`

Ou veja o HTML gerado:
```bash
cat dist/app/index.html | grep -E "(script|link)"
```

Se aparecer `/assets/...` em vez de `/app/assets/...` → problema!

### Solução

**App/vite.config.ts:**
```typescript
export default defineConfig(({ mode }) => {
  const base = mode === "production" ? "/app/" : "/";  // ✅ Adicionar /app/

  return {
    base,  // ⚠️ IMPORTANTE!
    plugins: [react()],
    // ...
  };
});
```

**Depois:**
```bash
cd App
npm run build

# Verificar:
cat dist/index.html | grep -E "(script|link)"
# Deve mostrar: /app/assets/...
```

### Prevenção

- Sempre defina `base` no vite.config quando o app não está na raiz
- Teste o build localmente antes do deploy
- Verifique o HTML gerado em `dist/`

---

## Problema #3: React App com tela branca

### Sintomas

- Navegador mostra tela branca
- DevTools Console:
  ```
  ❌ Failed to load resource: /assets/index.js (404)
  ❌ Failed to load resource: /assets/index.css (404)
  ```

### Causa

Combinação de dois problemas:
1. Vite `base` incorreto (veja Problema #2)
2. React Router `basename` incorreto (veja Problema #5)

### Solução Completa

**1. Corrigir Vite base:**
```typescript
// App/vite.config.ts
export default defineConfig({
  base: "/app/",  // ✅
});
```

**2. Corrigir React Router basename:**
```tsx
// App/src/App.tsx
<BrowserRouter basename="/app">  {/* ✅ */}
  <Routes>
    {/* ... */}
  </Routes>
</BrowserRouter>
```

**3. Rebuild e verificar:**
```bash
cd App
npm run build
cat dist/index.html | grep script
# Deve mostrar: /app/assets/...
```

---

## Problema #4: Rota /app dando 404 do Vercel

### Sintomas

Navegador mostra página 404 do Vercel:
```
404: NOT_FOUND
```

### Causa

Os rewrites do `vercel.json` não estão configurados ou estão incorretos.

### Como Identificar

1. Verifique se existe `dist/app/index.html` localmente
2. Se existe local mas dá 404 online → problema de rewrite

### Solução

**vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/app/:path((?!.*\\.).*)",
      "destination": "/app/index.html"
    }
  ]
}
```

**O que faz:**
- Regex `(?!.*\\.)` = "não contém ponto"
- Captura: `/app`, `/app/dashboard`, `/app/auth`
- NÃO captura: `/app/assets/file.js`

**Depois:**
```bash
git add vercel.json
git commit -m "fix: add rewrites for /app routes"
git push origin main
```

### Prevenção

- Sempre configure rewrites para SPAs
- Use regex para excluir arquivos estáticos
- Teste padrões: `/app`, `/app/subrota`, `/app/assets/file.js`

---

## Problema #5: Rota /app dando 404 interno do React

### Sintomas

- Navegador mostra página 404 **do próprio React App**
- Console mostra erro do React Router:
  ```
  Error: User attempted to access non-existent route: /app
  ```
- Você vê o componente `NotFound` do React

### Causa

O `BrowserRouter` não tem `basename` configurado, então não sabe que está em `/app/`.

**O que acontece:**
```
URL: /app/dashboard
React Router vê: /app/dashboard  (sem basename)
Rota definida: /dashboard
Resultado: 404 (não encontra /app/dashboard)
```

**O que deveria acontecer:**
```
URL: /app/dashboard
React Router vê: /dashboard  (com basename="/app")
Rota definida: /dashboard
Resultado: ✅ Match!
```

### Como Identificar

1. Abra DevTools Console
2. Se o erro vem de `index-[hash].js` → React Router
3. Se mostra componente NotFound do app → problema de basename

### Solução

**App/src/App.tsx:**
```tsx
const App = () => (
  <BrowserRouter basename="/app">  {/* ✅ ADICIONAR */}
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* ... */}
    </Routes>
  </BrowserRouter>
);
```

**Depois:**
```bash
cd App
npm run build
cd ..
# Test deploy
```

### Prevenção

- Sempre use `basename` quando o app não está na raiz
- `basename` deve corresponder ao `base` do Vite
- Teste todas as rotas após mudanças

---

## Problema #6: Build muito rápido

### Sintomas

Log do Vercel:
```
Build Completed in /vercel/output [900ms]
```

Build normal deveria demorar 15-25 segundos.

### Causa

O `vercel.json` não está sendo lido ou os comandos não estão executando.

### Como Identificar

Logs não mostram:
```bash
✗ Não mostra: Running "install" command
✗ Não mostra: npm run build
✗ Não mostra: [prepare-dist] Landing publicada...
```

### Possíveis Causas

1. **vercel.json deletado ou inválido**
   ```bash
   # Verificar:
   cat vercel.json
   # Se não existir ou tiver JSON inválido → problema
   ```

2. **Root Directory configurado errado no Vercel**
   - Settings → General → Root Directory
   - Deve estar **VAZIO** ou `.`

3. **Build Command com override no Vercel**
   - Settings → Build & Development → Build Command
   - Se tiver override → pode ignorar vercel.json

### Solução

**1. Verificar vercel.json existe:**
```bash
ls -la vercel.json
# Se não existir, criar
```

**2. Verificar conteúdo:**
```json
{
  "installCommand": "cd Landing && npm install && cd ../App && npm install",
  "buildCommand": "cd Landing && npm run build && cd ../App && npm run build && cd .. && node scripts/prepare-dist.cjs",
  "outputDirectory": "dist"
}
```

**3. Verificar Root Directory no Vercel:**
- Dashboard → Settings → General
- Root Directory: ❌ **DEIXAR VAZIO**

**4. Commit e redeploy:**
```bash
git add vercel.json
git commit -m "fix: restore vercel.json"
git push origin main
```

### Prevenção

- Nunca delete `vercel.json`
- Sempre verifique build time após deploy
- Mantenha backup do `vercel.json` funcional

---

## Problema #7: Landing funciona mas App não

### Sintomas

- ✅ `www.habitz.life/` → Funciona
- ✅ `www.habitz.life/obrigado` → Funciona
- ❌ `www.habitz.life/app` → 404 ou tela branca

### Diagnóstico

**Cenário A: 404 do Vercel**
→ Veja [Problema #4](#problema-4-rota-app-dando-404-do-vercel)

**Cenário B: Tela branca, assets 404**
→ Veja [Problema #2](#problema-2-assets-cssjs-dando-404)

**Cenário C: 404 do React**
→ Veja [Problema #5](#problema-5-rota-app-dando-404-interno-do-react)

### Checklist de Verificação

```bash
# 1. Verificar se dist/app/ existe localmente
ls -la dist/app/index.html
# Se não existe → prepare-dist.cjs não rodou

# 2. Verificar se App buildu
ls -la App/dist/index.html
# Se não existe → build do App falhou

# 3. Verificar rewrites
cat vercel.json | grep -A 3 "rewrites"
# Deve ter rewrite para /app/

# 4. Verificar Vite base
cat App/vite.config.ts | grep base
# Deve ter: base: "/app/"

# 5. Verificar React Router basename
cat App/src/App.tsx | grep basename
# Deve ter: basename="/app"
```

---

## Problema #8: Funciona localmente mas não no Vercel

### Sintomas

```bash
# Local:
npm run build  # ✅ Funciona
ls dist/app/   # ✅ Existe

# Vercel:
Deploy falha ou app não carrega
```

### Possíveis Causas

#### A. Case Sensitivity
→ Veja [Problema #1](#problema-1-diretório-não-encontrado)

#### B. Variáveis de Ambiente

**Sintomas:**
- App carrega mas funcionalidades não funcionam
- Console mostra erros de Supabase/API

**Solução:**
1. Vercel Dashboard → Settings → Environment Variables
2. Adicionar:
   ```
   VITE_SUPABASE_URL=https://...
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
3. Redeploy

#### C. Node Modules Desatualizados

**Solução:**
```bash
cd Landing
rm -rf node_modules package-lock.json
npm install
cd ../App
rm -rf node_modules package-lock.json
npm install
```

#### D. Build Cache Corrompido

**Solução no Vercel:**
1. Dashboard → Settings → General
2. "Clear Build Cache"
3. Redeploy

---

## Problema #9: Alterações não aparecem

### Sintomas

Você fez mudanças, commit, push, mas o site não mudou.

### Possíveis Causas

#### A. Cache do Navegador

**Solução:**
1. Hard Refresh: `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (Mac)
2. Ou abrir aba anônima
3. Ou limpar cache: `Ctrl + Shift + Delete`

#### B. Deploy não terminou

**Verificar:**
1. Vercel Dashboard → Deployments
2. Ver se está "Building" ou "Deploying"
3. Aguardar completar (~1-2 min)

#### C. Deploy falhou

**Verificar:**
1. Vercel Dashboard → Deployments
2. Se status é "Error" → ver logs
3. Corrigir erro e fazer novo commit

#### D. CDN Cache

O Vercel faz cache agressivo de assets.

**Solução:**
- Aguardar 2-5 minutos
- Verificar URL específica: `www.habitz.life/app?v=2`
- Forçar invalidação no dashboard (avançado)

---

## Problema #10: Erro de permissão no Git Push

### Sintomas

```bash
git push origin main

# Erro:
remote: Permission to lagosconsulting4-cell/habitz-zen-flow.git denied to USER.
fatal: unable to access 'https://github.com/.../': The requested URL returned error: 403
```

### Causa

Git está usando credenciais erradas ou expiradas.

### Solução A: Usar Token

```bash
# Configurar remote com token:
git remote set-url origin "https://TOKEN@github.com/lagosconsulting4-cell/habitz-zen-flow.git"

# Ou na hora do push:
git push https://TOKEN@github.com/lagosconsulting4-cell/habitz-zen-flow.git main
```

### Solução B: GitHub CLI

```bash
# Instalar gh CLI: https://cli.github.com/
gh auth login

# Push:
git push origin main
```

### Solução C: SSH

```bash
# Configurar SSH key: https://docs.github.com/en/authentication
git remote set-url origin git@github.com:lagosconsulting4-cell/habitz-zen-flow.git
git push origin main
```

---

## 🔍 Ferramentas de Diagnóstico

### Script de Verificação Completa

Crie `scripts/verify.sh`:

```bash
#!/bin/bash

echo "🔍 Verificando estrutura do projeto..."

# Verificar arquivos críticos
echo ""
echo "📁 Arquivos críticos:"
test -f vercel.json && echo "✅ vercel.json" || echo "❌ vercel.json FALTANDO!"
test -f scripts/prepare-dist.cjs && echo "✅ prepare-dist.cjs" || echo "❌ prepare-dist.cjs FALTANDO!"
test -f Landing/package.json && echo "✅ Landing/package.json" || echo "❌ Landing/package.json FALTANDO!"
test -f App/package.json && echo "✅ App/package.json" || echo "❌ App/package.json FALTANDO!"
test -f App/vite.config.ts && echo "✅ App/vite.config.ts" || echo "❌ App/vite.config.ts FALTANDO!"

# Verificar configurações
echo ""
echo "⚙️  Configurações:"
grep -q '"base".*"/app/"' App/vite.config.ts && echo "✅ Vite base: /app/" || echo "❌ Vite base incorreto!"
grep -q 'basename="/app"' App/src/App.tsx && echo "✅ React Router basename: /app" || echo "❌ React Router basename incorreto!"
grep -q 'outputDirectory.*dist' vercel.json && echo "✅ Vercel outputDirectory: dist" || echo "❌ Vercel outputDirectory incorreto!"

# Verificar git
echo ""
echo "📦 Git:"
git ls-tree HEAD | grep -E "(Landing|App|scripts)" && echo "✅ Pastas no git com case correto" || echo "⚠️  Verificar case das pastas"

echo ""
echo "✅ Verificação completa!"
```

**Uso:**
```bash
chmod +x scripts/verify.sh
./scripts/verify.sh
```

### Comando de Debug Rápido

```bash
# Ver últimos 5 commits
git log --oneline -5

# Ver arquivos staged
git status

# Ver diff do último commit
git show HEAD

# Ver estrutura do dist
ls -laR dist/ | head -50

# Testar build local
cd Landing && npm run build && cd ../App && npm run build && cd .. && node scripts/prepare-dist.cjs && ls -la dist/ && ls -la dist/app/
```

---

## 📊 Matriz de Sintomas vs Problemas

| Sintoma | Problema Provável | Seção |
|---------|-------------------|-------|
| `cd: Landing: No such file` | Case sensitivity | #1 |
| Assets CSS/JS 404 | Vite base errado | #2 |
| Tela branca | Vite base + React Router | #3 |
| 404 página Vercel em /app | Rewrites faltando | #4 |
| 404 página React em /app | React Router basename | #5 |
| Build < 1 segundo | vercel.json não rodou | #6 |
| LP funciona, App não | Múltiplas causas | #7 |
| Local funciona, Vercel não | Case ou env vars | #8 |
| Mudanças não aparecem | Cache | #9 |
| Git push falha | Permissões | #10 |

---

## 🆘 Em Caso de Emergência

### Se Tudo Quebrar Completamente

1. **Encontrar último commit funcional:**
   ```bash
   git log --oneline -20
   # Encontrar um commit que sabidamente funcionava
   ```

2. **Resetar para commit funcional:**
   ```bash
   git reset --hard <commit-hash>
   git push --force origin main
   ```

3. **Commits de referência funcionais:**
   - `c5c6107` - Último commit com tudo funcionando
   - Use como ponto de restauração se necessário

4. **Redeploy no Vercel:**
   - Dashboard → Deployments → "..." → Redeploy

### Hotline de Suporte

- **Documentação Vercel:** https://vercel.com/docs
- **Suporte Vercel:** https://vercel.com/support
- **GitHub Issues:** Criar issue no repo

---

**FIM DO TROUBLESHOOTING**
