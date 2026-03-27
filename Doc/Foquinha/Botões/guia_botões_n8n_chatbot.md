# Botões interativos do WhatsApp no n8n: guia técnico completo

**O nó nativo do WhatsApp no n8n não suporta envio de mensagens interativas (botões e listas).** Essa é a descoberta central desta pesquisa — confirmada pelo código-fonte do n8n, documentação oficial e dezenas de relatos na comunidade. O código em `GenericFunctions.ts` revela que até a operação "Send and Wait for Response" renderiza botões como URLs em texto plano (`type: 'text'`), nunca como `type: 'interactive'`. A solução comprovada e adotada pela comunidade é usar o **nó HTTP Request** para enviar payloads JSON diretamente à WhatsApp Cloud API da Meta. Este guia detalha exatamente como implementar essa solução, desde a estrutura dos payloads até a arquitetura completa de um chatbot com botões.

## Estrutura dos payloads JSON para mensagens interativas

Toda mensagem interativa é enviada via `POST` ao endpoint da Graph API da Meta:

```
POST https://graph.facebook.com/v25.0/<PHONE_NUMBER_ID>/messages
Headers: Content-Type: application/json | Authorization: Bearer <ACCESS_TOKEN>
```

### Reply Buttons (botões de resposta rápida)

Os reply buttons permitem até **3 botões** clicáveis numa única mensagem. O campo `interactive.type` deve ser `"button"`, e cada botão requer um `id` único (até **256 caracteres**) e um `title` (até **20 caracteres**). O corpo da mensagem aceita até **1.024 caracteres**, o footer até **60**, e o header (opcional) suporta os tipos `text`, `image`, `video` e `document`.

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+5511999999999",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "header": {
      "type": "text",
      "text": "Atendimento Rápido"
    },
    "body": {
      "text": "Olá! Como posso te ajudar hoje? Escolha uma opção abaixo:"
    },
    "footer": {
      "text": "Empresa XYZ © 2026"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": { "id": "btn_suporte", "title": "Suporte Técnico" }
        },
        {
          "type": "reply",
          "reply": { "id": "btn_vendas", "title": "Falar com Vendas" }
        },
        {
          "type": "reply",
          "reply": { "id": "btn_rastrear", "title": "Rastrear Pedido" }
        }
      ]
    }
  }
}
```

### List Messages (listas com seções e opções)

As list messages comportam até **10 seções** e no máximo **10 linhas no total** (somando todas as seções). Diferente dos reply buttons, o header aceita apenas o tipo `text`, e o corpo suporta até **4.096 caracteres**. O botão que abre a lista (`action.button`) aceita até **20 caracteres**.

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+5511999999999",
  "type": "interactive",
  "interactive": {
    "type": "list",
    "header": { "type": "text", "text": "Nossos Serviços" },
    "body": { "text": "Selecione o serviço que deseja consultar:" },
    "footer": { "text": "Empresa XYZ" },
    "action": {
      "button": "Ver Opções",
      "sections": [
        {
          "title": "Planos Internet",
          "rows": [
            { "id": "plano_100mb", "title": "Plano 100 Mbps", "description": "R$ 79,90/mês - Fibra óptica" },
            { "id": "plano_300mb", "title": "Plano 300 Mbps", "description": "R$ 109,90/mês - Fibra óptica" },
            { "id": "plano_500mb", "title": "Plano 500 Mbps", "description": "R$ 149,90/mês - Fibra óptica" }
          ]
        },
        {
          "title": "Suporte",
          "rows": [
            { "id": "suporte_tecnico", "title": "Suporte Técnico", "description": "Problemas de conexão" },
            { "id": "suporte_financeiro", "title": "Financeiro", "description": "Boletos e pagamentos" }
          ]
        }
      ]
    }
  }
}
```

### Tabela de limites técnicos consolidada

| Elemento | Reply Buttons | List Messages |
|----------|:------------:|:-------------:|
| Máx. botões/linhas | **3 botões** | **10 linhas** (total entre seções) |
| Máx. seções | N/A | **10 seções** |
| Título do botão/linha | **20 caracteres** | **24 caracteres** |
| ID do botão/linha | **256 caracteres** | **200 caracteres** |
| Corpo (body) | **1.024 caracteres** | **4.096 caracteres** |
| Footer | **60 caracteres** | **60 caracteres** |
| Header texto | **60 caracteres** | **60 caracteres** |
| Header mídia | imagem, vídeo, documento | **não suportado** |
| Descrição da linha | N/A | **72 caracteres** |

