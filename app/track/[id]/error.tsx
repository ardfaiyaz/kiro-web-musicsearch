"use client";

import Header from "@/app/components/Header";

export default function TrackError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center">
        <div className="animate-slide-up">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-foreground/5">
            <svg
              className="h-10 w-10 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Failed to load track
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-muted">
            We could not load the track details. The track may not exist or
            there might be a network issue.
          </p>
        </div>
        <button
          onClick={reset}
          className="cursor-pointer rounded-2xl bg-foreground px-8 py-3.5 font-medium text-background transition-colors hover:bg-foreground/80"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
