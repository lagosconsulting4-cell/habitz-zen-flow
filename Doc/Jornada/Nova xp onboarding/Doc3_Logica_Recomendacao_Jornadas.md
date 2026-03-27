# Doc 3 — Lógica de Recomendação de Jornadas
## Bora App — Sistema de Match Perfil × Jornada
**Versão 1.0 — Março 2026**

---

## Fundamento: Por que o Match Importa

Hábitos auto-selecionados têm 37% mais taxa de sucesso do que os impostos externamente. Isso muda como o sistema de recomendação deve funcionar: não é uma prescrição — é uma descoberta guiada. O usuário precisa sentir que *chegou* à jornada, não que ela foi empurrada pra ele.

O sistema lê o perfil completo do usuário e calcula um score de afinidade para cada uma das 5 jornadas L1. As jornadas com maior score recebem o badge "Recomendada pra você". O usuário sempre tem a palavra final — a recomendação é o ponto de partida, não o destino.

---

## As 5 Jornadas L1 — Identidade e Promessa

| ID | Nome | Promessa central | Perfil ideal |
|----|------|-----------------|--------------|
| `own-mornings-l1` | Do Zero à Rotina | Construir uma rotina matinal sólida em 30 dias | Quem não tem manhã estruturada ou perde o começo do dia |
| `gym-l1` | Do Sofá ao Shape | Nunca mais se sentir perdido na academia. Hábito de treino 4x/semana consolidado | Quem não treina, parou ou vai mas sem consistência |
| `focus-protocol-l1` | Domine Sua Atenção | Recuperar capacidade de concentração. Deep work de 90+ min sem distração | Quem sente que não consegue focar, procrastina, não termina o que começa |
| `finances-l1` | Controle Total | Saber pra onde vai cada real. Reserva de emergência iniciada. Fim do mês sem susto | Quem não tem controle financeiro, termina o mês zerado ou endividado |
| `digital-detox-l1` | Detox de Dopamina | Reduzir screen time pela metade. Retomar controle sobre celular e redes sociais | Quem sente que o celular controla mais do que ele controla o celular |

---

## Variáveis de Input para o Match

O sistema usa os seguintes campos disponíveis no momento da recomendação:

**Do quiz da landing page (`quiz_responses`):**
- `objective` — objetivo principal declarado
- `challenges` — array de desafios selecionados
- `energy_peak` — pico de energia (morning / afternoon / evening)
- `years_promising` — há quanto tempo promete mudar
- `consistency_feeling` — relação emocional com consistência
- `age_range` — faixa etária
- `profession` — situação profissional

**Do onboarding (S4–S7):**
- `wake_time` — horário de acordar
- `life_areas` — áreas da vida priorizadas
- `habit_experience` — nível de experiência com hábitos

---

## Sistema de Score por Jornada

Cada jornada recebe uma pontuação de 0 a 100 para aquele usuário. O score é calculado somando os pontos de cada sinal de afinidade abaixo.

As jornadas com **score ≥ 65** recebem o badge "Recomendada pra você".
Se nenhuma jornada atingir 65, as **duas de maior score** recebem o badge.
Máximo de **2 badges** ativos simultaneamente.

---

## JORNADA: DO ZERO À ROTINA (own-mornings-l1)

**Conceito:** Transformar o início do dia de caótico para estruturado. A manhã é o único período do dia que o usuário controla 100% antes que o mundo externo comece a puxar atenção.

### Sinais de Alta Afinidade (+pontos)

| Sinal | Campo | Condição | Pontos |
|-------|-------|----------|--------|
| Objetivo é criar rotina | `objective` | = "routine" | +30 |
| Objetivo é produtividade | `objective` | = "productivity" | +15 |
| Desafio é foco | `challenges` | inclui "focus" | +15 |
| Desafio é procrastinação | `challenges` | inclui "procrastination" | +10 |
| Desafio é cansaço | `challenges` | inclui "tiredness" | +15 |
| Pico de energia é manhã | `energy_peak` | = "morning" | +20 |
| Acorda antes das 8h | `wake_time` | < 08:00 | +10 |
| Área de vida: mente | `life_areas` | inclui "mind" | +10 |
| Área de vida: trabalho | `life_areas` | inclui "work" | +10 |
| Promete mudar há muito tempo | `years_promising` | = "3-5years" ou "5+years" | +10 |
| Nunca manteve hábito | `habit_experience` | = "never" | +15 |
| Sentimento de evitação | `consistency_feeling` | = "avoiding" | +10 |

