/**
 * Dashboard Links Configuration
 *
 * External links (starting with http) will open in new tabs.
 * Internal links will use Next.js routing.
 *
 * API Configuration:
 * To use the API clients, copy .env.example to .env.local and update with your actual values:
 * - NEXT_PUBLIC_WLED_API_URL=http://your-wled-device.local
 * - NEXT_PUBLIC_HASS_API_URL=http://your-homeassistant.local:8123
 * - NEXT_PUBLIC_HASS_TOKEN=your_long_lived_access_token
 * - NEXT_PUBLIC_LEDFX_API_URL=http://your-ledfx-server.local:8888
 */

export const DASHBOARD_LINKS = [
  { name: "Home Assistant", url: "http://homeassistant.local:8123" },
  { name: "WLED - Hole 1", url: "http://wled-hole1.local" },
  { name: "WLED - Hole 2", url: "/lighting/wled/hole-2" },
  { name: "LEDfx Presets", url: "/ledfx" },
  { name: "HyperHDR Sync", url: "/hyperhdr" },
  { name: "Diagnostics", url: "/diagnostics" },
];
