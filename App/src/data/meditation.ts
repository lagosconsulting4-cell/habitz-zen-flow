export interface MeditationTip {
  id: number;
  title: string;
  description: string;
  focus: string;
  steps: string[];
  duration: string;
  sounds: string[];
  premium_only: boolean;
  category: string;
}

export const meditationTips: MeditationTip[] = [
  {
    id: 1,
    title: "Box Breathing",
    description: "Respiração de caixa para controle do stress e foco mental",
    focus: "Controle de stress e foco",
    steps: [
      "Inspire por 4 segundos",
      "Segure o ar por 4 segundos", 
      "Expire por 4 segundos",
      "Segure sem ar por 4 segundos",
      "Repita o ciclo"
    ],
    duration: "5 minutos",
    sounds: ["Silêncio total", "Som de respiração leve"],
    premium_only: false,
    category: "Respiração"
  },
  {
    id: 2,
    title: "Respiração 4-7-8",
    description: "Técnica para relaxamento rápido e indução do sono",
    focus: "Relaxamento, indução do sono",
    steps: [
      "Inspire por 4 segundos",
      "Segure o ar por 7 segundos",
      "Expire lentamente por 8 segundos",
      "Repita 4 ciclos completos"
    ],
    duration: "3 minutos",
    sounds: ["Natureza", "Respiração guiada"],
    premium_only: false,
    category: "Respiração"
  },
  {
    id: 3,
    title: "Respiração Monge (Pranayama leve)",
    description: "Técnica para clareza e estabilidade emocional",
    focus: "Clareza, estabilidade emocional",
    steps: [
      "Sente-se com a coluna ereta",
      "Inspire profundamente pelo nariz",
      "Expire lentamente pelo nariz",
      "Foque na expiração mais longa que a inspiração",
      "Mantenha ritmo constante"
    ],
    duration: "10 minutos",
    sounds: ["Floresta leve", "Ruído branco"],
    premium_only: false,
    category: "Respiração"
  },
  {
    id: 4,
    title: "Silêncio Tático",
    description: "Descompressão mental após estímulo digital",
    focus: "Descompressão mental",
    steps: [
      "Sente em um local silencioso",
      "Respire normalmente",
      "Apenas observe os pensamentos sem julgar",
      "Não force nada, apenas permaneça presente",
      "Aceite o que vier à mente"
    ],
    duration: "5 minutos",
    sounds: ["Nenhum"],
    premium_only: false,
    category: "Silêncio"
  },
  {
    id: 5,
    title: "Modo Guerreiro (Visualização Guiada)",
    description: "Visualização para foco, identidade e mentalidade alpha",
    focus: "Foco, identidade, mentalidade alpha",
    steps: [
      "Feche os olhos e respire fundo",
      "Visualize seu 'eu ideal' acordando",
      "Veja-se treinando com disciplina",
      "Imagine-se lendo e evoluindo",
      "Sinta a sensação de vitória e propósito",
      "Mantenha essa imagem por alguns minutos"
    ],
    duration: "10 minutos",
    sounds: ["Batida baixa suave", "Respiração controlada"],
    premium_only: true,
    category: "Visualização"
  },
  {
    id: 6,
    title: "Respiração de Combate (Técnica Navy SEAL)",
    description: "Técnica para manter foco sob pressão",
    focus: "Foco sob pressão",
    steps: [
      "Inspire profundamente por 2 segundos",
      "Expire com força por 1 segundo",
      "Repita em ritmo firme e constante",
      "Mantenha postura ereta durante toda prática"
    ],
    duration: "2-4 minutos",
    sounds: ["Ruído militar leve", "Silêncio"],
    premium_only: true,
    category: "Respiração"
  },
  {
    id: 7,
    title: "Modo Reset (Descarregador de Estresse)",
    description: "Reset mental rápido em meio ao caos",
    focus: "Reset mental rápido",
    steps: [
      "Faça 10 respirações profundas",
      "Pause 3 segundos entre cada respiração",
      "Na expiração, solte tensões do corpo",
      "Visualize stress saindo do corpo",
      "Termine com 3 respirações normais"
    ],
    duration: "3-5 minutos",
    sounds: ["Som de água", "Vento suave"],
    premium_only: false,
    category: "Reset"
  },
  {
    id: 8,
    title: "Meditação Foco Total",
    description: "Preparação para leitura, estudo ou treino",
    focus: "Preparação para alta performance",
    steps: [
      "Respire profundamente 5 vezes",
      "Conte mentalmente de 10 a 1",
      "A cada número, sinta-se mais focado",
      "Visualize a atividade que fará em seguida",
      "Termine definindo intenção clara"
    ],
    duration: "5 minutos",
    sounds: ["Pulsos binaurais suaves"],
    premium_only: true,
    category: "Preparação"
  },
  {
    id: 9,
    title: "Ancoragem do Presente",
    description: "Técnica para diminuir ansiedade e trazer atenção para o agora",
    focus: "Diminuir ansiedade, presença",
    steps: [
      "Observe 5 coisas ao seu redor",
      "Identifique 4 coisas que pode tocar",
      "Escute 3 sons diferentes",
      "Sinta 2 odores ou texturas",
      "Saboreie 1 coisa (água, bala, etc.)",
      "Respire profundamente ao final"
    ],
    duration: "5 minutos",
    sounds: ["Ambiente suave", "Instrução textual"],
    premium_only: false,
    category: "Mindfulness"
  },
  {
    id: 10,
    title: "Modo Noturno (Desligar a Mente)",
    description: "Transição para o sono e descanso real",
    focus: "Transição para o sono",
    steps: [
      "Deite-se confortavelmente",
      "Respire lenta e profundamente",
      "Solte conscientemente cada parte do corpo",
      "Repita mentalmente: 'Solta o corpo, solta os pensamentos'",
      "Visualize-se dormindo profundamente",
      "Mantenha respiração lenta até adormecer"
    ],
    duration: "10-12 minutos",
    sounds: ["Chuva leve", "Voz suave guiada"],
    premium_only: true,
    category: "Sono"
  }
];