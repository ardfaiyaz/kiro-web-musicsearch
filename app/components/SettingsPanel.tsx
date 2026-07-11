"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Sun, Moon, Monitor, Settings, X } from "lucide-react";
import { useSettings } from "./SettingsContext";
import { useTheme } from "./ThemeContext";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, setReducedMotion } = useSettings();
  const { themeMode, setThemeMode } = useTheme();
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
      aria-label="Quick settings panel"
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
            <h2 className="text-lg font-bold text-foreground">Quick Settings</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted transition-premium hover:bg-surface-hover hover:text-foreground"
              aria-label="Close settings"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </header>

          {/* Theme Toggle */}
          <section aria-labelledby="quick-theme-heading">
            <h3
              id="quick-theme-heading"
              className="mb-3 text-sm font-semibold text-foreground"
            >
              Theme
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setThemeMode("light")}
                className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-medium transition-premium ${
                  themeMode === "light"
                    ? "bg-foreground text-background"
                    : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
                }`}
                aria-pressed={themeMode === "light"}
              >
                <Sun size={16} aria-hidden="true" />
                Light
              </button>
              <button
                onClick={() => setThemeMode("dark")}
                className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-medium transition-premium ${
                  themeMode === "dark"
                    ? "bg-foreground text-background"
                    : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
                }`}
                aria-pressed={themeMode === "dark"}
              >
                <Moon size={16} aria-hidden="true" />
                Dark
              </button>
              <button
                onClick={() => setThemeMode("system")}
                className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-medium transition-premium ${
                  themeMode === "system"
                    ? "bg-foreground text-background"
                    : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
                }`}
                aria-pressed={themeMode === "system"}
              >
                <Monitor size={16} aria-hidden="true" />
                System
              </button>
            </div>
          </section>

          {/* Reduced Motion */}
          <section aria-labelledby="quick-motion-heading">
            <h3
              id="quick-motion-heading"
              className="mb-3 text-sm font-semibold text-foreground"
            >
              Accessibility
            </h3>
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3">
              <span className="text-sm text-foreground">Reduced Motion</span>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="h-4 w-4 accent-foreground"
              />
            </label>
          </section>

          {/* All Settings Link */}
          <Link
            href="/settings"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface px-4 py-3 text-sm font-medium text-foreground transition-premium hover:bg-surface-hover"
          >
            <Settings size={16} aria-hidden="true" />
            All Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
