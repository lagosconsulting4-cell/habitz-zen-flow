# 🏆 Melhores Práticas - Projeto Habitz

**Data:** 07/11/2025
**Versão:** 1.0

---

## 🎯 Objetivos Deste Documento

Este guia contém as melhores práticas aprendidas durante o desenvolvimento e deploy do projeto Habitz. Seguir estas diretrizes ajudará a:

- ✅ Evitar problemas comuns de deploy
- ✅ Manter o código organizado e consistente
- ✅ Facilitar manutenção futura
- ✅ Garantir deploys rápidos e confiáveis
- ✅ Prevenir regressões

---

## 📁 Estrutura de Arquivos

### ✅ FAZER

**1. Use case consistente para nomes de pastas**
```
✅ Correto:
Landing/
App/
Scripts/
Doc/

❌ Errado:
landing/  (minúsculo em alguns commits)
Landing/  (maiúsculo em outros)
```

**Por quê:** Linux (Vercel) é case-sensitive. Inconsistência causa falhas de build.

**2. Use PascalCase para pastas principais**
```
✅ Correto: Landing/, App/, Scripts/, Components/
❌ Evitar: landing/, app/, scripts/, components/
```

**3. Mantenha estrutura flat quando possível**
```
✅ Correto:
Prod/
├── Landing/
├── App/
└── scripts/

❌ Evitar:
Prod/
└── src/
    └── projects/
        ├── Landing/
        └── App/
```

### ❌ NÃO FAZER

1. ❌ Mudar case de pastas depois de commitadas (cria problemas)
2. ❌ Aninhar projetos muito profundamente
3. ❌ Usar caracteres especiais ou espaços em nomes (use kebab-case)
4. ❌ Criar pastas `dist/` ou `node_modules/` no root

---

## ⚙️ Configurações do Vite

### ✅ FAZER

**1. Sempre defina `base` quando app não está na raiz**

```typescript
// App/vite.config.ts
export default defineConfig(({ mode }) => {
  const base = mode === "production" ? "/app/" : "/";

  return {
    base,  // ⚠️ CRÍTICO!
    plugins: [react()],
  };
});
```

**2. Use variáveis de ambiente para `base` dinâmico**

```typescript
const forcedBase = process.env.VITE_BASE_PATH;
const base = forcedBase ?? (mode === "production" ? "/app/" : "/");
```

**Benefício:** Permite testar diferentes bases sem alterar código.

**3. Configure `outDir` explicitamente**

```typescript
build: {
  outDir: 'dist',
  emptyOutDir: true,  // Limpa antes de buildar
}
```

**4. Use compression plugins**

```typescript
import compression from 'vite-plugin-compression';

plugins: [
  react(),
  compression({ algorithm: 'gzip' }),
],
```

### ❌ NÃO FAZER

1. ❌ Deixar `base: "/"` quando o app está em subpasta
2. ❌ Hardcodar caminhos absolutos no código
3. ❌ Ignorar warnings do Vite sobre chunks grandes
4. ❌ Commitar `dist/` no git (deve estar no .gitignore)

---

## 🔀 React Router

### ✅ FAZER

**1. Use `basename` quando o app não está na raiz**

```tsx
// App/src/App.tsx
<BrowserRouter basename="/app">
  <Routes>
    {/* ... */}
  </Routes>
</BrowserRouter>
```

**2. `basename` deve corresponder ao Vite `base`**

```
Vite base: "/app/"
React Router basename: "/app"

✅ Consistente!
```

**3. Use rotas relativas dentro do app**

```tsx
// ✅ Correto:
<Route path="/dashboard" element={<Dashboard />} />
<Link to="/profile">Profile</Link>

// ❌ Evitar:
<Route path="/app/dashboard" element={<Dashboard />} />
<Link to="/app/profile">Profile</Link>
```

**Por quê:** O `basename` já adiciona o prefixo.

**4. Use `Navigate` para redirects padrão**