### Sinais de Baixa Afinidade (-pontos)

| Sinal | Campo | Condição | Pontos |
|-------|-------|----------|--------|
| Pico de energia é noite | `energy_peak` | = "evening" | -15 |
| Acorda após as 10h | `wake_time` | ≥ 10:00 | -10 |
| Objetivo é saúde física | `objective` | = "health" | -5 |

### Score máximo possível: 100 pontos

### Lógica de copy do badge (personalizada por sinal dominante):

| Sinal dominante | Copy do badge |
|----------------|---------------|
| wake_time antes das 7h | "Você já acorda cedo. Agora a gente transforma isso numa rotina." |
| consistency_feeling = "avoiding" | "Você sente que o dia começa errado. Aqui é onde isso muda." |
| years_promising = "5+years" | "Cinco anos prometendo mudar a manhã. Essa jornada foi feita pra isso." |
| tiredness em challenges | "Seu cansaço começa antes do dia. Essa jornada resolve isso pela raiz." |
| padrão | "Sua manhã é o lugar onde tudo começa. Essa jornada constrói ela do zero." |

---

## JORNADA: DO SOFÁ AO SHAPE (gym-l1)

**Conceito:** Criar o hábito de treinar 4x/semana em 30 dias. Não é sobre shape rápido — é sobre nunca mais se sentir perdido ou intimidado num espaço de treino.

### Sinais de Alta Afinidade (+pontos)

| Sinal | Campo | Condição | Pontos |
|-------|-------|----------|--------|
| Objetivo é saúde física | `objective` | = "health" | +35 |
| Área de vida: saúde física | `life_areas` | inclui "physical" | +25 |
| Desafio é motivação | `challenges` | inclui "motivation" | +20 |
| Desafio é cansaço | `challenges` | inclui "tiredness" | +15 |
| Objetivo é eliminar vícios | `objective` | = "avoid" | +10 |
| Nunca manteve hábito | `habit_experience` | = "never" | +10 |
| Já tentou mas não durou | `habit_experience` | = "tried" | +15 |
| Faixa etária jovem | `age_range` | = "18-24" ou "25-34" | +10 |
| Promete mudar há muito tempo | `years_promising` | = "3-5years" ou "5+years" | +10 |
| Sentimento frustrado | `consistency_feeling` | = "frustrated" | +10 |

### Sinais de Baixa Afinidade (-pontos)

| Sinal | Campo | Condição | Pontos |
|-------|-------|----------|--------|
| Objetivo é equilíbrio mental | `objective` | = "mental" | -10 |
| Área de vida: mente (única selecionada) | `life_areas` | = ["mind"] | -10 |
| Já tem hábitos estabelecidos | `habit_experience` | = "already_have" | -5 |

### Score máximo possível: 100 pontos

### Lógica de copy do badge:

| Sinal dominante | Copy do badge |
|----------------|---------------|
| habit_experience = "tried" | "Você já tentou antes. Essa jornada foi desenhada pra quem desistiu uma vez." |
| motivation em challenges | "Motivação vai e vem. Essa jornada te dá um sistema que funciona sem ela." |
| years_promising longo | "Você sabe que precisa se mover. Essa jornada tira você do zero em 30 dias." |
| consistency_feeling = "frustrated" | "Frustração com o corpo é o começo de algo. Essa jornada transforma isso." |
| padrão | "30 dias. Academia sem medo. Hábito de treino consolidado." |

---

## JORNADA: DOMINE SUA ATENÇÃO (focus-protocol-l1)

