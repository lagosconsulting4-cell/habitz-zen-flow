/**
 * 7-Layer Smart Habit Recommendation Algorithm (v2)
 *
 * LAYER 1: Objective → core anchor/directed/rhythm habits
 * LAYER 2: Challenges → support habits (surgical)
 * LAYER 3: Life Areas → complementary habits
 * LAYER 4: Experience → quantity & difficulty calibration
 * LAYER 5: Weekly Rhythm → day-of-week energy profiles
 * LAYER 6: Time-of-Day → period allocation from wake/sleep + energy peak
 * LAYER 7: Profession → micro-adaptations + bonus habit
 */

import type { QuizData } from './useQuizData';

// ============================================================================
// TYPES
// ============================================================================

export interface RecommendedHabitV2 {
  id: string;
  name: string;
  description: string;
  category: string;
  habit_type: 'anchor' | 'directed' | 'rhythm' | 'support' | 'complement';
  icon: string;
  icon_key: string;
  color: string;
  period: 'morning' | 'afternoon' | 'evening';
  suggested_time: string;
  duration: number;
  goal_value?: number;
  goal_unit?: string;
  frequency_type: 'fixed_days' | 'times_per_week' | 'daily';
  frequency_days: number[];
  priority: number;
  weekend_time?: string;
  weekend_duration?: number;
  weekend_frequency_days?: number[];
  recommendation_score: number;
  recommendation_sources: string[];
  template_id?: string;
}

export interface GenerateInputV2 {
  quizData: QuizData;
  wakeSleepTime: { wake: string; sleep: string };
  weekendDiff: 'same' | 'different' | 'varies';
  lifeAreas: string[];
  habitExperience: 'never' | 'tried' | 'already_have';
  confirmedObjective: string;
  profession: string | null;
}

// ============================================================================
// INTERNAL TYPES
// ============================================================================

interface HabitTemplate {
  code: string;
  name: string;
  description: string;
  category: string;
  habit_type: 'anchor' | 'directed' | 'rhythm' | 'support' | 'complement';
  icon: string;
  icon_key: string;
  color: string;
  defaultDuration: number;
  defaultPeriod: 'dawn' | 'morning' | 'afternoon' | 'late_afternoon' | 'evening' | 'any';
  defaultFrequencyDays: number[]; // 0=Sun..6=Sat
  priority: number;
  objective?: string;
  challenge?: string;
  lifeArea?: string;
  profession?: string;
}

// ============================================================================
// HABIT TEMPLATES — LAYER 1: OBJECTIVE CORE
// ============================================================================

