"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Music, Users, Disc3, Clock, Flame, Star, Sparkles } from "lucide-react";
import { getListeningHistory, type HistoryEntry } from "@/lib/personalization";

function subscribeNoop() {
  return () => {};
}

function getClientHistory(): HistoryEntry[] {
  return getListeningHistory();
}

const emptyHistory: HistoryEntry[] = [];

function getServerHistory(): HistoryEntry[] {
  return emptyHistory;
}

interface YearStats {
  totalTracks: number;
  totalMinutes: number;
  uniqueArtists: number;
  uniqueAlbums: number;
  uniqueGenres: number;
  topArtists: { name: string; count: number }[];
  topSongs: { name: string; artist: string; count: number }[];
  topGenres: { name: string; count: number }[];
  longestStreak: number;
  mostActiveMonth: string;
}

function computeYearStats(history: HistoryEntry[]): YearStats {
  const currentYear = new Date().getFullYear();
  const yearHistory = history.filter((entry) => {
    const entryYear = new Date(entry.playedAt).getFullYear();
    return entryYear === currentYear;
  });

  // Total tracks
  const totalTracks = yearHistory.length;

  // Total minutes
  const totalMinutes = Math.round(
    yearHistory.reduce((sum, e) => sum + (e.duration || 30000), 0) / 60000
  );

  // Unique artists
  const artistCounts: Record<string, number> = {};
  yearHistory.forEach((e) => {
    artistCounts[e.artistName] = (artistCounts[e.artistName] || 0) + 1;
  });
  const uniqueArtists = Object.keys(artistCounts).length;

  // Unique albums
  const albumSet = new Set(yearHistory.map((e) => e.albumName));
  const uniqueAlbums = albumSet.size;

  // Unique genres
  const genreCounts: Record<string, number> = {};
  yearHistory.forEach((e) => {
    if (e.primaryGenreName) {
      genreCounts[e.primaryGenreName] = (genreCounts[e.primaryGenreName] || 0) + 1;
    }
  });
  const uniqueGenres = Object.keys(genreCounts).length;

  // Top 5 artists
  const topArtists = Object.entries(artistCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Top 5 songs
  const songCounts: Record<string, { artist: string; count: number }> = {};
  yearHistory.forEach((e) => {
    const key = `${e.trackName}|||${e.artistName}`;
    if (!songCounts[key]) {
      songCounts[key] = { artist: e.artistName, count: 0 };
    }
    songCounts[key].count++;
  });
  const topSongs = Object.entries(songCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([key, data]) => ({
      name: key.split("|||")[0],
      artist: data.artist,
      count: data.count,
    }));

  // Top genres
  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Longest streak (consecutive days with plays)
  const playDates = new Set(
    yearHistory.map((e) => new Date(e.playedAt).toISOString().split("T")[0])
  );
  const sortedDates = [...playDates].sort();
  let longestStreak = 0;
  let currentStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]).getTime();
    const curr = new Date(sortedDates[i]).getTime();
    if (curr - prev === 86400000) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  // Most active month
  const monthCounts: Record<string, number> = {};
  yearHistory.forEach((e) => {
    const month = new Date(e.playedAt).toLocaleString("default", { month: "long" });
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  const mostActiveMonth = Object.entries(monthCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

  return {
    totalTracks,
    totalMinutes,
    uniqueArtists,
    uniqueAlbums,
    uniqueGenres,
    topArtists,
    topSongs,
    topGenres,
    longestStreak,
    mostActiveMonth,
  };
}

export default function YearInReview() {
  const history = useSyncExternalStore(subscribeNoop, getClientHistory, getServerHistory);

  const stats = useMemo(() => computeYearStats(history), [history]);
  const currentYear = new Date().getFullYear();
  const mounted = history !== emptyHistory || typeof window !== "undefined";

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8" aria-busy="true">
        <div className="h-8 w-48 rounded shimmer-wave mb-6" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 rounded-xl shimmer-wave" />
          ))}
        </div>
      </div>
    );
  }

  if (stats.totalTracks === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-8 text-center" aria-label="Year in review">
        <Sparkles className="mx-auto h-12 w-12 text-muted" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-bold text-foreground">
          Your {currentYear} in Music
        </h3>
        <p className="mt-2 text-sm text-muted">
          Start listening to build your year in review! Your stats will appear here as you play music.
        </p>
      </section>
    );
  }

  const totalHours = Math.round(stats.totalMinutes / 60);

  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-card to-card overflow-hidden" aria-label="Year in review">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-violet-600 via-pink-500 to-orange-500 p-8 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative">
          <div className="flex items-center gap-2 text-white/80">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-wider">Year in Review</span>
          </div>
          <h3 className="mt-2 text-3xl font-bold sm:text-4xl">
            Your {currentYear} Wrapped
          </h3>
          <p className="mt-1 text-sm text-white/80">
            A look back at your musical journey
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <Music className="mx-auto h-5 w-5 text-violet-500" aria-hidden="true" />
            <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalTracks}</p>
            <p className="text-xs text-muted">Tracks Played</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <Clock className="mx-auto h-5 w-5 text-blue-500" aria-hidden="true" />
            <p className="mt-2 text-2xl font-bold text-foreground">{totalHours}h</p>
            <p className="text-xs text-muted">Total Hours</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <Users className="mx-auto h-5 w-5 text-green-500" aria-hidden="true" />
            <p className="mt-2 text-2xl font-bold text-foreground">{stats.uniqueArtists}</p>
            <p className="text-xs text-muted">Artists</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <Disc3 className="mx-auto h-5 w-5 text-orange-500" aria-hidden="true" />
            <p className="mt-2 text-2xl font-bold text-foreground">{stats.uniqueAlbums}</p>
            <p className="text-xs text-muted">Albums</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <Flame className="mx-auto h-5 w-5 text-red-500" aria-hidden="true" />
            <p className="mt-2 text-2xl font-bold text-foreground">{stats.longestStreak}</p>
            <p className="text-xs text-muted">Day Streak</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <Star className="mx-auto h-5 w-5 text-yellow-500" aria-hidden="true" />
            <p className="mt-2 text-2xl font-bold text-foreground">{stats.uniqueGenres}</p>
            <p className="text-xs text-muted">Genres</p>
          </div>
        </div>

        {/* Top Artists */}
        {stats.topArtists.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold text-foreground">Top Artists</h4>
            <div className="space-y-2">
              {stats.topArtists.map((artist, idx) => (
                <div key={artist.name} className="flex items-center gap-3 rounded-lg p-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold text-foreground">
                    {idx + 1}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium text-foreground">
                    {artist.name}
                  </span>
                  <span className="text-xs text-muted">{artist.count} plays</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Songs */}
        {stats.topSongs.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold text-foreground">Top Songs</h4>
            <div className="space-y-2">
              {stats.topSongs.map((song, idx) => (
                <div key={`${song.name}-${song.artist}`} className="flex items-center gap-3 rounded-lg p-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold text-foreground">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{song.name}</p>
                    <p className="truncate text-xs text-muted">{song.artist}</p>
                  </div>
                  <span className="text-xs text-muted">{song.count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Genres */}
        {stats.topGenres.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold text-foreground">Genre Mix</h4>
            <div className="flex flex-wrap gap-2">
              {stats.topGenres.map((genre) => (
                <span
                  key={genre.name}
                  className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {genre.name}
                  <span className="text-muted">({genre.count})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Highlight */}
        <div className="mt-6 rounded-xl bg-foreground/5 p-4 text-center">
          <p className="text-xs text-muted">Most Active Month</p>
          <p className="mt-1 text-lg font-bold text-foreground">{stats.mostActiveMonth}</p>
        </div>
      </div>
    </section>
  );
}