**Conceito:** Recuperar a capacidade de focar num mundo que compete por atenção 24 horas por dia. Deep work não é talento — é um sistema que se constrói.

### Sinais de Alta Afinidade (+pontos)

| Sinal | Campo | Condição | Pontos |
|-------|-------|----------|--------|
| Desafio é foco | `challenges` | inclui "focus" | +30 |
| Desafio é procrastinação | `challenges` | inclui "procrastination" | +25 |
| Objetivo é produtividade | `objective` | = "productivity" | +20 |
| Objetivo é eliminar vícios | `objective` | = "avoid" | +15 |
| Área de vida: trabalho | `life_areas` | inclui "work" | +15 |
| Estudante | `profession` | = "student" | +15 |
| Freelancer ou empreendedor | `profession` | = "freelancer" ou "entrepreneur" | +10 |
| Já tentou mas não durou | `habit_experience` | = "tried" | +10 |
| Desafio é esquecimento | `challenges` | inclui "forgetfulness" | +10 |
| Faixa etária 18-34 | `age_range` | = "18-24" ou "25-34" | +5 |
| Sentimento conformado | `consistency_feeling` | = "resigned" | +10 |

### Sinais de Baixa Afinidade (-pontos)

| Sinal | Campo | Condição | Pontos |
|-------|-------|----------|--------|
| Objetivo é saúde física | `objective` | = "health" | -10 |
| Área de vida: relacionamentos (única) | `life_areas` | = ["relationships"] | -15 |
| Pico de energia é tarde | `energy_peak` | = "afternoon" | -5 |

### Score máximo possível: 100 pontos

### Lógica de copy do badge:

| Sinal dominante | Copy do badge |
|----------------|---------------|
| focus + procrastination em challenges | "Você sabe o que precisa fazer mas não consegue começar. Essa jornada resolve exatamente isso." |
| profession = "student" | "Estudar exige foco profundo. Essa jornada constrói esse músculo em 30 dias." |
| profession = "entrepreneur" | "Cada hora de foco profundo de um empreendedor vale por três horas fragmentadas. Essa jornada te dá isso." |
| consistency_feeling = "resigned" | "Você parou de acreditar que consegue focar. Essa jornada vai provar o contrário." |
| padrão | "Foco não é talento. É um sistema. Essa jornada te dá o sistema." |

---

## JORNADA: CONTROLE TOTAL (finances-l1)

**Conceito:** Saber pra onde vai cada real. Não é sobre ganhar mais — é sobre parar de terminar o mês sem entender o que aconteceu com o dinheiro.

### Sinais de Alta Afinidade (+pontos)

| Sinal | Campo | Condição | Pontos |
|-------|-------|----------|--------|
| Objetivo é criar rotina | `objective` | = "routine" | +20 |
| Objetivo é produtividade | `objective` | = "productivity" | +15 |
| Objetivo é eliminar vícios | `objective` | = "avoid" | +20 |
| Desafio é esquecimento | `challenges` | inclui "forgetfulness" | +15 |
| Desafio é procrastinação | `challenges` | inclui "procrastination" | +10 |
| Área de vida: trabalho | `life_areas` | inclui "work" | +15 |
| Faixa etária 18-34 | `age_range` | = "18-24" ou "25-34" | +20 |
| Estudante | `profession` | = "student" | +10 |
| Empregado CLT | `profession` | = "employed" | +10 |
| Nunca manteve hábito | `habit_experience` | = "never" | +10 |
| Promete mudar há muito | `years_promising` | = "3-5years" ou "5+years" | +10 |

### Sinais de Baixa Afinidade (-pontos)

| Sinal | Campo | Condição | Pontos |
|-------|-------|----------|--------|
| Objetivo é saúde física | `objective` | = "health" | -15 |
| Objetivo é equilíbrio mental | `objective` | = "mental" | -10 |
| Faixa etária 45+ | `age_range` | = "45-54" ou "55+" | -5 |

### Score máximo possível: 100 pontos

### Lógica de copy do badge:

