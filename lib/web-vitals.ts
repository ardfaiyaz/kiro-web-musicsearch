/**
 * Web Vitals reporting module using native PerformanceObserver API.
 * Captures LCP, CLS, FCP, and TTFB metrics without external dependencies.
 * Stores results in localStorage under key 'music-web-vitals'.
 */

const STORAGE_KEY = "music-web-vitals";

interface WebVitalsMetrics {
  lcp: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  timestamp: number;
}

function getStoredMetrics(): WebVitalsMetrics {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as WebVitalsMetrics;
    }
  } catch {
    // Ignore parse errors
  }
  return { lcp: null, cls: null, fcp: null, ttfb: null, timestamp: Date.now() };
}

function storeMetrics(metrics: Partial<WebVitalsMetrics>): void {
  try {
    const current = getStoredMetrics();
    const updated = { ...current, ...metrics, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

function observeLCP(): void {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        storeMetrics({ lcp: lastEntry.startTime });
      }
    });
    observer.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    // Observer not supported for this entry type
  }
}

function observeCLS(): void {
  if (!("PerformanceObserver" in window)) return;

  let clsValue = 0;

  try {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const layoutShiftEntry = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
          clsValue += layoutShiftEntry.value;
          storeMetrics({ cls: clsValue });
        }
      }
    });
    observer.observe({ type: "layout-shift", buffered: true });
  } catch {
    // Observer not supported for this entry type
  }
}

function observeFCP(): void {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          storeMetrics({ fcp: entry.startTime });
          observer.disconnect();
        }
      }
    });
    observer.observe({ type: "paint", buffered: true });
  } catch {
    // Observer not supported for this entry type
  }
}

function measureTTFB(): void {
  try {
    const navigationEntries = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0];
      const ttfb = navEntry.responseStart - navEntry.requestStart;
      storeMetrics({ ttfb });
    }
  } catch {
    // Navigation timing not available
  }
}

/**
 * Starts collecting Web Vitals metrics.
 * Call this function once on page load to begin monitoring.
 */
export function reportWebVitals(): void {
  if (typeof window === "undefined") return;

  observeLCP();
  observeCLS();
  observeFCP();
  measureTTFB();
}
