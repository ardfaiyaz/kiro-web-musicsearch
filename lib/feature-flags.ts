/**
 * Feature flags module for toggling experimental features.
 * Stores feature flag state in localStorage.
 */

const STORAGE_KEY = "music-feature-flags";

export interface FeatureFlags {
  cassetteMode: boolean;
  particleEffects: boolean;
  auroraBackground: boolean;
  voiceNavigation: boolean;
  debugMode: boolean;
  onboarding: boolean;
  feedbackWidget: boolean;
  apiStatusIndicator: boolean;
  pwaInstallPrompt: boolean;
  customCursor: boolean;
  focusMode: boolean;
  easterEggs: boolean;
}

const defaultFlags: FeatureFlags = {
  cassetteMode: true,
  particleEffects: true,
  auroraBackground: true,
  voiceNavigation: true,
  debugMode: false,
  onboarding: true,
  feedbackWidget: true,
  apiStatusIndicator: true,
  pwaInstallPrompt: true,
  customCursor: true,
  focusMode: true,
  easterEggs: true,
};

export const featureFlagLabels: Record<keyof FeatureFlags, { label: string; description: string }> = {
  cassetteMode: { label: "Cassette Mode", description: "Retro cassette player theme" },
  particleEffects: { label: "Particle Effects", description: "Floating particle animations" },
  auroraBackground: { label: "Aurora Background", description: "Animated aurora ambient background" },
  voiceNavigation: { label: "Voice Navigation", description: "Navigate by voice commands" },
  debugMode: { label: "Debug Mode", description: "Show debug overlay with API stats" },
  onboarding: { label: "Onboarding Tour", description: "Show guided tour for new users" },
  feedbackWidget: { label: "Feedback Widget", description: "Floating feedback button" },
  apiStatusIndicator: { label: "API Status Indicator", description: "Show API health in footer" },
  pwaInstallPrompt: { label: "PWA Install Prompt", description: "Show install banner" },
  customCursor: { label: "Custom Cursor", description: "Use custom animated cursor" },
  focusMode: { label: "Focus Mode", description: "Distraction-free listening" },
  easterEggs: { label: "Easter Eggs", description: "Hidden surprises and animations" },
};

export function getFeatureFlags(): FeatureFlags {
  if (typeof window === "undefined") return defaultFlags;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<FeatureFlags>;
      return { ...defaultFlags, ...parsed };
    }
  } catch {
    // Ignore parse errors
  }
  return defaultFlags;
}

export function setFeatureFlag(key: keyof FeatureFlags, value: boolean): FeatureFlags {
  const flags = getFeatureFlags();
  const updated = { ...flags, [key]: value };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
  return updated;
}

export function resetFeatureFlags(): FeatureFlags {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
  return defaultFlags;
}
