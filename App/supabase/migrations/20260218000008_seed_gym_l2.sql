-- ============================================
-- SEED: Gym L2 — "Protocolo de Hipertrofia"
-- ============================================
-- NOTE: The journeys row for 'gym-l2' already exists
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
  SELECT id INTO v_journey_id FROM public.journeys WHERE slug = 'gym-l2';

  -- ============================================
  -- 1. Phases
  -- ============================================

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 1, 'BARRA', 'O rito de passagem', E'Os 5 grandes lifts com barra olímpica: agachamento, supino, terra, desenvolvimento e remada. Foco total em forma antes de carga.', 1, 7, 'gym-l2-phase-1', 'Barra Dominada')
  RETURNING id INTO v_phase1_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 2, 'VOLUME', 'Construa massa', E'Volume aumentado, surplus calórico e mobilidade. Seus compostos com barra agora ganham carga e repetições com double progression.', 8, 14, 'gym-l2-phase-2', 'Volume Completo')
  RETURNING id INTO v_phase2_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 3, 'PPL', 'Push/Pull/Legs', E'Transição para o split mais eficiente de hipertrofia. Cada grupo muscular treinado 2x por semana com volume dedicado.', 15, 22, 'gym-l2-phase-3', 'PPL Ativado')
  RETURNING id INTO v_phase3_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 4, 'SISTEMA', 'Periodização e deload', E'PPL completo rodando com deload programado, PRs pós-recuperação e ciclo sustentável de 6 treinos.', 23, 30, 'gym-l2-phase-4', 'Protocolo de Hipertrofia')
  RETURNING id INTO v_phase4_id;

  -- ============================================
  -- 2. Journey Days (30 days)
  -- ============================================

  -- DAY 1
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 1, 'A barra te espera', E'Bem-vindo ao Nível 2. Você dominou máquinas e halteres. Agora vem o upgrade definitivo: a barra olímpica (20kg). Os 5 grandes lifts — agachamento, supino, terra, desenvolvimento e remada — são responsáveis por ~80% dos resultados de quem treina sério.\n\n**TREINO — Upper A (Introdução à Barra) — 45 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Supino reto com barra | BARRA | 4 | 8 | 90s |\n| 2 | Remada curvada com halteres | Haltere | 3 | 10 | 60s |\n| 3 | Shoulder Press com halteres | Haltere | 3 | 10 | 60s |\n| 4 | Pulldown pegada fechada | Máquina | 3 | 12 | 60s |\n| 5 | Rosca bíceps barra EZ | BARRA | 2 | 12 | 60s |\n| 6 | Tríceps testa barra EZ | BARRA | 2 | 12 | 60s |\n\n**NOVO — Aquecimento progressivo:** Antes de cada composto com barra, faça: 1x12 barra vazia, 1x8 a 60%, 1x5 a 80%, depois séries de trabalho. Comece LEVE. A barra vazia (20kg) já é suficiente para aprender forma.\n\n**Segurança:** Use rack com travas de segurança ou peça spot a alguém. Nunca treine supino pesado sozinho sem segurança.', 50);

  -- DAY 2
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 2, 'Lower A: o agachamento', E'O agachamento com barra é considerado o rei dos exercícios. Recruta mais músculos simultaneamente que qualquer outro movimento.\n\n**TREINO — Lower A (Introdução ao Agachamento) — 45 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Agachamento com barra (back squat) | BARRA | 4 | 8 | 120s |\n| 2 | Stiff com halteres | Haltere | 3 | 10 | 90s |\n| 3 | Leg Press | Máquina | 3 | 12 | 60s |\n| 4 | Leg Curl | Máquina | 3 | 12 | 60s |\n| 5 | Panturrilha no Leg Press | Máquina | 3 | 15 | 45s |\n| 6 | Prancha | Corpo | 3 | 45s | 30s |\n\n**Como fazer o Back Squat:** Barra no trapézio (parte alta das costas), pés na largura dos ombros, pontas levemente para fora. Desça controlando até coxas paralelas ou abaixo. Empurre o chão com os pés inteiros.\n\n**Peso inicial:** Barra vazia (20kg) por pelo menos os 2 primeiros treinos. Adicione peso apenas quando a forma estiver sólida nas 4x8.', 50);

  -- DAY 3
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 3, 'Descanso + Double Progression', E'Micro-aula: Double Progression — o sistema de progressão do Nível 2.\n\n1. Defina uma faixa de reps (ex: 8-12)\n2. Comece na parte baixa com peso desafiador (ex: 40kg x 8)\n3. Cada treino, tente +1 rep mantendo o peso\n4. Quando atingir o topo da faixa em TODAS as séries (4x12 com 40kg), suba o peso 2,5-5kg\n5. Volte para o fundo da faixa com o peso novo\n\nExemplo real:\n- Sem 1: 40kg x 8, 8, 7\n- Sem 2: 40kg x 9, 8, 8\n- Sem 3: 40kg x 10, 10, 9\n- Sem 4: 40kg x 12, 11, 11\n- Sem 5: 42,5kg x 8, 8, 7 (subiu peso, volta pro fundo)\n\nGarante progressive overload consistente sem pular etapas. Cada treino tem uma micro-meta clara.', true, 5);

  -- DAY 4
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 4, 'Upper B: o desenvolvimento', E'Terceiro composto com barra: o desenvolvimento (overhead press). E um novo hábito: filmar sua forma.\n\n**TREINO — Upper B — 45 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Desenvolvimento com barra | BARRA | 4 | 8 | 90s |\n| 2 | Remada curvada com barra | BARRA | 3 | 8 | 90s |\n| 3 | Supino inclinado com halteres | Haltere | 3 | 10 | 60s |\n| 4 | Puxada frontal | Máquina | 3 | 12 | 60s |\n| 5 | Elevação lateral com halteres | Haltere | 3 | 12 | 60s |\n| 6 | Rosca alternada + tríceps polia (superset) | Haltere/Cabo | 2 | 12 | 60s |\n\n**NOVO — Filmar exercício:** Filme 1 série de 1 composto por treino. Posicione o celular de lado para ver o perfil. Assista entre séries e compare com vídeos de referência. Ferramenta mais poderosa para corrigir forma sem personal trainer.', 50);

  -- DAY 5
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 5, 'Lower B: o levantamento terra', E'O último dos 5 grandes: o levantamento terra (deadlift). O exercício que mais massa total constrói — e o que exige mais respeito pela forma.\n\n**TREINO — Lower B — 50 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Levantamento Terra (convencional) | BARRA | 4 | 6 | 120s |\n| 2 | Agachamento Goblet (pesado) | Haltere | 3 | 10 | 90s |\n| 3 | Leg Extension | Máquina | 3 | 12 | 60s |\n| 4 | Leg Curl | Máquina | 3 | 12 | 60s |\n| 5 | Elevação pélvica (hip thrust) | Haltere | 3 | 12 | 60s |\n| 6 | Ab wheel ou prancha com peso | Corpo | 3 | 8-10 | 45s |\n\n**SEGURANCA CRITICA:** O terra tem maior risco se feito com forma ruim. Filme SEMPRE sua série de aquecimento. Se as costas arredondam, o peso está pesado demais. Reduza e aprenda o padrão primeiro.\n\n**Por que só 6 reps:** Fadiga no deadlift compromete a forma mais rápido que em outros exercícios. Séries de 6 mantêm qualidade e reduzem risco.', 55);

  -- DAY 6
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 6, 'Descanso total', E'Descanso total. Seus músculos e sistema nervoso precisam se recuperar da introdução ao terra. Foque em proteína e sono. A recuperação é onde o crescimento acontece.', true, 5);

  -- DAY 7
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 7, 'Semana 1 completa + review', E'Semana 1 do Nível 2 completa. Você aprendeu os 5 grandes compostos com barra: Supino, Agachamento, Desenvolvimento, Remada e Terra. Mais do que a maioria dos frequentadores aprende em meses.\n\n**Review semanal:**\n1. Completei ___/4 treinos\n2. Qual composto com barra me senti mais confortável?\n3. Qual composto precisa de mais trabalho de forma?\n4. Estou filmando meus exercícios?\n5. Progressão: consegui subir peso ou reps em ___ exercícios\n6. Nota geral de energia/recuperação (1-10):\n\n**Próxima semana:** Volume aumentado, surplus calórico e introdução de mobilidade pré-treino.', true, 10);

  -- DAY 8
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 8, 'Mais comida, mais músculo', E'Os compostos estão aprendidos. Agora subimos volume e introduzimos surplus calórico controlado.\n\n**TREINO — Upper A+ (Volume Aumentado) — 50 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Supino reto com barra | Barra | 4 | 8-10 | 90s |\n| 2 | Remada curvada com barra | Barra | 4 | 8-10 | 90s |\n| 3 | Shoulder Press com halteres | Haltere | 3 | 10-12 | 60s |\n| 4 | Pulldown | Máquina | 3 | 10-12 | 60s |\n| 5 | Elevação lateral | Haltere | 3 | 15 | 45s |\n| 6 | Rosca bíceps barra EZ | Barra | 3 | 10-12 | 60s |\n| 7 | Tríceps polia (corda) | Cabo | 3 | 10-12 | 60s |\n\n**NOVO — Surplus calórico:** Meta: +300 a 500 kcal acima da manutenção/dia. Regra prática: adicione 1 refeição extra por dia (shake pós-treino: whey + banana + pasta de amendoim = ~500 kcal). Se a balança não sobe ~0,5kg/sem, coma mais. Se sobe >1kg/sem, reduza.', 55);

  -- DAY 9
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 9, 'Lower A+ com agachamento pesado', E'Segundo round de agachamento com barra. Aplique double progression: tente +1 rep ou +2,5kg vs Dia 2.\n\n**TREINO — Lower A+ — 50 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Agachamento com barra | Barra | 4 | 8-10 | 120s |\n| 2 | Stiff com barra | BARRA | 3 | 8-10 | 90s |\n| 3 | Leg Press (pés altos) | Máquina | 3 | 12 | 60s |\n| 4 | Leg Curl | Máquina | 3 | 12 | 60s |\n| 5 | Panturrilha em pé | Máquina | 4 | 12-15 | 45s |\n| 6 | Hanging knee raise | Corpo | 3 | 12-15 | 45s |\n\n**Stiff com barra (novo):** Mesmo padrão do stiff com halteres do N1, mas com barra. Permite cargas maiores e progressão mais linear. Mantenha a barra rente às coxas durante todo o movimento.', 55);

  -- DAY 10
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 10, 'Mobilidade entra no jogo', E'Dia de descanso com um novo hábito: mobilidade pré-treino. Com barra e cargas crescentes, mobilidade de tornozelo, quadril e ombro se torna essencial para prevenir lesões.\n\n**NOVO — Mobilidade (5 min, escala para 10 min):**\nNos dias de treino, faça ANTES do aquecimento:\n1. Tornozelo: mobilização contra a parede (30s cada lado)\n2. Quadril: 90/90 stretch (30s cada lado)\n3. Ombro: pass-through com bastão (10 reps)\n4. Torácica: foam roller extensão (30s)\n5. Glúteo: pigeon stretch (30s cada lado)\n\nAgachamento profundo requer mobilidade de tornozelo e quadril. Supino e overhead press requerem mobilidade de ombro. 5 min de mobilidade = investimento contra lesão.', true, true, 10);

  -- DAY 11
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 11, 'Upper B+ com overhead press', E'Overhead press é o composto mais honesto — não tem como usar impulso para enganar. Cada kg a mais é conquistado.\n\n**TREINO — Upper B+ — 50 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Desenvolvimento com barra | Barra | 4 | 8-10 | 90s |\n| 2 | Remada curvada com barra | Barra | 4 | 8-10 | 90s |\n| 3 | Supino inclinado com halteres | Haltere | 3 | 10-12 | 60s |\n| 4 | Puxada frontal (pegada neutra) | Máquina | 3 | 10-12 | 60s |\n| 5 | Elevação lateral + face pull (superset) | Haltere/Cabo | 3 | 12+15 | 60s |\n| 6 | Rosca martelo + extensão tríceps overhead (superset) | Haltere | 2 | 12 | 60s |\n\n**Supersets:** Dois exercícios seguidos sem descanso entre eles. Economiza tempo e aumenta intensidade. Usamos em isolação para não comprometer compostos.', true, 55);

  -- DAY 12
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 12, 'Lower B+ com terra progressivo', E'Segundo round de terra. Aplique double progression. Se a forma do Dia 5 estava boa, tente +2,5kg ou +1 rep.\n\n**TREINO — Lower B+ — 50 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Levantamento Terra | Barra | 4 | 6-8 | 120s |\n| 2 | Agachamento Goblet (pesado) | Haltere | 3 | 10 | 90s |\n| 3 | Leg Extension | Máquina | 3 | 12-15 | 60s |\n| 4 | Leg Curl | Máquina | 3 | 12-15 | 60s |\n| 5 | Hip Thrust com barra | BARRA | 3 | 10-12 | 60s |\n| 6 | Prancha com peso nas costas | Corpo | 3 | 45s | 30s |\n\n**Hip Thrust com Barra:** Costas apoiadas num banco, barra sobre o quadril (use pad). Pés no chão, joelhos a 90 graus. Empurre o quadril para cima contraindo glúteos no topo. Melhor exercício isolado para glúteos.', true, 55);

  -- DAY 13
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 13, 'Descanso', E'Descanso. Recovery ativo se quiser. Proteína + surplus + sono. Preparar mochila para amanhã.', true, 5);

  -- DAY 14
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 14, 'Semana 2 completa + PPL preview', E'Duas semanas de Nível 2. Você domina os 5 grandes lifts com barra. Na próxima semana, transitamos para PPL — o split mais popular e eficiente para hipertrofia.\n\n**Review semana 2:**\n1. Completei ___/4 treinos\n2. Progressão nos compostos (pesos/reps vs Semana 1)\n3. Surplus calórico: mantive em ___/7 dias\n4. Mobilidade: fiz em ___/4 treinos\n\n**Preview do PPL:**\n- Push (Empurrar): Peito, ombros, tríceps\n- Pull (Puxar): Costas, bíceps, posterior\n- Legs (Pernas): Quadríceps, posterior, glúteos, panturrilha\n\nCada grupo muscular treinado 2x/semana com volume dedicado.', true, 10);

  -- DAY 15
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 15, 'PUSH Day 1', E'Primeiro treino de Push. Foco total em peito, ombros e tríceps. Composto principal: supino com barra.\n\n**TREINO — PUSH A — 50 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Supino reto com barra | Barra | 4 | 6-8 | 120s |\n| 2 | Supino inclinado com halteres | Haltere | 3 | 10-12 | 60s |\n| 3 | Desenvolvimento com halteres (sentado) | Haltere | 3 | 10-12 | 60s |\n| 4 | Elevação lateral | Haltere | 3 | 15 | 45s |\n| 5 | Tríceps polia (barra reta) | Cabo | 3 | 10-12 | 60s |\n| 6 | Overhead tríceps extension (cabo) | Cabo | 2 | 12-15 | 45s |\n\n**Lógica piramidal do PPL:** Exercício 1: composto pesado (6-8 reps). Exercícios 2-3: compostos moderados (10-12 reps). Exercícios 4-6: isolação com volume (12-15 reps). Começa pesado para recrutar fibras rápidas, depois esgota as restantes.', 55);

  -- DAY 16
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 16, 'PULL Day 1', E'Pull Day. Costas, bíceps e posterior de ombro. Composto principal: remada com barra.\n\n**TREINO — PULL A — 50 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Remada curvada com barra | Barra | 4 | 6-8 | 120s |\n| 2 | Pulldown (pegada larga) | Máquina | 3 | 10-12 | 60s |\n| 3 | Remada na máquina (pegada neutra) | Máquina | 3 | 10-12 | 60s |\n| 4 | Face Pull | Cabo | 3 | 15-20 | 45s |\n| 5 | Rosca bíceps barra EZ | Barra | 3 | 10-12 | 60s |\n| 6 | Rosca martelo | Haltere | 2 | 12-15 | 45s |\n\n**Face Pull:** Trabalha deltóide posterior e rotadores externos. Contrabalança o excesso de pressing (supino, overhead). Sem ele, os ombros eventualmente protestam. Use carga leve e foco na contração.', 55);

  -- DAY 17
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 17, 'LEGS Day 1', E'Leg Day com PPL. Composto principal: agachamento com barra. O treino mais exigente da semana — e o que mais muda composição corporal.\n\n**TREINO — LEGS A — 55 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Agachamento com barra | Barra | 4 | 6-8 | 120s |\n| 2 | Stiff com barra | Barra | 3 | 8-10 | 90s |\n| 3 | Leg Press | Máquina | 3 | 12 | 60s |\n| 4 | Leg Curl | Máquina | 3 | 12 | 60s |\n| 5 | Leg Extension | Máquina | 3 | 12-15 | 60s |\n| 6 | Panturrilha (em pé) | Máquina | 4 | 15 | 45s |', 60);

  -- DAY 18
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, motivational_note, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 18, 'Descanso — o precipício', E'Dia 18 — o precipício da motivação. Pesquisa mostra que este é o ponto de maior risco de abandono. Você já passou por isso no Nível 1. Sabe o que é. Sabe que passa. Amanhã volta. Se a resistência for forte, comprometa-se com metade do treino. Ir e fazer pouco > não ir.', true, 'Você já sobreviveu ao cliff do Nível 1. Esse você conhece. Continue.', 5);

  -- DAY 19
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 19, 'PUSH Day 2', E'Segundo Push da semana. Variação: overhead press como composto principal em vez de supino.\n\n**TREINO — PUSH B — 50 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Desenvolvimento com barra | Barra | 4 | 6-8 | 90s |\n| 2 | Supino reto com halteres | Haltere | 3 | 10-12 | 60s |\n| 3 | Crucifixo inclinado | Haltere/Cabo | 3 | 12-15 | 60s |\n| 4 | Elevação lateral | Haltere | 4 | 12-15 | 45s |\n| 5 | Tríceps mergulho (máquina ou paralelas) | Máq/Corpo | 3 | 10-12 | 60s |\n| 6 | Tríceps kickback ou polia | Haltere/Cabo | 2 | 12-15 | 45s |\n\n**Lógica de 2 Push Days:** Push A lidera com supino (foco peito). Push B lidera com overhead press (foco ombro). Rotação garante desenvolvimento equilibrado.', 55);

  -- DAY 20
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 20, 'PULL Day 2', E'Segundo Pull. Terra como composto principal.\n\n**TREINO — PULL B — 50 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Levantamento Terra | Barra | 4 | 5-6 | 150s |\n| 2 | Pulldown (pegada fechada supinada) | Máquina | 3 | 10-12 | 60s |\n| 3 | Remada unilateral com haltere | Haltere | 3 | 10-12 | 60s |\n| 4 | Face Pull | Cabo | 3 | 15-20 | 45s |\n| 5 | Rosca concentrada ou Scott | Haltere/Máq | 3 | 10-12 | 60s |\n| 6 | Rosca inversa (punhos pronados) | Barra/Haltere | 2 | 12-15 | 45s |', 55);

  -- DAY 21
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 21, 'Semana 3 completa', E'Primeira semana de PPL completa. 5 treinos em 7 dias — Push A, Pull A, Legs A, Push B, Pull B. Na semana 4, adicionamos Legs B para fechar o ciclo completo.\n\n**Review semana 3:**\n1. Completei ___/5 treinos PPL\n2. Como me senti com o novo split vs Upper/Lower?\n3. Progressão nos compostos com barra (5 grandes)\n4. Surplus calórico: ___/7 dias\n5. Peso corporal: ___kg (vs início do N2: ___kg)\n6. Energia geral (1-10):\n\n**Próxima semana:** PPL completo com deload programado e busca de PRs pós-recuperação.', true, 10);

  -- DAY 22
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 22, 'Deload: o segredo que ninguém ensina', E'Antes de acelerar para a reta final, fazemos algo contra-intuitivo: um dia de treino LEVE. Isso se chama deload.\n\n**O que é Deload:** Redução planejada de volume e/ou intensidade para recuperação completa do sistema nervoso, articulações e tecido muscular. Não é fraqueza — é estratégia.\n\n**Protocolo de deload:** Faça PUSH A com 50-60% do peso habitual. Mesmas séries, mesmas reps. Foco total em forma perfeita e conexão mente-músculo.\n\n**Quando fazer deload normalmente:** A cada 4-6 semanas de treino progressivo, ou quando sentir: dor articular persistente, estagnação de força por 2+ semanas, fadiga crônica, ou irritabilidade/insônia.', 40);

  -- DAY 23
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 23, 'PULL leve (deload)', E'Segundo treino de deload. Pull A com 50-60% do peso. Aproveite para filmar sua forma em TODOS os compostos — forma perfeita com peso leve é a melhor base de referência. Filme tudo hoje.', 40);

  -- DAY 24
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 24, 'LEGS B: o treino que faltava', E'Deload encerrado. Energia renovada. Hoje: o último treino novo — Legs B. Depois disso, ciclo PPL completo de 6 treinos.\n\n**TREINO — LEGS B — 55 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Levantamento Terra | Barra | 4 | 5-6 | 150s |\n| 2 | Agachamento búlgaro (split squat) | Haltere | 3 | 10 cada | 60s |\n| 3 | Leg Press (pés juntos, foco quad) | Máquina | 3 | 12-15 | 60s |\n| 4 | Hip Thrust com barra | Barra | 3 | 10-12 | 60s |\n| 5 | Leg Curl | Máquina | 3 | 12-15 | 60s |\n| 6 | Panturrilha sentado | Máquina | 4 | 15-20 | 45s |\n\n**Agachamento Búlgaro:** Pé traseiro apoiado num banco, haltere em cada mão. Agache até coxa paralela. Unilateral — corrige desequilíbrios entre pernas e exige estabilização do core.\n\n**Legs A vs Legs B:** Legs A lidera com agachamento (foco quad, bilateral). Legs B lidera com terra (foco posterior/glúteos) + trabalho unilateral.', 60);

  -- DAY 25
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 25, 'PUSH A em força total', E'Pós-deload, seu corpo está recuperado. É comum sentir-se mais forte — a ciência chama isso de supercompensação. Aproveite: tente PRs (personal records) hoje.\n\n**TREINO: PUSH A** — Tente bater recordes pessoais nos compostos. Compare supino com o Dia 1 do Nível 2.', 55);

  -- DAY 26
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 26, 'PULL A — buscar PRs', E'PULL A. Pós-deload. Busque PRs na remada e pulldown. Compare seus pesos com a Semana 1 — a diferença vai ser evidente.', 55);

  -- DAY 27
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 27, 'Descanso', E'Descanso. Recovery ativo. Últimos 3 dias. Prepare-se para encerrar o Nível 2 com chave de ouro.', true, 5);

  -- DAY 28
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 28, 'LEGS A — buscar PRs no agachamento', E'Busque seu melhor agachamento com barra. Compare com o Dia 2 — quando você estava aprendendo com barra vazia ou próximo disso. A diferença vai te chocar.\n\n**TREINO: LEGS A.** Foco em PR no agachamento. Aplique double progression e tente superar todas as marcas.', 60);

  -- DAY 29
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 29, 'Reflexão + push final', E'Penúltimo dia. Push B. Último push do Nível 2.\n\n**TREINO: PUSH B.** Dê tudo.\n\n**Reflexão noturna:**\n1. Pesos no Dia 1 do Nível 1 vs hoje (Dia 59 total)\n2. Peso corporal: ___kg no início vs ___kg hoje\n3. Como me sinto na academia comparado ao Dia 1?\n4. Qual é o lift que mais gosto?\n5. Onde quero estar em 6 meses?', 55);

  -- DAY 30
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 30, 'Graduação: Protocolo de Hipertrofia', E'60 dias de academia. De alguém que não sabia o que fazer na academia, a alguém que roda um sistema PPL com os 5 grandes lifts, double progression e deload programado. Isso te coloca à frente de ~90% dos frequentadores.\n\n**Resumo da transformação:**\n\n| Métrica | Início N2 | Fim N2 |\n|---------|-----------|--------|\n| Frequência | 4x Upper/Lower | 5x PPL |\n| Equipamento | Máquinas + Halteres | + Barra olímpica |\n| Compostos dominados | 0 com barra | 5 grandes lifts |\n| Volume por treino | 3 séries x 6 exerc | 3-4 séries x 6-7 exerc |\n| Duração treino | 40 min | 50-55 min |\n| Progressão | Intuitiva | Double progression |\n| Nutrição | Proteína 1.6g/kg | + Surplus calórico |\n| Recovery | Sono + dia off | + Mobilidade + Deload |\n\n**Seu ciclo PPL completo (6 treinos):**\nPush A (Supino) → Pull A (Remada) → Legs A (Agachamento) → Push B (Overhead) → Pull B (Terra) → Legs B (Terra + Búlgaro)\n\n**Próximo passo:** Nível 3 — "Shape Avançado" — periodização ondulada, técnicas de intensificação (drop sets, rest-pause, myo-reps) e primeiro ciclo de cut/bulk estruturado.', 10);

  -- ============================================
  -- 3. Habit Templates
  -- ============================================

  -- 1. Aquecimento progressivo (Day 1 → end, checkbox)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Aquecimento progressivo', '🎯', 'corpo', 'morning', 'checkbox', 1, NULL, 'daily', 'progressive_warmup', 1);

  -- 2. Vídeo de forma (Day 4 → end, checkbox)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Vídeo de forma', '📐', 'corpo', 'morning', 'checkbox', 4, NULL, 'daily', 'form_check_video', 2);

  -- 3. Surplus calórico (Day 8 → end, checkbox)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Surplus calórico', '🍽️', 'corpo', 'evening', 'checkbox', 8, NULL, 'daily', 'caloric_surplus', 3);

  -- 4. Mobilidade pré-treino (Day 10 → end, timer, minutes, 5→10 min)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, 'Mobilidade pré-treino', '🧘', 'corpo', 'morning', 'timer', 'minutes', 5, 10, NULL, 'daily',
   '[{"from_day":15,"goal_value":10}]'::jsonb,
   'pre_workout_mobility', 4);

  -- 5. Review semanal (Day 7 → end, weekly on Sunday, checkbox)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, days_of_week, canonical_key, sort_order) VALUES
  (v_journey_id, 'Review semanal', '📊', 'corpo', 'evening', 'checkbox', 7, NULL, 'weekly', '{0}', 'weekly_review_gym', 5);

  -- 6. Deload (Day 22 — one_time, checkbox)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Deload', '🔻', 'corpo', 'morning', 'checkbox', 22, 23, 'one_time', NULL, 6);

END $$;
