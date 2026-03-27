# Plano de Correção — Foquinha (Chatbot WhatsApp)

> **Origem:** Análise do cancelamento da usuária Isabella Serapião Vidal (vidalisabellaa@gmail.com)
> **Data:** 25/03/2026
> **Workflow:** n8n `agr9lH57zHvusH73` (chatbot_foquinha)
> **Nó principal:** "Call OpenAI API" (Code node com system prompt)

---

## Caso de referência — Timeline Isabella

| Hora (BRT) | Ator | Mensagem | Problema |
|------------|------|----------|----------|
| 23/03 11:34 | USER | "Oi" | — |
| 23/03 11:34 | BOT | "Oi! Tudo ótimo! Como posso te ajudar? 🦭" | Sem onboarding |
| 23/03 11:35 | USER | "Lembrar de correr hoje e quarta as 17h45" | — |
| 23/03 11:35 | BOT | "Criei o habito Correr com lembrete as 17:45! 🏃‍♀️" | Não confirmou dias |
| 23/03 11:35 | USER | "Lembrar de ir a academia seg a sexta as 5h da manhã" | — |
| 23/03 11:35 | BOT | "Você já tem o hábito 'Correr'. Quer que eu edite ele?" | Confundiu academia com correr |
| 23/03 11:36 | USER | "Correr as 5h45 todo sabado" | — |
| 23/03 11:36 | BOT | "Criei o hábito Correr com lembrete as 05:45! 🏃‍♀️" | Criou duplicata |
| 23/03 11:36 | USER | "nao" | — |
| 23/03 11:36 | BOT | "Entendi! Vamos ajustar..." | Interpretou "não" como "quero ajustar" |
| 23/03 11:36 | USER | "seg e quarta - 17h45 e aos sabados as 5h45 da manhã" | — |
| 23/03 11:36 | BOT | "Correr atualizado! Seg/Qua 17:45, Sáb 05:45" | Mentiu (só gravou 1 horário) |
| 23/03 11:37 | USER | "sim" | — |
| 24/03 17:10 | BOT | "Ta me ignorando? 🦭 Se não falar comigo hoje, vou pausar seus lembretes..." | Nudge agressivo |

**Resultado final:**
- Hábito "Correr" com `reminder_time: 05:45`, `days_of_week: [0,2,5]` (Dom/Ter/Sex — ERRADO)
- Hábito "Academia" NUNCA foi criado
- ZERO lembretes enviados
- 1 nudge agressivo recebido

---

## Fase 1 — Onboarding ausente na primeira interação

### Problema
Quando Isabella disse "Oi", o bot respondeu "Oi! Tudo ótimo!" sem se apresentar. A Foquinha não explicou quem é, o que faz, nem como funciona. A usuária ficou sem contexto.

### Causa técnica
O system prompt tem uma seção `PRIMEIRA INTERACAO - APRESENTACAO COMPLETA` (linhas 95-115 do Code node), que inclui:
1. Cumprimentar com empolgação
2. Se apresentar como Foquinha
3. Explicar funcionalidades
4. Convidar a começar

**Porém**, essa seção tem uma condição: `ctx.user_registered && isFirstInteraction && !ctx.needs_onboarding`.

O problema é que `isFirstInteraction` é calculado com base em `gapMinutes === null` (linha 62). Se `gapMinutes` não for null (ex: a conversa já existia no banco), o bot não considera como "primeira interação" — mesmo que a usuária nunca tenha falado com ele antes.

Além disso, existe um onboarding separado (`ctx.needs_onboarding`, linhas 277-366) que é controlado pelo backend. Se esse flag não foi setado corretamente no momento da criação da conversa, nenhum dos dois onboardings é ativado.

### Onde está no código
- **Nó:** Call OpenAI API
- **Linhas:** 60-62 (cálculo de `isFirstInteraction`), 78-81 (`onboardingPhase`), 95-115 (`primeiraInteracaoSection`)
- **Condição:** `isFirstInteraction = (gapMinutes === null)`

