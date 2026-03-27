# Implementação de Botões Interativos — Foquinha WhatsApp

**Data**: 2026-03-25
**Status**: Planejamento técnico (testes de envio validados)
**Workflow**: `agr9lH57zHvusH73` (chatbot_foquinha)

---

## 1. Resumo Executivo

O nó nativo do WhatsApp no n8n **não suporta** envio de mensagens interativas (botões e listas). Confirmamos via código-fonte do n8n (`GenericFunctions.ts`) e pela comunidade. A solução é usar o **nó HTTP Request** chamando a Graph API da Meta diretamente.

**Teste real realizado em 25/03/2026**: Enviamos Reply Buttons (3 botões) e List Messages via script Python → Meta Graph API → WhatsApp. Todos retornaram HTTP 200 e renderizaram corretamente no dispositivo.

**O que muda**: A IA passa a incluir metadados de botões na resposta JSON. Um novo nó condicional roteia entre envio de texto (nó nativo, inalterado) e envio interativo (HTTP Request). Para ações determinísticas (ex: clicar "Feito!"), um short-circuit executa a ação sem chamar a IA, reduzindo latência de ~2s para ~200ms.

---

## 2. Limites Técnicos da API (Confirmados)

### 2.1 Reply Buttons vs List Messages

| Elemento | Reply Buttons | List Messages |
|----------|:---:|:---:|
| Máx. botões/opções | **3** | **10** (total entre seções) |
| Máx. seções | N/A | **10** |
| Título do botão/opção | **20 chars** | **24 chars** |
| ID do botão/opção | **256 chars** | **200 chars** |
| Corpo (body) | **1.024 chars** | **4.096 chars** |
| Footer | **60 chars** | **60 chars** |
| Header texto | **60 chars** | **60 chars** |
| Header mídia | imagem, vídeo, doc | **não suportado** |
| Descrição | N/A | **72 chars** |

### 2.2 Restrições Operacionais

- **Janela de 24h**: Mensagens interativas SÓ funcionam dentro da janela de 24h após a última mensagem do usuário. Mensagens proativas (lembretes, morning summary) já operam dentro desta janela, então **sempre podem incluir botões**.
- **Cada clique = nova execução**: Clicar em um botão dispara uma nova execução do workflow, não é continuação da anterior. Estado deve ser recuperado do banco.
- **API endpoint**: `POST https://graph.facebook.com/v25.0/817613928107132/messages`
- **Autenticação**: Bearer token (System User permanent token)
- **Rate limit**: 80 msgs/segundo por número. Primeiras 1.000 conversas de serviço/mês são gratuitas.

### 2.3 Payloads Confirmados (Testes Reais)

**Reply Buttons** (confirmado HTTP 200):
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "5511997627772",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": { "text": "Hora de cuidar dos seus habitos! O que voce quer fazer agora?" },
    "footer": { "text": "Habitz" },
    "action": {
      "buttons": [
        { "type": "reply", "reply": { "id": "btn_complete_habit", "title": "Completar habito" } },
        { "type": "reply", "reply": { "id": "btn_skip_today", "title": "Pular hoje" } },
        { "type": "reply", "reply": { "id": "btn_remind_later", "title": "Lembrar depois" } }
      ]
    }
  }
}
```

**List Message** (confirmado HTTP 200):
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "5511997627772",
  "type": "interactive",
  "interactive": {
    "type": "list",
    "body": { "text": "Aqui estao seus habitos de hoje:" },
    "footer": { "text": "Habitz" },
    "action": {
      "button": "Ver habitos",
      "sections": [{
        "title": "Habitos pendentes",
        "rows": [
          { "id": "habit_meditar", "title": "Meditar", "description": "10 min - manha" },
          { "id": "habit_exercicio", "title": "Exercicio", "description": "30 min - tarde" },
          { "id": "habit_leitura", "title": "Leitura", "description": "20 min - noite" }
        ]
      }]
    }
  }
}
```

### 2.4 Payload de Resposta (Webhook)

Quando o usuário clica em um botão, o WhatsApp Trigger recebe:

**Reply Button click**:
```json
{
  "type": "interactive",
  "interactive": {
    "type": "button_reply",
    "button_reply": { "id": "btn_complete_habit", "title": "Completar habito" }
  }
}
```

