"use client";

import { useMemo, useRef, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { BarChart3, Music, Disc3, Users, Palette, Flame } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import { computeListeningStreak } from "@/lib/analytics";

interface InsightsHeroProps {
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

function AnimatedHeroCounter({
  target,
  label,
  icon,
  format = "number",
}: {
  target: number;
  label: string;
  icon: React.ReactNode;
  format?: "number" | "hours";
}) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (animatedRef.current || !displayRef.current) return;
    animatedRef.current = true;
    const el = displayRef.current;
    const startTime = performance.now();
    const duration = 700;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current =
        format === "hours"
          ? (eased * target).toFixed(1)
          : Math.round(eased * target).toString();
      if (el) el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [target, format]);

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl glass-subtle p-3 sm:p-4 text-center min-w-[100px]">
      <span className="text-muted" aria-hidden="true">
        {icon}
      </span>
      <span
        ref={displayRef}
        className="text-xl font-bold text-foreground sm:text-2xl"
      >
        0
      </span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export default function InsightsHero({ history }: InsightsHeroProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const topAlbumArtwork = useMemo(() => {
    if (history.length === 0) return null;
    // Find most played album artwork
    const albumCount = new Map<string, { count: number; artworkUrl: string }>();
    for (const entry of history) {
      const existing = albumCount.get(entry.albumName);
      if (existing) {
        existing.count++;
      } else {
        albumCount.set(entry.albumName, {
          count: 1,
          artworkUrl: entry.artworkUrl,
        });
      }
    }
    let topArtwork = history[0].artworkUrl;
    let topCount = 0;
    for (const [, data] of albumCount) {
      if (data.count > topCount) {
        topCount = data.count;
        topArtwork = data.artworkUrl;
      }
    }
    return topArtwork;
  }, [history]);

  const heroStats = useMemo(() => {
    const totalMs = history.reduce((sum, e) => sum + e.duration, 0);
    const hours = Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10;
    const uniqueArtists = new Set(history.map((e) => e.artistName));
    const uniqueAlbums = new Set(history.map((e) => e.albumName));
    const uniqueGenres = new Set(
      history.map((e) => e.primaryGenreName).filter(Boolean)
    );
    const streak = computeListeningStreak(history, now);

    return {
      hours,
      songs: history.length,
      albums: uniqueAlbums.size,
      artists: uniqueArtists.size,
      genres: uniqueGenres.size,
      streak: streak.current,
    };
  }, [history, now]);

  return (
    <section
      className="relative overflow-hidden rounded-3xl glass-ultra p-6 sm:p-8"
      aria-label="Music insights hero dashboard"
    >
      {/* Background artwork */}
      {topAlbumArtwork && (
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <Image
            src={topAlbumArtwork.replace("100x100", "600x600")}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25 blur-3xl scale-110"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/75 to-background/60" />
        </div>
      )}

      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-muted" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Music Insights
          </h2>
        </div>

        <p className="text-sm text-muted max-w-lg">
          Your personal listening analytics - discover patterns, milestones, and
          how your taste evolves over time.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <AnimatedHeroCounter
            target={heroStats.hours}
            label="Listening Hours"
            icon={<Music className="h-4 w-4" />}
            format="hours"
          />
          <AnimatedHeroCounter
            target={heroStats.songs}
            label="Songs Played"
            icon={<Music className="h-4 w-4" />}
          />
          <AnimatedHeroCounter
            target={heroStats.albums}
            label="Albums Explored"
            icon={<Disc3 className="h-4 w-4" />}
          />
          <AnimatedHeroCounter
            target={heroStats.artists}
            label="Artists Discovered"
            icon={<Users className="h-4 w-4" />}
          />
          <AnimatedHeroCounter
            target={heroStats.genres}
            label="Genres Explored"
            icon={<Palette className="h-4 w-4" />}
          />
          <AnimatedHeroCounter
            target={heroStats.streak}
            label="Current Streak"
            icon={<Flame className="h-4 w-4" />}
          />
        </div>
      </div>
    </section>
  );
}
