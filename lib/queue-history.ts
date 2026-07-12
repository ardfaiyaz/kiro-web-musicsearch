import { ItunesTrack } from "./types";

const QUEUE_HISTORY_KEY = "music-search-queue-history";
const MAX_QUEUE_HISTORY = 50;

export interface QueueHistoryEntry {
  track: ItunesTrack;
  playedAt: number;
}

export function getQueueHistory(): QueueHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = sessionStorage.getItem(QUEUE_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToQueueHistory(track: ItunesTrack): void {
  if (typeof window === "undefined") return;
  try {
    const history = getQueueHistory();
    // Don't add duplicates back-to-back
    if (history.length > 0 && history[0].track.trackId === track.trackId) {
      return;
    }
    const entry: QueueHistoryEntry = { track, playedAt: Date.now() };
    const updated = [entry, ...history].slice(0, MAX_QUEUE_HISTORY);
    sessionStorage.setItem(QUEUE_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // sessionStorage might be full or unavailable
  }
}

export function clearQueueHistory(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(QUEUE_HISTORY_KEY);
  } catch {
    // sessionStorage might be unavailable
  }
}