### Correção proposta
1. **Tornar o critério de primeira interação mais robusto:** Em vez de depender apenas de `gapMinutes === null`, verificar também se o histórico de mensagens do **usuário** está vazio (0 mensagens com role="user" no `conversation_history`)
2. **Fallback:** Se `conversation_history` tem < 2 mensagens do usuário, tratar como "primeira interação" e mostrar apresentação
3. **No `Prepare Full Context`:** Adicionar campo `user_message_count` contando mensagens com `role: "user"` no histórico

### Como verificar
- Criar uma nova conversa WhatsApp (número não registrado)
- Enviar "Oi"
- Confirmar que a Foquinha se apresenta completamente

### Status
- [x] Concluído (25/03/2026) — fix43_onboarding_fewshot.py
  - Few-shot "oi" agora condicional (onboarding vs genérico)
  - Instrução de PRIORIDADE MAXIMA adicionada ao bloco de onboarding (novo user e Bora user)

---

## Fase 2 — IA confunde atividades diferentes como duplicatas

### Problema
Isabella pediu "Lembrar de ir à academia seg a sexta às 5h" e o bot respondeu "Você já tem o hábito 'Correr'. Quer que eu edite?". Academia e corrida são atividades completamente diferentes.

### Causa técnica
O system prompt instrui (linhas 120-124 e 393-397):
```
- Se o usuario pedir para criar algo que ja existe (mesmo nome ou similar), avise:
  "Voce ja tem o habito 'X'. Quer que eu edite ele?"
- NAO crie duplicatas. Em caso de duvida, pergunte ao usuario.
- Se o nome e parecido mas nao identico (ex: "Treino" vs "Treino de pernas"),
  confirme: "Voce ja tem 'Treino'. Quer criar um separado ou e o mesmo?"
```

O GPT-4o-mini interpretou "academia" como "similar" a "correr" porque ambos são fitness. A instrução é genérica demais — não diferencia atividades por nome, apenas por "categoria similar".

Além disso, o SQL do nó `Create Habit` tem um `WHERE NOT EXISTS` que bloqueia por nome idêntico (case-insensitive), mas esse bloqueio é por nome exato, não por similaridade. O problema é que a IA decidiu por conta própria que eram similares e ofereceu edição em vez de criação.

### Onde está no código
- **Nó:** Call OpenAI API, linhas 120-124 e 393-397
- **Nó:** Create Habit (SQL com `WHERE NOT EXISTS` por nome exato)

### Correção proposta
1. **Refinar a instrução de duplicatas no prompt:**
   ```
   DUPLICATAS - REGRA ESTRITA:
   - Só considere duplicata se o nome for IDENTICO ou quase identico (ex: "Correr" e "Corrida").
   - Atividades diferentes da mesma categoria NÃO são duplicatas (ex: "Correr" ≠ "Academia", "Meditar" ≠ "Yoga").
   - Na dúvida, CRIE um novo hábito. É melhor ter 2 similares do que perder um pedido.
   - Só pergunte se o nome for MUITO parecido (ex: "Treino" e "Treino de pernas").
   ```
2. **Adicionar exemplos de NÃO-duplicatas ao prompt:**
   ```
   EXEMPLOS DE NAO-DUPLICATAS (criar separadamente):
   - "Correr" e "Academia" → atividades diferentes
   - "Leitura" e "Estudo" → propósitos diferentes
   - "Meditar" e "Yoga" → práticas diferentes
   ```

### Como verificar
- Enviar "Quero correr às 7h" → confirmar criação
- Enviar "Quero ir à academia às 18h" → confirmar que cria OUTRO hábito, não sugere editar "Correr"

### Status
- [x] Concluído (25/03/2026) — fix42_prompt_phases_2347.py (Mudança 2)

---

## Fase 3 — Sistema não suporta múltiplos horários por hábito

### Problema
Isabella pediu "seg e quarta às 17:45, sábado às 05:45". O bot confirmou que configurou ambos, mas o banco só gravou `reminder_time: 05:45`. O horário de 17:45 para seg/qua foi perdido. **O bot mentiu.**

### Causa técnica
A tabela `habits` tem um único campo `reminder_time` (tipo TIME). Não existe suporte para horários diferentes em dias diferentes. O banco de dados simplesmente não tem como armazenar essa informação.

