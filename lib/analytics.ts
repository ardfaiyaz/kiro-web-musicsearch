import type { HistoryEntry } from "./personalization";

// --- Types ---

export interface ListeningSummary {
  hours: number;
  songs: number;
  artists: number;
  albums: number;
  sessions: number;
}

export interface TopSong {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl: string;
  playCount: number;
  totalListeningMs: number;
  lastPlayed: number;
}

export interface TopArtist {
  artistName: string;
  playCount: number;
  totalHours: number;
  albums: number;
  genres: string[];
}

export interface TopAlbum {
  albumName: string;
  artistName: string;
  artworkUrl: string;
  listeningHours: number;
  completionPercent: number;
  lastPlayed: number;
}

export interface GenreStatistic {
  genre: string;
  percentage: number;
  hours: number;
  songCount: number;
  artistCount: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
  hours: number;
}

export interface TasteMonth {
  month: string;
  topGenres: string[];
}

export interface ListeningStreak {
  current: number;
  longest: number;
  averageWeekly: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface TimeDistribution {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

// --- Computation Functions ---

export function computeListeningSummary(
  history: HistoryEntry[],
  period: "today" | "week" | "month" | "year" | "all",
  now: number
): ListeningSummary {
  let filtered = history;

  if (period !== "all" && now > 0) {
    let cutoff = 0;
    if (period === "today") {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      cutoff = today.getTime();
    } else if (period === "week") {
      cutoff = now - 7 * 24 * 60 * 60 * 1000;
    } else if (period === "month") {
      cutoff = now - 30 * 24 * 60 * 60 * 1000;
    } else if (period === "year") {
      cutoff = now - 365 * 24 * 60 * 60 * 1000;
    }
    filtered = history.filter((e) => e.playedAt >= cutoff);
  }

  const totalMs = filtered.reduce((sum, e) => sum + e.duration, 0);
  const uniqueArtists = new Set(filtered.map((e) => e.artistName));
  const uniqueAlbums = new Set(filtered.map((e) => e.albumName));
  const uniqueSessions = new Set(filtered.map((e) => e.sessionId));

  return {
    hours: Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10,
    songs: filtered.length,
    artists: uniqueArtists.size,
    albums: uniqueAlbums.size,
    sessions: uniqueSessions.size,
  };
}

export function computeTopSongs(
  history: HistoryEntry[],
  limit: number = 20
): TopSong[] {
  const songMap = new Map<
    number,
    {
      trackId: number;
      trackName: string;
      artistName: string;
      artworkUrl: string;
      playCount: number;
      totalListeningMs: number;
      lastPlayed: number;
    }
  >();

  for (const entry of history) {
    const existing = songMap.get(entry.trackId);
    if (existing) {
      existing.playCount++;
      existing.totalListeningMs += entry.duration;
      if (entry.playedAt > existing.lastPlayed) {
        existing.lastPlayed = entry.playedAt;
      }
    } else {
      songMap.set(entry.trackId, {
        trackId: entry.trackId,
        trackName: entry.trackName,
        artistName: entry.artistName,
        artworkUrl: entry.artworkUrl,
        playCount: 1,
        totalListeningMs: entry.duration,
        lastPlayed: entry.playedAt,
      });
    }
  }

  return Array.from(songMap.values())
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, limit);
}

export function computeTopArtists(
  history: HistoryEntry[],
  limit: number = 20
): TopArtist[] {
  const artistMap = new Map<
    string,
    {
      artistName: string;
      playCount: number;
      totalMs: number;
      albumSet: Set<string>;
      genreSet: Set<string>;
    }
  >();

  for (const entry of history) {
    const existing = artistMap.get(entry.artistName);
    if (existing) {
      existing.playCount++;
      existing.totalMs += entry.duration;
      if (entry.albumName) existing.albumSet.add(entry.albumName);
      if (entry.primaryGenreName) existing.genreSet.add(entry.primaryGenreName);
    } else {
      const albumSet = new Set<string>();
      const genreSet = new Set<string>();
      if (entry.albumName) albumSet.add(entry.albumName);
      if (entry.primaryGenreName) genreSet.add(entry.primaryGenreName);
      artistMap.set(entry.artistName, {
        artistName: entry.artistName,
        playCount: 1,
        totalMs: entry.duration,
        albumSet,
        genreSet,
      });
    }
  }

  return Array.from(artistMap.values())
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, limit)
    .map((a) => ({
      artistName: a.artistName,
      playCount: a.playCount,
      totalHours: Math.round((a.totalMs / (1000 * 60 * 60)) * 10) / 10,
      albums: a.albumSet.size,
      genres: Array.from(a.genreSet),
    }));
}

