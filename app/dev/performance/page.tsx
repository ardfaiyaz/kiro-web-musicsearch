"use client";

import { useEffect, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Activity,
  RefreshCw,
  Clock,
  LayoutDashboard,
  Image,
  MousePointer,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const STORAGE_KEY = "music-web-vitals";
const HISTORY_KEY = "music-web-vitals-history";

interface WebVitalsMetrics {
  lcp: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  timestamp: number;
}

interface VitalsHistory {
  entries: WebVitalsMetrics[];
}

function getStoredMetrics(): WebVitalsMetrics | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as WebVitalsMetrics;
    }
  } catch {
    // Ignore errors
  }
  return null;
}

function getHistory(): VitalsHistory {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored) as VitalsHistory;
    }
  } catch {
    // Ignore errors
  }
  return { entries: [] };
}

function saveToHistory(metrics: WebVitalsMetrics): void {
  try {
    const history = getHistory();
    history.entries = [...history.entries.slice(-29), metrics];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore errors
  }
}

// External store for performance data
let perfListeners: Array<() => void> = [];
let perfSnapshot: { metrics: WebVitalsMetrics | null; history: VitalsHistory } = {
  metrics: null,
  history: { entries: [] },
};

function subscribePerfStore(callback: () => void) {
  perfListeners.push(callback);
  return () => {
    perfListeners = perfListeners.filter((l) => l !== callback);
  };
}

function getPerfSnapshot() {
  return perfSnapshot;
}

function getPerfServerSnapshot() {
  return { metrics: null, history: { entries: [] } };
}

function refreshPerfSnapshot() {
  const currentMetrics = getStoredMetrics();
  perfSnapshot = {
    metrics: currentMetrics,
    history: getHistory(),
  };
  if (currentMetrics) {
    saveToHistory(currentMetrics);
  }
  for (const listener of perfListeners) {
    listener();
  }
}

function getRating(
  metric: string,
  value: number | null
): { label: string; color: string } {
  if (value === null) return { label: "N/A", color: "text-muted" };

  switch (metric) {
    case "lcp":
      if (value <= 2500) return { label: "Good", color: "text-green-500" };
      if (value <= 4000) return { label: "Needs Work", color: "text-yellow-500" };
      return { label: "Poor", color: "text-red-500" };
    case "fcp":
      if (value <= 1800) return { label: "Good", color: "text-green-500" };
      if (value <= 3000) return { label: "Needs Work", color: "text-yellow-500" };
      return { label: "Poor", color: "text-red-500" };
    case "cls":
      if (value <= 0.1) return { label: "Good", color: "text-green-500" };
      if (value <= 0.25) return { label: "Needs Work", color: "text-yellow-500" };
      return { label: "Poor", color: "text-red-500" };
    case "ttfb":
      if (value <= 800) return { label: "Good", color: "text-green-500" };
      if (value <= 1800) return { label: "Needs Work", color: "text-yellow-500" };
      return { label: "Poor", color: "text-red-500" };
    default:
      return { label: "N/A", color: "text-muted" };
  }
}

function formatValue(metric: string, value: number | null): string {
  if (value === null) return "-";
  if (metric === "cls") return value.toFixed(3);
  return `${Math.round(value)}ms`;
}

interface MetricCardProps {
  name: string;
  metric: string;
  value: number | null;
  icon: typeof Clock;
  description: string;
}

function MetricCard({ name, metric, value, icon: Icon, description }: MetricCardProps) {
  const rating = getRating(metric, value);

  return (
    <div className="rounded-2xl border border-border/50 glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-accent" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">
        {formatValue(metric, value)}
      </p>
      <p className={`text-sm font-medium ${rating.color}`}>{rating.label}</p>
      <p className="mt-2 text-xs text-muted">{description}</p>
    </div>
  );
}

