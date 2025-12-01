import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface NotificationClickMessage {
  type: "NOTIFICATION_CLICK";
  url: string;
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
 */
export function useNotificationNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event: MessageEvent<NotificationClickMessage>) => {
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
    };

    // Listen for messages from Service Worker
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, [navigate]);
}
