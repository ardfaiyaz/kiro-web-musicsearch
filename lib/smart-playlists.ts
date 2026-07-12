import { ItunesTrack } from "./types";
import { getListeningHistory, HistoryEntry } from "./personalization";

export interface SmartPlaylist {
  id: string;
  name: string;
  description: string;
  rule: "top-week" | "recently-discovered" | "most-played-genre";
  tracks: ItunesTrack[];
}

function getTracksFromHistory(entries: HistoryEntry[]): ItunesTrack[] {
  return entries.map((entry) => ({
    trackId: entry.trackId,
    trackName: entry.trackName,
    artistName: entry.artistName,
    artistId: 0,
    collectionName: entry.albumName,
    artworkUrl100: entry.artworkUrl,
    previewUrl: entry.previewUrl,
    primaryGenreName: entry.primaryGenreName,
    releaseDate: "",
    trackTimeMillis: entry.duration,
    trackViewUrl: "",
    collectionViewUrl: "",
    kind: "song",
    wrapperType: "track",
  }));
}

function getTopSongsThisWeek(history: HistoryEntry[]): ItunesTrack[] {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentEntries = history.filter((e) => e.playedAt >= oneWeekAgo);

  const playCounts = new Map<number, { count: number; entry: HistoryEntry }>();
  for (const entry of recentEntries) {
    const existing = playCounts.get(entry.trackId);
    if (existing) {
      existing.count++;
    } else {
      playCounts.set(entry.trackId, { count: 1, entry });
    }
  }

  const sorted = Array.from(playCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return getTracksFromHistory(sorted.map((s) => s.entry));
}

function getRecentlyDiscovered(history: HistoryEntry[]): ItunesTrack[] {
  const seen = new Set<number>();
  const firstPlays: HistoryEntry[] = [];

  // History is ordered most recent first
  const reversed = [...history].reverse();
  for (const entry of reversed) {
    if (!seen.has(entry.trackId)) {
      seen.add(entry.trackId);
      firstPlays.push(entry);
    }
  }

  // Get the most recently first-played tracks
  const recent = firstPlays.slice(-20).reverse();
  return getTracksFromHistory(recent);
}

function getMostPlayedGenre(history: HistoryEntry[]): ItunesTrack[] {
  const genreCounts = new Map<string, number>();
  for (const entry of history) {
    if (entry.primaryGenreName) {
      const count = genreCounts.get(entry.primaryGenreName) || 0;
      genreCounts.set(entry.primaryGenreName, count + 1);
    }
  }

  let topGenre = "";
  let maxCount = 0;
  for (const [genre, count] of genreCounts) {
    if (count > maxCount) {
      topGenre = genre;
      maxCount = count;
    }
  }

  if (!topGenre) return [];

  const genreEntries = history.filter(
    (e) => e.primaryGenreName === topGenre
  );
  const unique = new Map<number, HistoryEntry>();
  for (const entry of genreEntries) {
    if (!unique.has(entry.trackId)) {
      unique.set(entry.trackId, entry);
    }
  }

  return getTracksFromHistory(Array.from(unique.values()).slice(0, 20));
}

export function getSmartPlaylists(): SmartPlaylist[] {
  const history = getListeningHistory();

  if (history.length === 0) return [];

  const playlists: SmartPlaylist[] = [];

  const topWeek = getTopSongsThisWeek(history);
  if (topWeek.length > 0) {
    playlists.push({
      id: "smart-top-week",
      name: "Top Songs This Week",
      description: "Your most played tracks from the past 7 days",
      rule: "top-week",
      tracks: topWeek,
    });
  }

  const discovered = getRecentlyDiscovered(history);
  if (discovered.length > 0) {
    playlists.push({
      id: "smart-recently-discovered",
      name: "Recently Discovered",
      description: "Songs you listened to for the first time recently",
      rule: "recently-discovered",
      tracks: discovered,
    });
  }

  const genreTracks = getMostPlayedGenre(history);
  if (genreTracks.length > 0) {
    // Find the genre name
    const genreEntry = history.find((e) => e.primaryGenreName);
    const genreCounts = new Map<string, number>();
    for (const entry of history) {
      if (entry.primaryGenreName) {
        genreCounts.set(
          entry.primaryGenreName,
          (genreCounts.get(entry.primaryGenreName) || 0) + 1
        );
      }
    }
    let topGenre = genreEntry?.primaryGenreName || "Unknown";
    let maxCount = 0;
    for (const [genre, count] of genreCounts) {
      if (count > maxCount) {
        topGenre = genre;
        maxCount = count;
      }
    }

    playlists.push({
      id: "smart-genre",
      name: `Best of ${topGenre}`,
      description: `Your favorite tracks in ${topGenre}`,
      rule: "most-played-genre",
      tracks: genreTracks,
    });
  }

  return playlists;
}