export default function PerformanceDashboardPage() {
  const { metrics, history } = useSyncExternalStore(
    subscribePerfStore,
    getPerfSnapshot,
    getPerfServerSnapshot
  );

  useEffect(() => {
    refreshPerfSnapshot();
  }, []);

  const refresh = useCallback(() => {
    refreshPerfSnapshot();
  }, []);

  return (
    <>
      <Header showBack />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1 text-muted transition-premium hover:text-foreground sm:hidden"
                aria-label="Back to home"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </Link>
              <Activity
                size={24}
                className="text-accent"
                aria-hidden="true"
              />
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Performance Dashboard
              </h1>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-premium hover:bg-surface hover:text-foreground"
              aria-label="Refresh metrics"
            >
              <RefreshCw size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">
            Web Vitals metrics collected from your browsing sessions.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            name="LCP"
            metric="lcp"
            value={metrics?.lcp ?? null}
            icon={Image}
            description="Largest Contentful Paint - loading performance"
          />
          <MetricCard
            name="FCP"
            metric="fcp"
            value={metrics?.fcp ?? null}
            icon={LayoutDashboard}
            description="First Contentful Paint - initial render time"
          />
          <MetricCard
            name="CLS"
            metric="cls"
            value={metrics?.cls ?? null}
            icon={MousePointer}
            description="Cumulative Layout Shift - visual stability"
          />
          <MetricCard
            name="TTFB"
            metric="ttfb"
            value={metrics?.ttfb ?? null}
            icon={Clock}
            description="Time to First Byte - server response"
          />
        </div>

        {/* History Table */}
        <section className="rounded-2xl border border-border/50 glass-card overflow-hidden">
          <header className="border-b border-border/30 px-6 py-4">
            <h2 className="text-base font-semibold text-foreground">
              Measurement History
            </h2>
            <p className="text-xs text-muted mt-1">
              Last {history.entries.length} recorded measurements
            </p>
          </header>

          {history.entries.length === 0 ? (
            <div className="p-8 text-center">
              <Activity
                size={32}
                className="mx-auto mb-3 text-muted"
                aria-hidden="true"
              />
              <p className="text-sm text-muted">
                No history yet. Browse the app to collect performance data.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30 text-left">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                      Time
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                      LCP
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                      FCP
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                      CLS
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                      TTFB
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {[...history.entries]
                    .reverse()
                    .slice(0, 20)
                    .map((entry, i) => (
                      <tr key={i} className="hover:bg-surface/50">
                        <td className="px-6 py-3 text-xs text-muted font-mono">
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium ${getRating("lcp", entry.lcp).color}`}
                          >
                            {formatValue("lcp", entry.lcp)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium ${getRating("fcp", entry.fcp).color}`}
                          >
                            {formatValue("fcp", entry.fcp)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium ${getRating("cls", entry.cls).color}`}
                          >
                            {formatValue("cls", entry.cls)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium ${getRating("ttfb", entry.ttfb).color}`}
                          >
                            {formatValue("ttfb", entry.ttfb)}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Info */}
        <div className="mt-6 rounded-2xl border border-border/50 glass-card p-6">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            About Web Vitals
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Web Vitals are a set of metrics that measure real-world user
            experience. They are collected automatically as you browse the app
            using the PerformanceObserver API and stored locally.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg bg-surface p-2 text-center">
              <div className="text-xs font-semibold text-green-500">Good</div>
              <div className="text-[10px] text-muted">LCP &lt; 2.5s</div>
            </div>
            <div className="rounded-lg bg-surface p-2 text-center">
              <div className="text-xs font-semibold text-green-500">Good</div>
              <div className="text-[10px] text-muted">FCP &lt; 1.8s</div>
            </div>
            <div className="rounded-lg bg-surface p-2 text-center">
              <div className="text-xs font-semibold text-green-500">Good</div>
              <div className="text-[10px] text-muted">CLS &lt; 0.1</div>
            </div>
            <div className="rounded-lg bg-surface p-2 text-center">
              <div className="text-xs font-semibold text-green-500">Good</div>
              <div className="text-[10px] text-muted">TTFB &lt; 800ms</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
