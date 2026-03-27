# Doc 2 — Matriz de Personalização de Rotina (v2.0)
## Bora App — Sistema de Geração de Rotinas Inteligentes
**Versão 2.0 — Março 2026**

---

## Fundamento Científico: Por que a Rotina Não Pode Ser Igual Todos os Dias

A versão anterior deste documento tratava a semana como um bloco uniforme. A ciência aponta o contrário.

**Problema com uniformidade total:** Repetição idêntica dia após dia cria adaptação neural e, depois, tédio comportamental. A pesquisa de Gloria Mark (UC Irvine) mostra que o cérebro não responde bem a estímulos completamente previsíveis — há uma queda progressiva de engajamento após 2-3 semanas de rotina idêntica.

**Solução: Periodização de Hábitos.** Conceito adaptado da ciência do esporte (undulating periodization): a variação planejada de intensidade, tipo e foco ao longo da semana previne estagnação, mantém engajamento e produz adaptação contínua. Estudo do Journal Nature Neuroscience confirma que adicionar variedade à rotina diária aumenta atividade cerebral e bem-estar subjetivo.

**A estrutura correta combina três tipos de hábitos:**

```
HÁBITOS ÂNCORA     → Aparecem todos os dias. São a espinha dorsal.
                     Curtos, automáticos, criam o senso de continuidade.

HÁBITOS DIRIGIDOS  → Aparecem em dias específicos com propósito definido.
                     Cada dia da semana tem uma "energia" diferente.
                     Segunda = lançamento. Quarta = reset. Sexta = colheita.
                     Sábado = expansão. Domingo = preparação.

HÁBITOS RITMO      → Semanais ou bi-semanais. Rituais mais longos.
                     Revisões, planejamentos, práticas profundas.
                     Criam marcos e senso de progressão no tempo.
```

---

## Variáveis de Input

### Do quiz da landing page (quiz_responses no Supabase)

| Campo | Valores |
|-------|---------|
| `name` | string |
| `objective` | productivity / health / mental / routine / avoid |
| `challenges` | array: procrastination / focus / forgetfulness / tiredness / anxiety / motivation |
| `energy_peak` | morning / afternoon / evening |
| `time_available` | 5min / 15min / 30min / 1h |
| `profession` | student / employed / entrepreneur / freelancer / other |
| `age_range` | 18-24 / 25-34 / 35-44 / 45-54 / 55+ |
| `gender` | male / female / other / prefer_not |
| `years_promising` | <1year / 1-2years / 3-5years / 5+years |
| `consistency_feeling` | frustrated / avoiding / resigned / determined / fine |

### Coletadas no onboarding (S4–S7)

| Campo | Valores |
|-------|---------|
| `wake_time` | ex: 06:00 / 07:30 / 09:00 |
| `sleep_time` | ex: 22:00 / 23:30 / 01:00 |
| `weekend_diff` | same / different / varies |
| `life_areas` | array: work / physical / mind / relationships |
| `habit_experience` | never / tried / already_have |

---

## As 7 Camadas do Sistema

```
CAMADA 1 — Objetivo         → hábitos CORE (base inegociável)
CAMADA 2 — Desafios         → hábitos de SUPORTE cirúrgico
CAMADA 3 — Áreas da vida    → hábitos COMPLEMENTARES
CAMADA 4 — Experiência      → QUANTIDADE e DIFICULDADE
CAMADA 5 — Ritmo Semanal    → DISTRIBUIÇÃO por energia de cada dia
CAMADA 6 — Horários         → ALOCAÇÃO por períodos do dia
CAMADA 7 — Perfil profissão → ADAPTAÇÃO ao contexto de vida
```

---

## CAMADA 1 — Biblioteca de Hábitos Core por Objetivo

Cada objetivo gera um conjunto de hábitos core. A inovação está em como eles se distribuem pela semana — não todos os dias, não sempre igual.

---

### OBJETIVO: PRODUCTIVITY

**Perfil:** Sabe o que precisa fazer mas se perde entre urgências, distrações e a distância entre intenção e execução.

---

**[ÂNCORA-PROD-01] Definição das 3 Prioridades**
Todos os dias (dias úteis)
Duração: 8 min | Período: Manhã, logo ao iniciar o trabalho
O dia começa com uma única pergunta: "O que precisa acontecer hoje para que eu sinta que o dia valeu?" Não uma lista — três itens. Escritos. Antes de abrir qualquer mensagem.
*Mecanismo: ativa o modo intencional antes do modo reativo. A decisão tomada de manhã cedo custa menos energia cognitiva do que a mesma decisão às 15h.*

**[ÂNCORA-PROD-02] Desligamento Intencional**
Todos os dias (dias úteis)
Duração: 8 min | Período: Final do expediente
Ao encerrar o trabalho: fechar todas as abas, anotar o que fica pendente, escrever a primeira tarefa de amanhã. O cérebro só descansa de verdade quando sente que as coisas estão "guardadas" em algum lugar seguro fora da cabeça.
*Mecanismo: o Efeito Zeigarnik — tarefas incompletas ocupam memória de trabalho mesmo durante o descanso. Externalizar elimina essa carga.*

---

**[DIRIGIDO-PROD-MON] Segunda-feira: Lançamento da Semana**
Aparece: Segunda-feira
Duração: 15 min | Período: Manhã
Uma visão rápida da semana: o que precisa ser entregue, quais são os compromissos fixos, qual é o "grande projeto" da semana. Não é planejamento detalhado — é orientação de trajetória. Como um piloto que olha o mapa antes de decolar.

**[DIRIGIDO-PROD-QUA] Quarta-feira: Diagnóstico de Meio de Semana**
Aparece: Quarta-feira
Duração: 10 min | Período: Final da tarde
Metade da semana passou. Uma pergunta honesta: "Estou no caminho?" Não para cobrar — para ajustar. Se segunda a gente planeja, quarta a gente corrige. Quem só revisa na sexta já perdeu metade da semana reagindo.

**[DIRIGIDO-PROD-SEX] Sexta-feira: Colheita da Semana**
Aparece: Sexta-feira
Duração: 12 min | Período: Final do expediente
Antes de fechar o trabalho na sexta: o que foi entregue? O que não saiu como planejado? Uma coisa que eu aprendi essa semana. Isso não é avaliação de desempenho — é coleta de aprendizado. Quem não registra repete os mesmos erros.

---

**[VARIANTE-PROD-A] Bloco de Foco Profundo**
Segunda, Terça, Quinta (dias de alta produção)
Duração: 90 min | Período: Pico de energia (Camada 6)
90 minutos de trabalho em uma única tarefa. Sem celular no ambiente, sem notificações, sem multitarefa. O objetivo não é trabalhar mais — é trabalhar sem fragmentar a atenção. Um bloco de 90 min de foco vale mais que 4 horas de trabalho interrompido.
*Mecanismo: cada interrupção digital custa ~23 min para recuperar o foco total. 20 interrupções = 7+ horas perdidas por semana.*

