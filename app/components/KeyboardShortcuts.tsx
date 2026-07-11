"use client";

import { useEffect, useState, useCallback } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";

export default function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const {
    isPlaying,
    pause,
    resume,
    currentlyPlayingId,
    seekTo,
    currentTime,
    duration,
    volume,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    playNext,
    previousTrack,
    queue,
  } = useAudioPlayer();

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
        if (isInput) {
          (target as HTMLElement).blur();
        }
      }

      // '?' to toggle keyboard shortcuts help (only when not in an input)
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }

      // Playback shortcuts (only when not in an input)
      if (isInput) return;

      // Space = play/pause
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (currentlyPlayingId) {
          if (isPlaying) {
            pause();
          } else {
            resume();
          }
        }
      }

      // Left/Right arrow = seek 5s
      if (e.key === "ArrowLeft" && currentlyPlayingId) {
        e.preventDefault();
        seekTo(Math.max(0, currentTime - 5));
      }
      if (e.key === "ArrowRight" && currentlyPlayingId) {
        e.preventDefault();
        seekTo(Math.min(duration, currentTime + 5));
      }

      // Up/Down arrow = volume
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setVolume(Math.min(1, volume + 0.05));
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setVolume(Math.max(0, volume - 0.05));
      }

      // M = mute toggle
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      }

      // S = shuffle toggle
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        toggleShuffle();
      }

      // R = repeat toggle
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        cycleRepeatMode();
      }

      // N = next track
      if ((e.key === "n" || e.key === "N") && queue.length > 0) {
        e.preventDefault();
        playNext();
      }

      // P = previous track
      if ((e.key === "p" || e.key === "P") && currentlyPlayingId) {
        e.preventDefault();
        previousTrack();
      }
    },
    [
      showHelp,
      isPlaying,
      currentlyPlayingId,
      currentTime,
      duration,
      volume,
      pause,
      resume,
      seekTo,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeatMode,
      playNext,
      previousTrack,
      queue,
    ]
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
        className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Navigation */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-foreground">Focus search</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  /
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Close</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  Esc
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Show shortcuts</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  ?
                </kbd>
              </li>
            </ul>
          </div>

          {/* Playback */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Playback
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-foreground">Play / Pause</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  Space
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Seek back 5s</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  ←
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Seek forward 5s</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  →
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Volume up</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  ↑
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Volume down</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  ↓
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Mute</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  M
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Shuffle</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  S
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Repeat</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  R
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Next track</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  N
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Previous track</span>
                <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted">
                  P
                </kbd>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted">
          Press{" "}
          <kbd className="rounded border border-border px-1 font-mono">
            Esc
          </kbd>{" "}
          to close
        </p>
      </div>
    </div>
  );
}
