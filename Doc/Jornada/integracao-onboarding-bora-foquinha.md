# Integração Bidirecional: Onboarding Bora ↔ Foquinha ↔ Supabase

## Contexto

O Bora (PWA) e a Foquinha (WhatsApp/n8n) são dois produtos independentes que compartilham o mesmo Supabase. Hoje os onboardings são **completamente desconectados** — nenhum sabe o que o outro fez. Um usuário que comprou os dois precisa fazer dois onboardings redundantes sem que nenhum aproveite os dados do outro.

**Objetivo:** Criar uma integração bidirecional inteligente onde cada produto reconhece o que o outro já configurou.

---

## Estado Atual: O Que Cada Sistema Escreve no Supabase

### Bora PWA (ao completar onboarding V2)

| Tabela | Campo | Valor | Step |
|--------|-------|-------|------|
| `profiles` | `has_completed_onboarding` | `true` | S20 (submit) |
| `profiles` | `onboarding_completed_at` | timestamp | S20 |
| `profiles` | `onboarding_version` | `"v2"` | S20 |
| `profiles` | `onboarding_v2_data` | JSON `{wakeSleepTime, weekendDiff, lifeAreas, habitExperience}` | S4-S7 |
| `habits` | 3-5 rows | `source="onboarding_v2"`, com `name, period, reminder_time, frequency_type, days_of_week, emoji, category` | S9/S10 |
| `user_progress` | `notification_preferences.reminder_offset_minutes` | 0/5/10/15/30 | S14b |
| `journey_recommendation_scores` | scores por journey | score + dominant_signal | S12 |
| `user_journey_state` | row por journey selecionada | via RPC `start_user_journey` | S12 |

**O que NÃO escreve:** `whatsapp_conversations`, `foquinha_onboarded`, quiet hours

### Foquinha (ao completar onboarding via chat)

| Tabela | Campo | Valor | Step do chat |
|--------|-------|-------|--------------|
| `whatsapp_conversations` | row criada | `phone, user_id, messages, pending_*` | Primeira msg |
| `habits` | 1+ rows | `source=NULL`, com `name, period, reminder_time, frequency_type, days_of_week` | Step 4 |
| `user_progress` | `notification_preferences.foquinha_onboarded` | `true` | Step 5 |
| `user_progress` | `notification_preferences.reminder_offset_minutes` | 0/5/10/15/30 | Step 2 |
| `user_progress` | `notification_preferences.quiet_hours_start/end` | 0-23 | Step 3 |

**O que NÃO escreve:** `profiles.has_completed_onboarding`, `onboarding_v2_data`, journeys

### Lógica atual de onboarding da Foquinha (nó "Prepare Full Context")

```javascript
const needsOnboarding = userRegistered && messages.length === 0 && !notifPrefs.foquinha_onboarded;
```

5 steps: Nome → Reminder offset → Quiet hours → Primeiro hábito → Conclusão (`foquinha_onboarded = true`)

**A Foquinha NÃO verifica:** `profiles.has_completed_onboarding`, `profiles.onboarding_v2_data`, hábitos existentes

### Hubla Webhook (ponto de entrada)

1. Cria auth user + `profiles` com phone, `is_premium = true`
2. Chama `notifyN8N()` → POST para n8n `/bora-welcome`
3. `/bora-welcome` envia email de boas-vindas com link para configurar senha e/ou link WhatsApp
4. **NÃO cria `whatsapp_conversations`**, **NÃO envia WhatsApp proativo** (Meta bloqueia sem template)

---

## Fases de Execução

### Fase 0 — Fixes urgentes (bugs atuais)

**Objetivo:** Corrigir problemas que afetam usuários agora, independente da integração.

