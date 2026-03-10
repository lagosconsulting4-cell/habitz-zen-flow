# P2 MEDIO: Lembretes Sem Call-to-Action Claro

## Problema

Os lembretes da Foquinha sao motivacionais mas nao oferecem uma acao clara que o usuario pode tomar para marcar o habito como concluido diretamente pela conversa.

## Evidencia

### Lembrete tipico atual:
```
Oi, Lucas! 🌟 Olha so, voce ta com um streak de 1 em beber agua! 💧
Que tal manter essa mare boa e se hidratar mais um pouquinho?
Seu corpo vai agradecer! Bora la, amigo! Voce consegue! 💪✨
```

**O que falta:** Uma instrucao clara como "Responda FEITO quando completar" ou "Mande um 👍 quando fizer".

### Contraste — interacao positiva que funcionou:
```
[06:01] FOQUINHA: Bom dia, Rafael! Hoje e um otimo dia para comecar um novo habito!
                  Que tal acordar cedo? Vamos deixar essa streak em 1?

[09:02] USER: Sim

[09:02] FOQUINHA: Parabens por acordar cedo! 🎉 Vamos marcar esse habito como concluido!
```

Rafael respondeu "Sim" e a Foquinha marcou como concluido. Mas isso so funcionou porque a Foquinha PERGUNTOU algo e o usuario entendeu que devia responder.

### Lembretes que NAO geram resposta:
```
FOQUINHA: Oi, Lucineide! Uma ótima manhã pra voce! Não esquece de tomar seu
          anticoncepcional hoje, ta? Vamos começar um streak novinho! 💪✨
```

Lucineide nao responde. O lembrete e informativo mas nao convida a interacao.

## Causa Raiz

O prompt do lembrete (Generate AI Message) nao instrui o AI a incluir um CTA:
```
Voce envia um lembrete curto (30-80 palavras) sobre habitos pendentes.
```

Nao ha instrucao para:
1. Pedir confirmacao do usuario
2. Oferecer opcao de resposta rapida
3. Incluir "responda X quando fizer"

## Impacto

- Lembretes sao unidirecionais — nao geram engajamento
- Usuario nao sabe que pode RESPONDER para marcar como concluido
- Streaks ficam em 0 porque usuario completa o habito mas nao informa a Foquinha
- Perde-se a oportunidade de criar loop de interacao

## Arquivos Relevantes

- Node "Generate AI Message" no workflow `agr9lH57zHvusH73`
- System prompt do chatbot (para o intent `complete_habit`)

## Solucao Proposta

### 1. Incluir CTA no prompt de lembrete
Adicionar ao prompt do Generate AI Message:
```
Ao final do lembrete, inclua uma chamada para acao simples.
Exemplos: "Responda FEITO quando completar!", "Manda um ✅ quando fizer!",
"Quando terminar, me avisa aqui!"
Varie a forma de pedir, mas sempre inclua.
```

### 2. Melhorar deteccao de conclusao no chatbot
O system prompt do chatbot ja lida com `complete_habit`, mas pode ser melhorado para reconhecer respostas rapidas como:
- "feito", "fiz", "pronto", "ok", "sim", "✅", "👍"
- Associar automaticamente ao ultimo habito lembrado

### 3. Considerar WhatsApp Buttons (futuro)
WhatsApp Business API permite enviar mensagens com botoes interativos:
- Botao "Feito ✅"
- Botao "Pular hoje"
- Botao "Lembrar depois"

Isso simplificaria drasticamente a interacao, mas requer mudanca no node de envio.

## Status

Pendente
