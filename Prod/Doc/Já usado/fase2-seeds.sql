-- =====================================================
-- FASE 2 - SEEDS PARA MÓDULOS E AULAS
-- =====================================================
-- IMPORTANTE: Este arquivo pode ser executado múltiplas vezes
-- Usa ON CONFLICT para evitar erros de duplicação
-- =====================================================

-- OPÇÃO 1: Limpar tudo e começar do zero (use se quiser resetar)
-- Descomente as linhas abaixo para limpar:
-- delete from public.module_progress;
-- delete from public.personal_plans;
-- delete from public.module_resources;
-- delete from public.module_lessons;
-- delete from public.program_modules;

-- OPÇÃO 2: O arquivo usa ON CONFLICT DO NOTHING
-- Se já existir, simplesmente ignora (seguro para produção)

-- =====================================================
-- MÓDULO 1 - Introdução aos Mini-Hábitos
-- =====================================================
insert into public.program_modules (module_number, title, subtitle, description, focus, week_assignment, sort_order, is_bonus) values
(1, 'Módulo 1', 'Introdução aos Mini-Hábitos', 'Entenda o que são mini-hábitos e como eles podem transformar sua rotina sem sobrecarregar sua mente.', 'Fundamentos', 1, 1, false)
on conflict (module_number) do nothing;

-- Aulas do Módulo 1
insert into public.module_lessons (module_id, lesson_number, title, lesson_type, duration_minutes, sort_order) values
((select id from public.program_modules where module_number = 1), 1, 'Apresentando Mini-Hábitos', 'video', 15, 1),
((select id from public.program_modules where module_number = 1), 2, 'Qual a aparência dos nossos hábitos', 'video', 12, 2),
((select id from public.program_modules where module_number = 1), 3, 'Repetidor Burro x Gerente Esperto', 'video', 18, 3),
((select id from public.program_modules where module_number = 1), 4, 'Córtex Pré-frontal x Núcleo de Base', 'video', 20, 4);

-- =====================================================
-- MÓDULO 2 - Motivação e Mini-Hábitos
-- =====================================================
insert into public.program_modules (module_number, title, subtitle, description, focus, week_assignment, sort_order, is_bonus) values
(2, 'Módulo 2', 'Motivação e Mini-Hábitos', 'Descubra como funciona a motivação e por que ela não é confiável para criar hábitos duradouros.', 'Motivação', 1, 2, false);

-- Aulas do Módulo 2
insert into public.module_lessons (module_id, lesson_number, title, lesson_type, duration_minutes, sort_order) values
((select id from public.program_modules where module_number = 2), 1, 'Entenda os Problemas de ficar motivado', 'video', 16, 1),
((select id from public.program_modules where module_number = 2), 2, 'Entenda os problemas de ficar motivado (Áudio)', 'audio', 16, 2);

-- =====================================================
-- MÓDULO 3 - Expansão da Zona de Conforto
-- =====================================================
insert into public.program_modules (module_number, title, subtitle, description, focus, week_assignment, sort_order, is_bonus) values
(3, 'Módulo 3', 'Expansão da Zona de Conforto', 'Aprenda como os mini-hábitos expandem gradualmente sua zona de conforto sem causar resistência.', 'Zona de Conforto', 2, 3, false);

-- Aulas do Módulo 3
insert into public.module_lessons (module_id, lesson_number, title, lesson_type, duration_minutes, sort_order) values
((select id from public.program_modules where module_number = 3), 1, 'Os mini-hábitos expandem sua zona de segurança', 'video', 14, 1),
((select id from public.program_modules where module_number = 3), 2, 'Os mini-hábitos expandem sua zona de segurança (Áudio)', 'audio', 14, 2),
((select id from public.program_modules where module_number = 3), 3, 'Resistência', 'video', 12, 3),
((select id from public.program_modules where module_number = 3), 4, 'Força de vontade', 'video', 15, 4);