**List selection**:
```json
{
  "type": "interactive",
  "interactive": {
    "type": "list_reply",
    "list_reply": { "id": "habit_meditar", "title": "Meditar", "description": "10 min - manha" }
  }
}
```

---

## 3. Arquitetura Atual do Workflow (Referência)

### 3.1 Path Reativo (mensagem do usuário)

```
WhatsApp Trigger (9cfd88cb)
  → Extract Data (5a4e85ae)
    → Is Audio? (IF)
      → [SIM] Get Audio URL → Download → Transcribe → Set Transcribed Text ↓
      → [NÃO] ↓
    → Get User by Phone (b3b38566)
      → user_exists? (IF)
        → Get/Create Conversation (825491c2)
          → Get User Habits (ae1394c6)
            → Get Habit Templates (5be8d7bb)
              → Prepare Full Context (2634e0db)
                → Call OpenAI API (64c237d1)
                  → Parse Response (b973d354)
                    → Format DB Parameters (bf96022a)
                      → Check If Has Action → Has Action? (IF)
                        → [SIM] Route By Intent → [Complete|Create|Edit|Deactivate|List]
                        → [NÃO] normal-response-passthrough
                      → Save Conversation State (dae83d36)
                        → Split Message → Loop Chunks → Wait → Send Response (64c0320f)
```

### 3.2 Path Proativo (scheduler)

```
Schedule Trigger (5min)
  → Get BRT Time
    → Fetch Due Habits | Fetch Morning Summary | Fetch Evening Recap | Fetch Weekly Progress | Fetch 22h Inactive | Fetch Disengaged
      → [cada path] Has Results? → Group/Format → Generate AI Message → Wait (Rate Limit) → Send WhatsApp → Log → Save to Chat
```

### 3.3 Nodes de Envio Atual

| Node | Tipo | Uso |
|------|------|-----|
| Send Response (`64c0320f`) | WhatsApp nativo | Resposta reativa (texto) |
| Send WhatsApp Text (`7f1af6b6`) | WhatsApp nativo | Lembretes individuais |
| Send Morning Summary | WhatsApp nativo | Resumo matinal |
| Send Evening Recap | WhatsApp nativo | Recap noturno |
| Send Weekly Progress | WhatsApp nativo | Progresso semanal |
| Send Nudge | WhatsApp nativo | Nudge 22h |
| Send Reengagement | WhatsApp nativo | Reengajamento |

**Todos** usam o nó nativo (texto apenas). Todos precisarão de upgrade condicional para envio interativo.

---

## 4. Evolução do Formato de Resposta da IA

### 4.1 Formato Atual (sem botões)

```json
{
  "response": "Mensagem de texto",
  "intent": "conversation|create_habit|complete_habit|...",
  "intent_data": { "name": "...", "period": "...", ... },
  "new_state": { "pending_action": null, "pending_data": {}, "awaiting_input": null }
}
```

### 4.2 Formato Evoluído (com botões opcionais)

```json
{
  "response": "Mensagem de texto que acompanha os botões",
  "intent": "conversation",
  "intent_data": {},
  "new_state": { "pending_action": null, "pending_data": {}, "awaiting_input": null },
  "buttons": {
    "type": "reply",
    "items": [
      { "id": "btn_ok", "title": "Bora!" },
      { "id": "btn_details", "title": "Detalhes" },
      { "id": "btn_adjust", "title": "Ajustar Plano" }
    ],
    "footer": "Habitz"
  }
}
```

Para List Messages:
```json
{
  "response": "O que voce quer fazer?",
  "buttons": {
    "type": "list",
    "button_text": "Ver Opcoes",
    "sections": [{
      "title": "Acoes",
      "rows": [
        { "id": "menu_new", "title": "Nova Tarefa", "description": "Criar habito ou tarefa" },
        { "id": "menu_list", "title": "Minhas Tarefas", "description": "Ver habitos ativos" },
        { "id": "menu_edit", "title": "Editar Lembretes", "description": "Mudar horarios" },
        { "id": "menu_help", "title": "Ajuda", "description": "Como usar a Foquinha" }
      ]
    }],
    "footer": "Habitz"
  }
}
```

