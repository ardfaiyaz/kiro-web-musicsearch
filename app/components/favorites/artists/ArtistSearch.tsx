"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface ArtistSearchProps {
  value: string;
  onChange: (query: string) => void;
}

export default function ArtistSearch({ value, onChange }: ArtistSearchProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function handleChange(newValue: string) {
    setLocalValue(newValue);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 150);
  }

  function handleClear() {
    setLocalValue("");
    onChange("");
    inputRef.current?.focus();
  }

  return (
    <div className="relative flex-1">
      <label htmlFor="artist-search" className="sr-only">
        Search favorite artists
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id="artist-search"
        type="search"
        placeholder="Search by name or genre..."
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className="min-h-[44px] w-full rounded-xl glass-light pl-10 pr-10 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus-visible:ring-2 focus-visible:ring-accent/50"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
