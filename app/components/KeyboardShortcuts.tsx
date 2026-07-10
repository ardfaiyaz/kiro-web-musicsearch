"use client";

import { useEffect, useState, useCallback } from "react";

export default function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      // '/' to focus search (only when not in an input)
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[aria-label="Search music"]'
        );
        searchInput?.focus();
      }

      // Escape to close dropdowns/modals
      if (e.key === "Escape") {
        if (showHelp) {
          setShowHelp(false);
          return;
        }
        // Blur active input to close dropdowns
        if (isInput) {
          (target as HTMLElement).blur();
        }
      }

      // '?' to toggle keyboard shortcuts help (only when not in an input)
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }
    },
    [showHelp]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setShowHelp(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setShowHelp(false)}
            className="rounded-lg p-1 text-muted transition-colors hover:text-foreground"
            aria-label="Close shortcuts help"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between">
            <span className="text-foreground">Focus search bar</span>
            <kbd className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-muted">
              /
            </kbd>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-foreground">Close dropdowns / modals</span>
            <kbd className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-muted">
              Esc
            </kbd>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-foreground">Show this help</span>
            <kbd className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-muted">
              ?
            </kbd>
          </li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          Press <kbd className="rounded border border-border px-1 font-mono">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
