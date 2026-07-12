"use client";

import { useState, useEffect } from "react";
import { Keyboard, X } from "lucide-react";

const STORAGE_KEY = "shortcuts-seen";

export default function KeyboardShortcutsOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (seen) return;
    } catch {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors
    }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 right-4 z-[45] w-72 animate-slide-up sm:bottom-6"
      role="complementary"
      aria-label="Keyboard shortcuts hint"
    >
      <div className="glass-card rounded-xl border border-border/50 p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-foreground">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={dismiss}
            className="rounded-md p-1 text-muted transition-colors hover:text-foreground"
            aria-label="Dismiss keyboard shortcuts hint"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        <ul className="space-y-1.5 text-xs text-muted">
          <li className="flex items-center justify-between">
            <span>Play / Pause</span>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
              Space
            </kbd>
          </li>
          <li className="flex items-center justify-between">
            <span>Focus Search</span>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
              /
            </kbd>
          </li>
          <li className="flex items-center justify-between">
            <span>Command Palette</span>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
              Cmd+K
            </kbd>
          </li>
          <li className="flex items-center justify-between">
            <span>All Shortcuts</span>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
              ?
            </kbd>
          </li>
        </ul>

        <button
          onClick={dismiss}
          className="mt-3 w-full rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
