"use client";

import { useState, useCallback } from "react";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setTimeout(() => {
      reset();
      setIsRetrying(false);
    }, 600);
  }, [reset]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center sm:py-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-error/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 h-56 w-56 rounded-full bg-warning/5 blur-3xl" />
      </div>

      <div className="animate-slide-up">
        {/* Animated error illustration */}
        <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-error/5 sm:h-32 sm:w-32">
          <AlertTriangle
            size={48}
            className="text-error/70"
            aria-hidden="true"
          />
        </div>

        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted sm:text-lg">
          An unexpected error occurred while loading the page. This might be a
          temporary issue.
        </p>

        {/* Error details (only in development) */}
        {error.digest && (
          <p className="mt-3 text-xs text-muted/60">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in">
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-premium hover:bg-foreground/80 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={isRetrying ? "animate-spin" : ""}
            aria-hidden="true"
          />
          {isRetrying ? "Retrying..." : "Try Again"}
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-premium hover:bg-foreground/5"
        >
          <Home size={16} aria-hidden="true" />
          Go Home
        </Link>
      </div>

      {/* Help suggestion */}
      <div className="max-w-sm rounded-2xl glass-card p-4 text-left animate-fade-in">
        <p className="text-sm font-medium text-foreground">
          If this keeps happening:
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-muted">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted/50" aria-hidden="true" />
            Try refreshing the page
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted/50" aria-hidden="true" />
            Check your internet connection
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted/50" aria-hidden="true" />
            Clear your browser cache
          </li>
        </ul>
      </div>
    </div>
  );
}
