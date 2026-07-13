"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CalendarDays, Clock } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import { computeHeatmapData } from "@/lib/analytics";

interface ListeningHeatmapProps {
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

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_LABELS = [
  "12a",
  "",
  "",
  "3a",
  "",
  "",
  "6a",
  "",
  "",
  "9a",
  "",
  "",
  "12p",
  "",
  "",
  "3p",
  "",
  "",
  "6p",
  "",
  "",
  "9p",
  "",
  "",
];

export default function ListeningHeatmap({ history }: ListeningHeatmapProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);
  const [tooltip, setTooltip] = useState<{
    date: string;
    count: number;
    hours: number;
    x: number;
    y: number;
  } | null>(null);

  const [hourTooltip, setHourTooltip] = useState<{
    day: string;
    hour: number;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const heatmapData = useMemo(
    () => computeHeatmapData(history, now),
    [history, now]
  );

  const maxCount = useMemo(() => {
    if (heatmapData.length === 0) return 0;
    return Math.max(...heatmapData.map((d) => d.count));
  }, [heatmapData]);

  // Organize data into weeks (columns of 7 days)
  const weeks = useMemo(() => {
    const result: typeof heatmapData[] = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      result.push(heatmapData.slice(i, i + 7));
    }
    return result;
  }, [heatmapData]);

