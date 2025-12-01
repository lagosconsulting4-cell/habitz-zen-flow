# Assistente de Desenvolvimento Pessoal - MVP Final
**Documento Técnico Completo - Versão Otimizada**

---

## Visão Geral do Projeto

O assistente de desenvolvimento pessoal é uma solução automatizada que opera via WhatsApp, ajudando usuários a construir hábitos positivos e abandonar vícios através de interações inteligentes, planos personalizados e acompanhamento contínuo. O sistema utiliza n8n como orquestrador principal, Supabase como banco de dados e LangChain Agent para inteligência conversacional.

## Arquitetura Técnica

### Stack Tecnológico

**Orquestração:** n8n (workflow automation)
**Banco de Dados:** Supabase (PostgreSQL)
**Inteligência Artificial:** LangChain Agent + OpenAI GPT-4
**Comunicação:** WhatsApp Business Cloud API
**Hospedagem:** Hostinger
**Pagamentos:** Kiwify

### Credenciais e Configurações

**Supabase:**
- Project URL: `https://llxkhcgmbumqedrdarmr.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseGtoY2dtYnVtcWVkcmRhcm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDk1MjUsImV4cCI6MjA3NDU4NTUyNX0.zojikAFoQ2T1UadMlNQgOw_0j9CfurlwS1jprkG_pFo`

**OpenAI:**
- Utilizar variável de ambiente `OPENAI_API_KEY`

## Estrutura do Banco de Dados (Otimizada)

### Tabela: users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR UNIQUE NOT NULL,  -- Número do WhatsApp
  name VARCHAR,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,  -- Controle de fluxo do onboarding
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  timezone VARCHAR DEFAULT 'America/Sao_Paulo',
  goals JSONB DEFAULT '{}',  -- Hábitos que quer construir (estruturado)
  bad_habits JSONB DEFAULT '{}',  -- Hábitos que quer abandonar (estruturado)
  financial_situation VARCHAR,  -- 'baixa', 'media', 'alta'
  available_times JSONB DEFAULT '{}'  -- Horários disponíveis estruturados
);
```

### Tabela: habits
```sql
CREATE TABLE habits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR NOT NULL,
  type VARCHAR CHECK (type IN ('good', 'bad')),  -- 'good' para construir, 'bad' para abandonar
  frequency VARCHAR,  -- 'daily', '3x_week', 'weekly', etc.
  reminder_times TIME[],  -- Array de horários para lembretes
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

### Tabela: habit_logs
```sql
CREATE TABLE habit_logs (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER REFERENCES habits(id),
  user_id INTEGER REFERENCES users(id),
  completed BOOLEAN DEFAULT FALSE,
  date DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP,
  notes TEXT,  -- Observações do usuário
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: conversations
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  sender VARCHAR CHECK (sender IN ('user', 'assistant')),
  timestamp TIMESTAMP DEFAULT NOW(),
  context JSONB DEFAULT '{}'  -- Contexto específico da mensagem
);
```

## Fluxo Principal do Sistema

### 1. Recepção de Mensagem (WhatsApp Trigger)

O sistema recebe mensagens via webhook do WhatsApp Business Cloud API. Cada mensagem contém:
- Número do remetente (usado como phone)
- Conteúdo da mensagem
- Metadados (tipo, timestamp, etc.)

### 2. Verificação e Contexto do Usuário

**Consulta no Supabase:**
```sql
-- Buscar usuário pelo telefone
SELECT id, phone, name, onboarding_completed, onboarding_step, 
       goals, bad_habits, financial_situation, available_times
FROM users 
WHERE phone = '{{whatsapp_number}}';
```

**Lógica de Roteamento:**
- Usuário novo: Criar registro e iniciar onboarding (step 0)
- Usuário em onboarding: Continuar fluxo baseado no step atual
- Usuário ativo: Processar mensagem normal com contexto completo

### 3. Processamento via LangChain Agent

**Configuração do Agent:**
```javascript
{
  "model": "gpt-4",
  "sessionId": "{{$json.body.messages[0].from}}",
  "memory": "buffer",
  "systemPrompt": "{{$node.SystemPrompt.json.prompt}}",
  "tools": []
}
```

**Carregamento de Contexto:**
```sql
-- Buscar últimas 10 conversas para contexto
SELECT message, sender, timestamp, context
FROM conversations 
WHERE user_id = {{user_id}}
ORDER BY timestamp DESC 
LIMIT 10;
```

## Fluxo de Onboarding Detalhado

### Step 0: Boas-vindas e Criação do Usuário
**Trigger:** Primeira mensagem de usuário não cadastrado
**Ação:**
```sql
INSERT INTO users (phone, name, onboarding_step) 
VALUES ('{{phone}}', '{{profile_name}}', 1);
```
**Mensagem:** "Olá! Eu sou seu assistente de desenvolvimento pessoal. Estou aqui para ser seu parceiro na sua jornada de autodesenvolvimento. Vamos começar?"
**Próximo Step:** 1

