# 09c ALTO: Mensagens Longas Demais — Quebrar em Multiplas

## Problema

Respostas da Foquinha (ate 2400 caracteres / 600 tokens) sao enviadas como **UMA unica mensagem** no WhatsApp. Isso cria "textoes" que sao cansativos de ler no celular.

## Evidencia

### Screenshot: Rotina de exercicios em mensagem unica
A Foquinha enviou um plano de treino completo com 4 dias de exercicios em uma mensagem so — mais de 1500 caracteres que o usuario precisa scrollar para ler.

### Feedback do usuario:
> "Tem que quebrar a quantidade de texto e a quantidade de palavras em mais mensagens, porque senao fica uma parada muito cansativa pro cara ficar lendo."

## Pesquisa: Best Practices

### WhatsApp API
- **Limite por mensagem:** 4096 caracteres (texto)
- **Rate limit por conversa:** nenhum — pode enviar 2-4 mensagens seguidas sem problema
- **Throughput total:** 80+ msg/s (standard), 1000 msg/s (unlimited tier)
- **Limite diario:** conta por conversas unicas, NAO por mensagens individuais
- **Ordem de entrega:** NAO garantida para envios simultaneos — precisa serializar

**Fontes:**
- [WhatsApp API Rate Limits (Wati)](https://www.wati.io/en/blog/whatsapp-business-api/whatsapp-api-rate-limits/)
- [WhatsApp Messaging Limits (Meta Docs)](https://developers.facebook.com/docs/whatsapp/messaging-limits/)

### Tamanho ideal por mensagem
- **Recomendado:** 500-700 caracteres (~3-5 linhas no celular)
- WhatsApp trunca marketing messages com "Read more" apos ~5 linhas
- Chatbots profissionais quebram em 2-4 mensagens curtas

**Fontes:**
- [WhatsApp Chatbot Best Practices (Landbot)](https://landbot.io/blog/whatsapp-chatbot-best-practices)
- [WhatsApp Chatbot Best Practices (CM.com)](https://www.cm.com/blog/whatsapp-chatbot-best-practices/)

### Padrao n8n
- **Code node** retorna multiplos items → **SplitInBatches** (batch=1) → **Wait** (delay) → **Send** → loop back
- Ja usado no workflow para `Wait (Rate Limit)` no pipeline de lembretes
- [Loop Over Items (n8n Docs)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches/)

### Delay entre mensagens
- **Recomendado:** 1-1.5 segundos
- Simula digitacao natural
- Garante ordem de entrega (WhatsApp nao garante ordem em envios simultaneos)
- Node `n8n-nodes-base.wait` v1.1 — ja existe no workflow

## Arquitetura da Solucao

### Estado atual:
```
[Action nodes] ──┬──> Save Conversation State
                 └──> Send Response (mensagem unica)
```

### Proposta:
```
[Action nodes] ──┬──> Save Conversation State (inalterado)
                 └──> [Split Message] → [Loop Chunks] → [Wait 1s] → [Send Response] → loop back
```

- **Save Conversation State** continua recebendo input direto (salva texto completo)
- **Send Response** agora recebe chunks individuais do loop

## Implementacao Detalhada

### Arquivo: `App/scripts/fix09_fase3_split.py`

### Novo node 1: "Split Message" (Code)

**ID:** `split-message-node`
**Tipo:** `n8n-nodes-base.code` v2, `runOnceForAllItems`

**Estrategia de split:**
1. Se texto <= 700 chars → enviar como esta (1 chunk)
2. Se texto > 700 chars → dividir por `\n\n` (paragrafos)
3. Se paragrafo > 700 chars → dividir por frases (`. `)
4. Nunca cortar no meio de uma frase
5. Mesclar chunks finais minusculos (<80 chars) no anterior

```javascript
const items = $input.all();
const results = [];

for (const item of items) {
  // Resolver response_text (pode vir de Check Create Result ou Format DB Parameters)
  let text;
  try {
    const cr = $('Check Create Result').first();
    if (cr && cr.json?.response_text !== undefined) text = cr.json.response_text;
  } catch(e) {}
  if (!text) text = $('Format DB Parameters').first().json.response_text || '';
  const phone = $('Format DB Parameters').first().json.phone || '';

  const MAX = 700;
  const MIN = 80;

  if (text.length <= MAX) {
    results.push({ json: { phone, chunk: text, chunkIndex: 0, totalChunks: 1 } });
    continue;
  }

  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let buf = '';

  for (const para of paragraphs) {
    if (buf.length + para.length + 2 > MAX && buf.length > 0) {
      chunks.push(buf.trim());
      buf = para;
    } else if (para.length > MAX) {
      if (buf) { chunks.push(buf.trim()); buf = ''; }
      const sents = para.match(/[^.!?]+[.!?]+\s*/g) || [para];
      let sBuf = '';
      for (const s of sents) {
        if (sBuf.length + s.length > MAX && sBuf) {
          chunks.push(sBuf.trim());
          sBuf = s;
        } else { sBuf += s; }
      }
      if (sBuf.trim()) buf = sBuf;
    } else {
      buf += (buf ? '\n\n' : '') + para;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());

  // Mesclar chunk final pequeno
  if (chunks.length > 1 && chunks[chunks.length - 1].length < MIN) {
    const last = chunks.pop();
    chunks[chunks.length - 1] += '\n\n' + last;
  }

  for (let i = 0; i < chunks.length; i++) {
    results.push({ json: { phone, chunk: chunks[i], chunkIndex: i, totalChunks: chunks.length } });
  }
}

return results;
```

### Novo node 2: "Loop Chunks" (SplitInBatches)

**ID:** `loop-chunks-node`
**Tipo:** `n8n-nodes-base.splitInBatches` v3
**Parametros:** `{ "batchSize": 1 }`

### Novo node 3: "Wait Between Messages"

**ID:** `wait-between-msgs-node`
**Tipo:** `n8n-nodes-base.wait` v1.1
**Parametros:** `{ "resume": "timeInterval", "amount": 1, "unit": "seconds" }`

### Modificar "Send Response" (64c0320f)

**textBody:** `={{ $json.chunk }}` (antes: expressao complexa com try/catch)
**recipientPhoneNumber:** `={{ $json.phone }}` (antes: referencia a Format DB Parameters)

### Reconectar fluxo

**Remover 6 conexoes diretas** para Send Response:
- Complete Habit → ~~Send Response~~
- Check Create Result → ~~Send Response~~
- Edit Habit → ~~Send Response~~
- Deactivate Habit → ~~Send Response~~
- List Habits → ~~Send Response~~
- normal-response-passthrough → ~~Send Response~~

**Adicionar 6 conexoes** para Split Message:
- Todos os 6 nodes acima → Split Message

**Cadeia do loop:**
```
Split Message → Loop Chunks (input)
Loop Chunks (output 0: batch) → Wait Between Messages
Wait Between Messages → Send Response
Send Response → Loop Chunks (loop back)
Loop Chunks (output 1: done) → terminal
```

### Posicoes dos nodes (visuais)

Baseado na posicao atual do Send Response no canvas:
- Split Message: mesma linha que Send Response, deslocado -400 x
- Loop Chunks: -300 x
- Wait Between Messages: -200 x
- Send Response: posicao atual mantida

## Consideracoes Tecnicas

### Save Conversation State
Continua recebendo input direto dos action nodes. Salva o texto COMPLETO (nao os chunks). Nao e afetado pela mudanca.

### Check Create Result override
O Split Message ja trata esse caso: tenta `$('Check Create Result')` primeiro, cai em `$('Format DB Parameters')` se nao existir.

### Erro em um chunk
Se Send Response falhar em um chunk, o SplitInBatches para. `retryOnFail: true` no Send Response ajuda (ja configurado).

### Mensagens proativas (lembretes, summaries)
Os 5 pipelines proativos (reminders, morning summary, evening recap, weekly progress, reengagement) usam seus proprios Send nodes. Podem receber o mesmo tratamento no futuro, mas NAO sao afetados por esta mudanca.

## Verificacao

1. **Mensagem curta** (ex: "oi") → deve chegar como 1 mensagem (sem split)
2. **Mensagem media** (ex: criar lembrete) → 1-2 mensagens
3. **Mensagem longa** (ex: "me conta tudo que voce faz" ou "organiza minha rotina de exercicios") → 2-4 mensagens com ~1s de delay entre cada
4. **Save Conversation State** → deve conter o texto COMPLETO (nao chunks)
5. **Ordem** → mensagens devem chegar na ordem correta no WhatsApp

## Nodes referenciados

| Node | ID | Funcao |
|------|----|--------|
| Send Response | `64c0320f-6693-4857-9749-c4514e93bee3` | Envia mensagem WhatsApp |
| Format DB Parameters | `bf96022a-b222-41aa-9430-35f747918f5c` | Formata dados para envio |
| Check Create Result | `check-create-result-node` | Override de response para create_habit |
| Save Conversation State | `dae83d36-fcd5-4a92-a8e7-6c7304949544` | Salva conversa no DB |
| Complete Habit | `644cffaf-*` | Acao: marcar habito |
| Edit Habit | `9e849b7c-*` | Acao: editar habito |
| Deactivate Habit | `ede53208-*` | Acao: desativar habito |
| List Habits | `005b6d98-*` | Acao: listar habitos |
| normal-response-passthrough | `020e9e11-43ca-4f65-b54b-3cadbc7aadbd` | Passthrough sem acao |

## Risco

**MEDIO** — Modifica 6 conexoes existentes e o node Send Response. Testavel facilmente: se falhar, reverter conexoes. O Split Message retorna 1 chunk para mensagens curtas, entao o comportamento default (mensagem unica) se mantem para a maioria dos casos.