```tsx
<Route path="/" element={<Navigate to="/dashboard" replace />} />
```

### ❌ NÃO FAZER

1. ❌ Esquecer `basename` quando app está em subpasta
2. ❌ Misturar rotas absolutas e relativas
3. ❌ Usar `window.location.href` para navegação interna
4. ❌ Hardcodar `/app/` nas rotas (deixe o basename fazer isso)

---

## 🚀 Deployment

### ✅ FAZER

**1. Sempre teste o build localmente antes de fazer push**

```bash
# Testar build completo:
cd Landing && npm install && npm run build && cd ..
cd App && npm install && npm run build && cd ..
node scripts/prepare-dist.cjs

# Verificar estrutura:
ls -la dist/
ls -la dist/app/

# Verificar HTML:
cat dist/app/index.html | grep -E "(script|link)"
```

**2. Use commits descritivos com prefixos**

```bash
✅ Bom:
git commit -m "fix: correct asset paths for /app deployment"
git commit -m "feat: add new habit tracking feature"
git commit -m "chore: update dependencies"

❌ Ruim:
git commit -m "fix"
git commit -m "changes"
git commit -m "update"
```

**Prefixos recomendados:**
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `refactor:` Refatoração de código
- `style:` Mudanças de estilo/formatação
- `docs:` Documentação
- `test:` Testes
- `chore:` Manutenção/configs
- `perf:` Melhoria de performance

**3. Verifique os logs do deploy no Vercel**

```bash
✅ Build saudável:
- Duração: 15-25 segundos
- Mostra: Running "install" command
- Mostra: Running "build" command
- Mostra: [prepare-dist] Landing publicada...
- Status: Success

❌ Build problemático:
- Duração: < 5 segundos ou > 60 segundos
- Não mostra comandos acima
- Erros no console
- Status: Failed
```

**4. Teste em produção após cada deploy**

Checklist pós-deploy:
```
□ www.habitz.life/ → Landing carrega
□ www.habitz.life/obrigado → Página carrega
□ www.habitz.life/app → Redireciona para /app/dashboard
□ www.habitz.life/app/auth → Auth carrega
□ Console do navegador → Sem erros 404
□ Assets carregam → Network tab sem erros
```

**5. Mantenha changelog atualizado**

Crie `CHANGELOG.md`:
```markdown
# Changelog

## [1.2.0] - 2025-11-07
### Fixed
- Corrigido problema de case sensitivity em pastas
- Assets agora carregam corretamente em /app
- React Router funcionando em todas as rotas

### Changed
- Atualizado Vite base para /app/
- Adicionado basename ao BrowserRouter
```

### ❌ NÃO FAZER

1. ❌ Push direto para main sem testar localmente
2. ❌ Fazer múltiplas mudanças não relacionadas em um commit
3. ❌ Ignorar erros/warnings do build
4. ❌ Fazer push sem verificar `git status` antes
5. ❌ Fazer force push sem backup
6. ❌ Commitar sem mensagem descritiva

---

## 🔒 Segurança

### ✅ FAZER

**1. Use .env para secrets**

```bash
# App/.env
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

**2. Adicione .env ao .gitignore**

```bash
# .gitignore
.env
.env.local
.env.production
*.env
```

**3. Configure env vars no Vercel**

1. Dashboard → Settings → Environment Variables
2. Adicione variáveis manualmente
3. Marque para Production

**4. Use diferentes env vars para dev/prod**

```typescript
// Bom:
const apiUrl = import.meta.env.VITE_API_URL;

