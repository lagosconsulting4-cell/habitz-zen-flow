-- ============================================
-- SEED: Digital Detox L1 — "Detox de Dopamina"
-- ============================================

-- 1. Journey
INSERT INTO public.journeys (slug, theme_slug, title, subtitle, promise, description, level, duration_days, illustration_key, target_audience, expected_result, tags, is_active, sort_order)
VALUES (
  'digital-detox-l1',
  'digital-detox',
  'Detox de Dopamina',
  'Resetar Minha Vida Digital',
  'Reduza seu tempo de tela pela metade, durma 1 hora a mais por noite e recupere sua capacidade de foco — sem virar monge nem jogar seu celular fora.',
  'Jornada de 30 dias para retomar o controle da sua relação com tecnologia. Baseada em pesquisa científica sobre dopamina, sono e foco.',
  1,
  30,
  'digital-detox',
  'Homens 20-25 anos que sentem que passam tempo demais no celular, têm dificuldade de foco, dormem mal e querem retomar controle',
  'Screen time reduzido em ~50%, sono melhorado em 20+ min/noite, capacidade de foco restaurada, relação saudável com tecnologia',
  ARRAY['foco', 'sono', 'digital', 'produtividade'],
  true,
  3
);

-- Also insert L2 as locked
INSERT INTO public.journeys (slug, theme_slug, title, subtitle, promise, description, level, duration_days, illustration_key, prerequisite_journey_slug, prerequisite_min_percent, tags, is_active, sort_order)
VALUES (
  'digital-detox-l2',
  'digital-detox',
  'Digital Minimalism',
  'Produtividade Intencional',
  'Construa um sistema de produtividade que usa tecnologia a seu favor, não contra você. Deep work blocks, second brain, e uma vida offline tão rica que o celular perde a graça.',
  'Nível 2 do Detox de Dopamina. Foco em produtividade intencional e minimalismo digital.',
  2,
  30,
  'digital-detox',
  'digital-detox-l1',
  80,
  ARRAY['foco', 'produtividade', 'digital', 'deep-work'],
  true,
  4
);

-- Also insert placeholder journeys for the other 4 themes (L1 + L2)
INSERT INTO public.journeys (slug, theme_slug, title, subtitle, promise, level, duration_days, illustration_key, tags, is_active, sort_order) VALUES
  ('own-mornings-l1', 'own-mornings', 'Domine Suas Manhãs', 'Rotina Matinal de Elite', 'Construa uma rotina matinal que transforma suas manhãs em seu superpoder.', 1, 30, 'own-mornings', ARRAY['manhã','sono','rotina'], true, 1),
  ('own-mornings-l2', 'own-mornings', 'Own Your Mornings L2', 'Manhã Avançada', 'Otimize sua rotina matinal com técnicas avançadas de performance.', 2, 30, 'own-mornings', ARRAY['manhã','performance'], true, 2),
  ('gym-l1', 'gym', 'Do Sofá ao Shape', 'Primeiros 30 Dias na Academia', 'Saia da inércia e construa o hábito de treinar. Sem vergonha, sem julgamento.', 1, 30, 'gym', ARRAY['academia','corpo','saúde'], true, 5),
  ('gym-l2', 'gym', 'Protocolo de Hipertrofia', 'Shape Avançado', 'Maximize seus resultados com protocolos avançados de treino e nutrição.', 2, 30, 'gym', ARRAY['academia','hipertrofia'], true, 6),
  ('focus-protocol-l1', 'focus-protocol', 'Domine Sua Atenção', 'Protocolo de Foco', 'Recupere sua capacidade de concentração profunda em 30 dias.', 1, 30, 'focus-protocol', ARRAY['foco','estudo','produtividade'], true, 7),
  ('focus-protocol-l2', 'focus-protocol', 'Aprendizado Acelerado', 'Foco Avançado', 'Técnicas avançadas de aprendizado e deep work para máxima performance.', 2, 30, 'focus-protocol', ARRAY['foco','aprendizado'], true, 8),
  ('finances-l1', 'finances', 'Controle Total', 'Finanças Pessoais', 'Tome controle das suas finanças em 30 dias. Sem planilha complicada.', 1, 30, 'finances', ARRAY['dinheiro','finanças','controle'], true, 9),
  ('finances-l2', 'finances', 'Faça Seu Dinheiro Trabalhar', 'Finanças Avançadas', 'Investimentos, renda passiva e construção de patrimônio.', 2, 30, 'finances', ARRAY['investimento','patrimônio'], true, 10)