| Sinal dominante | Copy do badge |
|----------------|---------------|
| age_range = "18-24" | "Ninguém ensinou você a lidar com dinheiro. Essa jornada faz isso em 30 dias." |
| years_promising longo | "Você sabe que precisa organizar as finanças. Essa jornada finalmente coloca isso em prática." |
| objective = "avoid" | "Gastos automáticos e impulsos financeiros têm padrão. Essa jornada te ajuda a encontrar e quebrar o seu." |
| forgetfulness em challenges | "Esquecimento financeiro custa caro. Essa jornada cria o sistema que lembra por você." |
| padrão | "Terminar o mês sabendo pra onde foi cada real. Esse é o resultado dessa jornada." |

---

## JORNADA: DETOX DE DOPAMINA (digital-detox-l1)

**Conceito:** Reduzir screen time pela metade e retomar o controle sobre o celular. Não é sobre largar a tecnologia — é sobre usar ela de forma intencional em vez de compulsiva.

### Sinais de Alta Afinidade (+pontos)

| Sinal | Campo | Condição | Pontos |
|-------|-------|----------|--------|
| Objetivo é eliminar vícios | `objective` | = "avoid" | +35 |
| Desafio é foco | `challenges` | inclui "focus" | +20 |
| Desafio é motivação | `challenges` | inclui "motivation" | +15 |
| Desafio é ansiedade | `challenges` | inclui "anxiety" | +20 |
| Objetivo é equilíbrio mental | `objective` | = "mental" | +15 |
| Área de vida: mente | `life_areas` | inclui "mind" | +15 |
| Faixa etária jovem | `age_range` | = "18-24" ou "25-34" | +10 |
| Desafio é procrastinação | `challenges` | inclui "procrastination" | +10 |
| Sentimento de evitação | `consistency_feeling` | = "avoiding" | +15 |
| Promete mudar há muito | `years_promising` | = "3-5years" ou "5+years" | +10 |

### Sinais de Baixa Afinidade (-pontos)

| Sinal | Campo | Condição | Pontos |
|-------|-------|----------|--------|
| Objetivo é saúde física | `objective` | = "health" | -10 |
| Área de vida: saúde física (única) | `life_areas` | = ["physical"] | -10 |
| Já tem hábitos sólidos e objetivo de saúde | `habit_experience` = "already_have" + `objective` = "health" | combinação | -15 |

### Score máximo possível: 100 pontos

### Lógica de copy do badge:

| Sinal dominante | Copy do badge |
|----------------|---------------|
| objective = "avoid" | "Você sabe que o celular tá te custando mais do que você percebe. Essa jornada muda a equação." |
| anxiety em challenges | "Ansiedade e uso compulsivo de tela se alimentam. Essa jornada quebra esse ciclo." |
| consistency_feeling = "avoiding" | "Você evita as coisas importantes e vai pro celular no lugar. Essa jornada inverte isso." |
| focus em challenges | "Você perde o fio antes de começar. Essa jornada recupera sua atenção de dentro pra fora." |
| padrão | "30 dias para reduzir o screen time pela metade e começar a usar o celular — não ser usado por ele." |

---

## Matriz Completa de Match Rápido

Tabela de referência para visualizar padrões de match por objetivo principal.

| Objetivo | Jornada mais provável | Jornada secundária | Raramente recomendadas |
|----------|----------------------|-------------------|----------------------|
| productivity | focus-protocol-l1 | own-mornings-l1 | gym-l1 |
| health | gym-l1 | own-mornings-l1 | finances-l1 |
| mental | digital-detox-l1 | own-mornings-l1 | gym-l1 |
| routine | own-mornings-l1 | finances-l1 | digital-detox-l1 |
| avoid | digital-detox-l1 | focus-protocol-l1 | gym-l1 |

---

## Mapeamento Desafio → Jornada (camada de refinamento)

Quando o objetivo principal não determina claramente o match, os desafios funcionam como desempate.