// Evitar:
const apiUrl = "https://api.example.com";  // hardcoded
```

**5. Rotacione tokens periodicamente**

- Supabase keys: a cada 3-6 meses
- GitHub tokens: quando não mais necessário
- API keys: seguir política de cada serviço

### ❌ NÃO FAZER

1. ❌ Commitar arquivos .env
2. ❌ Hardcodar API keys no código
3. ❌ Usar mesmas credenciais dev/prod
4. ❌ Compartilhar tokens em mensagens/emails
5. ❌ Deixar tokens em logs públicos

---

## 📝 Documentação

### ✅ FAZER

**1. Documente mudanças importantes**

Sempre que fizer uma mudança significativa:
- Atualize README.md
- Adicione comentários no código
- Documente no commit message

**2. Mantenha documentação técnica**

Crie e mantenha:
- `ESTRUTURA-PROJETO.md` (arquitetura)
- `DIAGRAMA-DEPLOY.md` (fluxo de deploy)
- `TROUBLESHOOTING.md` (problemas comuns)
- `MELHORES-PRATICAS.md` (este arquivo)

**3. Use comentários úteis no código**

```typescript
// ✅ Bom:
// Vite base MUST be "/app/" because the app is served at /app/ on production
const base = "/app/";

// ❌ Ruim:
// set base
const base = "/app/";
```

**4. Documente decisões arquiteturais**

Crie `DECISIONS.md`:
```markdown
# Decisões Arquiteturais

## Por que usamos monorepo?
- Facilita compartilhamento de assets
- Deploy unificado no Vercel
- Versionamento simplificado

## Por que React Router em vez de Next.js?
- Mais controle sobre routing
- Bundle size menor
- Familiaridade da equipe
```

### ❌ NÃO FAZER

1. ❌ Deixar código sem comentários complexos
2. ❌ Documentar o óbvio (`// incrementa i`)
3. ❌ Deixar TODO comments sem issue/ticket associado
4. ❌ Documentação desatualizada (worse than no docs)

---

## 🧪 Testes

### ✅ FAZER

**1. Teste build localmente sempre**

```bash
# Script de teste completo
npm run build:all  # ou seu comando equivalente
```

**2. Teste em diferentes ambientes**

- Windows (se desenvolve em Windows)
- Linux (via WSL ou container)
- macOS (se disponível)

**3. Teste em diferentes navegadores**

Mínimo:
- Chrome
- Firefox
- Safari (macOS/iOS)
- Edge

**4. Teste rotas manualmente após mudanças**

```bash
# Lista de URLs para testar:
www.habitz.life/
www.habitz.life/obrigado
www.habitz.life/app
www.habitz.life/app/dashboard
www.habitz.life/app/auth
www.habitz.life/app/profile
www.habitz.life/app/habits
```

**5. Use Lighthouse para performance**

```bash
# Chrome DevTools → Lighthouse
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90
```

### ❌ NÃO FAZER

1. ❌ Fazer deploy sem testar localmente
2. ❌ Testar apenas no seu navegador favorito
3. ❌ Ignorar warnings de build
4. ❌ Não testar em mobile
5. ❌ Assumir que "funcionou no meu PC"

---

## 🔧 Manutenção

### ✅ FAZER

**1. Atualize dependências regularmente**

```bash
# Verificar outdated:
npm outdated

# Atualizar (com cuidado):
npm update

# Ou usar npm-check-updates:
npx npm-check-updates -u
npm install
```

**Frequência:** Mensal ou trimestral

**2. Limpe node_modules periodicamente**

```bash
cd Landing
rm -rf node_modules package-lock.json
npm install

cd ../App
rm -rf node_modules package-lock.json
npm install
```

**3. Monitore tamanho do bundle**

```bash
# Após build, verificar:
ls -lh App/dist/assets/

# Se muito grande (> 1MB JS):
# - Use code splitting
# - Lazy load componentes
# - Remova dependências não usadas
```

**4. Faça backup antes de mudanças grandes**

```bash
# Criar backup tag:
git tag backup-$(date +%Y%m%d)
git push origin --tags

# Ou backup branch:
git checkout -b backup-before-refactor
git push origin backup-before-refactor
```

**5. Revise logs de erro no Vercel**

Dashboard → Analytics → Errors

Procure por:
- 404 frequentes
- Erros de JavaScript
- Problemas de performance

### ❌ NÃO FAZER

