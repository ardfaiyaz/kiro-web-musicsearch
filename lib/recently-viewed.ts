export interface RecentlyViewedItem {
  type: "artist" | "album";
  id: number;
  name: string;
  artwork: string;
  timestamp: number;
}

const STORAGE_KEY = "music-recently-viewed";
const MAX_ITEMS = 12;

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: Omit<RecentlyViewedItem, "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyViewed();
    // Remove duplicate (same type + id)
    const filtered = existing.filter(
      (entry) => !(entry.type === item.type && entry.id === item.id)
    );
    const updated: RecentlyViewedItem[] = [
      { ...item, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be unavailable
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage might be unavailable
  }
}
