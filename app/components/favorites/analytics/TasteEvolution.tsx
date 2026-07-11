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

  if (activeMonths.length === 0) return null;

  return (
    <section aria-label="Taste evolution" className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Taste Evolution
        </h3>
      </div>

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
