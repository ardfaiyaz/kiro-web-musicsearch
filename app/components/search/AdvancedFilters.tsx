"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";

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
  { value: "indie", label: "Indie" },
  { value: "metal", label: "Metal" },
  { value: "latin", label: "Latin" },
  { value: "folk", label: "Folk" },
  { value: "reggae", label: "Reggae" },
  { value: "blues", label: "Blues" },
];

const YEAR_OPTIONS = [
  { value: "", label: "Any Year" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
  { value: "2020s", label: "2020-2021" },
  { value: "2010s", label: "2010s" },
  { value: "2000s", label: "2000s" },
  { value: "1990s", label: "1990s" },
  { value: "1980s", label: "1980s" },
  { value: "older", label: "Before 1980" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "releaseDate", label: "Release Date" },
  { value: "artistName", label: "Artist Name" },
  { value: "albumName", label: "Album Name" },
];

const EXPLICIT_OPTIONS = [
  { value: "", label: "Show All" },
  { value: "hide", label: "Hide Explicit" },
  { value: "only", label: "Explicit Only" },
];

interface AdvancedFiltersProps {
  isOpen: boolean;
}

export default function AdvancedFilters({ isOpen }: AdvancedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentGenre = searchParams.get("genre") || "";
  const currentYear = searchParams.get("year") || "";
  const currentSort = searchParams.get("sort") || "relevance";
  const currentExplicit = searchParams.get("explicit") || "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const defaults: Record<string, string> = {
        genre: "",
        year: "",
        sort: "relevance",
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

  if (!isOpen) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-4 rounded-xl glass-subtle p-4 animate-fade-in"
      role="group"
      aria-label="Advanced search filters"
    >
      <div className="flex items-center gap-2 text-muted">
        <SlidersHorizontal size={14} aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Filters
        </span>
      </div>

      {/* Genre multi-select */}
      <div className="flex items-center gap-2">
        <label htmlFor="adv-genre" className="text-xs font-medium text-muted">
          Genre:
        </label>
        <select
          id="adv-genre"
          value={currentGenre}
          onChange={(e) => updateParam("genre", e.target.value)}
          className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {GENRE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Year range */}
      <div className="flex items-center gap-2">
        <label htmlFor="adv-year" className="text-xs font-medium text-muted">
          Year:
        </label>
        <select
          id="adv-year"
          value={currentYear}
          onChange={(e) => updateParam("year", e.target.value)}
          className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {YEAR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Explicit content */}
      <div className="flex items-center gap-2">
        <label htmlFor="adv-explicit" className="text-xs font-medium text-muted">
          Content:
        </label>
        <select
          id="adv-explicit"
          value={currentExplicit}
          onChange={(e) => updateParam("explicit", e.target.value)}
          className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {EXPLICIT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <label htmlFor="adv-sort" className="text-xs font-medium text-muted">
          Sort:
        </label>
        <select
          id="adv-sort"
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
