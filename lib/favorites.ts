import { ItunesTrack } from "./types";

const STORAGE_KEY = "music-search-favorites";

export function getFavorites(): ItunesTrack[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addFavorite(track: ItunesTrack): void {
  const favorites = getFavorites();
  if (favorites.some((fav) => fav.trackId === track.trackId)) return;
  favorites.push(track);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Silently handle quota exceeded or other write failures
  }
}

export function removeFavorite(trackId: number): void {
  const favorites = getFavorites();
  const updated = favorites.filter((fav) => fav.trackId !== trackId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently handle quota exceeded or other write failures
  }
}

export function isFavorite(trackId: number): boolean {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.trackId === trackId);
}