**[VARIANTE-PROD-B] Bloco de Fluxo Criativo**
Quarta, Sexta (dias de energia diferente)
Duração: 45 min | Período: Pico de energia
Tarefas que exigem pensamento lateral, criação, síntese — não execução pura. Diferente do bloco de foco, aqui pode haver movimento entre ideias. Sem timer fixo — para quando o pensamento se esgotar naturalmente.

---

**[RITMO-PROD-DOM] Domingo: Preparação da Semana**
Aparece: Domingo
Duração: 20 min | Período: Tarde ou noite
A semana mais produtiva começa no domingo. 20 minutos para: revisar compromissos da próxima semana, definir os 3 projetos mais importantes, e separar mentalmente o que é prioridade do que é ruído. Quem entra na segunda sem essa clareza passa a semana reagindo.

---

### OBJETIVO: HEALTH

**Perfil:** Oscila entre motivação intensa e abandono completo. O corpo quer se mover mas a mente encontra mil razões para adiar.

---

**[ÂNCORA-HEALTH-01] Água ao Acordar**
Todos os dias
Duração: 2 min | Período: Imediatamente ao acordar
500ml de água antes de qualquer outra coisa — antes do café, antes do celular, antes de qualquer decisão. O corpo perde entre 1L e 1,5L de água durante o sono. Essa reposição melhora memória de trabalho e velocidade de raciocínio já na primeira hora.

**[ÂNCORA-HEALTH-02] Exposição à Luz Natural**
Todos os dias
Duração: 12 min | Período: Primeiros 45 min após acordar
12 minutos ao ar livre, sem óculos escuros. Pode ser no quintal, na varanda ou numa caminhada rápida. Janela fechada não conta. A luz natural regula o cortisol, ajusta o relógio circadiano e prepara o corpo para dormir melhor 16 horas depois.

---

**[DIRIGIDO-HEALTH-SEG] Segunda e Quinta: Treino de Force**
Aparece: Segunda + Quinta
Duração: 45 min | Período: Pico de energia ou tarde
Treino de força — academia, funcional, peso corporal em casa. O mesmo protocolo nas duas sessões cria consistência sem monotonia. Segunda reinicia o ritmo semanal; quinta mantém o momentum quando a semana já cansa.

**[DIRIGIDO-HEALTH-TER] Terça e Sexta: Movimento Leve**
Aparece: Terça + Sexta
Duração: 25 min | Período: Qualquer
Caminhada, mobilidade, yoga, natação leve — qualquer movimento que não exige esforço máximo. Terça vem logo após o treino de segunda para manter o corpo em movimento sem sobrecarregar. Sexta sinaliza o fim da semana de treino com algo agradável.
*Mecanismo: exercício leve em dias alternados aumenta a recuperação e mantém consistência de 4x/semana — o limiar identificado por pesquisadores da Universidade de Victoria para formação do hábito de exercício.*

**[DIRIGIDO-HEALTH-QUA] Quarta-feira: Dia de Escuta do Corpo**
Aparece: Quarta-feira
Duração: 15 min | Período: Manhã
Sem treino. Uma caminhada de 15 minutos focada em observar como o corpo está — nível de energia, tensão muscular, qualidade do sono. Não é descanso passivo — é consciência corporal ativa. O dado mais importante para ajustar o treino da semana vem de dentro.

**[DIRIGIDO-HEALTH-SAB] Sábado: Movimento Prazeroso**
Aparece: Sábado
Duração: 40-60 min | Período: Qualquer
Não é treino. É movimento que você escolheria fazer mesmo sem um app pedindo. Pode ser trilha, futebol com amigos, surf, dança, bike — qualquer coisa que o corpo goste por si só. A longo prazo, hábitos que têm prazer intrínseco têm 3x mais chance de persistir.

**[DIRIGIDO-HEALTH-DOM] Domingo: Preparação do Corpo para a Semana**
Aparece: Domingo
Duração: 20 min | Período: Noite
Alongamento completo + hidratação reforçada + verificação do sono da última semana. É um ritual de "manutenção" — preparar o corpo para a intensidade que vem. Quem cuida do corpo no domingo começa a segunda com 30% mais energia subjetiva.

---

**[RITMO-HEALTH-SONO] Ritual de Sono (diário, mas diferente no fim de semana)**
Todos os dias — versão expandida no fim de semana
Duração: 10 min (dias úteis) / 20 min (fim de semana)
Nos dias úteis: tela desligada 45 min antes de dormir + temperatura do quarto ajustada + nada de trabalho após o Desligamento Intencional.
Nos fins de semana: adiciona 10 min de leitura física (não tela) + reflexão livre sobre a semana.

---

### OBJETIVO: MENTAL

**Perfil:** A cabeça trabalha em overdrive. Ansiedade não é patológica, mas é constante — uma voz de fundo que nunca desliga completamente.

---

**[ÂNCORA-MENT-01] Descarga Mental Matinal**
Todos os dias
Duração: 10 min | Período: Manhã, antes de qualquer tela
Escrever livremente tudo que está na cabeça ao acordar — preocupações, pensamentos, fragmentos de sonho, planos, medos. Sem estrutura, sem revisão, sem julgamento. É como tirar o lixo da mente antes de começar o dia.
*Mecanismo: "Morning Pages" de Julia Cameron têm suporte empírico para redução de ruminação. Externalizar pensamentos reduz sua carga cognitiva porque o cérebro pode "liberar" o que foi registrado.*

**[ÂNCORA-MENT-02] Pausa de Respiração**
Todos os dias (3x por dia)
Duração: 90 segundos por vez | Período: Manhã + Tarde + Antes de dormir
Três respirações lentas e intencionais: 4 segundos inspirando, 4 retendo, 6 expirando. Antes de começar o trabalho, no meio do dia, e antes de dormir. Rápido demais para ignorar, eficaz o suficiente para mudar o estado nervoso em segundos.

---

**[DIRIGIDO-MENT-SEG] Segunda: Intenção da Semana**
Aparece: Segunda-feira
Duração: 8 min | Período: Manhã
Uma palavra ou frase que define como você quer se sentir essa semana — não o que quer fazer, mas como quer estar. "Presente". "Sereno". "Focado sem pressa". Isso funciona como âncora psicológica: quando a semana começa a sair do trilho, você tem um ponto de retorno.

**[DIRIGIDO-MENT-TER] Terça e Quinta: Janela de Preocupação**
Aparece: Terça + Quinta
Duração: 15 min | Período: Final da tarde (nunca próximo de dormir)
Um horário fixo para se preocupar intencionalmente. Anotar o que está pesando, pensar no pior cenário realista, escrever uma resposta possível. Fora desse horário, quando a ansiedade aparecer, a instrução interna é: "isso vai para as 18h." Não reprime — adia de forma estruturada.
*Mecanismo: técnica de "worry postponement" da TCC com eficácia demonstrada em redução de ansiedade generalizada.*

