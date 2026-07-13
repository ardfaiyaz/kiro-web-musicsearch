/**
 * Stale-while-revalidate caching implementation.
 * Returns cached results instantly from memory/localStorage, then
 * fetches fresh data in the background and updates when ready.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

// In-memory cache for fast access
const memoryCache = new Map<string, CacheEntry<unknown>>();

// Default max age: 5 minutes for stale data
const DEFAULT_MAX_AGE_MS = 5 * 60 * 1000;
// Default stale time: 1 minute before revalidation
const DEFAULT_STALE_TIME_MS = 60 * 1000;

interface SWROptions {
  /** Time in ms before data is considered stale and needs revalidation */
  staleTime?: number;
  /** Maximum age in ms before cached data is considered expired */
  maxAge?: number;
  /** Storage key prefix for localStorage persistence */
  storagePrefix?: string;
}

type Subscriber<T> = (data: T) => void;

const subscribers = new Map<string, Set<Subscriber<unknown>>>();

/**
 * Subscribe to updates for a specific cache key.
 * The callback is invoked when fresh data arrives from revalidation.
 */
export function subscribe<T>(key: string, callback: Subscriber<T>): () => void {
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());
  }
  const subs = subscribers.get(key)!;
  subs.add(callback as Subscriber<unknown>);

  return () => {
    subs.delete(callback as Subscriber<unknown>);
    if (subs.size === 0) {
      subscribers.delete(key);
    }
  };
}

function notifySubscribers<T>(key: string, data: T): void {
  const subs = subscribers.get(key);
  if (subs) {
    for (const callback of subs) {
      callback(data);
    }
  }
}

/**
 * Get data from the SWR cache.
 * Returns cached data (possibly stale) immediately, and triggers
 * a background revalidation if the data is stale.
 */
export async function swrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: SWROptions = {}
): Promise<T> {
  const {
    staleTime = DEFAULT_STALE_TIME_MS,
    maxAge = DEFAULT_MAX_AGE_MS,
    storagePrefix = "swr",
  } = options;

  const now = Date.now();

  // Check memory cache first
  const memEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memEntry) {
    const age = now - memEntry.timestamp;

    if (age < staleTime) {
      // Fresh: return immediately, no revalidation needed
      return memEntry.data;
    }

    if (age < maxAge) {
      // Stale but not expired: return cached, revalidate in background
      revalidateInBackground(key, fetcher, storagePrefix);
      return memEntry.data;
    }
    // Expired: fall through to fetch
  }

  // Check localStorage if not in memory
  const stored = getFromStorage<T>(key, storagePrefix);
  if (stored) {
    const age = now - stored.timestamp;

    // Store in memory for faster future access
    memoryCache.set(key, stored);

    if (age < maxAge) {
      // Return stale data from storage, revalidate in background
      revalidateInBackground(key, fetcher, storagePrefix);
      return stored.data;
    }
  }

  // No cache or expired: fetch fresh data
  const freshData = await fetcher();
  const entry: CacheEntry<T> = { data: freshData, timestamp: now, key };
  memoryCache.set(key, entry as CacheEntry<unknown>);
  saveToStorage(key, entry, storagePrefix);
  return freshData;
}

/**
 * Revalidate data in the background without blocking.
 */
function revalidateInBackground<T>(
  key: string,
  fetcher: () => Promise<T>,
  storagePrefix: string
): void {
  // Use queueMicrotask or setTimeout to avoid blocking
  setTimeout(async () => {
    try {
      const freshData = await fetcher();
      const entry: CacheEntry<T> = {
        data: freshData,
        timestamp: Date.now(),
        key,
      };
      memoryCache.set(key, entry as CacheEntry<unknown>);
      saveToStorage(key, entry, storagePrefix);
      notifySubscribers(key, freshData);
    } catch {
      // Silently fail - stale data is still available
    }
  }, 0);
}

/**
 * Manually invalidate a cache entry, forcing the next access to fetch fresh data.
 */
export function invalidate(key: string, storagePrefix = "swr"): void {
  memoryCache.delete(key);
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(`${storagePrefix}:${key}`);
    } catch {
      // Silently handle errors
    }
  }
}

/**
 * Manually set data in the cache (useful for optimistic updates).
 */
export function setCache<T>(
  key: string,
  data: T,
  storagePrefix = "swr"
): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now(), key };
  memoryCache.set(key, entry as CacheEntry<unknown>);
  saveToStorage(key, entry, storagePrefix);
  notifySubscribers(key, data);
}

/**
 * Clear all SWR cache entries.
 */
export function clearSWRCache(): void {
  memoryCache.clear();
}

// --- Storage helpers ---

function getFromStorage<T>(
  key: string,
  prefix: string
): CacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${prefix}:${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

function saveToStorage<T>(
  key: string,
  entry: CacheEntry<T>,
  prefix: string
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${prefix}:${key}`, JSON.stringify(entry));
  } catch {
    // Silently handle quota exceeded - memory cache still works
  }
}
