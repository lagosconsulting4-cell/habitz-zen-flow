import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "habitz:app-session";
const FALLBACK_SESSION = "00000000-0000-0000-0000-000000000000";

const generateUuid = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const segment = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${segment()}${segment()}-${segment()}-${segment()}-${segment()}-${segment()}${segment()}${segment()}`;
};

const ensureSessionId = () => {
  if (typeof window === "undefined") {
    return FALLBACK_SESSION;
  }
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }
  const generated = generateUuid();
  window.localStorage.setItem(SESSION_KEY, generated);
  return generated;
};

export const useAppMetrics = () => {
  const sessionIdRef = useRef<string>(ensureSessionId());

  const track = useCallback(async (event: string, meta?: Record<string, unknown>) => {
    if (typeof window === "undefined") {
      return;
    }

    const payload = {
      event,
      session_id: sessionIdRef.current,
      meta: {
        ...(meta ?? {}),
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      await supabase.from("landing_events").insert(payload);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("App event tracking failed", error);
      }
    }
  }, []);

  const getSessionId = useCallback(() => {
    return sessionIdRef.current;
  }, []);

  return { track, getSessionId };
};

export default useAppMetrics;
