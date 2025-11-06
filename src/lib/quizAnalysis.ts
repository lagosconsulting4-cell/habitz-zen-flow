// Types for Quiz Answers
export interface QuizAnswers {
  // Step 1 - Sobre você
  ageRange: string;
  hasDiagnosis: string;
  usesMedication: string;
  energyPeriod: string;

  // Step 2 - Desafios
  challenges: string[];
  specificChallenge?: string;

  // Step 3 - Como você se sente hoje
  focusLevel: number;
  motivationLevel: number;
  overloadLevel: number;
  clarityLevel: number;
  selfEsteemLevel: number;

  // Step 4 - Preferências
  dailyTimeCommitment: string;
  preferredFormats: string[];
  environment: string;
  environmentOther?: string;

  // Step 5 - Contato
  email?: string;
  consent?: boolean;
}

export interface QuizScores {
  focusScore: number;
  motivationScore: number;
  overloadScore: number;
  clarityScore: number;
  selfEsteemScore: number;
  challengesCount: number;
  totalScore: number;
}

export interface DiagnosisResult {
  type: 'desatento' | 'hiperativo' | 'combinado';
  title: string;
  description: string;
  primarySymptoms: string[];
  probabilityScore: number;
  suggestedHabits: string[];
  rewardStrategy: string;
}

// Calculate scores from answers
export function calculateScores(answers: QuizAnswers): QuizScores {
  const focusScore = answers.focusLevel * 20; // 1-5 -> 20-100
  const motivationScore = answers.motivationLevel * 20;
  const overloadScore = answers.overloadLevel * 20;
  const clarityScore = answers.clarityLevel * 20;
  const selfEsteemScore = answers.selfEsteemLevel * 20;
  const challengesCount = answers.challenges.length;

  // Total score is an average weighted by importance
  const totalScore = Math.round(
    (focusScore * 0.25 +
     motivationScore * 0.2 +
     (100 - overloadScore) * 0.25 + // Inverted because high overload is bad
     clarityScore * 0.15 +
     selfEsteemScore * 0.15)
  );

  return {
    focusScore,
    motivationScore,
    overloadScore,
    clarityScore,
    selfEsteemScore,
    challengesCount,
    totalScore
  };
}

// Determine TDAH type based on challenges and scores
export function getDiagnosisType(answers: QuizAnswers, scores: QuizScores): 'desatento' | 'hiperativo' | 'combinado' {
  const { challenges } = answers;
  const { focusScore, overloadScore, motivationScore } = scores;

  const desatentoIndicators = [
    'Procrastinação',
    'Desorganização mental',
    'Falta de foco',
    'Sono/desgaste'
  ];

  const hiperativoIndicators = [
    'Impulsividade',
    'Desorganização física',
    'Relacionamentos/Comunicação',
    'Ansiedade/sobrecarga'
  ];

  const desatentoCount = challenges.filter(c => desatentoIndicators.includes(c)).length;
  const hiperativoCount = challenges.filter(c => hiperativoIndicators.includes(c)).length;

  // If similar counts or both high, it's combinado
  if (Math.abs(desatentoCount - hiperativoCount) <= 1 && (desatentoCount >= 2 || hiperativoCount >= 2)) {
    return 'combinado';
  }

  // If focus is very low (<=40) and overload is high (>=60), likely desatento
  if (focusScore <= 40 && overloadScore >= 60) {
    return 'desatento';
  }

  // If overload and challenges are more hiperativo-oriented
  if (hiperativoCount > desatentoCount && overloadScore >= 60) {
    return 'hiperativo';
  }

  // Default to desatento if focus-related issues dominate
  if (desatentoCount >= hiperativoCount) {
    return 'desatento';
  }

  return 'hiperativo';
}

// Map total score to probability of improvement
export function mapScoreToProbability(totalScore: number, challengesCount: number): number {
  // Base probability starts at 70%
  let probability = 70;

  // Lower score means more room for improvement
  if (totalScore < 40) {
    probability = 94;
  } else if (totalScore < 50) {
    probability = 91;
  } else if (totalScore < 60) {
    probability = 87;
  } else if (totalScore < 70) {
    probability = 83;
  } else if (totalScore < 80) {
    probability = 78;
  } else {
    probability = 73;
  }

  // More challenges identified = more actionable = slightly higher probability
  if (challengesCount >= 5) {
    probability = Math.min(probability + 3, 95);
  }

  return probability;
}

