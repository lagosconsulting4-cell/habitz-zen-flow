export interface RoutineTip {
  id: number;
  title: string;
  description: string;
  category: string;
  premium_only: boolean;
  time_suggestion: string;
  impact: "Leve" | "Moderado" | "Alto";
}

export const routineTips: RoutineTip[] = [
  // ROTINA MATINAL
  {
    id: 1,
    title: "Água com limão ao acordar",
    description: "Hidrata e ativa o sistema digestivo logo cedo.",
    category: "Manhã",
    premium_only: false,
    time_suggestion: "2 min",
    impact: "Leve"
  },
  {
    id: 2,
    title: "10 minutos de leitura antes do celular",
    description: "Alimenta a mente antes de consumir feeds e notificações.",
    category: "Manhã", 
    premium_only: false,
    time_suggestion: "10 min",
    impact: "Moderado"
  },
  {
    id: 3,
    title: "Sol + silêncio (modo monge)",
    description: "5 minutos de sol em silêncio absoluto para reset mental.",
    category: "Manhã",
    premium_only: false,
    time_suggestion: "5 min",
    impact: "Leve"
  },
  {
    id: 4,
    title: "Treino rápido de 7min",
    description: "Ativa corpo e mente sem enrolação, só o essencial.",
    category: "Manhã",
    premium_only: true,
    time_suggestion: "7 min",
    impact: "Alto"
  },
  {
    id: 5,
    title: "Caderno de metas (modo sniper)",
    description: "Escreve 3 tarefas-chave do dia. Só o essencial.",
    category: "Manhã",
    premium_only: false,
    time_suggestion: "4 min",
    impact: "Moderado"
  },

  // ROTINA NOTURNA  
  {
    id: 6,
    title: "Desligar telas 30min antes de dormir",
    description: "Reduz cortisol e melhora qualidade do sono.",
    category: "Noite",
    premium_only: false,
    time_suggestion: "30 min",
    impact: "Moderado"
  },
  {
    id: 7,
    title: "Anotar 3 vitórias do dia",
    description: "Fecha o dia com sensação de progresso e gratidão.",
    category: "Noite",
    premium_only: false,
    time_suggestion: "5 min",
    impact: "Leve"
  },
  {
    id: 8,
    title: "Modo silêncio (sem estímulo visual)",
    description: "Últimos 20min antes da cama em silêncio total.",
    category: "Noite",
    premium_only: true,
    time_suggestion: "20 min",
    impact: "Alto"
  },

  // FOCO & PRODUTIVIDADE
  {
    id: 9,
    title: "Pomodoro 25/5",
    description: "25min trabalho total, 5min pausa. Repete o ciclo.",
    category: "Produtividade",
    premium_only: false,
    time_suggestion: "25+5 min",
    impact: "Moderado"
  },
  {
    id: 10,
    title: "Zero multitarefa por 1h",
    description: "Só uma coisa de cada vez. Sem aba, sem distração.",
    category: "Produtividade",
    premium_only: true,
    time_suggestion: "60 min",
    impact: "Alto"
  },
  {
    id: 11,
    title: "Desbloqueio mental com respiração 2min",
    description: "Respiração profunda + ancoragem para sair da distração.",
    category: "Produtividade",
    premium_only: false,
    time_suggestion: "2 min",
    impact: "Leve"
  },

  // MENTE & AUTOIMAGEM
  {
    id: 12,
    title: "Frase de comando mental",
    description: "Escolhe uma frase forte e lê em voz alta todo dia.",
    category: "Mente",
    premium_only: false,
    time_suggestion: "1 min",
    impact: "Leve"
  },
  {
    id: 13,
    title: "Espelho + postura",
    description: "Olha nos olhos no espelho e alinha postura por 30s.",
    category: "Mente",
    premium_only: true,
    time_suggestion: "1 min",
    impact: "Leve"
  },
  {
    id: 14,
    title: "Visualização da meta do mês",
    description: "Fecha os olhos e imagina o dia da vitória chegando.",
    category: "Mente",
    premium_only: true,
    time_suggestion: "5 min",
    impact: "Moderado"
  },

  // CORPO & ENERGIA
  {
    id: 15,
    title: "Banho gelado (modo monstro)",
    description: "Entrar 30s no frio no final do banho. Reset total.",
    category: "Corpo",
    premium_only: true,
    time_suggestion: "0-2 min",
    impact: "Alto"
  }
];