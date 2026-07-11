"use client";

import Image from "next/image";
import { Music, User, Disc3 } from "lucide-react";

interface Suggestion {
  trackId: number;
  trackName: string;
  artistName: string;
  type: "track" | "artist" | "album";
  imageUrl?: string;
  albumName?: string;
}

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  track: "bg-primary/10 text-primary border-primary/20",
  artist: "bg-secondary/10 text-secondary border-secondary/20",
  album: "bg-info/10 text-info border-info/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  track: "Song",
  artist: "Artist",
  album: "Album",
};

interface InstantResultsProps {
  suggestions: Suggestion[];
  activeIndex: number;
  isFetching: boolean;
  onSuggestionClick: (suggestion: Suggestion) => void;
}

export default function InstantResults({
  suggestions,
  activeIndex,
  isFetching,
  onSuggestionClick,
}: InstantResultsProps) {
  if (isFetching && suggestions.length === 0) {
    return (
      <div className="px-5 py-3" aria-busy="true" aria-label="Loading suggestions">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <div className="h-9 w-9 rounded-lg shimmer-wave" />
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-3.5 w-3/4 rounded shimmer-wave" />
              <div className="h-2.5 w-1/2 rounded shimmer-wave" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="border-b border-border px-5 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
          Top Results
        </span>
      </div>
      {suggestions.map((s, idx) => (
        <button
          key={`${s.type}-${s.trackId}-${idx}`}
          id={`search-item-${idx}`}
          type="button"
          onClick={() => onSuggestionClick(s)}
          className={`flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-foreground transition-colors hover:bg-foreground/5 ${
            activeIndex === idx ? "bg-foreground/10" : ""
          } ${idx === 0 ? "bg-foreground/[0.03]" : ""}`}
          role="option"
          aria-selected={activeIndex === idx}
        >
          {s.imageUrl ? (
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-border">
              <Image
                src={s.imageUrl}
                alt=""
                fill
                sizes="36px"
                className="object-cover"
              />
            </span>
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
              {s.type === "artist" ? (
                <User size={14} className="text-muted" aria-hidden="true" />
              ) : s.type === "album" ? (
                <Disc3 size={14} className="text-muted" aria-hidden="true" />
              ) : (
                <Music size={14} className="text-muted" aria-hidden="true" />
              )}
            </span>
          )}
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate font-medium text-sm">
              {s.type === "artist" ? s.artistName : s.trackName}
            </span>
            {s.type !== "artist" && (
              <span className="truncate text-xs text-muted">{s.artistName}</span>
            )}
          </div>
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CATEGORY_BADGE_STYLES[s.type]}`}
          >
            {CATEGORY_LABELS[s.type]}
          </span>
        </button>
      ))}
    </>
  );
}
