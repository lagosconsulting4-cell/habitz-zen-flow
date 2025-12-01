# Próximos Passos - Implementação Foquinha v2

## ✅ Concluído

### Documentação
- [x] Plano completo em `logical-crunching-cupcake.md`
- [x] `06_expand_habit_templates.sql` - 43 templates
- [x] `07_whatsapp_conversations_table.sql` - tabela de state management

---

## 📋 Fase 1: Executar SQLs no Supabase

### Passo 1.1: Adicionar coluna phone
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **SQL Editor**
3. Execute `01_add_phone_column.sql`:

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
```

### Passo 1.2: Criar tabela whatsapp_conversations
1. No SQL Editor, copie e execute `07_whatsapp_conversations_table.sql` completo

### Passo 1.3: Expandir habit_templates
1. No SQL Editor, copie e execute `06_expand_habit_templates.sql` completo

### Passo 1.4: Vincular número de teste (IMPORTANTE!)
```sql
-- Substitua pelos valores reais:
-- seu-user-id: UUID do usuário no seu banco
-- 5511987654321: Seu número de WhatsApp com código do país
UPDATE public.profiles
SET phone = '5511987654321'
WHERE user_id = 'seu-user-id-aqui';

-- Verificar se funcionou:
SELECT user_id, phone FROM public.profiles WHERE phone IS NOT NULL;
```

---

## 🔧 Fase 2: Configurar Workflow N8N

### Acesso ao Workflow
- **URL**: https://n8n-evo-n8n.harxon.easypanel.host/workflow/agr9lH57zHvusH73
- **Nome atual**: (TBD - verificar no N8N)

### Modificações Necessárias

#### Node 3: Get/Create Conversation (NOVO)
- **Tipo**: Postgres
- **Operation**: executeQuery
- **Query**:
```sql
INSERT INTO public.whatsapp_conversations (phone, messages, pending_action, pending_data, awaiting_input)
VALUES ($1, '[]'::jsonb, NULL, '{}'::jsonb, NULL)
ON CONFLICT (phone) DO UPDATE SET last_interaction = NOW()
RETURNING *;
```
- **Query Replacement**: `={{ [$json.phone] }}`
- **Position**: Paralelo com outros nodes de leitura

#### Node 6: Get Habit Templates (ATUALIZAR)
- **Query (NOVA)**:
```sql
SELECT
  t.id, t.name, t.slug, t.icon_key, t.color,
  t.default_unit, t.default_goal_value, t.default_frequency_type,
  c.name as category_name, c.icon_key as category_icon
FROM public.habit_templates t
LEFT JOIN public.habit_categories c ON t.category_id = c.id
ORDER BY c.sort_order, t.name
LIMIT 20;
```
- **Always Output Data**: `true`

#### Node 7: Prepare Full Context (ATUALIZAR)
- **Tipo**: Code
- **Code (COMPLETO)**:
```javascript
const extractData = $items('Extract Data')[0].json;
const conversation = $items('Get/Create Conversation')[0]?.json || {};
const user = $items('Get User by Phone')[0]?.json || {};
const habits = $items('Get User Habits') || [];
const templates = $items('Get Habit Templates') || [];

const userRegistered = !!user.user_id;

// Formatar histórico (últimas 10 mensagens)
const messages = conversation.messages || [];
const recentMessages = messages.slice(-10);

// Formatar hábitos
const habitsList = habits.map(h => {
  const status = h.json.completed_today ? '✅' : '⬜';
  return `${status} ${h.json.emoji || '📌'} ${h.json.name} (${h.json.period}) - Streak: ${h.json.streak}`;
}).join('\n');

// Formatar templates
const templatesList = templates.map(t =>
  `• ${t.json.name} (${t.json.category_name || 'Geral'}) - ${t.json.default_goal_value ? t.json.default_goal_value + ' ' + (t.json.default_unit || '') : 'Completar'}`
).join('\n');

// Estado pendente
const pendingState = {
  action: conversation.pending_action,
  data: conversation.pending_data || {},
  awaiting: conversation.awaiting_input
};

const currentHour = new Date().getHours();
const currentPeriod = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';