**[DIRIGIDO-MENT-QUA] Quarta: Silêncio Completo**
Aparece: Quarta-feira
Duração: 15 min | Período: Tarde
15 minutos sem fazer nada. Sem áudio, sem leitura, sem celular. Sentado ou deitado. O único hábito que é, por definição, ausência de estímulo. O cérebro processa e consolida durante o não-fazer — é quando conexões novas se formam.

**[DIRIGIDO-MENT-SEX] Sexta: Reconhecimento Semanal**
Aparece: Sexta-feira
Duração: 10 min | Período: Noite
Responder três perguntas por escrito: O que funcionou essa semana? O que foi difícil mas eu fiz mesmo assim? Uma coisa pela qual sou grato. O cérebro tem viés negativo natural — a semana sempre parece menor do que foi. Esse hábito recalibra.

**[DIRIGIDO-MENT-SAB] Sábado: Tempo Não-Estruturado Intencional**
Aparece: Sábado
Duração: 60 min | Período: Qualquer (bloco reservado, mas conteúdo livre)
Uma hora sem agenda. Pode ser qualquer coisa que o "eu sem obrigações" escolheria — não necessariamente produtivo, não necessariamente útil. A diferença de um momento aleatório de tela: é intencional e offline. O descanso real acontece na ausência de exigência cognitiva.

**[DIRIGIDO-MENT-DOM] Domingo: Carta para a Próxima Semana**
Aparece: Domingo
Duração: 10 min | Período: Noite
Escrever 3-5 linhas para o "eu de segunda-feira" — o que você quer que ele lembre, o que você quer que ele sinta, o que é importante não esquecer. Parece exótico; funciona porque cria um contrato psicológico com o futuro sem a pressão de planejamento formal.

---

### OBJETIVO: ROUTINE

**Perfil:** O dia passa e a sensação é de ter apagado incêndio, não de ter construído algo. Quer estrutura mas nunca encontrou um sistema que dure.

---

**[ÂNCORA-ROUT-01] Sequência de Abertura do Dia**
Todos os dias
Duração: 15 min | Período: Imediatamente ao acordar
A mesma sequência de 4 ações todo dia, na mesma ordem imutável. Exemplo: (1) água → (2) 5 min de luz natural → (3) cama arrumada → (4) café. O conteúdo pode variar levemente; a sequência não. O cérebro automatiza sequências muito mais rápido que ações isoladas.
*Mecanismo: habit stacking — encadear hábitos cria uma única âncora neural para toda a sequência.*

**[ÂNCORA-ROUT-02] Preparação Noturna**
Todos os dias (noite anterior)
Duração: 10 min | Período: Noite
10 minutos antes de dormir para preparar o dia seguinte: roupa separada, bolsa/mochila pronta, 3 itens do dia escritos num papel. Quem prepara a manhã na noite anterior começa o dia com 40% menos decisões logo cedo — e decisões custam energia.

---

**[DIRIGIDO-ROUT-SEG] Segunda: Arquitetura da Semana**
Aparece: Segunda-feira
Duração: 20 min | Período: Manhã
Distribuir as tarefas importantes pelos dias da semana — não criar uma lista infinita, mas decidir "isso vai acontecer na quarta". Criar blocos de tempo no calendário para o que importa. Quem não agenda, deixa o importante competir com o urgente — e o urgente sempre ganha.

**[DIRIGIDO-ROUT-TER] Terça: Dia de Execução Pura**
Aparece: Terça-feira
Não há hábito adicional — a terça é designada como "dia de fazer, não de planejar". O hábito aqui é a ausência de meta-trabalho: sem reorganizar listas, sem revisar planos. Só executar o que foi decidido na segunda.

**[DIRIGIDO-ROUT-QUA] Quarta: Limpeza e Ordem**
Aparece: Quarta-feira
Duração: 15 min | Período: Qualquer
Quarta é o ponto de equilíbrio da semana — ideal para cuidar do ambiente físico. 15 minutos para deixar o espaço de trabalho organizado, limpar o que acumulou desde segunda, recolocar coisas no lugar. Ambiente desorganizado aumenta cortisol e diminui foco — isso é mensurável.

**[DIRIGIDO-ROUT-QUI] Quinta: Revisão de Meio do Mês / Semana**
Aparece: Toda quinta alternada (quinzena)
Duração: 20 min | Período: Final da tarde
Não é revisão diária — é uma olhada mais longa. As semanas estão sendo produtivas? O mês está caminhando? Algo precisa mudar? A maioria das pessoas só percebe que um mês foi perdido quando ele acaba. Revisão quinzenal corrige antes.

**[DIRIGIDO-ROUT-DOM] Domingo: Reset Completo**
Aparece: Domingo
Duração: 30 min | Período: Tarde
O hábito semanal mais importante para quem quer ter rotina. Não é só planejar — é também fechar o ciclo da semana que passou. Verificar o que foi feito, o que não foi, o que precisa ser carregado. Uma semana com reset no domingo é 60% mais consistente que uma sem.

---

### OBJETIVO: AVOID

**Perfil:** Conhece o inimigo — celular, procrastinação, alimentação, redes sociais. O problema não é falta de consciência. É o comportamento automático que chega antes da consciência.

---

**[ÂNCORA-AVOI-01] Registro do Dia**
Todos os dias
Duração: 3 min | Período: Noite
Uma linha por dia: o comportamento-alvo aconteceu ou não? Se aconteceu: em que circunstância? Não para punir — para encontrar o padrão. Em 7 dias, o padrão aparece com precisão cirúrgica.

**[ÂNCORA-AVOI-02] Fricção Deliberada (Revisão Diária do Ambiente)**
Todos os dias
Duração: 5 min | Período: Noite (preparo para o dia seguinte)
Verificar se o ambiente está configurado contra o comportamento a eliminar: celular fora do quarto? App deletado da tela inicial? Snack fora da vista? Não é força de vontade — é design de ambiente. Cada passo extra entre você e o comportamento reduz a probabilidade em ~30%.

---

**[DIRIGIDO-AVOI-SEG] Segunda: Contrato Semanal**
Aparece: Segunda-feira
Duração: 5 min | Período: Manhã
Uma declaração escrita de intenção para essa semana específica — não vaga, mas concreta: "Esta semana, vou limitar [comportamento] a [janela específica]." Pesquisa de Peter Gollwitzer sobre "implementation intentions" mostra que declarações do tipo "quando X acontecer, farei Y" têm 2-3x mais eficácia que intenções abertas.

