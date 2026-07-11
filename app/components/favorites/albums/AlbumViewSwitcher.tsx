"use client";

import { Grid3X3, Rows3, LayoutList, List } from "lucide-react";

export type AlbumViewMode = "gallery" | "shelf" | "compact" | "list";

const VIEW_STORAGE_KEY = "music-search-album-view-pref";

interface AlbumViewSwitcherProps {
  value: AlbumViewMode;
  onChange: (mode: AlbumViewMode) => void;
}

const VIEW_OPTIONS: { value: AlbumViewMode; label: string; icon: React.ReactNode }[] = [
  { value: "gallery", label: "Gallery", icon: <Grid3X3 className="h-4 w-4" aria-hidden="true" /> },
  { value: "shelf", label: "Shelf", icon: <Rows3 className="h-4 w-4" aria-hidden="true" /> },
  { value: "compact", label: "Compact", icon: <LayoutList className="h-4 w-4" aria-hidden="true" /> },
  { value: "list", label: "List", icon: <List className="h-4 w-4" aria-hidden="true" /> },
];

export function getStoredViewMode(): AlbumViewMode {
  if (typeof window === "undefined") return "gallery";
  const stored = localStorage.getItem(VIEW_STORAGE_KEY);
  if (stored === "gallery" || stored === "shelf" || stored === "compact" || stored === "list") {
    return stored;
  }
  return "gallery";
}

export function setStoredViewMode(mode: AlbumViewMode): void {
  localStorage.setItem(VIEW_STORAGE_KEY, mode);
}

export default function AlbumViewSwitcher({ value, onChange }: AlbumViewSwitcherProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl glass-light p-1" role="radiogroup" aria-label="Album view mode">
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          aria-label={`${option.label} view`}
          onClick={() => {
            onChange(option.value);
            setStoredViewMode(option.value);
          }}
          className={`flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg px-2 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 ${
            value === option.value
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-foreground hover:bg-foreground/5"
          }`}
        >
          {option.icon}
          <span className="ml-1.5 hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
