"use client";

import { useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { Clock, Music } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface ListeningSessionProps {
  history: HistoryEntry[];
}

interface Session {
  id: string;
  entries: HistoryEntry[];
  startTime: number;
  endTime: number;
  totalDuration: number;
  artists: string[];
}

const SESSION_GAP_MS = 30 * 60 * 1000; // 30 minutes

function formatSessionTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatSessionDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function ListeningSession({ history }: ListeningSessionProps) {
  const nowRef = useRef(0);
  useEffect(() => {
    nowRef.current = Date.now();
  }, []);

  const sessions = useMemo((): Session[] => {
    if (history.length === 0) return [];

    const sorted = [...history].sort((a, b) => b.playedAt - a.playedAt);
    const result: Session[] = [];
    let currentSession: HistoryEntry[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const prevTime = sorted[i - 1].playedAt;
      const currTime = sorted[i].playedAt;
      // If the gap between consecutive entries is within 30 min, group them
      if (prevTime - currTime <= SESSION_GAP_MS) {
        currentSession.push(sorted[i]);
      } else {
        if (currentSession.length > 1) {
          result.push(buildSession(currentSession));
        }
        currentSession = [sorted[i]];
      }
    }
    if (currentSession.length > 1) {
      result.push(buildSession(currentSession));
    }

    return result.slice(0, 10);
  }, [history]);

  if (sessions.length === 0) return null;

  return (
    <section aria-label="Listening sessions" className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Sessions</h3>
      <div className="space-y-3">
        {sessions.map((session) => (
          <article
            key={session.id}
            className="rounded-2xl glass-light p-4 transition-premium hover:bg-foreground/5"
          >
            <div className="flex items-start gap-4">
              {/* Stacked artwork thumbnails */}
              <div className="relative h-12 w-12 shrink-0" aria-hidden="true">
                {session.entries.slice(0, 3).map((entry, idx) => (
                  <div
                    key={`${entry.trackId}-${entry.playedAt}`}
                    className="absolute overflow-hidden rounded-lg border-2 border-background"
                    style={{
                      width: "32px",
                      height: "32px",
                      top: `${idx * 4}px`,
                      left: `${idx * 6}px`,
                      zIndex: 3 - idx,
                    }}
                  >
                    <Image
                      src={entry.artworkUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">
                    {formatSessionTime(session.startTime)} - {formatSessionTime(session.endTime)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Music className="h-3 w-3" aria-hidden="true" />
                    {session.entries.length} songs
                  </span>
                  <span>{formatSessionDuration(session.totalDuration)}</span>
                  <span className="truncate">
                    {session.artists.slice(0, 3).join(", ")}
                    {session.artists.length > 3 && ` +${session.artists.length - 3}`}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function buildSession(entries: HistoryEntry[]): Session {
  const sorted = [...entries].sort((a, b) => a.playedAt - b.playedAt);
  const artists = [...new Set(entries.map((e) => e.artistName))];
  const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);

  return {
    id: sorted[0].sessionId || `session-${sorted[0].playedAt}`,
    entries: sorted,
    startTime: sorted[0].playedAt,
    endTime: sorted[sorted.length - 1].playedAt + sorted[sorted.length - 1].duration,
    totalDuration,
    artists,
  };
}
