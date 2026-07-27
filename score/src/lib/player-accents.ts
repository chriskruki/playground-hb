/** Per-player accent dots — playful, brand-adjacent, cycled by player index. */
export const PLAYER_ACCENTS = [
  "#1f4f38", // pg green
  "#e9b949", // mustard
  "#ec3c28", // action red
  "#2f6fb0", // sky
  "#e07a2c", // orange
  "#c14b8a", // berry
  "#4c9f70", // fairway
  "#7a5cc0", // grape
] as const;

export function playerAccent(index: number): string {
  return PLAYER_ACCENTS[index % PLAYER_ACCENTS.length];
}
