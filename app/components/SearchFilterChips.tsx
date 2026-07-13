"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Music, User, Disc3, ListMusic, ChevronDown, Calendar } from "lucide-react";

const FILTER_OPTIONS = [
  { value: "all", label: "All", icon: null },
  { value: "song", label: "Songs", icon: Music },
  { value: "artist", label: "Artists", icon: User },
  { value: "album", label: "Albums", icon: Disc3 },
] as const;

const GENRE_OPTIONS = [
  { value: "", label: "All Genres" },
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "hip-hop", label: "Hip-Hop" },
  { value: "r&b", label: "R&B" },
  { value: "electronic", label: "Electronic" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
  { value: "country", label: "Country" },
  { value: "alternative", label: "Alternative" },
];

const DECADE_OPTIONS = [
  { value: "", label: "Any Era" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
  { value: "2020s", label: "2020s" },
  { value: "2010s", label: "2010s" },
  { value: "2000s", label: "2000s" },
  { value: "1990s", label: "1990s" },
  { value: "1980s", label: "1980s" },
  { value: "older", label: "Older" },
];

const DECADE_QUICK_CHIPS = [
  { value: "1980s", label: "80s" },
  { value: "1990s", label: "90s" },
  { value: "2000s", label: "2000s" },
  { value: "2010s", label: "2010s" },
  { value: "2020s", label: "2020s" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "releaseDate", label: "Release Date" },
  { value: "artistName", label: "Artist Name" },
  { value: "albumName", label: "Album Name" },
];

export default function SearchFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSecondary, setShowSecondary] = useState(false);

  const currentFilter = searchParams.get("filter") || "all";
  const currentGenre = searchParams.get("genre") || "";
  const currentYear = searchParams.get("year") || "";
  const currentSort = searchParams.get("sort") || "relevance";
  const currentExplicit = searchParams.get("explicit") || "";

  const hasActiveFilters =
    currentFilter !== "all" ||
    currentGenre !== "" ||
    currentYear !== "" ||
    currentSort !== "relevance" ||
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
      router.push(`/search?${params.toString()}`);
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
    router.push(`/search?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <nav aria-label="Search filters" className="flex flex-col gap-3">
      {/* Primary filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">Filter by type</legend>
          {FILTER_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = currentFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateParams("filter", option.value)}
                aria-pressed={isActive}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-premium ${
                  isActive
                    ? "bg-primary text-text-inverse shadow-sm"
                    : "glass-subtle text-foreground hover:glass-light"
                }`}
              >
                {Icon && <Icon size={14} aria-hidden="true" />}
                {option.label}
              </button>
            );
          })}
        </fieldset>

        {/* Decade quick-select chips */}
        <fieldset className="flex flex-wrap items-center gap-1.5">
          <legend className="sr-only">Filter by decade</legend>
          <Calendar size={14} className="text-muted mr-0.5" aria-hidden="true" />
          {DECADE_QUICK_CHIPS.map((chip) => {
            const isActive = currentYear === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => updateParams("year", isActive ? "" : chip.value)}
                aria-pressed={isActive}
                className={`inline-flex cursor-pointer items-center rounded-full px-3 py-1.5 text-xs font-medium transition-premium ${
                  isActive
                    ? "bg-primary text-text-inverse shadow-sm"
                    : "glass-subtle text-muted hover:text-foreground hover:glass-light"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </fieldset>

        {/* Toggle secondary filters */}
        <button
          type="button"
          onClick={() => setShowSecondary(!showSecondary)}
          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-medium text-muted transition-premium hover:text-foreground hover:border-foreground/20"
          aria-expanded={showSecondary}
          aria-controls="secondary-filters"
        >
          <ListMusic size={14} aria-hidden="true" />
          More Filters
          <ChevronDown
            size={12}
            className={`transition-transform ${showSecondary ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer rounded-full border border-border px-3 py-2 text-xs font-medium text-muted transition-premium hover:text-foreground hover:border-foreground/20"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Secondary filters */}
      {showSecondary && (
        <div
          id="secondary-filters"
          className="flex flex-wrap items-center gap-3 rounded-xl glass-subtle p-3 animate-fade-in"
        >
          {/* Genre dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="genre-filter" className="text-xs font-medium text-muted">
              Genre:
            </label>
            <select
              id="genre-filter"
              value={currentGenre}
              onChange={(e) => updateParams("genre", e.target.value)}
              className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
            >
              {GENRE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Decade dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="decade-filter" className="text-xs font-medium text-muted">
              Era:
            </label>
            <select
              id="decade-filter"
              value={currentYear}
              onChange={(e) => updateParams("year", e.target.value)}
              className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
            >
              {DECADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-filter" className="text-xs font-medium text-muted">
              Sort:
            </label>
            <select
              id="sort-filter"
              value={currentSort}
              onChange={(e) => updateParams("sort", e.target.value)}
              className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Explicit toggle */}
          <div className="flex items-center gap-2">
            <label htmlFor="explicit-filter" className="text-xs font-medium text-muted">
              Explicit:
            </label>
            <select
              id="explicit-filter"
              value={currentExplicit}
              onChange={(e) => updateParams("explicit", e.target.value)}
              className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
            >
              <option value="">Show All</option>
              <option value="hide">Hide Explicit</option>
              <option value="only">Explicit Only</option>
            </select>
          </div>
        </div>
      )}
    </nav>
  );
}
