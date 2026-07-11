"use client";

import { useState, useCallback } from "react";
import { Shield, Trash2, AlertTriangle } from "lucide-react";
import { clearRecentSearches } from "@/lib/recent-searches";

const PRIVACY_SETTINGS_KEY = "privacy-settings";

interface PrivacySettingsData {
  saveSearchHistory: boolean;
  collectListeningData: boolean;
}

const defaultPrivacySettings: PrivacySettingsData = {
  saveSearchHistory: true,
  collectListeningData: true,
};

function loadPrivacySettings(): PrivacySettingsData {
  if (typeof window === "undefined") return defaultPrivacySettings;
  try {
    const stored = localStorage.getItem(PRIVACY_SETTINGS_KEY);
    if (stored) {
      return { ...defaultPrivacySettings, ...JSON.parse(stored) };
    }
  } catch {
    // Use defaults
  }
  return defaultPrivacySettings;
}

function savePrivacySettingsToStorage(settings: PrivacySettingsData): void {
  try {
    localStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage might be unavailable
  }
}

export default function PrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettingsData>(() => loadPrivacySettings());
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [cleared, setCleared] = useState<string | null>(null);

  const updateSetting = <K extends keyof PrivacySettingsData>(
    key: K,
    value: PrivacySettingsData[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    savePrivacySettingsToStorage(updated);
  };

  const handleClearSearchHistory = useCallback(() => {
    clearRecentSearches();
    setCleared("search");
    setTimeout(() => setCleared(null), 2000);
  }, []);

  const handleClearListeningHistory = useCallback(() => {
    try {
      localStorage.removeItem("playback-history");
      localStorage.removeItem("music-search-recently-played");
      localStorage.removeItem("music-search-listening-history");
    } catch {
      // Ignore errors
    }
    setCleared("listening");
    setTimeout(() => setCleared(null), 2000);
  }, []);

  const handleClearAllData = useCallback(() => {
    try {
      // Clear all app-related localStorage keys
      const keysToRemove = [
        "music-search-recent",
        "music-search-favorites",
        "music-search-recently-played",
        "music-search-listening-history",
        "music-search-favorite-artists",
        "music-search-favorite-albums",
        "music-search-playlists",
        "music-search-collections",
        "playback-history",
        "playback-settings",
        "privacy-settings",
      ];
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch {
      // Ignore errors
    }
    setShowClearAllConfirm(false);
    setCleared("all");
    setTimeout(() => setCleared(null), 2000);
  }, []);

  return (
    <section aria-labelledby="privacy-heading" className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield size={20} className="text-muted" aria-hidden="true" />
        <h2 id="privacy-heading" className="text-lg font-semibold text-foreground">
          Privacy
        </h2>
      </div>

      {/* Save Search History */}
      <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3">
        <div>
          <span className="text-sm font-medium text-foreground">Save Search History</span>
          <p className="text-xs text-muted mt-0.5">
            Store recent searches for quick access
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.saveSearchHistory}
          onChange={(e) => updateSetting("saveSearchHistory", e.target.checked)}
          className="h-4 w-4 accent-foreground"
        />
      </label>

      {/* Collect Listening Data */}
      <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3">
        <div>
          <span className="text-sm font-medium text-foreground">
            Listening Data Collection
          </span>
          <p className="text-xs text-muted mt-0.5">
            Track playback history for recommendations
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.collectListeningData}
          onChange={(e) => updateSetting("collectListeningData", e.target.checked)}
          className="h-4 w-4 accent-foreground"
        />
      </label>

      {/* Clear Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Clear Data</h3>

        <button
          onClick={handleClearSearchHistory}
          className="flex w-full items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm transition-premium hover:bg-surface-hover"
        >
          <div className="flex items-center gap-2">
            <Trash2 size={14} className="text-muted" aria-hidden="true" />
            <span className="text-foreground">Clear Search History</span>
          </div>
          {cleared === "search" && (
            <span className="text-xs text-green-500">Cleared</span>
          )}
        </button>

        <button
          onClick={handleClearListeningHistory}
          className="flex w-full items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm transition-premium hover:bg-surface-hover"
        >
          <div className="flex items-center gap-2">
            <Trash2 size={14} className="text-muted" aria-hidden="true" />
            <span className="text-foreground">Clear Listening History</span>
          </div>
          {cleared === "listening" && (
            <span className="text-xs text-green-500">Cleared</span>
          )}
        </button>

        {/* Clear All with Confirmation */}
        {!showClearAllConfirm ? (
          <button
            onClick={() => setShowClearAllConfirm(true)}
            className="flex w-full items-center justify-between rounded-xl bg-red-500/10 px-4 py-3 text-sm transition-premium hover:bg-red-500/20"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500" aria-hidden="true" />
              <span className="text-red-500 font-medium">Clear All Local Data</span>
            </div>
          </button>
        ) : (
          <div className="rounded-xl border-2 border-red-500/30 bg-red-500/5 p-4 space-y-3">
            <p className="text-sm text-foreground font-medium">
              Are you sure? This will remove all favorites, playlists, search history, and
              listening data.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClearAllData}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-premium hover:bg-red-600"
              >
                Yes, Clear Everything
              </button>
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="rounded-lg bg-surface px-4 py-2 text-sm font-medium text-foreground transition-premium hover:bg-surface-hover"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {cleared === "all" && (
          <p className="text-xs text-green-500 text-center">
            All local data cleared successfully
          </p>
        )}
      </div>
    </section>
  );
}
