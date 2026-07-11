"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";

const PLACEHOLDER_SUGGESTIONS = [
  "Taylor Swift",
  "Bohemian Rhapsody",
  "Lo-fi beats",
  "Jazz classics",
  "The Weeknd",
  "Summer hits",
  "Indie rock",
  "Piano ballads",
];

const GENRE_PILLS = [
  { label: "Pop", query: "pop hits" },
  { label: "Hip-Hop", query: "hip hop" },
  { label: "Rock", query: "rock classics" },
  { label: "R&B", query: "r&b" },
  { label: "Electronic", query: "electronic dance" },
  { label: "Jazz", query: "jazz" },
  { label: "Classical", query: "classical" },
  { label: "Country", query: "country" },
];

const TRENDING_ARTISTS = [
  "Taylor Swift",
  "Drake",
  "BTS",
  "Billie Eilish",
  "The Weeknd",
  "Bad Bunny",
];

export default function SearchHero() {
  const router = useRouter();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_SUGGESTIONS.length);
        setIsAnimating(false);
      }, 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickSearch = useCallback(
    (term: string) => {
      router.push(`/?q=${encodeURIComponent(term)}`);
    },
    [router]
  );

  return (
    <section
      className="relative flex flex-col items-center gap-8 px-4 py-16 sm:py-24"
      aria-label="Search for music"
    >
      {/* Heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Discover Your Sound
        </h1>
        <p className="max-w-lg text-base text-muted sm:text-lg">
          Search millions of songs, artists, and albums across multiple platforms
        </p>
      </div>

      {/* Large Search Input */}
      <div className="w-full max-w-2xl">
        <button
          type="button"
          onClick={() => {
            const searchInput = document.querySelector<HTMLInputElement>(
              'input[aria-label="Search music"]'
            );
            if (searchInput) {
              searchInput.focus();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="group flex w-full items-center gap-4 rounded-2xl glass-heavy px-6 py-5 text-left transition-premium hover:shadow-lg"
          aria-label="Open search"
        >
          <Search
            size={22}
            className="shrink-0 text-muted transition-premium group-hover:text-primary"
            aria-hidden="true"
          />
          <span
            className={`flex-1 text-base text-muted transition-all sm:text-lg ${
              isAnimating ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            }`}
          >
            Try searching for &ldquo;{PLACEHOLDER_SUGGESTIONS[placeholderIndex]}&rdquo;
          </span>
          <kbd className="hidden items-center gap-0.5 rounded-md border border-border bg-surface px-2 py-1 font-mono text-xs text-muted sm:flex">
            <span className="text-[10px]">&#8984;</span>K
          </kbd>
        </button>
      </div>

      {/* Genre Pills */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Quick explore
          </span>
        </div>
        <div
          className="flex flex-wrap justify-center gap-2"
          role="list"
          aria-label="Genre shortcuts"
        >
          {GENRE_PILLS.map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={() => handleQuickSearch(pill.query)}
              className="rounded-full glass-subtle px-4 py-2 text-sm font-medium text-foreground transition-premium hover:glass-light hover:scale-105 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              role="listitem"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Artists */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          Trending artists
        </span>
        <div
          className="flex flex-wrap justify-center gap-2"
          role="list"
          aria-label="Trending artists"
        >
          {TRENDING_ARTISTS.map((artist) => (
            <button
              key={artist}
              type="button"
              onClick={() => handleQuickSearch(artist)}
              className="rounded-full border border-border px-3 py-1.5 text-sm text-muted transition-premium hover:border-primary/30 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              role="listitem"
            >
              {artist}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
