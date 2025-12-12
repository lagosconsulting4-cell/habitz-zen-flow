/**
 * Custom tracking hook that wraps PostHog for consistent event tracking
 * Uses the official usePostHog hook from @posthog/react
 */
import { useCallback } from "react";
import { usePostHog } from "@posthog/react";

export const useTracking = () => {
  const posthog = usePostHog();

  /**
   * Track a custom event with optional properties
   */
  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      if (!posthog) return;

      posthog.capture(eventName, {
        ...properties,
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
      });

      if (import.meta.env.DEV) {
        console.log(`[PostHog] ${eventName}`, properties);
      }
    },
    [posthog]
  );

  /**
   * Track CTA button clicks
   */
  const trackCTA = useCallback(
    (location: string, label?: string) => {
      trackEvent("cta_click", {
        location,
        label,
        button_type: "primary",
      });
    },
    [trackEvent]
  );

  /**
   * Track quiz step progression
   */
  const trackQuizStep = useCallback(
    (step: number, totalSteps: number, action: "view" | "complete") => {
      trackEvent("quiz_step", {
        step,
        total_steps: totalSteps,
        action,
        progress_percentage: Math.round(((step + 1) / totalSteps) * 100),
      });
    },
    [trackEvent]
  );

  /**
   * Track scroll depth milestones
   */
  const trackScrollDepth = useCallback(
    (depth: number) => {
      trackEvent("scroll_depth", {
        depth_percentage: depth,
        page_section: depth > 75 ? "bottom" : depth > 50 ? "middle" : "top",
      });
    },
    [trackEvent]
  );

  /**
   * Track quiz modal interactions
   */
  const trackQuizModal = useCallback(
    (action: "opened" | "closed") => {
      trackEvent(`quiz_modal_${action}`, {
        action,
      });
    },
    [trackEvent]
  );

  /**
   * Track quiz completion
   */
  const trackQuizCompleted = useCallback(
    (quizData: {
      objective?: string;
      time_available?: string;
      work_schedule?: string;
      energy_peak?: string;
      challenges_count?: number;
      week_days_count?: number;
    }) => {
      trackEvent("quiz_completed", quizData);
    },
    [trackEvent]
  );

  /**
   * Track routine generation
   */
  const trackRoutineGenerated = useCallback(
    (habitsCount: number) => {
      trackEvent("routine_generated", {
        habits_count: habitsCount,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackCTA,
    trackQuizStep,
    trackScrollDepth,
    trackQuizModal,
    trackQuizCompleted,
    trackRoutineGenerated,
  };
};
