/**
 * API Clients for Minigolf Dashboard
 *
 * This module provides wrapper classes for integrating with:
 * - WLED (LED strip controllers)
 * - Home Assistant (home automation hub)
 * - LEDfx (real-time LED effects engine)
 */

export { BaseApiClient } from "./BaseApiClient";
export { WledClient } from "./WledClient";
export { HomeAssistantClient } from "./HomeAssistantClient";
export { LedfxClient } from "./LedfxClient";

// Re-export types for convenience
export type {
  WledInfo,
  WledState,
  WledSegment,
  WledFullStatus,
} from "./WledClient";

export type {
  HassConfig,
  HassState,
  HassService,
  HassServiceCall,
  HassApiResponse,
} from "./HomeAssistantClient";

export type {
  LedfxInfo,
  LedfxConfig,
  LedfxDevice,
  LedfxEffect,
  LedfxDeviceSchema,
  LedfxEffectSchema,
} from "./LedfxClient";

/**
 * Factory function to create API clients with default configuration
 */
export const createApiClients = () => {
  return {
    wled: new WledClient(),
    homeAssistant: new HomeAssistantClient(),
    ledfx: new LedfxClient(),
  };
};

/**
 * Test connectivity to all API endpoints
 */
export const testAllConnections = async () => {
  const clients = createApiClients();

  const results = await Promise.allSettled([
    clients.wled.ping().then((success) => ({ service: "WLED", success })),
    clients.homeAssistant
      .ping()
      .then((success) => ({ service: "Home Assistant", success })),
    clients.ledfx.ping().then((success) => ({ service: "LEDfx", success })),
  ]);

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      const services = ["WLED", "Home Assistant", "LEDfx"];
      return { service: services[index], success: false, error: result.reason };
    }
  });
};
