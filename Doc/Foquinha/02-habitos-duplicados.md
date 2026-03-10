# P1 ALTO: Habitos Duplicados

## Problema

O sistema permite criar multiplas copias do mesmo habito, resultando em lembretes duplicados e confusao para o usuario.

## Evidencia

### Giovana (...4129)
Ao listar seus habitos, Foquinha mostra:
```
1. Aulas da Faculdade (morning) - Streak: 0
2. Aulas da Faculdade (morning) - Streak: 0
3. Aulas da Faculdade - TPE (PAT 413) (morning) - Streak: 0
4. Aulas da Faculdade - TPE (PAT 413) (morning) - Streak: 0
5. Aulas da Faculdade - TPE (PAT 413) (morning) - Streak: 0
```

Reacao da usuario: *"ue ta errado"* e *"todos estao errados"*

A conversa mostra que ela tentou criar habitos de faculdade varias vezes, e o sistema criou duplicatas a cada tentativa.

## Causa Raiz

O intent `create_habit` no pipeline nao verifica se ja existe um habito com nome similar para aquele usuario antes de inserir. A query de INSERT na tabela `habits` nao tem constraint de unicidade por (user_id, name).

## Impacto

- Usuario recebe MULTIPLOS lembretes para o mesmo habito
- Lista de habitos fica poluida
- Usuario perde confianca no sistema
- Streaks ficam fragmentadas entre copias

## Arquivos Relevantes

- Node "Create Habit" no workflow `agr9lH57zHvusH73` — SQL de INSERT
- Node "Parse Response" — onde o intent_data.name e extraido
- Tabela `habits` — verificar constraints

## Solucao Proposta

1. **Antes de criar**, verificar se ja existe habito ativo com nome similar (case-insensitive, fuzzy match)
2. Se encontrar similar, perguntar ao usuario: "Voce ja tem o habito 'X'. Quer criar outro ou editar esse?"
3. Adicionar constraint unica na tabela: `UNIQUE(user_id, name) WHERE is_active = true`
4. Na logica de CREATE, fazer SELECT primeiro para validar

## Status

Pendente
