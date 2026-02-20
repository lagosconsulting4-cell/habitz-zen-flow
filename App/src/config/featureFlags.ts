const rawHideGamification = import.meta.env.VITE_HIDE_GAMIFICATION;

/**
 * When true, all gamification UI (XP/levels/toasts) should be hidden.
 * Defaults to true so the feature is opt-in via `VITE_HIDE_GAMIFICATION=false`.
 */
export const hideGamification = rawHideGamification !== "false";

/**
 * When true, the Journeys feature is visible.
 * Defaults to true (enabled). Set `VITE_SHOW_JOURNEYS=false` to hide.
 */
export const showJourneys = import.meta.env.VITE_SHOW_JOURNEYS !== "false";