## Pré-requisitos técnicos e configuração da conta Meta

O acesso à WhatsApp Cloud API exige uma cadeia de configurações no ecossistema Meta. O número de telefone **não pode estar registrado** no WhatsApp pessoal ou WhatsApp Business App (exceto com coexistência habilitada, disponível desde 2025). A verificação em duas etapas (2FA) é **obrigatória**.

**Para criar um token de acesso permanente** — essencial em produção, já que o token temporário expira em menos de 24 horas — siga este caminho: acesse **Business Settings → Users → System Users**, crie um System User com papel de Admin, atribua os assets (app com "Manage app" e conta WhatsApp com "Manage WhatsApp Business Accounts"), gere o token com expiração "Never" e selecione as três permissões obrigatórias: `whatsapp_business_messaging`, `whatsapp_business_management` e `whatsapp_business_manage_events`. A versão atual da API é a **v25.0**.

O webhook deve ser configurado em um endpoint HTTPS acessível publicamente, respondendo HTTP 200 ao challenge de verificação (GET) da Meta. A inscrição no campo `messages` é necessária para receber notificações de respostas interativas. O app deve estar em **modo Live** — alguns webhooks não disparam em modo Dev.

## Implementação no n8n com o nó HTTP Request

### Por que o nó nativo não funciona para botões

O código-fonte do n8n (arquivo `GenericFunctions.ts` no repositório GitHub) mostra que a função `createMessage` monta o payload sempre com `type: 'text'`, transformando botões em links de texto formatados com markdown. Múltiplos posts na comunidade n8n confirmam isso — em julho 2025, a resposta aceita no fórum foi direta: *"n8n does not necessarily support that out of the box, but you can use HTTP Request node for it."* Em outubro 2025, outro post explicitou: *"The 'Send & Wait for Response' node only supports plain text + links, not interactive buttons."*

### Configuração do nó HTTP Request para enviar botões

Configure o nó HTTP Request assim:

- **Method:** POST
- **URL:** `https://graph.facebook.com/v25.0/{{ $json.phone_number_id }}/messages`
- **Authentication:** Predefined Credential Type → WhatsApp Business Cloud (reutiliza credenciais existentes)
- **Body Content Type:** JSON
- **Body:** Cole o payload JSON dos reply buttons ou list messages (exemplos na seção anterior), usando expressões n8n para valores dinâmicos como `{{ $json.recipient_phone }}` no campo `to`

A grande vantagem dessa abordagem é que você pode reutilizar as credenciais já configuradas para o nó nativo do WhatsApp, sem necessidade de gerenciar headers de autorização manualmente.

### Recebendo e roteando respostas dos botões

O **WhatsApp Trigger** do n8n recebe todas as mensagens de entrada, incluindo cliques em botões. Quando um usuário clica em um reply button, o payload chega com esta estrutura:

```json
{
  "type": "interactive",
  "interactive": {
    "type": "button_reply",
    "button_reply": {
      "id": "btn_suporte",
      "title": "Suporte Técnico"
    }
  }
}
```

Para list replies, o campo é `list_reply` com `id`, `title` e `description`. O roteamento no workflow usa um **nó Switch** que inspeciona `{{ $json.messages[0].interactive.button_reply.id }}` e direciona para branches diferentes conforme o botão clicado. Adicione sempre um **nó IF** logo após o trigger para filtrar eventos que não são mensagens (status notifications, read receipts).

**Limitação crítica:** cada clique de botão dispara uma **nova execução** do workflow — não é uma continuação do fluxo anterior. Isso significa que o padrão "enviar botão → esperar clique → continuar" dentro de uma única execução **não funciona** no n8n.

## Arquitetura completa de chatbot com botões interativos

### O ciclo de conversação no n8n

O modelo funcional segue execuções independentes conectadas por estado externo:

**Execução 1:** Usuário envia "Oi" → Trigger → Switch (detecta texto) → HTTP Request envia reply buttons com menu principal → Salva estado `menu_principal` no Redis/PostgreSQL keyed por telefone do usuário.

**Execução 2:** Usuário clica "Suporte Técnico" → Novo trigger → Switch (detecta `interactive.button_reply.id = btn_suporte`) → Consulta estado no banco → HTTP Request envia list message com categorias de suporte → Atualiza estado para `aguardando_categoria`.

