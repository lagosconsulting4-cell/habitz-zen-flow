/**
 * Quiz Scoring System
 *
 * Cada pergunta tem 4 opções, ordenadas da pior para a melhor situação:
 * - Opção 1 (index 0) = pior situação = 3 pontos
 * - Opção 2 (index 1) = ruim = 2 pontos
 * - Opção 3 (index 2) = médio = 1 ponto
 * - Opção 4 (index 3) = melhor situação = 0 pontos
 *
 * Score total: 0-30 pontos
 * - 0-10 = "Leve" (verde) - Já tem bons hábitos, precisa de organização
 * - 11-20 = "Moderado" (amarelo) - Precisa de ajuda para criar consistência
 * - 21-30 = "Severo" (vermelho) - Urgente transformar sua rotina
 */

export interface QuizAnswer {
  questionIndex: number;
  optionIndex: number;
  optionText: string;
}

export type SeverityLevel = "leve" | "moderado" | "severo";

export interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  severity: SeverityLevel;
  title: string;
  description: string;
  color: string;
  emoji: string;
}

// Pontuação por índice da opção selecionada (0 = pior, 3 = melhor)
const OPTION_SCORES = [3, 2, 1, 0];

// Configuração dos níveis de severidade
const SEVERITY_CONFIG: Record<SeverityLevel, {
  minScore: number;
  maxScore: number;
  title: string;
  description: string;
  color: string;
  emoji: string;
}> = {
  leve: {
    minScore: 0,
    maxScore: 10,
    title: "Nível Leve",
    description: "Você já tem bons hábitos! Com um pouco mais de organização, você pode alcançar resultados extraordinários.",
    color: "emerald",
    emoji: "🌱",
  },
  moderado: {
    minScore: 11,
    maxScore: 20,
    title: "Nível Moderado",
    description: "Você tem potencial, mas precisa de um sistema para criar consistência. O BORA foi feito para você!",
    color: "amber",
    emoji: "⚡",
  },
  severo: {
    minScore: 21,
    maxScore: 30,
    title: "Nível Urgente",
    description: "Sua rotina precisa de uma transformação. A boa notícia? O BORA pode te ajudar em apenas 7 minutos por dia.",
    color: "red",
    emoji: "🔥",
  },
};

/**
 * Calcula a pontuação de uma única resposta
 */
export function calculateAnswerScore(optionIndex: number): number {
  return OPTION_SCORES[optionIndex] ?? 0;
}

/**
 * Calcula o score total a partir das respostas
 */
export function calculateTotalScore(answers: Record<number, string>, questions: { options: string[] }[]): number {
  let totalScore = 0;

  for (const [questionIndexStr, selectedOption] of Object.entries(answers)) {
    const questionIndex = parseInt(questionIndexStr, 10);
    const question = questions[questionIndex];

    if (question) {
      const optionIndex = question.options.indexOf(selectedOption);
      if (optionIndex !== -1) {
        totalScore += calculateAnswerScore(optionIndex);
      }
    }
  }

  return totalScore;
}

/**
 * Determina o nível de severidade baseado no score
 */
export function getSeverityLevel(score: number): SeverityLevel {
  if (score <= 10) return "leve";
  if (score <= 20) return "moderado";
  return "severo";
}

/**
 * Gera o resultado completo do quiz
 */
export function getQuizResult(answers: Record<number, string>, questions: { options: string[] }[]): QuizResult {
  const score = calculateTotalScore(answers, questions);
  const maxScore = questions.length * 3; // 3 pontos máximo por questão
  const percentage = Math.round((score / maxScore) * 100);
  const severity = getSeverityLevel(score);
  const config = SEVERITY_CONFIG[severity];

  return {
    score,
    maxScore,
    percentage,
    severity,
    title: config.title,
    description: config.description,
    color: config.color,
    emoji: config.emoji,
  };
}

/**
 * Identifica as áreas mais críticas baseado nas respostas
 */
export function getCriticalAreas(answers: Record<number, string>, questions: { options: string[]; question: string }[]): string[] {
  const criticalAreas: string[] = [];

  for (const [questionIndexStr, selectedOption] of Object.entries(answers)) {
    const questionIndex = parseInt(questionIndexStr, 10);
    const question = questions[questionIndex];

    if (question) {
      const optionIndex = question.options.indexOf(selectedOption);
      // Se escolheu as duas piores opções (índice 0 ou 1), é uma área crítica
      if (optionIndex <= 1) {
        criticalAreas.push(question.question);
      }
    }
  }

  return criticalAreas;
}

/**
 * Gera mensagem personalizada baseada no score
 */
export function getPersonalizedMessage(result: QuizResult): string {
  switch (result.severity) {
    case "leve":
      return `Com ${result.score} pontos, você está no caminho certo! O BORA vai te ajudar a organizar seus hábitos e alcançar resultados ainda melhores.`;
    case "moderado":
      return `Com ${result.score} pontos, você tem potencial para mais! O BORA vai te dar a estrutura que falta para criar consistência de verdade.`;
    case "severo":
      return `Com ${result.score} pontos, é hora de agir agora! O BORA pode transformar sua rotina em apenas 7 minutos por dia. Não perca mais tempo.`;
    default:
      return "";
  }
}

/**
 * Armazena o resultado do quiz na sessionStorage
 */
export function saveQuizResult(result: QuizResult, answers: Record<number, string>): void {
  if (typeof window === "undefined") return;

  sessionStorage.setItem("bora_quiz_result", JSON.stringify(result));
  sessionStorage.setItem("bora_quiz_answers", JSON.stringify(answers));
}

/**
 * Recupera o resultado do quiz da sessionStorage
 */
export function getStoredQuizResult(): QuizResult | null {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem("bora_quiz_result");
  if (stored) {
    try {
      return JSON.parse(stored) as QuizResult;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Recupera as respostas do quiz da sessionStorage
 */
export function getStoredQuizAnswers(): Record<number, string> | null {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem("bora_quiz_answers");
  if (stored) {
    try {
      return JSON.parse(stored) as Record<number, string>;
    } catch {
      return null;
    }
  }
  return null;
}
