# P2 MEDIO: Sem Loop de Engajamento

## Problema

A Foquinha nao tem mecanismos proativos de engajamento alem dos lembretes individuais. Nao existe:
- Resumo matinal do dia
- Recap noturno do progresso
- Progresso semanal
- Celebracao de marcos (streaks)
- Reengajamento apos ausencia

## O Que Falta

### 1. Resumo Matinal
**O que seria:** Uma mensagem pela manha dizendo:
```
Bom dia, Camila! Seu plano pro dia:
☀️ Manha: Acordar + luz natural, leitura, cuidados cabelo
🌤️ Tarde: Estudo Pedagogia, almoco
🌙 Noite: Protocolo noturno, celular na sala

Voce tem 8 habitos hoje. Bora! 💪
```

**Beneficio:** Usuario começa o dia sabendo o que esperar, sem ser interrompido a cada 30min.

### 2. Recap Noturno
**O que seria:** Uma mensagem a noite resumindo o dia:
```
Boa noite, Lu! Resumo do dia:
✅ Anticoncepcional — feito!
✅ Oracao — feito!
⬜ Hidratacao 500mL — pendente
⬜ Arrumar cama — pendente

2 de 4 concluidos. Amanha e um novo dia! 🌙
```

**Beneficio:** Senso de progresso e fechamento do dia.

### 3. Progresso Semanal
**O que seria:** Uma mensagem no domingo/segunda:
```
Semana de 04-10/mar, Matheus:
📊 Taxa de conclusao: 45% (9 de 20 habitos)
🔥 Melhor streak: Beber agua (3 dias)
⭐ Destaques: Voce completou deep work 3x essa semana!

Quer ajustar algo pra proxima semana?
```

**Beneficio:** Visao de longo prazo, sentir progresso real.

### 4. Celebracao de Marcos
**O que seria:** Mensagens especiais em:
- 7 dias de streak: "1 semana seguida de X! 🎉"
- 14 dias: "2 semanas! Isso ja virou habito! 🔥"
- 30 dias: "1 mes! Voce e incrivel! 🏆"
- 100 dias: mensagem premium com stats

**Beneficio:** Dopamine hits, motivacao real baseada em dados.

### 5. Reengajamento Apos Ausencia
**O que seria:** Se o usuario nao interage ha 3+ dias:
```
Oi Matheus! Faz uns dias que a gente nao conversa.
Quer que eu continue mandando os lembretes normalmente,
ou prefere ajustar alguma coisa? 😊
```

**Beneficio:** Demonstra que a Foquinha e inteligente e se adapta, em vez de continuar mandando lembretes para o vazio.

## Evidencia do Problema

### Matheus (...9522)
- Recebe lembretes ha 6+ dias
- NUNCA respondeu
- NUNCA completou um habito
- Foquinha continua mandando a mesma motivacao generica
- Zero adaptacao ao comportamento do usuario

### Lucas (...9818)
- Completou "beber agua" por 1 dia (streak: 1)
- Foquinha menciona "streak de 1" em todo lembrete, mas nunca celebra ou pergunta como esta indo
- Nenhum resumo, nenhum progresso

## Causa Raiz

O pipeline de lembretes e puramente baseado em horario:
1. Verifica quais habitos estao no horario → envia lembrete
2. Nao considera: historico de engajamento, taxa de conclusao, tempo desde ultima interacao
3. Nao existe mecanismo de resumo/recap

## Arquivos Relevantes

- Schedule Trigger + Fetch Due Habits: pipeline de lembretes
- Save Conversation State: onde mensagens sao persistidas
- Tabela `habit_completions`: dados de conclusao
- Tabela `whatsapp_conversations.last_interaction`: ultima interacao

## Solucao Proposta

### Fase 1: Resumo Matinal + Recap Noturno
1. Adicionar no Schedule Trigger logica para detectar "hora do resumo" (ex: 07:00 e 21:00)
2. Gerar mensagem de resumo em vez de lembrete individual
3. Incluir lista de habitos do dia/progresso

### Fase 2: Progresso Semanal
1. Adicionar cron semanal (domingo 20:00)
2. Calcular estatisticas da semana
3. Enviar resumo personalizado

### Fase 3: Celebracoes + Reengajamento
1. Detectar marcos de streak no pipeline
2. Enviar mensagens especiais
3. Detectar ausencia (3+ dias sem interacao) e enviar reengajamento

## Status

Pendente — requer redesenho parcial do pipeline de lembretes
