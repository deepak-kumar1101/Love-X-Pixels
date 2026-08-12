/**
 * Generic app error type used across all services.
 */
export interface AppError {
  code: string;
  message: string;
  originalError?: unknown;
}

/**
 * Normalises any thrown value into a structured AppError.
 */
export function parseAppError(error: unknown): AppError {
  if (typeof error === "object" && error !== null) {
    const e = error as { code?: unknown; message?: string };
    if (e.code) {
      return {
        code: String(e.code),
        message: e.message || "An unexpected error occurred.",
        originalError: error,
      };
    }
  }

  if (error instanceof Error) {
    return { code: "UNKNOWN_ERROR", message: error.message, originalError: error };
  }

  return { code: "UNKNOWN_ERROR", message: "An unknown error occurred.", originalError: error };
}

/**
 * Exponential backoff retry utility for async operations.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 800,
): Promise<T> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxAttempts) {
        throw parseAppError(err);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error("Retry limit exceeded.");
}
