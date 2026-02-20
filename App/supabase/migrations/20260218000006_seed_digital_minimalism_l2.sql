-- ============================================
-- SEED: Digital Minimalism L2 — "Digital Minimalism"
-- ============================================
-- NOTE: The journeys row for 'digital-detox-l2' already exists
-- from 20260218000001_seed_digital_detox_l1.sql.
-- This migration seeds phases, days, and habit templates only.

DO $$
DECLARE
  v_journey_id uuid;
  v_phase1_id uuid;
  v_phase2_id uuid;
  v_phase3_id uuid;
  v_phase4_id uuid;
BEGIN
  SELECT id INTO v_journey_id FROM public.journeys WHERE slug = 'digital-detox-l2';

  -- ============================================
  -- 1. Phases
  -- ============================================

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 1, 'DEEP WORK', 'Aprenda a focar', E'Introduzir blocos de deep work, time blocking e journaling de foco. A habilidade core do programa.', 1, 7, 'digital-detox-l2-phase-1', 'Deep Worker')
  RETURNING id INTO v_phase1_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 2, 'SYSTEM', 'Monte seu sistema', E'Batching de tarefas rasas, shutdown ritual, rituais de transição. O sistema operacional completo.', 8, 14, 'digital-detox-l2-phase-2', 'Sistema Operacional Montado')
  RETURNING id INTO v_phase2_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 3, 'OFFLINE LIFE', 'Construa uma vida que compete', E'Hobbies analógicos estruturados, meditação, conexões humanas reais. A vida que torna o celular irrelevante.', 15, 22, 'digital-detox-l2-phase-3', 'Vida Offline Construída')
  RETURNING id INTO v_phase3_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 4, 'INTEGRATION', 'O minimalista digital', E'Consolidar tudo. Auditoria final de ferramentas. Protocolo permanente. Identidade transformada.', 23, 30, 'digital-detox-l2-phase-4', 'Digital Minimalist')
  RETURNING id INTO v_phase4_id;

  -- ============================================
  -- 2. Journey Days (30 days)
  -- ============================================

  -- DAY 1
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 1, 'Seu primeiro deep work block real', E'No Nível 1 você aprendeu a reduzir. No Nível 2 você aprende a construir. A construção começa com foco profundo.\n\n**NOVO — Deep Work Block (90 min):**\n\n**Pré-requisitos:**\n1. Celular em modo avião, em outro cômodo\n2. Notificações de computador desligadas\n3. Apenas abas necessárias abertas\n4. Ambiente silencioso ou ruído branco\n5. Água e café preparados ANTES\n\n**Protocolo:**\n1. Defina UMA tarefa para os 90 min\n2. Escreva a tarefa em papel à sua frente\n3. Timer de 90 min — START\n4. Impulsos de checar algo: anote num ''parking lot'' e volte\n5. Impulso de celular: respire 3x, o impulso passa em 30-60s\n\n**NOVO — Journaling de foco:**\nApós cada deep work, anote: o que fiz, nível de foco (1-10), vezes que quis checar celular, completei a tarefa?\n\nSe seus músculos de foco estão atrofiados, 90 min vão parecer eternos. É normal. É como DOMS após o primeiro treino.', 15);

  -- DAY 2
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 2, 'A fórmula da produtividade', E'**A fórmula (Cal Newport):**\nTrabalho de qualidade = Tempo × Intensidade de foco\n\n2 horas com foco total > 5 horas com celular na mesa e email aberto.\n\n**Attention Residue (Gloria Mark, UC Irvine):**\nCada interrupção custa ~23 min para recuperar foco. Se checa o celular 3x durante 90 min, NUNCA atinge foco profundo.\n\n**Presença do celular (University of Texas):**\nMesmo desligado e virado para baixo na mesa, a presença visível do celular reduz performance cognitiva. Solução: celular em outro cômodo. Sempre.\n\n**O limite de 4 horas:**\nDarwin, Dickens, Poincaré — todos trabalhavam ~4h intensas por dia. A meta não é 12h de deep work. É 2-4h BEM FEITAS.\n\nHoje: mantenha 1 bloco de 90 min + journaling de foco.', 10);

  -- DAY 3
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 3, 'Time blocking: planeje cada minuto', E'Cal Newport não usa to-do lists. Usa time blocking — planejar cada bloco do dia antecipadamente.\n\n**NOVO — Time Blocking:**\nToda manhã (ou noite anterior), divida seu dia em blocos:\n\n06:30-07:30 | Rotina matinal (phone-free)\n07:30-09:00 | DEEP WORK — tarefa principal\n09:00-09:15 | Pausa + transição\n09:15-09:45 | Bloco de mensagens\n09:45-11:15 | DEEP WORK — tarefa secundária\n11:15-11:30 | Bloco de mensagens\n11:30-12:30 | Academia\n12:30-13:30 | Almoço offline\n13:30-14:30 | Shallow work\n14:30-16:00 | DEEP WORK — projeto/estudo\n16:00-17:00 | Shallow work + planning\n\n**Regras:**\n1. Deep work nos horários de maior energia\n2. Mensagens NUNCA durante deep work — agrupadas em 2-3 blocos\n3. Blocos flexíveis: replanejar é o valor\n4. Deixe buffer para imprevistos\n\nTo-do lists dão ilusão de controle mas ignoram o tempo real. Time blocking força realismo.', 15);

  -- DAY 4
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 4, 'Aumente para 2 blocos', E'Se ontem fez 1 bloco de 90 min, hoje faz 2. Isso são 3 horas de deep work — mais foco profundo que a maioria consegue numa semana.\n\n**Protocolo de 2 blocos:**\n- Bloco 1: Manhã (pico cognitivo)\n- Pausa de 15-30 min entre blocos (caminhar, café — SEM celular)\n- Bloco 2: Início da tarde\n\n**A pausa entre blocos:**\nNÃO é scroll time. É descanso real: movimento físico, natureza, conversa, silêncio. Se pegar o celular na pausa, o attention residue se acumula e o Bloco 2 começa comprometido.\n\n**Journaling de foco após cada bloco.** Compare os dois: em qual sentiu mais flow?', 10);

  -- DAY 5
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 5, 'Batching: domando o shallow work', E'Deep work cuida do trabalho que importa. Mas emails, mensagens e tarefas admin não vão desaparecer. A solução: batching.\n\n**NOVO — Batching de mensagens/email:**\nEm vez de checar a cada 6 segundos, defina horários fixos:\n\n09:00-09:30 | Bloco 1 (manhã) | 30 min\n12:00-12:30 | Bloco 2 (almoço) | 30 min\n16:00-16:30 | Bloco 3 (fim do dia) | 30 min\n\n**Regras:**\n1. FORA desses blocos: email e mensagens fechados/silenciados\n2. Durante deep work: ZERO mensagens\n3. Se urgente: ligação telefônica. Se não é urgente para ligar, espera 3h\n4. Avise colegas/amigos: "Respondo mensagens 3x por dia"\n\n**O medo de perder algo:**\nA grande maioria das mensagens não é urgente. Antes dos smartphones, emails eram respondidos 1-2x/dia e o mundo funcionava.', 10);

  -- DAY 6
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 6, 'Treinando o foco como músculo', E'Exercícios para expandir sua capacidade de foco:\n\n**Exercício 1 — Meditação de foco (5 min):**\nSente-se, feche os olhos, foque na respiração. Cada vez que "volta" após a mente vagar é uma rep de foco.\n\n**Exercício 2 — Leitura focada (30 min):**\nLivro físico, sem celular por perto. Se perder concentração, volte ao parágrafo anterior.\n\n**Exercício 3 — Caminhada produtiva (20 min):**\nCaminhe sem celular/fone. Escolha UM problema. Mantenha foco nele. Newport chama de "meditação produtiva."\n\n**Exercício 4 — Tolerar a fila:**\nNa próxima fila: nada de celular. Fique parado. Observe o ambiente. Tolere o micro-tédio. Cada momento desses treina seu cérebro a funcionar sem estímulo constante.\n\nMantenha 2 blocos de deep work + time blocking + batching.', 15);

  -- DAY 7
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 7, 'Semana 1 completa', E'Uma semana de deep work. Se fez 2 blocos de 90 min em pelo menos 4 dias, acumulou ~12h de trabalho profundo. Mais foco que a maioria consegue em um mês.\n\n**Review semana 1:**\n1. Deep work blocks completados: ___/~10\n2. Duração média do bloco: ___ min\n3. Nível médio de foco (journaling): ___/10\n4. Time blocking: planejei meu dia em ___/7 dias\n5. Batching respeitado: ___/5 dias\n6. Screen time médio: ___h/dia\n7. Maior desafio da semana\n8. Maior insight\n\n**Badge: "Deep Worker"**', true, 15);

  -- DAY 8
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 8, 'Shutdown ritual: o encerramento que liberta', E'O trabalho expande para preencher todo o tempo disponível (Lei de Parkinson). Sem ponto de parada, você fica em "modo parcialmente ligado" a noite inteira.\n\n**NOVO — Shutdown Ritual:**\nEscolha horário fixo para encerrar o dia (ex: 17h, 18h, 19h). Nesse horário:\n\n1. **Captura:** Revise notas, capture tarefas pendentes numa lista\n2. **Planning:** Faça o time blocking do dia seguinte\n3. **Frase final:** "Shutdown completo." (parece bobo, funciona)\n4. **Depois:** ZERO trabalho. Sem emails. Tempo de recuperação, hobbies, conexão\n\nSeu cérebro precisa de certeza de que não haverá mais demandas para realmente desligar. O ritual dá "permissão" para descansar.\n\n**Conexão com N1:** Toque de recolher + shutdown = noite completamente livre de trabalho e estímulo digital.\n\n**Deep work: tente estender para 120 min num dos blocos.**', 15);

  -- DAY 9
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 9, 'Deep work estendido', E'Hoje: empurre o limite. Em vez de 90 min, tente 120 min contínuos.\n\n**Progressão de deep work:**\nSemana 1: 90 min × 2 = 3h\nSemana 2: 90-120 min × 2 = 3-4h\nSemana 3: 120 min × 2 = 4h\nSemana 4: 120 min × 2 = 4h (limite sustentável)\n\n**Os primeiros 30 minutos são os mais difíceis:**\nO cérebro oscila em ciclos de ~90 min (ultradian rhythms). Os primeiros 20-30 min são "aquecimento" — a mente resiste, quer escapar. O flow começa DEPOIS. Se desiste aos 20 min, nunca chega ao ponto em que o trabalho flui.\n\nAguente. O outro lado vale a pena.\n\nMantenha shutdown ritual ao final do dia.', 10);

  -- DAY 10
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 10, 'Ritual de transição', E'Attention residue: trocar de tarefa sem transição contamina a tarefa seguinte. Um ritual de 2 min pode acelerar recuperação de foco em 40-50%.\n\n**NOVO — Ritual de transição (2 min):**\nEntre tarefas ou blocos:\n\n1. **Fechar (30s):** Salve, feche aba, anote onde parou\n2. **Respirar (30s):** 3 respirações profundas. Solte o que estava fazendo\n3. **Definir (30s):** Em uma frase, o que vai fazer agora\n4. **Iniciar (30s):** Abra APENAS o necessário para a nova tarefa\n\n**Sem o ritual:** Termina email tenso e começa a estudar, mas parte do cérebro rumina o email. 15 min depois não absorveu nada.\n\n**Com o ritual:** Fecha email, respira, define tarefa, abre material. O cérebro entendeu que a tarefa anterior acabou.', 10);

  -- DAY 11
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 11, 'Curadoria tecnológica radical', E'Digital minimalism não é anti-tecnologia. É ser seletivo.\n\n**A regra do artesão — para cada app/serviço, pergunte:**\n1. Suporta diretamente algo que eu valorizo profundamente?\n2. É a MELHOR ferramenta para esse propósito?\n3. Benefícios superam claramente os custos (tempo, atenção, vício)?\n\nSe não passou nos 3 filtros: deletar, desinstalar ou desativar.\n\n**Faça a auditoria:** Instagram, TikTok, YouTube, Twitter/X, Reddit, Netflix, Games — aplique os 3 filtros a cada um.\n\n**A armadilha do "pode ser útil":** Quase tudo PODE ser útil. Mas se 10 min úteis custam 2h de scroll, o cálculo não fecha.\n\n**Meta radical (opcional):** Desinstale redes sociais do celular. Use apenas pelo computador, em horários específicos. Versões mobile são projetadas para vício.', 20);

  -- DAY 12
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 12, 'Hobby analógico dedicado', E'No N1, "atividade analógica" era qualquer coisa offline. No N2, você escolhe UM hobby estruturado.\n\n**NOVO — Hobby analógico dedicado (30 min+/dia):**\nEscolha 1 hobby que:\n- Não envolve telas\n- Tem progressão (você melhora com prática)\n- Te coloca em estado de flow\n- Pode ser feito quase diariamente\n\nSugestões: instrumento musical, leitura (1 livro/mês), escrita, desenho/pintura, xadrez (físico), corrida/esporte, culinária com receitas novas, jardinagem, fotografia, yoga.\n\n**Por que hobby estruturado?**\nQuando remove horas de tela, precisa de algo que proporcione senso de progresso. Hobbies com progressão ativam o sistema de recompensa de forma saudável — a satisfação vem de melhoria real de habilidade, não de likes.', 10);

  -- DAY 13
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 13, 'Descanso', E'Mantenha hábitos base. Não force deep work. Descanse o cérebro.\n\nO descanso É parte da produtividade. Pesquisa sobre deliberate rest mostra que períodos de não-trabalho são quando o cérebro consolida aprendizado e gera insights criativos.\n\nObserve como se sente comparado ao início da semana. O sistema está ficando mais natural?', true, 5);

  -- DAY 14
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 14, 'Semana 2 completa', E'Seu sistema está montado: deep work + time blocking + batching + shutdown + transições + hobby. Mais infraestrutura de produtividade que 95% das pessoas.\n\n**Review semana 2:**\n1. Deep work total da semana: ___h\n2. Maior bloco contínuo: ___ min\n3. Time blocking: ___/7 dias\n4. Batching respeitado: ___/5 dias\n5. Shutdown ritual: ___/5 dias\n6. Screen time: ___h/dia\n7. Qualidade do trabalho produzido (1-10)\n8. Qualidade do descanso noturno (1-10)\n\n**Badge: "Sistema Operacional Montado"**', true, 15);

  -- DAY 15
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 15, 'Meditação: o treino definitivo de atenção', E'Se deep work é o exercício composto da produtividade, meditação é o aquecimento. Pesquisa mostra que mindfulness regular melhora foco sustentado.\n\n**NOVO — Meditação (começa com 5 min):**\n\n1. Sente-se confortável\n2. Timer de 5 min (sem celular — use timer físico)\n3. Feche os olhos\n4. Foque na respiração (nariz ou abdômen)\n5. Mente vagar: note sem julgamento, volte à respiração\n6. Cada "volta" = 1 rep de atenção\n\n**Progressão:**\n- Semana 3: 5 min/dia\n- Semana 4: 10 min/dia\n- Manutenção: 10-20 min/dia\n\n**Conexão com deep work:** Meditação treina exatamente o mesmo músculo — manter atenção e redirecionar quando a mente divaga. 5 min diários = treino de foco puro.', 10);

  -- DAY 16
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, motivational_note, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 16, 'O precipício (de novo)', E'Dia 16 — a motivação atinge o ponto mais baixo. O sistema pode parecer rígido demais. "Será que preciso de time blocking? Antes era mais tranquilo." O antes também era menos produtivo.\n\n**Se a resistência estiver forte:**\n- Simplifique: mantenha APENAS deep work + shutdown. Solte o resto por hoje\n- Faça um deep work de apenas 60 min. Melhor que zero\n- Relembre: seu screen time Dia 1 do N1 vs hoje. Esse delta = horas de vida recuperadas\n\nNão reverta tudo. O desconforto é sinal de que está funcionando. A parte difícil é temporária — o sistema que está construindo é permanente.', true, 'Muita gente desiste aqui. Você já sobreviveu ao cliff do N1, sabe que o outro lado existe. O desconforto é temporário — a clareza e produtividade que está construindo são permanentes.', 5);

  -- DAY 17
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 17, 'Conexões reais', E'Digital minimalism não é isolamento. É substituir conexões rasas (likes, stories) por conexões profundas.\n\n**Exercício — Para as 5 pessoas mais importantes:**\n1. Quando foi a última conversa presencial ou ligação?\n2. Quando foi a última interação por stories/likes?\n3. Qual te fez sentir mais conectado?\n\n**Protocolo de conexão real:**\nSubstitua pelo menos 1 interação digital/semana por 1 real:\n- Ligar em vez de mandar mensagem\n- Café presencial em vez de comentário no Instagram\n- Jantar com amigo em vez de maratona de Netflix\n\n**A ironia das redes:** Projetadas para "conectar", mas uso excessivo está associado a solidão. Likes ativam recompensa, mas não satisfazem pertencimento real.', 10);

  -- DAY 18
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 18, 'Sabbath digital expandido', E'Sabbath digital — desta vez, planeje algo especial: passeio na natureza, encontro com amigos, cozinhar, projeto manual.\n\nO sabbath não é um dia vazio — é um dia CHEIO de coisas melhores que o celular.\n\nAproveite para praticar seu hobby analógico por um período mais longo. Observe como o cérebro se sente após um dia inteiro (ou meio dia) sem estímulo digital.\n\nMantenha meditação de 5 min e os hábitos base.', 5);

  -- DAY 19
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 19, 'Deep work: flow state', E'Se manteve os blocos de 90-120 min, provavelmente já experimentou momentos de flow. Hoje: otimize para mais.\n\n**Condições para flow (Csikszentmihalyi):**\n1. **Desafio compatível com habilidade:** Nem fácil demais nem difícil demais\n2. **Feedback claro:** Saber se está progredindo\n3. **Meta clara:** Saber exatamente o que está fazendo\n4. **Zero distração:** O que você já pratica\n\n**Dica:** Nos primeiros 5 min do deep work, o desconforto é máximo. Comprometa-se a NÃO parar nos primeiros 20 min. O flow geralmente começa entre 15-45 min, quando o cérebro "esquece" que existem outras coisas.\n\nTente atingir 120 min nos dois blocos hoje.', 10);

  -- DAY 20
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 20, 'Auditoria de consumo de conteúdo', E'Não é só quanto você consome — é O QUE. Scroll passivo é junk food mental. Leitura profunda é nutrição cognitiva.\n\n**Substitua consumo passivo por ativo:**\n\nEvitar → Buscar:\n- Scroll de feed → Ler artigo/livro completo\n- Shorts/Reels → Documentário ou palestra longa\n- Notícias de 10s → Análise profunda de 1 tema\n- 20 posts de 10 pessoas → 1 conversa de 30 min com 1 pessoa\n- Podcast como ruído → Podcast com anotações\n\n**A regra "consumir como creator":**\nAntes de consumir conteúdo: "Se eu fosse criar algo sobre esse tema, isso me ajudaria?" Se sim, consuma com atenção e anote. Se não, provavelmente é entretenimento passivo disfarçado de aprendizado.', 10);

  -- DAY 21
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 21, 'Semana 3 completa', E'3 semanas de Digital Minimalism. Seu sistema: deep work + time blocking + batching + shutdown + transições + meditação + hobby + sabbath.\n\n**Review semana 3:**\n1. Deep work total: ___h (vs Semana 2)\n2. Meditação: ___/7 dias, ___ min total\n3. Hobby analógico: ___h na semana\n4. Conexões reais (presenciais/ligações): ___\n5. Sabbath digital completado?\n6. Screen time: ___h/dia\n7. % do tempo de tela: ___% útil, ___% entretenimento, ___% compulsivo\n8. Como me sinto comparado ao Dia 1 do N1?\n\n**Badge: "Vida Offline Construída"**', true, 15);

  -- DAY 22
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 22, 'Slow productivity', E'Cal Newport (2024) — "Slow Productivity": fazer menos coisas, trabalhar no ritmo natural, obsessar com qualidade. O oposto da cultura de hustle.\n\n**3 princípios:**\n1. **Faça menos coisas:** Menos projetos simultâneos. Mais foco em cada um\n2. **Trabalhe no ritmo natural:** Períodos de alta intensidade + descanso real\n3. **Obsesse com qualidade:** 1 coisa extraordinária > 10 mediocres\n\n**Exercício — Revisão de compromissos:**\nListe todos os projetos/compromissos ativos. Para cada:\n- Essencial? → Manter\n- Importante mas não urgente? → Agendar\n- "Legal" mas não essencial? → Reconsiderar\n- Obrigação social/inércia? → Eliminar ou delegar\n\nComece a soltar o que não é essencial.', 15);

  -- DAY 23
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 23, 'Computador como ferramenta', E'O celular está sob controle. Mas e o computador? Muitos problemas de atenção migram do celular para o notebook.\n\n**Protocolo de computador minimalista:**\n1. **Desktop limpo:** Apenas ícones essenciais\n2. **Abas:** Máximo 5 durante deep work. Resto: fechar\n3. **Email:** Apenas nos blocos de batching. NÃO fica aberto "de fundo"\n4. **Bloqueadores:** Instale bloqueador durante deep work (Cold Turkey, Freedom, LeechBlock)\n5. **Notificações desktop:** TODAS desligadas (Slack, email, redes)\n6. **Perfis separados:** Um perfil de navegador para trabalho (sem login em redes), outro pessoal\n\nAplique os mesmos princípios do celular: fricção, intencionalidade, limites.', 15);

  -- DAY 24
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 24, 'Meditação: 10 minutos', E'Subir de 5 para 10 min. Se 5 min estava fluindo, 10 será desafiador mas possível.\n\nMesma técnica: foco na respiração, redirecionar quando vagar.\n\n**Dicas para 10 min:**\n- Use timer sem tela (timer de cozinha, app minimalista)\n- Se a mente estiver muito agitada, conte as respirações de 1 a 10 e recomece\n- Não julgue sessões "ruins" — toda sessão onde você sentou conta como treino\n- Se perder um dia, volte no seguinte sem culpa\n\n**A ciência:** Estudos mostram benefícios mensuráveis de mindfulness a partir de 10 min/dia consistentes. Redução de cortisol, melhora na regulação emocional, e aumento na capacidade de atenção sustentada.\n\nMantenha todos os hábitos + deep work de 120 min.', 15);

  -- DAY 25
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 25, 'Construa seu manifesto digital', E'Hoje você escreve seu manifesto pessoal de uso de tecnologia. Não regras impostas — princípios que VOCÊ escolhe.\n\n**Meu Manifesto de Digital Minimalism:**\n\n1. Tecnologia serve para: ___\n2. Eu uso celular para: ___ (apenas usos intencionais)\n3. Eu NÃO uso celular para: ___ (o que eliminei)\n4. Meu limite diário de tela: ___h\n5. Meus horários de mensagens: ___\n6. Meu horário de shutdown: ___\n7. Meu sabbath digital: ___ dia\n8. Meu hobby analógico principal: ___\n9. Minha regra #1 para redes sociais: ___\n10. A pessoa que quero ser em relação a tecnologia: ___\n\nEscreva no papel. Guarde em lugar visível. Este é seu norte.', 15);

  -- DAY 26
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 26, 'Deep work: buscar recorde', E'Tente seu maior bloco contínuo. Meta: 150 min ou mais (2h30).\n\nEscolha um projeto especial para esse bloco — algo que exige seu melhor trabalho.\n\n**Dicas para blocos longos:**\n- Prepare tudo antes: água, café, material, ambiente\n- Avise que estará indisponível\n- Comprometa-se com os primeiros 30 min. Depois disso o flow tende a aparecer\n- Se precisar de pausa, faça 5 min de pé e volte\n\nRegistre no journaling: duração, nível de foco, o que produziu. Este pode ser o momento mais produtivo dos 30 dias.', 5);

  -- DAY 27
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 27, 'Descanso + sabbath', E'Sabbath digital completo — o último do programa guiado.\n\nObserve: já ficou natural? Compare com o primeiro sabbath do N1. A diferença de desconforto mostra o quanto seu cérebro mudou.\n\nSe o primeiro sabbath foi difícil e este é tranquilo, você internalizou o digital minimalism.\n\nMantenha meditação de 10 min e hobby analógico. Aproveite o dia para conexões reais.', 5);

  -- DAY 28
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 28, 'Seu protocolo final', E'Montando seu sistema permanente.\n\n**Protocolo permanente recomendado:**\n\n**Diário:**\n- Phone-free morning (60 min)\n- 2 blocos deep work (90-120 min cada)\n- Time blocking pela manhã\n- Batching 2-3x/dia\n- Shutdown em horário fixo\n- Toque de recolher 1h antes de dormir\n- Celular fora do quarto\n- Meditação 10 min\n- Hobby analógico 30+ min\n\n**Semanal:**\n- Sabbath digital (meio dia ou dia inteiro)\n- Review semanal\n- 1 conexão presencial significativa\n\n**Mensal:**\n- Auditoria de apps e ferramentas\n- Review de screen time trends\n- Ajuste de limites\n\n**O mínimo inegociável:** Deep work + shutdown + meditação. Se tudo mais falhar, mantenha esses 3.', 15);

  -- DAY 29
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 29, 'Reflexão profunda', E'Penúltimo dia. Olhe para trás — não 30 dias, mas 60.\n\n**Reflexão completa (N1 + N2):**\n1. Screen time Dia 1 do N1: ___h → Hoje: ___h\n2. Redução total: ___h/dia = ___h/semana = ___h/mês recuperadas\n3. Deep work semanal: 0h → ___h\n4. Como durmo comparado a 60 dias atrás?\n5. Como está meu foco comparado a 60 dias atrás?\n6. O que faço com o tempo que ganhei?\n7. Quem sou em relação à tecnologia vs quem era?\n8. O que me surpreendeu?\n9. O que ainda é difícil?\n10. O que digo a alguém que quer começar?', 15);

  -- DAY 30
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 30, 'Graduação: Digital Minimalism', E'60 dias de transformação digital completos. De ~9h/dia em telas sem intenção para deep work, time blocking, batching e vida offline significativa.\n\n**Transformação N1 + N2:**\n- Screen time: ~8-9h → ~4h → ~2-3h\n- Deep work diário: 0h → 0h → 3-4h\n- Sistema de produtividade: nenhum → básico → completo\n- Meditação: nunca → nunca → 10 min/dia\n- Hobby analógico: raro → genérico → estruturado\n- Shutdown ritual: não → não → diário\n- Sabbath digital: nunca → 1x/sem → natural\n- Relação com tecnologia: viciado → consciente → intencional\n\n**Hábitos ativos acumulados: 18**\n\nVocê é um minimalista digital. Tecnologia trabalha para você, não contra.\n\n**Badge Final: "Digital Minimalist"**', 15);

  -- ============================================
  -- 3. Habit Templates
  -- ============================================

  -- 1. Deep work block (Day 1 → end, timer, progressive 90→120 min)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, 'Deep work block', '🎯', 'mente', 'morning', 'timer', 'minutes', 90, 1, NULL, 'daily',
   '[{"from_day":9,"goal_value":120}]'::jsonb,
   'deep_work_block', 1);

  -- 2. Journaling de foco (Day 1 → end, checkbox)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Journaling de foco', '📝', 'mente', 'evening', 'checkbox', 1, NULL, 'daily', 'focus_journaling', 2);

  -- 3. Time blocking (Day 3 → end, checkbox)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Time blocking', '📋', 'mente', 'morning', 'checkbox', 3, NULL, 'daily', 'time_blocking', 3);

  -- 4. Batching (Day 5 → end, checkbox)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Batching de mensagens', '📥', 'mente', 'evening', 'checkbox', 5, NULL, 'daily', 'message_batching', 4);

  -- 5. Shutdown ritual (Day 8 → end, checkbox)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Shutdown ritual', '🚫', 'mente', 'evening', 'checkbox', 8, NULL, 'daily', 'shutdown_ritual', 5);

  -- 6. Ritual de transição (Day 10 → end, checkbox)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Ritual de transição', '🔄', 'mente', 'morning', 'checkbox', 10, NULL, 'daily', 'transition_ritual', 6);

  -- 7. Hobby analógico dedicado (Day 12 → end, timer, 30 min)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Hobby analógico dedicado', '🌿', 'mente', 'afternoon', 'timer', 'minutes', 30, 12, NULL, 'daily', 'analog_hobby', 7);

  -- 8. Meditação/mindfulness (Day 15 → end, timer, progressive 5→10 min)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, 'Meditação', '🧘', 'mente', 'morning', 'timer', 'minutes', 5, 15, NULL, 'daily',
   '[{"from_day":24,"goal_value":10}]'::jsonb,
   'meditation', 8);

END $$;
