import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPerformanceMonitoring } from "./lib/performance";
import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";

// Initialize PostHog
posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  defaults: "2025-11-30",
  capture_pageview: true, // Auto-capture page views
  capture_pageleave: true, // Track when users leave pages
  disable_session_recording: import.meta.env.DEV, // Disable in development
  loaded: (posthog) => {
    if (import.meta.env.DEV) {
      console.log("[PostHog] Initialized successfully");
      posthog.opt_out_capturing(); // Don't track in development
    }
  },
});

// Initialize performance monitoring with PostHog callback
initPerformanceMonitoring(undefined, (metric) => {
  if (!import.meta.env.DEV) {
    // Only send performance metrics in production
    posthog.capture("performance_metric", {
      metric_name: metric.name,
      metric_value: metric.value,
      page: window.location.pathname,
    });
  }
});

createRoot(document.getElementById("root")!).render(
  <PostHogProvider client={posthog}>
    <App />
  </PostHogProvider>
);