1. ❌ Deixar dependências desatualizadas por > 6 meses
2. ❌ Atualizar tudo de uma vez sem testar
3. ❌ Ignorar security advisories (npm audit)
4. ❌ Não fazer backup antes de refatorações grandes
5. ❌ Deixar código morto/comentado no repo

---

## 🎨 Código Limpo

### ✅ FAZER

**1. Use ESLint e Prettier**

```json
// .eslintrc.json
{
  "extends": ["react-app", "react-app/jest"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100
}
```

**2. Organize imports**

```tsx
// ✅ Bom:
// 1. React/libs externas
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Componentes
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

// 3. Utilitários
import { formatDate } from '@/lib/utils';

// 4. Tipos
import type { User } from '@/types';

// ❌ Evitar: imports desorganizados
```

**3. Use TypeScript corretamente**

```tsx
// ✅ Bom:
interface DashboardProps {
  userId: string;
  onComplete: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userId, onComplete }) => {
  // ...
};

// ❌ Evitar:
const Dashboard = (props: any) => {  // any é ruim
  // ...
};
```

**4. Extraia componentes reutilizáveis**

```tsx
// ✅ Bom:
// components/HabitCard.tsx
const HabitCard = ({ habit }) => { /* ... */ };

// pages/Dashboard.tsx
<HabitCard habit={habit} />

// ❌ Evitar: Código duplicado em múltiplas páginas
```

**5. Use constantes para valores mágicos**

```tsx
// ✅ Bom:
const MAX_HABITS = 10;
const API_TIMEOUT = 5000;

if (habits.length >= MAX_HABITS) { /* ... */ }

// ❌ Evitar:
if (habits.length >= 10) { /* ... */ }  // O que é 10?
```

### ❌ NÃO FAZER

1. ❌ Deixar console.log em produção
2. ❌ Usar `any` no TypeScript
3. ❌ Componentes com mais de 300 linhas
4. ❌ Funções com mais de 50 linhas
5. ❌ Código comentado (delete ou use git)

---

## 🔄 Git Workflow

### ✅ FAZER

**1. Use branches para features**

```bash
# Criar branch para feature:
git checkout -b feature/habit-streaks

# Desenvolver...

# Merge quando pronto:
git checkout main
git merge feature/habit-streaks
git push origin main

# Deletar branch:
git branch -d feature/habit-streaks
```

**2. Faça commits atômicos**

```bash
# ✅ Bom: Um commit por mudança lógica
git add App/src/pages/Dashboard.tsx
git commit -m "feat: add habit streak counter to dashboard"

git add App/src/components/StreakBadge.tsx
git commit -m "feat: create StreakBadge component"

# ❌ Evitar: Tudo em um commit
git add .
git commit -m "changes"
```

**3. Use .gitignore corretamente**

```bash
# .gitignore
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.vercel
```

**4. Revise antes de commit**

```bash
# Ver mudanças:
git status
git diff

# Adicionar seletivamente:
git add -p  # Interactive

# Commit:
git commit -m "feat: add feature"
```

### ❌ NÃO FAZER

1. ❌ Commit direto na main (use branches)
2. ❌ Commits grandes com múltiplas mudanças
3. ❌ Git add . sem revisar
4. ❌ Force push na main
5. ❌ Commitar node_modules/, dist/

---

## 📊 Monitoramento

### ✅ FAZER

**1. Configure alertas no Vercel**

- Deploy failures
- Build errors
- Performance degradation

**2. Use Analytics**

Vercel Analytics mostra:
- Page views
- Performance metrics
- User demographics

**3. Monitore Core Web Vitals**

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**4. Configure error tracking**

Opções:
- Sentry
- LogRocket
- Bugsnag

```tsx
// Exemplo com Sentry:
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_DSN",
  environment: import.meta.env.MODE,
});
```

**5. Faça load testing periodicamente**

Use:
- Lighthouse CI
- WebPageTest
- GTmetrix

### ❌ NÃO FAZER

