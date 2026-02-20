-- ============================================
-- SEED: Own Your Mornings L1 — "Domine Suas Manhas"
-- ============================================
-- NOTE: The journeys row for 'own-mornings-l1' already exists
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
  SELECT id INTO v_journey_id FROM public.journeys WHERE slug = 'own-mornings-l1';

  -- ============================================
  -- 1. Phases
  -- ============================================

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 1, 'FOUNDATION', 'Show up', E'Foco em tornar o sucesso inevitavel. Versao mais facil possivel de 3 habitos-chave, construindo experiencias de maestria para alimentar autoeficacia.', 1, 7, 'own-mornings-phase-1', 'Primeira Semana')
  RETURNING id INTO v_phase1_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 2, 'EXPANSION', 'Build momentum', E'Expandir duracao dos habitos estabelecidos e adicionar um novo elemento. Rotina matinal de 12-20 minutos.', 8, 14, 'own-mornings-phase-2', 'Momentum Construido')
  RETURNING id INTO v_phase2_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 3, 'CONSOLIDATION', 'Survive the cliff', E'Sem habitos novos. Aprofundar e proteger os existentes. Fase de maior risco com dias minimos planejados e reforco de identidade.', 15, 22, 'own-mornings-phase-3', 'Sobreviveu ao Precipicio')
  RETURNING id INTO v_phase3_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 4, 'INTEGRATION', 'Become him', E'Alcancar a rotina sustentavel final de 25-35 minutos e projetar o habito pos-programa.', 23, 30, 'own-mornings-phase-4', 'Graduacao Matinal')
  RETURNING id INTO v_phase4_id;

  -- ============================================
  -- 2. Journey Days (30 days)
  -- ============================================

  -- DAY 1
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 1, 'Sua primeira vitoria matinal', E'Hoje comeca com a versao mais facil possivel. Sucesso inevitavel.\n\n**Na noite anterior:**\n- Coloque o alarme 15 min mais cedo que seu horario atual\n- Celular no modo aviao, do outro lado do quarto\n- Deixe um copo e garrafa de agua ao lado da cama\n- Alarme de hora de dormir: 8 horas antes do alarme de acordar\n\n**Tarefas da manha:**\n1. Quando o alarme tocar, pes no chao e arrume a cama (2 min)\n2. Beba 500mL de agua (2 min)\n3. Saia para fora por 2 minutos. Apenas fique na luz do dia\n\n**Sem celular nos primeiros 15 minutos.**\n\n**Tempo total:** ~6 min\n\n**Habit stack:** Pes no chao -> arruma cama -> bebe agua -> sai para fora\n\n**A ciencia:** Luz solar matinal (3.000-100.000+ lux ao ar livre vs 50-500 lux dentro de casa) e o sinal mais poderoso para regular seu relogio biologico. A hidratacao repoe ~1-1.5L de agua perdidos durante o sono.', 6);

  -- DAY 2
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 2, 'Repita e se aproprie', E'Ontem voce apareceu. Isso e o jogo inteiro por enquanto.\n\n**Na noite anterior:**\nMesmo protocolo de hora de dormir. Reflexao no app: "Voce apareceu. Esse e o jogo inteiro hoje."\n\n**Tarefas da manha:**\nIgual ao Dia 1. Identico. Sem mudancas.\n- Pes no chao -> arruma cama -> 500mL agua -> 2 min ao ar livre\n- Foco em consistencia, nao em expansao\n- Nos 2 min la fora, perceba como a luz se sente\n\n**Tempo total:** ~6 min\n\n**A ciencia:** BJ Fogg: "Nao e a repeticao que cria habitos — e a emocao." Celebre cada conclusao.', 6);

  -- DAY 3
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 3, 'O primeiro teste real', E'Dia 3 e onde a maioria das pessoas desiste. Voce nao e a maioria.\n\n**Na noite anterior:**\nReview da sequencia de 3 dias. Notificacao do app: "Dia 3 e onde a maioria desiste. Voce nao e a maioria."\n\n**Tarefas da manha:**\nMesmo nucleo de tres habitos. Adicione: enquanto estiver la fora, faca **5 respiracoes profundas** (respiracao em caixa: 4 tempos inspirando, 4 segurando, 4 expirando, 4 segurando). Esse e o portal para meditacao — 60 segundos no total.\n\n**Tempo total:** ~7 min\n\n**A ciencia:** A respiracao em caixa ativa o sistema nervoso parasimpatico, reduzindo cortisol e preparando o cerebro para foco.', 7);

  -- DAY 4
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 4, 'Construindo a corrente', E'Cada dia completado e um elo na corrente. Nao quebre a corrente.\n\n**Na noite anterior:**\n- Mova o carregador do celular permanentemente para outro comodo\n- Deixe as roupas separadas para amanha\n\n**Tarefas da manha:**\nCama -> agua -> ao ar livre por **5 minutos** de luz solar (expandido de 2). Cinco respiracoes profundas la fora. Sem celular por 20 min.\n\n**Tempo total:** ~8 min\n\n**A ciencia:** A Resposta de Cortisol ao Despertar (CAR) e um aumento de 38-75% no cortisol que atinge o pico 30-45 min apos acordar. Luz solar matinal potencializa isso; uso do celular pode diminuir.', 8);

  -- DAY 5
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 5, 'Sua primeira anotacao no diario', E'Escrever clareia o pensamento. Hoje voce comeca com o minimo absoluto.\n\n**Na noite anterior:**\nColoque um caderno e caneta na mesa de cabeceira (ou abra o app de diario). Telas desligadas 30 min antes de dormir.\n\n**Tarefas da manha:**\nCama -> agua -> 5 min ao ar livre com respiracao -> sente-se e escreva **1 frase**: "Hoje sou grato por _____ porque _____."\nDepois escreva sua tarefa mais importante do dia.\n\n**Tempo total:** ~9 min\n\n**A ciencia:** Emmons & McCullough mostraram que gratidao aumenta otimismo e comportamento de exercicio. O formato "porque" produz bem-estar significativamente maior que simples listagem. A regra dos 2 minutos: journaling comeca no minimo absoluto (1 gratidao, 1 prioridade).', 9);

  -- DAY 6
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 6, 'Sabado: prove que transfere', E'Manhas de fim de semana separam turistas de moradores.\n\n**Na noite anterior:**\nColoque o alarme no maximo 1 hora mais tarde que o horario de dia de semana (gestao de jetlag social).\n\n**Tarefas da manha:**\nIgual ao Dia 5. Consistencia no fim de semana e o teste da Semana 1.\n\nMensagem do app: "Manhas de fim de semana separam turistas de moradores."\n\n**Tempo total:** ~9 min\n\n**A ciencia:** Jetlag social — a diferenca entre horario de sono na semana e no fim de semana — tem media de 2 horas para jovens adultos e correlaciona com depressao, obesidade e desempenho academico prejudicado. Nunca durma mais de 1 hora a mais nos fins de semana.', 9);

  -- DAY 7
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 7, 'Semana 1 completa', E'7 dias. Voce construiu a base.\n\n**Na noite anterior:**\nReview da Semana 1. O app celebra a sequencia de 7 dias com badge de marco. Prompt: "Qual foi a parte mais facil? Esse e seu habito-ancora agora."\n\n**Tarefas da manha:**\nIgual ao Dia 5/6. Apos a anotacao no diario, leia **1 pagina** de um livro (habito gateway de leitura). Sem celular por 25 min.\n\n**Tempo total:** ~10 min\n\n**Review da Semana 1:**\n1. Quantos dias voce completou a rotina?\n2. Qual habito foi mais facil?\n3. Qual habito foi mais dificil?\n4. Como esta dormindo? (1-10)\n5. Voce notou alguma mudanca de energia/humor?', true, 10);

  -- DAY 8
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 8, 'Expandindo a caminhada', E'Ficar parado na luz se transforma em caminhar na luz. Movimento + sol + fluxo optico.\n\n**Na noite anterior:**\nAjuste o alarme 15 min mais cedo que a Semana 1 (agora 30 min mais cedo que o baseline original). Hora de dormir tambem 15 min mais cedo.\n\n**Tarefas da manha:**\nCama -> agua -> **caminhada ao ar livre de 10 minutos** (substitui ficar parado; ritmo acelerado, 5.5-6.5 km/h). Volte -> diario: 2 gratidoes com "porque" + 1 prioridade principal. Sem celular 30 min.\n\n**Tempo total:** ~15 min\n\n**Mudanca chave:** Luz solar estatica vira caminhada — combinando luz, movimento e fluxo optico (que reduz atividade da amigdala).\n\n**A ciencia:** Exercicio matinal tem taxas de aderencia maiores que noturno (94% vs 87%) e aproveita o pico de testosterona matinal, ~1/3 maior que niveis noturnos.', 15);

  -- DAY 9
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 9, 'Introduzindo a pausa', E'Meditacao entra como pratica formal de 5 minutos — a dose minima eficaz segundo pesquisa.\n\n**Na noite anterior:**\nBaixe um app de meditacao guiada ou prepare uma sessao de 5 min.\n\n**Tarefas da manha:**\nCama -> agua -> caminhada de 10 min -> **5 minutos de meditacao guiada** (atencao focada na respiracao). Diario: 2 gratidoes + 1 prioridade.\n\n**Tempo total:** ~18 min\n\n**A ciencia:** Strohmaier et al. descobriram que quatro sessoes de **5 minutos** produziram *maiores* melhorias em mindfulness e reducao de estresse que quatro sessoes de 20 minutos. Basso et al. (2019): 13 minutos diarios por 8 semanas melhoraram significativamente atencao, memoria de trabalho e humor.', 18);

  -- DAY 10
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 10, 'Checkpoint de consolidacao', E'A novidade esta acabando. Isso e normal. Encolha se precisar — apenas nao pule.\n\n**Na noite anterior:**\nNotificacao do app: "Dias 10-14 sao quando a novidade acaba. Isso e normal. Reduza se precisar — so nao pule."\n\n**Tarefas da manha:**\n**Versao minima viavel apenas.** Cama -> agua -> saia por 2 min -> 3 respiracoes profundas -> 1 frase de gratidao. Pronto.\n\n**Tempo total:** ~6 min\n\n**Proposito:** Demonstra que "dias minimos" contam. Previne pensamento tudo-ou-nada. Esse e um dia de recuperacao planejado para prevenir burnout.', true, 6);

  -- DAY 11
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 11, 'De volta a construcao', E'Dia minimo feito. Agora voltamos a construir. O journaling alcanca seu formato final hoje.\n\n**Tarefas da manha:**\nCama -> agua -> caminhada de 10 min -> meditacao de 5 min -> diario: **3 gratidoes com "porque" + 3 prioridades** (metodo MIT: 3 Tarefas Mais Importantes). Sem celular 30 min.\n\n**Tempo total:** ~20 min\n\n**Journaling alcanca formato alvo:** 3 gratidoes + 3 MITs.\n\n**A ciencia:** Lyubomirsky descobriu que journaling de gratidao semanal aumentou felicidade, mas 3x/semana nao — sugerindo adaptacao hedonica. O formato "porque" produz bem-estar significativamente maior.', true, 20);

  -- DAY 12
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 12, 'Seu primeiro final frio', E'Hoje voce adiciona exposicao ao frio no minimo absoluto: 30 segundos.\n\n**Na noite anterior:**\nO app explica a ciencia da exposicao ao frio: aumento de dopamina de ate 250%, durando horas sem crash.\n\n**Tarefas da manha:**\nRotina completa (cama -> agua -> caminhada -> meditacao -> diario) + apos seu banho normal, **vire a agua para frio pelos ultimos 30 segundos**. Apenas sobreviva 30 segundos.\n\n**Regra critica:** Nao se aqueca artificialmente depois (o "principio Soberg" — terminar no frio maximiza ativacao de gordura marrom).\n\n**Tempo total:** ~20 min + banho\n\n**A ciencia:** Sramek et al. (2000): aumento de 250% na dopamina plasmatica e 530% em norepinefrina durante imersao em agua fria a 14C. Estudo holandes (n=3.018): usuarios de banho frio tiveram 29% menos dias doentes.', true, 20);

  -- DAY 13
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 13, 'Empurrando o limite', E'Expansao gradual: frio mais longo, e o atraso de cafeina entra pela primeira vez.\n\n**Tarefas da manha:**\nRotina completa. Final de banho frio: **45 segundos**. Atraso de cafeina: tente esperar **60 minutos** apos acordar antes do cafe.\n\n**Tempo total:** ~20 min\n\n**A ciencia:** A Resposta de Cortisol ao Despertar (CAR) fornece energia e alerta naturais. Atrasar cafeina ate o CAR comecar a declinar (~90-120 min pos-despertar) evita a interferencia cortisol-cafeina. 60 min e mais realista que os 90-120 min do Huberman para iniciantes.', true, 20);

  -- DAY 14
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 14, 'Marco da Semana 2', E'Duas semanas. O que nao existia 14 dias atras esta se tornando quem voce e.\n\n**Na noite anterior:**\nReview da Semana 2. O app celebra o marco de 14 dias. Prompt: "Duas semanas atras isso nao existia. Agora esta se tornando quem voce e." Reforco de identidade conforme framework de Clear.\n\n**Tarefas da manha:**\nRotina completa + final frio 45 seg. Expanda a caminhada para **15 minutos**. Sem celular por 45 min.\n\n**Tempo total:** ~25 min\n\n**Voce agora tem 6 habitos ativos:** arrumar cama, hidratacao, caminhada ao ar livre, meditacao, journaling, exposicao ao frio.\n\n**Review da Semana 2:**\n1. Quantos dias completou a rotina?\n2. Screen time matinal vs Semana 1\n3. Qualidade de sono (1-10)\n4. Nivel de energia (1-10)\n5. Qual habito esta mais natural?\n6. O que foi mais desafiador?', true, 25);

  -- DAY 15
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 15, 'A rotina te conduz', E'Fase 3: sem habitos novos. Aprofundar e proteger o que existe. A rotina se mantem estavel.\n\n**Tarefas da manha:**\nCama -> agua -> caminhada de 15 min -> meditacao de 5 min -> diario (3 gratidoes + 3 MITs) -> final frio **60 seg**. Atraso de cafeina 60 min.\n\n**Tempo total:** ~25 min\n\n**Sem mudancas exceto frio estende para 60 seg.** A pesquisa de Lally mostra que habitos ainda estao na fase de "esforco consciente" e vulneraveis a interrupcao. Manter estavel e proteger.', 25);

  -- DAY 16
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 16, 'Dia minimo', E'Saber quando ir no minimo e uma habilidade, nao fraqueza.\n\n**Tarefas da manha:**\nVersao minima viavel. Cama -> agua -> saia por 5 min -> 1 gratidao -> va.\n\nO app enquadra isso como forca, nao fraqueza: "Saber quando ir no minimo e uma habilidade."\n\n**Tempo total:** ~8 min\n\n**A ciencia:** A pesquisa de Lally (2010) mostrou que falhas individuais nao afetam formacao de habitos. Dias minimos planejados previnem pensamento tudo-ou-nada e mantem a sequencia.', true, 8);

  -- DAY 17
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 17, 'Full send', E'De volta a rotina completa. Meditacao sobe para 7 minutos.\n\n**Tarefas da manha:**\nRotina completa. Meditacao aumenta para **7 minutos**. Final frio 60 seg. Caminhada 15 min.\n\n**Tempo total:** ~25 min\n\n**A ciencia:** Basso et al. (2019): 13 minutos diarios por 8 semanas melhoraram significativamente atencao, memoria de trabalho e humor em participantes novatos em meditacao. Estamos progredindo de 5 para 7 min — dentro da regra de escalar somente apos >=80% de conclusao.', 25);

  -- DAY 18
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, motivational_note, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 18, 'O precipicio esta aqui', E'Agora seu cerebro esta dizendo que isso nao importa mais. Isso e neuroquimica, nao verdade.\n\n**Na noite anterior:**\nO app prepara o precipicio de motivacao: "Agora seu cerebro esta dizendo que isso nao importa mais. Isso e neuroquimica, nao verdade. A dopamina da novidade acabou. O que voce constroi daqui e real."\n\n**Tarefas da manha:**\nRotina completa, sem mudancas. Foco em apenas completar — qualidade nao importa hoje, aparecer sim.\n\n**Tempo total:** ~25 min\n\n**A ciencia:** Dias 18-22 sao o "precipicio de motivacao" — periodo de maior risco. NAO adicione habitos novos. Use reforco de identidade: "Voce apareceu por 18 dias. Voce E alguem que domina suas manhas."', 'O desconforto que voce sente e temporario. A dopamina da novidade acabou. O que voce constroi daqui e real e permanente.', 25);

  -- DAY 19
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 19, 'Dia minimo (protegido)', E'Dia minimo planejado durante o pico de risco de abandono.\n\n**Tarefas da manha:**\nVersao minima viavel. Cama -> agua -> ao ar livre 5 min -> 3 respiracoes -> 1 gratidao.\n\n**Tempo total:** ~8 min\n\n**A ciencia:** Csikszentmihalyi/Clear: motivacao de pico ocorre quando tarefas estao ~4% alem da capacidade atual. Dias minimos estrategicos previnem sobrecarga durante o periodo mais vulneravel.', true, 8);

  -- DAY 20
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 20, 'Nunca perca dois seguidos', E'Perder uma vez e acidente. Perder duas vezes e um novo habito. Voce esta de volta.\n\n**Tarefas da manha:**\nRotina completa retorna. O app reforca a regra de Clear: "Perder uma vez e acidente. Perder duas vezes e um novo habito. Voce esta de volta."\n\n**Tempo total:** ~25 min', 25);

  -- DAY 21
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 21, 'Tres semanas dentro', E'3 semanas. Seus habitos estao agora na fase de transicao — o ponto onde forca de vontade comeca a virar piloto automatico.\n\n**Na noite anterior:**\nMarco de 21 dias. Prompt do app: "Voce completou sua rotina matinal em mais de 90% dos dias por 3 semanas. A pesquisa de Lally diz que seus habitos estao agora na fase de transicao — o ponto onde forca de vontade comeca a virar piloto automatico."\n\n**Tarefas da manha:**\nRotina completa. Meditacao 7 min. Final frio **90 segundos**. Caminhada 15 min.\n\n**Tempo total:** ~25 min\n\n**Review da Semana 3:**\n1. Dias com rotina completa?\n2. Dias com versao minima?\n3. Qualidade de sono (1-10)\n4. Energia durante o dia (1-10)\n5. A rotina esta ficando mais automatica?\n6. O que quase te fez desistir?', true, 25);

  -- DAY 22
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 22, 'Guerreiro de fim de semana', E'Rotina completa, versao de fim de semana. A consistencia de fim de semana e a prova real.\n\n**Tarefas da manha:**\nRotina completa, versao fim de semana. Acorde dentro de 1 hora do horario de dia de semana. O app rastreia consistencia de fim de semana como metrica propria.\n\n**Tempo total:** ~25 min\n\n**A ciencia:** Cada hora de desvio no fim de semana pode resetar o progresso circadiano da semana inteira. Mais de 70% das pessoas experimentam >=1 hora de desvio no sono de fim de semana.', 25);

  -- DAY 23
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 23, 'Level up na caminhada', E'Fase 4: alcancar a rotina sustentavel final. A caminhada atinge a duracao alvo.\n\n**Tarefas da manha:**\nCama -> agua -> **caminhada de 20 minutos** (duracao alvo alcancada) -> meditacao de 7 min -> diario -> final frio 90 seg. Atraso de cafeina para **90 min** (alvo do Huberman). Sem celular por 60 min.\n\n**Tempo total:** ~30 min\n\n**A ciencia:** RCT Nature 2025: exercicio matinal (6-8h) alcancou reducoes mais rapidas em gordura visceral e triglicerideos. Caminhada ao ar livre de 20 min entrega simultaneamente exposicao solar — o habito mais eficiente do programa.', 30);

  -- DAY 24
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 24, 'Leitura entra no stack', E'O ultimo habito novo, introduzido somente apos 3+ semanas de fundacao.\n\n**Tarefas da manha:**\nRotina completa. Apos o journaling, adicione **10 minutos de leitura** (nao-ficcao, livro fisico de preferencia — sem telas).\n\n**Tempo total:** ~35 min\n\n**A ciencia:** Leitura e o habito final porque exige mais foco cognitivo. So foi introduzido apos a base estar solida. A regra de Clear: nunca aumente duracao E adicione um novo habito simultaneamente.', 35);

  -- DAY 25
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 25, 'Sua rotina, suas regras', E'Personalize sua rotina. Quais elementos te dao mais energia?\n\n**Tarefas da manha:**\nRotina completa. Prompt do app: "Personalize seu stack. Quais elementos te dao mais energia? Classifique seus habitos matinais. Sua rotina ideal nao precisa ser igual ao template de ninguem."\n\n**Tempo total:** ~35 min\n\n**Momento de personalizacao:** Usuario ajusta sequencia/duracao baseado na experiencia pessoal. Robin Sharma popularizou a formula 20/20/20 — mas a ciencia diz que o horario nao importa. "Domine SUA manha" — seja qual horario for.', 35);

  -- DAY 26
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 26, 'Maestria do dia minimo', E'Ultimo dia minimo planejado. A essa altura, a versao minima deve parecer automatica.\n\n**Tarefas da manha:**\nDia minimo final planejado. Cama -> agua -> caminhada de 10 min -> 1 gratidao -> va.\n\n**Tempo total:** ~13 min\n\n**A ciencia:** Saber sua versao minima te mantem consistente quando a vida interrompe. A versao minima e sua rede de seguranca permanente.', true, 13);

  -- DAY 27
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 27, 'Desafio do frio', E'Exposicao ao frio estende para o alvo maximo: 2 minutos.\n\n**Tarefas da manha:**\nRotina completa. Final de banho frio estendido para **2 minutos** (se aproximando do alvo semanal Soberg de ~11 min em 4 sessoes). O app rastreia total semanal de exposicao ao frio.\n\n**Tempo total:** ~35 min\n\n**A ciencia:** Soberg et al. (2021): 11 minutos de exposicao total ao frio por semana em 2-4 sessoes fornece beneficios metabolicos. Terminar no frio (sem aquecer artificialmente) maximiza ativacao de gordura marrom.', 35);

  -- DAY 28
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 28, 'Teste de estresse', E'E se o alarme nao tocasse? Pratique a versao comprimida.\n\n**Tarefas da manha:**\nRotina completa, mas o app apresenta um "cenario de caos": imagine que seu alarme nao tocou e voce tem 10 minutos.\n\n**Versao comprimida (10 min):** agua -> saia por 3 min -> 1 gratidao + 1 prioridade -> va.\n\nSaber seu minimo te mantem consistente quando a vida interrompe.\n\n**Pratique ambas versoes:** a de 10 min e a de 35 min.\n\n**A ciencia:** Pesquisa sobre duracao ideal de rotina indica que 20-30 minutos e o ponto ideal de aderencia. Rotinas acima de 60 minutos mostram taxas dramaticamente maiores de abandono.', 35);

  -- DAY 29
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 29, 'A noite antes do Dia 30', E'Penultimo dia. Olhe para tras e veja quem voce se tornou.\n\n**Na noite anterior:**\nPrompt de reflexao: "Escreva quem voce era no Dia 0 e quem voce e agora. O que mudou? O que te surpreendeu?"\n\nProtocolo noturno completo: telas desligadas 30 min antes de dormir, roupas separadas, celular em outro comodo, alarme de dormir configurado.\n\n**Tarefas da manha:**\nRotina completa com total conviccao.\n\n**Tempo total:** ~35 min\n\n**Reflexao:**\n1. Quem eu era no Dia 0?\n2. Quem eu sou agora?\n3. O que mudou?\n4. O que me surpreendeu?\n5. Qual habito teve mais impacto?', 35);

  -- DAY 30
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 30, 'Dia da Graduacao', E'30 dias. De alguem que nao tinha rotina para alguem que domina suas manhas.\n\n**Rotina de graduacao — a versao sustentavel que voce levara adiante:**\n- Arruma cama (2 min)\n- Agua 500mL\n- Caminhada ao ar livre de 20 min na luz solar\n- Final frio de 2 min no banho\n- Meditacao de 10 min\n- Diario de 5 min (3 gratidoes + 3 MITs)\n- Leitura de 10 min\n- Cafeina atrasada 90 min\n- Sem celular por 60 min\n\n**Tempo total:** ~35 min de rotina ativa.\n\n**O app celebra com marco principal, estatisticas resumidas e plano de manutencao para os proximos 30 dias.**\n\n**Na noite:** O app apresenta sua declaracao de identidade: "Voce e alguem que domina suas manhas. Voce provou isso [X] vezes em 30 dias."\n\n**Lembre-se:** Dia 30 nao e a linha de chegada — e o ponto onde a rotina comeca a ficar sem esforco. A pesquisa de Lally diz que habitos levam em media 66 dias para se tornarem automaticos. Voce construiu a infraestrutura. Agora a automaticidade vem.', true, 35);

  -- ============================================
  -- 3. Habit Templates
  -- ============================================

  -- Bed-making (Day 1-30, binary)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Arrumar a cama', E'\U0001F6CF', 'corpo', 'morning', 'checkbox', 1, NULL, 'daily', 'bed_making', 1);

  -- Hydration 500mL (Day 1-30, binary)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Hidratar 500mL', E'\U0001F4A7', 'corpo', 'morning', 'checkbox', 1, NULL, 'daily', 'morning_hydration', 2);

  -- Sunlight / outdoor (Day 1-30, progressive timer: 2 min -> 5 min -> 10 min walk -> 15 min walk -> 20 min walk)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, 'Luz solar / ar livre', E'\u2600', 'corpo', 'morning', 'timer', 'minutes', 2, 1, NULL, 'daily',
   '[{"from_day":4,"goal_value":5},{"from_day":8,"goal_value":10},{"from_day":14,"goal_value":15},{"from_day":23,"goal_value":20}]'::jsonb,
   'morning_sunlight', 3);

  -- Phone-free morning (Day 1-30, progressive timer: 15 min -> 20 min -> 25 min -> 30 min -> 45 min -> 60 min)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, E'Manha sem celular', E'\U0001F4F5', 'mente', 'morning', 'timer', 'minutes', 15, 1, NULL, 'daily',
   '[{"from_day":4,"goal_value":20},{"from_day":7,"goal_value":25},{"from_day":8,"goal_value":30},{"from_day":14,"goal_value":45},{"from_day":23,"goal_value":60}]'::jsonb,
   'phone_free_morning', 4);

  -- Deep breathing (Day 3-8, replaced by meditation on Day 9)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, E'Respiracao profunda', E'\U0001F4A8', 'mente', 'morning', 'number', 'breaths', 5, 3, 8, 'daily', 'deep_breathing', 5);

  -- Journaling (Day 5-30, checkbox — content progresses in card_content)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, 'Journaling matinal', E'\U0001F4D3', 'mente', 'morning', 'timer', 'minutes', 2, 5, NULL, 'daily',
   '[{"from_day":11,"goal_value":5}]'::jsonb,
   'morning_journaling', 6);

  -- Meditation (Day 9-30, progressive timer: 5 min -> 7 min -> 10 min)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, E'Meditacao', E'\U0001F9D8', 'mente', 'morning', 'timer', 'minutes', 5, 9, NULL, 'daily',
   '[{"from_day":17,"goal_value":7},{"from_day":30,"goal_value":10}]'::jsonb,
   'morning_meditation', 7);

  -- Cold exposure (Day 12-30, progressive timer in seconds: 30s -> 45s -> 60s -> 90s -> 120s)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, E'Exposicao ao frio', E'\u2744', 'corpo', 'morning', 'timer', 'seconds', 30, 12, NULL, 'daily',
   '[{"from_day":13,"goal_value":45},{"from_day":15,"goal_value":60},{"from_day":21,"goal_value":90},{"from_day":27,"goal_value":120}]'::jsonb,
   'cold_exposure', 8);

  -- Caffeine delay (Day 13-30, progressive timer in minutes: 60 min -> 90 min)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, 'Atraso de cafeina', E'\u2615', 'corpo', 'morning', 'timer', 'minutes', 60, 13, NULL, 'daily',
   '[{"from_day":23,"goal_value":90}]'::jsonb,
   'caffeine_delay', 9);

  -- Reading (Day 24-30, timer 10 min)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Leitura matinal', E'\U0001F4D6', 'mente', 'morning', 'timer', 'minutes', 10, 24, NULL, 'daily', 'morning_reading', 10);

  -- Evening protocol (Day 1-30, checkbox)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Protocolo noturno', E'\U0001F319', 'corpo', 'evening', 'checkbox', 1, NULL, 'daily', 'evening_protocol', 11);

  -- Weekly review (Day 7, 14, 21, 30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, days_of_week, canonical_key, sort_order) VALUES
  (v_journey_id, 'Review semanal', E'\U0001F4CA', 'mente', 'evening', 'checkbox', 7, NULL, 'weekly', '{0}', 'weekly_review', 12);

END $$;
