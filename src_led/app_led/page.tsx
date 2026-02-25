"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Link from "next/link";
import WledControl from "../components/WledControl";
import { useLoggedApi } from "../hooks/useLoggedApi";

interface WledDevice {
  id: string;
  name: string;
  ip: string;
  status?: "online" | "offline" | "checking";
}

export default function Home() {
  const [devices, setDevices] = useState<WledDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const { makeRequest } = useLoggedApi();

  const pingAllDevices = useCallback(
    async (devicesList: WledDevice[]) => {
      // Set all devices to checking status
      setDevices((prev) => prev.map((d) => ({ ...d, status: "checking" as const })));

      // Ping all devices in parallel
      const pingPromises = devicesList.map(async (device) => {
        try {
          return await makeRequest(
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
              const status: "online" | "offline" = result.success ? "online" : "offline";

              return { ...device, status };
            },
            {
              device: device.name,
              command: "ping",
              description: `Check connectivity for ${device.name} (${device.ip})`,
            },
          );
        } catch (error) {
          console.error(`Ping failed for ${device.name}:`, error);
          return { ...device, status: "offline" as const };
        }
      });

      // Wait for all pings to complete and update devices
      try {
        const updatedDevices = await Promise.all(pingPromises);
        setDevices(updatedDevices);
      } catch (error) {
        console.error("Failed to ping devices:", error);
      }
    },
    [makeRequest],
  );

  const loadDevices = useCallback(async () => {
    try {
      const response = await fetch("/api/settings/wled");
      if (response.ok) {
        const data = await response.json();
        const loadedDevices = data.devices || [];
        setDevices(loadedDevices);

        // Auto-ping all devices to update their status
        if (loadedDevices.length > 0) {
          pingAllDevices(loadedDevices);
        }
      }
    } catch (error) {
      console.error("Failed to load devices:", error);
    } finally {
      setLoading(false);
    }
  }, [pingAllDevices]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleDevicesUpdate = (updatedDevices: WledDevice[]) => {
    setDevices(updatedDevices);
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Minigolf Control Hub</h1>
          <Link href="/settings">
            <Button variant="outline">Settings</Button>
          </Link>
        </div>

        {/* WLED Controls */}
        {devices.length === 0 ? (
          <Card className="bg-slate-100">
            <CardContent className="p-8 text-center">
              <div className="text-gray-600 mb-4">No WLED devices configured</div>
              <Link href="/settings">
                <Button>Configure WLED Devices</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <WledControl devices={devices} onDevicesUpdate={handleDevicesUpdate} />
        )}
      </div>
    </div>
  );
}
