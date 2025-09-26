-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT DEFAULT 'motivation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tips table  
CREATE TABLE public.tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT DEFAULT '💡',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.5,
  image_url TEXT,
  affiliate_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create policies (public read access)
CREATE POLICY "Anyone can view quotes" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Anyone can view tips" ON public.tips FOR SELECT USING (true);
CREATE POLICY "Anyone can view books" ON public.books FOR SELECT USING (true);

-- Insert initial data
INSERT INTO public.quotes (text, author, category) VALUES
('A jornada de mil milhas começa com um único passo.', 'Lao Tzu', 'motivation'),
('O sucesso é a soma de pequenos esforços repetidos dia após dia.', 'Robert Collier', 'success'),
('Você não precisa ser grande para começar, mas precisa começar para ser grande.', 'Zig Ziglar', 'start'),
('A disciplina é a ponte entre metas e conquistas.', 'Jim Rohn', 'discipline'),
('O futuro pertence àqueles que acreditam na beleza de seus sonhos.', 'Eleanor Roosevelt', 'dreams');

INSERT INTO public.tips (title, content, category, icon) VALUES
('Comece devagar', 'Inicie com apenas 5 minutos por dia. É melhor ser consistente com pouco tempo do que falhar com metas grandes.', 'habit_building', '🐌'),
('Use lembretes visuais', 'Deixe pistas visuais no seu ambiente que te lembrem dos seus hábitos. Um livro na mesinha de cabeceira, roupas de exercício à vista.', 'environment', '👀'),
('Celebre pequenas vitórias', 'Comemore cada dia que você conseguir manter seu hábito. Reconhecimento positivo fortalece o comportamento.', 'psychology', '🎉'),
('Tenha um plano B', 'Se não conseguir fazer seu hábito completo, tenha uma versão menor preparada. Ex: se não der para correr 30min, faça 10min.', 'flexibility', '🔄'),
('Encontre seu horário ideal', 'Teste diferentes horários para descobrir quando você tem mais energia e foco para seus hábitos.', 'timing', '⏰');

INSERT INTO public.books (title, author, description, category, rating, affiliate_link) VALUES
('Hábitos Atômicos', 'James Clear', 'O guia definitivo para criar bons hábitos e quebrar os ruins. Estratégias práticas baseadas em ciência.', 'Produtividade', 4.8, '#'),
('O Poder do Hábito', 'Charles Duhigg', 'Como os hábitos funcionam e como transformá-los. Uma jornada fascinante pela neurociência dos hábitos.', 'Psicologia', 4.6, '#'),
('Mindset', 'Carol Dweck', 'A mentalidade do crescimento que transforma fracassos em sucessos. Essencial para desenvolvimento pessoal.', 'Mindset', 4.7, '#'),
('Foco', 'Daniel Goleman', 'Como desenvolver foco e atenção em um mundo cheio de distrações. Fundamental para produtividade.', 'Concentração', 4.5, '#');;
