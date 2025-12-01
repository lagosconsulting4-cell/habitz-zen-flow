# Plano de Migração: Quiz/Diagnóstico → Onboarding Simples

**Data:** 2025-11-11
**Status:** Em Execução
**Objetivo:** Transformar o sistema de quiz/diagnóstico TDAH em um fluxo de onboarding simplificado focado apenas em coleta de dados.

---

## 📋 Resumo Executivo

### O que está mudando
- ❌ **Removendo:** Todo o sistema de diagnóstico, cálculo de scores, análise de tipo TDAH
- ❌ **Removendo:** Página `/analise` e geração de PDFs de diagnóstico
- ✅ **Mantendo:** As 5 etapas de perguntas do quiz atual
- ✅ **Renomeando:** `assessment_responses` → `onboarding_responses`
- ✅ **Simplificando:** Fluxo direto: Onboarding → Dashboard

### Motivação
- Simplificar a experiência inicial do usuário
- Focar em coleta de dados ao invés de diagnóstico
- Tornar o onboarding obrigatório e direto
- Reduzir complexidade técnica e manutenção

---

## 🎯 Decisões de Produto

### 1. Fluxo após completar onboarding
**Decisão:** Ir direto para o Dashboard
**Alternativas consideradas:** Tela de confirmação, página de seleção de áreas
**Justificativa:** Experiência mais fluida e direta para o usuário

### 2. Dados históricos
**Decisão:** Renomear tabelas (preservar dados)
**Implementação:**
- `assessment_responses` → `onboarding_responses`
- `analysis_summaries` → `legacy_analysis_summaries`

### 3. Etapas mantidas
**Decisão:** Todas as 5 etapas do quiz atual
**Conteúdo:**
1. Sobre você (idade, diagnóstico, medicação, energia)
2. Desafios (8 opções + campo livre)
3. Sentimentos (5 sliders: foco, motivação, sobrecarga, clareza, autoestima)
4. Preferências (tempo disponível, formato, ambiente)
5. Contato (email opcional + consentimento)

### 4. Obrigatoriedade
**Decisão:** Obrigatório para todos os usuários autenticados
**Implementação:** Verificação em `App.tsx` redireciona para `/onboarding` se não completado

---

## 🗂️ Estrutura Antes vs Depois

### ANTES

```
Fluxo não-autenticado:
/quiz → Completa quiz → /analise → Vê diagnóstico → "Plano Personalizado" → /auth

Fluxo autenticado novo:
/auth → /onboarding (seleção de áreas) → /dashboard

Fluxo autenticado com quiz:
/dashboard → Vê card "Hábitos sugeridos do quiz" → Importa hábitos

Arquivos:
- App/src/pages/Quiz.tsx (615 linhas)
- App/src/pages/Analysis.tsx (374 linhas)
- App/src/lib/quizAnalysis.ts (254 linhas)
- App/src/pages/Onboarding.tsx (248 linhas)

Tabelas:
- assessment_responses (respostas + scores)
- analysis_summaries (diagnósticos + PDFs)
```

### DEPOIS

```
Fluxo autenticado:
/auth → /onboarding → Completa 5 etapas → Salva dados → /dashboard

Arquivos:
- App/src/pages/OnboardingFlow.tsx (simplificado, ~400 linhas)
- App/src/pages/Onboarding.tsx (REMOVIDO ou MESCLADO)

Tabelas:
- onboarding_responses (apenas respostas, sem scores)
- legacy_analysis_summaries (dados históricos)
```

---

## 🔧 Mudanças Técnicas Detalhadas

### 1. Database (Supabase)

#### Migration 1: Renomear Tabelas
```sql
-- Renomear tabela principal
ALTER TABLE public.assessment_responses
RENAME TO onboarding_responses;

-- Renomear tabela de análises (preservar histórico)
ALTER TABLE public.analysis_summaries
RENAME TO legacy_analysis_summaries;

-- Comentários
COMMENT ON TABLE public.onboarding_responses IS
'Respostas do fluxo de onboarding (ex-quiz). Apenas coleta de dados, sem diagnóstico.';
```

#### Migration 2: Atualizar View
```sql
-- Atualizar view user_progress_status
DROP VIEW IF EXISTS public.user_progress_status;

CREATE OR REPLACE VIEW public.user_progress_status AS
SELECT
  p.user_id,
  p.display_name,
  p.has_completed_onboarding,
  p.onboarding_goals,
  p.onboarding_completed_at,
  COUNT(DISTINCT or.id) as completed_onboardings,
  MAX(or.completed_at) as last_onboarding_at,
  CASE
    WHEN p.has_completed_onboarding THEN 'completed'
    ELSE 'needs_onboarding'
  END as status
FROM profiles p
LEFT JOIN onboarding_responses or ON or.user_id = p.user_id
GROUP BY p.user_id, p.display_name, p.has_completed_onboarding,
         p.onboarding_goals, p.onboarding_completed_at;
```

