# Diagnostico e Plano de Acao — Pagina de Perfil

**Data**: 2026-03-10 (atualizado 2026-03-10)
**Status**: CONCLUIDO (Fases 1-4 + Cleanup Conquistas)
**Arquivo principal**: `App/src/pages/Profile.tsx`

---

## Resumo Executivo

A pagina de Perfil acumulou 13 secoes ao longo de multiplos sprints, incluindo codigo morto, funcionalidades redundantes e bugs criticos. Foi reestruturada para 7 secoes limpas, reduzindo de ~843 linhas para ~570 linhas e corrigindo o bug de 404 nas conquistas.

---

## Diagnostico Original (Antes)

### Secoes encontradas (13 total)

| # | Secao | Linhas | Status | Problema |
|---|-------|--------|--------|----------|
| 1 | Identity Header | 200-273 | Mantida | Avatar generico `<User>`, badge de tier inutil |
| 2 | Stats Cards | 275-297 | **REMOVIDA** | Dados duplicados da aba Progress, desmotivam novos users (0 habitos, 1 dia, 0%) |
| 3 | Avatar Section | 299-337 | **REMOVIDA** | Standalone redundante — integrado no header |
| 4 | Recursos | 339-400 | Mantida | Funcional, sem problemas |
| 5 | Conteudo Bonus | 402-434 | Filtrada | "Programa 30 dias" e "Jornada Guiada" redundantes com `/journeys` |
| 6 | Premium Card | 436-470 | **REMOVIDA** | Codigo morto (`{false && ...}`) |
| 7 | Affiliate Program | 472-502 | **REMOVIDA** | Codigo morto (`{false && ...}`) |
| 8 | Conquistas | 504-533 | Movida p/ #2 | **BUG CRITICO**: `navigate("/achievements")` → rota inexistente → 404 |
| 9 | Aparencia | 535-615 | Simplificada | Grid Order selector removido |
| 10 | Sons e Feedback | 617-691 | **REMOVIDA** | Removida por completo — users silenciam o celular |
| 11 | Notificacoes | 693-789 | Simplificada | Quiet Hours UI removida + migration backend |
| 12 | Quiet Hours | 744-771 | **REMOVIDA** | Conflitava com end-of-day (22:00 dentro do range 22:00-07:00) |
| 13 | Acoes da Conta | 791-823 | Mantida | Sem alteracoes |

### Bugs Criticos Encontrados

1. **Conquistas 404** (`Profile.tsx:525` antigo): `navigate("/achievements")` apontava para rota que nunca foi registrada em `App.tsx`. Click resultava em pagina em branco.

2. **Quiet Hours bloqueando End-of-Day**: Default `quiet_hours_start: "22:00"` bloqueava o lembrete de fim do dia que dispara exatamente as 22:00 BRT. Edge functions `notification-trigger-scheduler:77-99` e `habit-reminder-scheduler:59-82` checam quiet hours antes de enviar.

3. **Codigo morto acumulado**: ~70 linhas de JSX dentro de `{false && ...}` (Premium Card + Affiliate Program) nunca renderizadas.

---

## Nova Estrutura (Depois)

### 6 Secoes — `App/src/pages/Profile.tsx` (~510 linhas)

| # | Secao | Descricao |
|---|-------|-----------|
| 1 | Identity Header | Avatar equipado via `getAvatarIcon()`, badge Premium/aguardando, nome editavel, email, admin button |
| 2 | Recursos | Gems balance + Streak Freezes com botoes "Loja"/"Comprar" → FreezeShopModal |
| 3 | Conteudo Bonus | Filtrado: exclui "plano" e "guided". Mostra Meditacoes, Biblioteca, Insights & Dicas |
| 4 | Aparencia | Apenas theme switcher (light/dark). Grid Order removido |
| 5 | Notificacoes | Push toggle, horarios de lembrete (manha/tarde/noite), toggle fim do dia. Sem Quiet Hours |
| 6 | Acoes da Conta | Cancelar Assinatura (premium only) + Sair da conta |

**Nota**: Conquistas Showcase foi removida apos diagnostico — visual ficou ruim (colapsado sem preview, expandido quebrava layout compacto).

---

## Detalhes por Fase

### Fase 1: Limpeza e Remocao

**Objetivo**: Remover 6 secoes mortas/redundantes e limpar imports.

**Acoes executadas**:
- Deletadas Stats Cards (linhas 275-297 antigas)
- Merge avatar no header: `<User>` substituido por `getAvatarIcon(equippedAvatar?.id || 'smile_basic')`
- Deletada Avatar Section standalone (299-337 antigas)
- Deletado codigo morto: Premium Card (436-470), Affiliate (472-502)
- Deletada secao Sons e Feedback inteira (617-691)
- Deletado Grid Order da Aparencia (583-612)
- Deletada Quiet Hours UI de Notificacoes (744-771)
- Removido "Acesso desde" label (270-272)
- Filtrados "plano" e "guided" do Bonus Content: `!["plano", "guided"].includes(section.id)`
- Removidos 11 imports nao utilizados: `User, Bell, Sparkles, Volume2, VolumeX, Vibrate, sounds, useProfileInsights, useAppPreferences, AvatarShopModal, GemCounter`
- Removido `useMemo` import (nenhum memoization necessaria)
- Removidos hooks: `useProfileInsights`, `useAppPreferences`
- Removidos estados: `avatarShopOpen`, `accountCreatedAt`

**Imports adicionados**: `AnimatePresence` (motion/react), `ChevronDown` (lucide), `AchievementsGrid` (gamification)

### Fase 2: Conquistas Inline

**Objetivo**: Corrigir bug 404 e trazer conquistas para posicao de destaque.