  // Hour-by-day heatmap: 7 days x 24 hours
  const hourDayGrid = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0) as number[]
    );

    for (const entry of history) {
      const d = new Date(entry.playedAt);
      const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
      const hour = d.getHours();
      grid[dayOfWeek][hour]++;
    }

    return grid;
  }, [history]);

  const hourDayMax = useMemo(() => {
    let max = 0;
    for (const row of hourDayGrid) {
      for (const val of row) {
        if (val > max) max = val;
      }
    }
    return max;
  }, [hourDayGrid]);

  // Peak listening hour
  const peakHour = useMemo(() => {
    const hourTotals = Array(24).fill(0) as number[];
    for (const entry of history) {
      const hour = new Date(entry.playedAt).getHours();
      hourTotals[hour]++;
    }
    let maxHour = 0;
    let maxVal = 0;
    for (let i = 0; i < 24; i++) {
      if (hourTotals[i] > maxVal) {
        maxVal = hourTotals[i];
        maxHour = i;
      }
    }
    return maxHour;
  }, [history]);

  if (heatmapData.length === 0 && history.length === 0) return null;

  function getIntensityClass(count: number): string {
    if (count === 0) return "bg-foreground/5";
    if (maxCount === 0) return "bg-foreground/5";
    const ratio = count / maxCount;
    if (ratio <= 0.25) return "bg-foreground/15";
    if (ratio <= 0.5) return "bg-foreground/30";
    if (ratio <= 0.75) return "bg-foreground/50";
    return "bg-foreground/70";
  }

  function getHourIntensityClass(count: number): string {
    if (count === 0) return "bg-foreground/5";
    if (hourDayMax === 0) return "bg-foreground/5";
    const ratio = count / hourDayMax;
    if (ratio <= 0.2) return "bg-blue-400/20";
    if (ratio <= 0.4) return "bg-blue-400/40";
    if (ratio <= 0.6) return "bg-blue-400/60";
    if (ratio <= 0.8) return "bg-blue-400/80";
    return "bg-blue-400";
  }

  function handleCellHover(
    e: React.MouseEvent,
    day: { date: string; count: number; hours: number }
  ) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const container = (
      e.currentTarget as HTMLElement
    ).closest("[data-heatmap]");
    if (container) {
      const containerRect = container.getBoundingClientRect();
      setTooltip({
        date: day.date,
        count: day.count,
        hours: day.hours,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 8,
      });
    }
  }

  function handleCellLeave() {
    setTooltip(null);
  }

  function handleHourCellHover(
    e: React.MouseEvent,
    dayIdx: number,
    hour: number,
    count: number
  ) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const container = (e.currentTarget as HTMLElement).closest(
      "[data-hour-heatmap]"
    );
    if (container) {
      const containerRect = container.getBoundingClientRect();
      setHourTooltip({
        day: DAY_LABELS[dayIdx],
        hour,
        count,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 8,
      });
    }
  }

  function handleHourCellLeave() {
    setHourTooltip(null);
  }

  function formatHour(hour: number): string {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  }

  return (
    <section aria-label="Listening heatmap" className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Listening Heatmap
        </h3>
      </div>

      {/* Peak Listening Hours - Hour by Day Grid */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" aria-hidden="true" />
            <h4 className="text-sm font-medium text-foreground">
              Peak Listening Hours
            </h4>
            <span className="ml-auto text-xs text-muted">
              Peak: {formatHour(peakHour)}
            </span>
          </div>

          <div
            className="relative rounded-xl glass-subtle p-4 overflow-x-auto"
            data-hour-heatmap
            role="img"
            aria-label="Hour-by-day listening heatmap showing when you listen most"
          >
            {/* Hour tooltip */}
            {hourTooltip && (
              <div
                className="absolute z-20 rounded-lg glass-heavy px-3 py-2 text-xs text-foreground shadow-lg pointer-events-none -translate-x-1/2 -translate-y-full"
                style={{ left: hourTooltip.x, top: hourTooltip.y }}
              >
                <p className="font-medium">
                  {hourTooltip.day} at {formatHour(hourTooltip.hour)}
                </p>
                <p className="text-muted">{hourTooltip.count} plays</p>
              </div>
            )}

            {/* Hour labels (top) */}
            <div className="flex gap-0.5 ml-10 mb-1">
              {HOUR_LABELS.map((label, i) => (
                <span
                  key={i}
                  className="w-4 text-[8px] text-muted text-center"
                  aria-hidden="true"
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Grid rows (one per day) */}
            <div className="space-y-0.5">
              {DAY_LABELS.map((dayLabel, dayIdx) => (
                <div key={dayLabel} className="flex items-center gap-0.5">
                  <span className="w-9 text-[10px] text-muted shrink-0">
                    {dayLabel}
                  </span>
                  {hourDayGrid[dayIdx].map((count, hour) => (
                    <div
                      key={hour}
                      className={`h-4 w-4 rounded-sm ${getHourIntensityClass(count)} transition-colors cursor-pointer hover:ring-1 hover:ring-foreground/30`}
                      onMouseEnter={(e) =>
                        handleHourCellHover(e, dayIdx, hour, count)
                      }
                      onMouseLeave={handleHourCellLeave}
                      tabIndex={0}
                      role="button"
                      aria-label={`${dayLabel} at ${formatHour(hour)}: ${count} plays`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-end gap-1">
              <span className="text-[10px] text-muted mr-1">Less</span>
              <div className="h-3 w-3 rounded-sm bg-foreground/5" />
              <div className="h-3 w-3 rounded-sm bg-blue-400/20" />
              <div className="h-3 w-3 rounded-sm bg-blue-400/40" />
              <div className="h-3 w-3 rounded-sm bg-blue-400/60" />
              <div className="h-3 w-3 rounded-sm bg-blue-400" />
              <span className="text-[10px] text-muted ml-1">More</span>
            </div>
          </div>
        </div>
      )}

      {/* 365-day Activity Heatmap */}
      {heatmapData.length > 0 && (
        <div
          className="relative rounded-xl glass-subtle p-4 overflow-x-auto"
          data-heatmap
          role="img"
          aria-label="365-day listening activity heatmap showing daily listening frequency"
        >
          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-20 rounded-lg glass-heavy px-3 py-2 text-xs text-foreground shadow-lg pointer-events-none -translate-x-1/2 -translate-y-full"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <p className="font-medium">{tooltip.date}</p>
              <p className="text-muted">
                {tooltip.count} songs &middot; {tooltip.hours}h
              </p>
            </div>
          )}

          {/* Day labels */}
          <div className="flex gap-0.5">
            <div className="flex flex-col gap-0.5 mr-1 shrink-0">
              {DAY_LABELS.map((label, i) => (
                <span
                  key={label}
                  className="h-3 w-6 text-[9px] text-muted leading-3 flex items-center"
                  aria-hidden="true"
                >
                  {i % 2 === 1 ? label.substring(0, 1) : ""}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-0.5">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`h-3 w-3 rounded-sm ${getIntensityClass(day.count)} transition-colors cursor-pointer hover:ring-1 hover:ring-foreground/30`}
                      onMouseEnter={(e) => handleCellHover(e, day)}
                      onMouseLeave={handleCellLeave}
                      onFocus={(e) =>
                        handleCellHover(
                          e as unknown as React.MouseEvent,
                          day
                        )
                      }
                      onBlur={handleCellLeave}
                      tabIndex={0}
                      role="button"
                      aria-label={`${day.date}: ${day.count} songs, ${day.hours} hours`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-end gap-1">
            <span className="text-[10px] text-muted mr-1">Less</span>
            <div className="h-3 w-3 rounded-sm bg-foreground/5" />
            <div className="h-3 w-3 rounded-sm bg-foreground/15" />
            <div className="h-3 w-3 rounded-sm bg-foreground/30" />
            <div className="h-3 w-3 rounded-sm bg-foreground/50" />
            <div className="h-3 w-3 rounded-sm bg-foreground/70" />
            <span className="text-[10px] text-muted ml-1">More</span>
          </div>
        </div>
      )}
    </section>
  );
}
