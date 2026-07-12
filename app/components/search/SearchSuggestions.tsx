"use client";

import Image from "next/image";
import { Clock, TrendingUp, X, Music } from "lucide-react";
import { RecentSearch } from "@/lib/types";

interface SearchSuggestionsProps {
  recentSearches: RecentSearch[];
  trendingSearches: string[];
  activeIndex: number;
  onRecentClick: (recent: RecentSearch) => void;
  onTrendingClick: (term: string) => void;
  onClearRecent: () => void;
  getItemIndex: (type: "recent" | "trending", index: number) => number;
}

export default function SearchSuggestions({
  recentSearches,
  trendingSearches,
  activeIndex,
  onRecentClick,
  onTrendingClick,
  onClearRecent,
  getItemIndex,
}: SearchSuggestionsProps) {
  const hasRecent = recentSearches.length > 0;

  return (
    <>
      {hasRecent && (
        <>
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-muted" aria-hidden="true" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                Recent Searches
              </span>
            </div>
            <button
              type="button"
              onClick={onClearRecent}
              className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
              aria-label="Clear recent searches"
            >
              <X size={10} aria-hidden="true" />
              Clear
            </button>
          </div>
          {recentSearches.map((r, idx) => (
            <button
              key={r.timestamp}
              id={`search-item-${getItemIndex("recent", idx)}`}
              type="button"
              onClick={() => onRecentClick(r)}
              className={`flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-foreground transition-colors hover:bg-foreground/5 ${
                activeIndex === getItemIndex("recent", idx) ? "bg-foreground/10" : ""
              }`}
              role="option"
              aria-selected={activeIndex === getItemIndex("recent", idx)}
            >
              {r.imageUrl ? (
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-border">
                  <Image
                    src={r.imageUrl}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
                  <Music size={12} className="text-muted" aria-hidden="true" />
                </span>
              )}
              <span className="truncate">{r.query}</span>
            </button>
          ))}
        </>
      )}

      {/* Trending Searches */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <TrendingUp size={12} className="text-muted" aria-hidden="true" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
          Try searching for:
        </span>
      </div>
      {trendingSearches.map((term, idx) => (
        <button
          key={term}
          id={`search-item-${getItemIndex("trending", idx)}`}
          type="button"
          onClick={() => onTrendingClick(term)}
          className={`flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-foreground transition-colors hover:bg-foreground/5 ${
            activeIndex === getItemIndex("trending", idx) ? "bg-foreground/10" : ""
          }`}
          role="option"
          aria-selected={activeIndex === getItemIndex("trending", idx)}
        >
          <TrendingUp size={14} className="shrink-0 text-muted/70" aria-hidden="true" />
          <span className="truncate">{term}</span>
        </button>
      ))}
    </>
  );
}
