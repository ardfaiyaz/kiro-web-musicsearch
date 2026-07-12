"use client";

import { useEffect, useRef } from "react";

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "KeyB", "KeyA",
];

const RETRO_THEME_KEY = "music-search-retro-theme";
const VINYL_MODE_KEY = "music-search-vinyl-mode";

function applyRetroTheme(enabled: boolean): void {
  if (typeof document === "undefined") return;
  if (enabled) {
    document.documentElement.classList.add("retro-theme");
  } else {
    document.documentElement.classList.remove("retro-theme");
  }
}

function applyVinylMode(enabled: boolean): void {
  if (typeof document === "undefined") return;
  if (enabled) {
    document.documentElement.classList.add("vinyl-mode");
  } else {
    document.documentElement.classList.remove("vinyl-mode");
  }
}

export default function EasterEggs() {
  const konamiIndex = useRef(0);
  const searchBuffer = useRef("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Restore saved Easter egg states
    try {
      const retro = localStorage.getItem(RETRO_THEME_KEY);
      if (retro === "true") applyRetroTheme(true);
      const vinyl = localStorage.getItem(VINYL_MODE_KEY);
      if (vinyl === "true") applyVinylMode(true);
    } catch {
      // ignore
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Konami code detection
      if (e.code === KONAMI_CODE[konamiIndex.current]) {
        konamiIndex.current++;
        if (konamiIndex.current === KONAMI_CODE.length) {
          konamiIndex.current = 0;
          toggleRetroTheme();
        }
      } else {
        konamiIndex.current = 0;
        // Check if this is the first key of the sequence
        if (e.code === KONAMI_CODE[0]) {
          konamiIndex.current = 1;
        }
      }

      // Vinyl mode detection - typing "vinyl" anywhere
      if (e.key.length === 1) {
        searchBuffer.current += e.key.toLowerCase();

        if (searchTimeout.current) {
          clearTimeout(searchTimeout.current);
        }
        searchTimeout.current = setTimeout(() => {
          searchBuffer.current = "";
        }, 2000);

        if (searchBuffer.current.includes("vinyl")) {
          searchBuffer.current = "";
          toggleVinylMode();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  return null;
}

function toggleRetroTheme(): void {
  try {
    const current = localStorage.getItem(RETRO_THEME_KEY) === "true";
    const next = !current;
    localStorage.setItem(RETRO_THEME_KEY, String(next));
    applyRetroTheme(next);

    // Show a notification
    showEasterEggNotification(
      next ? "Retro mode activated! Press the Konami code again to disable." : "Retro mode deactivated."
    );
  } catch {
    // ignore
  }
}

function toggleVinylMode(): void {
  try {
    const current = localStorage.getItem(VINYL_MODE_KEY) === "true";
    const next = !current;
    localStorage.setItem(VINYL_MODE_KEY, String(next));
    applyVinylMode(next);

    showEasterEggNotification(
      next ? "Vinyl mode activated! Type 'vinyl' again to disable." : "Vinyl mode deactivated."
    );
  } catch {
    // ignore
  }
}

function showEasterEggNotification(message: string): void {
  if (typeof document === "undefined") return;

  // Create a temporary notification
  const notification = document.createElement("div");
  notification.setAttribute("role", "alert");
  notification.setAttribute("aria-live", "polite");
  notification.className =
    "fixed top-4 left-1/2 -translate-x-1/2 z-[9999] rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground shadow-xl animate-in fade-in slide-in-from-top-2";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("opacity-0", "transition-opacity", "duration-300");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
