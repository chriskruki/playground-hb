/**
 * localStorage utilities for mini golf score app
 * Handles game state and player image persistence
 */

export interface Player {
  id: string;
  name: string;
  scores: number[];
}

export interface GameState {
  players: Player[];
  currentHole: number;
  phase: 'setup' | 'scoring' | 'leaderboard';
  playerImages: Record<string, string>; // base64 images keyed by player id
}

const STORAGE_KEY = 'mini-golf-game-state';

/**
 * Get the current game state from localStorage
 * @returns GameState or null if not found
 */
export function getGameState(): GameState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as GameState;
  } catch (error) {
    console.error('Error reading game state from localStorage:', error);
    return null;
  }
}

/**
 * Save game state to localStorage
 * @param state - GameState to save
 */
export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving game state to localStorage:', error);
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Consider clearing old data.');
    }
  }
}

/**
 * Clear game state from localStorage
 */
export function clearGameState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    // Also clear individual player images
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('player-image-')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing game state from localStorage:', error);
  }
}

/**
 * Save player image to localStorage
 * @param playerId - Player ID
 * @param imageData - Base64 image data
 */
export function savePlayerImage(playerId: string, imageData: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Compress image if too large (localStorage limit is typically 5-10MB)
    const compressed = compressImageIfNeeded(imageData);
    localStorage.setItem(`player-image-${playerId}`, compressed);
  } catch (error) {
    console.error('Error saving player image:', error);
  }
}

/**
 * Get player image from localStorage
 * @param playerId - Player ID
 * @returns Base64 image data or null
 */
export function getPlayerImage(playerId: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(`player-image-${playerId}`);
  } catch (error) {
    console.error('Error reading player image:', error);
    return null;
  }
}

/**
 * Compress image if it exceeds size limits
 * Note: This is a synchronous wrapper - actual compression happens asynchronously
 * For now, we'll just check size and return original if reasonable
 * @param imageData - Base64 image data
 * @returns Base64 image data (compressed if needed)
 */
function compressImageIfNeeded(imageData: string): string {
  // Check size (rough estimate: base64 is ~33% larger than binary)
  const sizeInBytes = (imageData.length * 3) / 4;
  const maxSize = 500 * 1024; // 500KB limit per image

  // If within limit, return as-is
  if (sizeInBytes <= maxSize) {
    return imageData;
  }

  // For now, return original and let browser handle it
  // In a production app, you'd want to implement proper async compression
  // or use a library like browser-image-compression
  return imageData;
}

