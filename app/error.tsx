"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
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
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">
          An unexpected error occurred while loading the page. Please try again.
        </p>
      </div>
      <button
        onClick={reset}
        className="cursor-pointer rounded-2xl bg-foreground px-8 py-3.5 font-medium text-background transition-colors hover:bg-foreground/80"
      >
        Try Again
      </button>
    </div>
  );
}
