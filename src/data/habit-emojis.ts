export const HABIT_EMOJIS = [
  "💡",
  "🧘",
  "🏋️",
  "📚",
  "💼",
  "❤️",
  "💰",
  "🛌",
  "🚶",
  "📝",
  "🥗",
  "🎧",
  "🌿",
  "🏃",
  "🧠",
  "☀️",
  "🌙",
  "📖",
  "🧴",
  "🧹"
] as const;

type EmojiTuple = typeof HABIT_EMOJIS;
export type HabitEmoji = EmojiTuple[number];