const OBJECTIVE_TEMPLATES: Record<string, HabitTemplate[]> = {
  productivity: [
    {
      code: 'ANCHOR-PROD-01', name: 'Definição das 3 Prioridades',
      description: 'O dia começa com uma pergunta: "O que precisa acontecer hoje para que o dia valha?" Três itens, escritos, antes de abrir qualquer mensagem.',
      category: 'productivity', habit_type: 'anchor', icon: '🎯', icon_key: 'plan_day', color: '#3B82F6',
      defaultDuration: 8, defaultPeriod: 'morning', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 10,
    },
    {
      code: 'ANCHOR-PROD-02', name: 'Hora de parar o trabalho',
      description: 'Fechar abas, anotar pendências, escrever a primeira tarefa de amanhã. O cérebro só descansa quando sente as coisas guardadas.',
      category: 'productivity', habit_type: 'anchor', icon: '🔌', icon_key: 'shutdown', color: '#6366F1',
      defaultDuration: 8, defaultPeriod: 'late_afternoon', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 9,
    },
    {
      code: 'DIR-PROD-MON', name: 'Começo da semana',
      description: 'Visão rápida da semana: entregas, compromissos fixos, grande projeto. Orientação de trajetória antes de decolar.',
      category: 'productivity', habit_type: 'directed', icon: '🚀', icon_key: 'plan_day', color: '#3B82F6',
      defaultDuration: 15, defaultPeriod: 'morning', defaultFrequencyDays: [1], priority: 8,
    },
    {
      code: 'DIR-PROD-WED', name: 'Como está a semana até agora',
      description: 'Metade da semana passou. Pergunta honesta: "Estou no caminho?" Não para cobrar. Para ajustar.',
      category: 'productivity', habit_type: 'directed', icon: '🔍', icon_key: 'review', color: '#8B5CF6',
      defaultDuration: 10, defaultPeriod: 'late_afternoon', defaultFrequencyDays: [3], priority: 6,
    },
    {
      code: 'DIR-PROD-FRI', name: 'O que a semana trouxe',
      description: 'O que foi entregue? O que não saiu? Uma coisa que aprendi. Coleta de aprendizado, não avaliação.',
      category: 'productivity', habit_type: 'directed', icon: '🌾', icon_key: 'review', color: '#F59E0B',
      defaultDuration: 12, defaultPeriod: 'late_afternoon', defaultFrequencyDays: [5], priority: 7,
    },
    {
      code: 'VAR-PROD-A', name: 'Bloco de Foco Profundo',
      description: '90 min de trabalho em uma única tarefa. Sem celular, sem notificações. Um bloco vale mais que 4h interrompidas.',
      category: 'productivity', habit_type: 'directed', icon: '🧠', icon_key: 'focus', color: '#3B82F6',
      defaultDuration: 90, defaultPeriod: 'morning', defaultFrequencyDays: [1,2,4], priority: 9,
    },
    {
      code: 'VAR-PROD-B', name: 'Bloco de Fluxo Criativo',
      description: 'Tarefas de pensamento lateral e criação. Sem timer fixo. Para quando o pensamento se esgotar.',
      category: 'productivity', habit_type: 'directed', icon: '✨', icon_key: 'creative', color: '#EC4899',
      defaultDuration: 45, defaultPeriod: 'morning', defaultFrequencyDays: [3,5], priority: 7,
    },
    {
      code: 'RHYTHM-PROD-SUN', name: 'Preparação da Semana',
      description: '20 min para revisar compromissos, definir 3 projetos mais importantes e separar prioridade de ruído.',
      category: 'productivity', habit_type: 'rhythm', icon: '📋', icon_key: 'plan_day', color: '#3B82F6',
      defaultDuration: 20, defaultPeriod: 'afternoon', defaultFrequencyDays: [0], priority: 8,
    },
  ],
  health: [
    {
      code: 'ANCHOR-HEALTH-01', name: 'Água ao Acordar',
      description: '500ml antes de qualquer coisa. O corpo perde 1-1,5L durante o sono. Reposição melhora memória e raciocínio.',
      category: 'corpo', habit_type: 'anchor', icon: '💧', icon_key: 'water', color: '#06B6D4',
      defaultDuration: 2, defaultPeriod: 'dawn', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 10,
    },
    {
      code: 'ANCHOR-HEALTH-02', name: 'Exposição à Luz Natural',
      description: '12 minutos ao ar livre de manhã. Ajuda o corpo a saber que é hora de acordar e melhora o seu sono à noite.',
      category: 'corpo', habit_type: 'anchor', icon: '☀️', icon_key: 'sunlight', color: '#F59E0B',
      defaultDuration: 12, defaultPeriod: 'dawn', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 9,
    },
    {
      code: 'DIR-HEALTH-MON-THU', name: 'Treino de Força',
      description: 'Academia, funcional ou peso corporal. Segunda reinicia o ritmo; quinta mantém o momentum.',
      category: 'corpo', habit_type: 'directed', icon: '💪', icon_key: 'exercise', color: '#EF4444',
      defaultDuration: 45, defaultPeriod: 'afternoon', defaultFrequencyDays: [1,4], priority: 8,
    },
    {
      code: 'DIR-HEALTH-TUE-FRI', name: 'Movimento Leve',
      description: 'Caminhada, mobilidade, yoga. Sem esforço máximo. Mantém consistência de 4x/semana sem sobrecarregar.',
      category: 'corpo', habit_type: 'directed', icon: '🚶', icon_key: 'walk', color: '#10B981',
      defaultDuration: 25, defaultPeriod: 'any', defaultFrequencyDays: [2,5], priority: 7,
    },
    {
      code: 'DIR-HEALTH-WED', name: 'Escuta do Corpo',
      description: 'Caminhada de 15 min observando energia, tensão, qualidade do sono. Consciência corporal ativa.',
      category: 'corpo', habit_type: 'directed', icon: '🧘', icon_key: 'meditation', color: '#8B5CF6',
      defaultDuration: 15, defaultPeriod: 'morning', defaultFrequencyDays: [3], priority: 6,
    },
    {
      code: 'DIR-HEALTH-SAT', name: 'Movimento Prazeroso',
      description: 'Não é treino. Movimento que você escolheria sem app pedindo. Trilha, futebol, dança, bike.',
      category: 'corpo', habit_type: 'directed', icon: '🎉', icon_key: 'exercise', color: '#F97316',
      defaultDuration: 50, defaultPeriod: 'any', defaultFrequencyDays: [6], priority: 7,
    },
    {
      code: 'DIR-HEALTH-SUN', name: 'Preparação do Corpo',
      description: 'Alongamento completo + hidratação reforçada + verificação do sono da semana.',
      category: 'corpo', habit_type: 'directed', icon: '🧘‍♂️', icon_key: 'stretching', color: '#14B8A6',
      defaultDuration: 20, defaultPeriod: 'evening', defaultFrequencyDays: [0], priority: 6,
    },
    {
      code: 'RHYTHM-HEALTH-SLEEP', name: 'Ritual de Sono',
      description: 'Tela desligada 45 min antes, temperatura ajustada. Fim de semana: +10 min de leitura + reflexão.',
      category: 'corpo', habit_type: 'rhythm', icon: '🌙', icon_key: 'sleep', color: '#6366F1',
      defaultDuration: 10, defaultPeriod: 'evening', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 9,
    },
  ],
  mental: [
    {
      code: 'ANCHOR-MENT-01', name: 'Escrever tudo que está na cabeça',
      description: 'Escrever sem parar por 10 minutos tudo que passa pela mente. Sem estrutura, sem revisão. É como esvaziar um copo cheio para pensar com clareza.',
      category: 'mente', habit_type: 'anchor', icon: '📝', icon_key: 'journal', color: '#8B5CF6',
      defaultDuration: 10, defaultPeriod: 'dawn', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 10,
    },
    {
      code: 'ANCHOR-MENT-02', name: 'Pausa de Respiração',
      description: '3 respirações lentas: 4s inspirando, 4s retendo, 6s expirando. Manhã + Tarde + Antes de dormir.',
      category: 'mente', habit_type: 'anchor', icon: '🫁', icon_key: 'breathe', color: '#06B6D4',
      defaultDuration: 2, defaultPeriod: 'morning', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 9,
    },
    {
      code: 'DIR-MENT-MON', name: 'Intenção da Semana',
      description: 'Uma palavra ou frase que define como você quer se sentir essa semana. Âncora psicológica.',
      category: 'mente', habit_type: 'directed', icon: '🧭', icon_key: 'intention', color: '#8B5CF6',
      defaultDuration: 8, defaultPeriod: 'morning', defaultFrequencyDays: [1], priority: 8,
    },
    {
      code: 'DIR-MENT-TUE-THU', name: 'Escrever o que está pesando',
      description: 'Anotar o que está na cabeça, o pior cenário possível e como você responderia. Tira da cabeça e coloca no papel.',
      category: 'mente', habit_type: 'directed', icon: '💭', icon_key: 'reflect', color: '#F59E0B',
      defaultDuration: 15, defaultPeriod: 'late_afternoon', defaultFrequencyDays: [2,4], priority: 7,
    },
    {
      code: 'DIR-MENT-WED', name: 'Pausa sem tela',
      description: '15 minutos sem celular, sem som, sem nada pra fazer. O cérebro descansa quando para de processar estímulos.',
      category: 'mente', habit_type: 'directed', icon: '🤫', icon_key: 'meditation', color: '#6366F1',
      defaultDuration: 15, defaultPeriod: 'afternoon', defaultFrequencyDays: [3], priority: 7,
    },
    {
      code: 'DIR-MENT-FRI', name: 'Reconhecimento Semanal',
      description: 'O que funcionou? O que foi difícil mas fiz? Uma coisa pela qual sou grato. Recalibra o viés negativo.',
      category: 'mente', habit_type: 'directed', icon: '🙏', icon_key: 'gratitude', color: '#10B981',
      defaultDuration: 10, defaultPeriod: 'evening', defaultFrequencyDays: [5], priority: 7,
    },
    {
      code: 'DIR-MENT-SAT', name: 'Pausa sem objetivo (20 min)',
      description: 'Uma hora sem agenda. Qualquer coisa offline que o "eu sem obrigações" escolheria.',
      category: 'mente', habit_type: 'directed', icon: '🌿', icon_key: 'relax', color: '#14B8A6',
      defaultDuration: 60, defaultPeriod: 'any', defaultFrequencyDays: [6], priority: 6,
    },
    {
      code: 'DIR-MENT-SUN', name: 'Recado para o eu de segunda-feira',
      description: '3 a 5 linhas sobre o que você quer lembrar, como quer se sentir e o que não pode esquecer na semana que vem.',
      category: 'mente', habit_type: 'directed', icon: '✉️', icon_key: 'journal', color: '#8B5CF6',
      defaultDuration: 10, defaultPeriod: 'evening', defaultFrequencyDays: [0], priority: 7,
    },
  ],
  routine: [
    {
      code: 'ANCHOR-ROUT-01', name: 'Ritual de acordar (água, luz, cama)',
      description: '4 ações na mesma ordem imutável: água → luz → cama → café. O cérebro automatiza sequências rápido.',
      category: 'time_routine', habit_type: 'anchor', icon: '🌅', icon_key: 'morning_routine', color: '#F59E0B',
      defaultDuration: 15, defaultPeriod: 'dawn', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 10,
    },
    {
      code: 'ANCHOR-ROUT-02', name: 'Preparação Noturna',
      description: 'Roupa separada, bolsa pronta, 3 itens do dia escritos. Manhã com 40% menos decisões.',
      category: 'time_routine', habit_type: 'anchor', icon: '🌙', icon_key: 'evening_routine', color: '#6366F1',
      defaultDuration: 10, defaultPeriod: 'evening', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 9,
    },
    {
      code: 'DIR-ROUT-MON', name: 'Planejar a semana',
      description: 'Distribuir tarefas pelos dias. Não lista infinita. Decidir "isso vai na quarta". Agendar o que importa.',
      category: 'time_routine', habit_type: 'directed', icon: '📐', icon_key: 'plan_day', color: '#3B82F6',
      defaultDuration: 20, defaultPeriod: 'morning', defaultFrequencyDays: [1], priority: 8,
    },
    {
      code: 'DIR-ROUT-WED', name: 'Organizar o espaço',
      description: '15 minutos para organizar seu espaço de trabalho. Ambiente bagunçado distrai e aumenta o estresse sem você perceber.',
      category: 'time_routine', habit_type: 'directed', icon: '🧹', icon_key: 'clean', color: '#10B981',
      defaultDuration: 15, defaultPeriod: 'any', defaultFrequencyDays: [3], priority: 6,
    },
    {
      code: 'DIR-ROUT-SUN', name: 'Fechar a semana',
      description: 'Fechar o ciclo da semana: o que foi feito, o que não foi, o que carregar. Reset no domingo = 60% mais consistente.',
      category: 'time_routine', habit_type: 'directed', icon: '🔄', icon_key: 'review', color: '#8B5CF6',
      defaultDuration: 30, defaultPeriod: 'afternoon', defaultFrequencyDays: [0], priority: 8,
    },
  ],
  avoid: [
    {
      code: 'ANCHOR-AVOI-01', name: 'Registro do Dia',
      description: 'Uma linha: o comportamento-alvo aconteceu? Se sim, em que circunstância? Em 7 dias, o padrão aparece.',
      category: 'avoid', habit_type: 'anchor', icon: '📊', icon_key: 'track', color: '#EF4444',
      defaultDuration: 3, defaultPeriod: 'evening', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 10,
    },
    {
      code: 'ANCHOR-AVOI-02', name: 'Preparar o ambiente',
      description: 'Celular fora do quarto? App deletado da tela? Cada dificuldade extra no caminho reduz muito a chance de ceder.',
      category: 'avoid', habit_type: 'anchor', icon: '🚧', icon_key: 'block', color: '#F97316',
      defaultDuration: 5, defaultPeriod: 'evening', defaultFrequencyDays: [0], priority: 9,
    },
    {
      code: 'DIR-AVOI-MON', name: 'Meu limite da semana',
      description: 'Escrever: "Esta semana vou limitar o celular para [quando]." Ter isso escrito aumenta muito as chances de cumprir.',
      category: 'avoid', habit_type: 'directed', icon: '📜', icon_key: 'contract', color: '#EF4444',
      defaultDuration: 5, defaultPeriod: 'morning', defaultFrequencyDays: [1], priority: 8,
    },
    {
      code: 'DIR-AVOI-TUE-THU', name: 'Trocar o hábito ruim por outro',
      description: 'No horário em que o celular mais te chama, fazer outra coisa no lugar. Hábitos ruins não somem por força de vontade — são substituídos.',
      category: 'avoid', habit_type: 'directed', icon: '🔀', icon_key: 'swap', color: '#F59E0B',
      defaultDuration: 10, defaultPeriod: 'any', defaultFrequencyDays: [2,4], priority: 7,
    },
    {
      code: 'DIR-AVOI-WED', name: 'Quando você mais usou o celular',
      description: 'Olhar para os últimos 3 dias: em que horário aconteceu mais? Qual emoção veio antes? Identificar o padrão é o primeiro passo para mudar.',
      category: 'avoid', habit_type: 'directed', icon: '🔎', icon_key: 'review', color: '#8B5CF6',
      defaultDuration: 8, defaultPeriod: 'evening', defaultFrequencyDays: [3], priority: 6,
    },
    {
      code: 'DIR-AVOI-FRI', name: 'Janela de Permissão',
      description: 'Sexta à noite: 1h de permissão explícita. Sem culpa. Permissão controlada reduz o apelo ao longo do tempo.',
      category: 'avoid', habit_type: 'directed', icon: '🎟️', icon_key: 'reward', color: '#10B981',
      defaultDuration: 60, defaultPeriod: 'evening', defaultFrequencyDays: [5], priority: 5,
    },
    {
      code: 'DIR-AVOI-SUN', name: 'Revisão de Consistência',
      description: 'Frequência esta semana vs anterior. Tendência caindo? Progresso mensurável é o combustível mais eficaz.',
      category: 'avoid', habit_type: 'directed', icon: '📈', icon_key: 'review', color: '#3B82F6',
      defaultDuration: 10, defaultPeriod: 'afternoon', defaultFrequencyDays: [0], priority: 7,
    },
  ],
};

