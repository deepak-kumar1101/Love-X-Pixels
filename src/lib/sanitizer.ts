/**
 * Sanitizer & Rate-Limiter Utility
 */

export function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

const rateLimitMap = new Map<string, number>();

export function checkRateLimit(actionKey: string, cooldownMs = 3000): boolean {
  const now = Date.now();
  const lastExec = rateLimitMap.get(actionKey) || 0;
  if (now - lastExec < cooldownMs) {
    return false; // Rate limited
  }
  rateLimitMap.set(actionKey, now);
  return true; // Allowed
}
