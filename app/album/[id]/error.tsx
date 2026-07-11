"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw, Home, Search } from "lucide-react";

export default function AlbumError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="glass-medium mx-auto max-w-md rounded-2xl p-8 text-center">
        <AlertCircle
          className="mx-auto mb-4 h-12 w-12 text-red-400"
          aria-hidden="true"
        />
        <h2 className="mb-2 text-xl font-bold text-foreground">
          Failed to load album
        </h2>
        <p className="mb-6 text-sm text-muted">
          Something went wrong while loading the album details. Please try
          again or explore other music.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go Home
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
