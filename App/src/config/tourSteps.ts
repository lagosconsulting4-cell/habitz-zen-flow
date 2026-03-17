// ============================================================================
// TOUR STEPS CONFIG
// 6 steps — target data-tour attributes in the app:
// NavigationBar: "today", "habits", "journeys"
// Profile.tsx:   "avatar", "resources", "bonus"
// ============================================================================

export interface TourStep {
  /** Route to navigate to before showing this step */
  page: string;
  /** [data-tour] attribute value on the target element */
  target: string;
  title: string;
  copy: string;
  /**
   * Where the step card appears relative to the spotlight:
   *   "above" → card floats above the highlighted element (use for bottom-of-screen targets)
   *   "below" → card floats below the highlighted element (use for top-of-screen targets)
   */
  cardPosition: "above" | "below";
  /** Scroll the target into view before measuring rect (for Profile elements) */
  scrollIntoView?: boolean;
}

export const TOUR_STEPS: TourStep[] = [
  {
    page: "/dashboard",
    target: "today",
    title: "Aqui começa o dia.",
    copy: "Todos os seus hábitos ficam aqui. Um toque para marcar como feito. Simples assim.",
    cardPosition: "above",
  },
  {
    page: "/journeys",
    target: "journeys",
    title: "Sua missão de 30 dias.",
    copy: "Cada jornada tem hábitos diários específicos esperando por você. É aqui que você acompanha o progresso.",
    cardPosition: "above",
  },
  {
    page: "/habits",
    target: "habits",
    title: "A sua rotina, do seu jeito.",
    copy: "Adicione, edite ou reorganize seus hábitos quando quiser. A rotina é sua — o Bora só ajuda a manter.",
    cardPosition: "above",
  },
  {
    page: "/profile",
    target: "avatar",
    title: "Você evolui de verdade aqui.",
    copy: "A cada hábito completado, seu avatar avança. É uma forma visual de ver quem você está se tornando.",
    cardPosition: "below",
    scrollIntoView: true,
  },
  {
    page: "/profile",
    target: "resources",
    title: "Proteja sua sequência.",
    copy: "Gems são ganhas completando hábitos. Use-as para comprar Streak Freezes, que protegem seu progresso quando você perder um dia.",
    cardPosition: "above",
    scrollIntoView: true,
  },
  {
    page: "/profile",
    target: "bonus",
    title: "Tem mais coisa aqui dentro.",
    copy: "Livros recomendados, meditações guiadas e conteúdos para ir além. Disponíveis sempre que quiser.",
    cardPosition: "above",
    scrollIntoView: true,
  },
];
