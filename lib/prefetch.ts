/**
 * Predictive prefetching utility - prefetches routes on hover
 * using requestIdleCallback for non-blocking execution.
 */

const prefetchedUrls = new Set<string>();

/**
 * Schedule a prefetch during idle time using requestIdleCallback.
 * Falls back to setTimeout if requestIdleCallback is not available.
 */
export function schedulePrefetch(url: string, prefetchFn: () => void): void {
  if (prefetchedUrls.has(url)) return;
  prefetchedUrls.add(url);

  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(
      () => {
        prefetchFn();
      },
      { timeout: 2000 }
    );
  } else {
    setTimeout(prefetchFn, 100);
  }
}

/**
 * Check if a URL has already been prefetched.
 */
export function isPrefetched(url: string): boolean {
  return prefetchedUrls.has(url);
}

/**
 * Reset prefetch cache (useful for testing or memory management).
 */
export function resetPrefetchCache(): void {
  prefetchedUrls.clear();
}