// Get primary symptoms based on diagnosis type
export function getPrimarySymptoms(type: 'desatento' | 'hiperativo' | 'combinado', answers: QuizAnswers): string[] {
  const symptomMap = {
    desatento: [
      'Dificuldade em manter foco em tarefas',
      'Esquecimento de compromissos e detalhes',
      'Procrastinação frequente',
      'Desorganização mental',
      'Dificuldade em concluir tarefas iniciadas'
    ],
    hiperativo: [
      'Inquietude e agitação constante',
      'Impulsividade em decisões',
      'Dificuldade em relaxar ou desacelerar',
      'Fala excessiva ou interrupções',
      'Necessidade de estar sempre em movimento'
    ],
    combinado: [
      'Procrastinação crônica',
      'Oscilações de humor',
      'Desorganização generalizada',
      'Dificuldade em manter rotinas',
      'Sobrecarga mental e física'
    ]
  };

  const baseSymptoms = symptomMap[type];

  // Add specific symptoms based on user's challenges
  const additionalSymptoms = answers.challenges.slice(0, 3);

  // Combine and return top 5 unique symptoms
  const allSymptoms = [...new Set([...baseSymptoms.slice(0, 3), ...additionalSymptoms, ...baseSymptoms.slice(3)])];

  return allSymptoms.slice(0, 5);
}

// Get suggested mini-habits based on diagnosis
export function getSuggestedHabits(type: 'desatento' | 'hiperativo' | 'combinado', answers: QuizAnswers): string[] {
  const habitMap = {
    desatento: [
      'Anotar uma tarefa importante ao acordar',
      'Usar timer de 10 minutos para tarefas difíceis',
      'Revisar agenda antes de dormir'
    ],
    hiperativo: [
      'Fazer 5 respirações profundas ao sentir agitação',
      'Pausar 30 segundos antes de tomar decisões importantes',
      'Alongamento rápido a cada 2 horas'
    ],
    combinado: [
      'Escolher UMA prioridade do dia pela manhã',
      'Fazer micro-pausas de 2 minutos a cada hora',
      'Check-in emocional antes de dormir'
    ]
  };

  return habitMap[type];
}

// Get reward strategy based on diagnosis
export function getRewardStrategy(type: 'desatento' | 'hiperativo' | 'combinado'): string {
  const rewardMap = {
    desatento: 'Celebre cada tarefa concluída com um check visual. Use adesivos ou marcadores coloridos para registrar suas pequenas vitórias.',
    hiperativo: 'Recompense-se com movimento! Após concluir uma tarefa, permita-se 5 minutos de atividade física ou algo que goste.',
    combinado: 'Sistema de pontos flexível: acumule pontos por hábitos e troque por recompensas que você define no início da semana.'
  };

  return rewardMap[type];
}

// Generate complete diagnosis result
export function generateDiagnosisResult(answers: QuizAnswers): DiagnosisResult {
  const scores = calculateScores(answers);
  const type = getDiagnosisType(answers, scores);
  const probabilityScore = mapScoreToProbability(scores.totalScore, scores.challengesCount);
  const primarySymptoms = getPrimarySymptoms(type, answers);
  const suggestedHabits = getSuggestedHabits(type, answers);
  const rewardStrategy = getRewardStrategy(type);

  const titles = {
    desatento: 'Perfil Desatento',
    hiperativo: 'Perfil Hiperativo',
    combinado: 'Perfil Combinado'
  };

  const descriptions = {
    desatento: 'Você tende a dispersar e esquecer detalhes importantes do dia a dia. Sua mente viaja, e manter o foco sustentado é um desafio constante.',
    hiperativo: 'Você tem energia alta, inquietude e dificuldade de desacelerar. A agitação física e mental faz parte da sua rotina.',
    combinado: 'Você enfrenta uma mistura de desafios de atenção e hiperatividade. Oscila entre momentos de dispersão e agitação intensa.'
  };

  return {
    type,
    title: titles[type],
    description: descriptions[type],
    primarySymptoms,
    probabilityScore,
    suggestedHabits,
    rewardStrategy
  };
}
