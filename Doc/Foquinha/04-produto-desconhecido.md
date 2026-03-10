# P1 ALTO: Foquinha Nao Conhece o Proprio Produto

## Problema

Quando o usuario pergunta sobre o app, site ou produto BORA, a Foquinha nao sabe responder. Isso cria frustacao e quebra de confianca, alem de perder oportunidades de upsell.

## Evidencia

### Rafael (...4042) — Conversa real:

```
USER: Tem um app do bora?
FOQUINHA: Atualmente, nao temos um aplicativo especifico do Bora. Mas estou aqui
          para ajudar com suas rotinas e habitos!

USER: So pelo site mesmo? Qual o site
FOQUINHA: Desculpe, mas nao posso fornecer o site especifico.

USER: Qual o site?
(perguntou 2x)

USER: Eu ja tenho o cadastro, so preciso do site pra logar
FOQUINHA: Entendo! Mas nao posso fornecer o site especifico. Recomendo que voce
          procure no seu navegador ou verifique seu e-mail de cadastro.

USER: Vcs nao sao um conjunto?
FOQUINHA: Entendo a confusao! Mas sou um assistente pessoal focado em ajudar
          voce com habitos e rotinas. Para questoes especificas sobre o site
          ou servicos, recomendo entrar em contato com o suporte pelo numero
          +55 11 99337-1766.
```

O usuario perguntou 4 vezes e nao conseguiu a resposta. Ele SABIA que o produto existia mas a Foquinha negou.

## Causa Raiz

O system prompt da Foquinha nao contem:
1. A URL do app/site
2. Informacoes sobre o produto BORA
3. Link de pagamento para upsell
4. Explicacao da relacao Foquinha ↔ BORA

O prompt atual diz apenas:
```
Voce e o Foquinha, assistente pessoal de habitos.
```

Nao ha NENHUMA mencao ao ecossistema (BORA app, Habitz, etc).

## Impacto

- Usuario frustrado (perguntou 4x sem resposta)
- Perda de oportunidade de upsell
- Quebra de confianca ("vcs nao sao um conjunto?")
- Usuario pode achar que pagou por um produto e nao tem acesso

## Arquivos Relevantes

- System prompt: Node `64c237d1` no workflow `agr9lH57zHvusH73`
- Secao de CAPACIDADES e PERSONALIDADE do prompt

## Solucao Proposta

Adicionar ao system prompt uma secao sobre o ecossistema:

```
SOBRE O PRODUTO:
- Voce (Foquinha) e a assistente pessoal de habitos pelo WhatsApp
- O BORA e o app completo onde o usuario pode visualizar e gerenciar
  todas as suas tarefas, lembretes, habitos e jornadas
- Link de pagamento do BORA: https://pay.hub.la/TnHQjCqYzq0WsJmjh5fj
- Se o usuario perguntar sobre o app/site, explique que o BORA e o app
  complementar e compartilhe o link
- Voce e o BORA sao partes do mesmo ecossistema
```

### Cenarios de uso:
1. **Usuario pergunta "tem app?"** → "Sim! O BORA e nosso app onde voce consegue visualizar e gerenciar tudo. Quer que eu te mande o link?"
2. **Usuario nao-cliente pergunta sobre features avancadas** → Explicar e oferecer o link de pagamento
3. **Usuario registrado quer ver seus habitos em formato visual** → Direcionar para o BORA

## Status

Pendente — link de pagamento confirmado: https://pay.hub.la/TnHQjCqYzq0WsJmjh5fj
