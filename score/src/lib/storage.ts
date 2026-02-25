const STORAGE_KEY = "playground-hb-game";

export interface PersistedGameState {
  phase: "landing" | "setup" | "scoring" | "results";
  players: { id: string; name: string }[];
  currentHole: number;
  scores: Record<string, number[]>;
}

export function saveGameState(state: PersistedGameState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage may be unavailable (private browsing quota exceeded, etc.)
  }
}

export function loadGameState(): PersistedGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedGameState;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