### Step 1: Coleta de Hábitos Positivos
**Prompt:** "Para começarmos, me diga: quais são os 3 principais hábitos que você gostaria de construir ou melhorar na sua vida? Pode ser qualquer coisa, desde ler mais até começar a meditar."
**Armazenamento:**
```sql
UPDATE users 
SET goals = '{"habitos": ["exercitar", "ler", "meditar"]}',
    onboarding_step = 2
WHERE phone = '{{phone}}';
```

### Step 2: Coleta de Hábitos Negativos
**Prompt:** "Ótimas escolhas! Agora, existe algum hábito ou vício que você sente que está te atrapalhando e que gostaria de deixar para trás?"
**Armazenamento:**
```sql
UPDATE users 
SET bad_habits = '{"habitos": ["fumar", "procrastinar"]}',
    onboarding_step = 3
WHERE phone = '{{phone}}';
```

### Step 3: Situação Financeira
**Prompt:** "Para eu criar um plano que caiba no seu bolso, como você classificaria sua situação financeira atual? (baixa/média/alta)"
**Armazenamento:**
```sql
UPDATE users 
SET financial_situation = '{{resposta}}',
    onboarding_step = 4
WHERE phone = '{{phone}}';
```

### Step 4: Horários Disponíveis
**Prompt:** "Perfeito! Agora me diga: quais são seus horários mais livres durante a semana? Por exemplo: 'manhã das 6h às 8h, noite das 19h às 21h'"
**Armazenamento:**
```sql
UPDATE users 
SET available_times = '{
  "manha": {"inicio": "06:00", "fim": "08:00"},
  "noite": {"inicio": "19:00", "fim": "21:00"}
}',
    onboarding_step = 5
WHERE phone = '{{phone}}';
```

### Step 5: Geração do Plano e Criação dos Hábitos
**Ação:** LangChain Agent processa todos os dados e cria plano personalizado
**Criação dos Hábitos:**
```sql
-- Para cada hábito identificado
INSERT INTO habits (user_id, name, type, frequency, reminder_times, is_active)
VALUES 
  ({{user_id}}, 'Exercitar-se', 'good', 'daily', ARRAY['07:00'::time], true),
  ({{user_id}}, 'Ler 30 minutos', 'good', 'daily', ARRAY['20:00'::time], true),
  ({{user_id}}, 'Evitar cigarro', 'bad', 'daily', ARRAY['09:00'::time, '15:00'::time], true);
```

**Finalização:**
```sql
UPDATE users 
SET onboarding_completed = true,
    onboarding_step = 6
WHERE phone = '{{phone}}';
```

## System Prompts por Contexto

### Prompt Base (Todos os Contextos)
```
Você é um assistente de desenvolvimento pessoal amigável, motivador e proativo. Seu tom é leve, descontraído e encorajador.

DADOS DO USUÁRIO:
- Nome: {{$node.UserData.json.name}}
- Situação Financeira: {{$node.UserData.json.financial_situation}}
- Horários Disponíveis: {{$node.UserData.json.available_times}}
- Hábitos a Construir: {{$node.UserData.json.goals}}
- Hábitos a Abandonar: {{$node.UserData.json.bad_habits}}

HISTÓRICO RECENTE:
{{$node.ConversationHistory.json.messages}}

INSTRUÇÕES ESPECÍFICAS:
[Varia conforme o contexto]
```

### Prompt para Onboarding
```
CONTEXTO: Usuário está no onboarding (step {{$node.UserData.json.onboarding_step}}).

OBJETIVO: Coletar informações para criar plano personalizado.

DIRETRIZES:
- Faça UMA pergunta por vez
- Seja empático e encorajador  
- Adapte perguntas baseado nas respostas anteriores
- Mantenha tom conversacional

PRÓXIMA AÇÃO ESPERADA:
[Específica para cada step]
```

### Prompt para Usuário Ativo
```
CONTEXTO: Usuário com plano ativo, interação cotidiana.

HÁBITOS ATIVOS:
{{$node.ActiveHabits.json.habits}}

PROGRESSO DE HOJE:
{{$node.TodayProgress.json.logs}}

DIRETRIZES:
- Responda contextualmente à mensagem
- Se confirmação de tarefa: celebre e registre
- Se pedido de ajuda: ofereça suporte específico
- Se reorganização: seja flexível
- Sempre mantenha tom motivador
```

## Lógica de Interação Diária

### Sistema de Lembretes Inteligente
**Implementação:** Cron job que roda a cada 30 minutos
**Query para Lembretes:**
```sql
SELECT h.id, h.name, h.reminder_times, u.phone, u.name as user_name
FROM habits h
JOIN users u ON h.user_id = u.id
WHERE h.is_active = true
  AND u.onboarding_completed = true
  AND CURRENT_TIME::time = ANY(h.reminder_times)
  AND NOT EXISTS (
    SELECT 1 FROM habit_logs hl 
    WHERE hl.habit_id = h.id 
      AND hl.date = CURRENT_DATE 
      AND hl.completed = true
  );
```

