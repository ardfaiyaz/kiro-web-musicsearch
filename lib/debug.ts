/**
 * Debug utilities for tracking API response times, cache hits, and render counts.
 * Data is stored in memory and optionally persisted to sessionStorage.
 */

const SESSION_KEY = "music-debug-stats";

export interface DebugMetrics {
  apiCalls: Array<{
    url: string;
    duration: number;
    status: number;
    timestamp: number;
    cached: boolean;
  }>;
  cacheHits: number;
  cacheMisses: number;
  renderCounts: Record<string, number>;
  memoryUsage: number | null;
  lastUpdated: number;
}

const defaultMetrics: DebugMetrics = {
  apiCalls: [],
  cacheHits: 0,
  cacheMisses: 0,
  renderCounts: {},
  memoryUsage: null,
  lastUpdated: Date.now(),
};

let metrics: DebugMetrics = { ...defaultMetrics };

function persist(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(metrics));
  } catch {
    // Ignore storage errors
  }
}

export function loadDebugMetrics(): DebugMetrics {
  if (typeof window === "undefined") return defaultMetrics;
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      metrics = JSON.parse(stored) as DebugMetrics;
      return metrics;
    }
  } catch {
    // Ignore parse errors
  }
  return metrics;
}

export function trackApiCall(
  url: string,
  duration: number,
  status: number,
  cached: boolean
): void {
  metrics.apiCalls = [
    { url, duration, status, timestamp: Date.now(), cached },
    ...metrics.apiCalls.slice(0, 49),
  ];
  if (cached) {
    metrics.cacheHits++;
  } else {
    metrics.cacheMisses++;
  }
  metrics.lastUpdated = Date.now();
  persist();
}

export function trackRender(componentName: string): void {
  metrics.renderCounts[componentName] =
    (metrics.renderCounts[componentName] || 0) + 1;
  metrics.lastUpdated = Date.now();
  persist();
}

export function getMemoryUsage(): number | null {
  if (typeof window === "undefined") return null;
  const perf = performance as Performance & {
    memory?: { usedJSHeapSize: number };
  };
  if (perf.memory) {
    const usage = perf.memory.usedJSHeapSize;
    metrics.memoryUsage = usage;
    return usage;
  }
  return null;
}

export function getDebugMetrics(): DebugMetrics {
  getMemoryUsage();
  return { ...metrics };
}

export function resetDebugMetrics(): void {
  metrics = { ...defaultMetrics, lastUpdated: Date.now() };
  persist();
}

export function getAverageApiTime(): number {
  if (metrics.apiCalls.length === 0) return 0;
  const total = metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0);
  return Math.round(total / metrics.apiCalls.length);
}

export function getCacheHitRate(): number {
  const total = metrics.cacheHits + metrics.cacheMisses;
  if (total === 0) return 0;
  return Math.round((metrics.cacheHits / total) * 100);
}