return {
  json: {
    // Dados da mensagem
    user_message: extractData.text,
    phone: extractData.phone,

    // Dados do usuário
    user_registered: userRegistered,
    user_id: user.user_id || null,
    user_name: user.display_name || 'Visitante',
    is_premium: user.is_premium || false,

    // Contexto de hábitos
    habits_context: habitsList || 'Nenhum hábito cadastrado.',
    habits_count: habits.length,
    habits_raw: habits.map(h => h.json),

    // Templates disponíveis
    templates_context: templatesList,
    templates_raw: templates.map(t => t.json),

    // Histórico e estado
    conversation_history: recentMessages,
    pending_state: pendingState,

    // Contexto temporal
    current_period: currentPeriod,
    current_period_label: currentPeriod === 'morning' ? 'manhã' :
                          currentPeriod === 'afternoon' ? 'tarde' : 'noite'
  }
};
```

#### Node 8: Call OpenAI API (ATUALIZAR)
- **Tipo**: Code
- **Code (COMPLETO - Substituir a chave de API)**:

```javascript
const OPENAI_API_KEY = 'sk-proj-sua-api-key-real-aqui'; // ⚠️ SUBSTITUIR PELA SUA
const ctx = $input.first().json;

if (!OPENAI_API_KEY.startsWith('sk-proj-')) {
  throw new Error('Configure sua OpenAI API Key no Node 8!');
}

// Construir histórico para a IA
const historyMessages = (ctx.conversation_history || []).map(m => ({
  role: m.role,
  content: m.content
}));

const systemPrompt = `Você é o Foquinha 🦊, assistente pessoal de hábitos do app Habitz.

PERSONALIDADE:
- Amigável, empático e motivador
- Conversa naturalmente como um amigo/coach
- Usa emojis com moderação
- Faz perguntas para entender melhor o usuário

CONTEXTO DO USUÁRIO:
- Nome: ${ctx.user_name}
- Cadastrado no app: ${ctx.user_registered ? 'SIM' : 'NÃO (apenas conversa, não pode criar hábitos)'}
- Período atual: ${ctx.current_period_label}
- Hábitos ativos: ${ctx.habits_count}

${ctx.user_registered ? `HÁBITOS DO USUÁRIO:
${ctx.habits_context}` : '(Usuário não cadastrado - não mostrar hábitos)'}

HÁBITOS POPULARES PARA SUGERIR:
${ctx.templates_context}

${ctx.pending_state.action ? `ESTADO PENDENTE:
- Ação aguardando: ${ctx.pending_state.action}
- Dados coletados: ${JSON.stringify(ctx.pending_state.data)}
- Aguardando: ${ctx.pending_state.awaiting}
(Use esses dados para completar a ação quando o usuário fornecer o que falta)` : ''}

SUAS CAPACIDADES:
${ctx.user_registered ? `
1. CONVERSAR - Entender necessidades, dar dicas, motivar
2. LISTAR hábitos do dia
3. MARCAR hábito como concluído
4. CRIAR novo hábito (perguntar nome e período antes)
5. EDITAR hábito existente
6. DESATIVAR hábito
7. RECOMENDAR hábitos baseado na conversa` : `
1. CONVERSAR - Entender necessidades, dar dicas, motivar
2. RECOMENDAR hábitos (mas informar que precisa do app para criar)
(Usuário não cadastrado - apenas conversação)`}

FORMATO DE RESPOSTA:
Sempre retorne um JSON válido:
{
  "response": "Sua mensagem amigável aqui",
  "intent": "conversation|create_habit|complete_habit|edit_habit|deactivate_habit|list_habits",
  "intent_data": { dados se aplicável },
  "new_state": {
    "pending_action": "ação pendente ou null",
    "pending_data": { dados parciais },
    "awaiting_input": "o que está aguardando ou null"
  }
}

REGRAS IMPORTANTES:
1. Se o usuário quer criar hábito mas não disse o período, pergunte!
   - Salve em new_state: pending_action="create_habit", pending_data={name:"..."}, awaiting_input="period"
2. Quando receber a resposta do período, complete a ação
3. Se não cadastrado, converse mas avise que precisa do app para criar hábitos
4. Sempre seja conversacional, não apenas execute comandos
5. Celebre conquistas! Motive quando houver dificuldade

EXEMPLO - Criação em 2 turnos:
Turno 1:
User: "Quero fazer yoga"
Response: {"response": "Yoga é ótimo! 🧘‍♀️ Qual período seria melhor pra você? Manhã, tarde ou noite?", "intent": "conversation", "new_state": {"pending_action": "create_habit", "pending_data": {"name": "Yoga"}, "awaiting_input": "period"}}

Turno 2:
User: "de tarde"
Response: {"response": "Perfeito! Criei o hábito 'Yoga' para suas tardes! 🧘‍♀️ Vamos começar hoje?", "intent": "create_habit", "intent_data": {"name": "Yoga", "period": "afternoon"}, "new_state": {"pending_action": null}}`;