**Regra**: Quando `buttons` é `null` ou ausente, o pipeline de texto existente é usado inalterado.

---

## 5. Convenção de Button IDs

Formato: `{contexto}_{ação}_{qualificador_opcional}`

| Contexto | IDs | Uso |
|----------|-----|-----|
| `onb_` | `onb_start`, `onb_offset_5`, `onb_offset_10`, `onb_offset_15`, `onb_quiet_default`, `onb_quiet_custom` | Onboarding |
| `morn_` | `morn_ok`, `morn_details`, `morn_adjust` | Morning Briefing |
| `rem_` | `rem_done_{habit_id_8chars}`, `rem_skip`, `rem_snooze` | Lembretes |
| `eve_` | `eve_done_{habit_id_8chars}`, `eve_done_all`, `eve_skip` | Evening Recap |
| `menu_` | `menu_new`, `menu_list`, `menu_edit`, `menu_help` | Menu principal |
| `confirm_` | `confirm_yes`, `confirm_no`, `confirm_edit` | Confirmações |
| `habit_` | `habit_{habit_id_8chars}` | Seleção de hábito em lista |

**Habit ID short** = primeiros 8 caracteres do UUID. Exemplo: `rem_done_ae1394c6`.

---

## 6. Mudanças de Nodes

### 6.1 Extract Data (MODIFICAR — node `5a4e85ae`)

**Adicionar** parsing de mensagens interativas após a detecção de tipo existente:

```javascript
// NOVO: Detectar respostas interativas (cliques em botões/listas)
const isInteractive = message.type === 'interactive';
let buttonReplyId = '';
let buttonReplyTitle = '';
let listReplyId = '';
let listReplyTitle = '';

if (isInteractive && message.interactive) {
  if (message.interactive.type === 'button_reply') {
    buttonReplyId = message.interactive.button_reply?.id || '';
    buttonReplyTitle = message.interactive.button_reply?.title || '';
  } else if (message.interactive.type === 'list_reply') {
    listReplyId = message.interactive.list_reply?.id || '';
    listReplyTitle = message.interactive.list_reply?.title || '';
  }
}

const interactiveText = buttonReplyTitle || listReplyTitle || '';
```

**Modificar** o campo `text` do return para incluir fallback interativo:
```javascript
text: textContent || interactiveText,
```

**Adicionar** ao return:
```javascript
isInteractive: isInteractive,
buttonReplyId: buttonReplyId,
buttonReplyTitle: buttonReplyTitle,
listReplyId: listReplyId,
listReplyTitle: listReplyTitle,
interactiveId: buttonReplyId || listReplyId,
interactiveTitle: interactiveText
```

**Impacto**: Mudança aditiva. Campos extras no output não quebram nodes downstream.

### 6.2 Button Router (NOVO NODE — Code)

Posição: Entre Extract Data e Is Audio? (ou entre Prepare Full Context e Call OpenAI API, dependendo da fase).

**Função**: Detectar button IDs determinísticos e executar short-circuit, pulando a chamada de IA.

