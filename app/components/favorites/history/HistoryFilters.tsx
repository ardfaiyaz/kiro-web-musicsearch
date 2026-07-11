"use client";

import { useMemo, useCallback } from "react";
import { Filter } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

export type TimeFilter = "all" | "today" | "week" | "month";
export type CompletionFilter = "all" | "completed" | "incomplete";

export interface HistoryFilterState {
  time: TimeFilter;
  completion: CompletionFilter;
  genre: string;
}

interface HistoryFiltersProps {
  filters: HistoryFilterState;
  onFiltersChange: (filters: HistoryFilterState) => void;
  history: HistoryEntry[];
}

export default function HistoryFilters({
  filters,
  onFiltersChange,
  history,
}: HistoryFiltersProps) {
  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    for (const entry of history) {
      if (entry.primaryGenreName) {
        genreSet.add(entry.primaryGenreName);
      }
    }
    return [...genreSet].sort();
  }, [history]);

  const handleTimeChange = useCallback(
    (time: TimeFilter) => {
      onFiltersChange({ ...filters, time });
    },
    [filters, onFiltersChange]
  );

  const handleCompletionChange = useCallback(
    (completion: CompletionFilter) => {
      onFiltersChange({ ...filters, completion });
    },
    [filters, onFiltersChange]
  );

  const handleGenreChange = useCallback(
    (genre: string) => {
      onFiltersChange({ ...filters, genre });
    },
    [filters, onFiltersChange]
  );

  const timeOptions: { value: TimeFilter; label: string }[] = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  const completionOptions: { value: CompletionFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "completed", label: "Completed" },
    { value: "incomplete", label: "Incomplete" },
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="History filters"
    >
      <Filter className="h-4 w-4 text-muted" aria-hidden="true" />

      {/* Time filters */}
      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Time period filter">
        {timeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={filters.time === opt.value}
            onClick={() => handleTimeChange(opt.value)}
            className={`inline-flex min-h-[44px] items-center rounded-full px-3 py-1.5 text-xs font-medium transition-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
              filters.time === opt.value
                ? "bg-foreground text-background"
                : "glass-subtle text-muted hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Completion filters */}
      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Completion filter">
        {completionOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={filters.completion === opt.value}
            onClick={() => handleCompletionChange(opt.value)}
            className={`inline-flex min-h-[44px] items-center rounded-full px-3 py-1.5 text-xs font-medium transition-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
              filters.completion === opt.value
                ? "bg-foreground text-background"
                : "glass-subtle text-muted hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Genre filter */}
      {genres.length > 0 && (
        <select
          value={filters.genre}
          onChange={(e) => handleGenreChange(e.target.value)}
          className="min-h-[44px] rounded-xl glass-subtle border-0 px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
          aria-label="Filter by genre"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
