"use client";

import { useState, useEffect } from "react";

type ApiStatus = "checking" | "online" | "degraded" | "offline";

export default function APIStatusIndicator() {
  const [status, setStatus] = useState<ApiStatus>("checking");
  const [responseTime, setResponseTime] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkStatus() {
      const start = performance.now();
      try {
        const response = await fetch(
          "https://itunes.apple.com/search?term=test&limit=1&media=music",
          { signal: AbortSignal.timeout(5000) }
        );
        const duration = Math.round(performance.now() - start);
        if (!mounted) return;

        if (response.ok) {
          setStatus(duration > 2000 ? "degraded" : "online");
          setResponseTime(duration);
        } else {
          setStatus("degraded");
          setResponseTime(duration);
        }
      } catch {
        if (!mounted) return;
        setStatus("offline");
        setResponseTime(null);
      }
    }

    checkStatus();

    // Re-check every 60 seconds
    const interval = setInterval(checkStatus, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const statusConfig = {
    checking: {
      color: "bg-yellow-400",
      label: "Checking API...",
    },
    online: {
      color: "bg-green-500",
      label: "API Online",
    },
    degraded: {
      color: "bg-yellow-500",
      label: "API Slow",
    },
    offline: {
      color: "bg-red-500",
      label: "API Offline",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className="inline-flex items-center gap-2"
      role="status"
      aria-live="polite"
      aria-label={`iTunes API status: ${config.label}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${config.color} ${
          status === "checking" ? "animate-pulse" : ""
        }`}
        aria-hidden="true"
      />
      <span className="text-xs text-muted">
        {config.label}
        {responseTime !== null && status !== "offline" && (
          <span className="ml-1 font-mono">({responseTime}ms)</span>
        )}
      </span>
    </div>
  );
}
