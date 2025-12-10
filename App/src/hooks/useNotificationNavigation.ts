import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface NotificationClickMessage {
  type: "NOTIFICATION_CLICK" | "COMPLETE_HABIT_FROM_NOTIFICATION";
  url?: string;
  habitId?: string;
  data?: {
    type?: string;
    period?: string;
    habitCount?: number;
    habitIds?: string[];
  };
}

/**
 * Hook that listens for notification click messages from the Service Worker
 * and navigates to the appropriate URL when a notification is clicked.
 * Also handles completing habits directly from notifications.
 */
export function useNotificationNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event: MessageEvent<NotificationClickMessage>) => {
      // Handle notification click navigation
      if (event.data?.type === "NOTIFICATION_CLICK") {
        console.log("[App] Notification click received:", event.data);

        const url = event.data.url || "/dashboard";

        // Remove /app prefix if present (since we're already in /app base)
        const cleanUrl = url.replace(/^\/app/, "");

        // Navigate to the URL
        navigate(cleanUrl);

        // If there's habit data, we could show a toast or highlight habits
        if (event.data.data?.habitCount) {
          console.log(
            `[App] ${event.data.data.habitCount} pending habits from ${event.data.data.period}`
          );
        }
      }

      // Handle completing habit from notification
      if (event.data?.type === "COMPLETE_HABIT_FROM_NOTIFICATION") {
        console.log(
          "[App] Habit completion request received from notification:",
          event.data.habitId
        );

        // Dispatch a custom event that can be caught by components with useHabits
        window.dispatchEvent(
          new CustomEvent("habit:complete-from-notification", {
            detail: { habitId: event.data.habitId },
          })
        );
      }
    };

    // Listen for messages from Service Worker
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, [navigate]);
}
