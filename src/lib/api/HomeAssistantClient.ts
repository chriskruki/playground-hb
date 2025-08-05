import { BaseApiClient } from "./BaseApiClient";

/**
 * Home Assistant API Response Types
 */
export interface HassConfig {
  components: string[];
  config_dir: string;
  elevation: number;
  latitude: number;
  location_name: string;
  longitude: number;
  time_zone: string;
  unit_system: {
    length: string;
    mass: string;
    temperature: string;
    volume: string;
  };
  version: string;
  whitelist_external_dirs: string[];
}

export interface HassState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

export interface HassService {
  domain: string;
  services: string[];
}

export interface HassServiceCall {
  entity_id?: string;
  [key: string]: any;
}

export interface HassApiResponse {
  message: string;
}

/**
 * Home Assistant API Client
 * Interfaces with Home Assistant using the REST API
 */
export class HomeAssistantClient extends BaseApiClient {
  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_HASS_API_URL ||
      "http://homeassistant.local:8123",
    token: string = process.env.NEXT_PUBLIC_HASS_TOKEN || ""
  ) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    super(baseUrl, headers);

    if (!token) {
      console.warn(
        "Home Assistant token not provided. Some API calls may fail."
      );
    }
  }

  /**
   * Health check - ping the Home Assistant API
   */
  async ping(): Promise<boolean> {
    try {
      const response = await this.get<HassApiResponse>("/api/");
      return response.message === "API running.";
    } catch (error) {
      console.error("Home Assistant ping failed:", error);
      return false;
    }
  }

  /**
   * Get Home Assistant configuration
   */
  async getConfig(): Promise<HassConfig> {
    return this.get<HassConfig>("/api/config");
  }

  /**
   * Get all entity states
   */
  async getStates(): Promise<HassState[]> {
    return this.get<HassState[]>("/api/states");
  }

  /**
   * Get state of a specific entity
   */
  async getState(entityId: string): Promise<HassState> {
    return this.get<HassState>(`/api/states/${entityId}`);
  }

  /**
   * Set state of an entity
   */
  async setState(
    entityId: string,
    state: string,
    attributes?: Record<string, any>
  ): Promise<HassState> {
    return this.post<HassState>(`/api/states/${entityId}`, {
      state,
      attributes: attributes || {},
    });
  }

  /**
   * Get available services
   */
  async getServices(): Promise<HassService[]> {
    return this.get<HassService[]>("/api/services");
  }

  /**
   * Call a service
   */
  async callService(
    domain: string,
    service: string,
    serviceData?: HassServiceCall
  ): Promise<HassState[]> {
    return this.post<HassState[]>(
      `/api/services/${domain}/${service}`,
      serviceData
    );
  }

  /**
   * Turn on an entity (light, switch, etc.)
   */
  async turnOn(
    entityId: string,
    serviceData?: Record<string, any>
  ): Promise<HassState[]> {
    const domain = entityId.split(".")[0];
    return this.callService(domain, "turn_on", {
      entity_id: entityId,
      ...serviceData,
    });
  }

  /**
   * Turn off an entity (light, switch, etc.)
   */
  async turnOff(entityId: string): Promise<HassState[]> {
    const domain = entityId.split(".")[0];
    return this.callService(domain, "turn_off", { entity_id: entityId });
  }

  /**
   * Toggle an entity (light, switch, etc.)
   */
  async toggle(entityId: string): Promise<HassState[]> {
    const domain = entityId.split(".")[0];
    return this.callService(domain, "toggle", { entity_id: entityId });
  }

  /**
   * Set light brightness (for light entities)
   */
  async setLightBrightness(
    entityId: string,
    brightness: number
  ): Promise<HassState[]> {
    return this.callService("light", "turn_on", {
      entity_id: entityId,
      brightness: Math.max(0, Math.min(255, brightness)),
    });
  }

  /**
   * Set light color (for light entities)
   */
  async setLightColor(
    entityId: string,
    r: number,
    g: number,
    b: number
  ): Promise<HassState[]> {
    return this.callService("light", "turn_on", {
      entity_id: entityId,
      rgb_color: [r, g, b],
    });
  }

  /**
   * Get entities by domain (e.g., 'light', 'switch', 'sensor')
   */
  async getEntitiesByDomain(domain: string): Promise<HassState[]> {
    const states = await this.getStates();
    return states.filter((state) => state.entity_id.startsWith(`${domain}.`));
  }
}