| Desafio | Jornada mais alinhada | Lógica |
|---------|----------------------|--------|
| procrastination | focus-protocol-l1 | Procrastinação é uma falha de sistema de foco, não de vontade |
| focus | focus-protocol-l1 | Match direto |
| forgetfulness | own-mornings-l1 ou finances-l1 | Rotina matinal reduz esquecimento; finanças requerem sistema |
| tiredness | own-mornings-l1 ou gym-l1 | Cansaço crônico tem raiz em sono ou sedentarismo |
| anxiety | digital-detox-l1 | Ansiedade e consumo digital têm relação bidirecional documentada |
| motivation | gym-l1 | Exercício é o hábito com maior retorno comprovado em dopamina e motivação |

---

## Regras de Desempate

### Situação 1: Duas jornadas com score igual ou muito próximo (diferença ≤ 5 pontos)

Aplicar critério de desempate em cascata:

1. **Urgência emocional:** `years_promising` = "5+years" → prioriza a jornada de maior impacto percebido para aquele perfil
2. **Experiência:** `habit_experience` = "never" → prioriza a jornada mais tangível e de resultado mais visível rapidamente (gym-l1 e own-mornings-l1 têm vantagem aqui)
3. **Energia:** `energy_peak` = "morning" → desempata em favor de own-mornings-l1 se ela estiver no par
4. **Aleatoriedade controlada:** se todos os critérios acima não resolverem, exibir as duas com badge

### Situação 2: Nenhuma jornada atinge 65 pontos

O sistema exibe as **2 de maior score** com o badge, independente do valor. Isso acontece tipicamente com perfis muito equilibrados que não têm sinal dominante claro.

### Situação 3: Uma única jornada domina (score ≥ 80)

O sistema exibe essa jornada com badge e um segundo nível de destaque visual — copy mais forte, card maior ou posição de destaque na lista.

---

## Combinações de Duas Jornadas — Compatibilidade

O usuário pode selecionar até 2 jornadas. Algumas combinações funcionam melhor do que outras. O sistema não bloqueia nenhuma combinação, mas pode adicionar uma nota de compatibilidade.

| Combinação | Compatibilidade | Nota para o usuário |
|------------|----------------|---------------------|
| own-mornings + focus-protocol | Alta | "As duas se alimentam — manhã estruturada cria o ambiente para foco profundo." |
| own-mornings + gym | Alta | "Muita gente treina de manhã. Essas duas se encaixam naturalmente." |
| focus-protocol + digital-detox | Alta | "Foco e detox digital são duas faces do mesmo problema. Combinação poderosa." |
| gym + finances | Média | "Projetos diferentes, sem conflito direto. Exige disciplina pra não deixar um engolir o outro." |
| own-mornings + finances | Média | "Rotina de manhã + controle financeiro. Funciona melhor pra quem já tem alguma base." |
| gym + digital-detox | Média | "Substituir tempo de tela por movimento é uma das combinações mais eficazes." |
| focus-protocol + finances | Média | "Foco e finanças compartilham o mesmo músculo: fazer o que é importante antes do urgente." |
| own-mornings + digital-detox | Alta | "Manhã sem tela é o coração de ambas. Sinergia total." |
| gym + focus-protocol | Baixa | "Duas jornadas de alta exigência de execução. Funciona melhor no nível 'already_have'." |
| finances + digital-detox | Baixa | "Pouca sinergia direta. Não há conflito, mas a atenção fica muito dividida." |

---

## Regra de Compatibilidade por Nível de Experiência

| habit_experience | Combinações recomendadas | Combinações a evitar |
|-----------------|------------------------|---------------------|
| never | own-mornings + qualquer uma leve | gym + focus-protocol juntas |
| tried | Qualquer combinação de média compatibilidade ou alta | finances + digital-detox |
| already_have | Sem restrição | — |

---

## Copy de Contexto por Número de Jornadas Selecionadas

O sistema adapta o copy de confirmação (S12 do onboarding) com base em quantas e quais jornadas foram escolhidas.

### Zero jornadas selecionadas (usuário pulou)

> "Você pode entrar em uma jornada a qualquer momento. Quando estiver pronto, elas vão estar aqui esperando."