-- =====================================================
-- MÓDULO 4 - Enfrentando Desafios
-- =====================================================
insert into public.program_modules (module_number, title, subtitle, description, focus, week_assignment, sort_order, is_bonus) values
(4, 'Módulo 4', 'Enfrentando Desafios', 'Técnicas práticas para superar obstáculos e manter-se no caminho mesmo quando as coisas ficam difíceis.', 'Desafios', 2, 4, false);

-- Aulas do Módulo 4
insert into public.module_lessons (module_id, lesson_number, title, lesson_type, duration_minutes, sort_order) values
((select id from public.program_modules where module_number = 4), 1, 'Mudanças', 'video', 10, 1),
((select id from public.program_modules where module_number = 4), 2, 'As Duas formas de Resistência', 'video', 13, 2),
((select id from public.program_modules where module_number = 4), 3, 'Substituir ou Manter os Hábitos Velhos', 'video', 11, 3),
((select id from public.program_modules where module_number = 4), 4, 'Auto-eficácia', 'video', 14, 4),
((select id from public.program_modules where module_number = 4), 5, 'Autonomia', 'video', 12, 5),
((select id from public.program_modules where module_number = 4), 6, 'Sonhos não te ajudam', 'video', 9, 6),
((select id from public.program_modules where module_number = 4), 7, 'Acabando com o Medo', 'video', 15, 7);

-- =====================================================
-- MÓDULO 5 - Definição de Mini-Hábitos
-- =====================================================
insert into public.program_modules (module_number, title, subtitle, description, focus, week_assignment, sort_order, is_bonus) values
(5, 'Módulo 5', 'Definição de Mini-Hábitos', 'Aprenda o passo a passo para criar seus próprios mini-hábitos eficazes e personalizados.', 'Criação de Hábitos', 3, 5, false);

-- Aulas do Módulo 5
insert into public.module_lessons (module_id, lesson_number, title, lesson_type, duration_minutes, sort_order) values
((select id from public.program_modules where module_number = 5), 1, 'Definindo os mini-hábitos', 'video', 17, 1),
((select id from public.program_modules where module_number = 5), 2, 'Técnica do porquê', 'video', 10, 2),
((select id from public.program_modules where module_number = 5), 3, 'Como definir o gatilho dos hábitos', 'video', 14, 3),
((select id from public.program_modules where module_number = 5), 4, 'Plano de recompensa', 'video', 12, 4),
((select id from public.program_modules where module_number = 5), 5, 'O segredo da anotação', 'video', 8, 5),
((select id from public.program_modules where module_number = 5), 6, 'Pense pequeno', 'video', 11, 6),
((select id from public.program_modules where module_number = 5), 7, 'Programação x Expectativa', 'video', 13, 7),
((select id from public.program_modules where module_number = 5), 8, 'Concretizando!', 'video', 9, 8);

-- =====================================================
-- MÓDULO 6 - Regras e Dicas Essenciais
-- =====================================================
insert into public.program_modules (module_number, title, subtitle, description, focus, week_assignment, sort_order, is_bonus) values
(6, 'Módulo 6', 'Regras e Dicas Essenciais', 'Regras fundamentais e dicas práticas para manter a consistência e celebrar suas conquistas.', 'Consistência', 3, 6, false);

-- Aulas do Módulo 6
insert into public.module_lessons (module_id, lesson_number, title, lesson_type, duration_minutes, sort_order) values
((select id from public.program_modules where module_number = 6), 1, 'Seja indignado!', 'video', 10, 1),
((select id from public.program_modules where module_number = 6), 2, 'As principais regras', 'video', 15, 2),
((select id from public.program_modules where module_number = 6), 3, 'Comemore as pequenas vitórias!', 'video', 8, 3),
((select id from public.program_modules where module_number = 6), 4, 'Recompensas', 'video', 12, 4),
((select id from public.program_modules where module_number = 6), 5, 'Mantenha-se equilibrado', 'video', 11, 5),
((select id from public.program_modules where module_number = 6), 6, 'Recue e vá com calma!', 'video', 9, 6);