ON CONFLICT (slug) DO NOTHING;

-- Set prerequisite for L2s
UPDATE public.journeys SET prerequisite_journey_slug = 'own-mornings-l1', prerequisite_min_percent = 80 WHERE slug = 'own-mornings-l2';
UPDATE public.journeys SET prerequisite_journey_slug = 'gym-l1', prerequisite_min_percent = 80 WHERE slug = 'gym-l2';
UPDATE public.journeys SET prerequisite_journey_slug = 'focus-protocol-l1', prerequisite_min_percent = 80 WHERE slug = 'focus-protocol-l2';
UPDATE public.journeys SET prerequisite_journey_slug = 'finances-l1', prerequisite_min_percent = 80 WHERE slug = 'finances-l2';

-- ============================================
-- 2. Phases for Digital Detox L1
-- ============================================
DO $$
DECLARE
  v_journey_id uuid;
  v_phase1_id uuid;
  v_phase2_id uuid;
  v_phase3_id uuid;
  v_phase4_id uuid;
BEGIN
  SELECT id INTO v_journey_id FROM public.journeys WHERE slug = 'digital-detox-l1';

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 1, 'AWARENESS', 'Abra os olhos', 'Sem grandes mudanças de comportamento. Foco em medir, entender e preparar o terreno.', 1, 7, 'digital-detox-phase-1', 'Olhos Abertos')
  RETURNING id INTO v_phase1_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 2, 'FRICTION', 'Dificulte o vício', 'Introduzir barreiras que tornem o uso compulsivo mais difícil.', 8, 14, 'digital-detox-phase-2', 'Ambiente Redesenhado')
  RETURNING id INTO v_phase2_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 3, 'REPLACEMENT', 'Preencha o vazio', 'Reduzir screen time ativamente e substituir com atividades analógicas.', 15, 22, 'digital-detox-phase-3', '3 Semanas Limpo')
  RETURNING id INTO v_phase3_id;

  INSERT INTO public.journey_phases (journey_id, phase_number, title, subtitle, description, day_start, day_end, badge_illustration_key, badge_name)
  VALUES (v_journey_id, 4, 'INTEGRATION', 'Seu novo normal', 'Consolidar o sistema. Relação consciente com tecnologia.', 23, 30, 'digital-detox-phase-4', 'Detox Completo')
  RETURNING id INTO v_phase4_id;

  -- ============================================
  -- 3. Journey Days (30 days)
  -- ============================================

  -- DAY 1
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 1, 'O diagnóstico', E'Antes de mudar qualquer coisa, vamos ver a realidade. Hoje você só precisa fazer 3 coisas: medir, silenciar e desligar.\n\n**Tarefa 1 — Medir seu screen time:**\nVá em Ajustes > Tempo de Uso (iOS) ou Bem-estar digital (Android) e anote seu screen time total, top 3 apps, desbloqueios e notificações. Este é seu baseline.\n\n**Contexto:** Se você é como a média brasileira, seu screen time está em torno de 9 horas por dia. Isso é mais da metade do tempo que você fica acordado.\n\n**Tarefa 2 — Modo foco:**\nEscolha 1 bloco de 30 minutos e coloque o celular no modo silencioso. Observe como se sente.\n\n**Tarefa 3 — Toque de recolher digital:**\nDefina um horário para parar de usar telas antes de dormir (recomendado: 1h antes).\n\n**A ciência:** Cada hora de tela antes de dormir aumenta o risco de insônia em 59% e reduz seu sono em 24 minutos.', 15);

  -- DAY 2
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 2, 'A auditoria', E'Ontem você mediu. Hoje vamos analisar. Não é sobre quanto tempo você passa no celular — é sobre POR QUE.\n\n**Exercício — Auditoria de uso:**\nPara cada um dos seus top 5 apps, classifique:\n- 🔴 **Dopamina:** Redes sociais, YouTube shorts, TikTok, Reddit, jogos. Projetados para viciar.\n- 🟡 **Útil:** WhatsApp, email, Spotify. Têm utilidade mas podem ser usados em excesso.\n- 🟢 **Essencial:** Ligações, apps de trabalho, autenticadores.\n\n**Objetivo:** Identificar os 2-3 apps 🔴 que consomem mais tempo. Esses são seus "vampiros de dopamina".\n\n**Micro-aula — Por que é tão difícil largar o celular:**\nRedes sociais usam o mesmo mecanismo de um caça-níqueis: recompensa variável. Seu cérebro está literalmente apostando a cada scroll.', 10);

  -- DAY 3
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 3, 'Grayscale: o hack mais simples', E'Hoje você vai fazer uma mudança de 30 segundos que reduz screen time em 20 min/dia.\n\n**Ativar Grayscale:**\n\n**iPhone:** Ajustes → Acessibilidade → Tela e Tamanho do Texto → Filtros de Cor → Ativar → Tons de Cinza\n*Dica: Configure como atalho: triple-click no botão lateral liga/desliga grayscale.*\n\n**Android:** Configurações → Acessibilidade → Correção de cor → Ativar → Tons de cinza\n\n**Por que funciona:**\nCores brilhantes são desenhadas para estimular seu cérebro e disparar dopamina. Em preto e branco, seu celular fica... chato. E esse é o ponto.\n\nPesquisa (Universidade de Amsterdam): grayscale reduz screen time em ~20 min/dia e o efeito fica mais forte com o tempo.\n\n**Protocolo:** Ative grayscale e mantenha pelo resto do dia. Quando precisar de cores, desative rapidamente e volte.', 5);

  -- DAY 4
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 4, 'Entenda seus triggers', E'Toda vez que você pega o celular, existe um trigger. Hoje vamos identificar os seus.\n\n**Exercício — Diário de triggers:**\nTODA vez que pegar o celular, anote:\n1. O que estava fazendo antes?\n2. O que sentiu? (tédio, ansiedade, curiosidade, solidão, hábito)\n3. Havia notificação ou foi impulso interno?\n4. Quanto tempo ficou no celular?\n\n**Triggers mais comuns:**\n- **Tédio:** Qualquer micro-momento vazio → celular\n- **Ansiedade social:** Situações desconfortáveis → escape\n- **FOMO:** Medo de perder algo\n- **Hábito puro:** Sem razão alguma. Mão vai ao bolso automaticamente\n- **Procrastinação:** Tarefa difícil → celular como escape\n\n**O insight crítico:** A maioria dos seus desbloqueios não é por necessidade. É impulso automático.', 15);

  -- DAY 5
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 5, 'Manhã sem celular', E'A primeira coisa que você vê de manhã define o tom do seu dia. Para ~80% dos jovens, é o celular. Hoje isso muda.\n\n**Manhã sem celular (30 min):**\nDo momento que acorda até 30 min depois: celular não existe.\n\n**Protocolo:**\n1. Use despertador físico OU coloque o celular fora do quarto à noite\n2. Primeiros 30 min: café, banho, alongamento, journaling — qualquer coisa que não seja tela\n3. Depois dos 30 min: pode usar normalmente\n\n**Por que os primeiros minutos importam:**\nQuando você checa notificações ao acordar, seu cérebro entra em modo reativo — respondendo a demandas externas antes de estabelecer suas próprias prioridades.', 5);

  -- DAY 6
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 6, 'O ambiente controla o comportamento', E'Se você depende de força de vontade para não pegar o celular, vai perder. Sempre.\n\n**O que funciona: redesenhar o ambiente.**\n\n**Checklist de preparação ambiental (faça HOJE):**\n\n1. **Celular fora do quarto à noite** — Carregar na sala/cozinha\n2. **Reorganizar home screen:**\n   - Primeira tela: APENAS apps essenciais\n   - Apps 🔴 (redes sociais): mover para a ÚLTIMA página ou dentro de pastas\n   - Remover todos os widgets de redes sociais\n3. **Homescreen limpa:** Wallpaper minimalista, sem badges vermelhas\n\n**Não deletar nada (ainda).** Estamos adicionando fricção, não proibição. A proibição causa efeito rebote. Fricção causa redução sustentável.', 20);

  -- DAY 7
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase1_id, 7, 'Semana 1 completa + review', E'7 dias de consciência. Você já sabe quanto usa, por que usa, quais são seus triggers, e seu celular está em preto e branco com os apps reorganizados. Mais do que 90% das pessoas já fizeram.\n\n**Substituição analógica:** A partir de hoje, faça pelo menos 1 atividade analógica por dia.\nIdeias: ler livro físico, caminhar sem fone, cozinhar, journaling, instrumento musical, desenhar, conversar pessoalmente.\n\n**Review semana 1:**\n1. Screen time médio da semana vs baseline\n2. Toque de recolher: quantos dias?\n3. Manhã sem celular: quantos dias?\n4. Trigger principal identificado\n5. Qualidade de sono (1-10)', true, 15);

  -- DAY 8
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 8, 'A grande limpeza de notificações', E'Cada notificação é um tap no seu ombro pedindo atenção. Hoje cortamos ~80% delas.\n\n**Passo 1: Desativar TODAS as notificações** (sim, todas)\n\n**Passo 2: Reativar APENAS:**\n- Ligações\n- Mensagens de texto/WhatsApp (de pessoas, não grupos)\n- Alarmes/lembretes\n- Apps de trabalho críticos\n\n**O que fica DESLIGADO:** Instagram, TikTok, Twitter/X, YouTube, Reddit, Email, Jogos, Apps de notícia, Apps de compras.\n\n**Por que é transformador:**\nNotificações disparam o ciclo: ping → dopamina → checar → scroll → 20 min perdidos. Sem o ping, o ciclo não inicia.\n\n**Phone-free morning sobe para 45 min!**', 15);

  -- DAY 9
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 9, 'Celular longe do corpo', E'Regra simples: o celular fica em uma superfície. Nunca no bolso em casa, nunca na mão enquanto anda, nunca na mesa de refeições.\n\n**Protocolo "celular tem lugar":**\n- Em casa: celular fica na entrada ou local fixo\n- No trabalho/estudo: celular na mochila ou gaveta\n- Em refeições: celular virado para baixo ou em outro cômodo\n- Caminhando: celular no bolso, não na mão\n\n**O princípio:** Quanto mais distante o celular está do seu corpo, menor a probabilidade de uso. Cada metro de distância é uma barreira.', 5);

  -- DAY 10
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 10, 'Grayscale avançado', E'Você está com grayscale há 1 semana. O efeito fica mais forte com o tempo.\n\n**Upgrade de grayscale:**\n- Semana 1: Grayscale durante blocos → Semana 2: Grayscale como padrão, cores apenas quando necessário\n- Configure o atalho (triple-click no iPhone) para ativar cores rapidamente quando precisar\n\n**Adicionar: Reduzir brilho e Reduce White Point (iPhone)**\nAjustes → Acessibilidade → Tela → Reduzir Ponto Branco: ativar\n\nCombinado com grayscale, torna o celular ainda menos estimulante.', true, 5);

  -- DAY 11
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 11, 'Modo avião estratégico', E'O modo avião é a arma mais subestimada contra o vício digital.\n\n**Quando usar modo avião:**\n1. **À noite:** Ativar no toque de recolher digital. Desativar só de manhã\n2. **Manhã:** Manter até o phone-free morning terminar (45+ min)\n3. **Blocos de foco:** Durante estudo ou trabalho profundo (1-2h)\n\n**Vantagem sobre "Não Perturbe":** Modo avião corta TUDO — nenhuma notificação, nenhuma atualização, nenhum pull-to-refresh.', true, 5);

  -- DAY 12
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 12, 'Bloco offline', E'Hoje: 2 horas contínuas sem celular. Não modo silencioso. Não modo avião. Celular em outro cômodo, fora de alcance.\n\nSugestões para o bloco:\n- Treino na academia\n- Passeio / caminhada\n- Encontro com amigo/família\n- Hobby analógico\n- Leitura + café\n\n**O que esperar:** Nos primeiros 15-20 minutos, você vai sentir a "coceira digital". É abstinência real. Passa em ~30 min.\n\n**A ciência:** "Phone phantom vibration" — a sensação de que o celular vibrou quando não vibrou. Indica como profundamente o celular está integrado ao seu sistema nervoso.', true, 5);

  -- DAY 13
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, is_cliff_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 13, 'Descanso', E'Dia leve. Mantenha os hábitos, mas sem tarefa nova.\n\nObserve: seu screen time da Semana 2 vs Semana 1. Você provavelmente já vê redução.\n\nSe estiver sentindo dificuldade, lembre-se: muita gente desiste nos dias 10-14. Isso é normal. O desconforto é temporário. Continue.', true, true, 5);

  -- DAY 14
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase2_id, 14, 'Semana 2 completa', E'Duas semanas. Seu ambiente foi redesenhado: grayscale, notificações limpas, celular fora do quarto, apps reorganizados, blocos offline.\n\n**Review semana 2:**\n1. Screen time médio vs Semana 1 vs Baseline\n2. Toque de recolher: quantos dias?\n3. Manhã sem celular (45 min): quantos dias?\n4. Bloco offline (2h): completou?\n5. Qualidade de sono (1-10)\n6. Mudança mais difícil até agora\n7. Mudança que mais impactou', true, 10);

  -- DAY 15
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 15, 'Limites de app', E'Até agora usamos fricção passiva. Agora: limites ativos.\n\n**Configure limites diários:**\n- Instagram: 30 min/dia\n- TikTok: 20 min/dia\n- YouTube: 45 min/dia\n- Twitter/X: 20 min/dia\n- Reddit: 20 min/dia\n\n**Como configurar:**\n- iPhone: Ajustes → Tempo de Uso → Limites de Apps\n- Android: Configurações → Bem-estar digital → Temporizadores\n\nComece generoso. Limite de 30 min é melhor que sem limite.\n\n**Phone-free morning sobe para 60 min!**', 10);

  -- DAY 16
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, motivational_note, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 16, 'O precipício', E'Dia 16. A vontade de reverter tudo ("não era tão ruim assim") é forte.\n\n**A verdade sobre abstinência digital:**\nPesquisa mostra que os primeiros dias de detox podem causar desconforto real: irritabilidade, ansiedade, sensação de estar perdendo coisas. Mas também mostra que os benefícios são duradouros.\n\n**Se a resistência estiver forte:**\n- Não reverta tudo. Mantenha pelo menos: grayscale + recolher noturno + manhã sem celular\n- Se precisar checar redes, use pelo computador\n- Lembre: você não está eliminando o celular. Está eliminando o uso INCONSCIENTE\n- Regra do "nunca perca dois dias seguidos"', 'Muita gente desiste aqui. Você é diferente. O desconforto que você sente é temporário — a clareza que está construindo é permanente.', 5);

  -- DAY 17
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 17, 'Substituição intencional', E'O vazio deixado pelo celular precisa ser preenchido com algo melhor.\n\n**Construa sua "lista de substituição":**\n\n| Trigger | Substituição |\n|---------|-------------|\n| Tédio | Ler 5 páginas, 10 flexões |\n| Ansiedade social | Respirar fundo 3x, observar o ambiente |\n| Procrastinação | Timer de 5 min na tarefa |\n| Antes de dormir | Livro, podcast, journaling |\n| Ao acordar | Café, alongamento, ar fresco |\n| Fila/espera | Podcast, observar pessoas, nada |\n\n**Aprender a "não fazer nada":** Reaprender a ficar parado é restaurar uma capacidade que foi roubada.', 10);

  -- DAY 18
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 18, 'Bloco offline expandido', E'Hoje: 3 horas contínuas offline. Planeje antecipadamente o que fazer (treino, passeio, encontro social, hobby). Coloque o celular em modo avião e guarde.\n\nDica: Combine com treino na academia para um bloco offline natural.', 5);

  -- DAY 19
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 19, 'Curadoria radical de redes', E'Não vamos pedir que delete suas redes. Vamos pedir curadoria radical.\n\n**Protocolo de curadoria:**\n\n1. **Unfollow em massa:** Contas que você não lembra por que segue, que te fazem sentir pior (comparação), conteúdo passivo sem valor\n\n2. **Desative Reels/Shorts/For You:**\n- Instagram: Ajustes → Sugestões → Desativar\n- TikTok: Use apenas aba "Seguindo" ou delete o app\n- YouTube: Pause histórico de pesquisa e exibição\n\n3. **Meta:** Transforme o feed de entretenimento passivo em informação curada', 20);

  -- DAY 20
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 20, 'O poder do tédio', E'"Todas as desgraças do homem provêm de uma só coisa: não saber ficar quieto em um quarto." — Blaise Pascal, 1670.\n\n**Exercício:** Sente-se por 10 minutos sem fazer absolutamente nada. Sem celular, sem música, sem livro. Apenas você e seus pensamentos.\n\nObserve:\n- Quanto tempo até a ansiedade aparecer?\n- Que pensamentos surgem quando não há input externo?\n- Conseguiu os 10 minutos?\n\n**Por que importa:** Criatividade, insight e autoconhecimento acontecem no espaço vazio. A rede neural de modo padrão — responsável por criatividade e autodescoberta — só se ativa quando você NÃO está consumindo conteúdo.', 15);

  -- DAY 21
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_review_day, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 21, 'Semana 3 completa', E'3 semanas. Pesquisa mostra que 3 semanas de redução de screen time produz melhorias mensuráveis em bem-estar, sono e estresse.\n\n**Review semana 3:**\n1. Screen time médio vs Baseline\n2. Redução total: %\n3. Limites de apps respeitados: quantos dias?\n4. Blocos offline (3h): completou?\n5. Qualidade de sono (1-10)\n6. Nível de foco/concentração (1-10)\n7. O que estou fazendo com o tempo que ganhei?', true, 10);

  -- DAY 22
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase3_id, 22, 'Sabbath digital', E'O teste definitivo: um dia inteiro (ou meio dia) sem celular.\n\n**Protocolo:**\n- Celular desligado ou em modo avião, guardado em gaveta\n- Avise pessoas próximas ("estarei offline no sábado")\n- Planeje o dia: atividade física, natureza, amigos, leitura\n- Se precisar: horário de "check-in" de 5 min\n\n**O que esperar:**\n- Primeiras 2-3 horas: desconforto, hands reaching for phantom phone\n- Após 3-4 horas: calma crescente, cortisol começa a cair\n- Final do dia: sensação de "reset" — como se o cérebro tivesse reiniciado', 5);

  -- DAY 23
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 23, 'Pós-sabbath: o que aprendeu?', E'Como foi o sabbath digital? O que sentiu? O que fez com o tempo? Conseguiria fazer isso toda semana?\n\nEsse é o objetivo: 1 sabbath por semana como hábito de manutenção.\n\nSe foi difícil demais, comece com meio dia (manhã inteira offline). O importante é que o hábito exista.', 5);

  -- DAY 24
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 24, 'Reduzir limites de apps', E'Hora de apertar os limites. Seu cérebro se adaptou.\n\n**Novos limites (Semana 4):**\n- Instagram: 30 min → 15 min\n- TikTok: 20 min → Desinstalado ou 10 min\n- YouTube: 45 min → 30 min\n- Twitter/X: 20 min → 10 min\n- Reddit: 20 min → 15 min\n\n**Opcional radical:** Deletar 1 app 🔴 completamente. Após 1 semana sem um app, a maioria das pessoas mal sente vontade de voltar.', 10);

  -- DAY 25
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 25, 'Bloco offline máximo', E'4 horas contínuas offline. Planeje algo especial para esse bloco — algo que seria impossível com o celular vibrando no bolso.\n\nSugestões:\n- Trilha na natureza\n- Workshop ou aula presencial\n- Dia de cozinhar algo elaborado\n- Maratona de leitura\n- Sessão longa de treino + sauna', 5);

  -- DAY 26
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 26, 'Construindo seu protocolo pessoal', E'Daqui a 4 dias a jornada guiada termina. Mas o sistema precisa continuar.\n\n**Seu protocolo digital pessoal — escolha quais hábitos manter (mínimo 5):**\n\n- Toque de recolher (1h sem tela)\n- Manhã sem celular (60 min)\n- Grayscale (permanente/blocos)\n- Notificações mínimas\n- Celular fora do quarto\n- Blocos offline\n- Limites de apps\n- Sabbath digital\n- Atividade analógica\n- Review semanal\n\n**Recomendação mínima:** Celular fora do quarto + manhã sem celular + notificações mínimas + 1 sabbath/semana + limites de apps.', 15);

  -- DAY 27
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, is_rest_day, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 27, 'Descanso', E'Mantenha o protocolo. Descanse. Observe como se sente comparado ao Dia 1.\n\nVocê provavelmente está dormindo melhor, mais focado, e gastando bem menos tempo no celular. Essas mudanças são reais e mensuráveis.', true, 5);

  -- DAY 28
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 28, 'Segundo sabbath digital', E'Repita o sabbath digital. Desta vez, observe se foi mais fácil que o primeiro.\n\nSe o primeiro sabbath foi desconfortável e este foi tranquilo, parabéns — seu cérebro se adaptou. Você já não precisa do celular da mesma forma.', 5);

  -- DAY 29
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 29, 'Reflexão', E'Penúltimo dia. Hora de olhar para trás.\n\n**Reflexão:**\n1. Screen time Dia 1 vs agora\n2. Redução total (%)\n3. Como o sono mudou?\n4. Como o foco mudou?\n5. Ansiedade/irritabilidade: mudou?\n6. O que faço com o tempo extra?\n7. Qual hábito teve mais impacto?\n8. O que me surpreendeu?\n9. O que foi mais difícil?\n10. Quero manter esse padrão?', 15);

  -- DAY 30
  INSERT INTO public.journey_days (journey_id, phase_id, day_number, title, card_content, estimated_minutes) VALUES
  (v_journey_id, v_phase4_id, 30, 'Graduação: Detox de Dopamina', E'30 dias. De alguém que passava ~9h no celular por dia para alguém que controla intencionalmente quando e como usa tecnologia.\n\n**Sua transformação:**\n- Screen time: de ~7-9h para ~3-4h\n- Notificações: de todas para apenas essenciais\n- Celular à noite: de na cama para outro cômodo\n- Manhã: de celular imediato para 60 min phone-free\n- Grayscale: padrão ativado\n- Limites de apps: configurados\n- Blocos offline: 4h+ contínuas\n- Sabbath digital: 1x/semana\n- Atividades analógicas: diárias\n\n**Referência:** Participantes do estudo Georgetown que reduziram screen time pela metade reportaram melhorias comparáveis a terapia cognitivo-comportamental.\n\nVocê fez o mesmo. Parabéns.', 10);

  -- ============================================
  -- 4. Habit Templates
  -- ============================================

  -- Screen time tracking (Day 1-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Screen time diário', '📱', 'mente', 'evening', 'number', 'custom', 1, NULL, 'daily', 'screen_time_tracking', 1);

  -- Focus mode (Day 1-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Modo foco', '🔕', 'mente', 'morning', 'checkbox', 1, NULL, 'daily', 'focus_mode', 2);

  -- Digital curfew (Day 1-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Toque de recolher digital', '🌙', 'mente', 'evening', 'checkbox', 1, NULL, 'daily', 'digital_curfew', 3);

  -- Grayscale mode (Day 3-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Grayscale mode', '🔲', 'mente', 'morning', 'checkbox', 3, NULL, 'daily', 'grayscale_mode', 4);

  -- Phone-free morning (Day 5-30, progressive goal)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, 'Manhã sem celular', '📵', 'mente', 'morning', 'timer', 'minutes', 30, 5, NULL, 'daily',
   '[{"from_day":8,"goal_value":45},{"from_day":15,"goal_value":60}]'::jsonb,
   'phone_free_morning', 5);

  -- Analog substitution (Day 7-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Atividade analógica', '📚', 'mente', 'afternoon', 'checkbox', 7, NULL, 'daily', 'analog_activity', 6);

  -- Weekly review (Day 7, 14, 21, 28)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, days_of_week, canonical_key, sort_order) VALUES
  (v_journey_id, 'Review semanal', '📊', 'mente', 'evening', 'checkbox', 7, NULL, 'weekly', '{0}', 'weekly_review', 7);

  -- Notification cleanup (Day 8 ONLY - one_time)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Limpeza de notificações', '🧹', 'mente', 'morning', 'checkbox', 8, 8, 'one_time', 'notification_cleanup', 8);

  -- Offline block (Day 12-30, progressive goal)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, unit, initial_goal_value, start_day, end_day, frequency_type, goal_progression, canonical_key, sort_order) VALUES
  (v_journey_id, 'Bloco offline', '🏝️', 'mente', 'afternoon', 'timer', 'minutes', 120, 12, NULL, 'daily',
   '[{"from_day":18,"goal_value":180},{"from_day":25,"goal_value":240}]'::jsonb,
   'offline_block', 9);

  -- App timer (Day 15-30)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, canonical_key, sort_order) VALUES
  (v_journey_id, 'Limites de apps', '⏱️', 'mente', 'evening', 'checkbox', 15, NULL, 'daily', 'app_limits', 10);

  -- Digital sabbath (Day 22-30, weekly)
  INSERT INTO public.journey_habit_templates (journey_id, name, emoji, category, period, tracking_type, start_day, end_day, frequency_type, days_of_week, canonical_key, sort_order) VALUES
  (v_journey_id, 'Sabbath digital', '📴', 'mente', 'morning', 'checkbox', 22, NULL, 'weekly', '{6}', 'digital_sabbath', 11);

END $$;
