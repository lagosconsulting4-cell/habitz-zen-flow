export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string;
  cover_url: string;
  link: string;
  premium_only: boolean;
}

export const booksHub: Book[] = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    category: "Disciplina",
    description: "Pequenas mudanças diárias que levam a resultados enormes.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/0735211299.01.L.jpg",
    link: "https://www.amazon.com.br/dp/0735211299",
    premium_only: false
  },
  {
    id: 2,
    title: "Ego Is the Enemy",
    author: "Ryan Holiday",
    category: "Mentalidade",
    description: "Ensina a dominar o ego pra não sabotar seu sucesso.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/1591847818.01.L.jpg",
    link: "https://www.amazon.com.br/dp/1591847818",
    premium_only: false
  },
  {
    id: 3,
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    category: "Finanças",
    description: "Os princípios do sucesso e da riqueza baseados nos grandes vencedores.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/1585424331.01.L.jpg",
    link: "https://www.amazon.com.br/dp/1585424331",
    premium_only: false
  },
  {
    id: 4,
    title: "The Master Key System",
    author: "Charles F. Haanel",
    category: "Mentalidade",
    description: "Exercícios práticos pra desenvolver foco, poder de visualização, controle mental.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/1604591579.01.L.jpg",
    link: "https://www.amazon.com.br/dp/1604591579",
    premium_only: true
  },
  {
    id: 5,
    title: "The Six Pillars of Self-Esteem",
    author: "Nathaniel Branden",
    category: "Mentalidade",
    description: "Os pilares essenciais pra construir uma autoestima saudável e sustentável.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/0553374397.01.L.jpg",
    link: "https://www.amazon.com.br/dp/0553374397",
    premium_only: true
  },
  {
    id: 6,
    title: "Digital Minimalism",
    author: "Cal Newport",
    category: "Produtividade",
    description: "Como evitar o ruído digital e recuperar controle mental.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/0525536515.01.L.jpg",
    link: "https://www.amazon.com.br/dp/0525536515",
    premium_only: false
  },
  {
    id: 7,
    title: "The Power of Habit",
    author: "Charles Duhigg",
    category: "Disciplina",
    description: "Revela a ciência por trás de por que hábitos se formam — e como mudá-los.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/081298160X.01.L.jpg",
    link: "https://www.amazon.com.br/dp/081298160X",
    premium_only: false
  },
  {
    id: 8,
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    category: "Mentalidade",
    description: "Foco no que realmente importa: descarte o resto.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/0062457713.01.L.jpg",
    link: "https://www.amazon.com.br/dp/0062457713",
    premium_only: false
  },
  {
    id: 9,
    title: "How to Win Friends & Influence People",
    author: "Dale Carnegie",
    category: "Comunicação",
    description: "Técnicas clássicas pra melhorar relacionamentos e influência.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/0671027034.01.L.jpg",
    link: "https://www.amazon.com.br/dp/0671027034",
    premium_only: false
  },
  {
    id: 10,
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    category: "Disciplina",
    description: "Os hábitos que pessoas realmente eficazes praticam.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/1982137274.01.L.jpg",
    link: "https://www.amazon.com.br/dp/1982137274",
    premium_only: false
  },
  {
    id: 11,
    title: "The Daily Stoic",
    author: "Ryan Holiday",
    category: "Filosofia",
    description: "Reflexões estoicas pra manter a mente firme dia a dia.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/0735211736.01.L.jpg",
    link: "https://www.amazon.com.br/dp/0735211736",
    premium_only: true
  },
  {
    id: 12,
    title: "Flow: The Psychology of Optimal Experience",
    author: "Mihály Csíkszentmihályi",
    category: "Produtividade",
    description: "Como entrar no estado de flow e operar no máximo da capacidade.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/0061339202.01.L.jpg",
    link: "https://www.amazon.com.br/dp/0061339202",
    premium_only: true
  },
  {
    id: 13,
    title: "Ikigai: Os Segredos do Japão para uma Vida Longa e Feliz",
    author: "Héctor García",
    category: "Propósito",
    description: "Encontre seu propósito com inspiração da longevidade e filosofia japonesa.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/0143130722.01.L.jpg",
    link: "https://www.amazon.com.br/dp/0143130722",
    premium_only: true
  },
  {
    id: 14,
    title: "Boundaries: When to Say Yes, How to Say No",
    author: "Henry Cloud",
    category: "Mentalidade",
    description: "Estabelecer limites pessoais claros é essencial pra disciplina e respeito próprio.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/0310247454.01.L.jpg",
    link: "https://www.amazon.com.br/dp/0310247454",
    premium_only: true
  },
  {
    id: 15,
    title: "The Obstacle Is the Way",
    author: "Ryan Holiday",
    category: "Resiliência",
    description: "Obstáculos como caminho: transformar adversidades em oportunidades.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/1591846358.01.L.jpg",
    link: "https://www.amazon.com.br/dp/1591846358",
    premium_only: false
  },
  {
    id: 16,
    title: "The Compound Effect",
    author: "Darren Hardy",
    category: "Disciplina",
    description: "Pequenas boas ações repetidas levam ao sucesso composto.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/159315724X.01.L.jpg",
    link: "https://www.amazon.com.br/dp/159315724X",
    premium_only: false
  },
  {
    id: 17,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Finanças",
    description: "Reflexões profundas sobre como o comportamento molda sua relação com o dinheiro.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/0857197681.01.L.jpg",
    link: "https://www.amazon.com.br/dp/0857197681",
    premium_only: true
  },
  {
    id: 18,
    title: "Mastery",
    author: "Robert Greene",
    category: "Excelência",
    description: "Estudo sobre aquilo que separa os mestres dos medianos.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/014312417X.01.L.jpg",
    link: "https://www.amazon.com.br/dp/014312417X",
    premium_only: true
  },
  {
    id: 19,
    title: "Man's Search for Meaning",
    author: "Viktor Frankl",
    category: "Propósito",
    description: "Encontrar sentido mesmo no sofrimento é o poder mais forte que existe.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/080701429X.01.L.jpg",
    link: "https://www.amazon.com.br/dp/080701429X",
    premium_only: true
  },
  {
    id: 20,
    title: "Mindset: The New Psychology of Success",
    author: "Carol S. Dweck",
    category: "Mentalidade",
    description: "A diferença entre mindset fixo e de crescimento muda tudo.",
    cover_url: "https://images-na.ssl-images-amazon.com/images/P/0345472322.01.L.jpg",
    link: "https://www.amazon.com.br/dp/0345472322",
    premium_only: true
  }
];

export const bookCategories = [
  "Todos",
  "Mentalidade", 
  "Disciplina",
  "Finanças",
  "Produtividade",
  "Filosofia",
  "Propósito",
  "Comunicação",
  "Resiliência",
  "Excelência"
];