"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Timer, X } from "lucide-react";
import { useAudioPlayer } from "../AudioPlayerContext";

const TIMER_OPTIONS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "1 hour", minutes: 60 },
];

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function SleepTimerPopover() {
  const { sleepTimerRemaining, setSleepTimer } = useAudioPlayer();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const handleSetTimer = useCallback(
    (minutes: number) => {
      setSleepTimer(minutes);
      setIsOpen(false);
    },
    [setSleepTimer]
  );

  const handleCancel = useCallback(() => {
    setSleepTimer(null);
    setIsOpen(false);
  }, [setSleepTimer]);

  const isActive = sleepTimerRemaining !== null;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
          isActive
            ? "bg-foreground/10 text-foreground"
            : "text-muted hover:text-foreground"
        }`}
        aria-label={
          isActive
            ? `Sleep timer: ${formatCountdown(sleepTimerRemaining)} remaining`
            : "Set sleep timer"
        }
        aria-expanded={isOpen}
      >
        <Timer className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full right-0 mb-2 w-48 rounded-xl border border-border bg-card p-3 shadow-xl"
          role="menu"
          aria-label="Sleep timer options"
        >
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Sleep Timer
          </h3>

          {isActive ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                <span className="text-sm font-medium text-foreground tabular-nums">
                  {formatCountdown(sleepTimerRemaining)}
                </span>
                <span className="text-xs text-muted">remaining</span>
              </div>
              <button
                onClick={handleCancel}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
                role="menuitem"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Cancel Timer
              </button>
            </div>
          ) : (
            <ul className="space-y-1">
              {TIMER_OPTIONS.map((option) => (
                <li key={option.minutes}>
                  <button
                    onClick={() => handleSetTimer(option.minutes)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface"
                    role="menuitem"
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
