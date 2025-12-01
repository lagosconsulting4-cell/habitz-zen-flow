# Foquinha v2 - Assistente Pessoal de Hábitos via WhatsApp

> **Status**: Em implementação - Arquitetura completa, aguardando configuração do N8N

## 🦊 O que é Foquinha?

Foquinha é um assistente pessoal conversacional que ajuda usuários do Habitz a gerenciar hábitos de forma natural via WhatsApp. Ele não apenas executa comandos, mas **entende o contexto**, **recomenda hábitos** e **coaching motivacional**.

### Diferenças v1 → v2

| Aspecto | v1 | v2 |
|---------|----|----|
| **Modelo** | GPT-4o | GPT-4o-mini (~50% mais barato) |
| **Histórico** | Nenhum | 20 mensagens (resumidas) |
| **Estado** | Stateless | Stateful (multi-turno) |
| **Formato IA** | Tags [INTENT:...] | JSON estruturado |
| **Usuário não cadastrado** | Bloqueado | Conversa normalmente |
| **Criar hábito** | Direto | Pergunta detalhes primeiro |
| **Recomendações** | Nenhuma | 43 templates pré-definidos |

---

## 🏗️ Arquitetura do Fluxo

```
┌─ WhatsApp Trigger ─┐
│                    ↓
│            Extract Data
│                    ↓
│   ┌────────────────┴────────────────┐
│   │  BLOCO 1: Carregar Contexto    │
│   │ ┌─────────────────────────────┐ │
│   │ │ Get Conversation (new)      │ │
│   │ │ Get User by Phone           │ │
│   │ │ Get User Habits             │ │
│   │ │ Get Templates (updated)     │ │
│   │ └─────────────────────────────┘ │
│   └────────────────┬────────────────┘
│                    ↓
│   ┌────────────────────────────────┐
│   │ BLOCO 2: Preparar Contexto    │
│   │ (Prepare Full Context - new)  │
│   └────────────────┬────────────────┘
│                    ↓
│   ┌────────────────────────────────┐
│   │ BLOCO 3: Chamada da IA        │
│   │ (Call OpenAI - GPT-4o-mini)  │
│   └────────────────┬────────────────┘
│                    ↓
│   ┌────────────────────────────────┐
│   │ BLOCO 4: Parse e Roteamento   │
│   │ ┌─────────────────────────────┐ │
│   │ │ IF user_registered?        │ │
│   │ │ └─ YES → SWITCH by intent  │ │
│   │ │ └─ NO → passthrough        │ │
│   │ └─────────────────────────────┘ │
│   └────────────────┬────────────────┘
│                    ↓
│   ┌────────────────────────────────┐
│   │ BLOCO 5: Salvar e Responder   │
│   │ ┌─────────────────────────────┐ │
│   │ │ Save Conversation State     │ │
│   │ │ Send WhatsApp Response      │ │
│   │ └─────────────────────────────┘ │
│   └────────────────────────────────┘
└─────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

```
Doc/N8N Foquinha/
├── 01_add_phone_column.sql              # Adiciona coluna phone em profiles
├── 02_habitz_whatsapp_workflow.json     # Workflow JSON (v1 corrigido)
├── 03_instrucoes_configuracao.md        # Instruções de setup
├── 04_importar_manualmente.md           # Guia manual passo a passo
├── 05_JSON_FIX_SUMMARY.md              # Resumo de correções
├── 06_expand_habit_templates.sql       # Expande 43 templates
├── 07_whatsapp_conversations_table.sql # State management
├── 08_PROXIMOS_PASSOS.md               # Guia de implementação
└── README.md                            # Este arquivo
```

---

## 🗄️ Mudanças no Banco de Dados

### Novas Colunas
- `profiles.phone` - Número WhatsApp único (índice criado)

### Novas Tabelas
- `whatsapp_conversations` - Histórico e estado de conversas
  - `id` (UUID, PK)
  - `user_id` (FK para profiles, nullable)
  - `phone` (TEXT, UNIQUE) - Identificador principal
  - `messages` (JSONB) - Array com histórico
  - `pending_action` (TEXT) - Ação aguardando
  - `pending_data` (JSONB) - Dados parciais
  - `awaiting_input` (TEXT) - O que está aguardando

### Novas Categorias
- **Time & Routine** (Tempo/Rotina)
- **Avoid** (Evitar)

### Novos Templates
De 8 para **43 templates** pré-definidos:
- **Productivity** (10): Wake Early, Make Bed, Plan Day, Review Goals, Journaling, Read Books, Meditate, Study, Organize Space, Task List
- **Fitness** (14): Walk or Run, Cycle, Swim, Mindful Minutes, Climb Stairs, Activity Rings, Stand Hours, Exercise Minutes, Burn Calories, Stretching, Yoga, Strength Training, Drink Water, Sleep 8h
- **Nutrition** (8): Healthy Breakfast, Eat Fruits, Eat Vegetables, Drink 2L Water, Avoid Sugar, Meal Prep, Eat Protein, Take Vitamins
- **Time & Routine** (5): Pomodoro, Deep Focus, Sleep On Time, Wake On Time, Screen-Free Time
- **Avoid** (6): No Smoking, No Sweets, Limit Social Media, No Skip Meals, No Late Sleep, No Sedentary

---

## 🤖 Lógica da IA

### System Prompt
Foquinha é instruído para:
1. Ser amigável, empático, motivador
2. Conversar naturalmente como um amigo/coach
3. Entender contexto antes de executar ações
4. Perguntar detalhes antes de criar hábitos
5. Celebrar conquistas e motivar em dificuldades

### Intents Suportados
```json
{
  "conversation": "Resposta conversacional sem ação",
  "list_habits": "Listar hábitos do usuário",
  "complete_habit": "Marcar hábito como concluído",
  "create_habit": "Criar novo hábito",
  "edit_habit": "Editar hábito existente",
  "deactivate_habit": "Desativar hábito"
}
```

### Formato de Resposta
```json
{
  "response": "Sua mensagem amigável aqui",
  "intent": "conversation|create_habit|...",
  "intent_data": { "habit_id": "...", "name": "..." },
  "new_state": {
    "pending_action": "create_habit|null",
    "pending_data": { "name": "Yoga" },
    "awaiting_input": "period|null"
  }
}
```

---

## 📊 Fluxo de Conversação Multi-Turno

### Exemplo: Criar Hábito em 2 Turnos

**Turno 1**: Usuário diz "Quero fazer yoga"
```json
{
  "response": "Yoga é ótimo! 🧘‍♀️ Qual período seria melhor? Manhã, tarde ou noite?",
  "intent": "conversation",
  "new_state": {
    "pending_action": "create_habit",
    "pending_data": { "name": "Yoga" },
    "awaiting_input": "period"
  }
}
```
→ **Estado salvo** no banco com `pending_action="create_habit"`

**Turno 2**: Usuário responde "à tarde"
```json
{
  "response": "Perfeito! Criei o hábito 'Yoga' para suas tardes! 🧘‍♀️",
  "intent": "create_habit",
  "intent_data": { "name": "Yoga", "period": "afternoon" },
  "new_state": {
    "pending_action": null,
    "pending_data": {},
    "awaiting_input": null
  }
}
```
→ **Ação executada** no Postgres, estado limpo

---

## 💰 Custo Estimado

### OpenAI GPT-4o-mini
- ~$0.005 por interação (300-500 tokens)
- Com histórico de 10 mensagens: ~$0.01 por mensagem
- 1000 mensagens/mês = ~$10/mês

### Meta WhatsApp Business API
- Primeiras 1000 conversas/mês: **grátis**
- Depois: conforme plano Meta

### Supabase
- Plano Free suporta tráfego inicial
- RLS policies para segurança (opcional)

---

## 🚀 Status de Implementação

### ✅ Concluído
- [x] Plano completo (v2 - conversacional)
- [x] Documentação arquitetura
- [x] SQL files criados (3 arquivos)
- [x] Guia de implementação

### 🔄 Em Progresso
- [ ] Executar SQLs no Supabase
- [ ] Configurar Nodes do N8N
- [ ] Integrar OpenAI API Key
- [ ] Ativar webhook

### 📋 Próximo
- [ ] Testes manuais (múltiplos turnos)
- [ ] Validação com usuários reais
- [ ] Monitoring e logs

---

## 🔗 Recursos Importantes

### Documentação
- **Plano Completo**: [logical-crunching-cupcake.md](../../.claude/plans/logical-crunching-cupcake.md)
- **Próximos Passos**: [08_PROXIMOS_PASSOS.md](08_PROXIMOS_PASSOS.md)
- **Setup Inicial**: [03_instrucoes_configuracao.md](03_instrucoes_configuracao.md)

### APIs
- **OpenAI**: https://platform.openai.com
- **N8N**: https://docs.n8n.io
- **Meta WhatsApp**: https://developers.facebook.com/docs/whatsapp

### Banco
- **Supabase**: https://supabase.com/dashboard
- **Postgres**: https://www.postgresql.org/docs

---

## 📞 Suporte

Para dúvidas sobre a implementação, consulte:
1. **08_PROXIMOS_PASSOS.md** - Guia passo a passo
2. **logical-crunching-cupcake.md** - Documentação completa
3. **N8N Docs** - Documentação de nodes e workflows

---

**Última atualização**: 2025-12-01
**Versão**: 2.0 (Conversacional)
**Responsável**: Claude Code Assistant
