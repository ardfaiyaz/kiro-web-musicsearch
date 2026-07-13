"use client";

import { useMemo } from "react";
import { Timer, Music, Clock } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface LongestSessionProps {
  history: HistoryEntry[];
}

interface SessionData {
  startTime: number;
  endTime: number;
  songCount: number;
  durationMinutes: number;
  artists: string[];
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export default function LongestSession({ history }: LongestSessionProps) {
  const session = useMemo((): SessionData | null => {
    if (history.length < 2) return null;

    // Sort history by playedAt ascending
    const sorted = [...history].sort((a, b) => a.playedAt - b.playedAt);

    // Find sessions: consecutive plays within 5 minute gap (300000ms)
    const GAP_THRESHOLD = 5 * 60 * 1000; // 5 minutes

    let longestSession: SessionData | null = null;
    let currentSessionStart = sorted[0].playedAt;
    let currentSessionEnd = sorted[0].playedAt + sorted[0].duration;
    let currentSongCount = 1;
    let currentArtists = new Set<string>([sorted[0].artistName]);

    for (let i = 1; i < sorted.length; i++) {
      const entry = sorted[i];
      const prevEnd = currentSessionEnd;
      const gap = entry.playedAt - prevEnd;

      if (gap <= GAP_THRESHOLD) {
        // Continue current session
        currentSessionEnd = entry.playedAt + entry.duration;
        currentSongCount++;
        currentArtists.add(entry.artistName);
      } else {
        // End current session, check if longest
        const duration = (currentSessionEnd - currentSessionStart) / (1000 * 60);
        if (
          !longestSession ||
          duration > longestSession.durationMinutes
        ) {
          longestSession = {
            startTime: currentSessionStart,
            endTime: currentSessionEnd,
            songCount: currentSongCount,
            durationMinutes: duration,
            artists: Array.from(currentArtists).slice(0, 5),
          };
        }

        // Start new session
        currentSessionStart = entry.playedAt;
        currentSessionEnd = entry.playedAt + entry.duration;
        currentSongCount = 1;
        currentArtists = new Set<string>([entry.artistName]);
      }
    }

    // Check final session
    const finalDuration =
      (currentSessionEnd - currentSessionStart) / (1000 * 60);
    if (
      !longestSession ||
      finalDuration > longestSession.durationMinutes
    ) {
      longestSession = {
        startTime: currentSessionStart,
        endTime: currentSessionEnd,
        songCount: currentSongCount,
        durationMinutes: finalDuration,
        artists: Array.from(currentArtists).slice(0, 5),
      };
    }

    return longestSession;
  }, [history]);

  if (!session || session.songCount < 2) return null;

  const sessionDate = new Date(session.startTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const startTimeStr = new Date(session.startTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const endTimeStr = new Date(session.endTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section aria-label="Longest listening session" className="space-y-4">
      <div className="flex items-center gap-2">
        <Timer className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Longest Session
        </h3>
      </div>

      <div className="rounded-xl glass-subtle p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Duration display */}
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-500/20 border-2 border-green-400/40 flex items-center justify-center">
              <span className="text-xl font-bold text-foreground">
                {formatDuration(session.durationMinutes)}
              </span>
            </div>
            <p className="text-xs text-muted mt-2">Longest Session</p>
          </div>

          {/* Session details */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Music
                  className="h-4 w-4 text-blue-400 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {session.songCount}
                  </p>
                  <p className="text-[10px] text-muted">Songs Played</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock
                  className="h-4 w-4 text-green-400 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {startTimeStr}
                  </p>
                  <p className="text-[10px] text-muted">
                    to {endTimeStr}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted">
              Recorded on {sessionDate}
            </p>

            {/* Artists in session */}
            {session.artists.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {session.artists.map((artist) => (
                  <span
                    key={artist}
                    className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-[10px] text-foreground"
                  >
                    {artist}
                  </span>
                ))}
                {session.artists.length === 5 && (
                  <span className="text-[10px] text-muted self-center">
                    + more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
