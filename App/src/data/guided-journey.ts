export interface GuidedWeek {
  id: number;
  week: number;
  title: string;
  theme: string;
  summary: string;
  daily_tasks: DailyTask[];
  audio_guide?: string;
  locked: boolean;
}

export interface DailyTask {
  day: number;
  title: string;
  description: string;
  type: "action" | "reflection" | "challenge";
  estimated_time: string;
}

export const guidedJourney: GuidedWeek[] = [
  {
    id: 1,
    week: 1,
    title: "Quebra do Padrão",
    theme: "Corte, choque e reinício",
    summary: "Você não vai mudar com conforto. Essa semana é para cortar tudo que te atrasa e construir seu primeiro alicerce: silêncio, controle e ação mínima.",
    daily_tasks: [
      {
        day: 1,
        title: "Apagar apps inúteis e notificações",
        description: "Delete aplicativos que sugam seu tempo. Desative notificações desnecessárias. Deixe apenas o essencial.",
        type: "action",
        estimated_time: "15 min"
      },
      {
        day: 2,
        title: "Acordar 30min mais cedo",
        description: "Configure o despertador 30 minutos antes do horário normal. Use esse tempo para si mesmo, sem pressa.",
        type: "action", 
        estimated_time: "30 min"
      },
      {
        day: 3,
        title: "Começar hábito de água + sol",
        description: "Beba um copo d'água ao acordar e tome 5 minutos de sol matinal. Conecte-se com o básico.",
        type: "action",
        estimated_time: "10 min"
      },
      {
        day: 4,
        title: "Leitura mínima (5min) + reflexão",
        description: "Leia por 5 minutos algo que agrega valor. Depois reflita: o que aprendi? Como aplico?",
        type: "reflection",
        estimated_time: "10 min"
      },
      {
        day: 5,
        title: "Diário de sabotagens",
        description: "Anote tudo que te atrasa durante o dia: distrações, procrastinação, vícios. Seja honesto.",
        type: "reflection",
        estimated_time: "10 min"
      },
      {
        day: 6,
        title: "Meditação 4min + frase de comando",
        description: "4 minutos de respiração consciente. Depois escolha uma frase motivadora e repita 3 vezes em voz alta.",
        type: "action",
        estimated_time: "7 min"
      },
      {
        day: 7,
        title: "Relatório mental da semana",
        description: "O que mudou? Como se sente? Quais resistências surgiram? Anote suas percepções.",
        type: "reflection",
        estimated_time: "15 min"
      }
    ],
    audio_guide: "/audio/week1-intro.mp3",
    locked: false
  },
  {
    id: 2,
    week: 2,
    title: "Disciplinando o Corpo",
    theme: "Movimento, nutrição, repetição",
    summary: "Você vai começar a treinar, se alimentar como adulto e parar de usar comida como muleta emocional. É o começo da máquina.",
    daily_tasks: [
      {
        day: 1,
        title: "7min de treino funcional",
        description: "Flexões, agachamentos, prancha. 7 minutos de movimento intenso. Não precisa de academia.",
        type: "action",
        estimated_time: "7 min"
      },
      {
        day: 2,
        title: "Comer proteína real no café",
        description: "Ovos, frango, shake proteico. Substitua pão e doces por proteína de verdade.",
        type: "action",
        estimated_time: "15 min"
      },
      {
        day: 3,
        title: "Banho gelado curto",
        description: "30 segundos de água fria no final do banho. Respire fundo e aguente o desconforto.",
        type: "challenge",
        estimated_time: "1 min"
      },
      {
        day: 4,
        title: "Lembrete de postura (4x no dia)",
        description: "Configure 4 alarmes. A cada toque, corrija sua postura: ombros para trás, peito aberto.",
        type: "action",
        estimated_time: "5 min total"
      },
      {
        day: 5,
        title: "Anotar o que comeu (sem julgamento)",
        description: "Liste tudo que consumiu hoje. Não julgue, apenas observe padrões e tome consciência.",
        type: "reflection",
        estimated_time: "10 min"
      },
      {
        day: 6,
        title: "Treino + respiração tática",
        description: "7 minutos de exercício seguidos de 3 minutos de respiração 4-4-4-4 para recuperação.",
        type: "action",
        estimated_time: "10 min"
      },
      {
        day: 7,
        title: "Review físico (como se sentiu?)",
        description: "Como o corpo reagiu esta semana? Mais energia? Menos? Quais mudanças nota?",
        type: "reflection",
        estimated_time: "10 min"
      }
    ],
    audio_guide: "/audio/week2-body.mp3", 
    locked: false
  },
  {
    id: 3,
    week: 3,
    title: "Fortalecendo a Mente",
    theme: "Consistência, pensamento, silêncio",
    summary: "Você vai aprender a controlar a mente antes que ela te sabote. Menos barulho, mais foco. A disciplina mental começa aqui.",
    daily_tasks: [
      {
        day: 1,
        title: "Visualização: 'meu eu daqui 90 dias'",
        description: "Feche os olhos e veja-se daqui 3 meses: mais forte, disciplinado, focado. Sinta essa versão de si.",
        type: "reflection",
        estimated_time: "10 min"
      },
      {
        day: 2,
        title: "Escrita de metas reais",
        description: "3 objetivos específicos para os próximos 30 dias. Seja preciso: datas, números, resultados.",
        type: "action",
        estimated_time: "15 min"
      },
      {
        day: 3,
        title: "Meditação 10min com técnica guiada",
        description: "Use a técnica Box Breathing por 10 minutos completos. Mantenha foco total na respiração.",
        type: "action",
        estimated_time: "10 min"
      },
      {
        day: 4,
        title: "Silêncio total 20min no dia",
        description: "20 minutos sem falar, sem tela, sem música. Apenas você e seus pensamentos. Observe-os.",
        type: "challenge",
        estimated_time: "20 min"
      },
      {
        day: 5,
        title: "Sem redes sociais por 24h",
        description: "Delete apps temporariamente ou dê o celular para alguém. 24h de detox digital completo.",
        type: "challenge",
        estimated_time: "24 horas"
      },
      {
        day: 6,
        title: "Leitura profunda (capítulo inteiro)",
        description: "Leia um capítulo completo sem interrupções. Faça anotações. Absorva o conteúdo totalmente.",
        type: "action",
        estimated_time: "30 min"
      },
      {
        day: 7,
        title: "Carta para si mesmo",
        description: "Escreva uma carta para você daqui 1 ano. O que quer ter conquistado? Como quer se sentir?",
        type: "reflection",
        estimated_time: "20 min"
      }
    ],
    audio_guide: "/audio/week3-mind.mp3",
    locked: false
  },
  {
    id: 4,
    week: 4,
    title: "Identidade Forjada", 
    theme: "Autoimagem, execução e legado",
    summary: "Tudo agora é sobre se tornar. Não repetir. Não sonhar. Mas agir todos os dias como quem já é. Essa semana te apresenta à sua versão real.",
    daily_tasks: [
      {
        day: 1,
        title: "Análise do ciclo (o que mudou?)",
        description: "Compare você de 3 semanas atrás com agora. Liste mudanças físicas, mentais e comportamentais.",
        type: "reflection",
        estimated_time: "20 min"
      },
      {
        day: 2,
        title: "Reescrever rotina ideal com base no teste",
        description: "Crie sua rotina perfeita baseada no que funcionou nas 3 semanas. Seja específico com horários.",
        type: "action",
        estimated_time: "25 min"
      },
      {
        day: 3,
        title: "Meditação modo guerreiro + frase nova",
        description: "10 minutos visualizando sua versão alpha. Crie uma nova frase de poder e a repita 5 vezes.",
        type: "action",
        estimated_time: "15 min"
      },
      {
        day: 4,
        title: "Rotina limpa (executar tudo sem falha)",
        description: "Execute sua rotina ideal sem pular nada. Manhã, tarde e noite perfeitas. Zero exceções.",
        type: "challenge",
        estimated_time: "Dia inteiro"
      },
      {
        day: 5,
        title: "Desafio físico + mental",
        description: "Dobrar o treino (14min) + zero distrações digitais por 4 horas seguidas. Teste seus limites.",
        type: "challenge",
        estimated_time: "4+ horas"
      },
      {
        day: 6,
        title: "Planejar os próximos 30 dias",
        description: "Defina objetivos, rotinas e métricas para o próximo mês. Como vai manter o momentum?",
        type: "action",
        estimated_time: "30 min"
      },
      {
        day: 7,
        title: "Ritual de encerramento (escrever missão)",
        description: "Escreva sua missão pessoal em uma frase. Quem você é? Qual seu propósito? Memorize-a.",
        type: "reflection",
        estimated_time: "25 min"
      }
    ],
    audio_guide: "/audio/week4-identity.mp3",
    locked: false
  }
];