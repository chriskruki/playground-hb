/**
 * Global cache for WLED effects and palettes
 * Prevents repeated API calls for data that doesn't change frequently
 */

interface WledEffectsPalettes {
  effects: string[];
  palettes: string[];
}

interface CacheEntry {
  data: WledEffectsPalettes;
  timestamp: number;
  ip: string;
}

class WledCache {
  private static instance: WledCache;
  private cache: CacheEntry | null = null;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  private constructor() {}

  static getInstance(): WledCache {
    if (!WledCache.instance) {
      WledCache.instance = new WledCache();
    }
    return WledCache.instance;
  }

  /**
   * Get cached effects and palettes
   */
  getEffectsPalettes(): WledEffectsPalettes | null {
    if (!this.cache) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - this.cache.timestamp > this.CACHE_DURATION;

    if (isExpired) {
      console.log("WLED cache expired, clearing...");
      this.cache = null;
      return null;
    }

    console.log("Using cached effects and palettes from", this.cache.ip);
    return this.cache.data;
  }

  /**
   * Cache effects and palettes
   */
  setEffectsPalettes(data: WledEffectsPalettes, ip: string): void {
    this.cache = {
      data,
      timestamp: Date.now(),
      ip,
    };
    console.log("Cached effects and palettes from", ip, {
      effects: data.effects.length,
      palettes: data.palettes.length,
    });
  }

  /**
   * Check if we have valid cached data
   */
  hasValidCache(): boolean {
    return this.getEffectsPalettes() !== null;
  }

  /**
   * Clear the cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache = null;
    console.log("WLED cache cleared");
  }

  /**
   * Get cache info for debugging
   */
  getCacheInfo() {
    if (!this.cache) {
      return { cached: false };
    }

    const age = Date.now() - this.cache.timestamp;
    const ageMinutes = Math.round(age / 60000);

    return {
      cached: true,
      ip: this.cache.ip,
      ageMinutes,
      effects: this.cache.data.effects.length,
      palettes: this.cache.data.palettes.length,
    };
  }
}

export const wledCache = WledCache.getInstance();
export type { WledEffectsPalettes };