| Item | Descrição | Onde | Status |
|------|-----------|------|--------|
| A | `notifyN8N()` não enviava `customerPhone` no payload → n8n não sabia o phone | `hubla-webhook/index.ts` | ✅ Corrigido e deployado |
| B | Intent `opt_out` no chatbot bloqueava usuários permanentemente | n8n `chatbot_foquinha` | ✅ Removido e deployado |
| C | `opted_out = true` da Isadora Freitas | `whatsapp_conversations` | ✅ Resetado |
| D | Phone mismatch no scheduler: "Save Reminder to Chat" usa `phone=eq.{phone}` (match exato) enquanto `whatsapp_conversations` pode ter formato diferente | n8n nó "Save Reminder to Chat" | Pendente |
| E | `whatsapp_conversations` não é criado ao concluir onboarding Bora → scheduler não encontra conversa | `OnboardingProviderV2.tsx` submit | Pendente |

**Detalhes do Phone Mismatch (item D):**

O matching de 6 fallbacks funciona perfeitamente nos nós de entrada ("Get User by Phone", "Get/Create Conversation"). Mas o scheduler usa um caminho diferente:

| Nó | Matching | Funciona? |
|----|----------|-----------|
| "Get User by Phone" | SQL com 6 fallbacks | ✅ |
| "Get/Create Conversation" | SQL com 6 fallbacks | ✅ |
| "Save Reminder to Chat" | REST API `?phone=eq.{phone}` (exato) | ❌ |

Resultado: mensagens de lembrete são enviadas (Meta normaliza nono dígito), mas o `[LEMBRETE]` não é salvo no chat → Foquinha perde contexto.

**Fix proposto:** No nó "Save Reminder to Chat", trocar lookup por phone para lookup por `user_id` (já disponível no contexto do scheduler).

---

### Fase 1 — Foquinha primeiro → depois Bora

**Objetivo:** Quando um usuário fez onboarding na Foquinha e depois abre o app Bora, o onboarding do Bora reconhece os dados existentes.

**Estado no Supabase quando o usuário abre o Bora:**
- `profiles.has_completed_onboarding = false`
- `user_progress.notification_preferences.foquinha_onboarded = true`
- `user_progress.notification_preferences.reminder_offset_minutes` = valor definido
- `user_progress.notification_preferences.quiet_hours_start/end` = valores definidos
- `habits` = N hábitos criados via Foquinha
- `whatsapp_conversations` = existe com mensagens

**Comportamento esperado por step:**

| Step | Sem Foquinha (normal) | Com dados da Foquinha |
|------|----------------------|----------------------|
| S0-S3 | Normal | Normal (não muda) |
| S4 Wake/Sleep | Usuário preenche | Manter (Foquinha não coleta wake/sleep) |
| S5 Weekend | Usuário preenche | Manter (Foquinha não coleta) |
| S6 Life Areas | Usuário preenche | Manter (Foquinha não coleta) |
| S7 Experience | Usuário preenche | Manter (Foquinha não coleta) |
| S8 Loading | "Gerando sua rotina..." | "Encontramos seus hábitos da Foquinha! Gerando sugestões complementares..." |
| S9 Preview | Lista de sugestões geradas | **Duas seções:** "DA FOQUINHA (já ativos) ✅" + "SUGESTÕES NOVAS 💡" |
| S10 Confirm | Confirma rotina | Confirma (dedup: não recria hábitos existentes) |
| S11-S12 Journeys | Normal | Normal |
| S13 PWA | Normal | Normal |
| S14 Notifications | Normal | Normal |
| S14b Reminder Offset | Usuário escolhe | **Auto-skip** (já definido pela Foquinha) |
| S20 Celebration | Normal | Normal + cria `whatsapp_conversations` se não existir |

**S9 Preview — Design visual quando tem dados da Foquinha:**

```
┌─────────────────────────────────┐
│  Sua rotina personalizada       │
│                                 │
│  DA FOQUINHA (já ativos):       │
│  ☑ Acordar (06:00)         ✅  │
│  ☑ Academia (07:00)        ✅  │
│  ☑ Ler (21:00)             ✅  │
│                                 │
│  SUGESTÕES NOVAS:               │
│  ☐ Meditar (06:15)         💡  │
│  ☐ Beber água (08:00)      💡  │
│  ☐ Journaling (21:30)      💡  │
│                                 │
│  Arraste para reordenar         │
└─────────────────────────────────┘
```