**[DIRIGIDO-AVOI-TER] Terça e Quinta: Substituição Planejada**
Aparece: Terça + Quinta
Duração: 10 min | Período: No horário do gatilho habitual
No horário em que o comportamento normalmente ocorre, executar o comportamento substituto planejado. Não "vou parar" — "quando sentir vontade de [X], vou fazer [Y] por 10 minutos." Comportamentos não morrem por repressão; são substituídos por algo que satisfaz a mesma necessidade.

**[DIRIGIDO-AVOI-QUA] Quarta: Auditoria do Padrão**
Aparece: Quarta-feira
Duração: 8 min | Período: Noite
Com 3 dias de dados do registro diário, olhar para o padrão: em que horário o comportamento ocorre mais? Qual emoção antecede? Qual ambiente facilita? Essa análise de meio de semana é mais valiosa do que qualquer revisão semanal porque ainda há tempo de ajustar.

**[DIRIGIDO-AVOI-SEX] Sexta: Janela de Permissão**
Aparece: Sexta-feira
Duração: Variável (janela de 1h)
Sexta à noite, o comportamento que a pessoa quer eliminar tem permissão explícita por 1 hora — sem culpa, sem resistência. Não é falha — é parte do sistema. A técnica de "scheduled indulgence" da psicologia comportamental mostra que proibição total cria rebeldia interna; permissão controlada reduz o apelo do comportamento ao longo do tempo.

**[DIRIGIDO-AVOI-DOM] Domingo: Revisão Semanal de Consistência**
Aparece: Domingo
Duração: 10 min | Período: Tarde
Com 7 dias de registros: qual foi a frequência do comportamento essa semana vs. a semana anterior? A tendência está caindo? Não precisa ser perfeito — precisa ser menor que semana passada. Progresso mensurável é o combustível mais eficaz para manutenção de mudança comportamental.

---

## CAMADA 2 — Hábitos de Suporte por Desafio (Cirúrgicos)

Adicionados com base nos desafios do quiz. Não são genéricos — cada um resolve um mecanismo específico do problema declarado.

---

### PROCRASTINAÇÃO

**[SUPP-PROC-01] O Próximo Passo Físico**
Aparece: Dias úteis, antes do bloco de trabalho
Duração: 2 min
Antes de qualquer tarefa importante: escrever fisicamente a primeira ação concreta. Não "trabalhar no relatório" — "abrir o arquivo e escrever o título". O cérebro trava na abstração; age na concretude. Definir o próximo passo físico reduz a barreira de entrada para quase zero.

**[SUPP-PROC-02] Negociação de 5 Minutos**
Aparece: Qualquer dia em que houver resistência
Duração: 5 min (porta de entrada)
Quando o travamento aparecer, a negociação é: "Só 5 minutos. Depois posso parar de verdade." Na maioria das vezes, após 5 minutos o cérebro entra em estado de execução e continua sozinho. O problema quase nunca é a tarefa — é o início dela.

---

### FOCO

**[SUPP-FOC-01] Setup Anti-Distração (Ritual de Entrada)**
Aparece: Antes de qualquer bloco de foco
Duração: 3 min
Três passos invariáveis antes de qualquer trabalho importante: (1) celular em modo avião ou em outro cômodo, (2) uma única aba aberta no navegador, (3) headphones com ruído branco ou silêncio. Não é disciplina — é design de ambiente que torna a distração inconveniente.

**[SUPP-FOC-02] Batching de Comunicação**
Aparece: Dias úteis
Duração: 20 min (em cada janela) | Período: 10h e 17h
Mensagens, e-mails e notificações respondidos apenas em duas janelas fixas por dia. Fora delas: silenciado. Cada interrupção digital custa em média 23 minutos para recuperar o foco. 10 interrupções = um dia de trabalho perdido.

---

### ESQUECIMENTO

**[SUPP-FORG-01] Esvaziamento da Cabeça à Noite**
Aparece: Todo dia, antes de dormir
Duração: 5 min | Período: Noite
Antes de dormir, despejar tudo que está na cabeça num único lugar — tarefas, preocupações, ideias, o que não pode esquecer amanhã. Não é organizar agora — é "salvar" para que o cérebro possa descansar sem medo de perder informação.

**[SUPP-FORG-02] Revisão de 2 Minutos ao Acordar**
Aparece: Todo dia
Duração: 2 min | Período: Manhã
Antes de sair de casa (ou antes de iniciar qualquer trabalho), ler o que foi anotado na noite anterior. 2 minutos. Não planeja — apenas lembra. Quem lembra o que planejou na noite anterior executa 40% mais do que planejou vs. quem não revisa.

---

### CANSAÇO

**[SUPP-TIRE-01] Caminhada Anti-Crash**
Aparece: Dias úteis
Duração: 12 min | Período: 13h-16h (horário do crash)
No horário em que o cansaço bate (geralmente pós-almoço, entre 13h e 16h), 12 minutos de caminhada — preferencialmente com luz natural. Mais eficaz que cafeína para reduzir sonolência no curto prazo, sem o pico-e-queda do café. Também funciona como reset de humor.

**[SUPP-TIRE-02] Hora de Corte da Cafeína**
Aparece: Todo dia
Duração: Marcador | Período: Tarde
Cafeína tem meia-vida de 5-6 horas. Tomado às 15h, metade ainda está no sangue às 20-21h, prejudicando profundamente a qualidade do sono. Horário de corte personalizado baseado no `sleep_time`: [sleep_time] - 8 horas = último café permitido.

---

### ANSIEDADE

**[SUPP-ANXI-01] Zero Input nas Primeiras 2 Horas**
Aparece: Todo dia
Duração: 120 min (janela) | Período: Manhã
Nenhuma notícia, rede social ou conteúdo externo nas primeiras 2 horas após acordar. Não é negação do mundo — é proteção do estado mental no período mais vulnerável e mais produtivo do dia. O sistema nervoso precisa de tempo para se estabilizar antes de receber carga de informação externa.

**[SUPP-ANXI-02] Protocolo de Aterramento**
Aparece: Situacional (qualquer momento de espiral ansiosa)
Duração: 3 min
Quando a ansiedade aparecer: (1) nomear 5 coisas que pode ver, (2) 4 que pode tocar, (3) 3 que pode ouvir, (4) 2 que pode cheirar, (5) 1 que pode saborear. Técnica 5-4-3-2-1 de aterramento sensorial — redireciona atenção do ruminar para o presente físico com eficácia documentada.

---

### MOTIVAÇÃO

**[SUPP-MOTI-01] Evidência de Progresso**
Aparece: Todo dia, noite
Duração: 2 min
Antes de dormir: uma coisa que eu fiz hoje que o eu de 3 meses atrás não conseguiria. Não importa o tamanho. Motivação não precede a ação — ela segue evidência de progresso. Criar o registro é criar a evidência.

