/**
 * Lightweight Performance Monitoring using native Performance API
 * No external dependencies - uses built-in browser APIs
 */

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fcp?: number; // First Contentful Paint
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

type MetricCallback = (metric: { name: string; value: number }) => void;

// Store metrics for later retrieval
const metrics: PerformanceMetrics = {};

// Default callback - logs to console in development
const defaultCallback: MetricCallback = (metric) => {
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms`);
  }
};

/**
 * Initialize performance monitoring
 * Call this once in your app entry point
 */
export function initPerformanceMonitoring(
  callback: MetricCallback = defaultCallback,
  postHogCallback?: MetricCallback
): void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return;
  }

  // Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      if (lastEntry) {
        metrics.lcp = lastEntry.startTime;
        callback({ name: "LCP", value: lastEntry.startTime });
        postHogCallback?.({ name: "LCP", value: lastEntry.startTime });
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    // LCP not supported
  }

  // First Contentful Paint (FCP)
  try {
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcpEntry = entries.find((e) => e.name === "first-contentful-paint");
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
        callback({ name: "FCP", value: fcpEntry.startTime });
        postHogCallback?.({ name: "FCP", value: fcpEntry.startTime });
      }
    });
    fcpObserver.observe({ type: "paint", buffered: true });
  } catch {
    // Paint timing not supported
  }

  // Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
      metrics.cls = clsValue;
      callback({ name: "CLS", value: clsValue * 1000 }); // Convert to ms-like scale for display
      postHogCallback?.({ name: "CLS", value: clsValue * 1000 });
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch {
    // CLS not supported
  }

  // Time to First Byte (TTFB) from Navigation Timing
  try {
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navEntry) {
      metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
      callback({ name: "TTFB", value: metrics.ttfb });
      postHogCallback?.({ name: "TTFB", value: metrics.ttfb });
    }
  } catch {
    // Navigation timing not supported
  }
}

/**
 * Get collected metrics
 */
export function getMetrics(): PerformanceMetrics {
  return { ...metrics };
}

/**
 * Report metrics to an analytics endpoint
 */
export function reportMetrics(endpoint: string): void {
  if (Object.keys(metrics).length === 0) return;

  const body = JSON.stringify({
    url: window.location.href,
    timestamp: Date.now(),
    metrics,
  });

  // Use sendBeacon for reliable delivery even when page is closing
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, body);
  } else {
    fetch(endpoint, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
  }
}
