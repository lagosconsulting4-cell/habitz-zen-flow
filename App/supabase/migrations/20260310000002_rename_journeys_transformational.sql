-- =============================================
-- Doc 01: Nomes de Jornadas Transformacionais
-- De atividades descritivas para declarações de identidade
-- Princípios: Identity-Based Change, Loss Aversion, Aspiration Framing
-- =============================================

-- =============================================
-- L1: Renomear títulos e subtítulos
-- =============================================

-- "Detox de Dopamina" → "Eu Controlo a Tela"
-- Princípio: Identity-Based Change — pronome "Eu" cria commitment pessoal
UPDATE public.journeys
SET title = 'Eu Controlo a Tela',
    subtitle = 'Reset de Dopamina em 30 Dias'
WHERE slug = 'digital-detox-l1';

-- "Domine Suas Manhãs" → "Manhã de Elite"
-- Princípio: Aspiration + Exclusividade — pertencimento a grupo seleto
UPDATE public.journeys
SET title = 'Manhã de Elite',
    subtitle = 'Sua Rotina Matinal Imbatível'
WHERE slug = 'own-mornings-l1';

-- "Do Sofá ao Shape" → "Do Zero ao Treino"
-- Princípio: Goal-Gradient + Relatability — ponto de partida honesto, sem intimidar
UPDATE public.journeys
SET title = 'Do Zero ao Treino'
WHERE slug = 'gym-l1';
-- subtitle "Primeiros 30 Dias na Academia" já está bom, manter

-- "Domine Sua Atenção" → "Foco Inabalável"
-- Princípio: Identity Framing — estado de SER, não atividade
UPDATE public.journeys
SET title = 'Foco Inabalável',
    subtitle = 'Protocolo de Atenção Profunda'
WHERE slug = 'focus-protocol-l1';

-- "Controle Total" → "Nunca Mais Quebrado"
-- Princípio: Loss Aversion — dor evitada é 2x mais forte que prazer ganho
UPDATE public.journeys
SET title = 'Nunca Mais Quebrado',
    subtitle = 'Finanças Pessoais em 30 Dias'
WHERE slug = 'finances-l1';

-- =============================================
-- L2: Remover nomes em inglês
-- =============================================

-- "Digital Minimalism" → "Produtividade Intencional"
UPDATE public.journeys
SET title = 'Produtividade Intencional'
WHERE slug = 'digital-detox-l2';
-- subtitle "Produtividade Intencional" já está correto

-- "Own Your Mornings L2" → "Manhã Avançada: Protocolo 5h"
UPDATE public.journeys
SET title = 'Manhã Avançada: Protocolo 5h',
    subtitle = 'Rotina Matinal Nível 2'
WHERE slug = 'own-mornings-l2';

-- L2s que NÃO mudam (já são fortes):
-- gym-l2: "Protocolo de Hipertrofia" — técnico e forte
-- focus-protocol-l2: "Aprendizado Acelerado" — aspiracional
-- finances-l2: "Faça Seu Dinheiro Trabalhar" — ação-orientado

-- =============================================
-- Preencher target_audience + expected_result faltantes (L1s)
-- Necessário para a seção Antes/Depois no JourneyDetail (Doc 08)
-- =============================================

UPDATE public.journeys
SET target_audience = 'Homens 20-25 anos que sentem que as manhãs são desperdiçadas, acordam sem energia e querem começar o dia com propósito',
    expected_result = 'Acorde antes das 7h com energia, tenha uma rotina matinal de 30-60 min que inclui exercício, reflexão e planejamento do dia'
WHERE slug = 'own-mornings-l1';

UPDATE public.journeys
SET target_audience = 'Homens 20-25 anos que querem começar a treinar mas não sabem por onde, sentem vergonha de ir à academia ou não conseguem manter consistência',
    expected_result = 'Treinar 3-4x por semana de forma consistente, perder o medo da academia, ganhar confiança física e construir o hábito que transforma seu corpo'
WHERE slug = 'gym-l1';

UPDATE public.journeys
SET target_audience = 'Homens 20-25 anos que não conseguem manter foco por mais de 15 minutos, vivem distraídos por notificações e sentem que produzem menos do que poderiam',
    expected_result = 'Sessões de deep work de 90+ minutos, eliminar 80% das distrações digitais, dobrar sua produtividade real e recuperar clareza mental'
WHERE slug = 'focus-protocol-l1';

UPDATE public.journeys
SET target_audience = 'Homens 20-25 anos que vivem no vermelho, não sabem quanto ganham vs gastam, têm medo de olhar o extrato e sentem que dinheiro escorre pelas mãos',
    expected_result = 'Saber exatamente para onde vai cada real, criar reserva de emergência de 1 mês, eliminar gastos invisíveis e nunca mais ficar sem dinheiro antes do mês acabar'
WHERE slug = 'finances-l1';
