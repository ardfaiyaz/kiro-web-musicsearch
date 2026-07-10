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
] as const;

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get("filter") || "all";
  const currentSort = searchParams.get("sort") || "relevance";

  const hasActiveFilters = currentFilter !== "all" || currentSort !== "relevance";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (
        (key === "filter" && value === "all") ||
        (key === "sort" && value === "relevance")
      ) {
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
    router.push(`/?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <nav
      aria-label="Search filters"
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">Filter by type</legend>
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateParams("filter", option.value)}
            aria-pressed={currentFilter === option.value}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              currentFilter === option.value
                ? "bg-accent text-white"
                : "border border-border text-foreground hover:bg-card"
            }`}
          >
            {option.label}
          </button>
        ))}
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="sort-select" className="text-sm font-medium text-muted">
          Sort by:
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="w-full cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground sm:w-auto"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-card hover:text-foreground"
          >
            Clear Filters
          </button>
        )}
      </div>
    </nav>
  );
}
