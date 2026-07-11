"use client";

import { useState, useCallback } from "react";
import { HardDrive, Trash2 } from "lucide-react";

interface StorageCategory {
  key: string;
  label: string;
  storageKeys: string[];
  size: number;
}

const STORAGE_CATEGORIES: Array<Omit<StorageCategory, "size">> = [
  {
    key: "favorites",
    label: "Favorites",
    storageKeys: ["music-search-favorites"],
  },
  {
    key: "settings",
    label: "App Settings",
    storageKeys: ["app-settings", "theme", "playback-settings", "privacy-settings"],
  },
  {
    key: "search-history",
    label: "Search History",
    storageKeys: ["music-search-recent"],
  },
  {
    key: "listening-history",
    label: "Listening History",
    storageKeys: [
      "playback-history",
      "music-search-recently-played",
      "music-search-listening-history",
    ],
  },
  {
    key: "collections",
    label: "Collections & Playlists",
    storageKeys: ["music-search-collections", "music-search-playlists"],
  },
  {
    key: "personalization",
    label: "Personalization",
    storageKeys: ["music-search-favorite-artists", "music-search-favorite-albums"],
  },
];

function getStorageSize(keys: string[]): number {
  let totalBytes = 0;
  try {
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) {
        // Approximate size: key length + value length, each char is ~2 bytes in UTF-16
        totalBytes += (key.length + value.length) * 2;
      }
    }
  } catch {
    // Ignore errors
  }
  return totalBytes;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function calculateInitialSizes(): { categories: StorageCategory[]; total: number } {
  const cats: StorageCategory[] = STORAGE_CATEGORIES.map((cat) => ({
    ...cat,
    size: getStorageSize(cat.storageKeys),
  }));
  const total = cats.reduce((sum, c) => sum + c.size, 0);
  return { categories: cats, total };
}

export default function StorageSettings() {
  const [categories, setCategories] = useState<StorageCategory[]>(
    () => calculateInitialSizes().categories
  );
  const [totalSize, setTotalSize] = useState(
    () => calculateInitialSizes().total
  );
  const [cleared, setCleared] = useState<string | null>(null);

  const recalculate = useCallback(() => {
    const { categories: cats, total } = calculateInitialSizes();
    setCategories(cats);
    setTotalSize(total);
  }, []);

  const handleClearCategory = (category: StorageCategory) => {
    try {
      for (const key of category.storageKeys) {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore errors
    }
    setCleared(category.key);
    recalculate();
    setTimeout(() => setCleared(null), 2000);
  };

  const handleClearAll = () => {
    try {
      for (const cat of STORAGE_CATEGORIES) {
        for (const key of cat.storageKeys) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // Ignore errors
    }
    setCleared("all");
    recalculate();
    setTimeout(() => setCleared(null), 2000);
  };

  return (
    <section aria-labelledby="storage-heading" className="space-y-6">
      <div className="flex items-center gap-2">
        <HardDrive size={20} className="text-muted" aria-hidden="true" />
        <h2 id="storage-heading" className="text-lg font-semibold text-foreground">
          Storage
        </h2>
      </div>

      {/* Total Usage */}
      <div className="rounded-xl bg-surface px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Total localStorage Usage
          </span>
          <span className="text-sm font-mono text-muted">{formatBytes(totalSize)}</span>
        </div>
        {/* Visual bar */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-foreground/50 transition-all duration-300"
            style={{
              width: `${Math.min((totalSize / (5 * 1024 * 1024)) * 100, 100)}%`,
            }}
            role="progressbar"
            aria-valuenow={totalSize}
            aria-valuemax={5 * 1024 * 1024}
            aria-label="Storage usage"
          />
        </div>
        <p className="mt-1 text-xs text-muted">
          {formatBytes(totalSize)} of ~5 MB browser limit
        </p>
      </div>

      {/* Per-category breakdown */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Data Categories</h3>
        {categories.map((category) => (
          <div
            key={category.key}
            className="flex items-center justify-between rounded-xl bg-surface px-4 py-3"
          >
            <div>
              <span className="text-sm text-foreground">{category.label}</span>
              <p className="text-xs text-muted">{formatBytes(category.size)}</p>
            </div>
            <button
              onClick={() => handleClearCategory(category)}
              disabled={category.size === 0}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-premium hover:bg-surface-hover hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={`Clear ${category.label}`}
            >
              {cleared === category.key ? (
                <span className="text-green-500">Cleared</span>
              ) : (
                <>
                  <Trash2 size={12} aria-hidden="true" />
                  Clear
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Clear All */}
      <button
        onClick={handleClearAll}
        disabled={totalSize === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500 transition-premium hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Trash2 size={14} aria-hidden="true" />
        {cleared === "all" ? "All Data Cleared" : "Clear All Storage"}
      </button>
    </section>
  );
}