// ============================================================================
// HABIT TEMPLATES — LAYER 2: CHALLENGE SUPPORT
// ============================================================================

const CHALLENGE_TEMPLATES: Record<string, HabitTemplate[]> = {
  procrastination: [
    {
      code: 'SUPP-PROC-01', name: 'O Próximo Passo Físico',
      description: 'Antes de qualquer tarefa: escrever a primeira ação concreta. Não "trabalhar no relatório". "Abrir o arquivo e escrever o título".',
      category: 'productivity', habit_type: 'support', icon: '👣', icon_key: 'step', color: '#3B82F6',
      defaultDuration: 2, defaultPeriod: 'morning', defaultFrequencyDays: [1,2,3,4,5], priority: 8,
    },
    {
      code: 'SUPP-PROC-02', name: 'Comece por só 5 minutos',
      description: '"Só 5 minutos. Depois posso parar." Na maioria das vezes, o cérebro entra em execução e continua.',
      category: 'productivity', habit_type: 'support', icon: '⏱️', icon_key: 'timer', color: '#F59E0B',
      defaultDuration: 5, defaultPeriod: 'any', defaultFrequencyDays: [1,2,3,4,5], priority: 7,
    },
  ],
  focus: [
    {
      code: 'SUPP-FOC-01', name: 'Espaço sem distração',
      description: 'Celular em modo avião, uma única aba, headphones. Design de ambiente > disciplina.',
      category: 'productivity', habit_type: 'support', icon: '🔇', icon_key: 'focus', color: '#6366F1',
      defaultDuration: 3, defaultPeriod: 'morning', defaultFrequencyDays: [1,2,3,4,5], priority: 8,
    },
    {
      code: 'SUPP-FOC-02', name: 'Hora das mensagens',
      description: 'Mensagens e e-mails em duas janelas fixas: 10h e 17h. Fora delas: silenciado.',
      category: 'productivity', habit_type: 'support', icon: '📬', icon_key: 'email', color: '#3B82F6',
      defaultDuration: 20, defaultPeriod: 'morning', defaultFrequencyDays: [1,2,3,4,5], priority: 7,
    },
  ],
  forgetfulness: [
    {
      code: 'SUPP-FORG-01', name: 'Esvaziar a cabeça no papel',
      description: 'Antes de dormir: despejar tudo num único lugar. Não organizar. "Salvar" para o cérebro descansar.',
      category: 'mente', habit_type: 'support', icon: '🧠', icon_key: 'brain_dump', color: '#8B5CF6',
      defaultDuration: 5, defaultPeriod: 'evening', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 8,
    },
    {
      code: 'SUPP-FORG-02', name: 'Revisão de 2 Minutos',
      description: 'Ao acordar: ler o que foi anotado ontem. Quem revisa executa 40% mais.',
      category: 'mente', habit_type: 'support', icon: '📖', icon_key: 'review', color: '#06B6D4',
      defaultDuration: 2, defaultPeriod: 'dawn', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 8,
    },
  ],
  tiredness: [
    {
      code: 'SUPP-TIRE-01', name: 'Caminhada depois do almoço',
      description: '12 min de caminhada no horário do crash (13h-16h). Mais eficaz que cafeína, sem pico-e-queda.',
      category: 'corpo', habit_type: 'support', icon: '🚶‍♂️', icon_key: 'walk', color: '#10B981',
      defaultDuration: 12, defaultPeriod: 'afternoon', defaultFrequencyDays: [1,2,3,4,5], priority: 7,
    },
    {
      code: 'SUPP-TIRE-02', name: 'Hora de Corte da Cafeína',
      description: 'Cafeína fica no corpo por horas. Sem ela depois do horário certo, você dorme mais rápido e acorda mais descansado.',
      category: 'corpo', habit_type: 'support', icon: '☕', icon_key: 'caffeine', color: '#F59E0B',
      defaultDuration: 1, defaultPeriod: 'afternoon', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 6,
    },
  ],
  anxiety: [
    {
      code: 'SUPP-ANXI-01', name: 'Sem redes sociais pela manhã',
      description: 'Nenhuma rede social ou notícia nas primeiras horas do dia. Você protege seu estado mental no momento mais vulnerável.',
      category: 'mente', habit_type: 'support', icon: '🛡️', icon_key: 'shield', color: '#EF4444',
      defaultDuration: 5, defaultPeriod: 'dawn', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 8,
    },
    {
      code: 'SUPP-ANXI-02', name: 'Voltar para o momento presente',
      description: '5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia. Redireciona do ruminar.',
      category: 'mente', habit_type: 'support', icon: '🌍', icon_key: 'grounding', color: '#14B8A6',
      defaultDuration: 3, defaultPeriod: 'any', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 7,
    },
  ],
  motivation: [
    {
      code: 'SUPP-MOTI-01', name: 'Ver o quanto você já avançou',
      description: 'Antes de dormir: uma coisa que fiz hoje que o eu de 3 meses atrás não faria. Cria a evidência.',
      category: 'mente', habit_type: 'support', icon: '⭐', icon_key: 'star', color: '#F59E0B',
      defaultDuration: 2, defaultPeriod: 'evening', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 8,
    },
    {
      code: 'SUPP-MOTI-02', name: 'Lembrar quem você quer ser',
      description: 'Frase escrita, relida toda manhã: "Sou alguém que [comportamento]." O cérebro usa identidade para decisões.',
      category: 'mente', habit_type: 'support', icon: '🪞', icon_key: 'identity', color: '#EC4899',
      defaultDuration: 1, defaultPeriod: 'dawn', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 7,
    },
  ],
};

