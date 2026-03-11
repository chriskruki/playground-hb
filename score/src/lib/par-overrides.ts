import type { HoleData } from "@/lib/holes";

const STORAGE_KEY = "playground-hb-par-overrides";

export interface ParOverrides {
  [holeNumber: number]: number;
}

export function loadParOverrides(): ParOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ParOverrides;
  } catch {
    return {};
  }
}

export function saveParOverrides(overrides: ParOverrides): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage may be unavailable (private browsing quota exceeded, etc.)
  }
}

export function applyParOverrides(holes: HoleData[]): HoleData[] {
  const overrides = loadParOverrides();
  return holes.map((hole) => ({
    ...hole,
    par: overrides[hole.number] ?? hole.par,
  }));
}