**[SUPP-MOTI-02] Âncora de Identidade**
Aparece: Todo dia, manhã
Duração: 30 seg
Uma frase escrita à mão, relida toda manhã. Não afirmação positiva genérica — uma declaração de identidade específica: "Sou alguém que [comportamento que quer ter]." O cérebro usa declarações de identidade para orientar decisões automáticas ao longo do dia.

---

## CAMADA 3 — Hábitos Complementares por Área da Vida

Cada área adiciona hábitos que não conflitam com os core e têm distribuição específica na semana.

---

### WORK / PRODUTIVIDADE

**[COMP-WORK-01] Arquitetura Semanal no Calendário**
Aparece: Domingo
Duração: 15 min
Bloquear no calendário os horários de foco da próxima semana antes que compromissos externos ocupem esses espaços. Não como intenção — como compromisso com nome e horário.

**[COMP-WORK-02] Caixa de Entrada Zero (às sextas)**
Aparece: Sexta-feira
Duração: 20 min | Período: Tarde
Processar e limpar todas as pendências de comunicação antes do fim de semana. Entrar no fim de semana com a caixa limpa é uma das práticas com maior impacto em qualidade de descanso — o trabalho não persegue mentalmente.

---

### PHYSICAL HEALTH

**[COMP-PHYS-01] Movimento Incidental Diário**
Aparece: Todo dia
Duração: Distribuído | Sem horário fixo
Mínimo de 5.000 passos de movimento incidental — escada em vez de elevador, andar durante chamadas de telefone, estacionar mais longe. Monitorado pelo app de saúde nativo do celular. Hábito de baixo custo com impacto alto em metabolismo e humor.

**[COMP-PHYS-02] Hidratação Programada**
Aparece: Todo dia
Duração: Marcador (3 lembretes)
Além da água ao acordar: lembrete às 12h, às 15h e às 18h para beber 300ml. Desidratação leve (2% do peso corporal) reduz desempenho cognitivo em até 20%. A maioria das pessoas chega ao final do dia com déficit sem perceber.

---

### MIND / MENTE E EMOÇÕES

**[COMP-MIND-01] Tempo Sem Agenda**
Aparece: Todo dia
Duração: 20 min | Período: Tarde ou noite
20 minutos sem objetivo definido — sem celular, sem produção, sem consumo. Pode ser qualquer coisa que o "eu sem pressão" escolheria. O descanso cognitivo real não acontece só durante o sono; acontece durante a baixa exigência acordado.

**[COMP-MIND-02] Leitura Física**
Aparece: 4x por semana (Segunda, Quarta, Sexta, Domingo)
Duração: 20 min | Período: Noite
Leitura de livro físico ou e-reader (sem backlight) por 20 minutos antes de dormir. Não é leitura de conteúdo útil necessariamente — é o ato de focar atenção de forma linear e profunda, que contrabalança a fragmentação do consumo digital durante o dia.

---

### RELATIONSHIPS

**[COMP-RELA-01] Conexão Real (não reação)**
Aparece: 5x por semana
Duração: 5-15 min | Período: Tarde ou noite
Uma mensagem ou ligação com substância para alguém que importa — não curtida, não comentário, não reply automático. Uma frase que demonstra que você estava pensando nessa pessoa. Relacionamentos enfraquecem não por conflitos, mas por ausência gradual.

**[COMP-RELA-02] Presença Plena (fim de semana)**
Aparece: Sábado ou Domingo
Duração: 60+ min | Período: Qualquer
Um período de tempo com alguém importante — sem celular, sem segunda tela, sem "já vou". A qualidade da presença importa mais que a quantidade de tempo. Pesquisa de Sherry Turkle (MIT) mostra que mesmo a presença do celular sobre a mesa — sem uso — reduz a qualidade percebida da conversa.

---

## CAMADA 4 — Calibração por Nível de Experiência

---

### NEVER — Nunca mantive hábito nenhum de verdade

**Quantidade:** 3 Âncoras + 2 Dirigidos semanais (máximo 5 hábitos ativos)
**Duração máxima por hábito:** 12 min (exceto exercício)
**Semana:** Apenas dias úteis nas primeiras 2 semanas. Fim de semana totalmente livre.
**Dirigidos:** Apenas os de Segunda (lançamento) e Domingo (reset)
**Excluídos inicialmente:** Todos os hábitos de Ritmo e qualquer hábito de duração >20 min
**Regra de ouro:** Nenhum hábito novo nos primeiros 14 dias. Consistência com poucos vale infinitamente mais que abandono com muitos.

**Progressão:**
- Dias 1-14: 3-5 hábitos, dias úteis
- Dias 15-21: +1 hábito de fim de semana (se consistência >70%)
- Dias 22-30: +1 hábito Dirigido de quarta ou sexta

---

### TRIED — Já tentei, mas não durou

**Quantidade:** 4 Âncoras + 3-4 Dirigidos semanais (6-7 hábitos ativos)
**Duração:** Mix de curtos (2-5 min) e médios (15-25 min)
**Semana:** Dias úteis + 1-2 hábitos no fim de semana desde o início
**Incluídos:** Hábitos Dirigidos de Segunda, Quarta e Sexta
**Excluídos inicialmente:** Hábitos de Ritmo semanais longos (entram na semana 3)
**Foco especial:** Hábitos de Suporte para o desafio primário, pois esse é tipicamente o ponto onde a tentativa anterior falhou.

**Progressão:**
- Dias 1-7: Rotina completa de dias úteis
- Dias 8-14: Adicionar hábitos de fim de semana
- Dias 15-21: Introduzir 1 hábito de Ritmo semanal
- Dias 22-30: Rotina completa incluindo rituais de domingo

---

### ALREADY_HAVE — Já tenho alguns, quero ir além

**Quantidade:** 5 Âncoras + todos os Dirigidos aplicáveis + 1-2 Ritmos (8-10 hábitos ativos)
**Duração:** Variada, incluindo blocos longos (60-90 min)
**Semana:** 7 dias, com variação planejada de intensidade (haute/moderate/recovery)
**Incluídos:** Tudo, priorizando hábitos que "empilham" sobre o que o usuário provavelmente já faz
**Foco:** Periodização consciente — dias de alta intensidade seguidos de dias de recuperação ativa

**Lógica de periodização semanal:**
- Segunda: Alta intensidade (Lançamento + Foco Profundo)
- Terça: Média intensidade (Execução + Movimento leve)
- Quarta: Reset (Diagnóstico + Silêncio + Limpeza)
- Quinta: Alta intensidade (Treino + Bloco Foco)
- Sexta: Colheita + Desaceleração
- Sábado: Expansão prazerosa (movimento livre, tempo não estruturado)
- Domingo: Preparação profunda (reset completo + planejamento)

---

## CAMADA 5 — Ritmo e Energia de Cada Dia da Semana