// ============================================================================
// HABIT TEMPLATES — LAYER 3: LIFE AREA COMPLEMENTS
// ============================================================================

const LIFE_AREA_TEMPLATES: Record<string, HabitTemplate[]> = {
  work: [
    {
      code: 'COMP-WORK-01', name: 'Semana no calendário',
      description: 'Bloquear horários de foco da próxima semana antes que compromissos externos ocupem.',
      category: 'productivity', habit_type: 'complement', icon: '📅', icon_key: 'calendar', color: '#3B82F6',
      defaultDuration: 15, defaultPeriod: 'afternoon', defaultFrequencyDays: [0], priority: 6,
    },
    {
      code: 'COMP-WORK-02', name: 'Limpeza da caixa de entrada',
      description: 'Processar pendências de comunicação antes do fim de semana. Descanso sem trabalho perseguindo.',
      category: 'productivity', habit_type: 'complement', icon: '📧', icon_key: 'email', color: '#6366F1',
      defaultDuration: 20, defaultPeriod: 'afternoon', defaultFrequencyDays: [5], priority: 5,
    },
  ],
  physical: [
    {
      code: 'COMP-PHYS-01', name: 'Movimento Incidental',
      description: 'Mínimo 5.000 passos: escada, andar em chamadas, estacionar longe. Baixo custo, alto impacto.',
      category: 'corpo', habit_type: 'complement', icon: '🏃', icon_key: 'steps', color: '#10B981',
      defaultDuration: 0, defaultPeriod: 'any', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 5,
      goal_value: 5000, goal_unit: 'steps',
    } as HabitTemplate & { goal_value: number; goal_unit: string },
    {
      code: 'COMP-PHYS-02', name: 'Hidratação Programada',
      description: 'Beber água em horários fixos (12h, 15h, 18h). Falta de água piora a concentração e causa cansaço sem você perceber.',
      category: 'corpo', habit_type: 'complement', icon: '🥤', icon_key: 'water', color: '#06B6D4',
      defaultDuration: 1, defaultPeriod: 'afternoon', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 5,
    },
  ],
  mind: [
    {
      code: 'COMP-MIND-01', name: 'Tempo livre, sem planos',
      description: '20 min sem objetivo. Sem celular, produção ou consumo. Descanso cognitivo real.',
      category: 'mente', habit_type: 'complement', icon: '🍃', icon_key: 'relax', color: '#14B8A6',
      defaultDuration: 20, defaultPeriod: 'afternoon', defaultFrequencyDays: [0,1,2,3,4,5,6], priority: 5,
    },
    {
      code: 'COMP-MIND-02', name: 'Leitura Física',
      description: '20 min de livro físico ou e-reader antes de dormir. Foco linear contra fragmentação digital.',
      category: 'mente', habit_type: 'complement', icon: '📚', icon_key: 'read', color: '#8B5CF6',
      defaultDuration: 20, defaultPeriod: 'evening', defaultFrequencyDays: [0,1,3,5], priority: 5,
    },
  ],
  relationships: [
    {
      code: 'COMP-RELA-01', name: 'Conexão Real',
      description: 'Mensagem ou ligação com substância para alguém importante. Não curtida. Presença.',
      category: 'mente', habit_type: 'complement', icon: '💬', icon_key: 'social', color: '#EC4899',
      defaultDuration: 10, defaultPeriod: 'evening', defaultFrequencyDays: [1,2,3,4,5], priority: 5,
    },
    {
      code: 'COMP-RELA-02', name: 'Presença Plena',
      description: 'Tempo com alguém importante. Sem celular, sem segunda tela. Qualidade > quantidade.',
      category: 'mente', habit_type: 'complement', icon: '🤝', icon_key: 'social', color: '#F97316',
      defaultDuration: 60, defaultPeriod: 'any', defaultFrequencyDays: [6], priority: 5,
    },
  ],
};