```javascript
const ctx = $input.first().json;
const btnId = ctx.interactiveId || '';

// Sem botão interativo → continuar fluxo normal
if (!btnId) return { json: { ...ctx, shortCircuit: false } };

// --- SHORT-CIRCUIT: Ações determinísticas ---

// Completar hábito via lembrete ou evening recap
if (btnId.startsWith('rem_done_') || btnId.startsWith('eve_done_')) {
  const habitIdShort = btnId.replace(/^(rem_done_|eve_done_)/, '');
  const habit = ctx.habits_raw?.find(h => h.id?.startsWith(habitIdShort));
  if (habit) {
    return {
      json: {
        ...ctx,
        shortCircuit: true,
        ai_response: `Feito! ${habit.emoji || '✅'} ${habit.name} concluído!`,
        intent: 'complete_habit',
        intent_data: { name: habit.name, habit_id: habit.id },
        new_state: { pending_action: null, pending_data: {}, awaiting_input: null }
      }
    };
  }
}

// Morning OK
if (btnId === 'morn_ok') {
  return {
    json: {
      ...ctx,
      shortCircuit: true,
      ai_response: 'Bora! Estou aqui se precisar. Quando completar algo, me avisa! 💪',
      intent: 'conversation',
      intent_data: {},
      new_state: { pending_action: null, pending_data: {}, awaiting_input: null }
    }
  };
}

// Snooze lembrete
if (btnId === 'rem_snooze' || btnId === 'rem_skip') {
  return {
    json: {
      ...ctx,
      shortCircuit: true,
      ai_response: 'OK, te lembro depois! 🦭',
      intent: 'conversation',
      intent_data: {},
      new_state: { pending_action: null, pending_data: {}, awaiting_input: null }
    }
  };
}

// Onboarding offset
if (btnId.startsWith('onb_offset_')) {
  const offset = parseInt(btnId.replace('onb_offset_', ''));
  return {
    json: {
      ...ctx,
      shortCircuit: true,
      intent: 'set_reminder_offset',
      intent_data: { offset },
      ai_response: `Beleza! Vou te avisar ${offset === 0 ? 'na hora exata' : offset + ' min antes'}. 🔔`,
      new_state: { pending_action: null, pending_data: {}, awaiting_input: null }
    }
  };
}

// Quiet hours padrão
if (btnId === 'onb_quiet_default') {
  return {
    json: {
      ...ctx,
      shortCircuit: true,
      intent: 'set_quiet_hours',
      intent_data: { start: 22, end: 7 },
      ai_response: 'Silêncio das 22h às 7h ativado! Sem mensagens nesse horário. 🤫',
      new_state: { pending_action: null, pending_data: {}, awaiting_input: null }
    }
  };
}

// Completar todos (evening recap)
if (btnId === 'eve_done_all') {
  return {
    json: {
      ...ctx,
      shortCircuit: true,
      intent: 'complete_all_pending',
      intent_data: {},
      ai_response: 'Todos marcados como feitos! Dia incrível! 🏆',
      new_state: { pending_action: null, pending_data: {}, awaiting_input: null }
    }
  };
}

// Não é determinístico → passar para IA
return { json: { ...ctx, shortCircuit: false } };
```

**Routing**: Se `shortCircuit === true`, pular Call OpenAI API e ir direto para Parse Response/Format DB Parameters. Se `false`, continuar fluxo normal.

### 6.3 Send Interactive Message (NOVO NODE — Code)

Substitui/complementa o Send Response nativo para envio de botões.

```javascript
const data = $json;
const WA_TOKEN = '...'; // Mesmo token do Download Audio node
const PHONE_NUMBER_ID = '817613928107132';
const API_URL = `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`;

const buttons = data.buttons;
if (!buttons || !buttons.type) {
  return { json: { ...data, sent: false, reason: 'no_buttons' } };
}

let payload;

if (buttons.type === 'reply') {
  payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: data.phone,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: (data.chunk || data.response_text || '').slice(0, 1024) },
      action: {
        buttons: buttons.items.slice(0, 3).map(b => ({
          type: 'reply',
          reply: { id: b.id.slice(0, 256), title: b.title.slice(0, 20) }
        }))
      }
    }
  };
  if (buttons.footer) payload.interactive.footer = { text: buttons.footer.slice(0, 60) };
} else if (buttons.type === 'list') {
  payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: data.phone,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: (data.chunk || data.response_text || '').slice(0, 4096) },
      action: {
        button: (buttons.button_text || 'Ver Opcoes').slice(0, 20),
        sections: buttons.sections
      }
    }
  };
  if (buttons.footer) payload.interactive.footer = { text: buttons.footer.slice(0, 60) };
}

try {
  const response = await this.helpers.httpRequest({
    method: 'POST',
    url: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${WA_TOKEN}`
    },
    body: payload,
    json: true
  });
  return { json: { ...data, sent: true, wa_response: response } };
} catch (error) {
  return { json: { ...data, sent: false, error: error.message } };
}
```

### 6.4 Has Buttons? (NOVO NODE — IF)

Posição: Antes do Send Response, após Split Message/Loop Chunks.

- **Condição**: `{{ $json.hasButtons === true }}`
- **TRUE** → Send Interactive Message (novo)
- **FALSE** → Send Response (existente, inalterado)

### 6.5 Fallback to Text (roteamento)

Após Send Interactive Message, se `$json.sent === false` → rotear para Send Response como fallback. Garante que o usuário sempre recebe uma resposta, mesmo se o envio de botões falhar.

### 6.6 Split Message (MODIFICAR — node existente)

Adicionar no início: se a resposta tem `buttons`, NÃO dividir em chunks. Enviar como mensagem única:

```javascript
if (buttonsData && buttonsData.type) {
  results.push({
    json: {
      phone,
      chunk: text,
      chunkIndex: 0,
      totalChunks: 1,
      hasButtons: true,
      buttons: buttonsData
    }
  });
  continue; // Pular splitting para esta resposta
}
```

### 6.7 Save Last Buttons (ADICIONAR à Save Conversation State)

Ao salvar o estado da conversa, incluir os botões enviados para validação posterior:

```sql
UPDATE whatsapp_conversations
SET last_buttons_sent = $X::jsonb
WHERE phone = $Y;
```

---

## 7. Fluxos de Botões Detalhados

### 7.1 Morning Briefing com Botões

**Gatilho**: Schedule Trigger → Fetch Morning Summary (7:00 BRT)

**Mensagem**:
```
Bom dia, Bruno! ☀️ Seu plano de hoje:

🌅 Manhã: 💪 Academia, 🧘 Meditar
🌤️ Tarde: 🥗 Almoço saudável
🌙 Noite: 📚 Ler

São 4 hábitos. Bora! 💪
```

**Botões** (Reply Buttons — 3 opções):
| ID | Título | Ação |
|----|--------|------|
| `morn_ok` | `Bora!` | Short-circuit: resposta motivacional rápida |
| `morn_details` | `Detalhes` | IA expande: dicas para cada hábito, horários |
| `morn_adjust` | `Ajustar Plano` | IA entra em modo edição: `pending_action: 'adjust_plan'` |

**Modificação**: Node Format Morning Summary adiciona `buttons` ao output. Node Send Morning Summary substituído por Code node que envia interativo.

### 7.2 Lembretes de Hábitos com Botões

**Gatilho**: Schedule Trigger → Fetch Due Habits (a cada 5min)

**Mensagem** (gerada pela IA via Generate AI Message):
```
Hora da meditação! 🧘 Só 10 minutinhos de paz...
```

**Botões** (Reply Buttons — 2 opções):
| ID | Título | Ação |
|----|--------|------|
| `rem_done_{id8}` | `Feito!` | Short-circuit: complete_habit direto, sem IA |
| `rem_snooze` | `Depois` | Short-circuit: "OK, te lembro depois!" |

**Para múltiplos hábitos agrupados** (mesmo período), usar List Message:
```
Você tem 3 hábitos pendentes da manhã! 🌅
```
Botão: `Marcar feitos` → Lista com cada hábito como opção.

**Modificação**: Node Generate AI Message adiciona `buttons` ao output. Node Send WhatsApp Text substituído por Code node condicional.

### 7.3 Menu de Gestão de Tarefas

**Gatilho**: Usuário digita "menu", "tarefas", "opcoes" ou clica botão de menu.

**Mensagem**:
```
O que você quer fazer? 🦭
```

**Botões** (List Message — 4+ opções):
| ID | Título | Descrição | Ação |
|----|--------|-----------|------|
| `menu_new` | `Nova Tarefa` | `Criar hábito ou tarefa` | IA: `pending_action: 'create_habit'`, pergunta nome |
| `menu_list` | `Minhas Tarefas` | `Ver hábitos ativos do dia` | Short-circuit: list_habits |
| `menu_edit` | `Editar Lembretes` | `Mudar horários` | IA mostra hábitos como Lista para seleção |
| `menu_help` | `Ajuda` | `Como usar a Foquinha` | IA: explica funcionalidades |

**Por que List Message**: 4 opções > limite de 3 Reply Buttons.

**Modificação**: Instrução no prompt da IA para retornar `buttons.type: "list"` quando detectar pedido de menu.

### 7.4 Onboarding com Botões

**Gatilho**: `needs_onboarding === true` (primeiro contato de usuário registrado)

#### Passo 1: Boas-vindas
```
Olá, Bruno! 🦭 Eu sou a Foquinha, sua assistente pessoal.
Vamos preparar seu espaço de foco?
```
**Botões**: `[Começar Setup]` (Reply Button, `onb_start`)

#### Passo 2: Nome
*(Se user_name === 'Visitante')*
```
Como quer que eu te chame?
```
**Sem botões** — resposta de texto livre → intent `save_name`

#### Passo 3: Antecedência do lembrete
```
Com quanto tempo de antecedência quer ser avisado?
```
**Botões** (Reply Buttons):
| ID | Título |
|----|--------|
| `onb_offset_5` | `5 min antes` |
| `onb_offset_10` | `10 min antes` |
| `onb_offset_15` | `15 min antes` |

Short-circuit: PATCH `notification_preferences.reminder_offset_minutes` direto.

#### Passo 4: Horário de silêncio
```
Quer definir um horário de silêncio?
```
**Botões** (Reply Buttons):
| ID | Título |
|----|--------|
| `onb_quiet_default` | `22h - 7h` |
| `onb_quiet_custom` | `Personalizar` |

`onb_quiet_default` → Short-circuit: set 22-7.
`onb_quiet_custom` → IA pergunta horários (texto livre).

#### Passo 5: Primeiro hábito
```
Agora vamos criar seu primeiro hábito! Que tal começar com algo simples?
```
**Botões** (List Message com sugestões):
| ID | Título | Descrição |
|----|--------|-----------|
| `habit_meditar` | `Meditar` | `10 min de manhã` |
| `habit_exercicio` | `Exercício` | `30 min por dia` |
| `habit_leitura` | `Ler` | `20 min à noite` |
| `habit_custom` | `Criar meu próprio` | `Escolher nome e horário` |

#### Passo 6: Conclusão
Após criação → intent `onboarding_complete` + mensagem de boas-vindas.

**Modificação**: Instrução no prompt da IA para incluir `buttons` em cada passo do onboarding.

### 7.5 Evening Recap com Botões

**Gatilho**: Schedule Trigger → Fetch Evening Recap (21:00 BRT)

**Mensagem**:
```
Como foi o dia, Bruno? 🌙

