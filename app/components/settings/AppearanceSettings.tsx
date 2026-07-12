"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useSettings } from "../SettingsContext";
import type { MotionSensitivity, ColorBlindMode } from "../SettingsContext";

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
];

const ANIMATION_SPEEDS = [
  { value: "slow" as const, label: "Slow" },
  { value: "normal" as const, label: "Normal" },
  { value: "fast" as const, label: "Fast" },
  { value: "none" as const, label: "None" },
];

const MOTION_LEVELS: Array<{ value: MotionSensitivity; label: string; description: string }> = [
  { value: "off", label: "Off", description: "No animations" },
  { value: "reduced", label: "Reduced", description: "Minimal animations" },
  { value: "normal", label: "Normal", description: "Standard animations" },
  { value: "full", label: "Full", description: "All effects enabled" },
];

const COLOR_BLIND_MODES: Array<{ value: ColorBlindMode; label: string; description: string }> = [
  { value: "none", label: "None", description: "Default colors" },
  { value: "protanopia", label: "Protanopia", description: "Red-blind adjustment" },
  { value: "deuteranopia", label: "Deuteranopia", description: "Green-blind adjustment" },
  { value: "tritanopia", label: "Tritanopia", description: "Blue-blind adjustment" },
];

export default function AppearanceSettings() {
  const { themeMode, setThemeMode } = useTheme();
  const {
    settings,
    setBlurIntensity,
    setGlassOpacity,
    setAccentColor,
    setAnimationSpeed,
    setReducedMotion,
    setCompactMode,
    setCassetteMode,
    setHighContrast,
    setFontSize,
    setDyslexiaFont,
    setReducedTransparency,
    setMotionSensitivity,
    setColorBlindMode,
  } = useSettings();

  const themeOptions: Array<{
    mode: "light" | "dark" | "system";
    label: string;
    icon: typeof Sun;
    description: string;
  }> = [
    { mode: "light", label: "Light", icon: Sun, description: "Always use light theme" },
    { mode: "dark", label: "Dark", icon: Moon, description: "Always use dark theme" },
    {
      mode: "system",
      label: "System",
      icon: Monitor,
      description: "Follow OS preference",
    },
  ];

  return (
    <section aria-labelledby="appearance-heading" className="space-y-6">
      <h2 id="appearance-heading" className="text-lg font-semibold text-foreground">
        Appearance
      </h2>

      {/* Theme Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Theme</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {themeOptions.map(({ mode, label, icon: Icon, description }) => (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition-premium ${
                themeMode === mode
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-foreground/30 hover:bg-surface"
              }`}
              aria-pressed={themeMode === mode}
            >
              <Icon
                size={24}
                className={themeMode === mode ? "text-foreground" : "text-muted"}
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-xs text-muted text-center">{description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Accent Color</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setAccentColor(null)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-premium ${
              settings.accentColor === null
                ? "border-foreground scale-110"
                : "border-border hover:border-foreground/50"
            }`}
            aria-label="Use dynamic accent color"
            title="Dynamic"
          >
            <span className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400" />
          </button>
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              className={`h-10 w-10 rounded-full border-2 transition-premium ${
                settings.accentColor === color
                  ? "border-foreground scale-110"
                  : "border-border hover:border-foreground/50"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Set accent color to ${color}`}
              aria-pressed={settings.accentColor === color}
            />
          ))}
        </div>
      </div>

      {/* High Contrast Mode */}
      <div className="space-y-3">
        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3">
          <div>
            <span className="text-sm font-medium text-foreground">High Contrast Mode</span>
            <p className="text-xs text-muted mt-0.5">Maximum contrast ratio for readability</p>
          </div>
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
            className="h-4 w-4 accent-foreground"
          />
        </label>
      </div>

      {/* Font Size Adjustment */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Font Size</h3>
          <span className="text-xs text-muted">{settings.fontSize}px</span>
        </div>
        <input
          type="range"
          min={14}
          max={22}
          step={1}
          value={settings.fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full accent-foreground"
          aria-label="Font size adjustment"
          aria-valuemin={14}
          aria-valuemax={22}
          aria-valuenow={settings.fontSize}
        />
        <div className="flex justify-between text-xs text-muted">
          <span>14px</span>
          <span>18px</span>
          <span>22px</span>
        </div>
      </div>

      {/* Dyslexia-Friendly Font */}
      <div className="space-y-3">
        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3">
          <div>
            <span className="text-sm font-medium text-foreground">Dyslexia-Friendly Font</span>
            <p className="text-xs text-muted mt-0.5">Use OpenDyslexic font for easier reading</p>
          </div>
          <input
            type="checkbox"
            checked={settings.dyslexiaFont}
            onChange={(e) => setDyslexiaFont(e.target.checked)}
            className="h-4 w-4 accent-foreground"
          />
        </label>
      </div>

      {/* Reduced Transparency */}
      <div className="space-y-3">
        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3">
          <div>
            <span className="text-sm font-medium text-foreground">Reduced Transparency</span>
            <p className="text-xs text-muted mt-0.5">Replace glass/blur effects with solid backgrounds</p>
          </div>
          <input
            type="checkbox"
            checked={settings.reducedTransparency}
            onChange={(e) => setReducedTransparency(e.target.checked)}
            className="h-4 w-4 accent-foreground"
          />
        </label>
      </div>

      {/* Blur Intensity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Blur Intensity</h3>
          <span className="text-xs text-muted">{settings.blurIntensity}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={settings.blurIntensity}
          onChange={(e) => setBlurIntensity(Number(e.target.value))}
          className="w-full accent-foreground"
          aria-label="Blur intensity"
        />
      </div>

      {/* Glass Opacity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Glass Opacity</h3>
          <span className="text-xs text-muted">
            {Math.round(settings.glassOpacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={30}
          max={95}
          step={1}
          value={Math.round(settings.glassOpacity * 100)}
          onChange={(e) => setGlassOpacity(Number(e.target.value) / 100)}
          className="w-full accent-foreground"
          aria-label="Glass opacity"
        />
      </div>

      {/* Motion Sensitivity Levels */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Motion Sensitivity</h3>
        <p className="text-xs text-muted">Control animation intensity level</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MOTION_LEVELS.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => setMotionSensitivity(value)}
              className={`rounded-lg px-3 py-2.5 text-center transition-premium ${
                settings.motionSensitivity === value
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
              aria-pressed={settings.motionSensitivity === value}
              title={description}
            >
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Blind Mode */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Color Blind Mode</h3>
        <p className="text-xs text-muted">Adjust colors for color vision deficiency</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COLOR_BLIND_MODES.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => setColorBlindMode(value)}
              className={`rounded-lg px-3 py-2.5 text-center transition-premium ${
                settings.colorBlindMode === value
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
              aria-pressed={settings.colorBlindMode === value}
              title={description}
            >
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Animation Speed */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Animation Speed</h3>
        <div className="grid grid-cols-4 gap-2">
          {ANIMATION_SPEEDS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setAnimationSpeed(value)}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-premium ${
                settings.animationSpeed === value
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
              aria-pressed={settings.animationSpeed === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reduced Motion */}
      <div className="space-y-3">
        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3">
          <div>
            <span className="text-sm font-medium text-foreground">Reduced Motion</span>
            <p className="text-xs text-muted mt-0.5">Disable animations for accessibility</p>
          </div>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="h-4 w-4 accent-foreground"
          />
        </label>
      </div>

      {/* Compact Mode */}
      <div className="space-y-3">
        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3">
          <div>
            <span className="text-sm font-medium text-foreground">Compact Mode</span>
            <p className="text-xs text-muted mt-0.5">Reduce padding and margins</p>
          </div>
          <input
            type="checkbox"
            checked={settings.compactMode}
            onChange={(e) => setCompactMode(e.target.checked)}
            className="h-4 w-4 accent-foreground"
          />
        </label>
      </div>

      {/* Cassette Theme */}
      <div className="space-y-3">
        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3">
          <div>
            <span className="text-sm font-medium text-foreground">Cassette Retro Mode</span>
            <p className="text-xs text-muted mt-0.5">Retro cassette player theme for the music player</p>
          </div>
          <input
            type="checkbox"
            checked={settings.cassetteMode}
            onChange={(e) => setCassetteMode(e.target.checked)}
            className="h-4 w-4 accent-foreground"
          />
        </label>
      </div>
    </section>
  );
}
