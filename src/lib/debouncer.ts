/**
 * Utility function to debounce fast inputs like search bars
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait = 300,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