✅ Academia — feito!
✅ Meditar — feito!
⬜ Ler — pendente

2/3 hábitos concluídos! Falta só 1!
```

**Botões** (dinâmico baseado em pendentes):

- **1-3 pendentes** → Reply Buttons com nome de cada hábito pendente:
  | ID | Título |
  |----|--------|
  | `eve_done_{id8}` | `Ler ✅` |

  *Nota*: Se apenas 1 pendente, adicionar `eve_skip` como segunda opção.

- **4+ pendentes** → List Message:
  Botão: `Marcar feitos` → Lista com cada hábito pendente como opção.

- **0 pendentes** → Sem botões, apenas mensagem de celebração.

**Modificação**: Node Format Evening Recap gera `buttons` dinâmicos baseado na contagem de pendentes.

---

## 8. Padrão Short-Circuit

Ações determinísticas que **não precisam de IA**:

| Button ID Pattern | Ação Executada | Latência |
|---|---|---|
| `rem_done_*` | Complete habit pelo ID | ~200ms |
| `eve_done_*` | Complete habit pelo ID | ~200ms |
| `eve_done_all` | Complete ALL pending | ~200ms |
| `onb_offset_*` | PATCH offset | ~200ms |
| `onb_quiet_default` | PATCH quiet hours 22-7 | ~200ms |
| `morn_ok` | Resposta template | ~200ms |
| `rem_snooze` | Resposta template | ~200ms |
| `rem_skip` | Resposta template | ~200ms |

**Todas as demais** (menu_*, morn_details, morn_adjust, onb_quiet_custom, onb_start, confirm_*, etc.) **passam pela IA** para resposta personalizada.

**Fluxo**:
```
Extract Data → Button Router
  → shortCircuit=true:  [pula IA] → Format DB → Has Action? → Execute → Save → Send
  → shortCircuit=false: [fluxo normal] → Prepare Full Context → Call OpenAI → ...
```

---

## 9. Migração de Banco

### 9.1 Nova coluna: `last_buttons_sent`

```sql
-- Migration: 20260326000000_add_last_buttons_sent.sql
ALTER TABLE public.whatsapp_conversations
  ADD COLUMN IF NOT EXISTS last_buttons_sent JSONB DEFAULT NULL;