O prompt não instrui a IA sobre essa limitação. Pelo contrário, as instruções dizem (linha 175):
```
Nome + horario fornecidos = use "create_habit" IMEDIATAMENTE. NAO peca confirmacao.
```

Quando a IA recebe um pedido com 2 horários, ela gera um `edit_habit` com apenas 1 `reminder_time` (o último), e o sistema aceita sem erro.

### Onde está no código
- **Tabela `habits`:** campo `reminder_time TIME` (único valor)
- **Nó:** Edit Habit → SQL só aceita 1 `$4::time` para `reminder_time`
- **Prompt:** Nenhuma instrução sobre limitação de horário único

### Correção proposta
1. **Adicionar instrução no prompt sobre a limitação:**
   ```
   LIMITACAO - UM HORARIO POR HABITO:
   O sistema suporta apenas 1 horário de lembrete por hábito.
   Se o usuario pedir horarios diferentes em dias diferentes (ex: "seg 17h, sab 5h"):
   - EXPLIQUE: "Como os horários são diferentes, vou criar 2 lembretes separados!"
   - CRIE 2 hábitos com nomes descritivos:
     → "Correr (seg/qua)" com reminder_time=17:00, days_of_week=[1,3]
     → "Correr (sáb)" com reminder_time=05:45, days_of_week=[6]
   - NUNCA diga que configurou 2 horários no mesmo hábito.
   ```
2. **No intent handling:** Quando `edit_habit` ou `create_habit` tem 2 horários no mesmo intent_data, o Code node no n8n deveria detectar e splittar em 2 operações. (Melhoria futura — complexa)

### Como verificar
- Enviar "Correr seg e qua às 17h e sábado às 6h"
- Confirmar que o bot cria 2 hábitos separados com nomes distintos

### Status
- [x] Concluído (25/03/2026) — fix42_prompt_phases_2347.py (Mudança 3)

---

## Fase 4 — days_of_week mapeados com off-by-one

### Problema
Isabella pediu "seg e quarta + sábado". O bot gravou `days_of_week: [0, 2, 5]` que é Dom/Ter/Sex. O correto seria `[1, 3, 6]` (Seg/Qua/Sáb).

### Causa técnica
O prompt instrui (linha 182):
```
Dias especificos ("seg, qua, sex"): frequency_type:"fixed_days", days_of_week com numeros (0=dom..6=sab).
```

A referência está correta (0=dom, 1=seg, ..., 6=sab). Porém, o GPT-4o-mini está errando o mapeamento — possivelmente confundindo com a convenção ISO (1=seg, ..., 7=dom) ou simplesmente errando a conta.

O SQL do Create Habit aceita `$4::smallint[]` sem validar se os valores correspondem aos dias corretos. Não há checagem de sanidade.

### Onde está no código
- **Prompt:** linha 182 (instrução de mapeamento)
- **Nó:** Create Habit → `$4::smallint[]` (sem validação)
- **Nó:** Edit Habit → `$5::smallint[]` (sem validação)

### Correção proposta
1. **Reforçar a referência no prompt com exemplos explícitos:**
   ```
   DIAS DA SEMANA - MAPEAMENTO OBRIGATORIO:
   0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado

   EXEMPLOS OBRIGATORIOS DE REFERENCIA:
   - "segunda" → 1
   - "terça" → 2
   - "quarta" → 3
   - "quinta" → 4
   - "sexta" → 5
   - "sábado" → 6
   - "domingo" → 0
   - "seg a sex" → [1,2,3,4,5]
   - "seg, qua, sex" → [1,3,5]
   - "todo dia" → [0,1,2,3,4,5,6]
   - "dias de semana" → [1,2,3,4,5]
   - "fim de semana" → [0,6]

   NUNCA use 0 para segunda! 0 = DOMINGO.
   ```
2. **Adicionar validação no Code node (pós-AI):** No `Parse Response` ou `Format DB Parameters`, adicionar checagem:
   ```javascript
   // Validate days_of_week range
   if (intent_data.days_of_week) {
     intent_data.days_of_week = intent_data.days_of_week
       .map(d => Math.max(0, Math.min(6, parseInt(d))))
       .filter(d => !isNaN(d));
   }
   ```