**Mensagem de Lembrete Personalizada:**
"Oi {{user_name}}! Hora do seu {{habit_name}}! 💪 Lembre-se: cada pequeno passo te aproxima do seu objetivo. Vamos lá!"

### Processamento de Confirmações
**Triggers:** Mensagens como "feito", "concluído", "✅", "done"
**Lógica:**
1. Identificar último hábito pendente do dia
2. Registrar conclusão:
```sql
INSERT INTO habit_logs (habit_id, user_id, completed, completed_at, date)
VALUES ({{habit_id}}, {{user_id}}, true, NOW(), CURRENT_DATE)
ON CONFLICT (habit_id, user_id, date) 
DO UPDATE SET completed = true, completed_at = NOW();
```
3. Enviar mensagem de celebração contextual

### Registro de Conversas
**Todas as mensagens são registradas:**
```sql
-- Mensagem do usuário
INSERT INTO conversations (user_id, message, sender, context)
VALUES ({{user_id}}, '{{user_message}}', 'user', '{"habit_context": "{{current_habit}}"}');

-- Resposta do assistente
INSERT INTO conversations (user_id, message, sender, context)
VALUES ({{user_id}}, '{{assistant_response}}', 'assistant', '{"action": "{{action_type}}"}');
```

## Relatórios de Progresso

### Relatório Semanal (Domingos às 19h)
**Query de Dados:**
```sql
SELECT 
  h.name,
  COUNT(CASE WHEN hl.completed = true THEN 1 END) as completed_count,
  COUNT(*) as total_expected,
  ROUND(COUNT(CASE WHEN hl.completed = true THEN 1 END) * 100.0 / COUNT(*), 1) as completion_rate
FROM habits h
LEFT JOIN habit_logs hl ON h.id = hl.habit_id 
  AND hl.date >= CURRENT_DATE - INTERVAL '7 days'
WHERE h.user_id = {{user_id}} AND h.is_active = true
GROUP BY h.id, h.name;
```

**Template de Mensagem:**
```
✨ **Seu Relatório Semanal** ✨

Olá {{name}}! Aqui está seu progresso da semana:

{{#each habits}}
{{icon}} **{{name}}:** {{completion_rate}}% ({{completed_count}}/{{total_expected}})
{{/each}}

🎉 **Destaque:** {{best_habit}} foi seu maior sucesso!

{{motivational_message_based_on_performance}}

Qual será nosso foco para a próxima semana?
```

### Relatório Mensal
**Funcionalidades Adicionais:**
- Análise de tendências (melhorando/piorando)
- Identificação de padrões (dias da semana com melhor performance)
- Sugestões de ajustes no plano

## Configuração no n8n

### Workflow Principal
```
WhatsApp Trigger → 
Load User Data (Supabase) → 
Load Conversation History (Supabase) → 
Route by User Status (Switch) → 
  ├─ New User: Create & Start Onboarding
  ├─ Onboarding: Continue Steps  
  └─ Active User: Process Message
Process with LangChain Agent → 
Save Conversation (Supabase) → 
Update User Data (Supabase) → 
Send Response (WhatsApp)
```

### Workflow de Lembretes (Separado)
```
Cron Trigger (30min) → 
Get Pending Reminders (Supabase) → 
For Each User (Loop) → 
Send Reminder (WhatsApp) → 
Log Reminder Sent (Supabase)
```

### Workflow de Relatórios (Separado)
```
Cron Trigger (Weekly/Monthly) → 
Get Users for Reports (Supabase) → 
Generate Report Data (Supabase) → 
Process with LangChain (Report Generation) → 
Send Report (WhatsApp)
```

## Vantagens da Estrutura Otimizada

### **Rastreamento Superior**
- **`habit_logs`** permite análise detalhada de progresso
- **`conversations`** mantém contexto completo de interações
- **`notes`** em logs permite feedback qualitativo do usuário

### **Flexibilidade de Horários**
- **`reminder_times`** como array permite múltiplos lembretes
- **`frequency`** suporta hábitos não-diários
- **`available_times`** como JSONB permite estruturas complexas

### **Controle de Estado Robusto**
- **`onboarding_step`** + **`onboarding_completed`** para controle preciso
- **`is_active`** permite pausar/reativar hábitos
- **`context`** em conversas para ações específicas

### **Escalabilidade**
- Estrutura normalizada suporta crescimento
- Índices apropriados para performance
- Separação clara de responsabilidades

## Considerações de Implementação

### Performance
- Criar índices em campos frequentemente consultados:
```sql
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_habits_user_active ON habits(user_id, is_active);
CREATE INDEX idx_habit_logs_date ON habit_logs(habit_id, date);
CREATE INDEX idx_conversations_user_timestamp ON conversations(user_id, timestamp);
```

### Backup e Segurança
- Backup automático do Supabase
- Logs de auditoria para mudanças críticas
- Validação de entrada em todos os endpoints

---

**Autor:** Manus AI  
**Data:** 28 de setembro de 2025  
**Versão:** 2.0 - Final Otimizada
