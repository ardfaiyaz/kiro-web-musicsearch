"use client";

import { useSyncExternalStore, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import {
  getFeatureFlags,
  setFeatureFlag,
  resetFeatureFlags,
  featureFlagLabels,
  type FeatureFlags,
} from "@/lib/feature-flags";

// External store pattern to avoid setState-in-effect
let flagListeners: Array<() => void> = [];
let flagSnapshot: FeatureFlags | null = null;

function subscribeFlagStore(callback: () => void) {
  flagListeners.push(callback);
  return () => {
    flagListeners = flagListeners.filter((l) => l !== callback);
  };
}

function getFlagSnapshot(): FeatureFlags {
  if (flagSnapshot === null) {
    flagSnapshot = getFeatureFlags();
  }
  return flagSnapshot;
}

function getFlagServerSnapshot(): FeatureFlags {
  return getFeatureFlags();
}

function notifyFlagListeners() {
  flagSnapshot = getFeatureFlags();
  for (const listener of flagListeners) {
    listener();
  }
}

export default function FeatureFlagsSettings() {
  const flags = useSyncExternalStore(
    subscribeFlagStore,
    getFlagSnapshot,
    getFlagServerSnapshot
  );

  const handleToggle = useCallback((key: keyof FeatureFlags, value: boolean) => {
    setFeatureFlag(key, value);
    notifyFlagListeners();
  }, []);

  const handleReset = useCallback(() => {
    resetFeatureFlags();
    notifyFlagListeners();
  }, []);

  const flagKeys = Object.keys(featureFlagLabels) as Array<keyof FeatureFlags>;

  return (
    <section aria-labelledby="feature-flags-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2
          id="feature-flags-heading"
          className="text-lg font-semibold text-foreground"
        >
          Feature Flags
        </h2>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-premium hover:bg-surface hover:text-foreground"
          aria-label="Reset all feature flags to defaults"
        >
          <RotateCcw size={12} aria-hidden="true" />
          Reset
        </button>
      </div>
      <p className="text-xs text-muted">
        Toggle experimental features on or off. Changes take effect immediately.
      </p>
      <div className="space-y-2">
        {flagKeys.map((key) => {
          const { label, description } = featureFlagLabels[key];
          return (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between rounded-xl bg-surface px-4 py-3"
            >
              <div>
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
                <p className="text-xs text-muted mt-0.5">{description}</p>
              </div>
              <input
                type="checkbox"
                checked={flags[key]}
                onChange={(e) => handleToggle(key, e.target.checked)}
                className="h-4 w-4 accent-foreground"
                aria-label={`Toggle ${label}`}
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}
