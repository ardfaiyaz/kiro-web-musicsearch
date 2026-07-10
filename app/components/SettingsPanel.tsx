"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSettings } from "./SettingsContext";
import { useTheme } from "./ThemeContext";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const {
    settings,
    setBlurIntensity,
    setGlassOpacity,
    setAccentColor,
    setAnimationSpeed,
    setReducedMotion,
    setCompactMode,
    resetSettings,
  } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus within panel
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-end"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Settings panel"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative h-full w-full max-w-sm overflow-y-auto glass-settings animate-slide-in-right"
        style={{ borderRadius: 0 }}
      >
        <div className="flex flex-col gap-6 p-6">
          {/* Header */}
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Settings</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted transition-premium hover:bg-surface-hover hover:text-foreground"
              aria-label="Close settings"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>

          {/* Theme Toggle */}
          <section aria-labelledby="theme-heading">
            <h3 id="theme-heading" className="mb-3 text-sm font-semibold text-foreground">
              Theme
            </h3>
            <button
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm text-foreground transition-premium hover:bg-surface-hover"
            >
              <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
              <span className="text-muted">
                {theme === "dark" ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                )}
              </span>
            </button>
          </section>

          {/* Blur Intensity */}
          <section aria-labelledby="blur-heading">
            <h3 id="blur-heading" className="mb-3 text-sm font-semibold text-foreground">
              Blur Intensity
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={settings.blurIntensity}
                onChange={(e) => setBlurIntensity(Number(e.target.value))}
                className="flex-1 accent-foreground"
                aria-label="Blur intensity"
              />
              <span className="w-12 text-right text-xs text-muted">
                {settings.blurIntensity}px
              </span>
            </div>
          </section>

          {/* Glass Opacity */}
          <section aria-labelledby="opacity-heading">
            <h3 id="opacity-heading" className="mb-3 text-sm font-semibold text-foreground">
              Glass Opacity
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={30}
                max={95}
                step={1}
                value={Math.round(settings.glassOpacity * 100)}
                onChange={(e) => setGlassOpacity(Number(e.target.value) / 100)}
                className="flex-1 accent-foreground"
                aria-label="Glass opacity"
              />
              <span className="w-12 text-right text-xs text-muted">
                {Math.round(settings.glassOpacity * 100)}%
              </span>
            </div>
          </section>

          {/* Accent Color */}
          <section aria-labelledby="accent-heading">
            <h3 id="accent-heading" className="mb-3 text-sm font-semibold text-foreground">
              Accent Color
            </h3>
            <div className="flex flex-wrap gap-2">
              {/* None / dynamic option */}
              <button
                onClick={() => setAccentColor(null)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-premium ${
                  settings.accentColor === null
                    ? "border-foreground scale-110"
                    : "border-border"
                }`}
                aria-label="Use dynamic accent color"
                title="Dynamic"
              >
                <span className="h-4 w-4 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400" />
              </button>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`h-8 w-8 rounded-full border-2 transition-premium ${
                    settings.accentColor === color
                      ? "border-foreground scale-110"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Set accent color to ${color}`}
                />
              ))}
            </div>
          </section>

          {/* Animation Speed */}
          <section aria-labelledby="animation-heading">
            <h3 id="animation-heading" className="mb-3 text-sm font-semibold text-foreground">
              Animation Speed
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {ANIMATION_SPEEDS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setAnimationSpeed(value)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-premium ${
                    settings.animationSpeed === value
                      ? "bg-foreground text-background"
                      : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Reduced Motion */}
          <section aria-labelledby="motion-heading">
            <h3 id="motion-heading" className="mb-3 text-sm font-semibold text-foreground">
              Reduced Motion
            </h3>
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3">
              <span className="text-sm text-foreground">Disable animations</span>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="h-4 w-4 accent-foreground"
              />
            </label>
          </section>

          {/* Compact Mode */}
          <section aria-labelledby="compact-heading">
            <h3 id="compact-heading" className="mb-3 text-sm font-semibold text-foreground">
              Compact Mode
            </h3>
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3">
              <span className="text-sm text-foreground">Reduce padding and margins</span>
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
                className="h-4 w-4 accent-foreground"
              />
            </label>
          </section>

          {/* Reset */}
          <button
            onClick={resetSettings}
            className="mt-2 w-full rounded-xl bg-surface px-4 py-3 text-sm text-muted transition-premium hover:bg-surface-hover hover:text-foreground"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