*Tom: sem julgamento, sem pressão. A jornada vai aparecer como sugestão recorrente no dashboard.*

### Uma jornada selecionada

> "Ótima escolha. A jornada [nome] começa no Dia 1 — hoje. Cada dia vai ter hábitos específicos esperando por você."

*Tom: confirmação direta, começo imediato.*

### Duas jornadas selecionadas

**Combinação de alta compatibilidade:**
> "[Jornada A] e [Jornada B] funcionam bem juntas. A gente vai equilibrar os hábitos das duas para que uma não prejudique a outra."

**Combinação de média/baixa compatibilidade:**
> "Escolha corajosa. Duas jornadas ao mesmo tempo exige foco. A rotina vai ser montada para que as duas caibam no seu dia sem sobrecarregar."

---

## Regras de Apresentação Visual no S12

### Ordenação dos cards de jornada

1. Jornadas com badge "Recomendada" sempre aparecem primeiro
2. Entre as recomendadas, a de maior score aparece na posição 1
3. As demais jornadas aparecem em ordem de score decrescente
4. Jornadas com score < 20 aparecem por último (sem penalidade visual — apenas posição)

### Estrutura do card de jornada

```
[Badge "Recomendada pra você" — se aplicável]
[Ilustração da jornada]
Nome da jornada
Copy personalizado de uma linha (ver seção "Lógica de copy do badge" acima)
──────────────────────
30 dias  |  Nível 1  |  [Dificuldade]
[Barra de progresso zerada]
```

### Dificuldade por jornada

| Jornada | Dificuldade | Justificativa |
|---------|-------------|---------------|
| own-mornings-l1 | Moderada | Exige mudança de horário de acordar — biologicamente resistente |
| gym-l1 | Moderada-Alta | Requer deslocamento físico e enfrentar intimidação social |
| focus-protocol-l1 | Moderada | Fácil de entender, difícil de manter sob pressão |
| finances-l1 | Baixa-Moderada | Cognitivamente acessível, emocionalmente desafiador |
| digital-detox-l1 | Alta | Enfrenta o comportamento mais reforçado do dia a dia atual |

---

## Nota sobre Jornadas L2

As jornadas de nível 2 não são apresentadas no onboarding. Elas existem como progressão natural após a conclusão do L1 correspondente.

| L1 concluída | L2 disponibilizada |
|-------------|-------------------|
| own-mornings-l1 | Manhã de Alta Performance |
| gym-l1 | Protocolo de Hipertrofia |
| focus-protocol-l1 | Aprendizado Acelerado |
| finances-l1 | Faça Seu Dinheiro Trabalhar |
| digital-detox-l1 | Digital Minimalism |

A transição L1 → L2 é um momento de celebração dentro do app — não apenas um desbloqueio de conteúdo, mas um reconhecimento de que o usuário construiu a base necessária para o próximo nível.

---

## Notas de Implementação

**Cálculo do score:**
O score é calculado no momento em que o usuário chega ao S12 do onboarding. Os dados necessários já estão disponíveis no Supabase (`quiz_responses` via lookup por email + dados coletados nos steps S4-S7 armazenados temporariamente no contexto do onboarding).

**Armazenamento do score:**
O score calculado para cada jornada pode ser armazenado na tabela `profiles` ou em uma tabela própria `journey_recommendations` para uso futuro — por exemplo, para reapresentar jornadas não selecionadas como sugestão no dashboard.

**Atualização do match:**
Se o usuário alterar seus objetivos ou desafios dentro do app após o onboarding, o sistema deve recalcular os scores e atualizar as sugestões de jornada no perfil.

**Copy dinâmico do badge:**
O campo de uma linha dentro do card (copy personalizado) é gerado dinamicamente com base no sinal dominante identificado pelo sistema de score. Prioridade: o sinal que gerou mais pontos para aquela jornada específica naquele perfil.

**Fallback de copy:**
Se nenhum sinal dominante for identificado (scores muito distribuídos), usar o copy "padrão" definido em cada seção acima.
