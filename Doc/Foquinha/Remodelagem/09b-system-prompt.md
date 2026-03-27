# 09b ALTO: System Prompt do Chatbot Desalinhado

## Problemas Identificados

### P1: Foquinha promete o que nao faz

Ao perguntar "O que mais voce faz?", a Foquinha responde com capacidades que **NAO existem no sistema**:

```
Alem de criar lembretes, eu posso te ajudar a:
- Criar e organizar rotinas diarias, semanais ou pontuais.
- Sugerir planos de treino simples e acessiveis.       ← NAO EXISTE
- Dar dicas de alimentacao equilibrada e economica.     ← NAO EXISTE
- Acompanhar seu progresso e celebrar suas conquistas!
- Organizar suas tarefas e metas do dia a dia.
```

**Impacto:** Usuario pede plano de treino → Foquinha inventa um treino generico via GPT → nao cria habitos, nao faz acompanhamento, nao tem personalizacao. Expectativa criada mas nao cumprida.

### P2: Pouco pratica/objetiva

**Feedback do usuario:** "Ela tem que ser muito pratica e explicita. Lembrete tem que mandar como se fosse uma notificacao de compromisso."

O tom atual e excessivamente motivacional. Lembretes parecem posts de Instagram, nao notificacoes uteis.

### P3: Mensagens longas demais

Respostas de ate 2400 caracteres em uma unica mensagem. No WhatsApp, isso e um "textao" que o usuario nao le.

**Feedback:** "Tem que quebrar a quantidade de texto em mais mensagens, senao fica cansativo pro cara ficar lendo."

### P4: Fluxo de agenda nao e interativo

**Feedback:** "Ela precisa ser mais: 'Aqui esta a sua agenda, o que acha desses horarios?' Depois da validacao, 'Quer que eu crie os lembretes para voce?'"

Atualmente, a Foquinha organiza o dia e cria lembretes sem pedir confirmacao.

## Estado Atual do System Prompt

**Node:** `64c237d1` (Call OpenAI API)
**Modelo:** `gpt-4o-mini`, temperature 0.4, max_tokens 600

O system prompt tem ~4000 chars e inclui:
- Apresentacao da Foquinha
- Lista de capacidades (inclui treino e alimentacao)
- Intents suportados: conversation, create_habit, complete_habit, edit_habit, deactivate_habit, list_habits
- Formato de resposta JSON
- Regras de comportamento
- Few-shot examples
- Regras para primeiro contato e re-engajamento

## Solucao

Atualizar o system prompt com 4 modificacoes e reduzir max_tokens.

## Implementacao

### Arquivo: `App/scripts/fix09_fase2_prompt.py`

### Mudanca 1: Remover capacidades falsas

**Encontrar no prompt:**
```
- Sugerir planos de treino simples e acessiveis.
- Dar dicas de alimentacao equilibrada e economica.
```

**Substituir por:** (remover essas linhas, manter o resto)

**Lista final de capacidades:**
```
- Criar e organizar rotinas diarias, semanais ou pontuais.
- Configurar lembretes automaticos para seus compromissos.
- Acompanhar seu progresso e celebrar suas conquistas!
- Organizar suas tarefas e metas do dia a dia.
```

### Mudanca 2: Adicionar bloco ESTILO DE COMUNICACAO

Inserir apos a secao de apresentacao, antes dos intents:

```
ESTILO DE COMUNICACAO (OBRIGATORIO):
- Seja PRATICA e OBJETIVA. Menos motivacao, mais acao concreta.
- Lembretes e respostas devem soar como conversas de WhatsApp, NAO como emails.
- Use paragrafos CURTOS: maximo 3-4 linhas cada.
- Separe ideias diferentes com uma linha em branco.
- Maximo 400 caracteres por paragrafo.
- Evite "textao" — se a resposta precisa ser longa, quebre em blocos curtos e naturais.
- NAO repita informacoes. Seja concisa.
- Quando o usuario confirmar algo ("ok", "beleza", "sim"), responda curto: 1-2 frases.
```

### Mudanca 3: Adicionar fluxo ORGANIZACAO DE AGENDA

Inserir na secao de funcionalidades:

```
ORGANIZACAO DE AGENDA (FLUXO OBRIGATORIO):
Quando o usuario pedir para organizar o dia, rotina ou agenda:
1. Pergunte quais sao as prioridades e compromissos de forma direta
2. Monte a agenda com horarios claros e objetivos
3. Apresente e pergunte: "O que acha desses horarios? Posso ajustar!"
4. SOMENTE apos o usuario validar ou ajustar: "Quer que eu crie lembretes pra cada item?"
5. Crie habitos/lembretes APENAS com confirmacao EXPLICITA do usuario
NUNCA crie lembretes automaticamente ao organizar uma agenda. Sempre pergunte antes.
```

### Mudanca 4: Reduzir max_tokens

No jsCode do node:
- Chamada principal: `max_tokens: 600` → `max_tokens: 400`
- Fallback minimal: `max_tokens: 300` → `max_tokens: 200`

### Logica do script:

```
1. GET workflow agr9lH57zHvusH73
2. Encontrar node 64c237d1 (Call OpenAI API)
3. No jsCode, localizar a variavel systemPrompt (string grande)
4. Aplicar as 4 substituicoes no texto do prompt
5. Alterar max_tokens no codigo
6. PUT workflow
7. Verificar:
   - prompt NAO contem "treino"
   - prompt NAO contem "alimentacao"
   - prompt contem "PRATICA"
   - prompt contem "Quer que eu crie lembretes"
   - max_tokens == 400
```

## Verificacao

1. **"O que voce faz?"** → resposta NAO deve mencionar treino ou alimentacao
2. **"Organiza meu dia"** → deve perguntar compromissos, apresentar agenda, pedir confirmacao ANTES de criar lembretes
3. **Qualquer resposta** → deve ser mais curta e direta que antes
4. **"ok" / "beleza"** → resposta deve ser 1-2 frases, nao um paragrafo motivacional

## Exemplo: Antes vs Depois

### Antes (resposta a "organiza meu dia"):
```
Claro! Vamos organizar seu dia! 😊 Primeiro, me conta:
quais sao suas prioridades e compromissos para amanha?
Tem algo especifico que voce gostaria de incluir na sua rotina?
```
→ usuario responde → Foquinha cria agenda + lembretes automaticamente

### Depois:
```
Bora! Me conta o que voce tem pra fazer amanha.
```
→ usuario responde → Foquinha apresenta agenda →
```
O que acha desses horarios? Posso ajustar!
```
→ usuario valida →
```
Quer que eu crie lembretes pra cada item?
```
→ usuario confirma → ai cria

## Nodes referenciados

| Node | ID | Funcao |
|------|----|--------|
| Call OpenAI API | `64c237d1-dd50-41f1-bafa-55dd28c1a368` | Chatbot principal |
| Prepare Full Context | `2634e0db-5264-4747-8af7-5c288854438e` | Monta contexto para AI |

## Risco

**BAIXO** — Apenas texto do prompt. Comportamento existente se mantém para todos os intents. As mudancas adicionam restricoes (nao oferecer treino, pedir confirmacao) mas nao removem funcionalidades.
