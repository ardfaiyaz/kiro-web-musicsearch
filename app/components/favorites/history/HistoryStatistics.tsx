"use client";

import { useMemo, useRef, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface HistoryStatisticsProps {
  history: HistoryEntry[];
}

interface StatItem {
  label: string;
  value: number;
  format?: "hours" | "number";
}

function AnimatedStat({ stat }: { stat: StatItem }) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (animatedRef.current || !displayRef.current) return;
    animatedRef.current = true;
    const el = displayRef.current;
    const target = stat.value;
    const startTime = performance.now();
    const duration = 700;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = stat.format === "hours"
        ? (eased * target).toFixed(1)
        : Math.round(eased * target).toString();
      if (el) el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [stat]);

  return (
    <div className="flex flex-col items-center rounded-xl glass-subtle p-4 text-center">
      <span ref={displayRef} className="text-xl font-bold text-foreground sm:text-2xl">
        0
      </span>
      <span className="mt-1 text-xs text-muted">{stat.label}</span>
    </div>
  );
}

export default function HistoryStatistics({ history }: HistoryStatisticsProps) {
  const stats = useMemo((): StatItem[] => {
    const uniqueAlbums = new Set(history.map((e) => e.albumName));
    const uniqueArtists = new Set(history.map((e) => e.artistName));
    const sessionIds = new Set(history.map((e) => e.sessionId));
    const totalMs = history.reduce((sum, e) => sum + e.duration, 0);
    const hoursListened = totalMs / (1000 * 60 * 60);
    const avgSessionMinutes = sessionIds.size > 0
      ? totalMs / sessionIds.size / 60000
      : 0;

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

    // Most played artist
    const artistCount = new Map<string, number>();
    for (const entry of history) {
      artistCount.set(entry.artistName, (artistCount.get(entry.artistName) || 0) + 1);
    }

    return [
      { label: "Songs Played", value: history.length },
      { label: "Albums", value: uniqueAlbums.size },
      { label: "Artists", value: uniqueArtists.size },
      { label: "Sessions", value: sessionIds.size },
      { label: "Hours Listened", value: Math.round(hoursListened * 10) / 10, format: "hours" },
      { label: "Avg Session (min)", value: Math.round(avgSessionMinutes) },
    ];
  }, [history]);

  if (history.length === 0) return null;

  return (
    <section aria-label="Listening statistics" className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-muted" aria-hidden="true" />
        Statistics
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <AnimatedStat key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
