"use client";

import { Filter } from "lucide-react";
import type { ItunesAlbum } from "@/lib/types";

export interface AlbumFilterState {
  genres: string[];
  artists: string[];
  decades: string[];
  recentlyAdded: boolean;
}

interface AlbumFiltersProps {
  albums: ItunesAlbum[];
  filters: AlbumFilterState;
  onChange: (filters: AlbumFilterState) => void;
}

function getDecade(releaseDate: string): string {
  const year = new Date(releaseDate).getFullYear();
  if (isNaN(year)) return "Unknown";
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

export default function AlbumFilters({
  albums,
  filters,
  onChange,
}: AlbumFiltersProps) {
  const allGenres = Array.from(
    new Set(albums.map((a) => a.primaryGenreName).filter(Boolean))
  ).sort();

  const allArtists = Array.from(
    new Set(albums.map((a) => a.artistName).filter(Boolean))
  ).sort();

  const allDecades = Array.from(
    new Set(albums.map((a) => getDecade(a.releaseDate)).filter((d) => d !== "Unknown"))
  ).sort();

  function toggleGenre(genre: string) {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter((g) => g !== genre)
      : [...filters.genres, genre];
    onChange({ ...filters, genres: newGenres });
  }

  function toggleArtist(artist: string) {
    const newArtists = filters.artists.includes(artist)
      ? filters.artists.filter((a) => a !== artist)
      : [...filters.artists, artist];
    onChange({ ...filters, artists: newArtists });
  }

  function toggleDecade(decade: string) {
    const newDecades = filters.decades.includes(decade)
      ? filters.decades.filter((d) => d !== decade)
      : [...filters.decades, decade];
    onChange({ ...filters, decades: newDecades });
  }

  function toggleRecentlyAdded() {
    onChange({ ...filters, recentlyAdded: !filters.recentlyAdded });
  }

  function clearAll() {
    onChange({ genres: [], artists: [], decades: [], recentlyAdded: false });
  }

  const hasActiveFilters =
    filters.genres.length > 0 ||
    filters.artists.length > 0 ||
    filters.decades.length > 0 ||
    filters.recentlyAdded;

  return (
    <div className="space-y-4" role="group" aria-label="Filter albums">
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

      {/* Recently Added */}
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
      </div>

      {/* Genre Filters */}
      {allGenres.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Genres
          </span>
          <div className="flex flex-wrap gap-2">
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
      )}

      {/* Artist Filters */}
      {allArtists.length > 1 && (
        <div className="space-y-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Artists
          </span>
          <div className="flex flex-wrap gap-2">
            {allArtists.slice(0, 10).map((artist) => (
              <button
                key={artist}
                type="button"
                onClick={() => toggleArtist(artist)}
                aria-pressed={filters.artists.includes(artist)}
                className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 ${
                  filters.artists.includes(artist)
                    ? "bg-accent text-white"
                    : "glass-medium text-muted hover:text-foreground"
                }`}
              >
                {artist}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Decade Filters */}
      {allDecades.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Decades
          </span>
          <div className="flex flex-wrap gap-2">
            {allDecades.map((decade) => (
              <button
                key={decade}
                type="button"
                onClick={() => toggleDecade(decade)}
                aria-pressed={filters.decades.includes(decade)}
                className={`min-h-[44px] rounded-xl px-4 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 ${
                  filters.decades.includes(decade)
                    ? "bg-accent text-white"
                    : "glass-medium text-muted hover:text-foreground"
                }`}
              >
                {decade}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
