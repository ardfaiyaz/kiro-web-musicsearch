"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "song", label: "Song" },
  { value: "artist", label: "Artist" },
  { value: "album", label: "Album" },
] as const;

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "releaseDate", label: "Release Date" },
  { value: "artistName", label: "Artist Name" },
  { value: "albumName", label: "Album Name" },
] as const;

const GENRE_OPTIONS = [
  { value: "", label: "All Genres" },
  { value: "Pop", label: "Pop" },
  { value: "Rock", label: "Rock" },
  { value: "Hip-Hop/Rap", label: "Hip-Hop" },
  { value: "Electronic", label: "Electronic" },
  { value: "Jazz", label: "Jazz" },
  { value: "Classical", label: "Classical" },
  { value: "Country", label: "Country" },
  { value: "R&B/Soul", label: "R&B" },
  { value: "Alternative", label: "Alternative" },
  { value: "Indie", label: "Indie" },
] as const;

const YEAR_OPTIONS = [
  { value: "", label: "All Years" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
  { value: "2020s", label: "2020-2021" },
  { value: "2010s", label: "2010s" },
  { value: "2000s", label: "2000s" },
  { value: "1990s", label: "1990s" },
  { value: "1980s", label: "1980s" },
  { value: "older", label: "Before 1980" },
] as const;

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get("filter") || "all";
  const currentSort = searchParams.get("sort") || "relevance";
  const currentGenre = searchParams.get("genre") || "";
  const currentYear = searchParams.get("year") || "";
  const currentExplicit = searchParams.get("explicit") || "";

  const hasActiveFilters =
    currentFilter !== "all" ||
    currentSort !== "relevance" ||
    currentGenre !== "" ||
    currentYear !== "" ||
    currentExplicit !== "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      const defaults: Record<string, string> = {
        filter: "all",
        sort: "relevance",
        genre: "",
        year: "",
        explicit: "",
      };

      if (value === defaults[key]) {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filter");
    params.delete("sort");
    params.delete("genre");
    params.delete("year");
    params.delete("explicit");
    router.push(`/?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <nav
      aria-label="Search filters"
      className="flex flex-col gap-4"
    >
      {/* Type filter buttons */}
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">Filter by type</legend>
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateParams("filter", option.value)}
            aria-pressed={currentFilter === option.value}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              currentFilter === option.value
                ? "bg-accent text-white"
                : "border border-border text-foreground hover:bg-card"
            }`}
          >
            {option.label}
          </button>
        ))}
      </fieldset>

      {/* Additional filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Genre filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="genre-select" className="text-sm font-medium text-muted">
            Genre:
          </label>
          <select
            id="genre-select"
            value={currentGenre}
            onChange={(e) => updateParams("genre", e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            {GENRE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="year-select" className="text-sm font-medium text-muted">
            Year:
          </label>
          <select
            id="year-select"
            value={currentYear}
            onChange={(e) => updateParams("year", e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            {YEAR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Explicit content toggle */}
        <div className="flex items-center gap-2">
          <label htmlFor="explicit-select" className="text-sm font-medium text-muted">
            Explicit:
          </label>
          <select
            id="explicit-select"
            value={currentExplicit}
            onChange={(e) => updateParams("explicit", e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            <option value="">All</option>
            <option value="hide">Hide Explicit</option>
            <option value="only">Explicit Only</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm font-medium text-muted">
            Sort:
          </label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => updateParams("sort", e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-card hover:text-foreground"
          >
            Clear Filters
          </button>
        )}
      </div>
    </nav>
  );
}
