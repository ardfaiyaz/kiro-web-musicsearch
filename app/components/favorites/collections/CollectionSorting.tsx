"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SortDesc } from "lucide-react";

export type CollectionSortOption =
  | "recently-updated"
  | "recently-created"
  | "alphabetical"
  | "item-count";

interface CollectionSortingProps {
  value: CollectionSortOption;
  onChange: (sort: CollectionSortOption) => void;
}

const SORT_OPTIONS: { value: CollectionSortOption; label: string }[] = [
  { value: "recently-updated", label: "Recently Updated" },
  { value: "recently-created", label: "Recently Created" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "item-count", label: "Item Count" },
];

export default function CollectionSorting({
  value,
  onChange,
}: CollectionSortingProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, handleClickOutside]);

  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === value)?.label || "Sort";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex min-h-[36px] items-center gap-2 rounded-xl glass-medium px-3 py-1.5 text-xs font-medium text-foreground transition-premium hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort by: ${currentLabel}`}
      >
        <SortDesc className="h-3.5 w-3.5" aria-hidden="true" />
        {currentLabel}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Sort options"
          className="absolute right-0 top-full z-30 mt-2 w-48 rounded-xl glass-heavy p-1.5 shadow-xl animate-fade-in"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 ${
                value === option.value
                  ? "bg-accent/20 text-foreground font-medium"
                  : "text-muted hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
