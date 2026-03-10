# P1 ALTO: Motivacao Generica e Repetitiva nos Lembretes

## Problema

Todos os lembretes da Foquinha terminam com a mesma motivacao generica. Apos receber 5-10 lembretes por dia com o mesmo padrao, a mensagem vira ruido e o usuario para de prestar atencao.

## Evidencia

Frases que se repetem em TODOS os lembretes analisados:
- "Voce consegue! 💪✨"
- "Vamos la!"
- "Cada passo conta!"
- "Vamos juntos!"
- "Bora fazer acontecer!"
- "Estou torcendo por voce!"
- "Vamos comecar a construir esse streak?"

### Exemplos reais (todos com o mesmo padrao):

**Lucas (06:00):** "Bom dia, Lucas! ☀️ Hoje e um otimo dia para comecar... Vamos em frente! Voce consegue! 💪🌟"
**Lucas (06:30):** "Bom dia, Lucas! ☀️ Hoje e um otimo dia para comecar... Vamos la! Voce consegue! 💪✨"
**Lucas (07:00):** "Bom dia, Lucas! ☀️ Hoje e um dia perfeito para comecar... Vamos la? Voce consegue! 🏋️‍♂️✨"
**Lucas (08:00):** "Bom dia, Lucas! ☀️ Hoje e o dia perfeito para comecar... Nao esquece de se hidratar... Voce consegue! 💪✨"

4 lembretes em 2 horas, todos com a mesma estrutura: saudacao + "otimo dia" + habito + "voce consegue".

## Causa Raiz

O prompt do node "Generate AI Message" e extremamente curto e generico:

```
Voce e o Foquinha, um assistente de habitos fofo e motivacional (como o Duolingo, mas brasileiro).
Seu tom e: animado, usa emojis, fala como amigo proximo.
Voce envia um lembrete curto (30-80 palavras) sobre habitos pendentes.
Nao use hashtags. Seja natural e varie as mensagens.
Se houver streak, celebre. Se for tarefa unica (due_date), mencione que e hoje o dia.
```

Problemas com este prompt:
1. Nenhum few-shot example para mostrar variacoes
2. "Seja natural e varie" nao e suficiente — GPT-4o-mini com temp 0.9 ainda cai no mesmo padrao
3. Nao ha instrucao sobre o que NAO fazer (ex: nao terminar sempre com "voce consegue")
4. Nao diferencia entre tipos de habito (saude, produtividade, pessoal)
5. Nao considera historico — envia a mesma motivacao 5x no mesmo dia

## Impacto

- Mensagens se tornam ruido — usuario para de ler
- Tom artificialmente positivo o tempo todo perde credibilidade
- Usuario sente que esta falando com um bot generico, nao com uma "assistente pessoal"

## Arquivos Relevantes

- Node "Generate AI Message" no workflow `agr9lH57zHvusH73`
- Model: gpt-4o-mini, temperature: 0.9, max_tokens: 200
- Input: display_name + periodLabel + habits_text

## Solucao Proposta

1. **Reescrever o prompt do lembrete** com:
   - 5-6 few-shot examples mostrando estilos DIFERENTES
   - Instrucao explicita: "NUNCA termine com 'voce consegue' ou variacoes"
   - Variar tom por contexto: direto e curto para lembretes simples, celebratorio para streaks altas
   - Personalidade mais natural: como amigo que manda msg rapida, nao coach motivacional
2. **Considerar reduzir temperature** para 0.7 (menos aleatorio, mais consistente)
3. **Adicionar contexto de historico**: quantos lembretes o usuario ja recebeu hoje, para calibrar tom (menos efusivo se ja mandou 3)

### Exemplos de tom desejado:
- Lembrete simples: "Oi Lu! Hora do anticoncepcional 💊"
- Streak alta: "7 dias seguidos de academia, Rafael! Consistencia e tudo 🔥"
- Tarefa unica: "Opa, hoje e dia de entregar a atividade! Nao esquece 📝"
- Fim do dia: "Fechar o screen time e preparar a mochila — boa noite! 🌙"

## Status

Pendente
