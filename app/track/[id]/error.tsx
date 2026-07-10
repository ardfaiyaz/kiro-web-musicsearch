"use client";

import ErrorMessage from "@/app/components/ErrorMessage";
import Link from "next/link";

export default function TrackError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted transition-colors hover:text-foreground"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm font-medium">Back to Search</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <ErrorMessage
          title="Failed to load track"
          message="We could not load the track details. The track may not exist or there might be a network issue."
          onRetry={reset}
        />
      </main>
    </div>
  );
}
