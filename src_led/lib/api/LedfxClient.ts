import { BaseApiClient } from "./BaseApiClient";

/**
 * LEDfx API Response Types
 */
export interface LedfxInfo {
  url: string;
  name: string;
  version: string;
}

export interface LedfxConfig {
  // LEDfx configuration structure - can be expanded based on actual API response
  [key: string]: any;
}

export interface LedfxDevice {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  active: boolean;
}

export interface LedfxEffect {
  id: string;
  name: string;
  config: Record<string, any>;
  active: boolean;
}

export interface LedfxDeviceSchema {
  // Device schema structure - can be expanded
  [key: string]: any;
}

export interface LedfxEffectSchema {
  // Effect schema structure - can be expanded
  [key: string]: any;
}

/**
 * LEDfx API Client
 * Interfaces with LEDfx using the REST API
 */
export class LedfxClient extends BaseApiClient {
  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_LEDFX_API_URL ||
      "http://ledfx.local:8888"
  ) {
    super(baseUrl);
  }

  /**
   * Health check - ping the LEDfx API
   */
  async ping(): Promise<boolean> {
    try {
      await this.get<LedfxInfo>("/api/info");
      return true;
    } catch (error) {
      console.error("LEDfx ping failed:", error);
      return false;
    }
  }

  /**
   * Get basic information about the LEDfx instance
   */
  async getInfo(): Promise<LedfxInfo> {
    return this.get<LedfxInfo>("/api/info");
  }

  /**
   * Get current configuration
   */
  async getConfig(): Promise<LedfxConfig> {
    return this.get<LedfxConfig>("/api/config");
  }

  /**
   * Get error logs for the current session
   */
  async getLogs(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/log`);
    return response.text();
  }

  /**
   * Get all device schemas
   */
  async getDeviceSchemas(): Promise<LedfxDeviceSchema> {
    return this.get<LedfxDeviceSchema>("/api/schema/devices");
  }

  /**
   * Get all effect schemas
   */
  async getEffectSchemas(): Promise<LedfxEffectSchema> {
    return this.get<LedfxEffectSchema>("/api/schema/effects");
  }

  /**
   * Get all registered devices
   */
  async getDevices(): Promise<Record<string, LedfxDevice>> {
    return this.get<Record<string, LedfxDevice>>("/api/devices");
  }

  /**
   * Get a specific device by ID
   */
  async getDevice(deviceId: string): Promise<LedfxDevice> {
    return this.get<LedfxDevice>(`/api/devices/${deviceId}`);
  }

  /**
   * Add a new device
   */
  async addDevice(deviceConfig: Partial<LedfxDevice>): Promise<LedfxDevice> {
    return this.post<LedfxDevice>("/api/devices", deviceConfig);
  }

  /**
   * Update an existing device
   */
  async updateDevice(
    deviceId: string,
    deviceConfig: Partial<LedfxDevice>
  ): Promise<LedfxDevice> {
    return this.put<LedfxDevice>(`/api/devices/${deviceId}`, deviceConfig);
  }

  /**
   * Delete a device
   */
  async deleteDevice(deviceId: string): Promise<void> {
    await this.delete(`/api/devices/${deviceId}`);
  }

  /**
   * Get all effects
   */
  async getEffects(): Promise<Record<string, LedfxEffect>> {
    return this.get<Record<string, LedfxEffect>>("/api/effects");
  }

  /**
   * Get a specific effect by ID
   */
  async getEffect(effectId: string): Promise<LedfxEffect> {
    return this.get<LedfxEffect>(`/api/effects/${effectId}`);
  }

  /**
   * Create a new effect
   */
  async createEffect(effectConfig: Partial<LedfxEffect>): Promise<LedfxEffect> {
    return this.post<LedfxEffect>("/api/effects", effectConfig);
  }

  /**
   * Update an existing effect
   */
  async updateEffect(
    effectId: string,
    effectConfig: Partial<LedfxEffect>
  ): Promise<LedfxEffect> {
    return this.put<LedfxEffect>(`/api/effects/${effectId}`, effectConfig);
  }

  /**
   * Delete an effect
   */
  async deleteEffect(effectId: string): Promise<void> {
    await this.delete(`/api/effects/${effectId}`);
  }

  /**
   * Get status for basic connectivity testing
   */
  async getStatus(): Promise<LedfxInfo> {
    return this.getInfo();
  }
}
