"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import { X, Bug, RefreshCw } from "lucide-react";
import {
  getDebugMetrics,
  resetDebugMetrics,
  getAverageApiTime,
  getCacheHitRate,
  loadDebugMetrics,
  type DebugMetrics,
} from "@/lib/debug";

// External store for debug metrics polling
let debugListeners: Array<() => void> = [];
let debugSnapshot: DebugMetrics | null = null;

function subscribeDebug(callback: () => void) {
  debugListeners.push(callback);
  return () => {
    debugListeners = debugListeners.filter((l) => l !== callback);
  };
}

function getDebugSnapshot(): DebugMetrics | null {
  return debugSnapshot;
}

function notifyDebugListeners() {
  debugSnapshot = getDebugMetrics();
  for (const listener of debugListeners) {
    listener();
  }
}

export default function DebugOverlay() {
  const [visible, setVisible] = useState(false);
  const metrics = useSyncExternalStore(
    subscribeDebug,
    getDebugSnapshot,
    () => null
  );

  useEffect(() => {
    loadDebugMetrics();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!visible) return;
    // Initial notification
    notifyDebugListeners();
    const interval = setInterval(notifyDebugListeners, 2000);
    return () => clearInterval(interval);
  }, [visible]);

  const handleReset = useCallback(() => {
    resetDebugMetrics();
    notifyDebugListeners();
  }, []);

  if (!visible) return null;

  const avgApiTime = getAverageApiTime();
  const cacheHitRate = getCacheHitRate();
  const memoryMB = metrics?.memoryUsage
    ? (metrics.memoryUsage / 1024 / 1024).toFixed(1)
    : "N/A";

  return (
    <aside
      className="fixed bottom-20 left-4 z-[60] w-80 max-h-[70vh] overflow-y-auto rounded-2xl border border-border/50 glass-card shadow-xl sm:bottom-6"
      role="complementary"
      aria-label="Debug overlay"
    >
      {/* Header */}
      <header className="sticky top-0 flex items-center justify-between border-b border-border/30 bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Bug size={16} className="text-accent" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">
            Debug Mode
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="rounded-md p-1.5 text-muted transition-colors hover:text-foreground"
            aria-label="Reset debug metrics"
          >
            <RefreshCw size={14} aria-hidden="true" />
          </button>
          <button
            onClick={() => setVisible(false)}
            className="rounded-md p-1.5 text-muted transition-colors hover:text-foreground"
            aria-label="Close debug overlay"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Avg API Time
            </p>
            <p className="text-lg font-bold text-foreground">{avgApiTime}ms</p>
          </div>
          <div className="rounded-xl bg-surface p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Cache Hit Rate
            </p>
            <p className="text-lg font-bold text-foreground">{cacheHitRate}%</p>
          </div>
          <div className="rounded-xl bg-surface p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Memory
            </p>
            <p className="text-lg font-bold text-foreground">{memoryMB} MB</p>
          </div>
          <div className="rounded-xl bg-surface p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              API Calls
            </p>
            <p className="text-lg font-bold text-foreground">
              {metrics?.apiCalls.length ?? 0}
            </p>
          </div>
        </div>

        {/* Render Counts */}
        {metrics && Object.keys(metrics.renderCounts).length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
              Render Counts
            </h3>
            <ul className="space-y-1 text-xs">
              {Object.entries(metrics.renderCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([name, count]) => (
                  <li
                    key={name}
                    className="flex items-center justify-between rounded-lg bg-surface px-3 py-1.5"
                  >
                    <span className="truncate text-foreground">{name}</span>
                    <span className="ml-2 font-mono text-muted">{count}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Recent API Calls */}
        {metrics && metrics.apiCalls.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
              Recent API Calls
            </h3>
            <ul className="space-y-1 text-xs">
              {metrics.apiCalls.slice(0, 8).map((call, i) => (
                <li
                  key={i}
                  className="rounded-lg bg-surface px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate max-w-[160px] text-foreground font-mono">
                      {call.url.replace(/https?:\/\//, "").split("?")[0]}
                    </span>
                    <span
                      className={`font-mono ${
                        call.cached
                          ? "text-green-500"
                          : call.duration > 1000
                            ? "text-red-500"
                            : "text-muted"
                      }`}
                    >
                      {call.cached ? "cached" : `${call.duration}ms`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-[10px] text-muted text-center">
          Toggle: Ctrl+Shift+D
        </p>
      </div>
    </aside>
  );
}
