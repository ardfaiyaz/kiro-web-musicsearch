"use client";

import Link from "next/link";
import { BarChart3, Music, TrendingUp, Users } from "lucide-react";

export default function EmptyInsights() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center animate-fade-in">
      {/* Chart SVG illustration */}
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-foreground/5">
        <svg
          className="h-16 w-16 text-muted"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect x="8" y="36" width="8" height="20" rx="2" opacity="0.3" />
          <rect x="20" y="24" width="8" height="32" rx="2" opacity="0.5" />
          <rect x="32" y="16" width="8" height="40" rx="2" opacity="0.7" />
          <rect x="44" y="8" width="8" height="48" rx="2" opacity="0.9" />
          <line x1="4" y1="58" x2="60" y2="58" strokeWidth="1.5" />
        </svg>
        <BarChart3
          className="absolute -right-2 -top-2 h-8 w-8 text-foreground/30"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          Start listening to unlock insights
        </h3>
        <p className="max-w-md text-sm text-muted">
          Play music and your listening analytics will appear here - discover
          patterns, track milestones, and watch your taste evolve over time.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-premium hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2"
        >
          <Music className="h-4 w-4" aria-hidden="true" />
          Browse Music
        </Link>
        <Link
          href="/?term=trending"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full glass-light px-6 py-3 text-sm font-medium text-foreground transition-premium hover:glass-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2"
        >
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Trending Songs
        </Link>
        <Link
          href="/?term=top artists"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full glass-light px-6 py-3 text-sm font-medium text-foreground transition-premium hover:glass-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          Discover Artists
        </Link>
      </div>
    </div>
  );
}
