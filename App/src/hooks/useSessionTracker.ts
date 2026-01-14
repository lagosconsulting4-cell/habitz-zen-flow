import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "1.0.0";

const getDeviceType = (): "mobile" | "desktop" | "tablet" => {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

const getPlatform = (): string => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "web";
};

export const useSessionTracker = () => {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const startSession = useCallback(async () => {
    if (!user?.id || sessionIdRef.current) return;

    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          user_id: user.id,
          device_type: getDeviceType(),
          platform: getPlatform(),
          app_version: APP_VERSION,
        })
        .select("id")
        .single();

      if (error) throw error;

      sessionIdRef.current = data.id;
      startTimeRef.current = new Date();
      console.log("📊 Session started:", data.id);
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  }, [user?.id]);

  const endSession = useCallback(async () => {
    if (!sessionIdRef.current || !startTimeRef.current) return;

    const durationSeconds = Math.floor(
      (new Date().getTime() - startTimeRef.current.getTime()) / 1000
    );

    try {
      await supabase
        .from("sessions")
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq("id", sessionIdRef.current);

      console.log("📊 Session ended:", sessionIdRef.current, `(${durationSeconds}s)`);
    } catch (err) {
      console.error("Failed to end session:", err);
    } finally {
      sessionIdRef.current = null;
      startTimeRef.current = null;
    }
  }, []);

  // Start session when user logs in
  useEffect(() => {
    if (user?.id) {
      startSession();
    } else {
      endSession();
    }
  }, [user?.id, startSession, endSession]);

  // End session on visibility change or page unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        endSession();
      } else if (document.visibilityState === "visible" && user?.id) {
        startSession();
      }
    };

    const handleBeforeUnload = () => {
      endSession();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user?.id, startSession, endSession]);

  return { sessionId: sessionIdRef.current };
};
