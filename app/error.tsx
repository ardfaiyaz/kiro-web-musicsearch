"use client";

import ErrorMessage from "./components/ErrorMessage";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <ErrorMessage
        title="Something went wrong"
        message="An unexpected error occurred while loading the page. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