**Acoes executadas**:
- Removido `navigate("/achievements")` (bug 404)
- Importado `AchievementsGrid` de `@/components/gamification/AchievementsGrid`
- Adicionado estado `showAllAchievements` (boolean)
- Implementado expand/collapse:
  - Botao "Ver Todas" / "Recolher" com icone `ChevronDown` rotativo (motion.span)
  - `AnimatePresence` com `height: 0 → auto` para animacao suave
  - `AchievementsGrid` renderizado inline com category tabs e detail modals
- Secao movida da posicao 8 para posicao 2 (logo apos header)

**Componentes reutilizados** (zero arquivos criados):
- `AchievementsGrid` — `App/src/components/gamification/AchievementsGrid.tsx`
- `AchievementBadge` — `App/src/components/gamification/AchievementBadge.tsx` (usado internamente)
- `AchievementDetailModal` — `App/src/components/gamification/AchievementDetailModal.tsx` (usado internamente)

### Fase 3: Notificacoes e Backend

**Objetivo**: Desabilitar quiet hours que bloqueavam end-of-day reminders.

**Acoes executadas**:
- Criada migration `App/supabase/migrations/20260311000001_disable_quiet_hours.sql`:
  - `UPDATE` remove `quiet_hours_start/end` do JSONB de todos os users existentes
  - `ALTER TABLE` atualiza default da coluna para excluir quiet hours
- Tipo `notifPrefs` narrowed: removidos campos `quiet_hours_start/end`
- Subtitle dos horarios melhorado: "Novos habitos de jornada usarao estes horarios."
- Edge function code **mantido intacto** para reativacao futura (nenhuma alteracao em functions/)

**Diagnostico do conflito quiet hours vs end-of-day**:
- `notification-trigger-scheduler` dispara end-of-day entre 22:00-23:59 BRT
- Default quiet hours era 22:00-07:00 (definido em migration `20260309000000`)
- 22:00 cai DENTRO do range de quiet hours → notificacao suprimida
- Ao remover quiet hours, end-of-day passa a ser entregue normalmente

### Fase 4: Polish e Verificacao

**Objetivo**: Verificar visualmente a nova estrutura em mobile 375x812.

**Verificacoes executadas** (via Playwright):
- [x] Snapshot a11y confirma 7 secoes presentes e corretas
- [x] Avatar header mostra icone equipado (nao User generico)
- [x] Conquistas: "Ver Todas" expande AchievementsGrid com tabs e badges inline
- [x] Conquistas: "Recolher" colapsa grid com animacao suave
- [x] Bonus mostra apenas 3 items (Meditacoes, Biblioteca, Insights & Dicas)
- [x] Aparencia: apenas theme toggle (sem Grid Order)
- [x] Notificacoes: push toggle, 3 horarios, toggle fim do dia ON (sem Quiet Hours)
- [x] Cancelar Assinatura + Sair da conta presentes
- [x] 0 erros no console
- [x] TypeScript compila sem erros (`npx tsc --noEmit --pretty`)
- [x] Dark mode renderiza corretamente em todas as secoes

---

## Arquivos Modificados

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `App/src/pages/Profile.tsx` | Modificado | Reestruturacao completa: 843 → 570 linhas, 13 → 7 secoes |
| `App/supabase/migrations/20260311000001_disable_quiet_hours.sql` | Criado | Remove quiet hours de users + atualiza default |

## Arquivos NAO Criados (reutilizacao)

Os seguintes componentes existentes foram reutilizados sem nenhuma modificacao:
- `App/src/components/gamification/AchievementsGrid.tsx` (181 linhas)
- `App/src/components/gamification/AchievementBadge.tsx` (148 linhas)
- `App/src/components/gamification/AchievementDetailModal.tsx`
- `App/src/components/gamification/AvatarIcons.tsx` (103 linhas)

---

## Decisoes de Arquitetura

### 1. Sons removidos completamente (sem toggle residual)
**Decisao**: Remover a secao inteira sem manter toggle em Aparencia.
**Racional**: O user decidiu que users podem silenciar o celular se necessario. Nao ha necessidade de toggle in-app.

### 2. Quiet Hours desabilitados (codigo preservado)
**Decisao**: Remover UI + migration para limpar dados, mas manter edge function code.
**Racional**: Quiet hours sao uma feature valida que pode ser reativada. O conflito com end-of-day era um bug de configuracao (default 22:00 == horario do end-of-day), nao da feature em si.

### 3. Conquistas inline (nao rota dedicada)
**Decisao**: Usar `AchievementsGrid` inline com expand/collapse em vez de criar rota `/achievements`.
**Racional**: (a) Rota nunca existiu (404 bug), (b) componente ja e self-contained com tabs e modals, (c) evita criacao de nova pagina.

### 4. Horarios de lembrete mantidos
**Decisao**: Manter apesar do user questionar utilidade.
**Racional**: Horarios sao usados como defaults para habitos de jornada (`preferred_reminder_times`). Copy melhorado para esclarecer: "Novos habitos de jornada usarao estes horarios."

---

## Metricas

| Metrica | Antes | Depois | Delta |
|---------|-------|--------|-------|
| Linhas de codigo | ~843 | 512 | -39% |
| Secoes | 13 | 6 | -54% |
| Imports | ~35 | ~21 | -40% |
| Hooks chamados | 8 | 5 | -38% |
| Estados locais | 11 | 8 | -27% |
| Bugs criticos | 2 | 0 | -100% |
| Codigo morto | ~70 linhas | 0 | -100% |
| Arquivos orfaos deletados | — | 2 | useProfileInsights.ts, AvatarShopModal.tsx |