### Como verificar
- Enviar "Correr segunda, quarta e sexta"
- Confirmar que `days_of_week` no banco é `[1, 3, 5]` (não `[0, 2, 4]`)

### Status
- [ ] Não iniciado

---

## Fase 5 — Nenhum lembrete enviado

### Problema
Isabella nunca recebeu UM ÚNICO lembrete dos hábitos que criou. A proposta de valor inteira falhou. O `notification_history` mostra ZERO entradas de lembrete para ela — apenas o nudge de 24h.

### Causa técnica
Múltiplos fatores combinados:

1. **Hábito criado DEPOIS do horário:** O hábito foi criado às 11:35 BRT com `reminder_time: 05:45`. Naquele dia (23/03), o horário já tinha passado.

2. **days_of_week errado:** O hábito ficou com `[0, 2, 5]` (Dom/Ter/Sex) em vez de `[1, 3, 6]` (Seg/Qua/Sáb). No dia 24/03 (segunda), o dia 1 NÃO está em `[0, 2, 5]`, então nenhum lembrete foi disparado.

3. **Janela de 24h do WhatsApp:** Mesmo que o lembrete fosse disparado pelo scheduler, a mensagem só pode ser enviada se o usuário interagiu nos últimos 24h. Após 23/03 11:37 BRT, a janela expirou em 24/03 11:37 BRT. Qualquer tentativa de envio depois disso falharia silenciosamente.

4. **Sem push subscription:** A usuária provavelmente não instalou o PWA nem habilitou push notifications, então o caminho de push notifications também não funcionou.

### Onde está no código
- **Scheduler:** nó `Fetch Due Habits` → query SQL verifica `$3::int = ANY(het.days_of_week)` e `effective_time` na janela de 5 min
- **WhatsApp API:** envio via nó `Send WhatsApp Text` → falha silenciosa se janela de 24h expirou
- **Nó `Log Text Notification`:** registra em `notification_history` — MAS só se o envio foi tentado

### Correção proposta
1. **Imediata (Fase 4 resolve parcialmente):** Corrigir days_of_week para que lembretes disparem nos dias corretos
2. **Feedback de falha:** Quando o envio WhatsApp falha (janela expirada), logar o erro em `notification_history` com `context_type = 'whatsapp_send_failed'` para visibilidade
3. **Lembrete de boas-vindas:** Após criar o PRIMEIRO hábito, enviar um lembrete de teste imediatamente:
   ```
   "Pronto! Criei seu lembrete. Esse é um exemplo de como vou te avisar:
   🏃‍♀️ Hora de Correr! Bora?
   Amanhã às 05:45 você recebe de verdade!"
   ```
   Isso dá feedback instantâneo de que o sistema funciona.
4. **Instrução no prompt:** Após criar hábito, mencionar explicitamente QUANDO o primeiro lembrete será enviado:
   ```
   "Criei Correr às 05:45 nos sábados! 🏃‍♀️
   Seu primeiro lembrete chega neste sábado às 05:45."
   ```

### Como verificar
- Criar hábito para amanhã
- Aguardar o horário e confirmar recebimento
- Verificar `notification_history` para a entrada

### Status
- [x] Parcialmente concluído (25/03/2026)
  - Causa raiz (days_of_week) resolvida na Fase 4 (fix42)
  - reminder_enabled=true para journey habits (fix anterior)
  - fix45: Prompt agora informa QUANDO o primeiro lembrete chega
  - Pendente: detecção de falha silenciosa no envio WhatsApp (melhoria futura de observabilidade)

---

## Fase 6 — Nudge agressivo para usuária nova

### Problema
Após 24h sem interação (e ZERO lembretes recebidos), Isabella recebeu:
> "Eiii Isabella Serapião Vidal! Ta me ignorando? 🦭 Se não falar comigo hoje, vou ter que pausar seus lembretes..."

Para uma usuária que usou o bot por 3 minutos e nunca recebeu nenhum valor, esse tom é inadequado e pode ter sido o gatilho do estorno.