export function computeTopAlbums(
  history: HistoryEntry[],
  limit: number = 20
): TopAlbum[] {
  const albumMap = new Map<
    string,
    {
      albumName: string;
      artistName: string;
      artworkUrl: string;
      totalMs: number;
      completedCount: number;
      totalCount: number;
      lastPlayed: number;
    }
  >();

  for (const entry of history) {
    const key = `${entry.albumName}::${entry.artistName}`;
    const existing = albumMap.get(key);
    if (existing) {
      existing.totalMs += entry.duration;
      existing.totalCount++;
      if (entry.completed) existing.completedCount++;
      if (entry.playedAt > existing.lastPlayed) {
        existing.lastPlayed = entry.playedAt;
      }
    } else {
      albumMap.set(key, {
        albumName: entry.albumName,
        artistName: entry.artistName,
        artworkUrl: entry.artworkUrl,
        totalMs: entry.duration,
        completedCount: entry.completed ? 1 : 0,
        totalCount: 1,
        lastPlayed: entry.playedAt,
      });
    }
  }

  return Array.from(albumMap.values())
    .sort((a, b) => b.totalMs - a.totalMs)
    .slice(0, limit)
    .map((a) => ({
      albumName: a.albumName,
      artistName: a.artistName,
      artworkUrl: a.artworkUrl,
      listeningHours:
        Math.round((a.totalMs / (1000 * 60 * 60)) * 10) / 10,
      completionPercent:
        a.totalCount > 0
          ? Math.round((a.completedCount / a.totalCount) * 100)
          : 0,
      lastPlayed: a.lastPlayed,
    }));
}

