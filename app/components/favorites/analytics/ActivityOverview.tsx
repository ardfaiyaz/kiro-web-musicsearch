"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Activity, Sun, Sunset, Moon, Clock } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import { computeTimeDistribution } from "@/lib/analytics";

interface ActivityOverviewProps {
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

export default function ActivityOverview({ history }: ActivityOverviewProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const stats = useMemo(() => {
    if (history.length === 0 || now === 0) {
      return {
        dailyAvg: 0,
        weeklyAvg: 0,
        avgSessionMin: 0,
        longestSessionMin: 0,
        favoriteTime: "N/A",
      };
    }

    const totalMs = history.reduce((sum, e) => sum + e.duration, 0);

    // Calculate date range
    const oldestEntry = history[history.length - 1];
    const dayMs = 24 * 60 * 60 * 1000;
    const daysActive = Math.max(
      1,
      Math.ceil((now - oldestEntry.playedAt) / dayMs)
    );
    const weeksActive = Math.max(1, Math.ceil(daysActive / 7));

    const dailyAvgMin = totalMs / daysActive / 60000;
    const weeklyAvgHours = totalMs / weeksActive / (1000 * 60 * 60);

    // Session stats
    const sessionMap = new Map<string, number>();
    for (const entry of history) {
      sessionMap.set(
        entry.sessionId,
        (sessionMap.get(entry.sessionId) || 0) + entry.duration
      );
    }
    const sessionDurations = Array.from(sessionMap.values());
    const avgSessionMin =
      sessionDurations.length > 0
        ? sessionDurations.reduce((a, b) => a + b, 0) /
          sessionDurations.length /
          60000
        : 0;
    const longestSessionMin =
      sessionDurations.length > 0
        ? Math.max(...sessionDurations) / 60000
        : 0;

    // Favorite listening time
    const distribution = computeTimeDistribution(history);
    const times: { label: string; value: number }[] = [
      { label: "Morning", value: distribution.morning },
      { label: "Afternoon", value: distribution.afternoon },
      { label: "Evening", value: distribution.evening },
      { label: "Night", value: distribution.night },
    ];
    const favoriteTime =
      times.sort((a, b) => b.value - a.value)[0]?.label || "N/A";

    return {
      dailyAvg: Math.round(dailyAvgMin),
      weeklyAvg: Math.round(weeklyAvgHours * 10) / 10,
      avgSessionMin: Math.round(avgSessionMin),
      longestSessionMin: Math.round(longestSessionMin),
      favoriteTime,
    };
  }, [history, now]);

  const timeIcon = useMemo(() => {
    switch (stats.favoriteTime) {
      case "Morning":
        return <Sun className="h-4 w-4 text-yellow-400" aria-hidden="true" />;
      case "Afternoon":
        return <Sun className="h-4 w-4 text-orange-400" aria-hidden="true" />;
      case "Evening":
        return <Sunset className="h-4 w-4 text-purple-400" aria-hidden="true" />;
      case "Night":
        return <Moon className="h-4 w-4 text-blue-400" aria-hidden="true" />;
      default:
        return <Clock className="h-4 w-4 text-muted" aria-hidden="true" />;
    }
  }, [stats.favoriteTime]);

  if (history.length === 0) return null;

  return (
    <section aria-label="Activity overview" className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Activity Overview
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl glass-subtle p-4 text-center">
          <span className="block text-lg font-bold text-foreground">
            {stats.dailyAvg} min
          </span>
          <span className="text-xs text-muted">Daily Average</span>
        </div>
        <div className="rounded-xl glass-subtle p-4 text-center">
          <span className="block text-lg font-bold text-foreground">
            {stats.weeklyAvg} hrs
          </span>
          <span className="text-xs text-muted">Weekly Average</span>
        </div>
        <div className="rounded-xl glass-subtle p-4 text-center">
          <span className="block text-lg font-bold text-foreground">
            {stats.avgSessionMin} min
          </span>
          <span className="text-xs text-muted">Avg Session</span>
        </div>
        <div className="rounded-xl glass-subtle p-4 text-center">
          <span className="block text-lg font-bold text-foreground">
            {stats.longestSessionMin} min
          </span>
          <span className="text-xs text-muted">Longest Session</span>
        </div>
        <div className="rounded-xl glass-subtle p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {timeIcon}
          </div>
          <span className="block text-lg font-bold text-foreground">
            {stats.favoriteTime}
          </span>
          <span className="text-xs text-muted">Favorite Time</span>
        </div>
      </div>
    </section>
  );
}
