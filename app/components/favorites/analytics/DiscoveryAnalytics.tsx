"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Compass, Users, Disc3, Music, TrendingUp } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface DiscoveryAnalyticsProps {
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

export default function DiscoveryAnalytics({ history }: DiscoveryAnalyticsProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const stats = useMemo(() => {
    const uniqueArtists = new Set(history.map((e) => e.artistName));
    const uniqueAlbums = new Set(history.map((e) => e.albumName));
    const uniqueGenres = new Set(
      history.map((e) => e.primaryGenreName).filter(Boolean)
    );
    const uniqueSongs = new Set(history.map((e) => e.trackId));

    return {
      artists: uniqueArtists.size,
      albums: uniqueAlbums.size,
      genres: uniqueGenres.size,
      songs: uniqueSongs.size,
    };
  }, [history]);

  // Monthly discovery stats
  const monthlyDiscovery = useMemo(() => {
    if (now === 0 || history.length === 0) return null;

    const currentDate = new Date(now);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Artists discovered this month vs previous months
    const thisMonthEntries = history.filter((e) => {
      const d = new Date(e.playedAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const previousEntries = history.filter((e) => {
      const d = new Date(e.playedAt);
      return !(d.getFullYear() === currentYear && d.getMonth() === currentMonth);
    });

    const previousArtists = new Set(previousEntries.map((e) => e.artistName));
    const thisMonthArtists = new Set(thisMonthEntries.map((e) => e.artistName));
    const newArtists = Array.from(thisMonthArtists).filter(
      (a) => !previousArtists.has(a)
    );

    const previousSongs = new Set(previousEntries.map((e) => e.trackId));
    const thisMonthSongs = new Set(thisMonthEntries.map((e) => e.trackId));
    const newSongs = Array.from(thisMonthSongs).filter(
      (s) => !previousSongs.has(s)
    );

    const previousGenres = new Set(
      previousEntries.map((e) => e.primaryGenreName).filter(Boolean)
    );
    const thisMonthGenres = new Set(
      thisMonthEntries.map((e) => e.primaryGenreName).filter(Boolean)
    );
    const newGenres = Array.from(thisMonthGenres).filter(
      (g) => !previousGenres.has(g)
    );

    return {
      newArtists: newArtists.length,
      newSongs: newSongs.length,
      newGenres: newGenres.length,
      monthLabel: currentDate.toLocaleDateString("en-US", { month: "long" }),
    };
  }, [history, now]);

  if (history.length === 0) return null;

  const cards = [
    {
      icon: <Users className="h-5 w-5 text-blue-400" />,
      value: stats.artists,
      label: "Unique Artists",
    },
    {
      icon: <Disc3 className="h-5 w-5 text-purple-400" />,
      value: stats.albums,
      label: "Unique Albums",
    },
    {
      icon: <Music className="h-5 w-5 text-green-400" />,
      value: stats.songs,
      label: "Unique Songs",
    },
    {
      icon: <Compass className="h-5 w-5 text-orange-400" />,
      value: stats.genres,
      label: "Genres Explored",
    },
  ];

  return (
    <section aria-label="Discovery analytics" className="space-y-4">
      <div className="flex items-center gap-2">
        <Compass className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Discovery Analytics
        </h3>
      </div>

      {/* Monthly discovery banner */}
      {monthlyDiscovery && monthlyDiscovery.newArtists > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp
              className="h-5 w-5 text-green-400 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                You discovered {monthlyDiscovery.newArtists} new{" "}
                {monthlyDiscovery.newArtists === 1 ? "artist" : "artists"} this{" "}
                {monthlyDiscovery.monthLabel}!
              </p>
              <p className="text-xs text-muted mt-0.5">
                Plus {monthlyDiscovery.newSongs} new{" "}
                {monthlyDiscovery.newSongs === 1 ? "song" : "songs"}
                {monthlyDiscovery.newGenres > 0 && (
                  <>
                    {" "}
                    and {monthlyDiscovery.newGenres} new{" "}
                    {monthlyDiscovery.newGenres === 1 ? "genre" : "genres"}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex flex-col items-center gap-2 rounded-xl glass-light p-4 text-center transition-premium hover:glass-medium"
          >
            <span aria-hidden="true">{card.icon}</span>
            <span className="text-xl font-bold text-foreground">
              {card.value}
            </span>
            <span className="text-xs text-muted">{card.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
