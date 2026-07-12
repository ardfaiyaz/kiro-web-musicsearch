const RATINGS_STORAGE_KEY = "music-search-ratings";

export interface RatingEntry {
  trackId: number;
  rating: number; // 1-5
  updatedAt: number;
}

export function getRatings(): Record<number, RatingEntry> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(RATINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveRatings(ratings: Record<number, RatingEntry>): void {
  try {
    localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(ratings));
  } catch {
    // localStorage might be full
  }
}

export function setRating(trackId: number, rating: number): void {
  if (typeof window === "undefined") return;
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  const ratings = getRatings();
  if (clamped === 0) {
    delete ratings[trackId];
  } else {
    ratings[trackId] = { trackId, rating: clamped, updatedAt: Date.now() };
  }
  saveRatings(ratings);
}

export function getRating(trackId: number): number {
  const ratings = getRatings();
  return ratings[trackId]?.rating || 0;
}

export function removeRating(trackId: number): void {
  if (typeof window === "undefined") return;
  const ratings = getRatings();
  delete ratings[trackId];
  saveRatings(ratings);
}

export function getTopRatedTracks(): RatingEntry[] {
  const ratings = getRatings();
  return Object.values(ratings)
    .sort((a, b) => b.rating - a.rating || b.updatedAt - a.updatedAt);
}
