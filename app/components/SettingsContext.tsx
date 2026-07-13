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
export type MotionSensitivity = "off" | "reduced" | "normal" | "full";
export type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

interface Settings {
  blurIntensity: number;
  glassOpacity: number;
  accentColor: string | null;
  animationSpeed: AnimationSpeed;
  reducedMotion: boolean;
  compactMode: boolean;
  cassetteMode: boolean;
  highContrast: boolean;
  fontSize: number;
  dyslexiaFont: boolean;
  reducedTransparency: boolean;
  motionSensitivity: MotionSensitivity;
  colorBlindMode: ColorBlindMode;
}

interface SettingsContextType {
  settings: Settings;
  setBlurIntensity: (value: number) => void;
  setGlassOpacity: (value: number) => void;
  setAccentColor: (value: string | null) => void;
  setAnimationSpeed: (value: AnimationSpeed) => void;
  setReducedMotion: (value: boolean) => void;
  setCompactMode: (value: boolean) => void;
  setCassetteMode: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  setFontSize: (value: number) => void;
  setDyslexiaFont: (value: boolean) => void;
  setReducedTransparency: (value: boolean) => void;
  setMotionSensitivity: (value: MotionSensitivity) => void;
  setColorBlindMode: (value: ColorBlindMode) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  blurIntensity: 20,
  glassOpacity: 0.7,
  accentColor: null,
  animationSpeed: "normal",
  reducedMotion: false,
  compactMode: false,
  cassetteMode: false,
  highContrast: false,
  fontSize: 16,
  dyslexiaFont: false,
  reducedTransparency: false,
  motionSensitivity: "normal",
  colorBlindMode: "none",
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
  root.style.setProperty("--user-font-size", `${settings.fontSize}px`);

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

  if (settings.highContrast) {
    root.classList.add("high-contrast");
  } else {
    root.classList.remove("high-contrast");
  }

  if (settings.dyslexiaFont) {
    root.classList.add("dyslexia-font");
  } else {
    root.classList.remove("dyslexia-font");
  }

  if (settings.reducedTransparency) {
    root.classList.add("reduce-transparency");
  } else {
    root.classList.remove("reduce-transparency");
  }

  // Motion sensitivity classes
  root.classList.remove("motion-off", "motion-reduced", "motion-full");
  if (settings.motionSensitivity === "off") {
    root.classList.add("motion-off");
  } else if (settings.motionSensitivity === "reduced") {
    root.classList.add("motion-reduced");
  } else if (settings.motionSensitivity === "full") {
    root.classList.add("motion-full");
  }

  // Color blind mode classes
  root.classList.remove("colorblind-protanopia", "colorblind-deuteranopia", "colorblind-tritanopia");
  if (settings.colorBlindMode !== "none") {
    root.classList.add(`colorblind-${settings.colorBlindMode}`);
  }
}

// External store for settings - allows useSyncExternalStore to read without effects
let listeners: Array<() => void> = [];
let currentSettings: Settings = defaultSettings;
let initialized = false;

function initializeSettings(): void {
  if (initialized) return;
  initialized = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Settings>;
      currentSettings = { ...defaultSettings, ...parsed };
    }
  } catch {
    // Use defaults on parse errors
  }
}

function getSettingsSnapshot(): Settings {
  initializeSettings();
  return currentSettings;
}

function getServerSnapshot(): Settings {
  return defaultSettings;
}

function subscribe(callback: () => void) {
  listeners.push(callback);
  // Ensure settings are loaded from localStorage on first subscribe
  initializeSettings();
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

  // Apply DOM settings on mount only
  useEffect(() => {
    if (!appliedRef.current) {
      appliedRef.current = true;
      applySettingsToDOM(currentSettings);
    }
  }, []);

  const setBlurIntensity = useCallback((value: number) => {
    updateSettings({
      ...getSettingsSnapshot(),
      blurIntensity: Math.max(0, Math.min(50, value)),
    });
  }, []);

  const setGlassOpacity = useCallback((value: number) => {
    updateSettings({
      ...getSettingsSnapshot(),
      glassOpacity: Math.max(0.3, Math.min(0.95, value)),
    });
  }, []);

  const setAccentColor = useCallback((value: string | null) => {
    updateSettings({ ...getSettingsSnapshot(), accentColor: value });
  }, []);

  const setAnimationSpeed = useCallback((value: AnimationSpeed) => {
    updateSettings({ ...getSettingsSnapshot(), animationSpeed: value });
  }, []);

  const setReducedMotion = useCallback((value: boolean) => {
    updateSettings({ ...getSettingsSnapshot(), reducedMotion: value });
  }, []);

  const setCompactMode = useCallback((value: boolean) => {
    updateSettings({ ...getSettingsSnapshot(), compactMode: value });
  }, []);

  const setCassetteMode = useCallback((value: boolean) => {
    updateSettings({ ...getSettingsSnapshot(), cassetteMode: value });
  }, []);

  const setHighContrast = useCallback((value: boolean) => {
    updateSettings({ ...getSettingsSnapshot(), highContrast: value });
  }, []);

  const setFontSize = useCallback((value: number) => {
    updateSettings({
      ...getSettingsSnapshot(),
      fontSize: Math.max(14, Math.min(22, value)),
    });
  }, []);

  const setDyslexiaFont = useCallback((value: boolean) => {
    updateSettings({ ...getSettingsSnapshot(), dyslexiaFont: value });
  }, []);

  const setReducedTransparency = useCallback((value: boolean) => {
    updateSettings({ ...getSettingsSnapshot(), reducedTransparency: value });
  }, []);

  const setMotionSensitivity = useCallback((value: MotionSensitivity) => {
    updateSettings({ ...getSettingsSnapshot(), motionSensitivity: value });
  }, []);

  const setColorBlindMode = useCallback((value: ColorBlindMode) => {
    updateSettings({ ...getSettingsSnapshot(), colorBlindMode: value });
  }, []);

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
        setCassetteMode,
        setHighContrast,
        setFontSize,
        setDyslexiaFont,
        setReducedTransparency,
        setMotionSensitivity,
        setColorBlindMode,
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