### Causa técnica
O nó `Generate Nudge` (linhas do Code node) tem 12 templates de nudge, todos com tom "carente/divertido" estilo Duolingo. Não há diferenciação entre:
- Usuário ativo que parou de responder (nudge adequado)
- Usuário novo que ainda não recebeu valor (nudge inapropriado)

Templates atuais (todos agressivos para novos):
```javascript
const nudges = [
  (n) => `Eiii ${n}! Ta me ignorando? ...`,
  (n) => `${n}, sumiu! ...`,
  (n) => `Foquinha carente aqui ...`,
  (n) => `Psiu, ${n}! Se não me responder hoje, vou dormir...`,
  // ... etc
];
```

O SQL do `Fetch 22h Inactive` não filtra por "maturidade" do usuário — trata igualmente quem tem 30 dias de uso e quem tem 1 dia.

### Onde está no código
- **Nó:** Generate Nudge (Code node) — templates fixos
- **Nó:** Fetch 22h Inactive (SQL) — sem filtro de maturidade
- **Tabela referência:** `profiles.created_at` (disponível para filtrar)

### Correção proposta
1. **Adicionar tier de nudge baseado na maturidade:**
   ```sql
   -- No Fetch 22h Inactive, incluir info de maturidade
   SELECT ...,
     EXTRACT(DAY FROM NOW() - p.created_at) AS account_age_days,
     (SELECT COUNT(*) FROM habit_completions hc WHERE hc.user_id = p.user_id) AS total_completions
   FROM profiles p ...
   ```

2. **No Generate Nudge, diferenciar o tom:**
   ```javascript
   // Usuário novo (< 3 dias, < 3 completions)
   const newUserNudges = [
     (n) => `Oi ${n}! 🦭 Só passando pra ver se está tudo bem. Qualquer dúvida sobre como funciono, é só perguntar!`,
     (n) => `${n}, vi que você criou seus lembretes! Se quiser ajustar alguma coisa, estou aqui 🦭`,
     (n) => `Oi ${n}! Lembrete amigável: pra eu continuar te enviando lembretes pelo WhatsApp, preciso que me mande uma mensagem de vez em quando. Um "oi" já basta! 🦭`,
   ];

   // Usuário ativo (≥ 3 dias, ≥ 3 completions) — manter tom atual
   const activeUserNudges = [ ... nudges atuais ... ];
   ```

3. **Nunca enviar nudge se o usuário não recebeu NENHUM lembrete funcional:**
   ```sql
   -- Adicionar filtro: só nudge se pelo menos 1 lembrete foi entregue
   AND EXISTS (
     SELECT 1 FROM notification_history nh
     WHERE nh.user_id = p.user_id
       AND nh.context_type LIKE 'whatsapp_%'
       AND nh.context_type NOT IN ('whatsapp_24h_nudge', 'whatsapp_reengagement')
   )
   ```

### Como verificar
- Criar conta nova
- Criar 1 hábito
- Esperar 22h sem interagir
- Confirmar que o nudge recebido tem tom gentil (não agressivo)

### Status
- [x] Concluído (25/03/2026) — fix44_nudge_tiers.py
  - SQL: account_age_days + total_completions no SELECT
  - Code: 2 pools de templates (newUserNudges gentil vs activeUserNudges playful)
  - Threshold: < 3 dias OU < 3 completions = novo

---

## Fase 7 — Bot não pede confirmação antes de criar/editar

### Problema
O bot criou e editou hábitos sem confirmar se entendeu corretamente. Quando Isabella pediu "seg e quarta 17h45 e sábado 5h45", o bot deveria ter confirmado a interpretação antes de gravar no banco.

### Causa técnica
O prompt instrui explicitamente para NÃO pedir confirmação (linha 175):
```
Nome + horario fornecidos = use "create_habit" IMEDIATAMENTE. NAO peca confirmacao.
```

Essa instrução foi projetada para velocidade (menos mensagens = menos fricção), mas resulta em erros silenciosos quando a IA interpreta incorretamente.

