# Como Importar o Workflow Manualmente no N8N

Se o import via JSON não funcionou, siga este guia para criar o workflow passo a passo.

---

## Método 1: Usar o arquivo JSON (Alternativa)

Se o erro é `propertyValues[itemName] is not iterable`, tente:

1. Abra o arquivo `02_habitz_whatsapp_workflow.json` em um editor de texto
2. Copie **TODO o conteúdo**
3. No N8N: **Menu > Import from File/Clipboard**
4. Cole o JSON

Se ainda não funcionar, use o **Método 2** (criar manualmente).

---

## Método 2: Criar Manualmente (Recomendado)

### Passo 1: Criar o Webhook Trigger

1. Novo Workflow
2. Clique em "Add first node"
3. Procure por **WhatsApp Trigger**
4. Configure:
   - **Credentials**: Selecione sua credencial WhatsApp (ou crie uma nova)
   - **Updates**: Marque "messages"
5. Salve o node

### Passo 2: Adicionar Extract Data

1. Clique na seta de conexão do WhatsApp Trigger
2. Procure por **Code** (n8n-nodes-base.code)
3. Nomeie: "Extract Data"
4. Cole este código:

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

### Passo 3: Get User by Phone (Postgres)

1. Conecte Extract Data a um novo node **Postgres**
2. Configure:
   - **Credentials**: Sua credencial Supabase/Postgres
   - **Operation**: executeQuery
   - **Query**:
```sql
SELECT p.id as profile_id, p.user_id, p.display_name, p.phone, p.is_premium
FROM profiles p
WHERE p.phone = $1
LIMIT 1;
```
   - **Query Replacement**: `={{ [$json.phone] }}`
   - **Marque**: "Always Output Data"

### Passo 4: Check User Exists (IF)

1. Conecte ao node **IF**
2. Configure:
   - **Condition**: `$json.user_id` is not empty

### Passo 5: Two Branches

#### Branch 1 (YES - User Exists):
1. Conecte a **Get User Habits** (Postgres)
2. Query:
```sql
SELECT h.id, h.name, h.emoji, h.category, h.period, h.streak, h.is_active,
  CASE WHEN EXISTS (
    SELECT 1 FROM habit_completions hc
    WHERE hc.habit_id = h.id AND hc.completed_at = CURRENT_DATE
  ) THEN true ELSE false END as completed_today
FROM habits h
WHERE h.user_id = $1::uuid AND h.is_active = true
ORDER BY CASE h.period
  WHEN 'morning' THEN 1 WHEN 'afternoon' THEN 2 WHEN 'evening' THEN 3 END;
```
   - Query Replacement: `={{ [$items('Get User by Phone')[0].json.user_id] }}`

3. Depois conecte a **Prepare Context** (Code):
```javascript
const user = $items('Get User by Phone')[0].json;
const habits = $items('Get User Habits');
const message = $items('Extract Data')[0].json;

const habitsList = habits.map(h => {
  const status = h.json.completed_today ? '✅' : '⬜';
  const emoji = h.json.emoji || '📌';
  const periodLabel = h.json.period === 'morning' ? 'manhã' :
                      h.json.period === 'afternoon' ? 'tarde' : 'noite';
  return `${status} ${emoji} ${h.json.name} (${periodLabel}) - Streak: ${h.json.streak}`;
}).join('\n');

const currentHour = new Date().getHours();
const currentPeriod = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';

return {
  json: {
    user_message: message.text,
    user_id: user.user_id,
    user_name: user.display_name || 'Usuário',
    phone: message.phone,
    habits_context: habitsList || 'Nenhum hábito cadastrado.',
    habits_count: habits.length,
    current_period: currentPeriod,
    habits_raw: habits.map(h => h.json)
  }
};
```

4. Depois **Call OpenAI API** (Code):
```javascript
const OPENAI_API_KEY = 'sua-api-key-aqui';
if (!OPENAI_API_KEY.startsWith('sk-')) {
  throw new Error('Configure sua OpenAI API Key');
}
const context = $input.first().json;
const systemPrompt = `Você é Foquinha, assistente de hábitos do Habitz. Faça o seguinte:

HÁBITOS DO USUÁRIO:
${context.habits_context}

SEMPRE responda com uma TAG no inicio:
[INTENT:ação:dados_json]

AÇÕES DISPONÍVEIS:
- [INTENT:list_habits] - Listar hábitos
- [INTENT:complete_habit:{"habit_id":"uuid"}] - Marcar concluído
- [INTENT:create_habit:{"name":"nome","period":"morning|afternoon|evening"}] - Criar
- [INTENT:edit_habit:{"habit_id":"uuid","name":"nome","period":"period"}] - Editar
- [INTENT:deactivate_habit:{"habit_id":"uuid"}] - Desativar
- [INTENT:normal] - Resposta normal`;

const response = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: context.user_message }
    ],
    temperature: 0.7,
    max_tokens: 500
  },
  json: true
});

return {
  json: {
    response_text: response.choices[0].message.content,
    ...context
  }
};
```

5. Depois **Parse Response** (Code):
```javascript
const data = $json;
const responseText = data.response_text || '';
const intentRegex = /^\[INTENT:(\w+)(?::(\{.*?\}))?]/;
const match = responseText.match(intentRegex);

let intent = 'normal';
let intentData = {};
let cleanResponse = responseText;

if (match) {
  intent = match[1];
  if (match[2]) {
    try { intentData = JSON.parse(match[2]); } catch (e) {}
  }
  cleanResponse = responseText.replace(intentRegex, '').trim();
}

return {
  json: {
    intent, intent_data: intentData, response_text: cleanResponse,
    user_id: data.user_id, phone: data.phone, habits_raw: data.habits_raw
  }
};
```

6. Depois **Route by Intent** (Switch):
   - Condição 0: `intent` = `complete_habit`
   - Condição 1: `intent` = `create_habit`
   - Condição 2: `intent` = `edit_habit`
   - Condição 3: `intent` = `deactivate_habit`
   - Condição 4: `intent` = `list_habits`
   - Fallback: `normal`

7. Para cada rota, crie os nodes SQL correspondentes (veja o JSON para os comandos SQL)

#### Branch 2 (NO - User Not Found):
1. Conecte a **User Not Found** (Code):
```javascript
return {
  json: {
    phone: $items('Extract Data')[0].json.phone,
    response_text: 'Seu número não está vinculado. Entre em contato com o suporte.',
    intent: 'error'
  }
};
```

### Passo 6: Merge e Send

1. Crie um **Merge** node que combine todos os resultados
2. Conecte a **Send WhatsApp** (n8n-nodes-base.whatsApp)
3. Configure:
   - **Phone Number ID**: Seu ID
   - **Recipient**: `{{ $json.phone }}`
   - **Text**: `{{ $json.response_text }}`

---

## Configurações Necessárias

Em CADA node **Postgres**, configure:
- Host: `seu-projeto.supabase.co`
- Database: `postgres`
- User: `postgres`
- Password: Sua senha
- Port: `5432`
- SSL: `Require`

Em **Call OpenAI API**, substitua:
- `sua-api-key-aqui` → Sua chave OpenAI real

Em **Send WhatsApp**:
- `seu-projeto` → Seu número ID do WhatsApp
- Configure credenciais WhatsApp Business API

---

## Ativar e Testar

1. Clique em **Ativar** (canto superior direito)
2. Copie a URL do webhook do WhatsApp Trigger
3. Configure no Meta Developer Portal
4. Envie uma mensagem de WhatsApp para testar

