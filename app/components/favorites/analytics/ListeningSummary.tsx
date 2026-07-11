"use client";

import { useState, useMemo, useRef, useEffect, useSyncExternalStore } from "react";
import { Clock } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import { computeListeningSummary, type ListeningSummary as SummaryType } from "@/lib/analytics";

interface ListeningSummaryProps {
  history: HistoryEntry[];
}

type Period = "today" | "week" | "month" | "year" | "all";

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
  { id: "all", label: "All Time" },
];

function subscribeNoop() {
  return () => {};
}

function getClientNow() {
  return Date.now();
}

function getServerNow() {
  return 0;
}

function SummaryCounter({
  value,
  label,
  format = "number",
}: {
  value: number;
  label: string;
  format?: "number" | "hours";
}) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (!displayRef.current) return;
    const el = displayRef.current;
    const from = prevValueRef.current;
    const to = value;
    prevValueRef.current = value;

    if (!animatedRef.current) {
      animatedRef.current = true;
    }

    const startTime = performance.now();
    const duration = 500;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      if (el) {
        el.textContent =
          format === "hours" ? current.toFixed(1) : Math.round(current).toString();
      }
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [value, format]);

  return (
    <div className="text-center">
      <span
        ref={displayRef}
        className="block text-lg font-bold text-foreground sm:text-xl"
      >
        0
      </span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export default function ListeningSummary({ history }: ListeningSummaryProps) {
  const [activePeriod, setActivePeriod] = useState<Period>("week");
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const summary: SummaryType = useMemo(
    () => computeListeningSummary(history, activePeriod, now),
    [history, activePeriod, now]
  );

  return (
    <section aria-label="Listening summary" className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">
          Listening Summary
        </h3>
      </div>

      {/* Period selector */}
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Time period"
      >
        {PERIODS.map((period) => (
          <button
            key={period.id}
            type="button"
            role="tab"
            aria-selected={activePeriod === period.id}
            onClick={() => setActivePeriod(period.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
              activePeriod === period.id
                ? "bg-foreground text-background"
                : "glass-subtle text-muted hover:text-foreground"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl glass-light p-4">
          <SummaryCounter value={summary.hours} label="Hours" format="hours" />
        </div>
        <div className="rounded-xl glass-light p-4">
          <SummaryCounter value={summary.songs} label="Songs" />
        </div>
        <div className="rounded-xl glass-light p-4">
          <SummaryCounter value={summary.artists} label="Artists" />
        </div>
        <div className="rounded-xl glass-light p-4">
          <SummaryCounter value={summary.albums} label="Albums" />
        </div>
        <div className="rounded-xl glass-light p-4">
          <SummaryCounter value={summary.sessions} label="Sessions" />
        </div>
      </div>
    </section>
  );
}
