"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Sparkles } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import { computeTasteEvolution } from "@/lib/analytics";

interface TasteEvolutionProps {
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

const EVOLUTION_COLORS = [
  { line: "bg-violet-400", text: "text-violet-400", dot: "bg-violet-400" },
  { line: "bg-blue-400", text: "text-blue-400", dot: "bg-blue-400" },
  { line: "bg-emerald-400", text: "text-emerald-400", dot: "bg-emerald-400" },
  { line: "bg-amber-400", text: "text-amber-400", dot: "bg-amber-400" },
  { line: "bg-pink-400", text: "text-pink-400", dot: "bg-pink-400" },
];

interface GenreMonthlyData {
  genre: string;
  monthlyPercentages: number[];
  colorIdx: number;
}

export default function TasteEvolution({ history }: TasteEvolutionProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const evolution = useMemo(
    () => computeTasteEvolution(history, now),
    [history, now]
  );

  // Filter months with genres
  const activeMonths = useMemo(
    () => evolution.filter((m) => m.topGenres.length > 0),
    [evolution]
  );

  // Compute genre evolution data for chart
  const genreEvolutionData = useMemo((): GenreMonthlyData[] => {
    if (now === 0 || history.length === 0) return [];

    // Get top 5 genres overall
    const genreCount = new Map<string, number>();
    for (const entry of history) {
      if (entry.primaryGenreName) {
        genreCount.set(
          entry.primaryGenreName,
          (genreCount.get(entry.primaryGenreName) || 0) + 1
        );
      }
    }
    const topGenres = Array.from(genreCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);

    if (topGenres.length === 0) return [];

    // Compute monthly percentages for each genre
    const result: GenreMonthlyData[] = topGenres.map((genre, idx) => ({
      genre,
      monthlyPercentages: [],
      colorIdx: idx,
    }));

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

      const monthTotal = monthEntries.length;

      for (const genreData of result) {
        if (monthTotal === 0) {
          genreData.monthlyPercentages.push(0);
        } else {
          const count = monthEntries.filter(
            (e) => e.primaryGenreName === genreData.genre
          ).length;
          genreData.monthlyPercentages.push(
            Math.round((count / monthTotal) * 100)
          );
        }
      }
    }

    return result;
  }, [history, now]);

  // Month labels for chart
  const monthLabels = useMemo(() => {
    if (now === 0) return [];
    const labels: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      labels.push(
        d.toLocaleDateString("en-US", { month: "short" })
      );
    }
    return labels;
  }, [now]);

  if (activeMonths.length === 0) return null;

  return (
    <section aria-label="Taste evolution" className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Taste Evolution
        </h3>
      </div>

      {/* CSS-based area chart */}
      {genreEvolutionData.length > 0 && (
        <div className="rounded-xl glass-subtle p-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4">
            {genreEvolutionData.map((g) => (
              <div key={g.genre} className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${EVOLUTION_COLORS[g.colorIdx % EVOLUTION_COLORS.length].dot}`}
                />
                <span className="text-[11px] text-foreground">
                  {g.genre}
                </span>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div
            className="relative h-40"
            role="img"
            aria-label="Genre evolution chart showing percentage changes over 12 months"
          >
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-muted w-6">
              <span>100%</span>
              <span>50%</span>
              <span>0%</span>
            </div>

            {/* Grid lines */}
            <div className="absolute left-7 right-0 top-0 bottom-0">
              <div className="absolute top-0 left-0 right-0 h-px bg-foreground/5" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-foreground/5" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-foreground/10" />
            </div>

            {/* Bars per month */}
            <div className="absolute left-7 right-0 top-0 bottom-4 flex items-end gap-0.5">
              {monthLabels.map((label, monthIdx) => (
                <div
                  key={label + monthIdx}
                  className="flex-1 flex flex-col items-center gap-0"
                >
                  {/* Stacked bars for this month */}
                  <div className="w-full flex flex-col-reverse items-stretch h-36">
                    {genreEvolutionData.map((g) => {
                      const pct = g.monthlyPercentages[monthIdx] || 0;
                      const height = (pct / 100) * 100;
                      return (
                        <div
                          key={g.genre}
                          className={`w-full ${EVOLUTION_COLORS[g.colorIdx % EVOLUTION_COLORS.length].line} opacity-60 transition-all duration-500`}
                          style={{ height: `${height}%` }}
                          title={`${g.genre}: ${pct}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div className="absolute left-7 right-0 bottom-0 flex">
              {monthLabels.map((label, i) => (
                <span
                  key={label + i}
                  className="flex-1 text-center text-[8px] text-muted"
                >
                  {i % 2 === 0 ? label : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline view */}
      <div
        className="rounded-xl glass-subtle p-4"
        role="img"
        aria-label="Music taste evolution showing top genres per month over the last 12 months"
      >
        <div className="relative pl-6">
          {/* Vertical timeline line */}
          <div
            className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-foreground/10"
            aria-hidden="true"
          />

          <div className="space-y-4">
            {activeMonths.map((month, index) => (
              <div key={month.month} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div
                  className={`absolute left-[-18px] top-1.5 h-3 w-3 rounded-full border-2 ${
                    index === 0
                      ? "border-foreground bg-foreground"
                      : "border-foreground/30 bg-background"
                  }`}
                  aria-hidden="true"
                />

                {/* Content */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                  <span className="text-xs font-medium text-muted w-20 shrink-0">
                    {month.month}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {month.topGenres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full bg-foreground/10 px-2.5 py-1 text-xs text-foreground"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
