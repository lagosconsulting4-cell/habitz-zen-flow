export type BonusModuleId = "plano" | "guided" | "meditation" | "books" | "tips";

const rawFlags: Record<BonusModuleId, string | undefined> = {
  plano: import.meta.env.VITE_SHOW_BONUS_PLANO,
  guided: import.meta.env.VITE_SHOW_BONUS_GUIDED,
  meditation: import.meta.env.VITE_SHOW_BONUS_MEDITATION,
  books: import.meta.env.VITE_SHOW_BONUS_BOOKS,
  tips: import.meta.env.VITE_SHOW_BONUS_TIPS,
};

export const bonusFlags: Record<BonusModuleId, boolean> = {
  plano: rawFlags.plano !== "false",
  guided: rawFlags.guided !== "false",
  meditation: rawFlags.meditation !== "false",
  books: rawFlags.books !== "false",
  tips: rawFlags.tips !== "false",
};

export const isBonusEnabled = (id: BonusModuleId) => bonusFlags[id] !== false;
