"use client";

import { Filter } from "lucide-react";
import type { ItunesArtist } from "@/lib/types";

export interface ArtistFilterState {
  genres: string[];
  recentlyAdded: boolean;
}

interface ArtistFiltersProps {
  artists: ItunesArtist[];
  filters: ArtistFilterState;
  onChange: (filters: ArtistFilterState) => void;
}

export default function ArtistFilters({
  artists,
  filters,
  onChange,
}: ArtistFiltersProps) {
  const allGenres = Array.from(
    new Set(artists.map((a) => a.primaryGenreName).filter(Boolean))
  ).sort();

  function toggleGenre(genre: string) {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter((g) => g !== genre)
      : [...filters.genres, genre];
    onChange({ ...filters, genres: newGenres });
  }

  function toggleRecentlyAdded() {
    onChange({ ...filters, recentlyAdded: !filters.recentlyAdded });
  }

  function clearAll() {
    onChange({ genres: [], recentlyAdded: false });
  }

  const hasActiveFilters = filters.genres.length > 0 || filters.recentlyAdded;

  return (
    <div className="space-y-3" role="group" aria-label="Filter artists">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted" aria-hidden="true" />
        <span className="text-xs font-medium text-muted">Filters</span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto text-xs text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={toggleRecentlyAdded}
          aria-pressed={filters.recentlyAdded}
          className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 ${
            filters.recentlyAdded
              ? "bg-accent text-white"
              : "glass-medium text-muted hover:text-foreground"
          }`}
        >
          Recently Added
        </button>
        {allGenres.map((genre) => (
          <button
            key={genre}
            type="button"
            onClick={() => toggleGenre(genre)}
            aria-pressed={filters.genres.includes(genre)}
            className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 ${
              filters.genres.includes(genre)
                ? "bg-accent text-white"
                : "glass-medium text-muted hover:text-foreground"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}
