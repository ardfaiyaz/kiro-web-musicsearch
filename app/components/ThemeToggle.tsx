"use client";

import { useTheme } from "./ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const { themeMode, toggleTheme } = useTheme();

  const label =
    themeMode === "dark"
      ? "Switch to system theme"
      : themeMode === "system"
        ? "Switch to light mode"
        : "Switch to dark mode";

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-all duration-300 hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
      aria-label={label}
    >
      {/* Sun icon for dark mode (click to go to system) */}
      <Sun
        size={20}
        className={`absolute transition-all duration-300 ${
          themeMode === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
        aria-hidden="true"
      />
      {/* Moon icon for light mode (click to go to dark) */}
      <Moon
        size={20}
        className={`absolute transition-all duration-300 ${
          themeMode === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
        aria-hidden="true"
      />
      {/* Monitor icon for system mode (click to go to light) */}
      <Monitor
        size={20}
        className={`absolute transition-all duration-300 ${
          themeMode === "system"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