#### Migration 3: Simplificar Campo Scores
```sql
-- Opcional: Remover campo scores se não for mais necessário
ALTER TABLE public.onboarding_responses
DROP COLUMN IF EXISTS scores;

-- OU manter para dados históricos, mas não popular em novos registros
```

### 2. Arquivos Deletados

| Arquivo | Linhas | Motivo |
|---------|--------|--------|
| `App/src/pages/Analysis.tsx` | 374 | Página de diagnóstico não é mais necessária |
| `App/src/lib/quizAnalysis.ts` | 254 | Lógica de cálculo de scores e diagnóstico removida |

### 3. Arquivos Renomeados

| De | Para | Mudanças |
|----|------|----------|
| `App/src/pages/Quiz.tsx` | `App/src/pages/OnboardingFlow.tsx` | Remover lógica de diagnóstico, simplificar redirecionamento |

### 4. Arquivos Modificados

#### `App/src/pages/OnboardingFlow.tsx`
**Mudanças:**
- ❌ Remover import de `quizAnalysis.ts`
- ❌ Remover chamadas a `calculateScores()`
- ❌ Remover chamadas a `generateDiagnosisResult()`
- ✅ Simplificar `handleSubmit()` para apenas salvar respostas
- ✅ Mudar redirecionamento de `/analise?assessment_id=X` para `/dashboard`
- ✅ Atualizar métricas de evento (remover `diagnosis_type`, `probability_score`)
- ✅ Atualizar nome da tabela para `onboarding_responses`

#### `App/src/App.tsx`
**Mudanças:**
- ❌ Remover rota `/quiz`
- ❌ Remover rota `/analise`
- ✅ Manter/ajustar rota `/onboarding` (protegida)
- ✅ Atualizar lógica de redirecionamento para usuários não-onboarded

#### `App/src/config/nav.ts`
**Mudanças:**
- ❌ Remover item "Avaliacao TDAH" (`/quiz`)
- ❌ Remover item de análise (se existir)

#### `App/src/pages/Dashboard.tsx`
**Mudanças:**
- ❌ Remover detecção de `localStorage` `habitz:suggested-habits`
- ❌ Remover card de "Seus hábitos sugeridos"
- ❌ Remover lógica de importação de hábitos do quiz
- ❌ Remover verificação de `assessment_responses`

#### `App/src/pages/Onboarding.tsx` (Decisão pendente)
**Opção 1:** Deprecar e remover (substituído por OnboardingFlow)
**Opção 2:** Mesclar seleção de áreas como "Etapa 6" do OnboardingFlow
**Opção 3:** Manter separado como step pós-onboarding

---

## 📊 Impacto em Dados Coletados

### Dados Mantidos (salvos no Supabase)

| Campo | Etapa | Tipo | Uso Atual |
|-------|-------|------|-----------|
| `age_range` | 1 | Select | Contextualização demográfica |
| `diagnosis_status` | 1 | Select | Saber se tem diagnóstico formal |
| `medication_use` | 1 | Select | Uso de medicação |
| `energy_period` | 1 | Select | Melhor horário para atividades |
| `challenges` | 2 | Array | Lista de desafios selecionados |
| `specific_challenge` | 2 | Text | Desafio específico (campo livre) |
| `focus_level` | 3 | Number (1-5) | Nível de foco auto-relatado |
| `motivation_level` | 3 | Number (1-5) | Nível de motivação |
| `overload_level` | 3 | Number (1-5) | Nível de sobrecarga |
| `clarity_level` | 3 | Number (1-5) | Clareza de objetivos |
| `self_esteem_level` | 3 | Number (1-5) | Autoestima/autoconfiança |
| `available_time` | 4 | Select | Tempo diário disponível |
| `preferred_format` | 4 | Select | Formato de conteúdo preferido |
| `practice_environment` | 4 | Select | Onde pratica hábitos |
| `email` | 5 | String | Email para contato |
| `consent_emails` | 5 | Boolean | Consentimento para emails |

### Dados Removidos (não mais calculados)

| Campo | Era calculado por | Uso Anterior |
|-------|-------------------|--------------|
| `scores.focusScore` | `calculateScores()` | Determinar nível de foco |
| `scores.motivationScore` | `calculateScores()` | Determinar nível de motivação |
| `scores.overloadScore` | `calculateScores()` | Determinar sobrecarga |
| `scores.clarityScore` | `calculateScores()` | Determinar clareza |
| `scores.selfEsteemScore` | `calculateScores()` | Determinar autoestima |
| `scores.totalScore` | `calculateScores()` | Score geral (média ponderada) |
| `diagnosis_type` | `getDiagnosisType()` | Tipo TDAH (desatento/hiperativo/combinado) |
| `probability_score` | `generateDiagnosisResult()` | Probabilidade de melhora em 30 dias |
| `primary_symptoms` | `generateDiagnosisResult()` | 5 sintomas identificados |
| `suggested_habits` | `generateDiagnosisResult()` | 3 mini-hábitos sugeridos |

---

## 🚀 Plano de Execução

