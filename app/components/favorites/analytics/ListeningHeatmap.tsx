"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CalendarDays } from "lucide-react";
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

export default function ListeningHeatmap({ history }: ListeningHeatmapProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);
  const [tooltip, setTooltip] = useState<{
    date: string;
    count: number;
    hours: number;
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

  if (heatmapData.length === 0) return null;

  function getIntensityClass(count: number): string {
    if (count === 0) return "bg-foreground/5";
    if (maxCount === 0) return "bg-foreground/5";
    const ratio = count / maxCount;
    if (ratio <= 0.25) return "bg-foreground/15";
    if (ratio <= 0.5) return "bg-foreground/30";
    if (ratio <= 0.75) return "bg-foreground/50";
    return "bg-foreground/70";
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

  return (
    <section aria-label="Listening heatmap" className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Listening Heatmap
        </h3>
      </div>

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
    </section>
  );
}
