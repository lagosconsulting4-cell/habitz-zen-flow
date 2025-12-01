# Plano: Fluxo N8N WhatsApp - Foquinha (Assistente de Hábitos)

## Resumo
Criar um assistente pessoal conversacional via WhatsApp que entende as necessidades do usuário, recomenda hábitos, e gerencia a rotina de forma natural como um humano.

## Escopo Revisado (v2)

### Personalidade
- **Nome**: Foquinha
- **Tom**: Amigável, empático, motivador
- **Estilo**: Conversa natural como um amigo/coach pessoal

### Capacidades
1. **Conversação livre** - Entender contexto, necessidades, objetivos do usuário
2. **Recomendação de hábitos** - Sugerir hábitos baseados na conversa
3. **Gerenciamento de hábitos** - Criar, editar, completar, desativar
4. **Coaching motivacional** - Celebrar conquistas, encorajar em dificuldades

### Mudança Arquitetural Principal
**ANTES**: IA → Detecta intent → Executa ação direto
**AGORA**: IA → Conversa primeiro → Entende contexto → Só depois executa ação

---

## Decisões Confirmadas

| # | Pergunta | Decisão |
|---|----------|---------|
| 1 | Histórico | C - Completo, resumido para IA |
| 2 | Executar ações | C - Sempre perguntar detalhes |
| 3 | Recomendações | Híbrido - IA + hábitos pré-definidos do Supabase |
| 4 | Onboarding | B - Conversar, mas não criar hábitos |
| 5 | Modelo | B - GPT-4o-mini |

---

## 1. Alterações no Banco de Dados

### 1.1 Adicionar coluna `phone` na tabela `profiles`
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
```

### 1.2 Nova tabela: `whatsapp_conversations` (State Management)
```sql
CREATE TABLE whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  phone TEXT NOT NULL UNIQUE,

  -- Histórico de mensagens (JSONB array)
  messages JSONB DEFAULT '[]',

  -- Estado pendente (para ações multi-turno)
  pending_action TEXT,              -- Ex: "create_habit", "edit_habit"
  pending_data JSONB DEFAULT '{}',  -- Ex: {"name": "Yoga"}
  awaiting_input TEXT,              -- Ex: "period", "confirmation"

  -- Metadata
  last_interaction TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_conv_phone ON whatsapp_conversations(phone);
CREATE INDEX idx_whatsapp_conv_user ON whatsapp_conversations(user_id);
```

### 1.3 Expandir seeds: `habit_templates` (43 templates do app)

A tabela `habit_templates` já existe em `supabase/migrations/0001_phase1_habits.sql`.
Atualmente tem apenas 8 templates, mas o app usa ~43 no `CATEGORY_DATA`.

**Criar arquivo**: `Doc/N8N Foquinha/06_expand_habit_templates.sql`

```sql
-- Expandir habit_templates para incluir todos os 43 templates do app
-- Executar após o seed inicial (0002_seed_habit_catalog.sql)

-- 1. Adicionar categorias que faltam
INSERT INTO public.habit_categories (name, icon_key, color, sort_order)
VALUES
  ('Time & Routine', 'clock', '#e74c3c', 6),
  ('Avoid', 'ban', '#95a5a6', 7)
ON CONFLICT (name) DO NOTHING;

-- 2. Inserir todos os templates do app
WITH cat AS (
  SELECT jsonb_object_agg(name, id) AS mapping
  FROM habit_categories
)
INSERT INTO public.habit_templates (
  category_id, name, slug, icon_key, color,
  default_unit, default_goal_value, default_frequency_type,
  default_days_of_week, default_times_per_week, auto_complete_source
)
SELECT
  (mapping ->> category_name)::uuid, name, slug, icon_key, '#A3E635',
  default_unit::public.habit_unit, default_goal_value,
  default_frequency_type::public.habit_frequency_type,
  default_days_of_week, default_times_per_week::int2,
  auto_complete_source::public.habit_auto_complete_source
