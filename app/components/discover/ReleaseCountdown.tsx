"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Clock, Disc3 } from "lucide-react";

interface UpcomingRelease {
  id: string;
  title: string;
  artist: string;
  releaseDate: string; // ISO date string
  genre: string;
  gradient: string;
}

// Notable upcoming/recent releases - updated periodically
const UPCOMING_RELEASES: UpcomingRelease[] = [
  {
    id: "rel-1",
    title: "The Tortured Poets Department: Anthology",
    artist: "Taylor Swift",
    releaseDate: "2025-04-19",
    genre: "Pop",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "rel-2",
    title: "Chromakopia Deluxe",
    artist: "Tyler, The Creator",
    releaseDate: "2025-06-15",
    genre: "Hip-Hop",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "rel-3",
    title: "Eternal Summer",
    artist: "The Weeknd",
    releaseDate: "2025-09-01",
    genre: "R&B",
    gradient: "from-red-500 to-orange-500",
  },
  {
    id: "rel-4",
    title: "Wall of Eyes",
    artist: "The Smile",
    releaseDate: "2025-08-20",
    genre: "Alternative",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "rel-5",
    title: "Midnight Frequencies",
    artist: "Daft Punk",
    releaseDate: "2025-12-01",
    genre: "Electronic",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "rel-6",
    title: "Renaissance Act III",
    artist: "Beyonce",
    releaseDate: "2025-11-15",
    genre: "Pop/R&B",
    gradient: "from-yellow-500 to-amber-600",
  },
];

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function getTimeRemaining(targetDate: string): TimeRemaining {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isPast: false,
  };
}

function CountdownTimer({ releaseDate }: { releaseDate: string }) {
  const [time, setTime] = useState<TimeRemaining>(() => getTimeRemaining(releaseDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(releaseDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [releaseDate]);

  if (time.isPast) {
    return (
      <span className="text-xs font-medium text-green-600 dark:text-green-400">
        Out Now!
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2" aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes remaining`}>
      <div className="flex items-center gap-0.5">
        <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded bg-foreground/10 px-1 text-xs font-bold text-foreground tabular-nums">
          {time.days}
        </span>
        <span className="text-[10px] text-muted">d</span>
      </div>
      <div className="flex items-center gap-0.5">
        <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded bg-foreground/10 px-1 text-xs font-bold text-foreground tabular-nums">
          {time.hours.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] text-muted">h</span>
      </div>
      <div className="flex items-center gap-0.5">
        <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded bg-foreground/10 px-1 text-xs font-bold text-foreground tabular-nums">
          {time.minutes.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] text-muted">m</span>
      </div>
    </div>
  );
}

function subscribeNoop() {
  return () => {};
}

function getClientReleases(): UpcomingRelease[] {
  return UPCOMING_RELEASES.filter((release) => {
    const releaseTime = new Date(release.releaseDate).getTime();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return releaseTime > thirtyDaysAgo;
  }).slice(0, 4);
}

const emptyReleases: UpcomingRelease[] = [];

function getServerReleases(): UpcomingRelease[] {
  return emptyReleases;
}

export default function ReleaseCountdown() {
  const relevantReleases = useSyncExternalStore(subscribeNoop, getClientReleases, getServerReleases);
  const mounted = relevantReleases !== emptyReleases;

  if (!mounted) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6" aria-busy="true">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-5 rounded shimmer-wave" />
          <div className="h-5 w-40 rounded shimmer-wave" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl shimmer-wave" />
          ))}
        </div>
      </section>
    );
  }

  if (relevantReleases.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-6" aria-label="Upcoming release countdowns">
      <div className="mb-5 flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-bold text-foreground">Release Countdown</h3>
      </div>

      <div className="space-y-3">
        {relevantReleases.map((release) => (
          <div
            key={release.id}
            className="relative overflow-hidden rounded-xl border border-border p-4 transition-colors hover:border-foreground/10"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${release.gradient} opacity-5`} aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${release.gradient}`}>
                  <Disc3 className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {release.title}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {release.artist} &middot; {release.genre}
                  </p>
                </div>
              </div>
              <CountdownTimer releaseDate={release.releaseDate} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
