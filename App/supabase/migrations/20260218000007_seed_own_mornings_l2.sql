-- ============================================
-- SEED: Own Mornings L2 — "Manhã de Alta Performance"
-- ============================================
-- NOTE: The journeys row for 'own-mornings-l2' already exists
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
  SELECT id INTO v_journey_id FROM public.journeys WHERE slug = 'own-mornings-l2';

  -- ============================================
  -- 1. Phases
  -- ============================================

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 1, 'ATIVAÇÃO', 'Adicione movimento real', E'O Nível 1 construiu a estrutura. Agora introduzimos o elemento que mais transforma: treino matinal. Começamos com bodyweight mínimo e construímos progressivamente.', 1, 7, 'own-mornings-l2-phase-1', 'Ativação Completa')
  RETURNING id INTO v_phase1_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 2, 'COMBUSTÍVEL', 'Alimente a máquina', E'O treino está rodando. Agora adicionamos nutrição estratégica e intensificamos o treino com variação de exercícios.', 8, 14, 'own-mornings-l2-phase-2', 'Combustível Carregado')
  RETURNING id INTO v_phase2_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 3, 'FOCO', 'Transforme sua manhã em produtividade', E'A rotina física está consolidada. Agora adicionamos o Deep Focus Block — um período protegido de trabalho/estudo de alta concentração logo após a rotina matinal.', 15, 22, 'own-mornings-l2-phase-3', 'Foco Profundo')
  RETURNING id INTO v_phase3_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 4, 'INTEGRAÇÃO', 'Monte SEU sistema definitivo', E'A fase final consolida tudo em uma rotina sustentável e personalizada. O treino atinge volume alvo, o foco expande, e o usuário customiza a ordem e os componentes.', 23, 30, 'own-mornings-l2-phase-4', 'Manhã de Alta Performance')
  RETURNING id INTO v_phase4_id;

  -- ============================================
  -- 2. Journey Days (30 days)
  -- ============================================

  -- DAY 1
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 1, 'O upgrade começa', E'Bem-vindo ao Nível 2. Você provou que consegue manter uma rotina. Agora vamos transformar sua manhã em uma máquina de performance.\n\n**Treino matinal de hoje (10 min):**\nCircuito bodyweight — 2 rounds, sem descanso entre exercícios:\n1. 10 agachamentos (air squats)\n2. 10 flexões (ou na parede se necessário)\n3. 20 seg prancha\n4. 10 lunges alternados (5 cada perna)\n5. 10 mountain climbers (5 cada lado)\n→ 60 seg descanso entre rounds\n\n**Mudança na rotina:** A caminhada ao sol diminui de 20 para 10 min temporariamente para acomodar o treino sem explodir o tempo total.\n\n**Sequência recomendada:**\nCama → Água → Treino (10 min) → Caminhada/sol (10 min) → Banho + cold finish → Meditação → Journal → Leitura\n\n**Por que treino logo ao acordar?** O pico de testosterona ocorre nas primeiras horas da manhã — até 33% mais alto que à noite. Exercício matinal tem 94% de aderência vs 87% no período noturno.', 50);

  -- DAY 2
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 2, 'Repetir é consolidar', E'Mesmo treino de ontem. Mesma sequência. A repetição é o que transforma esforço consciente em piloto automático.\n\n**Treino matinal (10 min):** Mesmo circuito do Dia 1 — 2 rounds. Foque em melhorar a forma, não a velocidade.\n\n**Dica:** Se ontem doeu, ótimo — significa estímulo novo. DOMS é normal. Faça o treino mesmo assim — movimento leve reduz a dor mais rápido que descanso total.', 50);

  -- DAY 3
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 3, 'A noite alimenta a manhã', E'Uma manhã de alta performance começa na noite anterior. Hoje introduzimos a rotina noturna como hábito trackável.\n\n**Treino matinal (10 min):** Mesmo circuito, 2 rounds.\n\n**NOVO — Rotina noturna (3 passos, checkbox único):**\n1. Telas off 30 min antes de dormir\n2. Preparar amanhã: roupa do treino separada + garrafa de água cheia\n3. Alarme de dormir configurado (8h antes do despertar)\n\n**Por que isso importa?** Cada hora de tela antes de dormir aumenta risco de insônia em 59%. Preparar o ambiente na noite anterior elimina micro-decisões matinais que drenam willpower — decision fatigue.', 50);

  -- DAY 4
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 4, 'Primeiro upgrade de treino', E'Você já fez 3 dias de treino matinal. Hoje aumentamos levemente — de 2 para 3 rounds.\n\n**Treino matinal (12 min) — 3 rounds:**\n1. 10 agachamentos\n2. 10 flexões\n3. 30 seg prancha (upgrade de 20s)\n4. 10 lunges alternados\n5. 10 mountain climbers\n→ 60 seg descanso entre rounds\n\n**Regra de progressão:** Só aumentamos volume (rounds) OU dificuldade (tempo/reps), nunca os dois ao mesmo tempo. Hoje é só +1 round.', 55);

  -- DAY 5
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 5, 'Respire com intenção', E'No Nível 1 você aprendeu a meditar com foco na respiração. Agora introduzimos breathwork — respiração ativa como ferramenta de performance.\n\n**NOVO — Breathwork (3 min):**\nTécnica: Box Breathing (usada por Navy SEALs)\n- 4 seg inspira (nariz)\n- 4 seg segura\n- 4 seg expira (boca)\n- 4 seg segura\n- Repetir 6 ciclos (~3 min)\n\n**Quando fazer:** Entre o treino e a meditação. Breathwork ativa → meditação acalma. Regula o sistema nervoso de simpático para parassimpático.\n\n**Treino matinal (12 min):** 3 rounds, mesmo circuito.\n\n**Sequência atualizada:**\nCama → Água → Treino (12 min) → Caminhada/sol (10 min) → Banho + cold → Breathwork (3 min) → Meditação → Journal → Leitura', 55);

  -- DAY 6
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 6, 'Sábado: a prova real', E'Final de semana. Seu corpo quer dormir até tarde. Sua identidade diz outra coisa. Acorde no máximo 1h depois do horário de semana.\n\n**Treino matinal (12 min):** Mesmo circuito, 3 rounds.\n\n**Breathwork (3 min):** Box breathing, 6 ciclos.\n\n**Lembrete de social jetlag:** Dormir 2h+ a mais no fim de semana reseta seus ganhos circadianos da semana inteira. Máximo 1h a mais. Sua manhã de segunda agradece.', 55);

  -- DAY 7
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 7, 'Review semanal #1', E'Uma semana de Nível 2 completa. Hora de avaliar e ajustar.\n\n**Treino matinal (12 min):** 3 rounds.\n\n**NOVO — Review semanal (10 min, domingo à noite ou segunda de manhã):**\n1. Quantos dias completei a rotina completa? ___/7\n2. Qual hábito foi mais fácil essa semana?\n3. Qual hábito quase pulei? Por quê?\n4. O que preciso ajustar na próxima semana?\n5. Nota de energia geral da semana (1-10)\n\n**Badge de Semana 1 Nível 2 desbloqueado.**\n\n**🏆 Badge: "Ativação Completa" — Fase 1 concluída**', true, 55);

  -- DAY 8
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 8, 'Nutrição como hábito', E'Treino sem nutrição é motor sem combustível. Hoje introduzimos o hábito de nutrição matinal estratégica.\n\n**Treino matinal (15 min) — NOVO CIRCUITO A:**\n3 rounds:\n1. 15 agachamentos (+5 reps)\n2. 8 flexões diamante (mãos próximas)\n3. 30 seg prancha lateral (15 seg cada lado)\n4. 10 step-ups em cadeira/banco (5 cada perna)\n5. 15 mountain climbers\n→ 45 seg descanso entre rounds (reduzido)\n\n**NOVO — Nutrição matinal (checkbox):**\nProtocolo simples — dentro de 1-2h após acordar, coma:\n- 25-40g de proteína (ovos, whey, iogurte grego)\n- Gordura saudável (abacate, castanhas, azeite)\n- Fibra (aveia, fruta, vegetais)\n\nExemplo rápido: 3 ovos mexidos + ½ abacate + 1 fatia de pão integral = ~35g proteína. Preparo: 7 min.\n\n**Se pratica jejum intermitente:** Marque o checkbox quando fizer sua primeira refeição seguindo o protocolo.', 60);

  -- DAY 9
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 9, 'Progressão no breathwork', E'Seu corpo já conhece o box breathing. Hoje expandimos para 5 minutos e introduzimos uma variação.\n\n**Treino matinal (15 min):** Circuito A, 3 rounds.\n\n**Breathwork atualizado (5 min):**\n- 3 min de box breathing (4-4-4-4)\n- 2 min de respiração 4-7-8 (inspira 4 seg, segura 7 seg, expira 8 seg) — ativa o parassimpático mais profundamente antes da meditação.\n\n**Nutrição matinal:** Seguir protocolo de proteína + gordura + fibra.', 60);

  -- DAY 10
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 10, 'Dia mínimo (planejado)', E'Dia de consolidação. Sua versão mínima agora é mais robusta que a rotina completa de muita gente. Faça o mínimo com orgulho.\n\n**Versão mínima do Nível 2:**\nCama → Água → 5 min de caminhada ao sol → 3 min breathwork → 1 gratidão + 1 prioridade → Fim.\nTempo total: ~12 min\n\n**Treino:** OFF hoje. Descanso ativo (a caminhada já cobre). Recovery é parte do protocolo, não falha.', true, 12);

  -- DAY 11
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 11, 'Volta com tudo', E'Descansou ontem. Hoje volta com energia renovada.\n\n**Treino matinal (15 min) — CIRCUITO B (novo):**\n3 rounds:\n1. 15 sumo squats (pés afastados, pontas para fora)\n2. 10 flexões inclinadas (pés elevados em cadeira)\n3. 30 seg hollow body hold\n4. 20 jumping jacks\n5. 8 burpees (sem flexão se necessário)\n→ 45 seg descanso\n\n**Alternância de circuitos:** A partir de agora, alternamos Circuito A e Circuito B. Isso evita adaptação muscular e mantém o estímulo novo — mesmo princípio que periodização em academias.', 60);

  -- DAY 12
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 12, 'Cold upgrade', E'Você já domina 2 minutos de frio. +30 segundos pode parecer pouco, mas esses segundos finais são onde o real benefício acontece.\n\n**Treino matinal (15 min):** Circuito A, 3 rounds.\n\n**Cold exposure (2 min 30 seg):**\nA pesquisa de Søberg recomenda 11 min totais de frio por semana. Com 2:30/dia, 5 dias = 12:30 min/semana. Você está no alvo.\n\n**Dica avançada:** Tente não controlar a respiração nos primeiros 10 seg do frio. Controlá-la conscientemente é treino de regulação emocional aplicada.', 60);

  -- DAY 13
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 13, 'Treino mais longo', E'Mais 3 minutos de treino. Adicionamos 1 round extra.\n\n**Treino matinal (18 min) — Circuito B, 4 rounds:**\nMesmo circuito B do Dia 11, agora com 4 rounds em vez de 3.\n\n**Nutrição matinal:** Hoje tente uma variação: smoothie de proteína (1 scoop whey + 1 banana + espinafre + pasta de amendoim + leite). Preparo: 3 min. Portátil.', 65);

  -- DAY 14
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 14, 'Review semanal #2', E'Duas semanas de Nível 2. Você já tem treino, breathwork e nutrição integrados à sua manhã. Top 5% de consistência entre usuários de apps de hábitos.\n\n**Treino matinal (18 min):** Circuito A, 4 rounds.\n\n**Review semanal:**\n1. Quantos dias completei a rotina completa? ___/7\n2. Qual hábito foi mais fácil essa semana?\n3. Qual hábito quase pulei? Por quê?\n4. O que preciso ajustar na próxima semana?\n5. Nota de energia geral da semana (1-10)\n6. Como está meu nível de energia comparado ao início do Nível 2? (1-10)\n\n**Rotina total agora: ~50 min.**\n\n**🏆 Badge: "Combustível Carregado" — Fase 2 concluída**', true, 65);

  -- DAY 15
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 15, 'O bloco de foco', E'Toda a sua rotina matinal — treino, sol, meditação, nutrição — foi projetada para criar um estado neurológico ideal. Agora vamos usar esse estado. Introduzimos o Deep Focus Block: 25 minutos de trabalho/estudo focado, sem interrupções.\n\n**NOVO — Deep Focus Block (25 min):**\nTécnica Pomodoro adaptada:\n1. Escolha UMA tarefa do seu MIT (Most Important Task) do journaling\n2. Timer de 25 min\n3. Celular em modo avião (ou em outro cômodo)\n4. Sem abas de redes sociais, sem música com letra\n5. Quando o timer apitar: PARE. Mesmo se estiver no flow.\n\n**Sequência completa atualizada:**\nCama → Água → Treino → Caminhada/sol → Banho + cold → Breathwork → Meditação → Journal → Leitura → Café/nutrição → Deep Focus Block (25 min)\n\n**Treino matinal (18 min):** Circuito B, 4 rounds.\n\n**Por que 25 min?** A técnica Pomodoro usa 25 min porque é curto o suficiente para não intimidar, longo o suficiente para entrar em estado de concentração.', 90);

  -- DAY 16
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 16, 'Foco + treino pesado', E'Segundo dia de Deep Focus. Antes de começar, defina exatamente o que "terminado" significa para sua tarefa em 25 min.\n\n**Treino matinal (18 min):** Circuito B, 4 rounds.\n\n**Deep Focus Block (25 min):** Antes de iniciar, escreva em 1 frase: "Nos próximos 25 min, vou _____ e o resultado será _____."\n\n**Dica de foco:** Se um pensamento intrusivo aparecer, anote em um papel ao lado ("parking lot") e volte à tarefa. Não abra o celular para "anotar" — essa é a armadilha.', 90);

  -- DAY 17
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 17, 'Dia mínimo', E'Dia de consolidação. Rotina mínima + 1 Pomodoro de 25 min. Nada mais.\n\n**Versão mínima:**\nCama → Água → 5 min caminhada → 3 min breathwork → 1 gratidão + 1 MIT → Deep Focus 25 min.\nTempo total: ~38 min (incluindo o bloco de foco)\n\n**Treino:** OFF. Day off estratégico.', true, 38);

  -- DAY 18
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, motivational_note, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 18, 'O precipício da motivação', E'Dia 18. Estatisticamente, este é o ponto de maior abandono. A dopamina da novidade acabou. O que sobra é disciplina — e ela é um músculo que você treinou por 48 dias (18 do N2 + 30 do N1). Não negocie consigo mesmo hoje. Apenas execute.\n\n**Treino matinal (18 min):** Circuito A, 4 rounds.\n\n**Deep Focus Block (25 min):** Se a resistência for forte hoje, comprometa-se com apenas 10 min. Geralmente, uma vez sentado e começando, os 25 min acontecem.\n\n**Identity check:** Você é alguém que completa o que começa. 48 dias provam isso.', true, 'Você não é a maioria. A dopamina da novidade acabou, mas a disciplina que você construiu em 48 dias é real. Continue — o desconforto é temporário.', 90);

  -- DAY 19
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 19, 'Mínimo protegido', E'Segundo dia mínimo na zona de risco. Isso é design, não fraqueza.\n\n**Versão mínima:** Cama → Água → 10 min caminhada ao sol → 1 gratidão → Deep Focus 25 min.\n\n**Regra de ouro:** Nunca falte duas vezes seguidas. Ontem foi pesado, hoje é leve. Amanhã volta com tudo.', 40);

  -- DAY 20
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 20, 'Upgrade do foco', E'Você fez 5 sessões de Pomodoro de 25 min. Hoje expandimos para 35 min — entrando em território de foco profundo real.\n\n**Treino matinal (18 min):** Circuito B, 4 rounds.\n\n**Deep Focus Block (35 min):**\nMesmo protocolo. Os minutos extras são onde o real "deep work" acontece — depois de ~25 min o cérebro entra em estado de maior fluidez se não houver interrupção.', 95);

  -- DAY 21
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 21, 'Treino de 20 min + review', E'Três semanas de Nível 2 (51 dias totais). Upgrades duplo hoje: treino sobe para 20 min e breathwork para 7 min.\n\n**Treino matinal (20 min) — CIRCUITO C (novo):**\n4 rounds:\n1. 15 jump squats (upgrade explosivo)\n2. 10 pike push-ups (pés elevados, quadril alto)\n3. 40 seg prancha com shoulder tap (estabilidade + core)\n4. 10 single-leg glute bridges (5 cada)\n5. 10 burpees completos (cardio)\n→ 45 seg descanso\n\n**Breathwork (7 min):**\n- 3 min box breathing (4-4-4-4)\n- 2 min respiração 4-7-8\n- 2 min Wim Hof simplificado: 20 respirações profundas rápidas → expira tudo → segura o máximo → inspira e segura 15 seg → repete 1x.\n⚠️ Faça sentado, nunca em pé ou na água.\n\n**Review semanal:** 6 perguntas + nota de energia.\n\n**🏆 Badge: "Foco Profundo" — Fase 3 concluída**', true, 95);

  -- DAY 22
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 22, 'Fim de semana forte', E'Fim de semana com rotina completa. Lembre: máximo 1h a mais de sono. Sua manhã de segunda agradece.\n\n**Treino matinal (20 min):** Circuito A, 4 rounds.\n\n**Deep Focus Block (35 min):** Trabalhe na tarefa mais importante do fim de semana.\n\n**Breathwork (7 min):** Protocolo completo com Wim Hof simplificado.', 95);

  -- DAY 23
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 23, 'Treino alvo atingido', E'25 minutos de treino matinal. Este é o volume alvo — suficiente para estímulo real, curto o suficiente para ser diário.\n\n**Treino matinal (25 min) — CIRCUITO C, 5 rounds:**\nMesmo circuito C do Dia 21, agora com 5 rounds completos.\n\n**A partir de agora**, alterne circuitos ao longo da semana:\n- Seg/Qui: Circuito A\n- Ter/Sex: Circuito B\n- Qua/Sáb: Circuito C\n- Dom: OFF ou caminhada longa de 30 min\n\n**Deep Focus Block (35 min):** Padrão.', 100);

  -- DAY 24
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 24, 'Foco profundo real', E'50 minutos de foco profundo. Esse é o seu bloco de alta performance — 2 Pomodoros consecutivos com 5 min de pausa no meio, ou 50 min direto se estiver no flow.\n\n**Opções de formato:**\n- Opção A: 25 min on → 5 min pausa → 25 min on (Pomodoro duplo)\n- Opção B: 50 min direto (para quando entrar em flow state)\n\n**Treino matinal (25 min):** Circuito B, 5 rounds.\n\n**Deep Focus Block (50 min):** Escolha o formato que funcionar melhor.', 115);

  -- DAY 25
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 25, 'Personalize sua stack', E'Você tem 12 hábitos ativos + rotina noturna. A rotina completa leva ~60 min (sem contar o bloco de foco). Reflita: qual sequência funciona MELHOR para VOCÊ?\n\n**Exercício de personalização:**\nReordene sua manhã ideal. Considere:\n- Você prefere treinar ANTES ou DEPOIS do sol?\n- Meditação funciona melhor pré ou pós-banho frio?\n- Journaling é mais produtivo antes ou depois da leitura?\n- O Deep Focus Block funciona melhor colado na rotina ou com um gap?\n\n**Não existe ordem certa.** Existe a ordem que você vai manter por anos. Escreva no journal: "Minha sequência ideal é: _____"\n\n**Treino matinal (25 min):** Circuito C, 5 rounds.\n\n**Deep Focus Block (50 min):** Padrão.', 115);

  -- DAY 26
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 26, 'Dia mínimo master', E'Último dia mínimo planejado. Sua versão mínima deve ser tão automática que funciona em piloto automático mesmo nos piores dias.\n\n**Versão mínima definitiva (15 min):**\nCama → Água → 10 min caminhada ao sol → 3 min breathwork → 1 gratidão + 1 MIT → Deep Focus 25 min\n\n**Regra de ouro pós-Nível 2:** Nunca faça zero. Nos dias difíceis, o mínimo é o mínimo. Mas zero não é opção.', 40);

  -- DAY 27
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 27, 'Stress test: dia caótico', E'Simulação de caos. Imagine: seu alarme não tocou e você tem 20 minutos antes de sair de casa.\n\n**Rotina de emergência (20 min):**\nCama → Água → 5 min caminhada rápida ao sol → Banho + 1 min frio → 3 min breathwork → 1 gratidão + 1 MIT → sair\n\n**Rotina completa:** Se NÃO está simulando caos, faça a rotina completa normalmente.\n\n**Treino matinal (25 min):** Circuito C, 5 rounds.\n\n**Deep Focus Block (50 min):** Padrão.', 115);

  -- DAY 28
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 28, 'Rotina completa sob pressão', E'Dois dias para o fim. Rotina completa, sem atalhos. Prove para si mesmo que consegue executar sob qualquer condição.\n\n**Treino matinal (25 min):** Circuito A, 5 rounds. Tente bater seu melhor tempo mantendo boa forma.\n\n**Deep Focus Block (50 min):** Trabalhe na tarefa mais importante da sua semana.\n\n**Review semanal:** Se for domingo, complete o review de 6 perguntas.', 115);

  -- DAY 29
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 29, 'Reflexão pré-graduação', E'Amanhã é o último dia. Hoje à noite, reserve 10 min para a reflexão mais importante desta jornada.\n\n**Treino matinal (25 min):** Circuito B, 5 rounds.\n\n**Deep Focus Block (50 min):** Padrão.\n\n**Reflexão noturna (no journal):**\n1. Quem eu era no Dia 1 do Nível 1? (2-3 frases)\n2. Quem eu sou hoje, 59 dias depois?\n3. Qual hábito me surpreendeu mais?\n4. Qual foi o dia mais difícil e como superei?\n5. O que minha manhã ideal vai parecer daqui pra frente?', 115);

  -- DAY 30
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 30, 'Graduação: Manhã de Alta Performance', E'60 dias de manhãs construídas com intenção. Você não é mais alguém que "tenta ter uma rotina matinal." Você é alguém que performa de manhã. Isso é identidade, não disciplina.\n\n**Rotina de graduação (completa):**\n| Ordem | Hábito | Tempo |\n|-------|--------|-------|\n| 1 | Arrumar cama | 2 min |\n| 2 | Hidratar 500mL | 2 min |\n| 3 | Treino matinal | 25 min |\n| 4 | Caminhada ao sol | 10 min |\n| 5 | Banho + cold finish | +2:30 |\n| 6 | Breathwork | 7 min |\n| 7 | Meditação | 10 min |\n| 8 | Journaling | 5 min |\n| 9 | Leitura | 10 min |\n| 10 | Nutrição matinal | ~10 min |\n| 11 | Café (após 90 min) | — |\n| 12 | Deep Focus Block | 50 min |\n\n**Tempo ativo total:** ~60 min de rotina + 50 min de Deep Focus\n\n**Estatísticas finais:**\n- Dias completados: __/30\n- Hábitos ativos: 13 (12 matinais + 1 noturno)\n- Treinos completados: __\n- Minutos de foco profundo acumulados: __\n- Maior streak consecutivo: __\n\n**🏆 Badge Final: "Manhã de Alta Performance" — Jornada Nível 2 completa**\n**🔓 Desbloqueado: Nível 3 — "Protocolo Imbatível"**', 115);

  -- ============================================
  -- 3. Habit Templates
  -- ============================================

  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, days_of_week, goal_progression, canonical_key, sort_order) VALUES

  -- 1. Treino matinal (Day 1 → end, timer, minutes, 10 → 25 min)
  (v_journey_id, 'Treino matinal', '🏋️', 'corpo', 'morning', 'timer', 'minutes', 10, 1, NULL, 'daily', '{0,1,2,3,4,5,6}',
   '[{"from_day":4,"goal_value":12},{"from_day":8,"goal_value":15},{"from_day":13,"goal_value":18},{"from_day":21,"goal_value":20},{"from_day":23,"goal_value":25}]'::jsonb,
   'morning_workout', 1),

  -- 2. Rotina noturna (Day 3 → end, checkbox)
  (v_journey_id, 'Rotina noturna', '🌙', 'corpo', 'evening', 'checkbox', 'none', NULL, 3, NULL, 'daily', '{0,1,2,3,4,5,6}', '[]'::jsonb, 'night_routine', 2),

  -- 3. Breathwork (Day 5 → end, timer, minutes, 3 → 7 min)
  (v_journey_id, 'Breathwork', '🫁', 'mente', 'morning', 'timer', 'minutes', 3, 5, NULL, 'daily', '{0,1,2,3,4,5,6}',
   '[{"from_day":9,"goal_value":5},{"from_day":21,"goal_value":7}]'::jsonb,
   'breathwork', 3),

  -- 4. Nutrição matinal (Day 8 → end, checkbox)
  (v_journey_id, 'Nutrição matinal', '🥗', 'corpo', 'morning', 'checkbox', 'none', NULL, 8, NULL, 'daily', '{0,1,2,3,4,5,6}', '[]'::jsonb, 'morning_nutrition', 4),

  -- 5. Deep Focus Block (Day 15 → end, timer, minutes, 25 → 50 min)
  (v_journey_id, 'Deep Focus Block', '🔒', 'mente', 'morning', 'timer', 'minutes', 25, 15, NULL, 'daily', '{0,1,2,3,4,5,6}',
   '[{"from_day":20,"goal_value":35},{"from_day":24,"goal_value":50}]'::jsonb,
   'deep_focus_block', 5),

  -- 6. Review semanal (Day 7 → end, weekly on Sunday, checkbox)
  (v_journey_id, 'Review semanal', '📊', 'mente', 'evening', 'checkbox', 'none', NULL, 7, NULL, 'weekly', '{0}', '[]'::jsonb, 'weekly_review_mornings', 6);

END $$;
