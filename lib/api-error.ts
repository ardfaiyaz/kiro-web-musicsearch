export type ApiErrorType =
  | "network"
  | "rate_limit"
  | "timeout"
  | "server"
  | "not_found"
  | "unknown";

export interface ApiError {
  type: ApiErrorType;
  message: string;
  status?: number;
  retryable: boolean;
}

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}

export function classifyError(error: unknown, status?: number): ApiError {
  if (status === 429) {
    return {
      type: "rate_limit",
      message:
        "Too many requests. Please wait a moment and try again.",
      status: 429,
      retryable: true,
    };
  }

  if (status === 404) {
    return {
      type: "not_found",
      message: "The requested resource was not found.",
      status: 404,
      retryable: false,
    };
  }

  if (status && status >= 500) {
    return {
      type: "server",
      message: "The server encountered an error. Please try again later.",
      status,
      retryable: true,
    };
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      type: "network",
      message:
        "Unable to connect. Please check your internet connection and try again.",
      retryable: true,
    };
  }

  if (
    error instanceof DOMException &&
    error.name === "AbortError"
  ) {
    return {
      type: "timeout",
      message: "The request timed out. Please try again.",
      retryable: true,
    };
  }

  if (error instanceof Error && error.message.toLowerCase().includes("timeout")) {
    return {
      type: "timeout",
      message: "The request timed out. Please try again.",
      retryable: true,
    };
  }

  if (error instanceof Error && (
    error.message.toLowerCase().includes("network") ||
    error.message.toLowerCase().includes("failed to fetch")
  )) {
    return {
      type: "network",
      message:
        "Unable to connect. Please check your internet connection and try again.",
      retryable: true,
    };
  }

  return {
    type: "unknown",
    message: "An unexpected error occurred. Please try again.",
    retryable: true,
  };
}