-- =====================================================
-- MÓDULO 7 - Superando a Procrastinação
-- =====================================================
insert into public.program_modules (module_number, title, subtitle, description, focus, week_assignment, sort_order, is_bonus) values
(7, 'Módulo 7', 'Superando a Procrastinação', 'Técnicas específicas para vencer a procrastinação, um dos maiores desafios para quem tem TDAH.', 'Procrastinação', 4, 7, false);

-- Aulas do Módulo 7
insert into public.module_lessons (module_id, lesson_number, title, lesson_type, duration_minutes, sort_order) values
((select id from public.program_modules where module_number = 7), 1, 'Tipos de Procrastinação', 'video', 13, 1),
((select id from public.program_modules where module_number = 7), 2, 'Quem é você', 'video', 10, 2),
((select id from public.program_modules where module_number = 7), 3, 'Clarificar', 'video', 11, 3),
((select id from public.program_modules where module_number = 7), 4, 'Mentalizar', 'video', 14, 4),
((select id from public.program_modules where module_number = 7), 5, 'Comece agora', 'video', 9, 5),
((select id from public.program_modules where module_number = 7), 6, 'Dicas de execução', 'video', 12, 6);

-- =====================================================
-- MÓDULO 8 - Extras | Ebooks (BÔNUS)
-- =====================================================
insert into public.program_modules (module_number, title, subtitle, description, focus, week_assignment, sort_order, is_bonus) values
(8, 'Módulo 8', 'Extras | Ebooks', 'Materiais complementares em formato ebook para aprofundar seus conhecimentos sobre TDAH.', 'Recursos Extras', null, 8, true);

-- Recursos do Módulo 8
insert into public.module_resources (module_id, resource_type, title, description, is_bonus, tags) values
((select id from public.program_modules where module_number = 8), 'ebook', 'Como lidar com mentes a mil', 'Técnicas práticas para acalmar a mente acelerada característica do TDAH.', true, array['tdah', 'mindfulness', 'ansiedade']),
((select id from public.program_modules where module_number = 8), 'ebook', 'Vencendo o TDAH Adulto', 'Guia completo para adultos que convivem com TDAH no dia a dia.', true, array['tdah', 'adultos', 'estratégias']),
((select id from public.program_modules where module_number = 8), 'ebook', '101 Técnicas da Terapia Cognitivo Comportamental', 'Compêndio de técnicas de TCC aplicadas ao manejo do TDAH.', true, array['tcc', 'técnicas', 'terapia']);

-- =====================================================
-- MÓDULO 9 - Extras | Lives (BÔNUS)
-- =====================================================
insert into public.program_modules (module_number, title, subtitle, description, focus, week_assignment, sort_order, is_bonus) values
(9, 'Módulo 9', 'Extras | Lives', 'Gravações de lives com especialistas sobre TDAH e mini-hábitos.', 'Lives Especiais', null, 9, true);

-- Aulas do Módulo 9 (Lives como áudio)
insert into public.module_lessons (module_id, lesson_number, title, lesson_type, duration_minutes, sort_order) values
((select id from public.program_modules where module_number = 9), 1, 'Mini-Hábitos e Micro Passos para um TDAH - Parte 1', 'audio', 45, 1),
((select id from public.program_modules where module_number = 9), 2, 'Mini-Hábitos e Micro Passos para um TDAH - Parte 2', 'audio', 50, 2);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Contar módulos criados
select count(*) as total_modules from public.program_modules;

-- Contar aulas criadas
select
  pm.module_number,
  pm.title,
  count(ml.id) as total_lessons
from public.program_modules pm
left join public.module_lessons ml on ml.module_id = pm.id
group by pm.module_number, pm.title
order by pm.module_number;

-- Contar recursos extras
select count(*) as total_resources from public.module_resources;
