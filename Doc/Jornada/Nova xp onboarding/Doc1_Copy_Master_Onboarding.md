# Doc 1 — Copy Master do Onboarding
## Bora App — Novo Fluxo de Onboarding
**Versão 1.0 — Março 2026**

---

## Diretrizes de Tom e Voz

**Como o Bora fala:**
Direto, mas humano. Confiante, mas sem arrogância. Parece um amigo que realmente sabe o que está fazendo — não um app tentando vender algo. A copy nunca explica demais. Ela convida.

**O que evitar:**
- Listas de features ou benefícios genéricos
- Linguagem técnica ou corporativa
- Frases com "potencialize", "maximize", "transforme sua vida"
- Emojis
- Entusiasmo exagerado que soa falso

**Variáveis dinâmicas disponíveis (vêm do quiz da landing page):**
- `[nome]` — nome do usuário
- `[objetivo]` — objetivo principal (ver mapeamento abaixo)
- `[desafio_principal]` — primeiro desafio selecionado
- `[tempo_disponivel]` — tempo disponível por dia
- `[energia]` — período de pico de energia
- `[profissao]` — situação profissional
- `[anos_prometendo]` — há quanto tempo promete mudar

**Mapeamento de objetivos para copy:**
- productivity → "ser mais produtivo"
- health → "cuidar do corpo"
- mental → "ter mais equilíbrio"
- routine → "criar uma rotina que funcione"
- avoid → "parar com o que te trava"

---

## FASE 0 — Entrada e Apresentação

---

### S0 — Boas-vindas pelo nome

**Contexto:** Primeira tela. Fullscreen. Ilustração animada. O app já sabe quem é o usuário.

**Título:**
Oi, [nome].

**Subtítulo:**
Você chegou.

**Copy de suporte:**
Preparamos tudo para você. Vai levar só alguns minutos e, quando terminar, sua rotina já vai estar pronta.

**CTA:**
Vamos lá

---

**Variação quando nome não está disponível:**

**Título:**
Bem-vindo ao Bora.

**Subtítulo:**
Antes de começar, como você se chama?

**Input placeholder:**
Seu nome

**CTA:**
Esse é o meu nome

---

### S1 — O que esperar

**Contexto:** Segunda tela. Não é lista de features. É uma promessa emocional em forma de narrativa curta. Visual limpo, sem bullets, sem ícones genéricos.

**Título:**
Aqui é diferente.

**Copy:**
A maioria das pessoas tenta criar hábitos no improviso. Anota numa lista, tenta se lembrar, desiste em duas semanas.

O Bora funciona de outro jeito. A gente monta uma rotina real, feita para o seu dia, e vai do seu lado enquanto você executa.

Não é motivação. É estrutura.

**CTA:**
Entendi, continuar

---

### S2 — Confirmação do objetivo

**Contexto:** O app já sabe o objetivo do quiz. Confirma com o usuário antes de avançar. Pré-selecionado com o que veio do Supabase.

**Título:**
Você disse que quer [objetivo].

**Subtítulo:**
Ainda é isso que você está buscando?

**Copy de suporte (abaixo dos cards):**
Pode mudar. A gente ajusta tudo.

**Cards de objetivo (label + descrição curta):**

Ser mais produtivo
Foco, tempo bem usado e menos procrastinação.

Cuidar do corpo
Movimento, energia e consistência física.

Ter mais equilíbrio
Menos ansiedade, mais clareza mental.

Criar uma rotina que funcione
Estrutura real no dia a dia.

Parar com o que me trava
Eliminar hábitos que sabotam o que você quer.

**CTA:**
Isso mesmo, continuar

---

### S3 — Instalar o App (tom leve)

**Contexto:** Recomendação de instalação do PWA. Tom de convite, não obrigação. Aparece antes de qualquer configuração de rotina.

**Título:**
Uma coisa antes de continuar.

**Copy:**
O Bora é um aplicativo que funciona direto pelo celular, sem precisar baixar pela loja. Mas para ter a experiência completa — notificações, acesso rápido, tudo funcionando certo — vale adicionar à sua tela inicial agora.

Leva menos de 30 segundos.

**Tutorial visual (por plataforma):**

iOS:
Toque em Compartilhar na barra do Safari, depois em "Adicionar à Tela Início".

Android:
Toque nos três pontinhos do Chrome e selecione "Adicionar à tela inicial".

**CTA primário:**
Instalar agora

**CTA secundário (menor, sem destaque):**
Fazer isso depois

---

## FASE 1 — Coleta Enriquecida

---

### S4 — Horário de acordar e dormir

**Contexto:** Dois seletores de horário em linha do tempo visual. Determina os blocos de tempo disponíveis para hábitos.

**Título:**
Como é o seu dia, no geral?

**Subtítulo:**
A gente vai encaixar os hábitos nos seus horários livres, não disputar com eles.

**Label seletor 1:**
Você costuma acordar às...

**Label seletor 2:**
E dormir por volta das...

**Microcopy abaixo:**
Não precisa ser exato. Uma estimativa já ajuda bastante.

**CTA:**
Continuar

---

### S5 — Dias úteis vs fim de semana

