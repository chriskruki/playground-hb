"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Power, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLoggedApi } from "@/hooks/useLoggedApi";
import { deviceConnectionManager } from "@/lib/api/DeviceConnectionManager";
import { wledCache, type WledEffectsPalettes } from "@/lib/cache/WledCache";

interface WledDevice {
  id: string;
  name: string;
  ip: string;
  status?: "online" | "offline" | "checking";
}

interface WledPreset {
  [key: string]: {
    n: string; // name
    win?: string; // window (segment info)
  };
}

interface WledState {
  on: boolean;
  bri: number;
  ps?: number; // current preset
}

// WledEffectsPalettes is now imported from WledCache

interface DeviceControlProps {
  device: WledDevice;
  onDeviceUpdate: (device: WledDevice) => void;
  isGlobalLoading?: boolean;
}

function DeviceControl({
  device,
  onDeviceUpdate,
  isGlobalLoading = false,
}: DeviceControlProps) {
  const [state, setState] = useState<WledState>({ on: false, bri: 128 });
  const [presets, setPresets] = useState<WledPreset>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { makeRequest } = useLoggedApi();

  const loadDeviceData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load current state and presets in parallel
      const [stateResponse, presetsResponse] = await Promise.all([
        fetch(`/api/wled/${device.ip}?action=state`),
        fetch(`/api/wled/${device.ip}?action=presets`),
      ]);

      if (stateResponse.ok) {
        const stateData = await stateResponse.json();
        setState(stateData);
      }

      if (presetsResponse.ok) {
        const presetsData = await presetsResponse.json();
        setPresets(presetsData);
      }
    } catch (error) {
      console.error("Failed to load device data:", error);
      setError("Failed to load device data");
    } finally {
      setLoading(false);
    }
  }, [device.ip]);

  useEffect(() => {
    if (device.status === "online") {
      loadDeviceData();
    }
  }, [device.status, loadDeviceData]);

  const controlDevice = async (
    action: string,
    data: Record<string, unknown>
  ) => {
    const getDescription = () => {
      switch (action) {
        case "setOn":
          return `Turn ${data.on ? "on" : "off"}`;
        case "setBrightness":
          return `Set brightness to ${Math.round(
            ((data.brightness as number) / 255) * 100
          )}%`;
        case "setPreset":
          return `Apply preset ${data.presetId}`;
        default:
          return `Execute ${action}`;
      }
    };

    try {
      await makeRequest(
        async () => {
          const response = await fetch(`/api/wled/${device.ip}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, ...data }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const newState = await response.json();
          setState((prev) => ({ ...prev, ...newState }));
          return newState;
        },
        {
          device: device.name,
          command: action,
          description: getDescription(),
        }
      );
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    }
  };

  const togglePower = () => {
    controlDevice("setOn", { on: !state.on });
  };

  const setBrightness = (value: number[]) => {
    const brightnessPercent = value[0];
    const brightness = Math.round((brightnessPercent / 100) * 255);
    setState((prev) => ({ ...prev, bri: brightness }));
    controlDevice("setBrightness", { brightness });
  };

  const setPreset = (presetId: string) => {
    controlDevice("setPreset", { presetId: parseInt(presetId) });
  };

  const checkStatus = async () => {
    onDeviceUpdate({ ...device, status: "checking" });

    try {
      await makeRequest(
        async () => {
          const response = await fetch("/api/wled/ping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: device.ip }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          const status: "online" | "offline" = result.success
            ? "online"
            : "offline";
          onDeviceUpdate({ ...device, status });

          if (status === "online") {
            loadDeviceData();
          }

          return result;
        },
        {
          device: device.name,
          command: "ping",
          description: "Check device connectivity",
        }
      );
    } catch (error) {
      console.error("Status check failed:", error);
      onDeviceUpdate({ ...device, status: "offline" });
    }
  };

  if (device.status !== "online") {
    return (
      <Card className="bg-slate-100">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              {device.status === "offline" ? (
                <WifiOff className="w-5 h-5 text-red-500" />
              ) : (
                <Wifi className="w-5 h-5 text-yellow-500" />
              )}
              {device.name}
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={checkStatus}
              disabled={device.status === "checking"}
            >
              {device.status === "checking" ? "Checking..." : "Check Status"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-600">
            <div className="font-mono text-sm mb-2">{device.ip}</div>
            <div>
              {device.status === "offline"
                ? "Device offline"
                : "Checking connection..."}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-green-500" />
            {device.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-600">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-red-500" />
            {device.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600">
            <div>{error}</div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadDeviceData}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isGlobalLoading ? "opacity-75" : ""}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-green-500" />
            {device.name}
            {isGlobalLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            )}
          </CardTitle>
          <div className="font-mono text-sm text-gray-600">{device.ip}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Power and Brightness Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant={state.on ? "default" : "outline"}
            size="sm"
            onClick={togglePower}
            className="flex items-center gap-2"
            disabled={isGlobalLoading}
          >
            <Power className="w-4 h-4" />
            {state.on ? "On" : "Off"}
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">Brightness</span>
              <span className="text-sm text-gray-600">
                {Math.round((state.bri / 255) * 100)}%
              </span>
            </div>
            <Slider
              value={[Math.round((state.bri / 255) * 100)]}
              onValueChange={setBrightness}
              max={100}
              min={0}
              step={1}
              className="w-full"
              disabled={!state.on || isGlobalLoading}
            />
          </div>
        </div>

        {/* Presets */}
        {Object.keys(presets).length > 0 ? (
          <div>
            <h4 className="text-sm font-medium mb-2">
              Presets ({Object.keys(presets).length})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(presets)
                .filter(
                  ([id, preset]) =>
                    id !== "0" && preset && typeof preset === "object"
                ) // Filter out empty slot 0
                .map(([id, preset]) => (
                  <Button
                    key={id}
                    variant={state.ps === parseInt(id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreset(id)}
                    className="text-xs"
                    disabled={!state.on || isGlobalLoading}
                  >
                    {preset.n || `Preset ${id}`}
                  </Button>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 mt-2">
            No presets found. Create presets in your WLED device first.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface WledControlProps {
  devices: WledDevice[];
  onDevicesUpdate: (devices: WledDevice[]) => void;
}

export default function WledControl({
  devices,
  onDevicesUpdate,
}: WledControlProps) {
  const [globalBrightness, setGlobalBrightnessState] = useState(50); // 0-100 scale
  const [globalPower, setGlobalPower] = useState(false);
  const [effectsPalettes, setEffectsPalettes] = useState<WledEffectsPalettes>({
    effects: [],
    palettes: [],
  });
  const [selectedEffect, setSelectedEffect] = useState<string>("");
  const [selectedPalette, setSelectedPalette] = useState<string>("");
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [effectsPalettesLoaded, setEffectsPalettesLoaded] = useState(false);
  const { makeGlobalRequest } = useLoggedApi();

  const onlineDevices = devices.filter((d) => d.status === "online");

  const loadEffectsPalettes = useCallback(
    async (ip: string) => {
      // Check if we already have cached data
      const cachedData = wledCache.getEffectsPalettes();
      if (cachedData) {
        setEffectsPalettes(cachedData);
        setEffectsPalettesLoaded(true);
        return;
      }

      // Only load if we haven't loaded them yet
      if (effectsPalettesLoaded) {
        return;
      }

      try {
        console.log("Loading effects and palettes from", ip, "- one time only");
        const [effectsResponse, palettesResponse] = await Promise.all([
          fetch(`/api/wled/${ip}?action=effects`),
          fetch(`/api/wled/${ip}?action=palettes`),
        ]);

        if (effectsResponse.ok && palettesResponse.ok) {
          const effectsData = await effectsResponse.json();
          const palettesData = await palettesResponse.json();

          const data: WledEffectsPalettes = {
            effects: effectsData.effects || [],
            palettes: palettesData.palettes || [],
          };

          // Cache the data globally
          wledCache.setEffectsPalettes(data, ip);

          setEffectsPalettes(data);
          setEffectsPalettesLoaded(true); // Mark as loaded
          console.log("Effects and palettes loaded and cached successfully:", {
            effects: data.effects.length,
            palettes: data.palettes.length,
          });
        }
      } catch (error) {
        console.error("Failed to load effects/palettes:", error);
      }
    },
    [effectsPalettesLoaded]
  );

  // Load effects and palettes from the first online device - only once
  useEffect(() => {
    if (onlineDevices.length > 0 && !effectsPalettesLoaded) {
      loadEffectsPalettes(onlineDevices[0].ip);
    }
  }, [onlineDevices, loadEffectsPalettes, effectsPalettesLoaded]);

  const handleDeviceUpdate = (updatedDevice: WledDevice) => {
    const updatedDevices = devices.map((d) =>
      d.id === updatedDevice.id ? updatedDevice : d
    );
    onDevicesUpdate(updatedDevices);
  };

  const controlAllDevices = async (
    action: string,
    data: Record<string, unknown>
  ) => {
    const getDescription = () => {
      switch (action) {
        case "setOn":
          return `Turn all devices ${data.on ? "on" : "off"}`;
        case "setBrightness":
          return `Set all devices brightness to ${Math.round(
            ((data.brightness as number) / 255) * 100
          )}%`;
        case "setEffect":
          return `Apply effect "${selectedEffect}" to all devices`;
        case "setState":
          return `Apply palette "${selectedPalette}" to all devices`;
        default:
          return `Execute ${action} on all devices`;
      }
    };

    setIsGlobalLoading(true);
    try {
      await makeGlobalRequest(
        async () => {
          // Use device connection manager for optimized requests
          const promises = onlineDevices.map(async (device) => {
            return deviceConnectionManager.queueRequest(
              device.ip,
              `/api/wled/${device.ip}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...data }),
              }
            );
          });

          const results = await Promise.all(promises);
          return results;
        },
        {
          command: action,
          description: getDescription(),
        }
      );
    } catch (error) {
      console.error("Failed to control all devices:", error);
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const toggleGlobalPower = () => {
    const newPowerState = !globalPower;
    setGlobalPower(newPowerState);
    controlAllDevices("setOn", { on: newPowerState });
  };

  const setGlobalBrightness = (value: number[]) => {
    const brightnessPercent = value[0];
    const brightness = Math.round((brightnessPercent / 100) * 255);
    setGlobalBrightnessState(brightnessPercent);
    controlAllDevices("setBrightness", { brightness });
  };

  const applyGlobalEffect = () => {
    if (selectedEffect) {
      const effectId = effectsPalettes.effects.indexOf(selectedEffect);
      controlAllDevices("setEffect", { effectId, segmentId: 0 });
    }
  };

  const applyGlobalPalette = () => {
    if (selectedPalette) {
      const paletteId = effectsPalettes.palettes.indexOf(selectedPalette);
      // Set palette via segment configuration
      controlAllDevices("setState", {
        seg: [{ id: 0, pal: paletteId }],
      });
    }
  };

  if (devices.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">No WLED devices configured</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Controls */}
      {onlineDevices.length > 0 && (
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle>Global Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Power and Brightness */}
            <div className="flex items-center gap-4">
              <Button
                variant={globalPower ? "default" : "outline"}
                onClick={toggleGlobalPower}
                className="flex items-center gap-2"
              >
                <Power className="w-4 h-4" />
                All {globalPower ? "On" : "Off"}
              </Button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">Global Brightness</span>
                  <span className="text-sm text-gray-600">
                    {globalBrightness}%
                  </span>
                </div>
                <Slider
                  value={[globalBrightness]}
                  onValueChange={setGlobalBrightness}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Effects and Palettes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Effects</label>
                <div className="flex gap-2">
                  <Select
                    value={selectedEffect}
                    onValueChange={setSelectedEffect}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select effect" />
                    </SelectTrigger>
                    <SelectContent>
                      {effectsPalettes.effects.map((effect, index) => (
                        <SelectItem key={index} value={effect}>
                          {effect}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={applyGlobalEffect}
                    disabled={!selectedEffect}
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Palettes</label>
                <div className="flex gap-2">
                  <Select
                    value={selectedPalette}
                    onValueChange={setSelectedPalette}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select palette" />
                    </SelectTrigger>
                    <SelectContent>
                      {effectsPalettes.palettes.map((palette, index) => (
                        <SelectItem key={index} value={palette}>
                          {palette}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={applyGlobalPalette}
                    disabled={!selectedPalette}
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Device Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <DeviceControl
            key={device.id}
            device={device}
            onDeviceUpdate={handleDeviceUpdate}
            isGlobalLoading={isGlobalLoading}
          />
        ))}
      </div>
    </div>
  );
}