// ============================================================================
// HABIT TEMPLATES — LAYER 7: PROFESSION BONUS
// ============================================================================

const PROFESSION_TEMPLATES: Record<string, HabitTemplate> = {
  student: {
    code: 'STUD-01', name: 'Teste Rápido de Recuperação',
    description: 'Fechar material e escrever de memória tudo que lembra. Retrieval practice = 50% mais retenção.',
    category: 'productivity', habit_type: 'support', icon: '🎓', icon_key: 'study', color: '#3B82F6',
    defaultDuration: 5, defaultPeriod: 'any', defaultFrequencyDays: [1,2,3,4,5], priority: 7, profession: 'student',
  },
  employed: {
    code: 'CLT-01', name: 'Descompressão Pós-Trabalho',
    description: 'Transição entre modo trabalho e vida. Caminhada, música. Qualidade de sono 25% melhor.',
    category: 'mente', habit_type: 'support', icon: '🌇', icon_key: 'transition', color: '#F97316',
    defaultDuration: 15, defaultPeriod: 'late_afternoon', defaultFrequencyDays: [1,2,3,4,5], priority: 7, profession: 'employed',
  },
  clt: {
    code: 'CLT-01', name: 'Descompressão Pós-Trabalho',
    description: 'Transição entre modo trabalho e vida. Caminhada, música. Qualidade de sono 25% melhor.',
    category: 'mente', habit_type: 'support', icon: '🌇', icon_key: 'transition', color: '#F97316',
    defaultDuration: 15, defaultPeriod: 'late_afternoon', defaultFrequencyDays: [1,2,3,4,5], priority: 7, profession: 'clt',
  },
  entrepreneur: {
    code: 'ENT-01', name: 'Uma hora só de estratégia',
    description: 'Sem mensagens, decisões operacionais ou incêndios. Só estratégia ou descanso. Sem isso, o modo operacional consome 100%.',
    category: 'productivity', habit_type: 'support', icon: '🏖️', icon_key: 'strategic', color: '#10B981',
    defaultDuration: 60, defaultPeriod: 'morning', defaultFrequencyDays: [1,2,3,4,5], priority: 7, profession: 'entrepreneur',
  },
};