**Contexto:** Pergunta se a rotina de semana é diferente do fim de semana. Se sim, coleta disponibilidade separada.

**Título:**
Seu fim de semana é parecido com a semana?

**Cards de resposta:**

Bastante parecido
Minha rotina não muda muito.

Bem diferente
Tenho muito mais tempo livre.

Depende muito
Às vezes sim, às vezes não.

**Copy de transição (se escolher "Bem diferente" ou "Depende muito"):**
Ótimo. Vamos montar uma rotina diferente para cada período, então. Mais leve no fim de semana, mais focada durante a semana.

**CTA:**
Continuar

---

### S6 — Áreas da vida

**Contexto:** Multi-select. Cards com ilustração simples. Complementa o objetivo principal.

**Título:**
O que mais importa pra você agora?

**Subtítulo:**
Escolha as áreas que você quer trabalhar. Pode marcar mais de uma.

**Cards:**

Trabalho e produtividade
Render mais, procrastinar menos.

Saúde física
Movimento, sono e energia no dia a dia.

Mente e emoções
Foco, calma e clareza mental.

Relacionamentos
Tempo de qualidade com quem importa.

**Validação:** mínimo 1, máximo 4

**Microcopy abaixo:**
Esses dados ajudam a montar uma rotina que realmente caiba na sua vida.

**CTA:**
Continuar

---

### S7 — Experiência com hábitos

**Contexto:** Calibra dificuldade e quantidade de hábitos gerados. Tom sem julgamento.

**Título:**
Como você se relaciona com hábitos hoje?

**Cards:**

Nunca mantive nenhum de verdade
Sempre começo, mas não dura.

Já tentei, mas não chegou longe
Alguns funcionaram por um tempo.

Já tenho alguns, quero ir além
Quero melhorar o que já existe.

**Microcopy abaixo:**
Não existe resposta errada. Isso só muda como a gente monta sua rotina.

**CTA:**
Continuar

---

## FASE 2 — Rotina Gerada

---

### S8 — Loading personalizado

**Contexto:** Animação de 4 a 5 segundos. Mensagens dinâmicas que aparecem em sequência. Depoimento rotativo ao fundo, discreto.

**Mensagens dinâmicas (sequência):**
Cruzando seu perfil...
Mapeando seus horários livres...
Separando semana do fim de semana...
Ajustando para [objetivo]...
Sua rotina está pronta.

**Depoimentos rotativos (fundo, menor, discretos):**

"Em 21 dias, consegui manter os hábitos sem precisar me lembrar. Virou automático."
— Mariana, 24

"Nunca pensei que uma rotina de manhã fosse possível pra mim. No Bora funcionou."
— Lucas, 28

"A diferença foi ter algo concreto para seguir. Sem adivinhação."
— Rafael, 31

---

### S9 — Preview da Rotina

**Contexto:** A tela mais importante do onboarding. Cards arrastáveis. Hábitos separados por período e por dias da semana quando relevante.

**Título:**
Essa é a sua rotina.

**Subtítulo:**
Montamos [X] hábitos baseados no que você nos contou. Você pode arrastar, remover ou ajustar qualquer um.

**Cabeçalhos de período:**
Manhã
Tarde
Noite

**Card de hábito (estrutura):**
Nome do hábito
Duração estimada
Horário sugerido
Toggle de ativar/remover

**Abas de dia (quando semana diferente de fim de semana):**
Dias úteis     Fim de semana

**Microcopy no rodapé:**
Isso não é definitivo. Você pode editar a qualquer momento dentro do app.

**CTA:**
Gostei, continuar

**Link secundário:**
Editar mais tarde

---

### S10 — Confirmação da Rotina

**Contexto:** Resumo compacto antes de confirmar. Cria senso de conquista.

**Título:**
Pronto. Essa é a sua rotina, [nome].

**Resumo dinâmico:**
[X] hábitos por dia
[Y] dias por semana
Cerca de [Z] minutos no total

**Copy:**
Parece pouco? É proposital. Consistência não é sobre fazer muito. É sobre nunca parar.

**CTA:**
Confirmar minha rotina

---

## FASE 3 — Jornadas

---

### S11 — O que são as Jornadas

**Contexto:** Tela de impacto apresentando o conceito. Visual de card de missão com barra de progresso zerada.

**Título:**
Agora, um nível acima.

**Copy:**
Além da sua rotina diária, o Bora tem as Jornadas. São missões de 30 dias com hábitos específicos para um objetivo bem definido.

Cada dia você avança um passo. No fim do mês, você olha para trás e não acredita onde está.

A rotina é o que você faz todos os dias. A Jornada é o que vai te levar para outro nível.

**CTA:**
Ver as jornadas disponíveis

---

### S12 — Seleção de Jornada

**Contexto:** 5 jornadas L1. Badge "Recomendada pra você" nas que batem com o perfil. Pode selecionar até 2 ou pular.

**Título:**
Escolha sua missão.

**Subtítulo:**
Selecionamos as mais indicadas para o seu perfil. Você pode entrar em até 2 ao mesmo tempo.

