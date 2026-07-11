"use client";

import { useState } from "react";
import { Volume2, SkipForward, Disc3, Headphones } from "lucide-react";

const PLAYBACK_SETTINGS_KEY = "playback-settings";

interface PlaybackSettingsData {
  defaultVolume: number;
  autoplayNext: boolean;
  crossfadeDuration: number;
  playbackQuality: "standard" | "high" | "lossless";
}

const defaultPlaybackSettings: PlaybackSettingsData = {
  defaultVolume: 80,
  autoplayNext: true,
  crossfadeDuration: 0,
  playbackQuality: "standard",
};

function loadPlaybackSettings(): PlaybackSettingsData {
  if (typeof window === "undefined") return defaultPlaybackSettings;
  try {
    const stored = localStorage.getItem(PLAYBACK_SETTINGS_KEY);
    if (stored) {
      return { ...defaultPlaybackSettings, ...JSON.parse(stored) };
    }
  } catch {
    // Use defaults
  }
  return defaultPlaybackSettings;
}

function savePlaybackSettings(settings: PlaybackSettingsData): void {
  try {
    localStorage.setItem(PLAYBACK_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage might be unavailable
  }
}

export default function PlaybackSettings() {
  const [settings, setSettings] = useState<PlaybackSettingsData>(() => loadPlaybackSettings());

  const updateSetting = <K extends keyof PlaybackSettingsData>(
    key: K,
    value: PlaybackSettingsData[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    savePlaybackSettings(updated);
  };

  const qualityOptions: Array<{
    value: PlaybackSettingsData["playbackQuality"];
    label: string;
    description: string;
  }> = [
    { value: "standard", label: "Standard", description: "128 kbps" },
    { value: "high", label: "High", description: "256 kbps" },
    { value: "lossless", label: "Lossless", description: "FLAC" },
  ];

  return (
    <section aria-labelledby="playback-heading" className="space-y-6">
      <h2 id="playback-heading" className="text-lg font-semibold text-foreground">
        Playback
      </h2>

      {/* Default Volume */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-muted" aria-hidden="true" />
            <h3 className="text-sm font-medium text-foreground">Default Volume</h3>
          </div>
          <span className="text-xs text-muted">{settings.defaultVolume}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={settings.defaultVolume}
          onChange={(e) => updateSetting("defaultVolume", Number(e.target.value))}
          className="w-full accent-foreground"
          aria-label="Default volume"
        />
      </div>

      {/* Autoplay Next */}
      <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <SkipForward size={16} className="text-muted" aria-hidden="true" />
          <div>
            <span className="text-sm font-medium text-foreground">Autoplay Next</span>
            <p className="text-xs text-muted mt-0.5">
              Automatically play next track in queue
            </p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.autoplayNext}
          onChange={(e) => updateSetting("autoplayNext", e.target.checked)}
          className="h-4 w-4 accent-foreground"
        />
      </label>

      {/* Crossfade Duration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc3 size={16} className="text-muted" aria-hidden="true" />
            <h3 className="text-sm font-medium text-foreground">Crossfade</h3>
          </div>
          <span className="text-xs text-muted">
            {settings.crossfadeDuration === 0
              ? "Off"
              : `${settings.crossfadeDuration}s`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={12}
          step={1}
          value={settings.crossfadeDuration}
          onChange={(e) => updateSetting("crossfadeDuration", Number(e.target.value))}
          className="w-full accent-foreground"
          aria-label="Crossfade duration"
        />
        <p className="text-xs text-muted italic">
          Coming soon - previews are limited to 30 seconds
        </p>
      </div>

      {/* Playback Quality */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Headphones size={16} className="text-muted" aria-hidden="true" />
          <h3 className="text-sm font-medium text-foreground">Playback Quality</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {qualityOptions.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => updateSetting("playbackQuality", value)}
              className={`rounded-lg px-3 py-2.5 text-center transition-premium ${
                settings.playbackQuality === value
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
              aria-pressed={settings.playbackQuality === value}
            >
              <span className="text-sm font-medium block">{label}</span>
              <span className="text-xs opacity-70">{description}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted italic">
          iTunes previews use fixed quality - this preference will apply when full streaming is available
        </p>
      </div>
    </section>
  );
}