export function computeGenreAnalytics(
  history: HistoryEntry[]
): GenreStatistic[] {
  if (history.length === 0) return [];

  const genreMap = new Map<
    string,
    { totalMs: number; songCount: number; artistSet: Set<string> }
  >();

  for (const entry of history) {
    const genre = entry.primaryGenreName || "Unknown";
    const existing = genreMap.get(genre);
    if (existing) {
      existing.totalMs += entry.duration;
      existing.songCount++;
      existing.artistSet.add(entry.artistName);
    } else {
      const artistSet = new Set<string>();
      artistSet.add(entry.artistName);
      genreMap.set(genre, {
        totalMs: entry.duration,
        songCount: 1,
        artistSet,
      });
    }
  }

  const totalMs = history.reduce((sum, e) => sum + e.duration, 0);

  return Array.from(genreMap.entries())
    .map(([genre, data]) => ({
      genre,
      percentage:
        totalMs > 0 ? Math.round((data.totalMs / totalMs) * 100) : 0,
      hours: Math.round((data.totalMs / (1000 * 60 * 60)) * 10) / 10,
      songCount: data.songCount,
      artistCount: data.artistSet.size,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8);
}

export function computeHeatmapData(
  history: HistoryEntry[],
  now: number
): HeatmapDay[] {
  if (now === 0) return [];

  const days: HeatmapDay[] = [];
  const dayMs = 24 * 60 * 60 * 1000;

  // Build map of date string -> entries
  const dateMap = new Map<string, { count: number; totalMs: number }>();
  for (const entry of history) {
    const d = new Date(entry.playedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const existing = dateMap.get(key);
    if (existing) {
      existing.count++;
      existing.totalMs += entry.duration;
    } else {
      dateMap.set(key, { count: 1, totalMs: entry.duration });
    }
  }

  // Generate 365 days
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today.getTime() - 364 * dayMs);

  for (let i = 0; i < 365; i++) {
    const d = new Date(startDate.getTime() + i * dayMs);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const data = dateMap.get(key);
    days.push({
      date: key,
      count: data?.count || 0,
      hours:
        data ? Math.round((data.totalMs / (1000 * 60 * 60)) * 10) / 10 : 0,
    });
  }

  return days;
}

export function computeTasteEvolution(
  history: HistoryEntry[],
  now: number
): TasteMonth[] {
  if (now === 0) return [];

  const months: TasteMonth[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth();

    const monthEntries = history.filter((e) => {
      const entryDate = new Date(e.playedAt);
      return (
        entryDate.getFullYear() === year && entryDate.getMonth() === month
      );
    });

    // Count genres
    const genreCount = new Map<string, number>();
    for (const entry of monthEntries) {
      if (entry.primaryGenreName) {
        genreCount.set(
          entry.primaryGenreName,
          (genreCount.get(entry.primaryGenreName) || 0) + 1
        );
      }
    }

    const topGenres = Array.from(genreCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    const monthName = d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    months.push({ month: monthName, topGenres });
  }

  return months;
}

export function computeListeningStreak(
  history: HistoryEntry[],
  now: number
): ListeningStreak {
  if (now === 0 || history.length === 0) {
    return { current: 0, longest: 0, averageWeekly: 0 };
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Build set of active days
  const activeDays = new Set<number>();
  for (const entry of history) {
    const d = new Date(entry.playedAt);
    d.setHours(0, 0, 0, 0);
    activeDays.add(d.getTime());
  }

  // Current streak
  let current = 0;
  let checkDate = today.getTime();
  for (let i = 0; i < 365; i++) {
    if (activeDays.has(checkDate)) {
      current++;
      checkDate -= dayMs;
    } else {
      break;
    }
  }

  // Longest streak
  let longest = 0;
  let tempStreak = 0;
  for (let i = 0; i < 365; i++) {
    const dayTime = today.getTime() - i * dayMs;
    if (activeDays.has(dayTime)) {
      tempStreak++;
      if (tempStreak > longest) longest = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  // Average weekly (total songs / weeks with activity)
  const weeksBack = 12;
  const weekCutoff = now - weeksBack * 7 * dayMs;
  const recentEntries = history.filter((e) => e.playedAt >= weekCutoff);
  const averageWeekly =
    weeksBack > 0
      ? Math.round((recentEntries.length / weeksBack) * 10) / 10
      : 0;

  return { current, longest, averageWeekly };
}

export function computeAchievements(
  history: HistoryEntry[],
  favCount: number,
  artistCount: number,
  albumCount: number,
  now: number
): Achievement[] {
  const totalPlays = history.length;
  const uniqueGenres = new Set(
    history.map((e) => e.primaryGenreName).filter(Boolean)
  );

  // Night listens (10pm - 5am)
  const nightListens = history.filter((e) => {
    const hour = new Date(e.playedAt).getHours();
    return hour >= 22 || hour < 5;
  }).length;

  // Streak calculation
  const streak = computeListeningStreak(history, now);

  return [
    {
      id: "first-song",
      title: "First Song",
      description: "Play your first song",
      icon: "play",
      unlocked: totalPlays >= 1,
      progress: Math.min(totalPlays, 1),
      target: 1,
    },
    {
      id: "music-explorer",
      title: "Music Explorer",
      description: "Play 50 songs",
      icon: "compass",
      unlocked: totalPlays >= 50,
      progress: Math.min(totalPlays, 50),
      target: 50,
    },
    {
      id: "dedicated-listener",
      title: "Dedicated Listener",
      description: "Play 200 songs",
      icon: "headphones",
      unlocked: totalPlays >= 200,
      progress: Math.min(totalPlays, 200),
      target: 200,
    },
    {
      id: "genre-adventurer",
      title: "Genre Adventurer",
      description: "Explore 5 or more genres",
      icon: "palette",
      unlocked: uniqueGenres.size >= 5,
      progress: Math.min(uniqueGenres.size, 5),
      target: 5,
    },
    {
      id: "album-collector",
      title: "Album Collector",
      description: "Save 10 or more albums",
      icon: "disc",
      unlocked: albumCount >= 10,
      progress: Math.min(albumCount, 10),
      target: 10,
    },
    {
      id: "artist-fan",
      title: "Artist Fan",
      description: "Save 10 or more artists",
      icon: "users",
      unlocked: artistCount >= 10,
      progress: Math.min(artistCount, 10),
      target: 10,
    },
    {
      id: "night-owl",
      title: "Night Owl",
      description: "Listen to 50 songs at night",
      icon: "moon",
      unlocked: nightListens >= 50,
      progress: Math.min(nightListens, 50),
      target: 50,
    },
    {
      id: "streak-master",
      title: "Streak Master",
      description: "Maintain a 7-day listening streak",
      icon: "flame",
      unlocked: streak.longest >= 7,
      progress: Math.min(streak.longest, 7),
      target: 7,
    },
  ];
}

export function computeTimeDistribution(
  history: HistoryEntry[]
): TimeDistribution {
  if (history.length === 0) {
    return { morning: 0, afternoon: 0, evening: 0, night: 0 };
  }

  let morning = 0;
  let afternoon = 0;
  let evening = 0;
  let night = 0;

  for (const entry of history) {
    const hour = new Date(entry.playedAt).getHours();
    if (hour >= 5 && hour < 12) {
      morning++;
    } else if (hour >= 12 && hour < 17) {
      afternoon++;
    } else if (hour >= 17 && hour < 22) {
      evening++;
    } else {
      night++;
    }
  }

  const total = history.length;
  return {
    morning: Math.round((morning / total) * 100),
    afternoon: Math.round((afternoon / total) * 100),
    evening: Math.round((evening / total) * 100),
    night: Math.round((night / total) * 100),
  };
}
