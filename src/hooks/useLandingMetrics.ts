import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "habitz:landing-session";
const FALLBACK_SESSION = "00000000-0000-0000-0000-000000000000";

type MetaPayload = {
  path?: string;
  search?: string;
  hash?: string;
  referrer?: string | null;
  utm?: Record<string, string> | null;
  viewport?: { width: number; height: number };
  userAgent?: string;
};

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

const collectMeta = (): MetaPayload | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const { innerWidth, innerHeight } = window;
  const { pathname, search, hash } = window.location;
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
    const value = params.get(key);
    if (value) {
      utm[key] = value;
    }
  });

  return {
    path: pathname,
    search,
    hash,
    referrer: document.referrer || null,
    utm: Object.keys(utm).length > 0 ? utm : null,
    viewport: { width: innerWidth, height: innerHeight },
    userAgent: navigator.userAgent,
  };
};

export const useLandingMetrics = () => {
  const sessionIdRef = useRef<string>(ensureSessionId());

  useEffect(() => {
    const meta = collectMeta();
    if (!meta) {
      return;
    }
    void supabase
      .from("landing_events")
      .insert({
        event: "pageview",
        session_id: sessionIdRef.current,
        meta,
      })
      .catch(() => null);
  }, []);

  const track = useCallback(
    (event: string, meta?: Record<string, unknown>) => {
      if (typeof window === "undefined") {
        return Promise.resolve();
      }
      const payload = {
        event,
        session_id: sessionIdRef.current,
        meta: {
          ...(meta ?? {}),
          path: window.location.pathname,
        },
      };
      return supabase
        .from("landing_events")
        .insert(payload)
        .then(() => undefined)
        .catch(() => undefined);
    },
    [],
  );

  return track;
};

export default useLandingMetrics;