### Onde está no código
- **Prompt:** linha 175 ("NAO peca confirmacao")
- **Prompt:** linha 399 ("NUNCA peca mais confirmacao" para ações pendentes)

### Correção proposta
1. **Manter criação rápida para casos simples:**
   - "Meditar às 7h" → criar imediatamente (1 horário, sem ambiguidade)
   - "Correr toda segunda" → criar imediatamente (1 dia, sem ambiguidade)

2. **Exigir confirmação para casos complexos:**
   ```
   CONFIRMACAO OBRIGATORIA quando:
   - Múltiplos dias com horários diferentes
   - Pedido menciona mais de 1 atividade na mesma mensagem
   - Edição que muda dias E horário simultaneamente

   Formato da confirmação:
   "Vou criar assim:
   🏃‍♀️ Correr (seg/qua) → lembrete às 17:45
   🏃‍♀️ Correr (sáb) → lembrete às 05:45
   Tá certo?"
   ```

3. **Após edit_habit, mostrar o estado final:**
   ```
   "Hábito atualizado! Ficou assim:
   🏃‍♀️ Correr
   📅 Seg, Qua, Sáb
   ⏰ 05:45
   Tá correto?"
   ```

### Como verificar
- Enviar "Correr seg 17h e sab 6h"
- Confirmar que o bot pede confirmação antes de criar
- Confirmar o formato "Vou criar assim: ..."

### Status
- [x] Concluído (25/03/2026) — fix42_prompt_phases_2347.py (Mudança 5)

---

## Resumo e priorização

| Fase | Problema | Impacto | Esforço | Prioridade |
|------|----------|---------|---------|------------|
| 4 | days_of_week off-by-one | Crítico (lembretes dias errados) | Baixo (prompt) | **P0** |
| 2 | Confunde atividades diferentes | Crítico (perde pedidos) | Baixo (prompt) | **P0** |
| 3 | Não suporta multi-horários (e mente) | Crítico (perde dados) | Médio (prompt + lógica) | **P0** |
| 5 | Nenhum lembrete enviado | Crítico (zero valor) | Médio (depende de 4) | **P0** |
| 1 | Onboarding ausente | Alto (primeira impressão) | Baixo (condição) | **P1** |
| 6 | Nudge agressivo para novos | Alto (causa churn) | Médio (SQL + templates) | **P1** |
| 7 | Sem confirmação em casos complexos | Médio (erros silenciosos) | Baixo (prompt) | **P2** |

### Ordem de execução recomendada
1. **Fase 4** (off-by-one) → fix rápido no prompt, impacto imediato
2. **Fase 2** (duplicatas) → fix no prompt, evita perder pedidos
3. **Fase 3** (multi-horários) → fix no prompt + instruir split
4. **Fase 7** (confirmação) → melhora incremental junto com fase 3
5. **Fase 1** (onboarding) → fix na condição `isFirstInteraction`
6. **Fase 6** (nudge) → SQL + templates diferenciados
7. **Fase 5** (lembretes) → auto-resolve com fases 4+2+3

---

## Referência técnica

| Recurso | Localização |
|---------|-------------|
| Workflow n8n | `agr9lH57zHvusH73` |
| System prompt | Nó "Call OpenAI API" → `parameters.jsCode` |
| Create Habit SQL | Nó "Create Habit" → `parameters.query` |
| Edit Habit SQL | Nó "Edit Habit" → `parameters.query` |
| Nudge templates | Nó "Generate Nudge" → `parameters.jsCode` |
| Nudge query | Nó "Fetch 22h Inactive" → `parameters.query` |
| Onboarding logic | Nó "Call OpenAI API" linhas 60-62, 78-81, 95-115, 277-366 |
| Duplicata check | Nó "Call OpenAI API" linhas 120-124, 393-397 |
| Days mapping | Nó "Call OpenAI API" linha 182 |
| No-confirm rule | Nó "Call OpenAI API" linha 175 |
| n8n API URL | `https://n8n-evo-n8n.harxon.easypanel.host/` |
| n8n API key | Em `claude_desktop_config.json` → `n8n-mcp.env.N8N_API_KEY` |
| Supabase project | `jbucnphyrziaxupdsnbn` |