Esta camada define a "personalidade" de cada dia e como os hábitos se encaixam nela.

---

### Segunda-feira: LANÇAMENTO

Energia natural: reinício, determinação, vontade de fazer diferente
Hábitos dominantes: planejamento, intenção, primeiro bloco de foco
Tom da rotina: estruturado, direcional, com momentum

**Hábitos que pertencem à segunda:**
- Âncoras completas
- Planejamento/Arquitetura da semana
- Intenção da semana (objetivo: mental)
- Primeiro Bloco de Foco Profundo (objetivo: productivity)
- Treino de força (objetivo: health)
- Contrato semanal (objetivo: avoid)

---

### Terça-feira: EXECUÇÃO

Energia natural: foco operacional, menos glamour, mais entrega
Hábitos dominantes: fazer sem planejar, executar sem revisar
Tom da rotina: limpo, silencioso, orientado à tarefa

**Hábitos que pertencem à terça:**
- Âncoras completas
- Bloco de Foco Profundo (segunda sessão)
- Substituição planejada (objetivo: avoid)
- Movimento leve (objetivo: health)
- Nenhum hábito de revisão ou meta-trabalho

---

### Quarta-feira: RESET

Energia natural: meio de semana, cansaço acumulando, necessidade de recalibrar
Hábitos dominantes: diagnóstico, organização, descanso ativo
Tom da rotina: mais leve, introspectivo, com espaço para respirar

**Hábitos que pertencem à quarta:**
- Âncoras completas
- Diagnóstico de meio de semana
- Silêncio completo (objetivo: mental)
- Limpeza e ordem do espaço
- Caminhada anti-crash ampliada (20 min)
- Escuta do corpo (objetivo: health)
- Auditoria do padrão (objetivo: avoid)

---

### Quinta-feira: RETOMADA

Energia natural: segunda onda de produtividade, semana ainda pode ser salva
Hábitos dominantes: foco renovado, treino, revisão quinzenal
Tom da rotina: semelhante à terça, com carga levemente maior

**Hábitos que pertencem à quinta:**
- Âncoras completas
- Bloco de Foco ou Fluxo Criativo
- Treino de força (objetivo: health)
- Janela de preocupação (objetivo: mental)
- Revisão quinzenal (se aplicável)

---

### Sexta-feira: COLHEITA

Energia natural: desaceleração, reflexão, senso de encerramento
Hábitos dominantes: revisão, reconhecimento, preparação para o descanso
Tom da rotina: mais lento, mais reflexivo, orientado para fechar ciclos

**Hábitos que pertencem à sexta:**
- Âncoras completas
- Revisão da semana (todas as variantes de objetivo)
- Colheita da semana (objective: productivity)
- Movimento leve (não treino intenso)
- Caixa de entrada zero
- Janela de Permissão (objetivo: avoid)
- Leitura física à noite

---

### Sábado: EXPANSÃO

Energia natural: liberdade, prazer, exploração sem agenda
Hábitos dominantes: movimento prazeroso, conexão, tempo não estruturado
Tom da rotina: leve, baseado em prazer, sem produção obrigatória

**Hábitos que pertencem ao sábado:**
- Âncora-01 apenas (água + luz natural)
- Movimento prazeroso (objetivo: health)
- Tempo não estruturado (objetivo: mental)
- Presença plena com alguém importante
- Zero hábitos de produtividade ou revisão

*Nota para nível "never": sábado totalmente livre nas primeiras 2 semanas.*

---

### Domingo: PREPARAÇÃO

Energia natural: antecipação, organização, desejo de recomeço
Hábitos dominantes: reset semanal, planejamento, rituais de fechamento
Tom da rotina: calmo e estruturado, criando o solo para a semana que começa

**Hábitos que pertencem ao domingo:**
- Âncoras completas
- Reset Completo (objetivo: routine)
- Preparação da Semana (objetivo: productivity)
- Carta para a próxima semana (objetivo: mental)
- Preparação do corpo (objetivo: health)
- Revisão de consistência (objetivo: avoid)
- Arquitetura da semana no calendário
- Leitura física à noite

---

## CAMADA 6 — Alocação por Horário e Pico de Energia

---

### Períodos do dia (calculados a partir do wake_time e sleep_time)

| Período | Cálculo | Exemplo (acorda 7h, dorme 23h) |
|---------|---------|-------------------------------|
| Amanhecer | wake_time até wake_time + 1h | 7h–8h |
| Manhã | wake_time + 1h até 12h | 8h–12h |
| Tarde | 12h até 17h | 12h–17h |
| Final de tarde | 17h até sleep_time - 2h | 17h–21h |
| Noite | sleep_time - 2h até sleep_time | 21h–23h |

### Hábitos que sempre ficam no Amanhecer (independente de pico)
- Água ao acordar
- Sequência de abertura do dia
- Exposição à luz natural
- Descarga mental matinal (objetivo: mental)
- Zero input (objetivo: ansiedade)

### Hábitos que sempre ficam na Noite
- Preparação noturna
- Esvaziamento da cabeça
- Registro do dia
- Evidência de progresso
- Leitura física
- Ritual de sono

### Hábitos alocados pelo pico de energia

**energy_peak = morning:**
Bloco de Foco Profundo → Amanhecer a Manhã (8h-11h)
Treino → Antes do trabalho (6h-7h30) ou após o bloco (11h30)
Tarefas criativas → Manhã

**energy_peak = afternoon:**
Bloco de Foco Profundo → Tarde (13h-16h)
Treino → Tarde ou início da noite
Manhã → Hábitos leves apenas (âncoras, rotina de abertura)

**energy_peak = evening:**
Bloco de Foco Profundo → Noite (19h-22h)
Treino → Noite (respeitando: nada muito intenso dentro de 1h do sono)
Manhã → Só âncoras automáticas
Atenção → Desconexão digital ajustada para sleep_time - 1h (não reduzir)

---

## CAMADA 7 — Adaptação por Perfil Profissional

Ajustes finos no timing e tipo de hábito baseados na `profession`.

### Student (Estudante)

**Ajustes:**
- Bloco de Foco → renomeado para "Sessão de Estudo Profundo"
- Horário de trabalho flexível → hábitos alocados por aula vs. tempo livre
- Segunda e quinta tendem a ser dias de alta carga acadêmica → Bloco de Foco nesses dias
- Caminhada Anti-Crash → especialmente relevante em dias de estudo intenso
- Revisão da semana inclui: o que aprendi vs. o que preciso revisar

**Hábito adicional para estudantes:**
[STUD-01] Teste Rápido de Recuperação
Aparece: Depois de qualquer sessão de estudo
Duração: 5 min
Fechar o material e escrever de memória tudo que lembra do que estudou — sem consultar. Técnica de "retrieval practice" com eficácia comprovada em retenção: estudantes que testam memória retêm 50% mais do que os que releem.

---