COMMENT ON COLUMN public.whatsapp_conversations.last_buttons_sent IS
  'Últimos botões enviados ao usuário, para validação de cliques';
```

**Formato armazenado**:
```json
{
  "sent_at": "2026-03-25T10:19:00Z",
  "type": "reply",
  "button_ids": ["rem_done_ae1394c6", "rem_snooze"]
}
```

**Uso**: Ao receber um clique de botão, verificar se o `buttonReplyId` está em `last_buttons_sent.button_ids`. Se não estiver (botão antigo/expirado), tratar como texto livre passando o título para a IA.

### 9.2 TypeScript types (manual update)

Adicionar em `App/src/integrations/supabase/types.ts`, tabela `whatsapp_conversations`:
```typescript
last_buttons_sent: Json | null;
```

---

## 10. Tratamento de Erros

### 10.1 Falha no envio de botão interativo

Se o HTTP Request retorna erro (24h expirada, payload inválido, rate limit):
1. Log do erro
2. **Fallback automático**: enviar a mesma mensagem como texto puro via nó WhatsApp nativo
3. Não quebrar o fluxo — usuário sempre recebe resposta

### 10.2 Button ID inválido/expirado

Se o usuário clica em um botão de uma mensagem antiga:
1. `last_buttons_sent` não contém o ID → tratar como texto livre
2. Passar `interactiveTitle` como `text` para a IA
3. IA responde naturalmente

### 10.3 Hábito não encontrado no short-circuit

Se `rem_done_{id8}` não resolve para nenhum hábito ativo:
1. `shortCircuit = false` → passar para IA
2. IA recebe o título do botão como texto e responde

### 10.4 Race condition em cliques rápidos

Se usuário clica 2 botões rapidamente (ex: 2 hábitos no evening recap):
- Cada clique = execução separada
- Completar hábito é **idempotente** (completar um já completo = no-op)
- Sem risco de dados corrompidos

---

## 11. Fases de Implementação

### Fase 1: Foundation — Extract Data + Envio Interativo
**Impacto**: Alto | **Complexidade**: Média | **Estimativa de nodes**: 3 novos, 2 modificados

**O que fazer**:
1. Modificar **Extract Data** para parsear interactive replies
2. Criar **Send Interactive Message** (Code node com HTTP Request)
3. Criar **Has Buttons?** (IF node)
4. Modificar **Split Message** para não dividir mensagens com botões
5. Adicionar **Fallback to Text** (routing)

**Deploy script**: `fix_buttons_phase1_foundation.py`

**Teste**: Enviar mensagem com `buttons` hardcoded num Code node de teste → verificar que botões renderizam no WhatsApp.

---

### Fase 2: Lembretes com Botões
**Impacto**: Muito Alto | **Complexidade**: Média | **Estimativa de nodes**: 1 novo, 2 modificados

**O que fazer**:
1. Modificar **Generate AI Message** para incluir `buttons` (Feito/Depois) no output
2. Substituir **Send WhatsApp Text** por Code node condicional (interativo ou texto)
3. Criar **Button Router** (short-circuit para `rem_done_*`, `rem_snooze`)
4. Integrar Button Router no path reativo (entre Extract Data e Prepare Full Context)

**Deploy script**: `fix_buttons_phase2_reminders.py`

**Teste**: Esperar lembrete chegar com botões → clicar "Feito!" → verificar hábito marcado como completo.

---

### Fase 3: Morning Briefing com Botões
**Impacto**: Alto | **Complexidade**: Baixa | **Estimativa de nodes**: 0 novos, 2 modificados

**O que fazer**:
1. Modificar **Format Morning Summary** para incluir `buttons` (Bora/Detalhes/Ajustar)
2. Substituir **Send Morning Summary** por Code node condicional
3. Adicionar handlers para `morn_ok`, `morn_details`, `morn_adjust` no Button Router

**Deploy script**: `fix_buttons_phase3_morning.py`

**Teste**: Esperar morning summary → verificar botões → clicar cada um → verificar respostas.

---

### Fase 4: Menu de Gestão de Tarefas
**Impacto**: Médio | **Complexidade**: Média | **Estimativa de nodes**: 0 novos, 1 modificado

**O que fazer**:
1. Adicionar instrução no **Call OpenAI API** prompt para retornar `buttons.type: "list"` quando detectar pedido de menu
2. Adicionar handlers para `menu_*` no Button Router
3. Testar com "menu", "tarefas", "opcoes"

**Deploy script**: `fix_buttons_phase4_menu.py`

**Teste**: Digitar "menu" → verificar List Message → selecionar opção → verificar ação.

---

### Fase 5: Onboarding com Botões
**Impacto**: Médio | **Complexidade**: Média | **Estimativa de nodes**: 0 novos, 1 modificado

**O que fazer**:
1. Modificar instruções de onboarding no **Call OpenAI API** prompt para incluir `buttons` em cada passo
2. Adicionar handlers para `onb_*` no Button Router (short-circuit para offset e quiet hours)

**Deploy script**: `fix_buttons_phase5_onboarding.py`

**Teste**: Simular novo usuário (resetar foquinha_onboarded) → verificar fluxo completo com botões.

---

### Fase 6: Evening Recap + Mensagens Proativas
**Impacto**: Médio | **Complexidade**: Baixa | **Estimativa de nodes**: 0 novos, 2 modificados

**O que fazer**:
1. Modificar **Format Evening Recap** para gerar botões dinâmicos baseado em pendentes
2. Substituir **Send Evening Recap** por Code node condicional
3. Opcionalmente: adicionar botões ao Weekly Progress e Nudge
4. Adicionar handler para `eve_done_*`, `eve_done_all` no Button Router

**Deploy script**: `fix_buttons_phase6_evening.py`

**Teste**: Esperar evening recap → verificar botões dinâmicos → marcar hábito → verificar.

---

### Fase 7: Migração + Validação
**Impacto**: Baixo | **Complexidade**: Baixa

**O que fazer**:
1. Rodar migração SQL para adicionar `last_buttons_sent`
2. Modificar **Save Conversation State** para salvar botões enviados
3. Modificar **Button Router** para validar contra `last_buttons_sent`
4. Atualizar types.ts manualmente

**Deploy script**: migração SQL + `fix_buttons_phase7_validation.py`

---

## Diagrama de Fases

```
Fase 1 (Foundation) ─────→ Fase 2 (Lembretes) ─────→ Fase 3 (Morning)
                                    │
                                    ├──→ Fase 4 (Menu)
                                    │
                                    ├──→ Fase 5 (Onboarding)
                                    │
                                    └──→ Fase 6 (Evening)
                                              │
                                              └──→ Fase 7 (Validação)
