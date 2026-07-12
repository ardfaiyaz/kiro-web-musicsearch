"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  useEffect,
  ReactNode,
} from "react";

type Theme = "light" | "dark";
type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

let listeners: Array<() => void> = [];
let currentMode: ThemeMode = "dark";
let resolvedTheme: Theme = "dark";
let initialized = false;

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function resolveTheme(mode: ThemeMode): Theme {
  if (mode === "system") return getSystemTheme();
  return mode;
}

function initializeThemeStore(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const stored = localStorage.getItem("theme") as string | null;
  if (stored === "light" || stored === "dark" || stored === "system") {
    currentMode = stored;
  } else if (stored === null) {
    currentMode = "dark";
  }
  resolvedTheme = resolveTheme(currentMode);
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribeTheme(callback: () => void) {
  listeners.push(callback);
  initializeThemeStore();

  // Listen for system theme changes (relevant when mode is 'system')
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleMediaChange = () => {
    if (currentMode === "system") {
      resolvedTheme = getSystemTheme();
      applyThemeToDOM(resolvedTheme);
      emitChange();
    }
  };
  mediaQuery.addEventListener("change", handleMediaChange);

  // Listen for storage events from other tabs
  const handleStorage = (e: StorageEvent) => {
    if (e.key === "theme") {
      const val = e.newValue;
      if (val === "light" || val === "dark" || val === "system") {
        currentMode = val;
        resolvedTheme = resolveTheme(currentMode);
        applyThemeToDOM(resolvedTheme);
        emitChange();
      }
    }
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    listeners = listeners.filter((l) => l !== callback);
    mediaQuery.removeEventListener("change", handleMediaChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-transitioning");
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  // Remove transition class after animation completes
  requestAnimationFrame(() => {
    setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 300);
  });
}

interface ThemeSnapshot {
  mode: ThemeMode;
  resolved: Theme;
}

let cachedSnapshot: ThemeSnapshot = { mode: currentMode, resolved: resolvedTheme };

function getSnapshot(): ThemeSnapshot {
  initializeThemeStore();
  if (
    cachedSnapshot.mode !== currentMode ||
    cachedSnapshot.resolved !== resolvedTheme
  ) {
    cachedSnapshot = { mode: currentMode, resolved: resolvedTheme };
  }
  return cachedSnapshot;
}

const serverSnapshot: ThemeSnapshot = { mode: "dark", resolved: "dark" };

function getServerSnapshot(): ThemeSnapshot {
  return serverSnapshot;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribeTheme, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyThemeToDOM(snapshot.resolved);
  }, [snapshot.resolved]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    currentMode = mode;
    resolvedTheme = resolveTheme(mode);
    localStorage.setItem("theme", mode);
    applyThemeToDOM(resolvedTheme);
    emitChange();
  }, []);

  const toggleTheme = useCallback(() => {
    // Cycle: light -> dark -> system -> light
    const next: ThemeMode =
      currentMode === "light" ? "dark" : currentMode === "dark" ? "system" : "light";
    setThemeMode(next);
  }, [setThemeMode]);

  return (
    <ThemeContext.Provider
      value={{
        theme: snapshot.resolved,
        themeMode: snapshot.mode,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
