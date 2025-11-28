// Quiz Steps Data - 28 Steps for TDAH Quiz Landing Page
// Extracted from HTML static landing page structure

import {
  QUIZ_IMAGES,
  TESTIMONIAL_IMAGES,
  MODULE_IMAGES,
  DASHBOARD_IMAGES,
  OFFER_IMAGES,
  AUDIO_FILES,
  LOGO,
  AVATAR
} from '../constants/assetPaths';

export type StepType =
  | 'question'      // Standard question with options
  | 'message'       // Informational message with continue button
  | 'carousel'      // Image carousel with testimonials/modules
  | 'loading'       // Loading screen with progress animation
  | 'profile'       // Profile analysis with metrics
  | 'offer';        // Final offer with complex features

export interface QuizOption {
  text: string;
  emoji?: string;
}

export interface CarouselConfig {
  images: readonly string[];
  autoPlay?: boolean;
  interval?: number;
}

export interface AudioPlayerConfig {
  name: string;
  audioPath: string;
  duration: string;
  avatar: string;
}

export interface ProfileMetric {
  label: string;
  value: number; // Percentage 0-100
  color: 'red' | 'blue' | 'green';
  description: string;
}

export interface QuizStep {
  id: number;
  type: StepType;

  // Standard fields (most steps)
  title: string;
  description?: string;
  progress?: number; // Progress bar percentage (0-100)

  // Images
  image?: string;           // Single image (quiz steps)
  images?: string[];        // Multiple images (step 23, 28)

  // Questions
  options?: QuizOption[];

  // Message steps
  buttonText?: string;

  // Carousel (steps 21, 28)
  carousel?: CarouselConfig;

  // Audio player (steps 26, 28)
  audioPlayer?: AudioPlayerConfig;

  // Profile analysis (step 27)
  metrics?: ProfileMetric[];
  tdahType?: string;
  symptoms?: string[];
  improvementChance?: number;

  // Offer (step 28)
  beforeAfterImages?: {
    before: string;
    after: string;
  };
  modulesCarousel?: string[];
  hasFAQ?: boolean;
  hasTimer?: boolean;
}

