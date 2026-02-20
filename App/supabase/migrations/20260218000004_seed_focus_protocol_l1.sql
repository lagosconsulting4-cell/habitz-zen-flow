-- ============================================
-- SEED: Focus Protocol L1 — "Domine Sua Atenção"
-- ============================================
-- NOTE: The journeys row for 'focus-protocol-l1' already exists
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
  SELECT id INTO v_journey_id FROM public.journeys WHERE slug = 'focus-protocol-l1';

  -- ============================================
  -- 1. Phases
  -- ============================================

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 1, 'DIAGNÓSTICO', 'Veja onde sua atenção vai', E'Medir o estado atual, entender padrões de distração, estabelecer o primeiro hábito de deep work.', 1, 7, 'focus-protocol-phase-1', 'Primeiros Blocos')
  RETURNING id INTO v_phase1_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 2, 'SISTEMA', 'Monte seu protocolo', E'Time blocking, Pomodoro/Flowmodoro, ambiente otimizado, técnicas de aprendizado.', 8, 14, 'focus-protocol-phase-2', 'Sistema Montado')
  RETURNING id INTO v_phase2_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 3, 'EXPANSÃO', 'Aumente a capacidade', E'Expandir duração das sessões, incorporar técnicas avançadas, deep work + aprendizado ativo.', 15, 22, 'focus-protocol-phase-3', 'Foco Expandido')
  RETURNING id INTO v_phase3_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 4, 'CONSOLIDAÇÃO', 'Foco no piloto automático', E'Automatizar rotinas, protocolo permanente, graduação.', 23, 30, 'focus-protocol-phase-4', 'Atenção Dominada')
  RETURNING id INTO v_phase4_id;

  -- ============================================
  -- 2. Journey Days (30 days)
  -- ============================================

  -- DAY 1
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 1, 'Seu primeiro bloco de foco', E'Hoje você vai fazer algo que a maioria das pessoas não consegue: sentar e focar em UMA coisa por 25 minutos sem tocar no celular.\n\n**O DIAGNÓSTICO — Antes de começar:**\n- Quantas vezes por dia você checa o celular? ___\n- Quanto tempo consegue focar antes de se distrair? ___ min\n- Última vez que leu algo por 30+ minutos sem parar: ___\n- Quantas abas do navegador estão abertas agora? ___\n\nGuarde essas respostas. Vamos comparar no Dia 30.\n\n**SEU PRIMEIRO BLOCO DE DEEP WORK:**\n1. Escolha UMA tarefa que exige concentração real\n2. Ative modo avião. Celular em outro cômodo\n3. Feche TUDO no computador não relacionado à tarefa\n4. Timer de 25 minutos (Pomodoro clássico)\n5. Trabalhe até o timer tocar — sem exceção\n6. Pausa de 5 min — NÃO cheque o celular\n\n**O que provavelmente vai acontecer:**\n- Primeiros 5 min: impulso quase irresistível de checar o celular\n- 10 min: pensamentos aleatórios\n- 15 min: começa a relaxar e entrar no ritmo\n- 25 min: timer toca — pode estar começando a pegar o flow\n\n**A ciência:** Cada vez que olha o celular, mesmo por 1 segundo, introduz um "resíduo de atenção" que leva ~10 min para dissipar.', 30);

  -- DAY 2
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 2, 'A tarefa #1 do dia', E'A maioria das pessoas começa o dia reagindo — checando email, redes, mensagens. Pessoas produtivas começam AGINDO no que mais importa.\n\n**NOVO HÁBITO — Tarefa #1 do dia:**\nAntes de abrir qualquer coisa, defina: "Qual é a ÚNICA coisa que, se eu completar hoje, faz o dia valer a pena?"\n\nEssa é sua Tarefa #1. Ela recebe seu PRIMEIRO bloco de deep work.\n\n**Regras da Tarefa #1:**\n- Deve ser específica ("escrever seção 2 do relatório", não "trabalhar no relatório")\n- Deve exigir concentração real\n- Deve ser completável em 1-3 blocos de deep work\n- Deve ser definida na NOITE ANTERIOR ou logo ao acordar\n\n**Protocolo matinal:**\n1. Acordar\n2. NÃO pegar celular (primeiros 30 min se possível)\n3. Rotina básica (água, café, banheiro)\n4. Definir Tarefa #1\n5. Primeiro bloco de deep work (25 min)\n6. SÓ DEPOIS: email, mensagens, redes\n\n**Deep work hoje:** 2 blocos de 25 min.', 55);

  -- DAY 3
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 3, 'O mapa de distração', E'Além dos blocos de deep work, hoje você vai mapear EXATAMENTE o que te distrai.\n\n**EXERCÍCIO — Mapa de distração:**\nDurante TODO o dia, anote cada distração:\n\n| Hora | O que fazia | Distração | Como surgiu | Duração |\n|------|------------|-----------|-------------|----------|\n\n**Categorias comuns:**\n- 📱 Celular: notificações, "checagem rápida"\n- 💬 Mensagens: WhatsApp, Telegram, Discord\n- 📱 Redes sociais: Instagram, TikTok, Twitter/X\n- 🎵 Entretenimento: YouTube, Netflix, Spotify\n- 🧠 Pensamentos: devaneios, "preciso fazer X"\n- 👥 Pessoas: interrupções presenciais\n\n**No final do dia, analise:**\n- Quantas vezes se distraiu: ___\n- Distração #1 mais frequente: ___\n- Tempo total estimado perdido: ___ min\n- Gatilho mais comum: ___\n\nEsse mapa é seu diagnóstico. Amanhã trabalhamos nos antídotos.', 55);

  -- DAY 4
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 4, 'O antídoto: ambiente', E'Você não precisa de mais força de vontade. Precisa de um ambiente que FORCE o foco.\n\n**NOVO HÁBITO — Hora de dormir:** Registre o horário que vai dormir. Sono é o alicerce do foco. Meta: 7-9 horas por noite.\n\n**Montando seu ambiente de deep work:**\n\n**1. Celular:**\n- Deep work: modo avião + celular em OUTRO CÔMODO\n- Desative TODAS as notificações de redes sociais\n\n**2. Computador:**\n- Feche abas não relacionadas à tarefa\n- Use bloqueadores: Cold Turkey, Freedom, Forest\n- Fullscreen na aplicação que está usando\n\n**3. Espaço físico:**\n- Mesa limpa — só o essencial\n- Lugar ESPECÍFICO para deep work\n- Fone com cancelamento de ruído ou lo-fi\n\n**4. Pessoas:**\n- Avise: "estou focado das X às Y"\n- Porta fechada + fone = sinal universal de "não interromper"\n\n**Regra fundamental:** Torne o foco o caminho de MENOR resistência e a distração o caminho de MAIOR resistência.\n\n**Deep work hoje:** 2 blocos de 25 min no ambiente otimizado.', 55);

  -- DAY 5
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 5, 'Bloco sem celular', E'Além do deep work, vamos expandir momentos sem celular para FORA do trabalho. O objetivo é retreinar seu cérebro para tolerar o tédio.\n\n**NOVO HÁBITO — Bloco sem celular:**\nUm período FORA do deep work em que o celular fica guardado. Pode ser durante refeição, caminhada, treino, ou 30 minutos sem estímulo digital.\n\n**Por quê?** Seu cérebro precisa de momentos de "não-estímulo" para processar informação e restaurar a capacidade de foco.\n\n**Comece com:**\n- Refeições sem celular\n- Deslocamento sem fone de ouvido\n- 30 min antes de dormir sem telas\n\n**Registre:** total de minutos sem celular fora do deep work.\n\n**Deep work hoje:** 2 blocos de 25 min + tente um de 30 min.', 65);

  -- DAY 6
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, motivational_note, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 6, 'THE CLIFF do foco', E'Se está achando difícil manter os blocos de deep work, se voltou a checar o celular "rapidinho" — parabéns, encontrou o CLIFF.\n\n**O CLIFF do foco:**\n- "É muito difícil ficar sem celular" → É. E vai ficar mais fácil. Primeiros 5-7 dias são os piores\n- "25 minutos é pouco, nem vale a pena" → 25 min de foco real > 3 horas de trabalho distraído\n- "Não consigo me concentrar" → Você CONSEGUE — o ambiente é que está sabotando\n\n**O mínimo inegociável:**\n1. 1 bloco de 25 min de deep work\n2. Celular fora do alcance durante o bloco\n3. Tarefa #1 definida\n\nSe fizer SÓ isso, já está melhor que 90% das pessoas da sua idade.\n\n**Deep work hoje:** Pelo menos 2 × 25 min. Se conseguir: tente 1 × 35 min.', true, 'Os primeiros 5-7 dias são os mais difíceis. A partir daqui fica mais fácil. Continue.', 55);

  -- DAY 7
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 7, 'Review semanal #1', E'Primeira semana completa. Hora de medir o progresso.\n\n**NOVO HÁBITO — Leitura focada:** Ler algo por pelo menos 15-20 minutos sem interrupção. Sem celular. A leitura profunda é a forma mais pura de treino de atenção.\n\n**Review semanal #1:**\n1. Total de minutos de deep work na semana: ___ min\n2. Média diária: ___ min\n3. Quantos blocos completou sem distração: ___/___\n4. Distração #1 da semana: ___\n5. Tarefa #1 completada quantos dias: ___/7\n6. Hora média de dormir: ___:___\n7. Nota de capacidade de foco (1-10): ___\n\n**Compare com o Dia 1:**\n- Impulso de checar celular: Mais forte / Igual / Menor\n- Facilidade de entrar em foco: Mais fácil / Igual / Mais difícil\n- Sensação de produtividade: Melhor / Igual / Pior', true, 30);

  -- DAY 8
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 8, 'Time blocking: planeje o dia em blocos', E'Cal Newport diz que to-do lists são enganosas. A alternativa: planejar o dia INTEIRO em blocos de tempo.\n\n**NOVO HÁBITO — Time blocking:**\nNa noite anterior ou logo cedo, planeje seu dia em blocos:\n\n06:30-07:00 Acordar, rotina\n07:00-08:30 🎯 DEEP WORK — Tarefa #1\n08:30-09:00 Pausa (café, mensagens)\n09:00-10:00 🎯 DEEP WORK — Tarefa #2\n10:00-10:30 Shallow work\n12:00-13:00 Almoço (sem celular)\n18:00-19:00 Treino\n22:00-22:30 Desligar telas, planejar amanhã\n\n**Regras:**\n- Deep work PRIMEIRO — nos horários em que seu cérebro está mais fresco\n- Shallow work agrupado em blocos específicos\n- Pausas SÃO blocos — planeje-as\n- Flexibilidade: quando mudar, REPLANEJE — não abandone o sistema\n\n**Deep work hoje:** 3 blocos (2 × 25 min + 1 × 30 min). Total: 80 min.', 85);

  -- DAY 9
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 9, 'Pomodoro vs Flowmodoro', E'Dois métodos principais para estruturar deep work. Teste ambos essa semana.\n\n**MÉTODO 1 — Pomodoro clássico:**\n25 min foco → 5 min pausa → repita 4x → pausa longa 15-30 min\nMelhor para: tarefas que exigem disciplina para começar, procrastinadores\n\n**MÉTODO 2 — Flowmodoro:**\nInicie um cronômetro. Trabalhe até SENTIR que o foco está quebrando. Pausa = 1/5 do tempo focado.\nMelhor para: tarefas criativas, programação, escrita\n\n**MÉTODO 3 — Blocos de 50-90 min (ciclo ultradiano):**\n50-90 min de foco → 15-20 min de pausa real\nMelhor para: deep work avançado, quando já tem prática\n\n**Hoje, experimente:**\n- Manhã: 2 Pomodoros clássicos (25+5, 25+5)\n- Tarde: 1 sessão Flowmodoro (cronômetro, pare quando sentir)\n\nCompare: em qual se sentiu mais produtivo?', 85);

  -- DAY 10
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 10, 'Active recall: aprenda de verdade', E'A maioria estuda errado. Reler e grifar são métodos PASSIVOS. Active recall é o oposto: força o cérebro a RECUPERAR a informação.\n\n**NOVO HÁBITO — Active recall:**\n\n**Técnica 1 — Blurting:**\n1. Estude um conceito por 10-15 min\n2. Feche o material\n3. Escreva TUDO que lembra (sem consultar)\n4. Compare com o material. Os gaps são exatamente o que precisa revisar\n\n**Técnica 2 — Flashcards:**\nCrie perguntas sobre o que estudou. Tente responder sem olhar. Use Anki ou Brainscape.\n\n**Técnica 3 — Ensine para alguém (Técnica Feynman):**\nExplique o conceito como se ensinasse para um amigo. Se não consegue explicar com clareza → não aprendeu.\n\n**A ciência:** Active recall + repetição espaçada = a combinação mais poderosa comprovada para aprendizado duradouro.\n\n**Exercício de hoje:** Após deep work de estudo, feche o material. Pegue folha em branco. Escreva tudo que lembra por 5 min. Compare.', true, 85);

  -- DAY 11
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 11, 'Cafeína, sono e combustível do foco', E'Técnicas de foco são o software. Sono, alimentação e cafeína são o hardware.\n\n**Sono — O alicerce (não negociável):**\n- Meta: 7-9 horas, horário consistente\n- Sono é quando o cérebro consolida memórias\n- Sem telas 30-60 min antes de dormir\n\n**Cafeína — Uso estratégico:**\n- Café 30 min antes do primeiro bloco de deep work\n- REGRA: zero cafeína após o almoço\n- 1-2 xícaras/dia é suficiente\n\n**Exercício — O booster natural:**\n- 20-30 min de exercício antes de estudo potencializa retenção\n- Exercício aumenta BDNF (fator neurotrófico) que melhora aprendizado\n\n**Alimentação básica para o cérebro:**\n- Evite picos de açúcar → crash de foco\n- Hidratação: desidratação leve já reduz performance cognitiva\n- Refeições regulares', true, 85);

  -- DAY 12
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 12, 'Shallow work: organizando o lixo', E'Emails, mensagens, organização — tudo precisa ser feito. Mas NÃO no horário de deep work.\n\n**O protocolo anti-invasão:**\n\n**1. Batching:** Agrupe mensagens em 2-3 momentos:\n- Manhã (após primeiro deep work): 15-20 min\n- Almoço: 15 min\n- Final da tarde: 15-20 min\n- FORA desses horários: notificações silenciadas\n\n**2. Regra dos 2 minutos:** Se leva <2 min: faça agora. Se leva mais: anote e execute no bloco de shallow work.\n\n**3. Shutdown ritual:**\n1. Cheque email/mensagens uma última vez\n2. Anote tarefas pendentes para amanhã\n3. Defina Tarefa #1 de amanhã\n4. Diga: "shutdown completo"\n5. PARE de trabalhar. O cérebro precisa de descanso para consolidar.', true, 85);

  -- DAY 13
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, motivational_note, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 13, 'Progressão: expandindo os blocos', E'Duas semanas de prática. Hora de aumentar a carga.\n\n**Progressão do deep work:**\n\n| Semana | Sessão alvo | Total/dia |\n|--------|-------------|----------|\n| 1 (Dias 1-7) | 2 × 25 min | 50 min |\n| 2 (Dias 8-14) | 2-3 × 30-40 min | 60-120 min |\n| 3 (Dias 15-22) | 2-3 × 45-60 min | 90-180 min |\n| 4 (Dias 23-30) | 2 × 60-90 min | 120-180 min |\n\n**Meta Nível 1:** 90-120 min de deep work diário consistente.\n\n**Como expandir:**\n- Aumente 5-10 min por sessão a cada 2-3 dias\n- Se difícil, volte ao tempo anterior — sem culpa\n- Qualidade > duração: 45 min de foco real > 90 min com distrações\n\n**Hoje, tente:** 1 bloco de 40 min + 1 bloco de 30 min = 70 min total.', true, 'Duas semanas de consistência. A maioria desiste aqui. Você é diferente.', 75);

  -- DAY 14
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 14, 'Review semanal #2', E'Duas semanas. Você tem sistema, ambiente e técnica.\n\n**NOVO HÁBITO — Revisão espaçada:** Revise algo que aprendeu há 3-7 dias usando active recall. Não releia — tente lembrar primeiro.\n\nFrequência ideal: 1 dia → 3 dias → 7 dias → 14 dias → 30 dias\n\n**Review semanal #2:**\n1. Total de deep work na semana: ___ min\n2. Média diária: ___ min (meta: 60+ min)\n3. Método preferido: Pomodoro / Flowmodoro / Blocos 50-90 min\n4. Tarefa #1 completada: ___/7 dias\n5. Active recall praticado: ___/7 dias\n6. Hora média de dormir: ___:___\n7. Nota de capacidade de foco (1-10): ___', true, 30);

  -- DAY 15
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 15, 'O bloco de 60 minutos', E'Hoje você vai tentar: 60 minutos de foco ininterrupto.\n\n**Protocolo para sessão longa (60 min):**\n\n1. **Preparação (5 min):** Banheiro, água, café pronto, celular em outro cômodo, ambiente limpo\n2. **Min 1-15:** Aquecimento — resista impulsos de distração\n3. **Min 15-45:** Zona de flow — NÃO interrompa\n4. **Min 45-60:** Segundo fôlego ou fadiga — tente manter até os 60\n5. **Pausa (15 min):** Levante, caminhe. NÃO cheque celular nos primeiros 5 min\n\n**Se não conseguir 60 min:** Faça 2 × 30 min com 5 min de pausa. O objetivo é progressão, não perfeição.', 75);

  -- DAY 16
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 16, 'Interleaving: misture para aprender melhor', E'Estudar um assunto de cada vez parece mais eficiente — mas NÃO é. Misturar assuntos (interleaving) produz aprendizado mais profundo.\n\n**Interleaving — O que é:**\nEm vez de A por 2h, depois B por 2h:\nA por 30 min → B por 30 min → C por 30 min → A de novo\n\n**Por que funciona:**\n- Força o cérebro a discriminar entre conceitos\n- Cria "dificuldade desejável" que fortalece a memória\n- Parece mais difícil, mas produz retenção muito superior\n\n**Combine com active recall:**\n- 30 min Tema A → 5 min blurting A\n- 30 min Tema B → 5 min blurting B\n- 10 min blurting MISTURADO (A + B juntos)', 75);

  -- DAY 17
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 17, 'Chunking: quebre o elefante', E'Projetos grandes são a principal causa de procrastinação. O cérebro vê "escrever TCC" como ameaça — e ativa evitação. A solução é chunking.\n\n**Chunking — O princípio:**\nQuebrar em pedaços mastigáveis. Cada pedaço = 1 Pomodoro.\n\n**Exemplo — "Estudar para a prova":**\n❌ Vago: "Estudar para a prova de quinta"\n✅ Chunked:\n- [ ] Revisar capítulo 3 (30 min)\n- [ ] Fazer flashcards do cap. 3 (20 min)\n- [ ] Resolver exercícios 1-10 (40 min)\n- [ ] Blurting dos conceitos-chave (10 min)\n\nDe repente, "estudar para a prova" virou 4 tarefas pequenas e concretas.\n\n**A regra: se a tarefa leva mais de 30 min E não tem passo seguinte claro → precisa de chunking.**', 75);

  -- DAY 18
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 18, 'Meditação de foco', E'Meditação não é "esvaziar a mente". É o treino mais puro de atenção: focar em uma coisa, notar quando distraiu, trazer de volta. É flexão de foco.\n\n**Mini-meditação de foco (5-10 min):**\n1. Sente confortável, olhos fechados\n2. Foque na respiração: inspire 4s, expire 4s\n3. Quando pensamento surgir: note sem julgamento\n4. Traga atenção de volta para a respiração\n5. Repita por 5-10 min\n\n**O que treina:**\n- Notar que se distraiu (metacognição)\n- Redirecionar atenção voluntariamente\n- Tolerância ao desconforto de não ter estímulo\n\n**Quando fazer:** Antes do primeiro bloco de deep work ou antes de dormir.\n\n**Se achar difícil:** Use apps guiados (Headspace, Calm) ou timer de 5 min focando na respiração.', 75);

  -- DAY 19
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 19, 'Pensamento produtivo: foco OFF-screen', E'Newport chama de "productive meditation": usar tempo de não-trabalho para pensar ATIVAMENTE sobre um problema.\n\n**Como funciona:**\n1. Escolha UM problema/questão\n2. Durante atividade física simples (caminhar, correr), PENSE ativamente\n3. Quando a mente divagar, traga de volta ao problema\n4. Ao terminar, anote insights\n\n**Por que funciona:**\n- Default Mode Network faz conexões criativas sem estímulos externos\n- Sem celular nesses momentos, o cérebro processa informações de fundo\n- Muitos "eurekas" surgem nesses momentos — não sentado na frente da tela', 75);

  -- DAY 20
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 20, 'O stack completo de aprendizado', E'Vamos juntar tudo: a sessão de estudo perfeita baseada em evidência.\n\n**O Stack Completo — Sessão de aprendizado de 90 min:**\n\n[0-5 min] PREPARAÇÃO — Defina objetivo, ambiente limpo, mini-meditação\n[5-35 min] ABSORÇÃO ATIVA — Estude o material, anote conceitos-chave\n[35-45 min] ACTIVE RECALL #1 — Feche material, blurting, identifique gaps\n[45-50 min] PAUSA — Levante, alongue, água. NÃO cheque celular\n[50-75 min] APROFUNDAMENTO — Revise gaps, exercícios, interleave\n[75-85 min] ACTIVE RECALL #2 — Teste-se, crie flashcards\n[85-90 min] ENCERRAMENTO — Resuma em 3-5 pontos, agende revisão espaçada\n\nUse esse stack para qualquer tipo de estudo.', 95);

  -- DAY 21
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 21, 'Review semanal #3', E'Três semanas. Se seguiu consistentemente, seu foco já é incomparavelmente melhor.\n\n**Review semanal #3:**\n1. Total de deep work na semana: ___ min\n2. Sessão mais longa sem distração: ___ min\n3. Método que uso mais: Pomodoro / Flowmodoro / Blocos longos\n4. Active recall: ___/7 dias\n5. Revisão espaçada: praticada? Sim/Não\n6. Time blocking: ___/7 dias\n7. Leitura focada: ___ páginas/min esta semana\n8. Hora média de dormir: ___:___\n9. Nota de capacidade de foco (1-10): ___\n\n**Progresso do bloco de deep work:**\n- Dia 1: 25 min (máximo)\n- Dia 21: ___ min (máximo)\n- Evolução: +___ min', true, 30);

  -- DAY 22
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 22, 'Seu ritual de deep work', E'Os melhores não dependem de motivação — dependem de rituais. Hoje você cristaliza seu ritual pessoal.\n\n**Monte SEU ritual:**\n\n**Antes da sessão:**\n- Horário fixo: ___:___\n- Local: ___\n- Preparação: água, café, celular fora, bloqueadores, fone\n- Mini-meditação: ___ min\n\n**Durante a sessão:**\n- Método: Pomodoro ___ min / Flowmodoro / Bloco ___ min\n- Tarefa #1 definida\n- Regra se surgir distração: anotar e voltar\n\n**Depois da sessão:**\n- Active recall / blurting\n- Registrar no dashboard\n- Pausa de ___ min\n\n**O poder do ritual:** Com o tempo, sentar na cadeira, colocar fone e ligar o timer JÁ ativa o estado de concentração.', 90);

  -- DAY 23
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 23, 'Lidando com dias ruins', E'Vai ter dias em que não vai querer focar. O sistema precisa funcionar nesses dias TAMBÉM.\n\n**Protocolo para dias ruins:**\n\n**Nível 1 — "Cansado mas consigo":**\n- Sessão de 25 min (Pomodoro básico)\n- 1-2 blocos ao invés de 3\n- Tarefa mais fácil como Tarefa #1\n- Mantenha o ritual completo\n\n**Nível 2 — "Não consigo me concentrar":**\n- APENAS 1 bloco de 15 min\n- Se nem 15 min: 10 min de leitura focada\n- O objetivo é manter o HÁBITO\n\n**Nível 3 — "Preciso de descanso real":**\n- Zero deep work, mas mantenha sono e exercício\n- Máximo 1 dia/semana de descanso total\n\n**A regra de ouro:** Nunca falte 2 dias seguidos.', 90);

  -- DAY 24
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 24, 'Foco social: deep work com os outros', E'Body doubling: a presença de outra pessoa focando faz VOCÊ focar mais.\n\n**Body doubling — Como usar:**\n- Estude com um amigo (ambos em silêncio)\n- Use plataformas de co-working virtual (Focusmate)\n- Vá para biblioteca/café/coworking\n\n**Por que funciona:**\n- Accountability social\n- Reduz isolamento do deep work\n- Pressão social positiva contra distração\n\n**Estudo em grupo eficiente:**\n❌ 4 amigos "estudando" conversando o tempo todo\n✅ 4 amigos estudando em silêncio, com pausas para discutir', 90);

  -- DAY 25
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 25, 'A sessão de 90 minutos', E'O ciclo ultradiano é de ~90 minutos. Se treinou consistentemente, hoje tenta uma sessão completa.\n\n**Protocolo 90 min:**\n\n1. Preparação completa (ritual)\n2. Mini-meditação (3-5 min)\n3. INÍCIO — Tarefa #1\n4. Min 1-20: aquecimento, impulsos normais\n5. Min 20-60: ZONA DE FLOW\n6. Min 60-80: segundo fôlego — pode sentir fadiga\n7. Min 80-90: encerramento natural\n8. PAUSA COMPLETA: 20-30 min. Caminhe, saia de casa\n\n**Se não conseguir 90 min:** 60 + pausa + 30 = 90 min divididos.\n\n**Após o bloco:** Não espere render outro de 90 min logo em seguida. 2 sessões de 90 min/dia = limite prático. Isso é MUITO.', 95);

  -- DAY 26
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 26, 'Audit de progresso', E'Vamos comparar onde você está com onde começou.\n\n**Comparação Dia 1 vs Dia 26:**\n\n| Métrica | Dia 1 | Dia 26 |\n|---------|-------|--------|\n| Sessão máxima de foco | ___ min | ___ min |\n| Deep work diário total | ___ min | ___ min |\n| Checagens de celular/dia | ___ | ___ |\n| Consegue ler 30 min sem parar? | Sim/Não | Sim/Não |\n| Tem sistema de estudo? | Sim/Não | Sim/Não |\n| Usa active recall? | Sim/Não | Sim/Não |\n| Nota de foco (1-10) | ___ | ___ |', 90);

  -- DAY 27
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 27, 'Armadilhas do foco', E'Saber o que evitar é tão importante quanto saber o que fazer.\n\n**As 8 armadilhas mais comuns:**\n\n1. **Pseudo-produtividade:** Organizar pastas, fazer listas bonitas — tudo para EVITAR o trabalho real\n2. **Perfeccionismo do sistema:** Mais tempo otimizando do que USANDO\n3. **"Só mais uma pesquisa":** Consumir informação sem produzir nada\n4. **Multitasking:** Cada alternância = custo cognitivo de ~10 min\n5. **Notificações "essenciais":** Nenhuma é essencial durante 25-90 min\n6. **Guilty rest:** Descanso ineficaz → volta já cansado\n7. **Compensação heroica:** "Vou fazer 6h de deep work" → não vai, e se fizer, não sustenta\n8. **Comparação:** 3-4h de deep work REAL por dia é elite', 90);

  -- DAY 28
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 28, 'Review semanal #4 + Review mensal', E'**Review semanal #4:**\n1. Total de deep work: ___ min\n2. Sessão mais longa: ___ min\n3. Active recall: ___/7\n4. Time blocking: ___/7\n5. Hora média de dormir: ___:___\n\n**Review mensal completo:**\n1. Deep work total do mês: ___ min (~___h)\n2. Progressão: Dia 1 (___ min/sessão) → Dia 28 (___ min/sessão)\n3. Método preferido definitivo: ___\n4. Maior insight do mês: ___\n5. Maior obstáculo superado: ___\n6. Nota de foco (1-10): ___', true, 30);

  -- DAY 29
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 29, 'Seu protocolo permanente', E'O sistema que vai funcionar pelos próximos meses e anos.\n\n**DIÁRIO:**\n- [ ] Definir Tarefa #1\n- [ ] 2-3 sessões de deep work (90-180 min total)\n- [ ] Celular fora durante sessões\n- [ ] Time blocking\n- [ ] Active recall após estudo\n- [ ] Hora de dormir consistente\n- [ ] Bloco sem celular\n\n**SEMANAL:**\n- [ ] Review de foco (métricas, ajustes)\n- [ ] Revisão espaçada\n- [ ] Leitura focada (mínimo 1h/semana)\n- [ ] 1 sessão longa de 60-90 min\n\n**MENSAL:**\n- [ ] Audit de progresso\n- [ ] Ajustar intensidade dos blocos\n- [ ] Rever flashcards/material de revisão', 90);

  -- DAY 30
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 30, 'Graduação: Domine Sua Atenção', E'30 dias. De 25 minutos sofridos no Dia 1 para sessões de 60-90 minutos de foco profundo. Você retreinou sua atenção.\n\n**Transformação:**\n\n| Métrica | Início | Fim |\n|---------|--------|-----|\n| Foco máximo sem distração | ___ min | ___ min |\n| Deep work diário | 0 min | ___ min |\n| Ritual de deep work? | Não | Sim |\n| Active recall? | Não | Sim |\n| Time blocking? | Não | Sim |\n| Horário de sono consistente? | Não | Sim |\n| Nota de foco (1-10) | ___ | ___ |\n\n**O que você construiu:**\n- Capacidade de foco profundo sustentado (60-90 min)\n- Sistema de deep work com ritual, ambiente e método\n- Técnicas de aprendizado baseadas em evidência\n- Hábito de time blocking e planejamento diário\n- Consciência de distrações e protocolo anti-invasão\n\n**Próximo: Nível 2 — "Aprendizado Acelerado"** (memory palace, speed reading, produção de conhecimento)', 10);

  -- ============================================
  -- 3. Habit Templates
  -- ============================================

  -- Deep work session (Day 1-30, progressive goal: 25 min → 60 min → 90 min)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, 'Sessão de deep work', '🎯', 'mente', 'morning', 'timer', 'minutes', 25, 1, NULL, 'daily',
   '[{"from_day":8,"goal_value":40},{"from_day":15,"goal_value":60},{"from_day":23,"goal_value":90}]'::jsonb,
   'deep_work_session', 1);

  -- Airplane/DND mode (Day 1-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Modo avião/não perturbe', '📵', 'mente', 'morning', 'checkbox', 1, NULL, 'daily', 'focus_mode', 2);

  -- Task #1 of the day (Day 2-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Definir tarefa #1 do dia', '✍️', 'mente', 'morning', 'checkbox', 2, NULL, 'daily', 'daily_task_1', 3);

  -- Bedtime tracking (Day 4-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Hora de dormir', '😴', 'mente', 'evening', 'checkbox', 4, NULL, 'daily', 'bedtime_tracking', 4);

  -- Phone-free block (Day 5-30, progressive: 30 min → 45 min → 60 min)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, 'Bloco sem celular', '🧊', 'mente', 'afternoon', 'timer', 'minutes', 30, 5, NULL, 'daily',
   '[{"from_day":15,"goal_value":45},{"from_day":23,"goal_value":60}]'::jsonb,
   'phone_free_block', 5);

  -- Focused reading (Day 7-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, 'Leitura focada', '📖', 'mente', 'evening', 'timer', 'minutes', 15, 7, NULL, 'daily',
   '[{"from_day":15,"goal_value":20},{"from_day":23,"goal_value":30}]'::jsonb,
   'focused_reading', 6);

  -- Time blocking (Day 8-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Time blocking', '⏰', 'mente', 'morning', 'checkbox', 8, NULL, 'daily', 'time_blocking', 7);

  -- Active recall (Day 10-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Active recall', '🧠', 'mente', 'afternoon', 'checkbox', 10, NULL, 'daily', 'active_recall', 8);

  -- Spaced repetition (Day 14-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Revisão espaçada', '🔄', 'mente', 'afternoon', 'checkbox', 14, NULL, 'daily', 'spaced_repetition', 9);

  -- Weekly focus review (Day 7, weekly on Sunday)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, days_of_week, canonical_key, sort_order) VALUES
  (v_journey_id, 'Review semanal de foco', '📊', 'mente', 'evening', 'checkbox', 7, NULL, 'weekly', '{0}', 'weekly_focus_review', 10);

END $$;
