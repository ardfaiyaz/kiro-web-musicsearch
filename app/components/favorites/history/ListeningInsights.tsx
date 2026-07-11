"use client";

import { useMemo, useSyncExternalStore } from "react";
import { TrendingUp, Music, Users, Clock } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface ListeningInsightsProps {
  history: HistoryEntry[];
}

interface Insight {
  icon: "trending" | "music" | "users" | "clock";
  text: string;
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

export default function ListeningInsights({ history }: ListeningInsightsProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const insights = useMemo((): Insight[] => {
    if (history.length === 0 || now === 0) return [];
    const result: Insight[] = [];

    // Hours this week
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = history.filter((e) => e.playedAt >= weekAgo);
    const hoursThisWeek =
      thisWeek.reduce((sum, e) => sum + e.duration, 0) / (1000 * 60 * 60);
    if (hoursThisWeek > 0) {
      result.push({
        icon: "clock",
        text: `You listened for ${hoursThisWeek.toFixed(1)} hours this week`,
      });
    }

    // Most played artist
    const artistCount = new Map<string, number>();
    for (const entry of history) {
      artistCount.set(entry.artistName, (artistCount.get(entry.artistName) || 0) + 1);
    }
    let topArtist = "";
    let topCount = 0;
    for (const [artist, count] of artistCount) {
      if (count > topCount) {
        topArtist = artist;
        topCount = count;
      }
    }
    if (topArtist) {
      result.push({
        icon: "users",
        text: `Most Played Artist: ${topArtist} (${topCount} plays)`,
      });
    }

    // Favorite genre
    const genreCount = new Map<string, number>();
    for (const entry of history) {
      if (entry.primaryGenreName) {
        genreCount.set(
          entry.primaryGenreName,
          (genreCount.get(entry.primaryGenreName) || 0) + 1
        );
      }
    }
    let topGenre = "";
    let topGenreCount = 0;
    for (const [genre, count] of genreCount) {
      if (count > topGenreCount) {
        topGenre = genre;
        topGenreCount = count;
      }
    }
    if (topGenre) {
      result.push({
        icon: "music",
        text: `Favorite Genre: ${topGenre}`,
      });
    }

    // Total songs
    if (history.length >= 10) {
      result.push({
        icon: "trending",
        text: `You have played ${history.length} songs in total`,
      });
    }

    return result.slice(0, 4);
  }, [history, now]);

  if (insights.length === 0) return null;

  const iconMap = {
    trending: TrendingUp,
    music: Music,
    users: Users,
    clock: Clock,
  };

  return (
    <section aria-label="Listening insights" className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Insights</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {insights.map((insight, idx) => {
          const Icon = iconMap[insight.icon];
          return (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl glass-light p-4 transition-premium hover:bg-foreground/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/10">
                <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
              </div>
              <p className="text-sm text-foreground">{insight.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
