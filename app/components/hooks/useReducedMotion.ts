"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribe to changes in the reduce-motion class on the html element.
 * Uses MutationObserver to detect class changes.
 */
function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        callback();
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}

function getSnapshot(): boolean {
  return document.documentElement.classList.contains("reduce-motion");
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Hook to check if reduced motion is enabled via the `reduce-motion` class
 * on the html element. Uses useSyncExternalStore for safe subscription.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
