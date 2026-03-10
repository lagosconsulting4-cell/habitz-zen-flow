# P2 MEDIO: Ratio de Mensagens Bot:Usuario Muito Alto

## Problema

A proporcao de mensagens enviadas pela Foquinha vs mensagens do usuario e extremamente desbalanceada, fazendo o canal parecer um broadcast unidirecional em vez de uma conversa.

## Evidencia

| Usuario | Msgs Usuario | Msgs Bot | Ratio |
|---------|-------------|----------|-------|
| Matheus (...9522) | 0 | 22 | ∞:1 |
| Lucas (...9818) | 3 | 17 | 6:1 |
| Lucineide (...6989) | 7 | 43 | 6:1 |
| Giovana (...4129) | 11 | 15 | 1.4:1 |
| Camila (...8899) | 8 | 14 | 1.75:1 |

**Matheus nunca respondeu** — mas continuou recebendo 5+ lembretes por dia durante uma semana inteira.

## Causa Raiz

Este problema e consequencia direta dos problemas #1 (habitos nao solicitados) e #5 (falta de agrupamento):
1. Muitos habitos ativos (varios nao solicitados) geram muitos lembretes
2. Lembretes nao sao agrupados, cada um e uma mensagem separada
3. Nao ha mecanismo para detectar "usuario nao esta engajando" e reduzir frequencia

## Impacto

- Canal se torna broadcast em vez de conversa
- Usuario para de abrir/ler as mensagens
- WhatsApp pode classificar como spam
- Destruicao da experiencia conversacional

## Relacao com Outros Problemas

- Resolver #1 (habitos nao solicitados) reduz o volume drasticamente
- Resolver #5 (agrupamento) reduz o numero de mensagens separadas
- Ambos combinados devem trazer o ratio para ~2:1 ou melhor

## Solucao Proposta

1. **Resolver #1 e #5 primeiro** — isso resolve a maior parte do problema
2. **Implementar "engagement decay"**: Se o usuario nao responde ha 3+ dias, reduzir frequencia de lembretes
3. **Detectar desengajamento**: Se o usuario nao interagiu em 7+ dias e nunca completou um habito, enviar UMA mensagem perguntando se quer continuar recebendo lembretes
4. **Meta ideal**: Maximo de 3 mensagens proativas por dia (manha, tarde, noite)

## Status

Pendente — depende da resolucao dos problemas #1 e #5
