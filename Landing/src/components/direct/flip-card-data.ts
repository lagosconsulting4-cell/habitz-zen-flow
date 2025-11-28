export interface CardContent {
  time: string;
  title: string;
  emoji: string;
  description: string;
  stressChange: string;
  image?: string;
}

export interface FlipCardData {
  id: number;
  time: string;
  title: string;
  dor: {
    emoji: string;
    text: string;
    stress: string;
    image?: string;
  };
  bora: {
    emoji: string;
    text: string;
    stress: string;
    image?: string;
  };
}

export const getCardContent = (card: FlipCardData, phase: "dor" | "bora"): CardContent => {
  const data = phase === "dor" ? card.dor : card.bora;
  return {
    time: card.time,
    title: card.title,
    emoji: data.emoji,
    description: data.text,
    stressChange: data.stress,
    image: data.image,
  };
};

export const flipCardsData: FlipCardData[] = [
  {
    id: 1,
    time: "06:00",
    title: "Acordar",
    dor: {
      emoji: "😩",
      text: "Alarme toca. Você já está exausto antes de levantar.",
      stress: "+12%",
      image: "/images/mirror/bixo-7.png",
    },
    bora: {
      emoji: "😌",
      text: "Respira fundo. Luz natural. Corpo desperta com calma.",
      stress: "-15%",
      image: "/images/mirror/bixo-3.png",
    },
  },
  {
    id: 2,
    time: "08:00",
    title: "Começar o Dia",
    dor: {
      emoji: "😣",
      text: "Trânsito, notificações, já atrasado. Caos mental.",
      stress: "+18%",
      image: "/images/mirror/bixo-1.png",
    },
    bora: {
      emoji: "😊",
      text: "Ritual matinal. Café com calma. Foco na primeira tarefa.",
      stress: "-10%",
      image: "/images/mirror/bixo-4.png",
    },
  },
  {
    id: 3,
    time: "12:00",
    title: "Meio do Dia",
    dor: {
      emoji: "😵‍💫",
      text: "Reuniões sem parar. Almoço correndo. Cansaço batendo.",
      stress: "+22%",
      image: "/images/mirror/bixo-2.png",
    },
    bora: {
      emoji: "😎",
      text: "Pausa consciente. Refeição tranquila. Energia renovada.",
      stress: "-12%",
      image: "/images/mirror/bixo-5.png",
    },
  },
  {
    id: 4,
    time: "15:00",
    title: "Tarde",
    dor: {
      emoji: "😖",
      text: "Procrastinação. Tarefas acumulando. Culpa crescendo.",
      stress: "+25%",
      image: "/images/mirror/bixo-3.png",
    },
    bora: {
      emoji: "🚀",
      text: "Foco no essencial. Progresso visível. Sensação de controle.",
      stress: "-18%",
      image: "/images/mirror/bixo-6.png",
    },
  },
  {
    id: 5,
    time: "18:00",
    title: "Fim do Expediente",
    dor: {
      emoji: "😞",
      text: "Sentimento de fracasso. Nada foi concluído. Leva trabalho pra casa.",
      stress: "+20%",
      image: "/images/mirror/bixo-4.png",
    },
    bora: {
      emoji: "🎉",
      text: "Dia produtivo. Tarefas concluídas. Desconexão tranquila.",
      stress: "-14%",
      image: "/images/mirror/bixo-8.png",
    },
  },
  {
    id: 6,
    time: "20:00",
    title: "Noite",
    dor: {
      emoji: "😵",
      text: "Scroll infinito. Tempo passa. Vazio aumenta.",
      stress: "+15%",
      image: "/images/mirror/bixo-5.png",
    },
    bora: {
      emoji: "💫",
      text: "Tempo de qualidade. Conexões reais. Presença plena.",
      stress: "-16%",
      image: "/images/mirror/bixo-2.png",
    },
  },
  {
    id: 7,
    time: "22:00",
    title: "Antes de Dormir",
    dor: {
      emoji: "😬",
      text: "Mente acelerada. Preocupações girando. Insônia chegando.",
      stress: "+28%",
      image: "/images/mirror/bixo-6.png",
    },
    bora: {
      emoji: "🛌",
      text: "Ritual de sono. Mente tranquila. Corpo relaxado.",
      stress: "-20%",
      image: "/images/mirror/bixo-1.png",
    },
  },
  {
    id: 8,
    time: "00:00",
    title: "Madrugada",
    dor: {
      emoji: "😰",
      text: "Acordado. Ansiedade. Amanhã será pior ainda.",
      stress: "+30%",
      image: "/images/mirror/bixo-8.png",
    },
    bora: {
      emoji: "🌙",
      text: "Sono profundo. Recuperação total. Energia renovada.",
      stress: "-25%",
      image: "/images/mirror/bixo-7.png",
    },
  },
];