### Employed / CLT

**Ajustes:**
- Horário comercial 8h-18h define com precisão os slots disponíveis
- Bloco de Foco Profundo → antes das 9h ou após as 17h (fora de reuniões)
- Ritual de Início → 10 min antes das reuniões do dia começarem
- Desligamento Intencional → às 18h, mesmo que ainda haja e-mail não respondido
- Segunda tende a ter mais reuniões → Bloco de Foco movido para terça ou quinta

**Hábito adicional para CLT:**
[CLT-01] Descompressão Pós-Trabalho
Aparece: Após o desligamento do trabalho
Duração: 15 min
Uma "transição" entre o modo trabalho e o modo vida — caminhada, música, qualquer atividade que sinaliza ao sistema nervoso que o expediente acabou. Pesquisa mostra que quem tem ritual de descompressão tem qualidade de sono 25% melhor e ruminação noturna significativamente menor.

---

### Entrepreneur / Empreendedor

**Ajustes:**
- Horário flexível exige âncoras mais rígidas para compensar a ausência de estrutura externa
- Sequência de Abertura do Dia é inegociável — é o que cria estrutura quando não há
- Bloco de Foco Profundo → agendado como reunião no calendário (com ele mesmo)
- Segunda → planejamento semanal mais detalhado (sem estrutura externa, a semana se perde)
- Sexta → revisão financeira/operacional integrada à colheita da semana

**Hábito adicional para empreendedores:**
[ENT-01] Uma Hora Sem Operação
Aparece: Diariamente
Duração: 60 min | Período: Manhã ou tarde
Uma hora por dia onde o empreendedor não responde mensagens, não toma decisões operacionais, não apaga incêndios — só pensa no negócio estrategicamente ou simplesmente descansa. Sem isso, o modo operacional consome 100% do tempo e o negócio nunca evolui.

---

### Freelancer

**Ajustes:**
- Risco principal: dias sem estrutura que viram dias improdutivos
- Âncoras são especialmente críticas para criar ritmo em dias sem compromisso externo
- Bloco de Foco → primeira coisa do dia, antes de qualquer comunicação com cliente
- Sexta → revisão de projetos entregues + pipeline da próxima semana
- Sábado pode ter trabalho → rotina de "sábado produtivo" alternativa disponível

---

## Exemplos Completos de Rotina por Perfil

---

### PERFIL 1 — Lucas, 22 anos, Estudante de Engenharia

**Dados do quiz:** objective: productivity | challenges: procrastination, focus | energy_peak: morning | time_available: 1h | age: 18-24
**Onboarding:** wake_time: 7:30 | sleep_time: 00:00 | weekend_diff: different | life_areas: work, mind | habit_experience: tried

**SEGUNDA-FEIRA (Lançamento)**

| Horário | Hábito | Tipo | Duração |
|---------|--------|------|---------|
| 7:30 | Água ao acordar | Âncora | 2 min |
| 7:35 | Sequência de abertura (luz + cama) | Âncora | 13 min |
| 8:00 | Âncora de identidade | Suporte-Moti | 30 seg |
| 8:10 | Setup anti-distração | Suporte-Foc | 3 min |
| 8:13 | Sessão de Estudo Profundo (pico manhã) | Core | 90 min |
| 9:45 | Notificações em lote (janela 1) | Suporte-Foc | 15 min |
| 10:00 | Arquitetura da semana | Dirigido-Seg | 20 min |
| 16:00 | Notificações em lote (janela 2) | Suporte-Foc | 15 min |
| 16:30 | Caminhada anti-crash | Suporte-Tire | 12 min |
| 23:30 | Teste de Recuperação (pós-estudo) | Perfil-Stud | 5 min |
| 23:35 | Esvaziamento da cabeça | Suporte-Forg | 5 min |
| 23:40 | Revisão de amanhã (3 itens) | Suporte-Forg | 3 min |

**QUARTA-FEIRA (Reset)**

| Horário | Hábito | Tipo | Duração |
|---------|--------|------|---------|
| 7:30 | Água ao acordar | Âncora | 2 min |
| 7:35 | Sequência de abertura | Âncora | 13 min |
| 8:10 | Bloco de Fluxo Criativo (não Foco Profundo) | Variante | 45 min |
| 14:30 | Caminhada ampliada (reset de meio de semana) | Dirigido-Qua | 20 min |
| 17:00 | Diagnóstico de meio de semana | Dirigido-Qua | 10 min |
| 20:00 | Tempo sem agenda (20 min offline) | Comp-Mind | 20 min |
| 23:30 | Esvaziamento da cabeça | Suporte | 5 min |

**SEXTA-FEIRA (Colheita)**

| Horário | Hábito | Tipo | Duração |
|---------|--------|------|---------|
| 7:30 | Água + sequência | Âncora | 15 min |
| 8:10 | Bloco de Estudo (última sessão da semana) | Core | 60 min |
| 17:00 | Colheita da semana | Dirigido-Sex | 12 min |
| 17:12 | Caixa de entrada zero | Comp-Work | 20 min |
| 22:00 | Leitura física | Comp-Mind | 20 min |
| 23:30 | Esvaziamento + evidência de progresso | Suporte | 7 min |

**SÁBADO (Expansão — weekend_diff: different)**

| Horário | Hábito | Tipo | Duração |
|---------|--------|------|---------|
| 9:00 | Água + luz natural (horário flexível) | Âncora | 15 min |
| Qualquer | Movimento prazeroso (futebol, bike) | Dirigido-Sab | 60 min |
| Qualquer | Presença plena com alguém | Comp-Rela | 60 min |
| Livre | Tudo o mais: zero hábitos de produção | — | — |

**DOMINGO (Preparação)**

| Horário | Hábito | Tipo | Duração |
|---------|--------|------|---------|
| 9:00 | Água + sequência | Âncora | 15 min |
| 16:00 | Preparação da semana | Ritmo-Dom | 20 min |
| 16:20 | Arquitetura do calendário | Comp-Work | 15 min |
| 22:00 | Leitura física | Comp-Mind | 20 min |
| 23:00 | Carta para a próxima semana | Dirigido-Dom | 10 min |
| 23:10 | Esvaziamento da cabeça | Suporte | 5 min |

---

### PERFIL 2 — Ana, 31 anos, CLT, Saúde, Noite

**Dados do quiz:** objective: health | challenges: tiredness, motivation | energy_peak: evening | time_available: 30min | age: 25-34
**Onboarding:** wake_time: 6:00 | sleep_time: 22:30 | weekend_diff: same | life_areas: physical, relationships | habit_experience: never

*(Nível "never" = máximo 5 hábitos ativos, dias úteis, rotina leve)*

**SEGUNDA, TERÇA, QUINTA (Dias de treino + hábitos leves)**

