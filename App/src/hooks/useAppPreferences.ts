import { useCallback, useEffect, useState } from "react";

type GridOrderMode = "pending_first" | "streak";
type SoundOption = "default" | "soft" | "bright";

export interface AppPreferences {
  notificationsEnabled: boolean;
  defaultSound: SoundOption;
  gridOrder: GridOrderMode;
}

const STORAGE_KEY = "habitz:preferences";

const defaultPrefs: AppPreferences = {
  notificationsEnabled: true,
  defaultSound: "default",
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
    setPrefs(loadPrefs());
  }, []);

  const updatePrefs = useCallback((next: Partial<AppPreferences>) => {
    setPrefs((prev) => {
      const merged = { ...prev, ...next };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  return {
    prefs,
    setPreferences: updatePrefs,
  };
};

export default useAppPreferences;
