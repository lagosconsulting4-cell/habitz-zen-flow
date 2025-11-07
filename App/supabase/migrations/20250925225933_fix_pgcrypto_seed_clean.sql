-- Ensure pgcrypto is available for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Normalize default emoji for habits and fix corrupted entries
ALTER TABLE public.habits ALTER COLUMN emoji SET DEFAULT U&'\+1F525';
UPDATE public.habits
SET emoji = U&'\+1F525'
WHERE emoji IS NULL OR emoji LIKE '%?%';

-- Normalize default icon for tips and fix corrupted entries
ALTER TABLE public.tips ALTER COLUMN icon SET DEFAULT U&'\+1F4A1';

UPDATE public.quotes
SET text = 'A jornada de mil milhas comeca com um unico passo.'
WHERE text LIKE 'A jornada de mil milhas%';

UPDATE public.quotes
SET text = 'O sucesso e a soma de pequenos esforcos repetidos dia apos dia.'
WHERE text LIKE 'O sucesso%esfor%';

UPDATE public.quotes
SET text = 'Voce nao precisa ser grande para comecar, mas precisa comecar para ser grande.'
WHERE text LIKE 'Voc%ser grande%';

UPDATE public.quotes
SET text = 'A disciplina e a ponte entre metas e conquistas.'
WHERE text LIKE 'A disciplina%';

UPDATE public.quotes
SET text = 'O futuro pertence aqueles que acreditam na beleza de seus sonhos.'
WHERE text LIKE 'O futuro pertence%beleza%';

UPDATE public.tips
SET content = 'Inicie com apenas 5 minutos por dia. E melhor ser consistente com pouco tempo do que falhar com metas grandes.',
    icon = U&'\+1F331'
WHERE title = 'Comece devagar';

UPDATE public.tips
SET content = 'Deixe pistas visuais no seu ambiente que te lembrem dos seus habitos. Um livro na mesinha de cabeceira, roupas de exercicio a vista.',
    icon = U&'\+1F4CC'
WHERE title = 'Use lembretes visuais';

UPDATE public.tips
SET content = 'Comemore cada dia que voce conseguir manter seu habito. Reconhecimento positivo fortalece o comportamento.',
    icon = U&'\+1F389'
WHERE title = 'Celebre pequenas vitorias';

UPDATE public.tips
SET content = 'Se nao conseguir fazer seu habito completo, tenha uma versao menor preparada. Ex: se nao der para correr 30min, faca 10min.',
    icon = U&'\+1F9E9'
WHERE title = 'Tenha um plano B';

UPDATE public.tips
SET content = 'Teste diferentes horarios para descobrir quando voce tem mais energia e foco para seus habitos.',
    icon = U&'\+1F552'
WHERE title = 'Encontre seu horario ideal';

UPDATE public.books
SET title = 'Habitos Atomicos',
    description = 'O guia definitivo para criar bons habitos e quebrar os ruins. Estrategias praticas baseadas em ciencia.'
WHERE author = 'James Clear';

UPDATE public.books
SET title = 'O Poder do Habito',
    description = 'Como os habitos funcionam e como transforma-los. Uma jornada fascinante pela neurociencia dos habitos.'
WHERE author = 'Charles Duhigg';

UPDATE public.books
SET description = 'A mentalidade do crescimento que transforma fracassos em sucessos. Essencial para desenvolvimento pessoal.'
WHERE author = 'Carol Dweck';

UPDATE public.books
SET description = 'Como desenvolver foco e atencao em um mundo cheio de distracoes. Fundamental para produtividade.'
WHERE author = 'Daniel Goleman';