1. ❌ Deploy sem monitoramento
2. ❌ Ignorar métricas de performance
3. ❌ Não configurar alertas
4. ❌ Não revisar logs de erro
5. ❌ Assumir que "sem reclamação = sem problema"

---

## ⚡ Performance

### ✅ FAZER

**1. Use lazy loading para rotas**

```tsx
// ✅ Bom:
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
  </Routes>
</Suspense>

// ❌ Evitar: Import tudo no topo
```

**2. Otimize imagens**

```bash
# Use WebP:
✅ image.webp (muito menor)
❌ image.png ou image.jpg (maior)

# Use dimensões corretas:
✅ 1200px width para desktop
❌ 4000px width (desnecessário)
```

**3. Use code splitting**

```tsx
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui': ['@radix-ui/*'],
      }
    }
  }
}
```

**4. Minimize bundle size**

```bash
# Verificar tamanho:
npm run build
ls -lh dist/assets/

# Analisar:
npm install -D rollup-plugin-visualizer
```

**5. Use CDN para assets estáticos**

Vercel já faz isso automaticamente, mas:
- Minimize mudanças em assets (aproveitam cache)
- Use hashing (Vite faz automaticamente)

### ❌ NÃO FAZER

1. ❌ Importar bibliotecas inteiras (`import _ from 'lodash'`)
2. ❌ Não otimizar imagens
3. ❌ Carregar tudo no primeiro load
4. ❌ Não usar lazy loading
5. ❌ Ignorar warnings de bundle size

---

## 🎓 Resumo das Melhores Práticas

### Estrutura
- ✅ Use PascalCase para pastas principais
- ✅ Mantenha case consistente
- ✅ Estrutura flat quando possível

### Configuração
- ✅ Defina `base` no Vite quando não na raiz
- ✅ Use `basename` no React Router
- ✅ Mantenha configs sincronizadas

### Deployment
- ✅ Teste localmente antes de push
- ✅ Use commits descritivos
- ✅ Verifique logs do Vercel
- ✅ Teste em produção após deploy

### Segurança
- ✅ Use .env para secrets
- ✅ Configure env vars no Vercel
- ✅ Nunca commitar credenciais

### Código
- ✅ Use ESLint e Prettier
- ✅ TypeScript correto (sem any)
- ✅ Componentes pequenos e reutilizáveis

### Git
- ✅ Use branches para features
- ✅ Commits atômicos
- ✅ Mensagens descritivas

### Performance
- ✅ Lazy loading
- ✅ Code splitting
- ✅ Imagens otimizadas

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **Vite:** https://vitejs.dev/guide/
- **React Router:** https://reactrouter.com/
- **Vercel:** https://vercel.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs/

### Ferramentas Úteis

- **ESLint:** https://eslint.org/
- **Prettier:** https://prettier.io/
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **Bundlephobia:** https://bundlephobia.com/ (verificar tamanho de pacotes)

### Guias de Estilo

- **Airbnb React Style Guide:** https://github.com/airbnb/javascript/tree/master/react
- **Google TypeScript Style Guide:** https://google.github.io/styleguide/tsguide.html

---

## ✅ Checklist Final

Antes de cada release importante:

```
□ Código testado localmente
□ Build passa sem erros
□ Sem console.logs de debug
□ TypeScript sem erros
□ ESLint sem warnings críticos
□ Bundle size aceitável (< 1MB)
□ Imagens otimizadas
□ .env não commitado
□ Documentação atualizada
□ CHANGELOG atualizado
□ Commits com mensagens descritivas
□ Branch mergeada na main
□ Testado em produção
□ Analytics configurado
□ Error tracking ativo
```

---

**Última atualização:** 07/11/2025
**Mantido por:** Bruno Falci

---

**Lembre-se:** Estas práticas foram aprendidas resolvendo problemas reais. Seguir estas diretrizes economizará horas de debugging no futuro!

**FIM DAS MELHORES PRÁTICAS**