// ============================================================================
// EXPERIENCE LIMITS
// ============================================================================

const EXPERIENCE_LIMITS: Record<string, { maxHabits: number; maxDuration: number }> = {
  never: { maxHabits: 5, maxDuration: 12 },
  tried: { maxHabits: 7, maxDuration: 25 },
  already_have: { maxHabits: 10, maxDuration: 90 },
};

// ============================================================================
// PRIORITY ORDER FOR CONFLICT RESOLUTION
// ============================================================================

const TYPE_PRIORITY: Record<string, number> = {
  anchor: 100,
  support: 60,
  directed: 50,
  complement: 30,
  rhythm: 20,
};

// ============================================================================
// HELPER: CALCULATE PERIODS FROM WAKE/SLEEP
// ============================================================================

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface DayPeriods {
  dawn: { start: number; end: number };
  morning: { start: number; end: number };
  afternoon: { start: number; end: number };
  late_afternoon: { start: number; end: number };
  evening: { start: number; end: number };
}

function calculatePeriods(wake: string, sleep: string): DayPeriods {
  const w = parseTime(wake);
  const s = parseTime(sleep);
  return {
    dawn: { start: w, end: w + 60 },
    morning: { start: w + 60, end: 720 }, // until 12:00
    afternoon: { start: 720, end: 1020 }, // 12:00-17:00
    late_afternoon: { start: 1020, end: Math.max(1020, s - 120) }, // 17:00 to sleep-2h
    evening: { start: Math.max(1020, s - 120), end: s }, // sleep-2h to sleep
  };
}

