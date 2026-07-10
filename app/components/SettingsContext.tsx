"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  useEffect,
  useRef,
  ReactNode,
} from "react";

type AnimationSpeed = "slow" | "normal" | "fast" | "none";

interface Settings {
  blurIntensity: number;
  glassOpacity: number;
  accentColor: string | null;
  animationSpeed: AnimationSpeed;
  reducedMotion: boolean;
  compactMode: boolean;
}

interface SettingsContextType {
  settings: Settings;
  setBlurIntensity: (value: number) => void;
  setGlassOpacity: (value: number) => void;
  setAccentColor: (value: string | null) => void;
  setAnimationSpeed: (value: AnimationSpeed) => void;
  setReducedMotion: (value: boolean) => void;
  setCompactMode: (value: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  blurIntensity: 20,
  glassOpacity: 0.7,
  accentColor: null,
  animationSpeed: "normal",
  reducedMotion: false,
  compactMode: false,
};

const STORAGE_KEY = "app-settings";

const SettingsContext = createContext<SettingsContextType | null>(null);

function getAnimationMultiplier(speed: AnimationSpeed): string {
  switch (speed) {
    case "slow":
      return "2";
    case "normal":
      return "1";
    case "fast":
      return "0.5";
    case "none":
      return "0";
  }
}

function applySettingsToDOM(settings: Settings) {
  const root = document.documentElement;
  root.style.setProperty("--user-blur-intensity", `${settings.blurIntensity}px`);
  root.style.setProperty("--user-glass-opacity", `${settings.glassOpacity}`);
  root.style.setProperty(
    "--animation-speed",
    getAnimationMultiplier(settings.animationSpeed)
  );

  if (settings.accentColor) {
    root.style.setProperty("--dynamic-accent-override", settings.accentColor);
  } else {
    root.style.removeProperty("--dynamic-accent-override");
  }

  if (settings.reducedMotion) {
    root.classList.add("reduce-motion");
  } else {
    root.classList.remove("reduce-motion");
  }

  if (settings.compactMode) {
    root.classList.add("compact-mode");
  } else {
    root.classList.remove("compact-mode");
  }
}

// External store for settings - allows useSyncExternalStore to read without effects
let listeners: Array<() => void> = [];
let currentSettings: Settings = defaultSettings;

function getSettingsSnapshot(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Settings>;
      currentSettings = { ...defaultSettings, ...parsed };
    }
  } catch {
    // Use defaults on parse errors
  }
  return currentSettings;
}

function getServerSnapshot(): Settings {
  return defaultSettings;
}

function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function updateSettings(newSettings: Settings) {
  currentSettings = newSettings;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  applySettingsToDOM(newSettings);
  emitChange();
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(subscribe, getSettingsSnapshot, getServerSnapshot);
  const appliedRef = useRef(false);

  // Apply DOM settings on mount
  useEffect(() => {
    if (!appliedRef.current) {
      appliedRef.current = true;
      applySettingsToDOM(settings);
    }
  });

  const setBlurIntensity = useCallback(
    (value: number) => {
      updateSettings({
        ...settings,
        blurIntensity: Math.max(0, Math.min(50, value)),
      });
    },
    [settings]
  );

  const setGlassOpacity = useCallback(
    (value: number) => {
      updateSettings({
        ...settings,
        glassOpacity: Math.max(0.3, Math.min(0.95, value)),
      });
    },
    [settings]
  );

  const setAccentColor = useCallback(
    (value: string | null) => {
      updateSettings({ ...settings, accentColor: value });
    },
    [settings]
  );

  const setAnimationSpeed = useCallback(
    (value: AnimationSpeed) => {
      updateSettings({ ...settings, animationSpeed: value });
    },
    [settings]
  );

  const setReducedMotion = useCallback(
    (value: boolean) => {
      updateSettings({ ...settings, reducedMotion: value });
    },
    [settings]
  );

  const setCompactMode = useCallback(
    (value: boolean) => {
      updateSettings({ ...settings, compactMode: value });
    },
    [settings]
  );

  const resetSettings = useCallback(() => {
    updateSettings(defaultSettings);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setBlurIntensity,
        setGlassOpacity,
        setAccentColor,
        setAnimationSpeed,
        setReducedMotion,
        setCompactMode,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