| Horário | Hábito | Tipo | Duração |
|---------|--------|------|---------|
| 6:00 | Água ao acordar | Âncora | 2 min |
| 6:05 | Luz natural (varanda ou caminho ao trabalho) | Âncora | 12 min |
| 18:30 | Treino de força (pico de energia: noite) | Core | 45 min |
| 21:30 | Conexão real (mensagem para alguém) | Comp-Rela | 5 min |
| 21:45 | Evidência de progresso | Suporte-Moti | 2 min |

**QUARTA (Dia de escuta do corpo — sem treino)**

| Horário | Hábito | Tipo | Duração |
|---------|--------|------|---------|
| 6:00 | Água + luz | Âncora | 14 min |
| 19:00 | Caminhada de 15 min (escuta do corpo) | Dirigido-Qua | 15 min |
| 21:45 | Evidência de progresso | Suporte | 2 min |

**SÁBADO / DOMINGO (weekend_diff: same — mesmos hábitos)**

| Horário | Hábito | Tipo | Duração |
|---------|--------|------|---------|
| 8:00 | Água + luz natural | Âncora | 14 min |
| Qualquer | Movimento prazeroso (substitui treino) | Dirigido-Sab | 40-60 min |
| Noite | Evidência de progresso | Suporte | 2 min |

---

### PERFIL 3 — Rafael, 36 anos, Empreendedor, Equilíbrio Mental, Manhã

**Dados do quiz:** objective: mental | challenges: anxiety, focus | energy_peak: morning | time_available: 1h | age: 35-44
**Onboarding:** wake_time: 5:30 | sleep_time: 22:00 | weekend_diff: different | life_areas: mind, work, relationships | habit_experience: already_have

*(Nível "already_have" = rotina completa com periodização consciente)*

**SEGUNDA (Alta intensidade — Lançamento)**

| Horário | Hábito | Tipo | Duração |
|---------|--------|------|---------|
| 5:30 | Água ao acordar | Âncora | 2 min |
| 5:35 | Descarga mental matinal | Âncora-Ment | 10 min |
| 5:45 | Luz natural + movimento matinal | Âncora | 20 min |
| 6:05 | Zero input (sem notícia/social) | Suporte-Anxi | (até 7:30) |
| 7:00 | Bloco de Foco Profundo (pico manhã) | Core | 90 min |
| 8:30 | Batching de comunicação (janela 1) | Suporte-Foc | 20 min |
| 9:00 | Intenção da semana | Dirigido-Seg | 8 min |
| 9:08 | Uma hora sem operação | Perfil-Ent | 60 min |
| 16:30 | Batching de comunicação (janela 2) | Suporte-Foc | 20 min |
| 19:00 | Conexão real | Comp-Rela | 10 min |
| 21:00 | Tela desligada (até 22h) | Âncora-Ment | — |
| 21:30 | Esvaziamento da cabeça | Suporte | 5 min |
| 21:35 | Reconhecimento do dia | Âncora-Ment | 3 min |

**QUARTA (Reset — intensidade média)**

| Horário | Hábito | Tipo | Duração |
|---------|--------|------|---------|
| 5:30 | Água + descarga mental | Âncora | 12 min |
| 5:45 | Luz + movimento leve (não corrida) | Âncora | 20 min |
| 7:00 | Bloco de Fluxo Criativo (não Foco Profundo) | Variante | 45 min |
| 14:00 | Silêncio completo (15 min) | Dirigido-Qua | 15 min |
| 16:30 | Janela de preocupação | Suporte-Anxi | 15 min |
| 17:00 | Diagnóstico de meio de semana | Dirigido-Qua | 10 min |
| 21:30 | Esvaziamento + reconhecimento | Âncora | 8 min |

**SÁBADO (Expansão total — weekend_diff: different)**

| Horário | Hábito | Tipo | Duração |
|---------|--------|------|---------|
| 7:00 (flexível) | Água + luz | Âncora mínima | 14 min |
| Qualquer | Tempo sem agenda (1h) | Dirigido-Sab | 60 min |
| Qualquer | Presença plena | Comp-Rela | 60+ min |
| Zero | Hábitos de trabalho, produção ou revisão | — | — |

**DOMINGO (Preparação profunda)**

| Horário | Hábito | Tipo | Duração |
|---------|--------|------|---------|
| 6:00 | Âncoras completas | — | 32 min |
| 15:00 | Reset completo | Ritmo-Dom | 30 min |
| 15:30 | Arquitetura semanal | Comp-Work | 15 min |
| 20:00 | Carta para a próxima semana | Dirigido-Dom | 10 min |
| 21:00 | Tela desligada | — | — |
| 21:30 | Esvaziamento + reconhecimento | Âncora | 8 min |

---

## Regras de Conflito e Priorização

Quando o sistema seleciona mais hábitos do que o nível permite:

**Prioridade de permanência:**
1. Hábitos Âncora do objetivo (nunca removidos)
2. Hábito de Suporte do desafio primário
3. Hábito Dirigido de segunda (define o tom da semana)
4. Hábito Dirigido de domingo (fecha o ciclo)
5. Hábitos de áreas da vida selecionadas
6. Hábitos Dirigidos de quarta e sexta
7. Hábitos de Ritmo semanal

**Hábitos removidos** ficam numa fila de "próximos hábitos" sugeridos progressivamente após 14 dias de consistência >70%.

---

## Lógica de Progressão Mensal

| Período | Ação do sistema | Gatilho |
|---------|----------------|---------|
| Dias 1-14 | Rotina inicial | — |
| Dias 15-21 | Sugerir +1 hábito da fila | Consistência >70% |
| Dias 22-30 | Sugerir +1 hábito de ritmo | Consistência >65% |
| Mês 2 | Revisar e reorganizar rotina | App notifica |
| Mês 2+ | Introduzir variações sazonais | A cada 4 semanas |

---

## Notas de Implementação

**Hábitos tipo "Marcador":** Binary (aconteceu / não aconteceu). Sem timer. Aparecem como toggle no app.

**Habit Stacking visual:** Quando dois hábitos são consecutivos por design (ex: Água → Luz Natural), o app apresenta como sequência única com duração total. "Faça os dois juntos — leva [X] min."

**Abas semanais:** Quando `weekend_diff ≠ same`, o preview da rotina (S9 do onboarding) mostra duas visões: "Semana" e "Fim de Semana". A aba do dia atual é a padrão.

**Personalidade dos dias:** O app pode exibir o nome do "papel" do dia (Segunda: Lançamento / Quarta: Reset / Sexta: Colheita) como contexto editorial acima dos hábitos — sem ser intrusivo. Cria senso de narrativa semanal.

**Variantes de hábito:** Hábitos que têm duas versões (ex: Foco Profundo vs. Fluxo Criativo) aparecem como o mesmo hábito no dashboard com uma indicação de variante. O usuário vê um hábito, não dois.
