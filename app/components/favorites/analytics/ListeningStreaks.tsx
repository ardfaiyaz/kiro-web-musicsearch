"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Flame, Calendar, Trophy } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import {
  computeStreaksFromHistory,
  getMotivationalMessage,
} from "@/lib/streaks";

interface ListeningStreaksProps {
  history: HistoryEntry[];
}

function subscribeNoop() {
  return () => {};
}

function getClientNow() {
  return Date.now();
}

function getServerNow() {
  return 0;
}

export default function ListeningStreaks({ history }: ListeningStreaksProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const streakData = useMemo(
    () => computeStreaksFromHistory(history, now),
    [history, now]
  );

  const message = useMemo(
    () => getMotivationalMessage(streakData.currentStreak),
    [streakData.currentStreak]
  );

  if (now === 0) return null;

  return (
    <section aria-label="Listening streaks" className="space-y-4">
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-400" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Listening Streaks
        </h3>
      </div>

      <div className="rounded-xl glass-subtle p-6">
        {/* Main streak display */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-orange-400/20 to-red-500/20 border-2 border-orange-400/40">
              <span className="text-3xl font-bold text-foreground">
                {streakData.currentStreak}
              </span>
            </div>
            {streakData.currentStreak >= 7 && (
              <span
                className="absolute -top-1 -right-1 text-2xl"
                aria-hidden="true"
              >
                🔥
              </span>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">
              {streakData.currentStreak === 1 ? "Day" : "Days"} in a Row
            </p>
            <p className="text-xs text-muted mt-1">{message}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg glass-light p-3">
            <Trophy
              className="h-4 w-4 text-amber-400 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-bold text-foreground">
                {streakData.longestStreak}
              </p>
              <p className="text-[10px] text-muted">Longest Streak</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg glass-light p-3">
            <Calendar
              className="h-4 w-4 text-blue-400 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-bold text-foreground">
                {streakData.lastListeningDate || "N/A"}
              </p>
              <p className="text-[10px] text-muted">Last Active</p>
            </div>
          </div>
        </div>

        {/* Streak progress visualization */}
        {streakData.currentStreak > 0 && streakData.currentStreak < 7 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] text-muted mb-1">
              <span>Progress to 7-day streak</span>
              <span>
                {streakData.currentStreak}/7 days
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-700"
                style={{
                  width: `${Math.min((streakData.currentStreak / 7) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
