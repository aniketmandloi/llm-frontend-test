/**
 * localStorage can be unavailable (private mode, blocked storage, SSR). Every
 * access goes through these helpers so callers never see an exception.
 */

export function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or storage blocked. The in-memory state still works.
  }
}
