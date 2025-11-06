-- Reset curated books catalog to the approved list
-- Remove previous entries to avoid duplicates and outdated items
DELETE FROM public.books;

-- Insert curated list in Portuguese with Shopee affiliate links
INSERT INTO public.books (title, author, category, description, image_url, affiliate_link, rating)
VALUES
  ('Hábitos Atômicos', 'James Clear', 'Disciplina', 'Pequenas mudanças diárias que geram resultados extraordinários.', NULL, 'https://s.shopee.com.br/9KYx8e7ZpM', 5),
  ('Ego é o Seu Inimigo', 'Ryan Holiday', 'Mentalidade', 'Como dominar o ego para não sabotar o seu progresso.', NULL, 'https://s.shopee.com.br/2g23CUHKkf', 5),
  ('Quem Pensa Enriquece', 'Napoleon Hill', 'Finanças', 'Os princípios clássicos da conquista e prosperidade.', NULL, 'https://s.shopee.com.br/5L2oNSnYyP', 5),
  ('O Sistema da Chave Mestra', 'Charles F. Haanel', 'Mentalidade', 'Exercícios práticos para foco, visualização e controle mental.', NULL, 'https://s.shopee.com.br/6KvLZNQ8ai', 4),
  ('Minimalismo Digital', 'Cal Newport', 'Produtividade', 'Reduza o ruído digital para recuperar foco e tempo.', NULL, 'https://s.shopee.com.br/1Vq5obfMm8', 4),
  ('O Poder do Hábito', 'Charles Duhigg', 'Disciplina', 'A ciência por trás da formação e mudança de hábitos.', NULL, 'https://s.shopee.com.br/2Vid0Xmg8Q', 5),
  ('A Arte Sutil de Ligar o Foda-se', 'Mark Manson', 'Mentalidade', 'Priorize o essencial e elimine o que não importa.', NULL, 'https://s.shopee.com.br/gGypDjIqP', 4),
  ('Como Fazer Amigos e Influenciar Pessoas', 'Dale Carnegie', 'Comunicação', 'Princípios práticos para relacionamentos e influência.', NULL, 'https://s.shopee.com.br/BKiELjzjm', 5),
  ('Mindset', 'Carol S. Dweck', 'Mentalidade', 'Como crenças moldam aprendizado, sucesso e resiliência.', NULL, 'https://s.shopee.com.br/9AFWwwEv7j', 5),
  ('Sobre o Sentido da Vida', 'Viktor Frankl', 'Propósito', 'Encontre sentido mesmo nos períodos de sofrimento.', NULL, 'https://s.shopee.com.br/6KvLZp61m0', 5),
  ('Maestria', 'Robert Greene', 'Excelência', 'O caminho longo e deliberado rumo à excelência.', NULL, 'https://s.shopee.com.br/7KnslhwGW5', 4),
  ('A Psicologia do Dinheiro', 'Morgan Housel', 'Finanças', 'Comportamento e decisões financeiras ao longo da vida.', NULL, 'https://s.shopee.com.br/20mMPxStrX', 5),
  ('O Obstáculo é o Caminho', 'Ryan Holiday', 'Resiliência', 'Transforme adversidades em oportunidades via estoicismo.', NULL, 'https://s.shopee.com.br/40XQnkrekh', 5),
  ('Limites: Quando Dizer Sim, Quando Dizer Não', 'Henry Cloud', 'Mentalidade', 'Como criar limites saudáveis em todas as áreas.', NULL, 'https://s.shopee.com.br/3VbACtw03c', 4),
  ('Ikigai', 'Héctor García', 'Propósito', 'Descubra seu propósito e viva com mais significado.', NULL, 'https://s.shopee.com.br/70B2NOqCec', 4),
  ('Diário Estoico', 'Ryan Holiday', 'Filosofia', 'Reflexões diárias para uma vida com princípios estoicos.', NULL, 'https://s.shopee.com.br/20mMQKxCsL', 4),
  ('Os 7 Hábitos de Pessoas Altamente Eficazes', 'Stephen R. Covey', 'Disciplina', 'Hábitos essenciais para alta eficácia pessoal e profissional.', NULL, 'https://s.shopee.com.br/7AUSZspBIG', 5);

-- Ensure there is at least one index for category filtering
CREATE INDEX IF NOT EXISTS books_category_idx ON public.books (category);
