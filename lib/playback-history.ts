import { ItunesTrack } from "@/lib/types";

const STORAGE_KEY = "playback-history";
const MAX_HISTORY = 50;

export interface PlaybackHistoryEntry {
  track: ItunesTrack;
  timestamp: number;
  progressSeconds: number;
}

function getHistory(): PlaybackHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PlaybackHistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(history: PlaybackHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function addToPlaybackHistory(
  track: ItunesTrack,
  progressSeconds: number = 0
): void {
  const history = getHistory();
  // Remove any existing entry for the same track
  const filtered = history.filter((e) => e.track.trackId !== track.trackId);
  filtered.unshift({ track, timestamp: Date.now(), progressSeconds });
  saveHistory(filtered);
}

export function updatePlaybackProgress(
  trackId: number,
  progressSeconds: number
): void {
  const history = getHistory();
  const entry = history.find((e) => e.track.trackId === trackId);
  if (entry) {
    entry.progressSeconds = progressSeconds;
    entry.timestamp = Date.now();
    saveHistory(history);
  }
}

export function getLastPlayed(): PlaybackHistoryEntry | null {
  const history = getHistory();
  return history[0] || null;
}

export function getContinueListening(): PlaybackHistoryEntry | null {
  const history = getHistory();
  // Find the most recent track that had progress (was not completed)
  const recent = history.find(
    (e) =>
      e.progressSeconds > 2 &&
      Date.now() - e.timestamp < 7 * 24 * 60 * 60 * 1000 // within 7 days
  );
  return recent || null;
}

export function getRecentlyPlayed(limit: number = 10): PlaybackHistoryEntry[] {
  return getHistory().slice(0, limit);
}
