import { ApiErrorType } from "@/lib/api-error";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  errorType?: ApiErrorType;
  onRetry?: () => void;
}

function getErrorIcon(errorType?: ApiErrorType) {
  switch (errorType) {
    case "network":
      return (
        <svg
          className="h-16 w-16 text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01"
          />
        </svg>
      );
    case "rate_limit":
      return (
        <svg
          className="h-16 w-16 text-orange-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "timeout":
      return (
        <svg
          className="h-16 w-16 text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "not_found":
      return (
        <svg
          className="h-16 w-16 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      );
    default:
      return (
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
      );
  }
}

function getDefaultTitle(errorType?: ApiErrorType): string {
  switch (errorType) {
    case "network":
      return "Connection Error";
    case "rate_limit":
      return "Too Many Requests";
    case "timeout":
      return "Request Timed Out";
    case "not_found":
      return "Not Found";
    case "server":
      return "Server Error";
    default:
      return "Something went wrong";
  }
}

function getDefaultMessage(errorType?: ApiErrorType): string {
  switch (errorType) {
    case "network":
      return "Unable to connect. Please check your internet connection and try again.";
    case "rate_limit":
      return "You have made too many requests. Please wait a moment and try again.";
    case "timeout":
      return "The request took too long to respond. Please try again.";
    case "not_found":
      return "The content you are looking for could not be found.";
    case "server":
      return "The server encountered an error. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

export default function ErrorMessage({
  title,
  message,
  errorType,
  onRetry,
}: ErrorMessageProps) {
  const displayTitle = title || getDefaultTitle(errorType);
  const displayMessage = message || getDefaultMessage(errorType);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      {getErrorIcon(errorType)}
      <h2 className="text-xl font-semibold text-foreground">{displayTitle}</h2>
      <p className="max-w-md text-muted">{displayMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="cursor-pointer mt-2 rounded-xl bg-accent px-6 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
