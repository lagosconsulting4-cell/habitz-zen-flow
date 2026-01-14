import { useEffect, useState } from "react";

interface UseExitIntentOptions {
  enabled?: boolean;
  threshold?: number; // pixels from top to trigger
  delay?: number; // delay in ms before enabling
  sessionKey?: string; // localStorage key for session tracking
}

export const useExitIntent = (options: UseExitIntentOptions = {}) => {
  const {
    enabled = true,
    threshold = 10,
    delay = 3000,
    sessionKey = "exitIntentShown",
  } = options;

  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Check if already shown in this session
    const hasShown = sessionStorage.getItem(sessionKey);
    if (hasShown === "true") return;

    let delayTimer: NodeJS.Timeout;
    let isDelayPassed = false;

    // Wait for delay before enabling exit detection
    delayTimer = setTimeout(() => {
      isDelayPassed = true;
    }, delay);

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if delay has passed
      if (!isDelayPassed) return;

      // Check if mouse is leaving through the top (closing tab, URL bar, etc.)
      if (e.clientY <= threshold && e.relatedTarget === null) {
        setIsExiting(true);
        sessionStorage.setItem(sessionKey, "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(delayTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enabled, threshold, delay, sessionKey]);

  const reset = () => {
    setIsExiting(false);
    sessionStorage.removeItem(sessionKey);
  };

  return { isExiting, reset };
};