**Execução 3:** Usuário seleciona categoria → Novo trigger → Switch (detecta `interactive.list_reply.id`) → Consulta estado → Roteia para branch de atendimento → Conecta com agente de IA ou resposta estática.

Para **gerenciamento de estado**, a abordagem mais robusta usa **Redis** para cache de sessão ativa (com TTL de 24 horas, alinhado à janela do WhatsApp) e **PostgreSQL** para histórico persistente de conversas. No início de cada execução, um nó consulta o estado do usuário pelo número de telefone; ao final, atualiza o estado.

### Integração com agente de IA

A arquitetura híbrida mais eficiente combina navegação por botões com fallback para IA:

- **Camada 1 (botões):** Menu principal, categorias, confirmações — respostas instantâneas, sem custo de API de IA
- **Camada 2 (IA):** Perguntas complexas, texto livre, consultas que fogem do fluxo pré-definido → Nó AI Agent do n8n (usa LangChain internamente) conectado a GPT-4o, Claude ou Gemini
- **Camada 3 (RAG):** Perguntas sobre produtos, políticas, documentação → AI Agent com Vector Store Tool consultando base de conhecimento em Qdrant, Pinecone ou Supabase

O **session ID** do nó de memória deve ser o número de telefone do usuário para isolamento por conversa. O **Buffer Window Memory** padrão armazena as últimas 10 mensagens por sessão.

### Padrão de debouncing para produção

Usuários frequentemente enviam múltiplas mensagens em sequência rápida. Sem debouncing, cada mensagem dispara uma resposta separada da IA. A solução comprovada: ao receber uma mensagem, armazene-a no Redis com timestamp, adicione um **nó Wait de 5-7 segundos**, depois verifique se a mensagem mais recente no Redis corresponde à atual. Se sim, processe todas as mensagens acumuladas como uma única entrada. Se não, aborte a execução (uma execução mais recente tratará o conjunto).

## Limites, políticas de mensagens e diferenças entre templates e sessão

### A janela de 24 horas

Mensagens interativas (botões e listas) **só podem ser enviadas dentro da janela de 24 horas** após a última mensagem do usuário. Fora dessa janela, apenas **message templates** pré-aprovados pela Meta podem ser enviados. Cada resposta do usuário **reinicia** o timer de 24 horas. Para conversas iniciadas via anúncios Click-to-WhatsApp (Facebook/Instagram), a janela se estende para **72 horas**.

### Templates com botões vs mensagens interativas de sessão

| Aspecto | Templates com botões | Mensagens interativas (sessão) |
|---------|:-------------------:|:-----------------------------:|
| Quando enviar | **A qualquer momento** | Apenas na janela de **24h** |
| Aprovação da Meta | **Obrigatória** | Não necessária |
| Máx. botões quick reply | Até **10** | Até **3** |
| List messages | Não disponível | Disponível (até **10 opções**) |
| Conteúdo dinâmico | Apenas variáveis em template fixo | **Totalmente dinâmico** |
| Custo | Cobrado por conversa | **Gratuito** (service conversation) |
| Webhook de resposta | `type: "button"` com `payload` | `type: "interactive"` com `button_reply`/`list_reply` |

**Na prática**, templates são para iniciar conversas proativamente (notificações, remarketing), enquanto mensagens interativas são para conduzir fluxos conversacionais dentro de uma sessão ativa.

### Rate limits e tiers de envio

Negócios não verificados começam com limite de **250 usuários únicos** por 24 horas para mensagens business-initiated. Após verificação, o tier inicial é **1.000**, escalando automaticamente para **10.000 → 100.000 → ilimitado** conforme volume e qualidade. O throughput da Cloud API alcança **80 mensagens por segundo** por número. As primeiras **1.000 conversas de serviço** por mês são gratuitas.

## Conclusão

Implementar botões interativos do WhatsApp no n8n é perfeitamente viável, mas exige contornar a limitação do nó nativo via HTTP Request — uma solução estável, bem documentada pela comunidade e que utiliza as mesmas credenciais já configuradas. O ponto mais crítico da arquitetura não é o envio dos botões em si, mas o **gerenciamento de estado entre execuções**: como cada clique de botão gera uma nova execução independente, um sistema externo de estado (Redis + PostgreSQL) se torna indispensável para chatbots que vão além de um único nível de menu. A combinação de botões para navegação estruturada com AI Agent para consultas complexas representa o padrão mais eficiente — botões resolvem 70-80% das interações instantaneamente e sem custo de IA, enquanto o agente cuida do restante com contexto recuperado via RAG.