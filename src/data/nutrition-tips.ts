export interface NutritionTip {
  id: number;
  title: string;
  description: string;
  premium_only: boolean;
  impact: "Leve" | "Moderado" | "Alto";
  meal_time: string;
}

export const nutritionTips: NutritionTip[] = [
  // MANHÃ
  {
    id: 1,
    title: "Café preto + proteína",
    description: "Esquece pão com margarina. Café puro + ovos ou shake de proteína.",
    premium_only: false,
    impact: "Alto",
    meal_time: "Manhã"
  },
  {
    id: 2,
    title: "Come proteína antes do carbo", 
    description: "Evita pico de açúcar no sangue e dá mais saciedade.",
    premium_only: false,
    impact: "Moderado",
    meal_time: "Manhã"
  },
  {
    id: 3,
    title: "Água + sal marinho ao acordar",
    description: "Reidrata o corpo e regula eletrólitos após jejum noturno.",
    premium_only: true,
    impact: "Leve",
    meal_time: "Manhã"
  },

  // ALMOÇO / JANTA
  {
    id: 4,
    title: "Regra do prato funcional",
    description: "1/2 vegetais, 1/4 proteína magra, 1/4 carboidrato bom.",
    premium_only: false,
    impact: "Alto",
    meal_time: "Almoço"
  },
  {
    id: 5,
    title: "Arroz + ovo nunca falha",
    description: "Combinação simples, completa e econômica para energia.",
    premium_only: false,
    impact: "Moderado", 
    meal_time: "Almoço"
  },
  {
    id: 6,
    title: "Evita líquido com refeição grande",
    description: "Atrasa digestão. Bebe antes da refeição ou 40min depois.",
    premium_only: true,
    impact: "Moderado",
    meal_time: "Almoço"
  },

  // DIA TODO / ROTINA
  {
    id: 7,
    title: "Coma igual todos os dias",
    description: "A mente ama padrão e o corpo responde melhor à consistência.",
    premium_only: true,
    impact: "Alto",
    meal_time: "Dia todo"
  },
  {
    id: 8,
    title: "Evite açúcar escondido",
    description: "Sucos, iogurtes adoçados e barras. Adoçado = sabotado.",
    premium_only: false,
    impact: "Alto", 
    meal_time: "Dia todo"
  },
  {
    id: 9,
    title: "Tire o industrializado por 1 semana",
    description: "Vai parecer detox, mas é só comer comida de verdade.",
    premium_only: false,
    impact: "Alto",
    meal_time: "Dia todo"
  },
  {
    id: 10,
    title: "Lanche: fruta com proteína",
    description: "Maçã + castanhas ou banana + pasta de amendoim. Energia sustentada.",
    premium_only: false,
    impact: "Leve",
    meal_time: "Lanche"
  },

  // PRÉ/PÓS TREINO
  {
    id: 11,
    title: "Pré-treino: banana + café",
    description: "Energia natural, eficiente e econômica para o treino.",
    premium_only: false,
    impact: "Moderado",
    meal_time: "Pré-treino"
  },
  {
    id: 12,
    title: "Pós-treino: arroz + frango ou shake com banana",
    description: "Reposição rápida de glicogênio e proteína para recuperação.",
    premium_only: true,
    impact: "Alto",
    meal_time: "Pós-treino"
  }
];