export const QUIZ_STEPS: QuizStep[] = [
  // Step 1: Gender Selection
  {
    id: 1,
    type: 'question',
    title: 'Descubra se você sofre de TDAH! 🔍',
    description: 'Com apenas alguns cliques, você terá uma análise exclusiva e prática para entender melhor o seu perfil.',
    progress: 5,
    options: [
      { text: 'Mulher', emoji: '' }, // Images handled separately
      { text: 'Homem', emoji: '' },
      { text: 'Outros' },
      { text: 'Prefiro não informar' },
    ],
  },

  // Step 2: Age
  {
    id: 2,
    type: 'question',
    title: 'Qual é a sua idade?',
    description: 'Isso nos ajudará a obter uma resposta mais precisa com base na sua faixa etária',
    progress: 15,
    options: [
      { text: '18-35' },
      { text: '36-45' },
      { text: '46-55' },
      { text: '56-64' },
      { text: '65+' },
    ],
  },

  // Step 3: Motivation
  {
    id: 3,
    type: 'question',
    title: 'Você costuma ter baixa motivação para iniciar alguma tarefa?',
    description: 'A seguir responda a sequência de perguntas para analisarmos o seu nível de TDAH',
    progress: 20,
    options: [
      { text: 'Sempre estou motivado' },
      { text: 'Depende da situação' },
      { text: 'Não, geralmente estou motivado' },
      { text: 'Sim, muitas vezes' },
    ],
  },

  // Step 4: Racing Thoughts
  {
    id: 4,
    type: 'question',
    title: 'Você costuma ter muitos pensamentos acelerados?',
    progress: 30,
    options: [
      { text: 'Sim, frequentemente', emoji: '😟' },
      { text: 'As vezes, depende', emoji: '😯' },
      { text: 'Não, geralmente controlo', emoji: '😌' },
      { text: 'Raramente, tenho a mente tranquila', emoji: '😊' },
    ],
  },

  // Step 5: Mood Changes
  {
    id: 5,
    type: 'question',
    title: 'Você tem mudanças constantes de humor?',
    progress: 40,
    image: QUIZ_IMAGES.humor,
    options: [
      { text: 'Sim, frequentemente' },
      { text: 'Às vezes, depende' },
      { text: 'Não, geralmente sou estável' },
      { text: 'Raramente, meu humor é consistente' },
    ],
  },

  // Step 6: Self-esteem
  {
    id: 6,
    type: 'question',
    title: 'Você geralmente tem a autoestima baixa?',
    progress: 50,
    options: [
      { text: 'Sim, frequentemente', emoji: '😟' },
      { text: 'As vezes, depende', emoji: '😯' },
      { text: 'Não, geralmente tenho uma autoestima saudável', emoji: '😌' },
      { text: 'Raramente, minha autoestima é alta', emoji: '😊' },
    ],
  },

  // Step 7: Forgetfulness
  {
    id: 7,
    type: 'question',
    title: 'Com que frequência você costuma esquecer das coisas?',
    progress: 60,
    image: QUIZ_IMAGES.forget,
    options: [
      { text: 'Muitas vezes' },
      { text: 'Às vezes' },
      { text: 'Raramente' },
      { text: 'Nunca' },
    ],
  },

  // Step 8: Forgetting Words
  {
    id: 8,
    type: 'question',
    title: 'Com que frequência você esquece palavras ou expressões durante uma conversa?',
    progress: 70,
    options: [
      { text: 'Com muita frequência', emoji: '😟' },
      { text: 'Às vezes', emoji: '😯' },
      { text: 'Raramente', emoji: '😌' },
      { text: 'Nunca', emoji: '😊' },
    ],
  },

  // Step 9: Distraction
  {
    id: 9,
    type: 'question',
    title: 'Com que frequência você se distrai com atividades ou barulhos ao seu redor?',
    progress: 80,
    image: QUIZ_IMAGES.distraction,
    options: [
      { text: 'Com muita frequência' },
      { text: 'Às vezes, depende da situação' },
      { text: 'Raramente, mantenho o foco' },
      { text: 'Nunca, consigo me concentrar bem' },
    ],
  },

  // Step 10: What Distracts Most
  {
    id: 10,
    type: 'question',
    title: 'Qual das opções abaixo mais te distrai e te faz perder o foco?',
    progress: 90,
    options: [
      { text: 'Redes sociais', emoji: '📱' },
      { text: 'Notificações do celular', emoji: '⚠️' },
      { text: 'Assistir TV ou vídeos', emoji: '📺' },
      { text: 'Pessoas conversando ao seu redor', emoji: '🗣️' },
      { text: 'Pensamentos frequentes sobre preocupações pessoais', emoji: '🧠' },
      { text: 'Todas as opções', emoji: '📈' },
    ],
  },

  // Step 11: Overload
  {
    id: 11,
    type: 'question',
    title: 'Você se sente sobrecarregado ao realizar tarefas complexas que exigem muito de você?',
    progress: 95,
    image: QUIZ_IMAGES.overload,
    options: [
      { text: 'Sim, sempre' },
      { text: 'Às vezes, depende' },
      { text: 'Raramente' },
      { text: 'Nunca' },
    ],
  },

  // Step 12: Dealing with Stress
  {
    id: 12,
    type: 'question',
    title: 'Como você costuma lidar com o estresse?',
    progress: 100,
    image: QUIZ_IMAGES.stress,
    options: [
      { text: 'Me afasto das pessoas' },
      { text: 'Assisto vídeos compulsivamente' },
      { text: 'Busco conforto na comida' },
      { text: 'Outras formas' },
    ],
  },

  // Step 13: Interrupting People
  {
    id: 13,
    type: 'question',
    title: 'Com que frequência você interrompe outras pessoas durante as conversas?',
    progress: 100,
    options: [
      { text: 'Sempre' },
      { text: 'Quase sempre' },
      { text: 'Depende do meu humor' },
      { text: 'Raramente' },
      { text: 'Nunca' },
    ],
  },

  // Step 14: Lost in Thoughts
  {
    id: 14,
    type: 'question',
    title: 'Com que frequência você se pega perdido em pensamentos distantes enquanto está fazendo algo?',
    progress: 100,
    options: [
      { text: 'O tempo todo', emoji: '😔' },
      { text: 'Quase sempre', emoji: '😟' },
      { text: 'Raramente', emoji: '😌' },
      { text: 'Nunca', emoji: '🕶️' },
    ],
  },

  // Step 15: Forgetting Where Things Are
  {
    id: 15,
    type: 'question',
    title: 'Com que frequência você costuma esquecer onde deixou as coisas?',
    progress: 100,
    image: QUIZ_IMAGES.lostThings,
    options: [
      { text: 'O tempo todo' },
      { text: 'Quase sempre' },
      { text: 'Raramente' },
      { text: 'Nunca' },
    ],
  },

  // Step 16: Motivational Message
  {
    id: 16,
    type: 'message',
    title: 'O TDAH não precisa impedir você de alcançar seus objetivos',
    description: 'Ao avaliar suas respostas neste questionário, poderemos determinar seu tipo de TDAH e elaborar um plano de ação para ajudar você a manter o foco e alcançar seus objetivos.',
    image: QUIZ_IMAGES.relaxation,
    buttonText: 'Continuar',
  },

  // Step 17: Eating or Shopping
  {
    id: 17,
    type: 'question',
    title: 'Comer ou comprar coisas melhora seu humor?',
    progress: 100,
    options: [
      { text: 'Apenas comer melhora', emoji: '🍔' },
      { text: 'Apenas comprar melhora', emoji: '🛍️' },
      { text: 'As duas opções melhora', emoji: '😍' },
      { text: 'Nenhuma opção melhora', emoji: '🚫' },
    ],
  },

  // Step 18: Priorities
  {
    id: 18,
    type: 'question',
    title: 'Se pudéssemos tratar o TDAH, qual dessas áreas você gostaria de priorizar?',
    progress: 100,
    options: [
      { text: 'Melhorar a auto-estima', emoji: '💪' },
      { text: 'Ter mais controle sobre sua vida', emoji: '😌' },
      { text: 'Aprender a se concentrar por mais tempo', emoji: '📺' },
      { text: 'Acabar com a procrastinação', emoji: '⚠️' },
      { text: 'Todas as opções', emoji: '🔥' },
    ],
  },

  // Step 19: Plan Creation Message
  {
    id: 19,
    type: 'message',
    title: 'Vamos criar um plano especialmente para você,',
    description: 'desenvolvido por um grupo de psicólogos cognitivos. As pesquisas comprovam que nossas ações refletem nossos pensamentos e emoções.\n\nAo trabalhar os fatores emocionais que influenciam o TDAH, podemos reduzir os sintomas e aumentar sua produtividade de forma eficaz.',
    image: QUIZ_IMAGES.plan,
    buttonText: 'Continuar',
  },

  // Step 20: Personalized Plan Question
  {
    id: 20,
    type: 'question',
    title: 'Você sabia que um plano personalizado pode transformar sua forma de lidar com o TDAH?',
    progress: 100,
    options: [
      { text: 'Sim, quero descobrir como!', emoji: '✅' },
      { text: 'Não, mas quero aprender mais.', emoji: '😯' },
    ],
  },

  // Step 21: Testimonials Carousel
  {
    id: 21,
    type: 'carousel',
    title: 'Por que ter um plano personalizado?',
    description: 'Um plano personalizado foca nas suas necessidades específicas, ajudando a melhorar a concentração, reduzir a procrastinação e organizar sua rotina. Imagine como seria superar esses desafios diariamente!',
    buttonText: 'Continuar',
    carousel: {
      images: TESTIMONIAL_IMAGES,
      autoPlay: true,
      interval: 5000,
    },
  },

  // Step 22: Guide Question
  {
    id: 22,
    type: 'question',
    title: 'Você já pensou em como seria ter um guia para superar os desafios do TDAH?',
    progress: 100,
    options: [
      { text: 'Sim, sempre quis algo assim!', emoji: '💡' },
      { text: 'Ainda não, mas parece interessante.', emoji: '🤷‍♂️' },
    ],
  },

  // Step 23: All in One Place
  {
    id: 23,
    type: 'message',
    title: 'Tudo em um único lugar!',
    description: 'Seu plano não é apenas um guia; é um programa completo que ajuda você a transformar seu dia a dia, com ferramentas práticas e apoio contínuo para enfrentar os desafios do TDAH.',
    images: [DASHBOARD_IMAGES.character, DASHBOARD_IMAGES.dashboard],
    buttonText: 'Continuar',
  },

  // Step 24: How Would Life Be
  {
    id: 24,
    type: 'question',
    title: 'Como seria sua vida se você pudesse controlar os sintomas do TDAH?',
    progress: 100,
    options: [
      { text: 'Muito melhor, mais organizada', emoji: '✨' },
      { text: 'Com menos stress e mais clareza', emoji: '😌' },
      { text: 'Finalmente atingindo meus objetivos', emoji: '🎯' },
    ],
  },

  // Step 25: More Organized Life
  {
    id: 25,
    type: 'message',
    title: 'Vida mais Organizada',
    description: 'Isso é possível! Nosso plano foi desenhado para transformar essas respostas em realidade, ajudando você a ter mais equilíbrio, sucesso e controle no dia a dia.',
    image: DASHBOARD_IMAGES.stretching,
    buttonText: 'Continuar',
  },

  // Step 26: Loading with Audio
  {
    id: 26,
    type: 'loading',
    title: 'Preparando...',
    description: 'O nosso grupo de psicólogos estão preparando o seu plano exclusivo e personalizado.',
    audioPlayer: {
      name: 'Fernanda',
      audioPath: AUDIO_FILES.fernanda,
      duration: '00:35',
      avatar: AVATAR,
    },
  },

  // Step 27: Profile Analysis
  {
    id: 27,
    type: 'profile',
    title: 'Análise inicial do seu perfil',
    buttonText: 'Continuar',
    tdahType: 'Combinado',
    symptoms: [
      'Mudanças de humor',
      'Ansiedade',
      'Desatenção',
      'Desorganização',
      'Fadiga emocional',
    ],
    improvementChance: 94,
    metrics: [
      {
        label: 'NÍVEL DE TDAH',
        value: 85,
        color: 'red',
        description: 'Sua jornada de evolução começa aqui',
      },
      {
        label: 'AUTO CONFIANÇA',
        value: 30,
        color: 'blue',
        description: 'Confiança abalada',
      },
      {
        label: 'CHANCES DE MELHORA',
        value: 94,
        color: 'green',
        description: 'Grandes chances de melhora',
      },
    ],
  },

  // Step 28: Exclusive Offer
  {
    id: 28,
    type: 'offer',
    title: 'Conheça agora o seu\nPlano Exclusivo',
    beforeAfterImages: {
      before: OFFER_IMAGES.before,
      after: OFFER_IMAGES.after,
    },
    modulesCarousel: MODULE_IMAGES as unknown as string[],
    audioPlayer: {
      name: 'Fernanda',
      audioPath: AUDIO_FILES.fernanda2,
      duration: '00:35',
      avatar: AVATAR,
    },
    hasFAQ: true,
    hasTimer: true,
  },
];

// Helper function to get step by ID
export const getStepById = (id: number): QuizStep | undefined => {
  return QUIZ_STEPS.find(step => step.id === id);
};

// Helper to get total steps count
export const getTotalSteps = (): number => QUIZ_STEPS.length;

// Type guard helpers
export const isQuestionStep = (step: QuizStep): boolean => step.type === 'question';
export const isMessageStep = (step: QuizStep): boolean => step.type === 'message';
export const isCarouselStep = (step: QuizStep): boolean => step.type === 'carousel';
export const isLoadingStep = (step: QuizStep): boolean => step.type === 'loading';
export const isProfileStep = (step: QuizStep): boolean => step.type === 'profile';
export const isOfferStep = (step: QuizStep): boolean => step.type === 'offer';
