"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import { Music2 } from "lucide-react";

const SESSION_KEY = "music-splash-shown";

function shouldShowSplash(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !sessionStorage.getItem(SESSION_KEY);
  } catch {
    return false;
  }
}

function subscribeNoop(callback: () => void) {
  void callback;
  return () => {};
}

function getServerSnapshot(): boolean {
  return false;
}

export default function SplashScreen() {
  const showOnMount = useSyncExternalStore(
    subscribeNoop,
    shouldShowSplash,
    getServerSnapshot
  );
  const [fadeOut, setFadeOut] = useState(false);
  const [removed, setRemoved] = useState(false);

  const markShown = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  useEffect(() => {
    if (!showOnMount || removed) return;

    markShown();

    // Auto-dismiss after 2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    return () => clearTimeout(fadeTimer);
  }, [showOnMount, removed, markShown]);

  useEffect(() => {
    if (!fadeOut) return;
    // Remove from DOM after fade-out animation completes
    const removeTimer = setTimeout(() => {
      setRemoved(true);
    }, 500);
    return () => clearTimeout(removeTimer);
  }, [fadeOut]);

  if (!showOnMount || removed) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center splash-bg ${
        fadeOut ? "splash-fade-out" : "splash-fade-in"
      }`}
      role="status"
      aria-label="Loading application"
    >
      <div className="flex flex-col items-center gap-4 splash-content">
        <div className="splash-icon-wrapper">
          <Music2
            size={64}
            className="text-white drop-shadow-lg"
            aria-hidden="true"
          />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
          Music
        </h1>
        <p className="text-sm text-white/70 font-medium tracking-wide">
          Discover. Listen. Enjoy.
        </p>
      </div>
    </div>
  );
}