- Hábitos da Foquinha vêm pré-selecionados (check ativo), desmarcáveis
- Sugestões novas vêm desmarcadas, baseadas no algoritmo de recomendação (usa respostas de S4-S7)
- Ambas as seções suportam arrastar para reordenar
- Algoritmo de recomendação exclui hábitos com mesmo nome dos da Foquinha (dedup na geração)

**Mudanças necessárias:**

| Arquivo | Mudança |
|---------|---------|
| `OnboardingProviderV2.tsx` | Fetch hábitos existentes + `foquinha_onboarded` no init; flag `hasFoquinhaData`; dedup no submit; criar `whatsapp_conversations` no submit |
| `S8_LoadingRoutine.tsx` | Texto adaptativo quando `hasFoquinhaData` |
| `S9_RoutinePreview.tsx` | Duas seções visuais: hábitos Foquinha (pré-selecionados) + sugestões novas (desmarcadas) |
| `S14b_ReminderOffset.tsx` | Auto-skip se `reminder_offset_minutes` já definido |

**Verificação:**

1. Criar 3 hábitos via Foquinha → abrir Bora → S8 diz "Encontramos seus hábitos!" → S9 mostra duas seções → S14b pula
2. Completar onboarding → verificar que hábitos Foquinha NÃO foram duplicados
3. Verificar que `whatsapp_conversations` existe após submit
4. Usuário SEM dados Foquinha → onboarding funciona normalmente (sem seção "DA FOQUINHA")

---

### Fase 2 — Bora primeiro → depois Foquinha

**Objetivo:** Quando um usuário fez onboarding no Bora e depois manda mensagem para a Foquinha, ela reconhece os dados existentes.

**Estado no Supabase quando o usuário manda msg para Foquinha:**
- `profiles.has_completed_onboarding = true`
- `profiles.onboarding_v2_data` = JSON com wake/sleep, life areas
- `habits` = 3-5 hábitos com `source="onboarding_v2"` e `reminder_time`
- `user_progress.notification_preferences.reminder_offset_minutes` = valor definido
- `foquinha_onboarded` = undefined (não setado)
- `whatsapp_conversations` = criado no submit do Bora (Fase 1) ou na primeira mensagem

**Comportamento esperado:**

O onboarding da Foquinha (5 steps no chat) deve se adaptar:

| Step | Sem Bora (normal) | Com dados do Bora |
|------|-------------------|-------------------|
| 1 Nome | Pergunta nome | **Pular** se `display_name` já existe e ≠ "Visitante" |
| 2 Reminder offset | Pergunta offset | **Pular** (✅ já faz isso hoje se campo preenchido) |
| 3 Quiet hours | Pergunta horário | **Pular** se quiet_hours já definido (✅ já faz) |
| 4 Primeiro hábito | Pede para criar | **Listar hábitos existentes e confirmar** |
| 5 Conclusão | Resumo | Apresentar funcionalidades exclusivas da Foquinha |

**Mensagem adaptada para Step 4 (se tem hábitos do Bora):**

> "Vi que você já configurou sua rotina no Bora! Seus hábitos são:
> 1. Acordar (06:00) ☀️
> 2. Academia (07:00) 💪
> 3. Ler (21:00) 📚
> Tudo certo? Quer ajustar algum horário ou adicionar mais algum?"

**Mensagem adaptada para Step 5:**

> "Agora vou te enviar lembretes no WhatsApp na hora dos seus hábitos! Você pode:
> - Me dizer quando completou um hábito
> - Pedir para criar novos hábitos ou tarefas
> - Tirar dúvidas sobre rotina e produtividade"

**Mudanças necessárias (n8n chatbot_foquinha — workflow ID: agr9lH57zHvusH73):**

