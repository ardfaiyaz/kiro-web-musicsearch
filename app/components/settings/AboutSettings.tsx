"use client";

import { Info, ExternalLink, Keyboard, Music2 } from "lucide-react";

const TECH_STACK = [
  { name: "Next.js 16", url: "https://nextjs.org" },
  { name: "React 19", url: "https://react.dev" },
  { name: "Tailwind CSS 4", url: "https://tailwindcss.com" },
  { name: "TypeScript 5", url: "https://typescriptlang.org" },
];

const API_PROVIDERS = [
  { name: "iTunes Search API", description: "Music search and previews" },
  { name: "Last.fm API", description: "Artist info and recommendations" },
  { name: "Apple Music RSS", description: "Trending and top charts" },
];

const KEYBOARD_SHORTCUTS = [
  { keys: ["Space"], description: "Play / Pause" },
  { keys: ["Ctrl", "K"], description: "Command Palette" },
  { keys: ["\u2190", "\u2192"], description: "Seek backward / forward" },
  { keys: ["M"], description: "Toggle mute" },
  { keys: ["Ctrl", "/"], description: "Keyboard shortcuts" },
];

export default function AboutSettings() {
  return (
    <section aria-labelledby="about-heading" className="space-y-6">
      <div className="flex items-center gap-2">
        <Info size={20} className="text-muted" aria-hidden="true" />
        <h2 id="about-heading" className="text-lg font-semibold text-foreground">
          About
        </h2>
      </div>

      {/* App Info */}
      <div className="flex items-center gap-4 rounded-xl bg-surface px-4 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/10">
          <Music2 size={24} className="text-foreground" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Music Search &amp; Discovery
          </h3>
          <p className="text-sm text-muted">Version 1.0.0</p>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Built With</h3>
        <div className="grid grid-cols-2 gap-2">
          {TECH_STACK.map(({ name, url }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-surface px-4 py-3 text-sm text-foreground transition-premium hover:bg-surface-hover"
            >
              <span>{name}</span>
              <ExternalLink
                size={12}
                className="text-muted"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
      </div>

      {/* API Providers */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">API Providers</h3>
        <div className="space-y-2">
          {API_PROVIDERS.map(({ name, description }) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-xl bg-surface px-4 py-3"
            >
              <div>
                <span className="text-sm font-medium text-foreground">{name}</span>
                <p className="text-xs text-muted">{description}</p>
              </div>
              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Keyboard size={16} className="text-muted" aria-hidden="true" />
          <h3 className="text-sm font-medium text-foreground">Keyboard Shortcuts</h3>
        </div>
        <div className="space-y-2">
          {KEYBOARD_SHORTCUTS.map(({ keys, description }) => (
            <div
              key={description}
              className="flex items-center justify-between rounded-lg bg-surface px-4 py-2.5"
            >
              <span className="text-sm text-foreground">{description}</span>
              <div className="flex items-center gap-1">
                {keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded border border-border bg-background px-2 py-0.5 text-xs font-mono text-muted"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="space-y-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm text-foreground transition-premium hover:bg-surface-hover"
        >
          <span>View on GitHub</span>
          <ExternalLink size={14} className="text-muted" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
