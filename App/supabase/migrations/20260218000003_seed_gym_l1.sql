-- ============================================
-- SEED: Gym L1 — "Do Sofá ao Shape"
-- ============================================
-- NOTE: The journeys row for 'gym-l1' already exists
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
  SELECT id INTO v_journey_id FROM public.journeys WHERE slug = 'gym-l1';

  -- ============================================
  -- 1. Phases
  -- ============================================

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 1, 'ORIENTAÇÃO', 'Conhecer a arena', E'Elimine o medo. Domine as máquinas. 3 treinos Full Body apenas com máquinas guiadas — zero intimidação.', 1, 7, 'gym-phase-1', 'Primeira Semana')
  RETURNING id INTO v_phase1_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 2, 'CONSTRUÇÃO', 'Subir o peso, ganhar confiança', E'Máquinas dominadas. Hora de crescer. Volume sobe de 2 para 3 séries e novos hábitos de nutrição e sono.', 8, 14, 'gym-phase-2', 'Duas Semanas')
  RETURNING id INTO v_phase2_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 3, 'EXPANSÃO', 'Sair das máquinas', E'Halteres, pesos livres e a verdadeira academia. Transição gradual de máquinas para halteres.', 15, 22, 'gym-phase-3', 'Três Semanas')
  RETURNING id INTO v_phase3_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 4, 'INTEGRAÇÃO', 'Treinar como gente grande', E'4x por semana. Compostos. Split Upper/Lower. Seus primeiros resultados reais.', 23, 30, 'gym-phase-4', 'Do Sofá ao Shape')
  RETURNING id INTO v_phase4_id;

  -- ============================================
  -- 2. Journey Days (30 days)
  -- ============================================

  -- DAY 1
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 1, 'Você apareceu. Isso é tudo.', E'O dia mais difícil é o primeiro. Não o treino — a decisão de ir. Tudo que você precisa fazer hoje é entrar, completar o treino abaixo, e sair.\n\n**TREINO A — Full Body Máquinas (30 min)**\n\n| # | Exercício | Séries | Reps | Descanso |\n|---|-----------|--------|------|----------|\n| 1 | Leg Press (máquina) | 2 | 12 | 60s |\n| 2 | Supino na máquina (chest press) | 2 | 12 | 60s |\n| 3 | Remada na máquina (seated row) | 2 | 12 | 60s |\n| 4 | Leg Curl (máquina, posterior) | 2 | 12 | 60s |\n| 5 | Shoulder Press (máquina) | 2 | 10 | 60s |\n| 6 | Prancha (no chão) | 2 | 20s | 30s |\n\n**Aquecimento (5 min):** Caminhada na esteira ou bicicleta, intensidade leve.\n\n**Como escolher o peso:** Selecione um peso que torne as últimas 2-3 reps desafiadoras, mas que você consiga completar com boa forma.\n\n**Por que só máquinas?** Máquinas guiadas limitam o movimento a um trajeto fixo — é praticamente impossível errar a forma. Eliminam a barreira #1 de iniciantes: "não sei o que fazer."\n\n**Preparar mochila (noite anterior):** Deixe pronto: roupa de treino, tênis, toalha, garrafa d''água, fone de ouvido.', 35);

  -- DAY 2
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 2, 'Descanso inteligente', E'Hoje é dia de descanso. Isso NÃO é dia de não fazer nada — é dia de recuperação. Seus músculos crescem durante o descanso, não durante o treino.\n\n**O que esperar:** Se ontem foi seu primeiro treino em muito tempo, hoje ou amanhã você vai sentir DOMS (Dor Muscular de Início Tardio). É normal — significa que o estímulo funcionou. DOMS pica mais 24-48h depois e desaparece em 3-5 dias.\n\n**Movimentação leve** (caminhar, alongar) ajuda mais que descanso total.\n\n**Tarefa:** Preparar mochila para amanhã. Pesquisa de Kaushal & Rhodes mostra que hábitos preparatórios predizem frequência na academia melhor que motivação.', true, 5);

  -- DAY 3
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 3, 'Segunda ida. O padrão começa.', E'Ir uma vez é curiosidade. Ir de novo é intenção. A partir de hoje, a academia começa a virar hábito.\n\n**TREINO B — Full Body Máquinas (30 min)**\n\n| # | Exercício | Séries | Reps | Descanso |\n|---|-----------|--------|------|----------|\n| 1 | Agachamento no Smith (ou Hack Squat) | 2 | 12 | 60s |\n| 2 | Supino inclinado na máquina | 2 | 12 | 60s |\n| 3 | Pulldown (puxada frontal) | 2 | 12 | 60s |\n| 4 | Leg Extension (quadríceps) | 2 | 12 | 60s |\n| 5 | Elevação lateral na máquina (ou cabo) | 2 | 12 | 60s |\n| 6 | Abdominal na máquina | 2 | 15 | 30s |\n\n**NOVO — Refeição pós-treino:** Coma algo com proteína em até 2 horas após o treino. Exemplos: shake de whey + banana, 2 ovos + pão integral, iogurte grego + granola.\n\n**NOVO — Agendar treinos da semana:** Todo domingo à noite, bloqueie 3-4 horários para treinar. Trate como uma reunião que não pode ser cancelada.\n\n**Dica:** Tente ir no mesmo horário sempre. Consistência temporal é o preditor mais forte de formação de hábito de exercício.', 35);

  -- DAY 4
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 4, 'Descanso + conhecimento', E'**Micro-aula: Como funciona o ganho de músculo**\n\nQuando você treina, cria micro-lesões nas fibras musculares. Durante o descanso (especialmente dormindo), seu corpo repara essas fibras — e as reconstrói maiores e mais fortes. Esse ciclo de **estímulo → dano → reparo → crescimento** é a base de tudo.\n\nPara iniciantes, esse processo é turbinado: sua síntese proteica muscular fica elevada por **48-72 horas** após cada treino — vs ~24h para alguém experiente. É como se seu corpo estivesse com pressa de se adaptar.\n\nEsse é o fenômeno dos "newbie gains": você vai progredir mais rápido nos próximos 6-12 meses do que em qualquer outro momento da sua vida de treino.\n\n**Mas só se você der ao corpo o que ele precisa:** treino consistente + proteína suficiente + sono adequado.', true, 5);

  -- DAY 5
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 5, 'Terceira ida. Agora é sério.', E'Terceiro treino da semana. Segundo round do Treino A. Agora começa a brincadeira: tentar colocar um pouquinho mais de peso que no Dia 1.\n\n**TREINO A (revisitar) — Full Body Máquinas (30 min)**\nMesmo treino do Dia 1, mas com uma meta: **em pelo menos 2 exercícios, tente subir 1 nível de peso** (normalmente 2,5-5kg a mais na máquina). Se conseguir completar 10+ reps com boa forma, o peso está certo.\n\n**NOVO — Log de treino:**\nA partir de hoje, anote os pesos e reps de cada exercício. Pode ser no app, no celular, ou num caderninho.\n\nPesquisa mostra que pessoas que registram treinos têm aderência significativamente maior.\n\n**Por que isso importa:** Sem registro, você não sabe se está progredindo. Progressão de carga (progressive overload) é o princípio #1 do ganho de músculo.', 35);

  -- DAY 6
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 6, 'Descanso ativo', E'Dia off da academia, mas não do movimento. Hoje faça algo leve: caminhada de 20 min, alongamento, yoga, bike. Isso acelera a recuperação e reduz DOMS.', true, 5);

  -- DAY 7
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 7, 'Semana 1 completa', E'Uma semana. 3 treinos. Você entrou na academia 3 vezes e saiu vivo. Dados de retenção mostram que 14% dos novos membros desistem antes do segundo mês. Você não é essa estatística.\n\n**NOVO — Recuperação ativa:** Todo fim de semana, faça pelo menos 20 min de atividade leve. Caminhada, alongamento, natação leve, bike.\n\n**Review da semana 1:**\n1. Fui à academia ___/3 dias planejados\n2. Qual exercício me senti mais confortável?\n3. Qual equipamento ainda me intimida?\n4. Estou conseguindo anotar meus treinos?', true, 10);

  -- DAY 8
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 8, 'Volume sobe', E'Semana 2. Seu corpo já se adaptou parcialmente ao estímulo inicial. Hora de subir o volume: de 2 para 3 séries.\n\n**TREINO A+ — Full Body Máquinas, Volume Aumentado (40 min)**\n\n| # | Exercício | Séries | Reps | Descanso |\n|---|-----------|--------|------|----------|\n| 1 | Leg Press | 3 | 12 | 60s |\n| 2 | Supino na máquina | 3 | 12 | 60s |\n| 3 | Remada na máquina | 3 | 12 | 60s |\n| 4 | Leg Curl | 3 | 12 | 60s |\n| 5 | Shoulder Press | 3 | 10 | 60s |\n| 6 | Prancha | 3 | 30s | 30s |\n\n**NOVO — Meta de proteína diária:**\nPara maximizar seus newbie gains, consuma **1.6g de proteína por kg de peso corporal por dia**. Exemplo: 75kg → 120g de proteína/dia.\n\n**Dica prática:** Uma porção de proteína do tamanho da sua palma em cada refeição principal = ~30g por refeição × 4 refeições ≈ 120g.', 45);

  -- DAY 9
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 9, 'Descanso + nutrição 101', E'**Micro-aula: O básico da nutrição para ganho muscular**\n\n**Regras simples:**\n1. **Proteína é prioridade #1:** 1.6g/kg/dia. Distribua em 3-4 refeições.\n2. **Coma o suficiente:** Se quer ganhar músculo, coma levemente acima da manutenção (~300-500 kcal a mais/dia).\n3. **Sobre creatina:** Suplemento com mais evidência científica. 3-5g/dia, todo dia. Barato e seguro. Opcional.\n4. **Sobre whey protein:** Não é mágico — é só proteína em pó. Útil quando não atinge a meta com comida.\n5. **Ignore o resto:** Pré-treinos, BCAAs, glutamina — para iniciantes, são dinheiro jogado fora.', true, 10);

  -- DAY 10
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 10, 'Treino B com mais volume', E'Treino B atualizado com 3 séries. Tente superar os pesos da Semana 1.\n\n**TREINO B+ — Full Body Máquinas, Volume Aumentado (40 min)**\n\n| # | Exercício | Séries | Reps | Descanso |\n|---|-----------|--------|------|----------|\n| 1 | Agachamento no Smith | 3 | 12 | 60s |\n| 2 | Supino inclinado máquina | 3 | 12 | 60s |\n| 3 | Pulldown | 3 | 12 | 60s |\n| 4 | Leg Extension | 3 | 12 | 60s |\n| 5 | Elevação lateral máquina/cabo | 3 | 12 | 60s |\n| 6 | Abdominal máquina | 3 | 15 | 30s |\n\n**NOVO — Sono de recuperação:**\nSeus músculos crescem durante o sono — especificamente durante o sono profundo, quando o GH é liberado. Meta: **7-9 horas por noite**.\n\n**Estudos mostram que dormir <6h pode reduzir ganhos musculares em até 60%.** Sono é tão importante quanto treino.', true, 45);

  -- DAY 11
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 11, 'Descanso', E'Dia off. Continue batendo proteína e dormindo bem. Músculos em construção.', true, true, 5);

  -- DAY 12
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 12, 'Primeiro Treino A da semana', E'Sexto treino. Compare seu log com o Dia 1. Se os pesos subiram (mesmo que pouco) em pelo menos 3 exercícios — seus newbie gains estão ativados.\n\n**TREINO A+ (mesmo do Dia 8).** Meta: superar pelo menos 1-2 exercícios do último A+.\n\n**Regra de progressão:** Quando completar 3 séries de 12 reps com boa forma → suba o peso no próximo treino (geralmente 2,5-5kg nas máquinas). Se não completar 10 reps → mantenha o peso até conseguir.', true, 45);

  -- DAY 13
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, is_cliff_day, motivational_note, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 13, 'Descanso', E'Descanso. Proteína + sono. Preparar mochila para amanhã.', true, true, 'Muita gente desiste na segunda semana. O desconforto que você sente é seu corpo se adaptando. Continue.', 5);

  -- DAY 14
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 14, 'Semana 2 completa', E'8 treinos em 14 dias. Seus músculos já estão respondendo — mesmo que o espelho ainda não mostre tudo. As primeiras adaptações são neurais: seu cérebro está aprendendo a recrutar mais fibras musculares. As mudanças visuais vêm logo.\n\n**Review semana 2:**\n1. Completei ___/3 treinos\n2. Quantos exercícios consegui subir de peso vs Semana 1?\n3. Proteína: atingi a meta em ___/7 dias\n4. Sono: dormi 7h+ em ___/7 noites\n\n**Prévia da Semana 3:** Na próxima semana, você vai usar halteres pela primeira vez. Calma — vamos introduzir gradualmente.', true, 10);

  -- DAY 15
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 15, 'Primeiro haltere', E'Duas semanas de máquinas construíram sua base de força e confiança. Agora adicionamos halteres.\n\n**TREINO C — Full Body Máquinas + Halteres (40 min)**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Agachamento Goblet (haltere) | HALTERE | 3 | 10 | 90s |\n| 2 | Supino na máquina | Máquina | 3 | 12 | 60s |\n| 3 | Remada curvada com halteres | HALTERE | 3 | 10 | 60s |\n| 4 | Leg Curl | Máquina | 3 | 12 | 60s |\n| 5 | Elevação lateral com halteres | HALTERE | 3 | 12 | 60s |\n| 6 | Prancha | Corpo | 3 | 30s | 30s |\n\n**Agachamento Goblet:** Segure 1 haltere na vertical contra o peito. Pés na largura dos ombros. Agache até coxas ficarem paralelas ao chão.\n\n**Remada curvada:** Incline o tronco ~45°, um haltere em cada mão. Puxe em direção ao quadril, apertando as escápulas.\n\n**Dica anti-gymtimidation:** Os halteres leves (2-8kg) ficam no mesmo rack que os pesados. Todo mundo começou com os leves.', 45);

  -- DAY 16
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 16, 'Descanso', E'Se sentir DOMS diferente do normal (por usar halteres), é esperado — novos exercícios recrutam músculos estabilizadores que as máquinas não trabalhavam.', true, 5);

  -- DAY 17
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 17, 'Treino D: mais halteres', E'Segundo treino com halteres. Hoje substituímos mais um exercício de máquina por peso livre.\n\n**TREINO D — Full Body Máquinas + Halteres (40 min)**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Leg Press | Máquina | 3 | 12 | 60s |\n| 2 | Supino com halteres (banco reto) | HALTERE | 3 | 10 | 90s |\n| 3 | Pulldown | Máquina | 3 | 12 | 60s |\n| 4 | Stiff com halteres | HALTERE | 3 | 10 | 90s |\n| 5 | Rosca bíceps com halteres | HALTERE | 2 | 12 | 60s |\n| 6 | Tríceps na polia (cabo) | Cabo | 2 | 12 | 60s |\n\n**Supino com halteres:** Deite no banco reto, um haltere em cada mão. Empurre para cima até braços estendidos. Desça controlado.\n\n**Stiff com halteres:** Em pé, halteres na frente das coxas. Incline empurrando quadril para trás. Fundamental para posterior de coxa e glúteos.', 45);

  -- DAY 18
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 18, 'Descanso', E'Descanso merecido após 2 novos exercícios com peso livre.', true, 5);

  -- DAY 19
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, motivational_note, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 19, 'O precipício da motivação', E'Dia 19. A empolgação inicial já passou. Você pode estar sentindo que "não está funcionando" ou "não preciso ir hoje." Isso é normal — é a queda de dopamina da novidade. 50% dos novos membros de academia desistem nos primeiros 6 meses. A maioria desiste exatamente agora.\n\n**TREINO C (revisitar).** Mesmos exercícios do Dia 15. Meta: subir peso em pelo menos 2 exercícios.\n\n**Se a resistência for forte hoje:** Comprometa-se com METADE do treino. Faça 3 exercícios e vá embora. Ir e fazer pouco > não ir.\n\n**A regra de ouro: nunca falte duas vezes seguidas.**\n\n**Identity check:** Você é alguém que vai à academia. 19 dias provam isso.', 'Você não é a maioria. 19 dias de consistência provam isso. Continue.', 45);

  -- DAY 20
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 20, 'Descanso + 4x upgrade', E'Na Semana 4, você vai treinar 4x em vez de 3x. Isso atinge o limiar mínimo de Kaushal & Rhodes para formação de hábito de exercício.\n\n**Tarefa:** Revisar agenda da semana 4 e identificar 4 dias possíveis para treinar.', true, 5);

  -- DAY 21
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 21, 'Treino D revisitado', E'3 semanas completas. Revisitando Treino D com meta de progressão de carga.\n\n**TREINO D** — mesmo do Dia 17, buscando superar pesos.\n\n**Review Semana 3:**\n1. Completei ___/3 treinos\n2. Como me sinto usando halteres vs só máquinas?\n3. Progressão de carga: ___exercícios subiram de peso\n4. Proteína e sono: mantendo consistência?\n\nPesquisa diz que você cruzou a zona de maior risco de abandono.', true, 45);

  -- DAY 22
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 22, '4x começa agora', E'Semana 4: upgrade para 4 treinos. Novo programa com exercícios compostos.\n\n**TREINO E — Upper Body (Parte Superior) — 40 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Supino com halteres (reto) | Haltere | 3 | 10 | 90s |\n| 2 | Remada curvada com halteres | Haltere | 3 | 10 | 90s |\n| 3 | Shoulder Press com halteres | Haltere | 3 | 10 | 60s |\n| 4 | Pulldown | Máquina | 3 | 12 | 60s |\n| 5 | Rosca bíceps alternada | Haltere | 2 | 12 | 60s |\n| 6 | Tríceps na polia | Cabo | 2 | 12 | 60s |\n\n**Por que Upper/Lower?** A partir de 4x/semana, Full Body se torna intenso demais. Dividindo, cada grupo muscular treina 2x/semana com descanso adequado — ideal para hipertrofia.', 45);

  -- DAY 23
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 23, 'Lower Body', E'Dia de pernas. O treino que mais gente pula — e o que mais muda o corpo.\n\n**TREINO F — Lower Body (Parte Inferior) — 40 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Agachamento Goblet (pesado) | Haltere | 3 | 10 | 90s |\n| 2 | Stiff com halteres | Haltere | 3 | 10 | 90s |\n| 3 | Leg Press | Máquina | 3 | 12 | 60s |\n| 4 | Leg Curl | Máquina | 3 | 12 | 60s |\n| 5 | Panturrilha na máquina | Máquina | 3 | 15 | 45s |\n| 6 | Prancha | Corpo | 3 | 40s | 30s |', 45);

  -- DAY 24
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 24, 'Descanso', E'Descanso entre Upper e Lower. Recovery ativo se quiser.', true, 5);

  -- DAY 25
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 25, 'Upper Body 2', E'Segundo upper da semana. Variações diferentes para estimular os músculos de ângulos novos.\n\n**TREINO G — Upper Body 2 — 40 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Supino inclinado com halteres | Haltere | 3 | 10 | 90s |\n| 2 | Remada na máquina (pegada neutra) | Máquina | 3 | 12 | 60s |\n| 3 | Elevação lateral com halteres | Haltere | 3 | 12 | 60s |\n| 4 | Puxada frontal (pegada fechada) | Máquina | 3 | 12 | 60s |\n| 5 | Rosca martelo (haltere) | Haltere | 2 | 12 | 60s |\n| 6 | Extensão de tríceps com haltere | Haltere | 2 | 12 | 60s |', 45);

  -- DAY 26
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 26, 'Lower Body 2', E'Quarto treino da semana! 4x alcançado. Kaushal & Rhodes confirmam: 4x/semana durante 6 semanas = hábito formado. Você está na metade dessa equação.\n\n**TREINO H — Lower Body 2 — 40 min**\n\n| # | Exercício | Tipo | Séries | Reps | Descanso |\n|---|-----------|------|--------|------|----------|\n| 1 | Agachamento no Smith (profundo) | Smith | 3 | 10 | 90s |\n| 2 | Elevação pélvica (hip thrust) com haltere | Haltere | 3 | 12 | 60s |\n| 3 | Leg Extension | Máquina | 3 | 12 | 60s |\n| 4 | Leg Curl | Máquina | 3 | 12 | 60s |\n| 5 | Abdominais: crunch + prancha lateral | Corpo | 2+2 | 15/20s | 30s |', 45);

  -- DAY 27
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 27, 'Descanso + recuperação', E'Descanso. Recovery ativo. Preparar para os últimos 3 dias.', true, 5);

  -- DAY 28
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 28, 'Treino penúltimo: Upper', E'Dia 28. Treino E revisitado. Compare seus pesos com o Dia 22. Seis dias atrás. Progrediu?\n\n**TREINO E (revisitar)** — buscar superar pesos em pelo menos 2-3 exercícios.', 45);

  -- DAY 29
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 29, 'Reflexão pré-graduação', E'Penúltimo dia. Treino F revisitado. Amanhã é graduação.\n\n**TREINO F (revisitar)** — Dê tudo. Último treino de pernas do Nível 1.\n\n**Reflexão:**\n1. Quanto peso eu levantava no Dia 1 vs hoje?\n2. Como eu me sinto entrando na academia agora vs Dia 1?\n3. Qual exercício virou meu favorito?\n4. O que me surpreendeu mais nesses 30 dias?\n5. Estou dormindo e comendo melhor que antes?', 45);

  -- DAY 30
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 30, 'Graduação: Do Sofá ao Shape', E'30 dias. ~14 treinos completados. Você saiu de zero (ou inconsistência) para 4x por semana com halteres e compostos. Isso te coloca à frente de 67% dos membros de academia.\n\n**Sua transformação:**\n\n| Métrica | Dia 1 | Dia 30 |\n|---------|-------|--------|\n| Frequência | 0 ou inconsistente | 4x/semana |\n| Exercícios dominados | 0 | ~20 |\n| Equipamentos | Só máquinas | Máquinas + Halteres + Cabos |\n| Volume por treino | 2 séries × 6 exercícios | 3 séries × 6 exercícios |\n| Confiança na academia | Intimidado | Confortável |\n| Proteína | Sem controle | ~1.6g/kg/dia |\n| Treino registrado | Não | Sim, com progressão |\n\n**Newbie gains — O que esperar:**\n- Mês 1-3: Ganhos rápidos de força (50%+). Início de ganhos visuais.\n- Mês 3-6: Ganhos musculares visíveis (2-4 kg de músculo).\n- Mês 6-12: Fase mais gratificante. 7-12 kg de músculo possíveis no primeiro ano.', 10);

  -- ============================================
  -- 3. Habit Templates
  -- ============================================

  -- Treino na academia (Day 1-30, treinos 3x/sem semanas 1-3, 4x/sem semana 4)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, days_of_week, canonical_key, sort_order) VALUES
  (v_journey_id, 'Treino na academia', '🏋️', 'corpo', 'morning', 'checkbox', 1, NULL, 'daily', '{1,3,5}', 'gym_workout', 1);

  -- Preparar mochila (Day 1-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Preparar mochila', '🎒', 'corpo', 'evening', 'checkbox', 1, NULL, 'daily', 'gym_pack_bag', 2);

  -- Hidratação no treino (Day 1-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Hidratação no treino', '💧', 'corpo', 'morning', 'checkbox', 1, NULL, 'daily', 'gym_hydration', 3);

  -- Refeição pós-treino (Day 3-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Refeição pós-treino', '🍗', 'corpo', 'afternoon', 'checkbox', 3, NULL, 'daily', 'post_workout_meal', 4);

  -- Agendar treinos da semana (Day 3-30, weekly on Sunday)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, days_of_week, canonical_key, sort_order) VALUES
  (v_journey_id, 'Agendar treinos da semana', '📅', 'corpo', 'evening', 'checkbox', 3, NULL, 'weekly', '{0}', 'gym_schedule_week', 5);

  -- Log de treino (Day 5-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Log de treino', '📓', 'corpo', 'morning', 'checkbox', 5, NULL, 'daily', 'gym_workout_log', 6);

  -- Dia de recuperação ativa (Day 7-30, weekly on Saturday)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, days_of_week, canonical_key, sort_order) VALUES
  (v_journey_id, 'Dia de recuperação ativa', '🔄', 'corpo', 'afternoon', 'checkbox', 7, NULL, 'weekly', '{6}', 'active_recovery', 7);

  -- Meta de proteína diária (Day 8-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Meta de proteína diária', '🥚', 'corpo', 'evening', 'checkbox', 8, NULL, 'daily', 'protein_goal', 8);

  -- Sono de recuperação (Day 10-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Sono de recuperação', '😴', 'corpo', 'evening', 'checkbox', 10, NULL, 'daily', 'recovery_sleep', 9);

END $$;
