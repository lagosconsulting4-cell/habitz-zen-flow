import { useCallback, useEffect, useState } from "react";
import { setSoundPreferences, isSoundsEnabled, getVolume } from "@/lib/sounds";

type GridOrderMode = "pending_first" | "streak";
type SoundOption = "default" | "soft" | "bright";

export interface AppPreferences {
  // Notifications
  notificationsEnabled: boolean;

  // Sound settings
  defaultSound: SoundOption;
  soundEnabled: boolean;
  soundVolume: number; // 0.0 - 1.0

  // Feedback settings
  hapticEnabled: boolean;
  celebrationsEnabled: boolean; // Visual effects (glow, particles)

  // Display settings
  gridOrder: GridOrderMode;
}

const STORAGE_KEY = "habitz:preferences";

const defaultPrefs: AppPreferences = {
  notificationsEnabled: true,
  defaultSound: "default",
  soundEnabled: true,
  soundVolume: 0.7,
  hapticEnabled: true,
  celebrationsEnabled: true,
  gridOrder: "pending_first",
};

const loadPrefs = (): AppPreferences => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPrefs;
    const parsed = JSON.parse(raw);
    return { ...defaultPrefs, ...parsed };
  } catch {
    return defaultPrefs;
  }
};

export const useAppPreferences = () => {
  const [prefs, setPrefs] = useState<AppPreferences>(defaultPrefs);

  useEffect(() => {
    const loaded = loadPrefs();
    setPrefs(loaded);

    // Sync sound settings with sounds library
    setSoundPreferences(loaded.soundEnabled, loaded.soundVolume);
  }, []);

  const updatePrefs = useCallback((next: Partial<AppPreferences>) => {
    setPrefs((prev) => {
      const merged = { ...prev, ...next };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

      // Sync sound settings if they changed
      if (next.soundEnabled !== undefined || next.soundVolume !== undefined) {
        setSoundPreferences(merged.soundEnabled, merged.soundVolume);
      }

      return merged;
    });
  }, []);

  return {
    prefs,
    setPreferences: updatePrefs,
  };
};

export default useAppPreferences;
