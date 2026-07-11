"use client";

import { useMemo, useCallback, useRef, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { Clock, Play, Flame, Headphones } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface RecentlyPlayedHeroProps {
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

function AnimatedCounter({ target, label }: { target: number; label: string }) {
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
      const current = Math.round(eased * target);
      if (el) el.textContent = current.toString();
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [target]);

  return (
    <div className="text-center">
      <span ref={displayRef} className="block text-2xl font-bold text-foreground sm:text-3xl">
        0
      </span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export default function RecentlyPlayedHero({ history }: RecentlyPlayedHeroProps) {
  const lastPlayed = history.length > 0 ? history[0] : null;
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const stats = useMemo(() => {
    if (now === 0) return { hoursThisWeek: 0, streak: 0, songsThisWeek: 0 };
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = history.filter((e) => e.playedAt >= weekAgo);
    const hoursThisWeek = thisWeek.reduce((sum, e) => sum + e.duration, 0) / (1000 * 60 * 60);

    // Calculate listening streak (days in a row with activity)
    let streak = 0;
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    let checkDate = today.getTime();

    for (let i = 0; i < 365; i++) {
      const dayStart = checkDate;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const hasActivity = history.some(
        (e) => e.playedAt >= dayStart && e.playedAt < dayEnd
      );
      if (hasActivity) {
        streak++;
        checkDate -= 24 * 60 * 60 * 1000;
      } else {
        break;
      }
    }

    return {
      hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
      streak,
      songsThisWeek: thisWeek.length,
    };
  }, [history, now]);

  const unfinished = useMemo(
    () => history.find((e) => !e.completed && e.progress < 100),
    [history]
  );

  const handleResume = useCallback(() => {
    if (unfinished?.previewUrl) {
      window.open(unfinished.previewUrl, "_blank", "noopener");
    }
  }, [unfinished]);

  return (
    <section
      className="relative overflow-hidden rounded-3xl glass-ultra p-6 sm:p-8"
      aria-label="Listening history hero"
    >
      {/* Background artwork */}
      {lastPlayed && (
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <Image
            src={lastPlayed.artworkUrl.replace("100x100", "600x600")}
            alt=""
            fill
            className="object-cover opacity-30 blur-3xl scale-110"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50" />
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Listening History
            </h2>
          </div>

          {lastPlayed && (
            <p className="text-sm text-muted">
              Last played:{" "}
              <span className="font-medium text-foreground">
                {lastPlayed.trackName}
              </span>{" "}
              by {lastPlayed.artistName}
            </p>
          )}

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" aria-hidden="true" />
              <AnimatedCounter target={stats.streak} label="Day Streak" />
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-blue-400" aria-hidden="true" />
              <AnimatedCounter target={stats.hoursThisWeek} label="Hours This Week" />
            </div>
            <AnimatedCounter target={stats.songsThisWeek} label="Songs This Week" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {lastPlayed && (
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl shadow-lg sm:h-36 sm:w-36">
              <Image
                src={lastPlayed.artworkUrl.replace("100x100", "300x300")}
                alt={`${lastPlayed.trackName} artwork`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {unfinished && (
            <button
              type="button"
              onClick={handleResume}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-premium hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2"
              aria-label={`Resume ${unfinished.trackName}`}
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Resume
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
