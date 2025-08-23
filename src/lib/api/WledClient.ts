import { BaseApiClient } from "./BaseApiClient";
import { deviceConnectionManager } from "./DeviceConnectionManager";

/**
 * WLED API Response Types
 */
export interface WledInfo {
  ver: string;
  vid: number;
  leds: {
    count: number;
    rgbw: boolean;
    pin: number[];
    pwr: number;
    maxpwr: number;
    maxseg: number;
  };
  name: string;
  udpport: number;
  live: boolean;
  fxcount: number;
  palcount: number;
  arch: string;
  core: string;
  freeheap: number;
  uptime: number;
  brand: string;
  product: string;
  mac: string;
}

export interface WledState {
  on: boolean;
  bri: number;
  transition: number;
  ps: number;
  pl: number;
  seg: WledSegment[];
}

export interface WledSegment {
  id: number;
  start: number;
  stop: number;
  len: number;
  col: number[][];
  fx: number;
  sx: number;
  ix: number;
  pal: number;
  sel: boolean;
  rev: boolean;
  on: boolean;
  bri: number;
}

export interface WledFullStatus {
  state: WledState;
  info: WledInfo;
  effects: string[];
  palettes: string[];
}

/**
 * WLED API Client
 * Interfaces with WLED devices using the JSON API with connection optimization
 */
export class WledClient extends BaseApiClient {
  private readonly ip: string;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_WLED_API_URL ||
      "http://wled.local"
  ) {
    super(baseUrl);
    // Extract IP from baseUrl for connection management
    try {
      const url = new URL(baseUrl);
      this.ip = url.hostname;
    } catch {
      this.ip = baseUrl.replace(/^https?:\/\//, "").split(":")[0];
    }
  }

  /**
   * Override request method to use device connection manager
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return deviceConnectionManager.queueRequest<T>(this.ip, url, {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    });
  }

  /**
   * Health check - ping the WLED device with retry logic
   */
  async ping(): Promise<boolean> {
    const maxRetries = 2;
    const retryDelay = 1000; // 1 second between retries

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.get<WledInfo>("/json/info");
        return true;
      } catch (error) {
        const isTimeout =
          error instanceof Error && error.message.includes("timeout");
        const isLastAttempt = attempt === maxRetries;

        if (isTimeout && !isLastAttempt) {
          console.warn(`WLED ping attempt ${attempt} timed out, retrying...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }

        if (isLastAttempt) {
          console.error(
            "WLED ping failed after",
            maxRetries,
            "attempts:",
            error
          );
        }
        return false;
      }
    }

    return false;
  }

  /**
   * Get device information
   */
  async getInfo(): Promise<WledInfo> {
    return this.get<WledInfo>("/json/info");
  }

  /**
   * Get current state
   */
  async getState(): Promise<WledState> {
    return this.get<WledState>("/json/state");
  }

  /**
   * Get full status (state + info + effects + palettes)
   */
  async getStatus(): Promise<WledFullStatus> {
    return this.get<WledFullStatus>("/json");
  }

  /**
   * Set new state
   */
  async setState(state: Partial<WledState>): Promise<WledState> {
    return this.post<WledState>("/json/state", state);
  }

  /**
   * Turn lights on/off
   */
  async setOn(on: boolean): Promise<WledState> {
    return this.setState({ on });
  }

  /**
   * Set brightness (0-255)
   */
  async setBrightness(brightness: number): Promise<WledState> {
    return this.setState({ bri: Math.max(0, Math.min(255, brightness)) });
  }

  /**
   * Set effect by ID
   */
  async setEffect(effectId: number, segmentId: number = 0): Promise<WledState> {
    const seg = [{ id: segmentId, fx: effectId }];
    return this.setState({ seg });
  }

  /**
   * Set primary color for a segment
   */
  async setColor(
    r: number,
    g: number,
    b: number,
    segmentId: number = 0
  ): Promise<WledState> {
    const seg = [{ id: segmentId, col: [[r, g, b]] }];
    return this.setState({ seg });
  }

  /**
   * Get available effects
   */
  async getEffects(): Promise<string[]> {
    return this.get<string[]>("/json/eff");
  }

  /**
   * Get available palettes
   */
  async getPalettes(): Promise<string[]> {
    return this.get<string[]>("/json/pal");
  }
}