function periodToSimple(p: string): 'morning' | 'afternoon' | 'evening' {
  if (p === 'dawn' || p === 'morning') return 'morning';
  if (p === 'afternoon' || p === 'late_afternoon') return 'afternoon';
  return 'evening';
}

function getSuggestedTime(period: string, periods: DayPeriods): string {
  const p = periods[period as keyof DayPeriods];
  if (!p) return '08:00';
  // Suggest start of period + 15 min buffer
  return minutesToTime(p.start + 15);
}

// ============================================================================
// MAIN ALGORITHM
// ============================================================================

export function generateRecommendationsV2(input: GenerateInputV2): RecommendedHabitV2[] {
  const {
    quizData, wakeSleepTime, weekendDiff, lifeAreas,
    habitExperience, confirmedObjective, profession,
  } = input;

  const challenges = quizData.challenges || [];
  const energyPeak = quizData.energy_peak || 'morning';
  const periods = calculatePeriods(wakeSleepTime.wake, wakeSleepTime.sleep);
  const limits = EXPERIENCE_LIMITS[habitExperience] || EXPERIENCE_LIMITS.tried;

  // ------ LAYER 1: Objective core habits ------
  const objectiveTemplates = OBJECTIVE_TEMPLATES[confirmedObjective] || OBJECTIVE_TEMPLATES.routine;
  const candidates: Array<HabitTemplate & { score: number; sources: string[] }> = [];

  for (const t of objectiveTemplates) {
    candidates.push({ ...t, score: 80 + t.priority, sources: [`objective:${confirmedObjective}`] });
  }

  // ------ LAYER 2: Challenge support habits ------
  for (const challenge of challenges) {
    const templates = CHALLENGE_TEMPLATES[challenge];
    if (!templates) continue;
    for (const t of templates) {
      // Avoid duplicating if same code already exists
      if (candidates.some(c => c.code === t.code)) continue;
      candidates.push({ ...t, score: 60 + t.priority, sources: [`challenge:${challenge}`] });
    }
  }

  // ------ LAYER 3: Life area complements ------
  for (const area of lifeAreas) {
    const templates = LIFE_AREA_TEMPLATES[area];
    if (!templates) continue;
    for (const t of templates) {
      if (candidates.some(c => c.code === t.code)) continue;
      candidates.push({ ...t, score: 40 + t.priority, sources: [`area:${area}`] });
    }
  }

  // ------ LAYER 7: Profession bonus (added before filtering) ------
  const profKey = profession || quizData.profession;
  if (profKey && PROFESSION_TEMPLATES[profKey]) {
    const t = PROFESSION_TEMPLATES[profKey];
    if (!candidates.some(c => c.code === t.code)) {
      candidates.push({ ...t, score: 55 + t.priority, sources: [`profession:${profKey}`] });
    }
  }

  // ------ LAYER 4: Experience calibration — prune by limits ------
  // Sort by: type priority (anchor first) → score → priority
  candidates.sort((a, b) => {
    const typeDiff = (TYPE_PRIORITY[b.habit_type] || 0) - (TYPE_PRIORITY[a.habit_type] || 0);
    if (typeDiff !== 0) return typeDiff;
    return b.score - a.score;
  });

  // Filter: respect maxDuration for non-exercise non-anchor
  let filtered = candidates.filter(c => {
    if (c.habit_type === 'anchor') return true; // anchors always pass
    if (habitExperience === 'never' && c.defaultDuration > limits.maxDuration) {
      // Exception: exercise habits (directed health) can exceed
      if (c.code.startsWith('DIR-HEALTH') || c.code.startsWith('ANCHOR-HEALTH')) return true;
      return false;
    }
    return true;
  });

  // Cap total habits
  if (filtered.length > limits.maxHabits) {
    // Keep all anchors, then fill by score
    const anchors = filtered.filter(c => c.habit_type === 'anchor');
    const rest = filtered.filter(c => c.habit_type !== 'anchor');
    const remaining = limits.maxHabits - anchors.length;
    filtered = [...anchors, ...rest.slice(0, Math.max(0, remaining))];
  }

  // ------ LAYER 5: Weekly rhythm — adjust frequency days ------
  // For "never" experience: restrict to weekdays initially
  if (habitExperience === 'never') {
    for (const c of filtered) {
      if (c.habit_type !== 'anchor') {
        // Keep only weekday entries for directed/support/complement
        c.defaultFrequencyDays = c.defaultFrequencyDays.filter(d => d >= 1 && d <= 5);
        if (c.defaultFrequencyDays.length === 0) {
          // If it was weekend-only, assign to Monday or Friday
          c.defaultFrequencyDays = c.code.includes('SUN') ? [1] : [5];
        }
      }
    }
  }

  // ------ LAYER 6: Time-of-day allocation ------
  // Route habits to correct period based on energy_peak
  for (const c of filtered) {
    if (c.defaultPeriod === 'any') {
      // Assign based on energy peak
      if (energyPeak === 'morning') c.defaultPeriod = 'morning';
      else if (energyPeak === 'afternoon') c.defaultPeriod = 'afternoon';
      else c.defaultPeriod = 'late_afternoon';
    }

    // Deep focus / creative blocks follow energy peak
    if (c.code.startsWith('VAR-PROD') || c.code === 'SUPP-FOC-01') {
      if (energyPeak === 'morning') c.defaultPeriod = 'morning';
      else if (energyPeak === 'afternoon') c.defaultPeriod = 'afternoon';
      else c.defaultPeriod = 'late_afternoon';
    }

    // Exercise: secondary to focus block
    if (c.code.startsWith('DIR-HEALTH-MON') || c.code.startsWith('DIR-HEALTH-TUE')) {
      if (energyPeak === 'morning') c.defaultPeriod = 'afternoon';
      else if (energyPeak === 'evening') c.defaultPeriod = 'late_afternoon';
    }
  }

  // ------ LAYER 7: Profession micro-adaptations ------
  if (profKey === 'student') {
    // Rename focus blocks for students
    for (const c of filtered) {
      if (c.code === 'VAR-PROD-A') c.name = 'Sessão de Estudo Profundo';
    }
  }
  if (profKey === 'employed' || profKey === 'clt') {
    // Shift focus block outside commercial hours (8-18)
    for (const c of filtered) {
      if (c.code === 'VAR-PROD-A') {
        c.defaultPeriod = 'dawn'; // Before 9am or after 17
      }
    }
  }

  // ------ BUILD OUTPUT ------
  const results: RecommendedHabitV2[] = filtered.map((c, index) => {
    const simplePeriod = periodToSimple(c.defaultPeriod);
    const suggestedTime = getSuggestedTime(c.defaultPeriod, periods);

    const habit: RecommendedHabitV2 = {
      id: `v2-${c.code}-${index}`,
      name: c.name,
      description: c.description,
      category: c.category,
      habit_type: c.habit_type,
      icon: c.icon,
      icon_key: c.icon_key,
      color: c.color,
      period: simplePeriod,
      suggested_time: suggestedTime,
      duration: c.defaultDuration,
      frequency_type: c.defaultFrequencyDays.length === 7 ? 'daily' : 'fixed_days',
      frequency_days: c.defaultFrequencyDays,
      priority: c.priority,
      recommendation_score: c.score,
      recommendation_sources: c.sources,
      template_id: c.code,
    };

    // Weekend variations
    if (weekendDiff !== 'same') {
      const weekendDays = c.defaultFrequencyDays.filter(d => d === 0 || d === 6);
      if (weekendDays.length > 0) {
        // Shift weekend time by +1h
        const baseTime = parseTime(suggestedTime);
        habit.weekend_time = minutesToTime(baseTime + 60);
        // Rhythm habits get longer on weekends
        if (c.habit_type === 'rhythm' || c.code.includes('SLEEP')) {
          habit.weekend_duration = c.defaultDuration + 10;
        }
        habit.weekend_frequency_days = weekendDays;
      }
    }

    return habit;
  });

  // Sort final output: by period order (morning → afternoon → evening), then priority
  const periodOrder = { morning: 0, afternoon: 1, evening: 2 };
  results.sort((a, b) => {
    const pDiff = periodOrder[a.period] - periodOrder[b.period];
    if (pDiff !== 0) return pDiff;
    return b.priority - a.priority;
  });

  return results;
}
