import { RecentSearch } from "./types";

const STORAGE_KEY = "music-search-recent";
const MAX_RECENT = 10;

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  if (typeof window === "undefined") return;
  const trimmed = query.trim();
  if (!trimmed) return;

  try {
    const existing = getRecentSearches();
    const filtered = existing.filter(
      (s) => s.query.toLowerCase() !== trimmed.toLowerCase()
    );
    const updated: RecentSearch[] = [
      { query: trimmed, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be unavailable
  }
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage might be unavailable
  }
}
