import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

// Event names for type safety
export type EventName =
  | "habit_created"
  | "habit_completed"
  | "habit_uncompleted"
  | "habit_deleted"
  | "habit_updated"
  | "onboarding_started"
  | "onboarding_step"
  | "onboarding_completed"
  | "page_view"
  | "notification_clicked"
  | "notification_permission_granted"
  | "notification_permission_denied"
  | "checkin_submitted"
  | "timer_started"
  | "timer_completed"
  | "timer_cancelled"
  | "level_up"
  | "streak_milestone"
  | "perfect_day";

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

// Singleton instance for tracking without hooks
let globalSessionId: string | null = null;
let globalUserId: string | null = null;

export const setGlobalSessionId = (sessionId: string | null) => {
  globalSessionId = sessionId;
};

export const setGlobalUserId = (userId: string | null) => {
  globalUserId = userId;
};

/**
 * Track an event without requiring hook context.
 * Useful for tracking events from within other hooks or callbacks.
 */
export const trackEventGlobal = async (
  eventName: EventName,
  properties?: EventProperties,
  screen?: string
): Promise<void> => {
  if (!globalUserId) {
    console.debug("[EventTracker] No user, skipping event:", eventName);
    return;
  }

  try {
    const { error } = await supabase.from("events").insert({
      user_id: globalUserId,
      session_id: globalSessionId,
      event_name: eventName,
      event_properties: properties || {},
      screen: screen || getCurrentScreen(),
    });

    if (error) {
      console.error("[EventTracker] Failed to track event:", error);
    } else {
      console.debug("[EventTracker] Tracked:", eventName, properties);
    }
  } catch (err) {
    console.error("[EventTracker] Error tracking event:", err);
  }
};

/**
 * Get current screen/route name from URL
 */
const getCurrentScreen = (): string => {
  const path = window.location.pathname;
  if (path === "/" || path === "/dashboard") return "dashboard";
  if (path === "/create") return "create_habit";
  if (path === "/progress") return "progress";
  if (path === "/my-habits") return "my_habits";
  if (path === "/settings") return "settings";
  if (path.startsWith("/edit/")) return "edit_habit";
  if (path.startsWith("/onboarding")) return "onboarding";
  return path.replace(/^\//, "").replace(/\//g, "_") || "unknown";
};

/**
 * Hook for tracking user events.
 * Events are stored in the `events` table for analytics.
 */
export const useEventTracker = () => {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);

  // Update global user ID when user changes
  if (user?.id !== globalUserId) {
    setGlobalUserId(user?.id || null);
  }

  /**
   * Set the current session ID (called from useSessionTracker)
   */
  const setSessionId = useCallback((sessionId: string | null) => {
    sessionIdRef.current = sessionId;
    setGlobalSessionId(sessionId);
  }, []);

  /**
   * Track an event
   */
  const trackEvent = useCallback(
    async (
      eventName: EventName,
      properties?: EventProperties,
      screen?: string
    ): Promise<void> => {
      if (!user?.id) {
        console.debug("[EventTracker] No user, skipping event:", eventName);
        return;
      }

      try {
        const { error } = await supabase.from("events").insert({
          user_id: user.id,
          session_id: sessionIdRef.current,
          event_name: eventName,
          event_properties: properties || {},
          screen: screen || getCurrentScreen(),
        });

        if (error) {
          console.error("[EventTracker] Failed to track event:", error);
        } else {
          console.debug("[EventTracker] Tracked:", eventName, properties);
        }
      } catch (err) {
        console.error("[EventTracker] Error tracking event:", err);
      }
    },
    [user?.id]
  );

  /**
   * Track a page view
   */
  const trackPageView = useCallback(
    (pageName?: string) => {
      trackEvent("page_view", { page: pageName || getCurrentScreen() });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    setSessionId,
  };
};
