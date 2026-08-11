/**
 * Centralized Production Error & Event Logger
 */

export class AppLogger {
  static info(message: string, context?: Record<string, unknown>): void {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, context || "");
    }
  }

  static warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, context || "");
  }

  static error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error || "");
  }
}
