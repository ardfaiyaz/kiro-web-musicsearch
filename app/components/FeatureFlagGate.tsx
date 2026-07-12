"use client";

import { ReactNode, useSyncExternalStore } from "react";
import { getFeatureFlags, FeatureFlags } from "@/lib/feature-flags";

const STORAGE_KEY = "music-feature-flags";

let flagListeners: Array<() => void> = [];
let cachedFlags: FeatureFlags | null = null;

function getFlagSnapshot(): FeatureFlags {
  if (cachedFlags) return cachedFlags;
  cachedFlags = getFeatureFlags();
  return cachedFlags;
}

function getServerFlagSnapshot(): FeatureFlags {
  return {
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
}

function subscribeToFlags(callback: () => void) {
  flagListeners.push(callback);

  // Listen for storage changes (from FeatureFlagsSettings toggling flags)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cachedFlags = null;
      for (const listener of flagListeners) {
        listener();
      }
    }
  };

  // Also listen for custom events dispatched when flags change in-tab
  const handleFlagChange = () => {
    cachedFlags = null;
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener("feature-flags-changed", handleFlagChange);

  return () => {
    flagListeners = flagListeners.filter((l) => l !== callback);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("feature-flags-changed", handleFlagChange);
  };
}

export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const flags = useSyncExternalStore(subscribeToFlags, getFlagSnapshot, getServerFlagSnapshot);
  return flags[flag];
}

interface FeatureFlagGateProps {
  flag: keyof FeatureFlags;
  children: ReactNode;
}

export default function FeatureFlagGate({ flag, children }: FeatureFlagGateProps) {
  const enabled = useFeatureFlag(flag);

  if (!enabled) return null;
  return <>{children}</>;
}

/**
 * Call this after updating feature flags to notify all gates to re-check.
 */
export function notifyFlagChange() {
  cachedFlags = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("feature-flags-changed"));
  }
}