**Badge de recomendação (nas cards relevantes):**
Recomendada para você

**Estrutura do card de jornada:**
Nome da jornada
Descrição em uma linha
30 dias     Nível 1
Barra de progresso zerada

**Microcopy abaixo da seleção:**
Você pode entrar em novas jornadas depois, mas os resultados chegam mais rápido quando você começa desde o dia 1.

**CTA:**
Entrar nessa jornada

**CTA secundário (quando nenhuma selecionada):**
Pular por enquanto

---

## FASE 4 — Setup Técnico

---

### S13 — Instalar o App (tom direto)

**Contexto:** Aparece apenas se o usuário não instalou no S3. Tom mais urgente, mas sem ser agressivo.

**Título:**
Você ainda não instalou o app.

**Copy:**
Sem a instalação, você não vai receber lembretes. E sem lembretes, a chance de esquecer os hábitos nos primeiros dias é alta.

Leva 30 segundos. Vale muito a pena.

**Tutorial visual (por plataforma, igual ao S3):**

iOS:
Toque em Compartilhar no Safari e depois em "Adicionar à Tela Início".

Android:
Toque nos três pontinhos do Chrome e selecione "Adicionar à tela inicial".

**CTA primário:**
Instalar agora

**CTA secundário (muito pequeno e sem destaque):**
Continuar sem instalar

---

### S14 — Ativar Notificações

**Contexto:** Só aparece após confirmação de instalação. Framing de benefício, não permissão.

**Título:**
A última peça.

**Copy:**
Quer que a gente te avise na hora certa de cada hábito? Os usuários que ativam lembretes têm quase o dobro de consistência nos primeiros 30 dias.

**CTA:**
Ativar lembretes

**CTA secundário:**
Agora não

---

**Variação — usuário não instalou o PWA:**

**Título:**
Para ativar os lembretes, você precisa instalar o app primeiro.

**Copy:**
As notificações só funcionam depois que o Bora estiver na sua tela inicial.

**CTA:**
Instalar o app agora

---

## FASE 5 — Tour do App

**Contexto geral:** App visível ao fundo, escurecido. Spotlight iluminado sobre a feature. Tooltip posicionado abaixo ou acima da área em destaque. Navegação por toque em qualquer lugar da tela.

**Indicador de progresso:** 1 de 5 / 2 de 5 / etc.

---

### S15 — Spotlight: Hoje (Dashboard)

**Título da tooltip:**
Aqui começa o dia.

**Copy:**
Todos os seus hábitos do dia ficam aqui. Um toque para marcar como feito. Simples assim.

**CTA:**
Próximo

---

### S16 — Spotlight: Jornadas

**Título da tooltip:**
Sua missão de 30 dias.

**Copy:**
Cada dia da sua jornada tem hábitos específicos esperando por você. É aqui que você acompanha o progresso.

**CTA:**
Próximo

---

### S17 — Spotlight: Hábitos

**Título da tooltip:**
A sua rotina, do seu jeito.

**Copy:**
Adicione, edite ou reorganize seus hábitos quando quiser. A rotina é sua, o Bora só ajuda a manter.

**CTA:**
Próximo

---

### S18 — Spotlight: Avatar

**Título da tooltip:**
Você evolui de verdade aqui.

**Copy:**
A cada hábito completado, seu avatar avança. É uma forma de ver, de forma visual, quem você está se tornando.

**CTA:**
Próximo

---

### S19 — Spotlight: Bônus

**Título da tooltip:**
Tem mais coisa aqui dentro.

**Copy:**
Livros recomendados, meditações guiadas e conteúdos para quem quer ir além. Disponíveis sempre que você quiser.

**CTA:**
Terminar tour

---

## FASE 6 — Celebração

---

### S20 — Celebração Final

**Contexto:** Animação de confetti ou check animado. Auto-redireciona após 3 segundos ou com toque.

**Título:**
Tudo pronto, [nome].

**Copy:**
Sua rotina está criada. Sua jornada está ativa. Tudo o que falta agora é o primeiro hábito.

**Resumo dinâmico:**
[X] hábitos criados
[Nome da jornada] iniciada
Lembretes ativados

*(Adapta para o que foi realmente configurado pelo usuário)*

**CTA:**
Começar o Dia 1

*(Redireciona para o Day 1 da jornada selecionada ou para o dashboard)*

---

## Notas de Implementação

**Sobre as variáveis dinâmicas:**
Todos os campos marcados com `[colchetes]` devem ser preenchidos com dados do Supabase (`quiz_responses` via lookup por email no momento do primeiro acesso). Quando um campo não estiver disponível, usar as variações de fallback indicadas em cada step.

**Sobre os CTAs secundários:**
CTAs secundários devem ter hierarquia visual claramente menor que o CTA principal. Nunca o mesmo peso tipográfico ou de cor.

**Sobre as telas de loading:**
As mensagens dinâmicas do S8 devem aparecer em sequência com fade in/out suave. Não mostrar todas ao mesmo tempo.

**Sobre o tour (S15-S19):**
O toque fora da tooltip deve avançar para o próximo spotlight. O botão "Próximo" é reforço, não única forma de avançar.
