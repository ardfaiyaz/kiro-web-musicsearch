"use client";

import Link from "next/link";
import { Music, TrendingUp, Users } from "lucide-react";

export default function EmptyHistory() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-8 py-20 text-center animate-fade-in"
      aria-label="Empty listening history"
    >
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full glass-subtle">
        <svg
          viewBox="0 0 80 80"
          className="h-16 w-16 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <circle cx="40" cy="40" r="30" />
          <circle cx="40" cy="40" r="10" />
          <path d="M40 10 L40 5" />
          <path d="M55 15 L58 11" />
          <path d="M65 30 L70 28" />
          <path d="M55 55 L58 58" />
          <path d="M25 55 L22 58" />
          <path d="M15 30 L10 28" />
          <path d="M25 15 L22 11" />
          <path
            d="M52 20 C52 20 56 25 56 32 C56 39 52 44 52 44"
            strokeLinecap="round"
          />
          <path
            d="M48 26 C48 26 50 29 50 32 C50 35 48 38 48 38"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10">
          <Music className="h-4 w-4 text-muted" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-foreground">
          You haven&apos;t listened to anything yet
        </h3>
        <p className="max-w-md text-muted">
          Start exploring music and your listening history will appear here.
          Track your progress, sessions, and discover patterns in your listening
          habits.
        </p>
      </div>

      <nav
        className="flex flex-wrap items-center justify-center gap-3"
        aria-label="Browse suggestions"
      >
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-premium hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2"
        >
          <Music className="h-4 w-4" aria-hidden="true" />
          Browse Music
        </Link>
        <Link
          href="/?q=trending"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full glass-medium px-6 py-3 text-sm font-medium text-foreground transition-premium hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2"
        >
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Trending Songs
        </Link>
        <Link
          href="/?q=popular artists"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full glass-medium px-6 py-3 text-sm font-medium text-foreground transition-premium hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          Popular Artists
        </Link>
      </nav>
    </section>
  );
}
