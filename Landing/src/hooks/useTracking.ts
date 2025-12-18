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

  // ===== PAYMENT TRACKING =====

  /**
   * Track payment method selected
   */
  const trackPaymentMethodSelected = useCallback(
    (method: 'pix' | 'credit_card', price: number) => {
      trackEvent("payment_method_selected", { method, price });
    },
    [trackEvent]
  );

  /**
   * Track PIX QR code generation
   */
  const trackPixQRGenerated = useCallback(
    (data: { transaction_id: string; external_id: string; amount: number; expires_at: string }) => {
      trackEvent("pix_qr_generated", data);
    },
    [trackEvent]
  );

  /**
   * Track PIX code copied
   */
  const trackPixCodeCopied = useCallback(
    (transaction_id: string) => {
      trackEvent("pix_code_copied", { transaction_id });
    },
    [trackEvent]
  );

  /**
   * Track payment completed
   */
  const trackPaymentCompleted = useCallback(
    (data: { transaction_id: string; amount: number; method: 'pix' | 'credit_card' }) => {
      trackEvent("payment_completed", data);
    },
    [trackEvent]
  );

  /**
   * Track checkout redirect (for credit card via Kirvano)
   */
  const trackCheckoutRedirect = useCallback(
    (method: 'credit_card', destination: string, price: number) => {
      trackEvent("checkout_redirect", { method, destination, price });
    },
    [trackEvent]
  );

  // ===== QUIZ DEEP INSIGHTS =====

  /**
   * Track individual quiz answer selection
   */
  const trackQuizAnswer = useCallback(
    (data: { step: number; question_text: string; answer_text: string; answer_index: number; time_on_question?: number }) => {
      trackEvent("quiz_answer_selected", data);
    },
    [trackEvent]
  );

  /**
   * Track quiz abandonment
   */
  const trackQuizAbandoned = useCallback(
    (data: { last_step: number; total_steps: number; time_spent: number; answers_given: number }) => {
      trackEvent("quiz_abandoned", data);
    },
    [trackEvent]
  );

  // ===== OFFER PAGE INTERACTIONS =====

  /**
   * Track offer page view
   */
  const trackOfferViewed = useCallback(
    (entry_point?: string, quiz_score?: number) => {
      trackEvent("offer_page_viewed", { entry_point, quiz_score });
    },
    [trackEvent]
  );

  /**
   * Track countdown expiration
   */
  const trackCountdownExpired = useCallback(
    (page: string) => {
      trackEvent("countdown_expired", { page });
    },
    [trackEvent]
  );

  /**
   * Track FAQ expansion
   */
  const trackFAQExpanded = useCallback(
    (question_index: number, question_text: string) => {
      trackEvent("faq_expanded", { question_index, question_text });
    },
    [trackEvent]
  );

  /**
   * Track offer CTA clicks
   */
  const trackOfferCTAClick = useCallback(
    (location: 'hero' | 'pricing' | 'final', button_text: string) => {
      trackEvent("offer_cta_click", { location, button_text });
    },
    [trackEvent]
  );

  // ===== ONBOARDING TRACKING =====

  /**
   * Track password creation flow
   */
  const trackPasswordCreation = useCallback(
    (status: 'started' | 'success' | 'error', details?: Record<string, any>) => {
      trackEvent(`password_creation_${status}`, details);
    },
    [trackEvent]
  );

  /**
   * Track app redirect
   */
  const trackAppRedirect = useCallback(
    (destination_url: string) => {
      trackEvent("app_redirect_initiated", { destination_url });
    },
    [trackEvent]
  );

  // ===== QUIZ REMODEL TRACKING =====

  /**
   * Track feedback screen views with dynamic variables
   */
  const trackFeedbackView = useCallback(
    (feedbackType: string, dynamicVars?: Record<string, string>) => {
      trackEvent("quiz_feedback_view", {
        feedback_type: feedbackType,
        dynamic_variables: dynamicVars,
      });
    },
    [trackEvent]
  );

  /**
   * Track chart component views
   */
  const trackChartView = useCallback(
    (chartType: "age" | "comparison" | "progress", userSegment?: string) => {
      trackEvent("quiz_chart_view", {
        chart_type: chartType,
        user_segment: userSegment,
      });
    },
    [trackEvent]
  );

  /**
   * Track PWA install prompt shown
   */
  const trackPWAPromptShown = useCallback(() => {
    trackEvent("pwa_install_prompt_shown", {});
  }, [trackEvent]);

  /**
   * Track PWA installation status
   */
  const trackPWAInstalled = useCallback(
    (success: boolean, method?: 'prompt' | 'manual') => {
      trackEvent("pwa_installed", {
        success,
        installation_method: method,
      });
    },
    [trackEvent]
  );

  /**
   * Track urgency screen with personalized data
   */
  const trackUrgencyScreenView = useCallback(
    (sentiment: string, difficulty: string, currentDay: number) => {
      trackEvent("quiz_urgency_view", {
        user_sentiment: sentiment,
        primary_difficulty: difficulty,
        current_day_of_year: currentDay,
      });
    },
    [trackEvent]
  );

  /**
   * Track testimonials section view
   */
  const trackTestimonialsView = useCallback(
    (testimonialsCount: number) => {
      trackEvent("quiz_testimonials_view", {
        testimonials_shown: testimonialsCount,
      });
    },
    [trackEvent]
  );

  /**
   * Track phone number entry
   */
  const trackPhoneEntered = useCallback(
    (hasPhone: boolean) => {
      trackEvent("quiz_phone_entered", {
        phone_provided: hasPhone,
      });
    },
    [trackEvent]
  );

  /**
   * Track complete data collection
   */
  const trackDataCollectionComplete = useCallback(
    (fields: string[]) => {
      trackEvent("quiz_data_collection_complete", {
        fields_collected: fields,
        total_fields: fields.length,
      });
    },
    [trackEvent]
  );

  /**
   * Track quiz step with enhanced context and dynamic variables
   */
  const trackQuizStepWithVariables = useCallback(
    (
      step: number,
      stepName: string,
      selectedValue: string | string[],
      dynamicVariables?: Record<string, string>
    ) => {
      trackEvent("quiz_step_detailed", {
        step,
        step_name: stepName,
        selected_value: selectedValue,
        dynamic_variables: dynamicVariables,
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
    // Payment tracking
    trackPaymentMethodSelected,
    trackPixQRGenerated,
    trackPixCodeCopied,
    trackPaymentCompleted,
    trackCheckoutRedirect,
    // Quiz deep insights
    trackQuizAnswer,
    trackQuizAbandoned,
    // Offer interactions
    trackOfferViewed,
    trackCountdownExpired,
    trackFAQExpanded,
    trackOfferCTAClick,
    // Onboarding
    trackPasswordCreation,
    trackAppRedirect,
    // Quiz Remodel
    trackFeedbackView,
    trackChartView,
    trackPWAPromptShown,
    trackPWAInstalled,
    trackUrgencyScreenView,
    trackTestimonialsView,
    trackPhoneEntered,
    trackDataCollectionComplete,
    trackQuizStepWithVariables,
  };
};