| Nó | Mudança |
|----|---------|
| "Get User by Phone" | Adicionar `p.has_completed_onboarding` ao SELECT |
| "Prepare Full Context" | Adicionar `bora_onboarding_done` e `existing_habits_context` ao output passado ao AI |
| "Call OpenAI API" | Novo bloco no system prompt: `foquinhaOnboardingAdaptiveSection` que detecta se Bora já foi feito e adapta os 5 steps |

**Verificação:**

1. Completar onboarding Bora com 4 hábitos → abrir WhatsApp → Foquinha deve listar os hábitos e apresentar funcionalidades, sem pedir para criar hábito novo
2. Steps 2-3 devem ser pulados se offset e quiet_hours já definidos
3. `foquinha_onboarded = true` deve ser setado ao final

---

### Fase 3 — WhatsApp Template Messages (Meta 24h window)

**Objetivo:** Permitir que a Foquinha envie mensagens proativas fora da janela de 24h do Meta.

**Problema atual:** A Foquinha envia todos os lembretes como free-form text (`operation: "send"`). O Meta só aceita free-form dentro de 24h da última interação do usuário. Fora disso, a mensagem é silenciosamente rejeitada.

**O que precisa ser feito:**

1. **Criar templates HSM** no Meta Business Manager (categoria Utility):
   - `boas_vindas_foquinha` — primeiro contato pós-compra
   - `lembrete_habito` — lembrete de hábito (com variáveis `{{1}}` nome, `{{2}}` hábito)
   - `reengajamento` — usuário inativo há 7+ dias

2. **Alterar scheduler no n8n** para verificar `last_interaction`:
   - Se `last_interaction` < 24h → enviar free-form (atual)
   - Se `last_interaction` > 24h → enviar template HSM
   - Se sem `whatsapp_conversations` → enviar template de boas-vindas

3. **Alterar nó "Send WhatsApp Text"** para suportar `operation: "sendTemplate"` como fallback

**Verificação:**

1. Usuário com `last_interaction` > 24h → recebe template em vez de free-form
2. Novo usuário pós-compra → recebe template de boas-vindas
3. Usuário ativo (< 24h) → continua recebendo free-form normalmente

---

### Fase 4 — Normalização de dados e robustez

**Objetivo:** Garantir consistência de dados entre os dois sistemas.

**Items:**

1. **Normalização de phone em toda a base:**
   - Definir formato canônico (ex: `5588999871449` — sempre 13 dígitos com +55 e nono dígito)
   - Migration para normalizar todos os phones em `profiles` e `whatsapp_conversations`
   - Garantir que novos phones sempre são normalizados na entrada (webhook + chatbot)

2. **Dedup de hábitos cross-product:**
   - Quando Bora cria hábito que já existe na Foquinha (mesmo nome + user_id), não duplicar
   - Quando Foquinha cria hábito que já existe no Bora, não duplicar
   - Considerar match fuzzy (ex: "Academia" vs "Ir para a academia")

3. **Sincronização de notification_preferences:**
   - Se Bora define `reminder_offset_minutes` e Foquinha já tinha outro valor → qual prevalece?
   - Proposta: o mais recente ganha (timestamp do update)

4. **Auditoria de `foquinha_onboarded`:**
   - Verificar quantos usuários têm `foquinha_onboarded = true` vs quantos têm `whatsapp_conversations`
   - Backfill se necessário

---

## Resumo de Fases

| Fase | Escopo | Complexidade | Dependência |
|------|--------|-------------|-------------|
| 0 | Fixes urgentes (phone mismatch, whatsapp_conversations) | Baixa | Nenhuma |
| 1 | Foquinha→Bora (onboarding adaptativo no PWA) | Média | Fase 0 |
| 2 | Bora→Foquinha (onboarding adaptativo no n8n) | Média | Fase 0 |
| 3 | WhatsApp Templates (Meta 24h window) | Média-Alta | Independente |
| 4 | Normalização e robustez | Baixa-Média | Fase 1+2 |
