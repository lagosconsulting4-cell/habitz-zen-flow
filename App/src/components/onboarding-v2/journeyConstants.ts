/**
 * Journey Constants — Dominant copy mappings + compatibility matrix
 *
 * DOMINANT_COPY: signal_key → personalized one-liner per journey (from Doc3)
 * COMPATIBILITY: 10 combinations of 2 journeys → compatibility note
 */

// ============================================================================
// DOMINANT COPY PER JOURNEY
// ============================================================================

export const DOMINANT_COPY: Record<string, Record<string, string>> = {
  'own-mornings-l1': {
    early_waker: "Você já acorda cedo. Agora a gente transforma isso numa rotina.",
    avoiding_feeling: "Você sente que o dia começa errado. Aqui é onde isso muda.",
    long_promising: "Cinco anos prometendo mudar a manhã. Essa jornada foi feita pra isso.",
    tiredness_challenge: "Seu cansaço começa antes do dia. Essa jornada resolve isso pela raiz.",
    default: "Sua manhã é o lugar onde tudo começa. Essa jornada constrói ela do zero.",
  },
  'gym-l1': {
    tried_habit: "Você já tentou antes. Essa jornada foi desenhada pra quem desistiu uma vez.",
    motivation_challenge: "Motivação vai e vem. Essa jornada te dá um sistema que funciona sem ela.",
    long_promising: "Você sabe que precisa se mover. Essa jornada tira você do zero em 30 dias.",
    frustrated_feeling: "Frustração com o corpo é o começo de algo. Essa jornada transforma isso.",
    default: "30 dias. Academia sem medo. Hábito de treino consolidado.",
  },
  'focus-protocol-l1': {
    focus_challenge: "Você sabe o que precisa fazer mas não consegue começar. Essa jornada resolve exatamente isso.",
    procrastination_challenge: "Você sabe o que precisa fazer mas não consegue começar. Essa jornada resolve exatamente isso.",
    student: "Estudar exige foco profundo. Essa jornada constrói esse músculo em 30 dias.",
    independent_work: "Cada hora de foco profundo vale por três horas fragmentadas. Essa jornada te dá isso.",
    resigned_feeling: "Você parou de acreditar que consegue focar. Essa jornada vai provar o contrário.",
    default: "Foco não é talento. É um sistema. Essa jornada te dá o sistema.",
  },
  'finances-l1': {
    young_age: "Ninguém ensinou você a lidar com dinheiro. Essa jornada faz isso em 30 dias.",
    long_promising: "Você sabe que precisa organizar as finanças. Essa jornada finalmente coloca isso em prática.",
    avoid_objective: "Gastos automáticos e impulsos financeiros têm padrão. Essa jornada te ajuda a encontrar e quebrar o seu.",
    forgetfulness_challenge: "Esquecimento financeiro custa caro. Essa jornada cria o sistema que lembra por você.",
    default: "Terminar o mês sabendo pra onde foi cada real. Esse é o resultado dessa jornada.",
  },
  'digital-detox-l1': {
    avoid_objective: "Você sabe que o celular tá te custando mais do que você percebe. Essa jornada muda a equação.",
    anxiety_challenge: "Ansiedade e uso compulsivo de tela se alimentam. Essa jornada quebra esse ciclo.",
    avoiding_feeling: "Você evita as coisas importantes e vai pro celular no lugar. Essa jornada inverte isso.",
    focus_challenge: "Você perde o fio antes de começar. Essa jornada recupera sua atenção de dentro pra fora.",
    default: "30 dias para reduzir o screen time pela metade e começar a usar o celular. Não ser usado por ele.",
  },
};

/**
 * Get the personalized one-liner for a journey card.
 * Uses the dominant signal to pick the most relevant copy.
 * Falls back to "default" for that journey.
 */
export function getDominantCopy(slug: string, dominantSignal: string | undefined): string {
  const journeyCopy = DOMINANT_COPY[slug];
  if (!journeyCopy) return '';
  if (dominantSignal && journeyCopy[dominantSignal]) {
    return journeyCopy[dominantSignal];
  }
  return journeyCopy.default || '';
}

// ============================================================================
// COMPATIBILITY MATRIX (10 combinations of 2 journeys)
// ============================================================================

interface CompatibilityEntry {
  level: 'Alta' | 'Média' | 'Baixa';
  copy: string;
}

// Canonical key: sorted slugs joined by '+'
const COMPATIBILITY: Record<string, CompatibilityEntry> = {
  'focus-protocol-l1+own-mornings-l1': {
    level: 'Alta',
    copy: 'As duas se alimentam. Manhã estruturada cria o ambiente para foco profundo.',
  },
  'gym-l1+own-mornings-l1': {
    level: 'Alta',
    copy: 'Muita gente treina de manhã. Essas duas se encaixam naturalmente.',
  },
  'digital-detox-l1+focus-protocol-l1': {
    level: 'Alta',
    copy: 'Foco e detox digital são duas faces do mesmo problema. Combinação poderosa.',
  },
  'digital-detox-l1+own-mornings-l1': {
    level: 'Alta',
    copy: 'Manhã sem tela é o coração de ambas. Sinergia total.',
  },
  'finances-l1+gym-l1': {
    level: 'Média',
    copy: 'Projetos diferentes, sem conflito direto. Exige disciplina pra não deixar um engolir o outro.',
  },
  'finances-l1+own-mornings-l1': {
    level: 'Média',
    copy: 'Rotina de manhã + controle financeiro. Funciona melhor pra quem já tem alguma base.',
  },
  'digital-detox-l1+gym-l1': {
    level: 'Média',
    copy: 'Substituir tempo de tela por movimento é uma das combinações mais eficazes.',
  },
  'finances-l1+focus-protocol-l1': {
    level: 'Média',
    copy: 'Foco e finanças compartilham o mesmo músculo: fazer o que é importante antes do urgente.',
  },
  'focus-protocol-l1+gym-l1': {
    level: 'Baixa',
    copy: 'Duas jornadas de alta exigência de execução. Funciona melhor pra quem já tem alguma base.',
  },
  'digital-detox-l1+finances-l1': {
    level: 'Baixa',
    copy: 'Pouca sinergia direta. Não há conflito, mas a atenção fica muito dividida.',
  },
};

/**
 * Get the compatibility note when 2 journeys are selected.
 * Keys are normalized by sorting slugs alphabetically.
 */
export function getCompatibilityNote(slugA: string, slugB: string): CompatibilityEntry | null {
  const key = [slugA, slugB].sort().join('+');
  return COMPATIBILITY[key] || null;
}