```

Fases 1-2 são pré-requisitos. Fases 3-6 podem ser implementadas em qualquer ordem. Fase 7 é a última.

---

## Referências

| Arquivo | Conteúdo |
|---------|----------|
| `Doc/Foquinha/Botões/guia_botões_n8n_chatbot.md` | Guia técnico completo da API |
| `App/scripts/test_whatsapp_buttons.py` | Script de teste (validado) |
| `App/scripts/foquinha_phase2_fixed.json` | Snapshot do workflow (Mar 18) |
| `App/scripts/fix09_fase4_audio.py` | Template de deploy script |
| `App/scripts/fix34_foquinha_onboarding.py` | Referência de onboarding |
| `App/supabase/migrations/20260218100001_whatsapp_conversations.sql` | Schema da tabela de estado |

---

## Notas Importantes

1. **O prompt da IA pode ter mudado** desde o snapshot de Mar 18. Todo script de deploy DEVE buscar o workflow LIVE via API antes de aplicar patches.
2. **O token WhatsApp** (`EAAJSJRGDhSs...`) já é usado no node Download Audio para transcrição. Reutilizar o mesmo token nos nodes de envio interativo.
3. **Mensagens com botões não devem ser divididas** em chunks. O body já está limitado a 1024/4096 chars.
4. **Nomes de hábitos longos** serão truncados em 20 chars (Reply Button) ou 24 chars (List). Truncar em boundary de palavra quando possível.
5. **WhatsApp credential ID**: `WhL02olkGLDl7rxR` (Foquinha). Phone Number ID: `817613928107132`.
