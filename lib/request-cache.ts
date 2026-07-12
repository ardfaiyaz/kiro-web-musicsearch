/**
 * In-flight request deduplication.
 * If the same API URL is currently being fetched, returns the existing
 * Promise instead of making a new request. Uses a Map of URL -> Promise.
 */

const inflightRequests = new Map<string, Promise<Response>>();

/**
 * Deduplicated fetch - if the same URL is already being fetched,
 * returns the same Promise. Once resolved, the entry is removed
 * so subsequent calls make fresh requests.
 */
export function deduplicatedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // Create a cache key from the URL and relevant options
  const method = options?.method?.toUpperCase() || "GET";
  const cacheKey = `${method}:${url}`;

  // Only deduplicate GET requests
  if (method !== "GET") {
    return fetch(url, options);
  }

  const existing = inflightRequests.get(cacheKey);
  if (existing) {
    // Clone the response since each consumer needs their own body
    return existing.then((response) => response.clone());
  }

  const request = fetch(url, options).then((response) => {
    // Remove from cache once settled
    inflightRequests.delete(cacheKey);
    return response;
  }).catch((error) => {
    inflightRequests.delete(cacheKey);
    throw error;
  });

  inflightRequests.set(cacheKey, request);
  return request.then((response) => response.clone());
}

/**
 * Get the number of currently in-flight requests.
 * Useful for debugging and monitoring.
 */
export function getInflightCount(): number {
  return inflightRequests.size;
}

/**
 * Clear all in-flight request entries.
 * Useful for cleanup or testing.
 */
export function clearInflightCache(): void {
  inflightRequests.clear();
}
