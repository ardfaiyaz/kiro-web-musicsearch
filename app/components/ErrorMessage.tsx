export default function ErrorMessage({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <svg
        className="h-16 w-16 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-xl bg-accent px-6 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
