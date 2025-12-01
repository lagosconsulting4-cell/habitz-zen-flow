-- Refresh curated books catalog with the approved Portuguese list
DELETE FROM public.books;

INSERT INTO public.books (title, author, category, description, image_url, affiliate_link, rating)
VALUES
  ('Hábitos Atômicos', 'James Clear', 'Disciplina', 'Pequenas mudanças consistentes que geram resultados extraordinários.', NULL, 'https://s.shopee.com.br/9KYx8e7ZpM', 5),
  ('Ego é o Seu Inimigo', 'Ryan Holiday', 'Mentalidade', 'Domine o ego para não sabotar seu progresso pessoal e profissional.', NULL, 'https://s.shopee.com.br/2g23CUHKkf', 5),
  ('Quem Pensa Enriquece', 'Napoleon Hill', 'Finanças', 'Princípios clássicos de riqueza, disciplina e mentalidade vencedora.', NULL, 'https://s.shopee.com.br/5L2oNSnYyP', 5),
  ('O Sistema da Chave Mestra', 'Charles F. Haanel', 'Mentalidade', 'Exercícios de visualização e controle mental para evolução constante.', NULL, 'https://s.shopee.com.br/6KvLZNQ8ai', 4),
  ('Minimalismo Digital', 'Cal Newport', 'Produtividade', 'Reduza o ruído digital e recupere foco e tempo para o que importa.', NULL, 'https://s.shopee.com.br/1Vq5obfMm8', 4),
  ('O Poder do Hábito', 'Charles Duhigg', 'Disciplina', 'A ciência por trás da formação de hábitos e como reprogramá-los.', NULL, 'https://s.shopee.com.br/2Vid0Xmg8Q', 5),
  ('A Arte Sutil de Ligar o F*da-se', 'Mark Manson', 'Mentalidade', 'Priorize o essencial e liberte-se das expectativas alheias.', NULL, 'https://s.shopee.com.br/gGypDjIqP', 4),
  ('Como Fazer Amigos e Influenciar Pessoas', 'Dale Carnegie', 'Comunicação', 'Técnicas práticas para construir relacionamentos fortes e influenciar.', NULL, 'https://s.shopee.com.br/BKiELjzjm', 5),
  ('Mindset', 'Carol S. Dweck', 'Mentalidade', 'Por que a mentalidade de crescimento transforma resultados.', NULL, 'https://s.shopee.com.br/9AFWwwEv7j', 5),
  ('Sobre o Sentido da Vida', 'Viktor Frankl', 'Propósito', 'Encontre significado mesmo nos momentos mais desafiadores.', NULL, 'https://s.shopee.com.br/6KvLZp61m0', 5),
  ('Maestria', 'Robert Greene', 'Excelência', 'Como dominar qualquer área com estudo deliberado e paciência.', NULL, 'https://s.shopee.com.br/7KnslhwGW5', 4),
  ('A Psicologia do Dinheiro', 'Morgan Housel', 'Finanças', 'Decisões financeiras inteligentes começam pelo comportamento.', NULL, 'https://s.shopee.com.br/20mMPxStrX', 5),
  ('O Obstáculo é o Caminho', 'Ryan Holiday', 'Resiliência', 'Estoicismo aplicado para transformar obstáculos em vantagem.', NULL, 'https://s.shopee.com.br/40XQnkrekh', 5),
  ('Limites: Quando Dizer Sim, Quando Dizer Não', 'Henry Cloud', 'Mentalidade', 'Construa limites saudáveis para proteger energia e foco.', NULL, 'https://s.shopee.com.br/3VbACtw03c', 4),
  ('Ikigai', 'Héctor García', 'Propósito', 'Descubra o propósito japonês e viva com mais significado.', NULL, 'https://s.shopee.com.br/70B2NOqCec', 4),
  ('Diário Estoico', 'Ryan Holiday', 'Filosofia', 'Reflexões diárias para aplicar o estoicismo na prática.', NULL, 'https://s.shopee.com.br/20mMQKxCsL', 4),
  ('Os 7 Hábitos de Pessoas Altamente Eficazes', 'Stephen R. Covey', 'Disciplina', 'Hábitos fundamentais para produtividade e liderança efetiva.', NULL, 'https://s.shopee.com.br/7AUSZspBIG', 5);

CREATE INDEX IF NOT EXISTS books_category_idx ON public.books (category);
