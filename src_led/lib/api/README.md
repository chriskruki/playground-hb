# Minigolf Dashboard API Wrappers

This directory contains TypeScript API wrapper classes for integrating with external systems in the minigolf dashboard.

## Overview

The dashboard integrates with three main systems:

- **WLED**: LED strip controllers for hole lighting
- **Home Assistant**: Home automation hub for centralized control
- **LEDfx**: Real-time LED effects engine for dynamic lighting

## Setup

### 1. Environment Configuration

Copy the environment template and configure your API endpoints:

```bash
# Create environment file (not tracked in git)
# You'll need to do this manually as .env files are in .gitignore
```

Create a `.env.local` file in the project root with your actual API endpoints:

```env
# WLED API Configuration
NEXT_PUBLIC_WLED_API_URL=http://your-wled-device.local

# Home Assistant API Configuration
NEXT_PUBLIC_HASS_API_URL=http://your-homeassistant.local:8123
NEXT_PUBLIC_HASS_TOKEN=your_long_lived_access_token_here

# LEDfx API Configuration
NEXT_PUBLIC_LEDFX_API_URL=http://your-ledfx-server.local:8888
```

### 2. Getting Home Assistant Token

1. Go to your Home Assistant web interface
2. Click on your profile (bottom left)
3. Scroll down to "Long-Lived Access Tokens"
4. Click "Create Token"
5. Give it a name (e.g., "Minigolf Dashboard")
6. Copy the generated token to your `.env.local` file

## Usage

### Basic Example

```typescript
import { createApiClients } from "@/lib/api";

const clients = createApiClients();

// Test connectivity
const wledConnected = await clients.wled.ping();
const hassConnected = await clients.homeAssistant.ping();
const ledfxConnected = await clients.ledfx.ping();

// Get device information
const wledInfo = await clients.wled.getInfo();
const hassConfig = await clients.homeAssistant.getConfig();
const ledfxInfo = await clients.ledfx.getInfo();
```

### WLED Examples

```typescript
const wled = new WledClient();

// Basic control
await wled.setOn(true); // Turn on
await wled.setBrightness(128); // Set 50% brightness
await wled.setColor(255, 0, 0); // Set red color
await wled.setEffect(1); // Set effect by ID

// Get information
const state = await wled.getState(); // Current state
const info = await wled.getInfo(); // Device info
const effects = await wled.getEffects(); // Available effects
```

### Home Assistant Examples

```typescript
const hass = new HomeAssistantClient();

// Entity control
await hass.turnOn("light.minigolf_hole_1");
await hass.turnOff("switch.hole_2_music");
await hass.toggle("light.entrance_sign");

// Light control with parameters
await hass.setLightBrightness("light.hole_1", 200);
await hass.setLightColor("light.hole_1", 255, 0, 0);

// Get entity states
const lightState = await hass.getState("light.hole_1");
const allLights = await hass.getEntitiesByDomain("light");
```

### LEDfx Examples

```typescript
const ledfx = new LedfxClient();

// Get system information
const info = await ledfx.getInfo();
const devices = await ledfx.getDevices();
const effects = await ledfx.getEffects();

// Device management
const newDevice = await ledfx.addDevice({
  name: "Hole 1 Strip",
  type: "wled",
  config: { ip_address: "192.168.1.100" },
});
```

## API Classes

### BaseApiClient

Base class providing common HTTP methods and error handling:

- `get<T>(endpoint)`: GET request
- `post<T>(endpoint, data)`: POST request
- `put<T>(endpoint, data)`: PUT request
- `delete<T>(endpoint)`: DELETE request
- `ping()`: Health check (abstract method)

### WledClient

WLED JSON API wrapper:

- Device information and status
- Brightness and color control
- Effect and palette management
- Segment control for multi-zone strips

### HomeAssistantClient

Home Assistant REST API wrapper:

- Entity state management
- Service calls (turn on/off, toggle)
- Light control with brightness/color
- Configuration and system info

### LedfxClient

LEDfx REST API wrapper:

- Device and effect management
- Real-time LED control
- Schema information for dynamic UIs
- Configuration management

## Testing

Visit `/diagnostics` in your dashboard to test API connectivity and try basic operations.

## Error Handling

All API clients include error handling:

- Network errors are caught and logged
- HTTP errors include status codes
- Invalid responses are handled gracefully
- Ping methods return boolean success status

## TypeScript Support

All classes are fully typed with TypeScript interfaces for:

- API request/response structures
- Configuration objects
- Entity states and attributes
- Error handling
