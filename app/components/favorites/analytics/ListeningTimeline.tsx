"use client";

import { useMemo, useSyncExternalStore } from "react";
import { TrendingUp } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface ListeningTimelineProps {
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

interface MonthData {
  month: string;
  hours: number;
  songs: number;
}

export default function ListeningTimeline({ history }: ListeningTimelineProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const monthlyData = useMemo((): MonthData[] => {
    if (now === 0) return [];

    const months: MonthData[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();

      const monthEntries = history.filter((e) => {
        const entryDate = new Date(e.playedAt);
        return (
          entryDate.getFullYear() === year && entryDate.getMonth() === month
        );
      });

      const totalMs = monthEntries.reduce((sum, e) => sum + e.duration, 0);
      const hours = Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10;

      months.push({
        month: d.toLocaleDateString("en-US", { month: "short" }),
        hours,
        songs: monthEntries.length,
      });
    }

    return months;
  }, [history, now]);

  const maxHours = useMemo(
    () => Math.max(...monthlyData.map((m) => m.hours), 1),
    [monthlyData]
  );

  if (monthlyData.length === 0 || history.length === 0) return null;

  return (
    <section aria-label="Listening timeline" className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Monthly Activity
        </h3>
      </div>

      <div
        className="space-y-2 rounded-xl glass-subtle p-4"
        role="img"
        aria-label="Monthly listening activity showing hours per month over the last 12 months"
      >
        {monthlyData.map((month) => (
          <div key={month.month} className="flex items-center gap-3">
            <span className="w-8 text-xs font-medium text-muted shrink-0">
              {month.month}
            </span>
            <div className="flex-1 h-6 rounded-full bg-foreground/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground/40 transition-all duration-700 ease-out flex items-center justify-end pr-2"
                style={{
                  width: `${Math.max((month.hours / maxHours) * 100, 2)}%`,
                }}
              >
                {month.hours > 0 && (
                  <span className="text-[10px] font-medium text-foreground whitespace-nowrap">
                    {month.hours}h
                  </span>
                )}
              </div>
            </div>
            <span className="w-12 text-right text-[10px] text-muted shrink-0">
              {month.songs} songs
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
