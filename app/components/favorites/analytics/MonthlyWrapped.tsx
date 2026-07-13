"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Gift, Music, Users, Clock, Disc3 } from "lucide-react";
import Image from "next/image";
import type { HistoryEntry } from "@/lib/personalization";

interface MonthlyWrappedProps {
  history: HistoryEntry[];
}

function subscribeNoop() {
  return () => {};
}

function getClientNow() {
  return Date.now();
}

function getServerNow() {
  return 0;
}

interface WrappedData {
  monthLabel: string;
  topArtist: { name: string; plays: number; artworkUrl: string } | null;
  topSong: { name: string; artist: string; plays: number; artworkUrl: string } | null;
  totalHours: number;
  totalSongs: number;
  topGenres: { genre: string; percentage: number }[];
  newArtists: number;
}

export default function MonthlyWrapped({ history }: MonthlyWrappedProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const wrapped = useMemo((): WrappedData | null => {
    if (now === 0 || history.length === 0) return null;

    const currentMonth = new Date(now);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Filter entries for current month
    const monthEntries = history.filter((e) => {
      const d = new Date(e.playedAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    if (monthEntries.length === 0) return null;

    // Top artist
    const artistCount = new Map<
      string,
      { plays: number; artworkUrl: string }
    >();
    for (const entry of monthEntries) {
      const existing = artistCount.get(entry.artistName);
      if (existing) {
        existing.plays++;
      } else {
        artistCount.set(entry.artistName, {
          plays: 1,
          artworkUrl: entry.artworkUrl,
        });
      }
    }
    const topArtistEntry = Array.from(artistCount.entries()).sort(
      (a, b) => b[1].plays - a[1].plays
    )[0];

    // Top song
    const songCount = new Map<
      number,
      { name: string; artist: string; plays: number; artworkUrl: string }
    >();
    for (const entry of monthEntries) {
      const existing = songCount.get(entry.trackId);
      if (existing) {
        existing.plays++;
      } else {
        songCount.set(entry.trackId, {
          name: entry.trackName,
          artist: entry.artistName,
          plays: 1,
          artworkUrl: entry.artworkUrl,
        });
      }
    }
    const topSongEntry = Array.from(songCount.values()).sort(
      (a, b) => b.plays - a.plays
    )[0];

    // Total hours
    const totalMs = monthEntries.reduce((sum, e) => sum + e.duration, 0);
    const totalHours = Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10;

    // Genre breakdown
    const genreMap = new Map<string, number>();
    for (const entry of monthEntries) {
      const genre = entry.primaryGenreName || "Unknown";
      genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
    }
    const topGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([genre, count]) => ({
        genre,
        percentage: Math.round((count / monthEntries.length) * 100),
      }));

    // New artists discovered this month (not in previous months)
    const prevMonthArtists = new Set(
      history
        .filter((e) => {
          const d = new Date(e.playedAt);
          return !(d.getFullYear() === year && d.getMonth() === month);
        })
        .map((e) => e.artistName)
    );
    const thisMonthArtists = new Set(monthEntries.map((e) => e.artistName));
    const newArtists = Array.from(thisMonthArtists).filter(
      (a) => !prevMonthArtists.has(a)
    ).length;

    const monthLabel = currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return {
      monthLabel,
      topArtist: topArtistEntry
        ? {
            name: topArtistEntry[0],
            plays: topArtistEntry[1].plays,
            artworkUrl: topArtistEntry[1].artworkUrl,
          }
        : null,
      topSong: topSongEntry || null,
      totalHours,
      totalSongs: monthEntries.length,
      topGenres,
      newArtists,
    };
  }, [history, now]);

  if (!wrapped) return null;

  return (
    <section aria-label="Monthly wrapped report" className="space-y-4">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-purple-400" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Monthly Wrapped
        </h3>
        <span className="ml-auto text-xs text-muted">
          {wrapped.monthLabel}
        </span>
      </div>

      {/* Wrapped Card - shareable design */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-pink-900/40 border border-white/10 p-6 relative">
        {/* Decorative gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative space-y-6">
          {/* Header */}
          <div className="text-center">
            <p className="text-xs font-medium text-purple-300/80 uppercase tracking-wider">
              Your {wrapped.monthLabel}
            </p>
            <p className="text-lg font-bold text-white mt-1">Monthly Wrapped</p>
          </div>

          {/* Top Artist */}
          {wrapped.topArtist && (
            <div className="flex items-center gap-4 glass-light rounded-xl p-4">
              <div className="shrink-0 h-14 w-14 rounded-lg overflow-hidden">
                <Image
                  src={wrapped.topArtist.artworkUrl.replace(
                    "100x100",
                    "120x120"
                  )}
                  alt={wrapped.topArtist.name}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted uppercase tracking-wider">
                  Top Artist
                </p>
                <p className="text-sm font-bold text-foreground truncate">
                  {wrapped.topArtist.name}
                </p>
                <p className="text-xs text-muted">
                  {wrapped.topArtist.plays} plays
                </p>
              </div>
              <Users className="h-5 w-5 text-purple-400 shrink-0" aria-hidden="true" />
            </div>
          )}

          {/* Top Song */}
          {wrapped.topSong && (
            <div className="flex items-center gap-4 glass-light rounded-xl p-4">
              <div className="shrink-0 h-14 w-14 rounded-lg overflow-hidden">
                <Image
                  src={wrapped.topSong.artworkUrl.replace(
                    "100x100",
                    "120x120"
                  )}
                  alt={wrapped.topSong.name}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted uppercase tracking-wider">
                  Top Song
                </p>
                <p className="text-sm font-bold text-foreground truncate">
                  {wrapped.topSong.name}
                </p>
                <p className="text-xs text-muted truncate">
                  {wrapped.topSong.artist} - {wrapped.topSong.plays} plays
                </p>
              </div>
              <Music className="h-5 w-5 text-blue-400 shrink-0" aria-hidden="true" />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 glass-light rounded-xl p-3">
              <Clock className="h-4 w-4 text-green-400" aria-hidden="true" />
              <span className="text-lg font-bold text-foreground">
                {wrapped.totalHours}
              </span>
              <span className="text-[10px] text-muted">Hours</span>
            </div>
            <div className="flex flex-col items-center gap-1 glass-light rounded-xl p-3">
              <Music className="h-4 w-4 text-blue-400" aria-hidden="true" />
              <span className="text-lg font-bold text-foreground">
                {wrapped.totalSongs}
              </span>
              <span className="text-[10px] text-muted">Songs</span>
            </div>
            <div className="flex flex-col items-center gap-1 glass-light rounded-xl p-3">
              <Disc3 className="h-4 w-4 text-pink-400" aria-hidden="true" />
              <span className="text-lg font-bold text-foreground">
                {wrapped.newArtists}
              </span>
              <span className="text-[10px] text-muted">New Artists</span>
            </div>
          </div>

          {/* Genre Breakdown */}
          {wrapped.topGenres.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-muted uppercase tracking-wider">
                Genre Breakdown
              </p>
              <div className="flex flex-wrap gap-2">
                {wrapped.topGenres.map((g) => (
                  <span
                    key={g.genre}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-foreground"
                  >
                    {g.genre} ({g.percentage}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
