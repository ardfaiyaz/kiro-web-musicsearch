"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getQueueHistory,
  clearQueueHistory,
  QueueHistoryEntry,
} from "@/lib/queue-history";

export default function QueueHistory() {
  const [history, setHistory] = useState<QueueHistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    return getQueueHistory();
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      setHistory(getQueueHistory());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function handleClear() {
    clearQueueHistory();
    setHistory([]);
  }

  if (history.length === 0) return null;

  return (
    <section aria-label="Queue history" className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-foreground"
          aria-expanded={isExpanded}
        >
          <svg
            className="h-4 w-4 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Recently Played in Session ({history.length})
          <svg
            className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
        {isExpanded && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {isExpanded && (
        <ul className="space-y-1 max-h-64 overflow-y-auto">
          {history.map((entry, index) => (
            <li
              key={`${entry.track.trackId}-${entry.playedAt}-${index}`}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-foreground/5"
            >
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-border">
                {entry.track.artworkUrl100 ? (
                  <Image
                    src={entry.track.artworkUrl100}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <svg
                      className="h-3.5 w-3.5 text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/track/${entry.track.trackId}`}
                  className="block truncate text-xs font-medium text-foreground hover:text-muted transition-colors"
                >
                  {entry.track.trackName}
                </Link>
                <p className="truncate text-[10px] text-muted">
                  {entry.track.artistName}
                </p>
              </div>
              <span className="shrink-0 text-[10px] text-muted">
                {formatTimeAgo(entry.playedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