### Fase 1: Preparação (Database)
- [x] Criar migration para renomear tabelas
- [x] Atualizar views e funções RPC
- [ ] Testar migrations em ambiente de desenvolvimento
- [ ] Aplicar migrations em produção

### Fase 2: Remoção de Código
- [x] Deletar `Analysis.tsx`
- [x] Deletar `quizAnalysis.ts`
- [x] Remover rotas em `App.tsx`
- [x] Limpar `nav.ts`

### Fase 3: Transformação do Quiz
- [x] Renomear `Quiz.tsx` → `OnboardingFlow.tsx`
- [x] Remover lógica de diagnóstico
- [x] Simplificar `handleSubmit()`
- [x] Atualizar redirecionamentos
- [x] Atualizar eventos de métricas

### Fase 4: Limpeza do Dashboard
- [x] Remover lógica de hábitos sugeridos
- [x] Remover cards de importação
- [x] Limpar localStorage checks

### Fase 5: Testes
- [ ] Testar fluxo completo de onboarding
- [ ] Verificar salvamento de dados no Supabase
- [ ] Testar redirecionamento para dashboard
- [ ] Verificar que usuários não-onboarded são bloqueados
- [ ] Testar em diferentes cenários (primeira vez, retorno, etc.)

### Fase 6: Documentação
- [x] Criar `PLANO-MIGRACAO.md`
- [ ] Criar `ESTRUTURA-ONBOARDING.md`
- [ ] Criar `DADOS-COLETADOS.md`
- [ ] Atualizar README principal (se necessário)

---

## 🔍 Pontos de Atenção

### 1. Dados Históricos
- ✅ Dados antigos estão preservados em `onboarding_responses` (ex `assessment_responses`)
- ✅ Análises antigas estão em `legacy_analysis_summaries`
- ⚠️ Se precisar acessar dados antigos, use as tabelas renomeadas

### 2. Métricas e Analytics
- ⚠️ Eventos antigos (`quiz_completed`, `analysis_generated`) não serão mais disparados
- ✅ Novos eventos: `onboarding_started`, `onboarding_step_completed`, `onboarding_completed`
- ⚠️ Dashboards de analytics podem precisar ser atualizados

### 3. Usuários Existentes
- ⚠️ Usuários que já fizeram o quiz antigo: considerar como "onboarded"?
- 💡 Sugestão: Adicionar script de migração para marcar usuários com `assessment_responses` como `has_completed_onboarding = true`

### 4. Links Externos
- ⚠️ Se existem links para `/quiz` ou `/analise` em emails, landing pages, etc., precisam ser atualizados
- ⚠️ Considerar adicionar redirects 301 para evitar 404s

---

## 📝 Checklist de Validação

### Funcional
- [ ] Usuário autenticado sem onboarding é redirecionado para `/onboarding`
- [ ] Todas as 5 etapas aparecem corretamente
- [ ] Dados são salvos corretamente no Supabase
- [ ] Após conclusão, usuário vai para `/dashboard`
- [ ] Usuário que já fez onboarding não é redirecionado novamente
- [ ] Não há mais links/referências para `/quiz` ou `/analise`

### Técnico
- [ ] Migrations aplicadas sem erros
- [ ] Nenhum import de `quizAnalysis.ts` no código
- [ ] Nenhuma referência a `assessment_responses` (usar `onboarding_responses`)
- [ ] Eventos de métricas atualizados
- [ ] Tests passando (se houver)
- [ ] Build de produção sem erros

### UX
- [ ] Textos atualizados (não mencionar "diagnóstico", "análise", etc.)
- [ ] Loading states funcionando
- [ ] Mensagens de erro apropriadas
- [ ] Transição suave entre etapas
- [ ] Mensagem de sucesso após conclusão

---

## 🔄 Rollback Plan

Se algo der errado, seguir estes passos:

1. **Database:** Reverter migrations
   ```sql
   ALTER TABLE onboarding_responses RENAME TO assessment_responses;
   ALTER TABLE legacy_analysis_summaries RENAME TO analysis_summaries;
   ```

2. **Código:** Reverter commits
   ```bash
   git revert <commit-hash>
   ```

3. **Deploy:** Fazer rollback no Vercel/plataforma de hosting

---

## 📅 Timeline Estimado

| Fase | Tempo Estimado | Status |
|------|----------------|--------|
| Database Migrations | 30min | 🟢 Em andamento |
| Remoção de Código | 15min | ⚪ Pendente |
| Transformação Quiz | 1h | ⚪ Pendente |
| Limpeza Dashboard | 30min | ⚪ Pendente |
| Testes | 1h | ⚪ Pendente |
| Documentação | 30min | 🟢 Em andamento |
| **Total** | **~3.5h** | |

---

## 📚 Referências

- Investigação completa da estrutura: Ver output do agente Plan
- Arquivos principais afetados: 8 arquivos identificados
- Dados coletados: Ver seção "Dados Mantidos" acima

---

**Última atualização:** 2025-11-11
**Responsável:** Bruno (com assistência de Claude Code)