FROM cat,
(VALUES
  -- PRODUCTIVITY (10 templates)
  ('Productivity', 'Acordar Cedo', 'wake-early', 'sunrise', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Fazer a Cama', 'make-bed', 'make_bed', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Planejar o Dia', 'plan-day', 'plan', 'minutes', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Revisar Objetivos', 'review-goals', 'review', 'none', NULL, 'times_per_week', NULL::int2[], 1, 'manual'),
  ('Productivity', 'Journaling', 'journaling', 'journal', 'minutes', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Ler Livros', 'read-books', 'book', 'custom', 30, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Meditar', 'meditate', 'meditate', 'minutes', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Estudar', 'study', 'study', 'custom', 1, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Organizar Ambiente', 'organize-space', 'organize', 'minutes', 15, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Lista de Tarefas', 'task-list', 'checklist', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),

  -- FITNESS (14 templates)
  ('Fitness', 'Caminhar ou Correr', 'walk-run', 'run', 'steps', 10000, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Pedalar', 'cycle', 'cycle', 'minutes', 30, 'times_per_week', NULL::int2[], 3, 'manual'),
  ('Fitness', 'Nadar', 'swim', 'swim', 'minutes', 30, 'times_per_week', NULL::int2[], 2, 'manual'),
  ('Fitness', 'Minutos Atenção Plena', 'mindful-min', 'meditate', 'minutes', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Subir Escadas', 'climb-stairs', 'stairs', 'custom', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Anéis de Atividade', 'activity-rings', 'activity_rings', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Horas em Pé', 'stand-hours', 'stand_hours', 'custom', 12, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Minutos de Exercício', 'exercise-min', 'exercise_minutes', 'minutes', 30, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Queimar Calorias', 'burn-calories', 'burn_energy', 'custom', 500, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Alongamento', 'stretching', 'stretch', 'minutes', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Fitness', 'Yoga', 'yoga', 'yoga', 'minutes', 20, 'times_per_week', NULL::int2[], 3, 'manual'),
  ('Fitness', 'Treino de Força', 'strength-training', 'strength', 'minutes', 45, 'times_per_week', NULL::int2[], 3, 'manual'),
  ('Fitness', 'Beber Água', 'drink-water-fitness', 'water', 'custom', 2, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Fitness', 'Dormir 8 Horas', 'sleep-8h', 'sleep', 'custom', 8, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),

  -- NUTRITION (8 templates)
  ('Nutrition', 'Café da Manhã Saudável', 'healthy-breakfast', 'breakfast', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Nutrition', 'Comer Frutas', 'eat-fruits', 'fruits', 'custom', 2, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Nutrition', 'Comer Vegetais', 'eat-vegetables', 'vegetables', 'custom', 3, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Nutrition', 'Beber 2L de Água', 'drink-water-2l', 'water', 'custom', 2, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Nutrition', 'Evitar Açúcar', 'avoid-sugar', 'no_sugar', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Nutrition', 'Preparar Refeições', 'meal-prep', 'meal', 'custom', 3, 'times_per_week', NULL::int2[], 1, 'manual'),
  ('Nutrition', 'Comer Proteína', 'eat-protein', 'protein', 'custom', 3, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Nutrition', 'Tomar Vitaminas', 'take-vitamins', 'vitamins', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),

  -- TIME & ROUTINE (5 templates)
  ('Time & Routine', 'Pomodoro', 'pomodoro', 'focus', 'custom', 4, 'times_per_week', NULL::int2[], 5, 'manual'),
  ('Time & Routine', 'Foco Profundo', 'deep-focus', 'deep_work', 'custom', 2, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Time & Routine', 'Dormir no Horário', 'sleep-on-time', 'bed', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Time & Routine', 'Acordar no Horário', 'wake-on-time', 'alarm', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Time & Routine', 'Tempo Sem Telas', 'screen-free', 'no_screens', 'custom', 1, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),

  -- AVOID (6 templates)
  ('Avoid', 'Não Fumar', 'no-smoking', 'no_smoke', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Avoid', 'Não Comer Doces', 'no-sweets', 'no_sugar', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Avoid', 'Limitar Redes Sociais', 'limit-social', 'social_media', 'minutes', 30, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Avoid', 'Não Pular Refeições', 'no-skip-meals', 'no_skip_meals', 'custom', 3, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Avoid', 'Não Dormir Tarde', 'no-late-sleep', 'no_late_sleep', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Avoid', 'Não Ficar Sedentário', 'no-sedentary', 'active', 'custom', 8, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual')
) AS tpl(category_name, name, slug, icon_key, default_unit, default_goal_value, default_frequency_type, default_days_of_week, default_times_per_week, auto_complete_source)
WHERE (mapping ->> category_name) IS NOT NULL
ON CONFLICT (slug) DO NOTHING;
```

**Total: 43 templates** (vs 8 atuais)

---

## 2. Arquitetura do Fluxo N8N (v2 - Conversacional)

### Visão Geral do Novo Fluxo
```
WhatsApp Trigger
    ↓
Extract Data (Code)
    ↓
┌─────────────────────────────────────────────────────────────┐
│  BLOCO 1: CARREGAR CONTEXTO                                 │
├─────────────────────────────────────────────────────────────┤
│  Get/Create Conversation (Postgres)                         │
│      → Busca histórico + estado pendente                    │
│  Get User by Phone (Postgres)                               │
│      → Busca dados do usuário (ou null se não existe)       │
│  Get User Habits (Postgres) - se user existe                │
│      → Busca hábitos ativos                                 │
│  Get Habit Templates (Postgres)                             │
│      → Busca hábitos pré-definidos para recomendação        │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  BLOCO 2: PREPARAR CONTEXTO PARA IA                         │
├─────────────────────────────────────────────────────────────┤
│  Prepare Full Context (Code)                                │
│      → Monta: histórico, estado pendente, hábitos, user     │
│      → Define se user_registered = true/false               │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  BLOCO 3: CHAMADA DA IA                                     │
├─────────────────────────────────────────────────────────────┤
│  Call OpenAI API (Code) - GPT-4o-mini                       │
│      → Envia: system prompt + histórico + mensagem atual    │
│      → IA retorna: resposta + intent + dados + estado novo  │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  BLOCO 4: PARSE E ROTEAMENTO                                │
├─────────────────────────────────────────────────────────────┤
│  Parse AI Response (Code)                                   │
│      → Extrai: intent, intent_data, new_state, response     │
│                                                             │
│  [IF] Tem ação para executar E user_registered?             │
│      ├─ YES → [SWITCH] Route by Intent                      │
│      │           ├─ complete_habit → Postgres               │
│      │           ├─ create_habit → Postgres                 │
│      │           ├─ edit_habit → Postgres                   │
│      │           ├─ deactivate_habit → Postgres             │
│      │           └─ list_habits → (passthrough)             │
│      │                    ↓                                 │
│      │         Format Success Response (Code)               │
│      │                    ↓                                 │
│      └─ NO → (usa resposta da IA direto)                    │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  BLOCO 5: SALVAR E RESPONDER                                │
├─────────────────────────────────────────────────────────────┤
│  Save Conversation State (Postgres)                         │
│      → Atualiza: messages[], pending_action, pending_data   │
│  Send WhatsApp Response                                     │
│      → Envia resposta final para o usuário                  │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo Visual Simplificado
```
WhatsApp Trigger
    ↓
Extract Data ──→ Get Conversation ──→ Get User ──→ Get Habits ──→ Get Templates
                        ↓                                              ↓
                 Prepare Full Context ←────────────────────────────────┘
                        ↓
                 Call OpenAI (GPT-4o-mini)
                        ↓
                 Parse AI Response
                        ↓
              ┌────────────────────┐
              │ Has Action + User? │
              └────────────────────┘
                   ↓           ↓
                  YES          NO
                   ↓           ↓
            Execute Action     │
                   ↓           │
            Format Response    │
                   ↓           ↓
                   └─────┬─────┘
                         ↓
               Save Conversation
                         ↓
               Send WhatsApp

---

## 3. Nodes do Fluxo (v2 - Detalhado)

### BLOCO 1: TRIGGER E EXTRAÇÃO

#### Node 1: WhatsApp Trigger
- Tipo: `n8n-nodes-base.whatsAppTrigger`
- Updates: `messages`

#### Node 2: Extract Data (Code)
```javascript
const message = $json.messages?.[0] || $json;
const textContent = message.caption?.body || message.text?.body || '';

return {
  json: {
    phone: message.from || '',
    text: textContent,
    messageId: message.id || '',
    timestamp: new Date().toISOString()
  }
};
```

---

### BLOCO 2: CARREGAR CONTEXTO (4 queries paralelas)

#### Node 3: Get/Create Conversation (Postgres)
```sql
INSERT INTO whatsapp_conversations (phone, messages, pending_action, pending_data, awaiting_input)
VALUES ($1, '[]', NULL, '{}', NULL)
ON CONFLICT (phone) DO UPDATE SET last_interaction = NOW()
RETURNING *;
```
- Query Replacement: `={{ [$json.phone] }}`

#### Node 4: Get User by Phone (Postgres)
```sql
SELECT
  p.id as profile_id,
  p.user_id,
  p.display_name,
  p.phone,
  p.is_premium
FROM profiles p
WHERE p.phone = $1
LIMIT 1;
```
- Query Replacement: `={{ [$json.phone] }}`
- Always Output Data: `true`

#### Node 5: Get User Habits (Postgres)
```sql
SELECT
  h.id, h.name, h.emoji, h.category, h.period, h.streak, h.is_active,
  CASE WHEN EXISTS (
    SELECT 1 FROM habit_completions hc
    WHERE hc.habit_id = h.id AND hc.completed_at = CURRENT_DATE
  ) THEN true ELSE false END as completed_today
FROM habits h
WHERE h.user_id = $1::uuid AND h.is_active = true
ORDER BY CASE h.period
  WHEN 'morning' THEN 1 WHEN 'afternoon' THEN 2 WHEN 'evening' THEN 3 END;
```
- Query Replacement: `={{ [$json.user_id || '00000000-0000-0000-0000-000000000000'] }}`
- Always Output Data: `true`

#### Node 6: Get Habit Templates (Postgres)
```sql
SELECT
  t.id, t.name, t.slug, t.icon_key, t.color,
  t.default_unit, t.default_goal_value, t.default_frequency_type,
  c.name as category_name, c.icon_key as category_icon
FROM habit_templates t
LEFT JOIN habit_categories c ON t.category_id = c.id
ORDER BY c.sort_order, t.name
LIMIT 20;
```
- Always Output Data: `true`

---

### BLOCO 3: PREPARAR CONTEXTO

#### Node 7: Prepare Full Context (Code)
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

---

### BLOCO 4: CHAMADA DA IA

#### Node 8: Call OpenAI API (Code)
```javascript
const OPENAI_API_KEY = 'SUA_API_KEY';
const ctx = $input.first().json;

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

---

### BLOCO 5: PARSE E ROTEAMENTO

#### Node 9: Check Should Execute Action (IF)
Condição: `{{ $json.user_registered && $json.intent !== 'conversation' && $json.intent_data && Object.keys($json.intent_data).length > 0 }}`

#### Node 10: Route by Intent (Switch) - Branch YES
- Condição 0: `intent` = `complete_habit`
- Condição 1: `intent` = `create_habit`
- Condição 2: `intent` = `edit_habit`
- Condição 3: `intent` = `deactivate_habit`
- Condição 4: `intent` = `list_habits`
- Fallback: passthrough

#### Nodes 11-14: Ações no Banco (mesmas queries anteriores)
- Complete Habit (Postgres)
- Create Habit (Postgres)
- Edit Habit (Postgres)
- Deactivate Habit (Postgres)

---

### BLOCO 6: SALVAR E RESPONDER

#### Node 15: Save Conversation State (Postgres)
```sql
UPDATE whatsapp_conversations
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
- Query Replacement:
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

#### Node 16: Send WhatsApp Response
- Tipo: `n8n-nodes-base.whatsApp`
- Operation: `send`
- Phone Number ID: (seu ID)
- Recipient: `={{ $json.phone }}`
- Text Body: `={{ $json.ai_response }}`

---

## 4. Exemplos de Fluxo de Conversa

### Exemplo 1: Usuário Cadastrado - Criar Hábito em 2 Turnos
```
User: "Quero começar a fazer yoga"
Foquinha: "Yoga é ótimo para corpo e mente! 🧘‍♀️ Qual período seria melhor pra você? Manhã, tarde ou noite?"
[Estado salvo: pending_action="create_habit", pending_data={name:"Yoga"}, awaiting="period"]

User: "5 da tarde"
Foquinha: "Perfeito! Criei o hábito 'Yoga' para suas tardes! 🧘‍♀️ Já vai começar hoje?"
[Ação executada: CREATE habit, Estado limpo]
```

### Exemplo 2: Usuário Cadastrado - Completar Hábito
```
User: "fiz meditação"
Foquinha: "Mandou bem! 🎉 Marquei 'Meditar' como feito. Seu streak agora é de 15 dias! Continue assim!"
[Ação executada: INSERT habit_completion, UPDATE streak]
```

### Exemplo 3: Usuário NÃO Cadastrado
```
User: "Oi, quero organizar minha rotina"
Foquinha: "Oi! Sou o Foquinha 🦊, assistente do Habitz! Fico feliz que você quer organizar sua rotina!

O que você sente que precisa melhorar? Sono, exercícios, alimentação...?

Ah, vi que seu número ainda não tá vinculado ao app. Quando você criar sua conta no Habitz, a gente conecta e você pode criar hábitos direto por aqui! 📱"
[Apenas conversa, não executa ações]
```

### Exemplo 4: Conversa + Recomendação
```
User: "Tô muito estressado ultimamente"
Foquinha: "Entendo... o estresse pode prejudicar muito a qualidade de vida 😔

Alguns hábitos que podem ajudar:
• 🧘 Meditar 10 minutos
• 🚶 Caminhada ao ar livre
• 📝 Journaling (escrever seus pensamentos)

Quer criar algum desses? Ou me conta mais sobre sua rotina pra eu sugerir algo mais específico!"
[Conversa consultiva, aguarda próxima mensagem]
```

---

## 5. Próximos Passos (Implementação)

### Fase 1: Banco de Dados
1. [ ] Executar `01_add_phone_column.sql` - adicionar coluna `phone` em `profiles`
2. [ ] Executar `whatsapp_conversations` SQL (nova tabela para state management)
3. [ ] Executar `06_expand_habit_templates.sql` - expandir de 8 para 43 templates
4. [ ] Vincular número de teste: `UPDATE profiles SET phone = '5511...' WHERE user_id = '...'`

### Fase 2: N8N - Criar Novo Workflow
1. [ ] Criar workflow "Habitz WhatsApp - Foquinha v2"
2. [ ] Configurar WhatsApp Trigger
3. [ ] Criar Bloco 1: Extract Data + 4 queries paralelas
4. [ ] Criar Bloco 2: Prepare Full Context
5. [ ] Criar Bloco 3: Call OpenAI API (GPT-4o-mini)
6. [ ] Criar Bloco 4: Check Action + Switch + Ações DB
7. [ ] Criar Bloco 5: Save Conversation + Send WhatsApp
8. [ ] Configurar todas as credenciais

### Fase 3: Testes
1. [ ] Testar usuário não cadastrado (só conversa)
2. [ ] Testar criação de hábito em 2 turnos
3. [ ] Testar completar hábito
4. [ ] Testar listar hábitos
5. [ ] Testar conversa normal (sem ação)
6. [ ] Testar estado pendente entre mensagens
7. [ ] Testar recomendações de hábitos

---

## 6. Considerações Técnicas

### Custo Estimado
- **GPT-4o-mini**: ~$0.005 por mensagem (300-500 tokens médio)
- **Com histórico de 10 msgs**: ~$0.01 por mensagem
- **1000 mensagens/mês**: ~$10

### Limitações
- Histórico limitado a 20 mensagens (para não sobrecarregar tokens)
- Só 1 ação pendente por vez
- Não processa imagens/áudios (apenas texto)

### Tabelas Supabase Utilizadas
- `profiles` (phone, user_id) - existente, adicionar coluna phone
- `habits` (todas as colunas) - existente
- `habit_completions` (habit_id, user_id, completed_at) - existente
- `habit_categories` (id, name, icon_key, color) - existente, adicionar 2 categorias
- `habit_templates` (43 templates) - existente, expandir seeds de 8 para 43
- `whatsapp_conversations` (nova) - state management para multi-turno

### Diferenças da v1
| Aspecto | v1 (Anterior) | v2 (Nova) |
|---------|---------------|-----------|
| Modelo | GPT-4o | GPT-4o-mini |
| Histórico | Nenhum | Últimas 20 msgs |
| Estado | Stateless | Stateful (pending_action) |
| Formato IA | TAG [INTENT:...] | JSON estruturado |
| User não cadastrado | Bloqueia | Conversa normalmente |
| Criação hábito | Direto | Pergunta detalhes primeiro |
| Recomendações | Nenhuma | Baseado em templates |
