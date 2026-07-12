"use client";

import { useState, useEffect, useCallback } from "react";
import { Focus, X } from "lucide-react";

export default function FocusMode() {
  const [active, setActive] = useState(false);

  const toggle = useCallback(() => {
    setActive((prev) => !prev);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.classList.add("focus-mode");
    } else {
      root.classList.remove("focus-mode");
    }
    return () => {
      root.classList.remove("focus-mode");
    };
  }, [active]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+Shift+F to toggle focus mode
      if (e.ctrlKey && e.shiftKey && e.key === "F") {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <>
      {/* Toggle button - hidden in focus mode itself */}
      {!active && (
        <button
          onClick={toggle}
          className="fixed bottom-36 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted shadow-md transition-premium hover:bg-surface-hover hover:text-foreground sm:bottom-20"
          aria-label="Enable focus mode (Ctrl+Shift+F)"
          title="Focus Mode (Ctrl+Shift+F)"
        >
          <Focus className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {/* Exit button when in focus mode */}
      {active && (
        <button
          onClick={toggle}
          className="fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg transition-premium hover:opacity-90"
          aria-label="Exit focus mode (Ctrl+Shift+F)"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span>Exit Focus</span>
        </button>
      )}

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {active ? "Focus mode enabled. All chrome is hidden." : ""}
      </div>
    </>
  );
}
