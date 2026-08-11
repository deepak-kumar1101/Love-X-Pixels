export interface AppError {
  code: string;
  message: string;
  originalError?: unknown;
}

export function parseFirebaseError(error: unknown): AppError {
  if (typeof error === "object" && error !== null && "code" in error) {
    const firebaseCode = String((error as { code: unknown }).code);
    switch (firebaseCode) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return {
          code: "AUTH_INVALID_CREDENTIALS",
          message: "Invalid email or password. Please check your credentials and try again.",
          originalError: error,
        };
      case "auth/email-already-in-use":
        return {
          code: "AUTH_EMAIL_IN_USE",
          message: "An account with this email address already exists.",
          originalError: error,
        };
      case "auth/network-request-failed":
      case "unavailable":
        return {
          code: "NETWORK_ERROR",
          message: "Network request failed. Please check your connection.",
          originalError: error,
        };
      case "permission-denied":
        return {
          code: "PERMISSION_DENIED",
          message: "Permission denied. You do not have sufficient access rights for this action.",
          originalError: error,
        };
      default:
        return {
          code: firebaseCode,
          message: (error as { message?: string }).message || "An unexpected error occurred.",
          originalError: error,
        };
    }
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      originalError: error,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unknown error occurred.",
    originalError: error,
  };
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
        throw parseFirebaseError(err);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error("Retry limit exceeded.");
}
