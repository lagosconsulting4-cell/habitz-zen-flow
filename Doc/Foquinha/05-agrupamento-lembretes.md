# P2 MEDIO: Multiplos Lembretes Separados no Mesmo Periodo

## Problema

Quando um usuario tem varios habitos no mesmo periodo (manha, por exemplo), ele recebe MULTIPLOS lembretes separados em vez de UMA mensagem agrupada. Isso amplifica o volume de mensagens.

## Evidencia

### Lucas (...9818) — Manha de 10/mar:
```
[02:00] LEMBRETE: Bom dia! Lembre-se de beber agua... (habito: agua)
[06:00] LEMBRETE: Bom dia! Acordar cedo, inbox zero, trabalho focado, Pomodoro... (agrupado)
[06:30] LEMBRETE: Bom dia! Arrumar a cama... (habito: arrumar cama)
[07:00] LEMBRETE: Bom dia! Se exercitar na academia... (habito: academia)
[08:00] LEMBRETE: Bom dia! Deep work, celular de lado... (habito: deep work)
[09:00] LEMBRETE: Bom dia! Beber agua, streak de 1... (habito: agua de novo)
```
6 lembretes em 7 horas. Cada um gerou uma notificacao no WhatsApp.

### Lucineide (...6989) — Manha de 08/mar:
```
[06:00] LEMBRETE: Bom dia! Planejar o dia, acordar cedo, inbox zero...
[08:00] LEMBRETE: Bom dia! Hidratar, luz solar, arrumar cama, academia, deep work...
[08:30] LEMBRETE: Bom dia! Tomar anticoncepcional...
```
3 lembretes em 2h30.

## Causa Raiz

O pipeline de lembretes funciona assim:
1. **Schedule Trigger** roda a cada 5 minutos
2. **Fetch Due Habits** busca habitos cujo `effective_time` cai na janela de 10 minutos atual
3. **Group by User** agrupa habitos do MESMO horario para o mesmo usuario
4. **Generate AI Message** gera UMA mensagem por usuario (com todos os habitos da janela)

O agrupamento funciona DENTRO da mesma janela de 10 minutos, mas habitos com horarios DIFERENTES (06:00 vs 06:30 vs 07:00) geram lembretes separados.

**Exemplo:** Se o usuario tem:
- Acordar cedo: 06:00
- Arrumar cama: 06:30
- Academia: 07:00
- Deep work: 08:00
- Agua: 09:00

Ele recebera 5 lembretes separados, um a cada 30-60 minutos.

## Impacto

- Excesso de notificacoes no WhatsApp
- Cada lembrete interrompe o usuario
- Mensagens de manha parecem spam
- Usuario pode silenciar ou bloquear

## Arquivos Relevantes

- Node "Get BRT Time": calcula janela de 10min (windowStart/windowEnd)
- Node "Fetch Due Habits": SQL filtra por effective_time dentro da janela
- Node "Group by User": agrupa por telefone dentro da mesma execucao
- Schedule Trigger: intervalo de 5 minutos

## Solucao Proposta

### Opcao A: Agrupar por periodo (Recomendada)
Em vez de enviar lembrete por habito/horario, enviar NO MAXIMO 3 mensagens por dia:
1. **Resumo da manha** (entre 06-08): Lista todos os habitos do periodo morning
2. **Check-in da tarde** (entre 12-14): Lista habitos do afternoon
3. **Resumo da noite** (entre 18-20): Lista habitos do evening

### Opcao B: Agrupar com janela maior
Aumentar a janela de agrupamento para 2 horas em vez de 10 minutos. Todos os habitos entre 06:00-08:00 iriam numa mensagem so.

### Opcao C: Consolidar horarios semelhantes
Se o usuario tem 3 habitos entre 06:00 e 07:00, enviar UMA mensagem as 06:00 com os 3.

### Consideracao
O agrupamento precisa respeitar que o usuario ESCOLHEU horarios especificos. Se ele pediu lembrete as 06:00 e outro as 08:00, faz sentido serem mensagens separadas. O problema e quando o usuario tem 5+ habitos com horarios proximos (06:00, 06:30, 07:00) gerando 3+ mensagens em 1 hora.

## Status

Pendente — decidir entre opcoes A/B/C
