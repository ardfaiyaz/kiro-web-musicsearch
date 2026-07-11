"use client";

import { useState, useRef, useEffect } from "react";
import { SortDesc, ChevronDown } from "lucide-react";

export type AlbumSortOption =
  | "recent"
  | "alphabetical"
  | "artist"
  | "releaseDate"
  | "trackCount";

interface AlbumSortingProps {
  value: AlbumSortOption;
  onChange: (sort: AlbumSortOption) => void;
}

const SORT_OPTIONS: { value: AlbumSortOption; label: string }[] = [
  { value: "recent", label: "Recently Added" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "artist", label: "Artist" },
  { value: "releaseDate", label: "Release Date" },
  { value: "trackCount", label: "Track Count" },
];

export default function AlbumSorting({ value, onChange }: AlbumSortingProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Sort";

  return (
    <div className="relative" ref={menuRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort by: ${currentLabel}`}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl glass-medium px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <SortDesc className="h-4 w-4 text-muted" aria-hidden="true" />
        <span className="hidden sm:inline">{currentLabel}</span>
        <ChevronDown
          className={`h-3 w-3 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sort options"
          className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl glass-heavy shadow-lg"
        >
          {SORT_OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-4 py-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 ${
                  value === option.value
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-foreground hover:bg-foreground/5"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
