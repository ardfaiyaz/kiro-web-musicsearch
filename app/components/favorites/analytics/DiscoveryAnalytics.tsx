"use client";

import { useMemo } from "react";
import { Compass, Users, Disc3, Music } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface DiscoveryAnalyticsProps {
  history: HistoryEntry[];
}

export default function DiscoveryAnalytics({ history }: DiscoveryAnalyticsProps) {
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
