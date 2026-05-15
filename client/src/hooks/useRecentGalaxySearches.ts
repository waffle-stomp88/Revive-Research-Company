import { useCallback, useState } from "react";

const STORAGE_KEY = "galaxy-recent-searches";
const MAX_RECENT = 3;

function readRecent(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(0, MAX_RECENT);
    return [];
  } catch {
    return [];
  }
}

function writeRecent(ids: string[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage errors
  }
}

export function useRecentGalaxySearches(): [string[], (id: string) => void] {
  const [recent, setRecent] = useState<string[]>(() => readRecent());

  const addRecent = useCallback((id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_RECENT);
      writeRecent(next);
      return next;
    });
  }, []);

  return [recent, addRecent];
}
