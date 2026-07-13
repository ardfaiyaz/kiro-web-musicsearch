"use client";

import Link from "next/link";
import { Keyboard, ChevronLeft } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface ShortcutGroup {
  id: string;
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    id: "playback",
    title: "Playback",
    shortcuts: [
      { keys: ["Space"], description: "Play / Pause" },
      { keys: ["N"], description: "Next track" },
      { keys: ["P"], description: "Previous track" },
      { keys: ["M"], description: "Mute / Unmute" },
      { keys: ["\u2191"], description: "Volume up" },
      { keys: ["\u2193"], description: "Volume down" },
      { keys: ["\u2190"], description: "Seek backward" },
      { keys: ["\u2192"], description: "Seek forward" },
      { keys: ["L"], description: "Toggle loop" },
      { keys: ["S"], description: "Toggle shuffle" },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    shortcuts: [
      { keys: ["/"], description: "Focus search bar" },
      { keys: ["Ctrl", "K"], description: "Open command palette" },
      { keys: ["G", "H"], description: "Go to home" },
      { keys: ["G", "D"], description: "Go to discover" },
      { keys: ["G", "F"], description: "Go to favorites" },
      { keys: ["G", "P"], description: "Go to playlists" },
      { keys: ["G", "S"], description: "Go to settings" },
      { keys: ["Esc"], description: "Close modal / overlay" },
    ],
  },
  {
    id: "actions",
    title: "Actions",
    shortcuts: [
      { keys: ["F"], description: "Toggle favorite" },
      { keys: ["Q"], description: "Add to queue" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Ctrl", "Shift", "D"], description: "Toggle debug mode" },
      { keys: ["Ctrl", "/"], description: "Show shortcuts overlay" },
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    shortcuts: [
      { keys: ["Tab"], description: "Move focus forward" },
      { keys: ["Shift", "Tab"], description: "Move focus backward" },
      { keys: ["Enter"], description: "Activate focused element" },
      { keys: ["Alt", "1"], description: "Skip to main content" },
      { keys: ["Alt", "2"], description: "Skip to navigation" },
    ],
  },
];

function KeyCap({ label }: { label: string }) {
  return (
    <kbd className="inline-flex min-w-[28px] items-center justify-center rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-xs font-semibold text-foreground shadow-sm">
      {label}
    </kbd>
  );
}

export default function ShortcutsPage() {
  return (
    <>
      <Header showBack />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/"
              className="flex items-center gap-1 text-muted transition-premium hover:text-foreground sm:hidden"
              aria-label="Back to home"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </Link>
            <Keyboard
              size={24}
              className="text-accent"
              aria-hidden="true"
            />
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Keyboard Shortcuts
            </h1>
          </div>
          <p className="text-sm text-muted">
            Navigate and control the app efficiently with keyboard shortcuts.
          </p>
        </div>

        {/* Shortcut groups */}
        <div className="space-y-6">
          {SHORTCUT_GROUPS.map((group) => (
            <section
              key={group.id}
              className="overflow-hidden rounded-2xl border border-border/50 glass-card"
              aria-labelledby={`shortcuts-${group.id}`}
            >
              <header className="border-b border-border/30 px-6 py-4">
                <h2
                  id={`shortcuts-${group.id}`}
                  className="text-base font-semibold text-foreground"
                >
                  {group.title}
                </h2>
              </header>
              <ul className="divide-y divide-border/20">
                {group.shortcuts.map((shortcut, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between px-6 py-3"
                  >
                    <span className="text-sm text-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, ki) => (
                        <span key={ki} className="flex items-center gap-1">
                          {ki > 0 && (
                            <span className="text-xs text-muted">+</span>
                          )}
                          <KeyCap label={key} />
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-8 rounded-2xl border border-border/50 glass-card p-6 text-center">
          <p className="text-sm text-muted">
            Press{" "}
            <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-xs font-semibold">
              ?
            </kbd>{" "}
            anywhere in the app to quickly open this page.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