const allMessages = [
  { role: 'system', content: systemPrompt },
  ...historyMessages,
  { role: 'user', content: ctx.user_message }
];

const response = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: {
    model: 'gpt-4o-mini',
    messages: allMessages,
    temperature: 0.8,
    max_tokens: 600,
    response_format: { type: "json_object" }
  },
  json: true
});

const aiResponse = JSON.parse(response.choices[0].message.content);

return {
  json: {
    ...ctx,
    ai_response: aiResponse.response,
    intent: aiResponse.intent,
    intent_data: aiResponse.intent_data || {},
    new_state: aiResponse.new_state || {}
  }
};
```

#### Node 15: Save Conversation State (ATUALIZAR)
- **Tipo**: Postgres
- **Operation**: executeQuery
- **Query**:
```sql
UPDATE public.whatsapp_conversations
SET
  messages = (
    SELECT jsonb_agg(elem) FROM (
      SELECT elem FROM jsonb_array_elements(messages) elem
      UNION ALL
      SELECT $2::jsonb
      UNION ALL
      SELECT $3::jsonb
    ) sub
    ORDER BY (elem->>'timestamp')::timestamptz DESC
    LIMIT 20
  ),
  pending_action = $4,
  pending_data = $5::jsonb,
  awaiting_input = $6,
  last_interaction = NOW(),
  updated_at = NOW()
WHERE phone = $1
RETURNING *;
```
- **Query Replacement**:
```javascript
[
  $json.phone,
  JSON.stringify({ role: 'user', content: $json.user_message, timestamp: new Date().toISOString() }),
  JSON.stringify({ role: 'assistant', content: $json.ai_response, timestamp: new Date().toISOString() }),
  $json.new_state?.pending_action || null,
  JSON.stringify($json.new_state?.pending_data || {}),
  $json.new_state?.awaiting_input || null
]
```

---

## 🧪 Fase 3: Testar

### Teste 1: Usuário Não Cadastrado
**Enviar**: "Oi, quero organizar minha rotina"
**Esperado**: Resposta amigável, não executa ações

### Teste 2: Criar Hábito em 2 Turnos (Usuário Cadastrado)
**Turno 1**: "Quero fazer yoga"
**Esperado**: "Yoga é ótimo! 🧘‍♀️ Qual período seria melhor pra você?"

**Turno 2**: "à tarde"
**Esperado**: "Perfeito! Criei o hábito 'Yoga' para suas tardes!"

### Teste 3: Completar Hábito
**Enviar**: "fiz meditação" (ou nome de um hábito seu)
**Esperado**: Confirmação e celebração

---

## 📚 Recursos

- **Documentação N8N**: https://docs.n8n.io
- **OpenAI API**: https://platform.openai.com/docs/guides/gpt-4o
- **Postgres Docs**: https://www.postgresql.org/docs
- **Plano Completo**: `logical-crunching-cupcake.md`

---

## ⚠️ Checklist Final

- [ ] SQLs executados no Supabase
- [ ] Node 3 criado (Get/Create Conversation)
- [ ] Node 6 atualizado (Get Habit Templates)
- [ ] Node 7 atualizado (Prepare Full Context)
- [ ] Node 8 atualizado (Call OpenAI API) - **API KEY CONFIGURADA**
- [ ] Node 15 atualizado (Save Conversation State)
- [ ] Workflow ativado
- [ ] Webhook configurado no Meta Developer Portal
- [ ] Testes básicos concluídos
