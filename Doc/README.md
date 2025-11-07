# 📚 Documentação do Projeto Habitz

Bem-vindo à documentação completa do projeto Habitz! Esta documentação foi criada após resolver todos os problemas de deployment e configuração do monorepo Landing + App no Vercel.

---

## 📖 Guias Disponíveis

### 1. [ESTRUTURA-PROJETO.md](./ESTRUTURA-PROJETO.md)
**Documentação completa da estrutura do projeto**

O que você vai encontrar:
- 📁 Estrutura de diretórios detalhada
- ⚙️ Como funciona o build (passo a passo)
- 🔧 Configuração do Vercel
- 🔄 Rewrites e roteamento
- ⚠️ Arquivos críticos que não devem ser deletados
- 📊 Como verificar se o deploy funcionou
- 🔑 Conceitos importantes (case sensitivity, base path, etc)
- 🚀 Workflow de deploy
- 📝 Variáveis de ambiente
- ⚡ Quick reference com comandos úteis

**Quando usar:** Para entender a arquitetura do projeto e como tudo funciona.

---

### 2. [DIAGRAMA-DEPLOY.md](./DIAGRAMA-DEPLOY.md)
**Fluxo visual completo do deploy**

O que você vai encontrar:
- 📊 Diagrama ASCII do fluxo de deploy
- 🏗️ Estrutura de arquivos visual
- 🔄 Fluxo de dados do build script
- 🌐 Fluxo de requisições HTTP
- ⚙️ Configuração em camadas
- 🎯 Pontos críticos de falha
- ✅ Checklist de sanidade
- 📈 Métricas de build saudável
- 🔍 Como debugar no Vercel

**Quando usar:** Para visualizar como o deploy funciona do início ao fim.

---

### 3. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
**Guia completo de resolução de problemas**

O que você vai encontrar:
- 🐛 10 problemas comuns com soluções detalhadas
- 📋 Sintomas, causas e soluções passo a passo
- 🔍 Como identificar cada problema
- 🛠️ Ferramentas de diagnóstico
- 📊 Matriz de sintomas vs problemas
- 🆘 Procedimentos de emergência
- ⚡ Scripts de verificação automática

**Problemas cobertos:**
1. Diretório não encontrado (case sensitivity)
2. Assets CSS/JS dando 404
3. React App com tela branca
4. Rota /app dando 404 do Vercel
5. Rota /app dando 404 interno do React
6. Build muito rápido (< 1 segundo)
7. Landing funciona mas App não
8. Funciona localmente mas não no Vercel
9. Alterações não aparecem em produção
10. Erro de permissão no Git Push

**Quando usar:** Quando algo não está funcionando e você precisa de ajuda para diagnosticar.

---

### 4. [MELHORES-PRATICAS.md](./MELHORES-PRATICAS.md)
**Guia de boas práticas para evitar problemas**

O que você vai encontrar:
- 📁 Estrutura de arquivos (o que fazer e não fazer)
- ⚙️ Configurações do Vite
- 🔀 React Router best practices
- 🚀 Deployment workflow
- 🔒 Segurança e env vars
- 📝 Documentação de código
- 🧪 Testes
- 🔧 Manutenção
- 🎨 Código limpo
- 🔄 Git workflow
- 📊 Monitoramento
- ⚡ Performance

**Quando usar:** Antes de fazer mudanças no projeto para garantir que você está seguindo as melhores práticas.

---

## 🚀 Quick Start

### Para novos desenvolvedores:

1. **Comece lendo:** [ESTRUTURA-PROJETO.md](./ESTRUTURA-PROJETO.md)
2. **Veja o fluxo visual:** [DIAGRAMA-DEPLOY.md](./DIAGRAMA-DEPLOY.md)
3. **Mantenha aberto para consulta:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. **Siga as práticas:** [MELHORES-PRATICAS.md](./MELHORES-PRATICAS.md)

### Para resolver um problema específico:

1. **Vá direto para:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. **Use o índice** para encontrar seu problema
3. **Siga a solução** passo a passo

### Para fazer mudanças no projeto:

1. **Consulte:** [MELHORES-PRATICAS.md](./MELHORES-PRATICAS.md)
2. **Verifique os checklists**
3. **Teste localmente** antes de fazer push

---

## 📊 Histórico do Projeto

Este projeto passou pelos seguintes problemas que foram resolvidos:

| Data | Problema | Solução | Commit |
|------|----------|---------|--------|
| 07/11/2025 | Diretório `landing` vs `Landing` | Rename com git mv | f44b5bf |
| 07/11/2025 | Assets CSS/JS 404 | Vite base="/app/" | b954bcc |
| 07/11/2025 | Rewrites não funcionando | Simplificado regex | 83c178b |
| 07/11/2025 | React Router 404 interno | basename="/app" | c5c6107 |

**Resultado:** ✅ Projeto 100% funcional em produção!

---

## 🎯 Arquitetura do Projeto

```
Produção (www.habitz.life)
├── / ──────────────────→ Landing Page (HTML/CSS/JS)
├── /obrigado ──────────→ Página de agradecimento
└── /app/* ────────────→ React App (SPA)
    ├── /app/dashboard
    ├── /app/auth
    ├── /app/profile
    └── ... (todas as rotas do React)
```

**Tecnologias:**
- **Landing:** HTML + CSS + Vanilla JS + Vite
- **App:** React + TypeScript + Vite + React Router + shadcn/ui + Tailwind CSS
- **Backend:** Supabase
- **Deploy:** Vercel
- **Monorepo:** Estrutura customizada com script prepare-dist.cjs

---

## 🔗 Links Úteis

### Produção
- **Site:** https://www.habitz.life
- **App:** https://www.habitz.life/app

### Repositório
- **GitHub:** https://github.com/lagosconsulting4-cell/habitz-zen-flow

### Ferramentas
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard

### Documentação Externa
- **Vite:** https://vitejs.dev/
- **React Router:** https://reactrouter.com/
- **Vercel:** https://vercel.com/docs
- **shadcn/ui:** https://ui.shadcn.com/

---

## 💡 Dicas Rápidas

### Comandos mais usados:

```bash
# Testar build completo
cd Landing && npm run build && cd ../App && npm run build && cd .. && node scripts/prepare-dist.cjs

# Ver estrutura do dist
ls -la dist/ && ls -la dist/app/

# Verificar asset paths
cat dist/app/index.html | grep -E "(script|link)"

# Forçar novo deploy
git commit --allow-empty -m "chore: redeploy" && git push
```

### Checklist pré-deploy:

```
□ Testei localmente
□ Build passa sem erros
□ Verifiquei dist/app/index.html
□ Commit com mensagem descritiva
□ Push feito
□ Verificar logs do Vercel
□ Testar em produção
```

---

## 🆘 Precisa de Ajuda?

1. **Problema técnico?** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. **Dúvida sobre estrutura?** → [ESTRUTURA-PROJETO.md](./ESTRUTURA-PROJETO.md)
3. **Quer seguir boas práticas?** → [MELHORES-PRATICAS.md](./MELHORES-PRATICAS.md)
4. **Quer entender o fluxo?** → [DIAGRAMA-DEPLOY.md](./DIAGRAMA-DEPLOY.md)

Se nenhum dos guias resolver, procure nos logs do Vercel ou entre em contato com a equipe.

---

## 📝 Como Contribuir para a Documentação

Se você encontrar um problema novo ou tiver uma solução melhor:

1. Documente o problema em `TROUBLESHOOTING.md`
2. Adicione a solução com passos detalhados
3. Atualize `MELHORES-PRATICAS.md` se for uma prática geral
4. Faça commit com mensagem: `docs: add solution for [problema]`

---

## ✅ Status do Projeto

- ✅ Landing Page funcionando
- ✅ Página de agradecimento funcionando
- ✅ React App em /app funcionando
- ✅ React Router funcionando em todas as rotas
- ✅ Assets carregando corretamente
- ✅ Deploy automático no Vercel
- ✅ Documentação completa

**Última atualização:** 07/11/2025
**Mantido por:** Bruno Falci

---

**Aproveite a documentação e bom desenvolvimento! 🚀**
