import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface NotificationMessage {
  type: "NOTIFICATION_CLICK" | "COMPLETE_HABIT_FROM_NOTIFICATION" | "NOTIFICATION_TRACKED_CLICK" | "NOTIFICATION_TRACKED_DISMISS";
  url?: string;
  habitId?: string;
  notificationHistoryId?: string;
  data?: {
    type?: string;
    period?: string;
    habitCount?: number;
    habitIds?: string[];
  };
}

/**
 * Track notification interaction in notification_history (fire-and-forget).
 */
function trackNotification(id: string, field: "opened_at" | "dismissed_at" | "completed_from_notification", value: string | boolean) {
  supabase
    .from("notification_history")
    .update({ [field]: value })
    .eq("id", id)
    .then(({ error }) => {
      if (error) console.warn("[Notification Tracking] Failed:", error.message);
    });
}

/**
 * Hook that listens for notification click messages from the Service Worker
 * and navigates to the appropriate URL when a notification is clicked.
 * Also handles completing habits and tracking click/dismiss events.
 */
export function useNotificationNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event: MessageEvent<NotificationMessage>) => {
      // Track notification click (opened_at column in notification_history)
      if (event.data?.type === "NOTIFICATION_TRACKED_CLICK" && event.data.notificationHistoryId) {
        trackNotification(event.data.notificationHistoryId, "opened_at", new Date().toISOString());
      }

      // Track notification dismiss
      if (event.data?.type === "NOTIFICATION_TRACKED_DISMISS" && event.data.notificationHistoryId) {
        trackNotification(event.data.notificationHistoryId, "dismissed_at", new Date().toISOString());
      }

      // Handle notification click navigation
      if (event.data?.type === "NOTIFICATION_CLICK") {
        const url = event.data.url || "/dashboard";
        const cleanUrl = url.replace(/^\/app/, "");
        navigate(cleanUrl);
      }

      // Handle completing habit from notification
      if (event.data?.type === "COMPLETE_HABIT_FROM_NOTIFICATION") {
        // Track completion from notification
        if (event.data.notificationHistoryId) {
          trackNotification(event.data.notificationHistoryId, "completed_from_notification", true);
        }

        window.dispatchEvent(
          new CustomEvent("habit:complete-from-notification", {
            detail: { habitId: event.data.habitId },
          })
        );
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, [navigate]);
}
