"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Wifi } from "lucide-react";
import { useLoggedApi } from "@/hooks/useLoggedApi";

interface WledDevice {
  id: string;
  name: string;
  ip: string;
  status?: "online" | "offline" | "checking";
}

export default function SettingsPage() {
  const [devices, setDevices] = useState<WledDevice[]>([]);
  const [newDevice, setNewDevice] = useState({ name: "", ip: "" });
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [loading, setLoading] = useState(true);
  const { makeRequest } = useLoggedApi();

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await fetch("/api/settings/wled");
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      }
    } catch (error) {
      console.error("Failed to load devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveDevice = async () => {
    if (!newDevice.name.trim() || !newDevice.ip.trim()) {
      alert("Please fill in both name and IP address");
      return;
    }

    const device: WledDevice = {
      id: Date.now().toString(),
      name: newDevice.name.trim(),
      ip: newDevice.ip.trim(),
      status: "offline",
    };

    try {
      await makeRequest(
        async () => {
          const response = await fetch("/api/settings/wled", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ device }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          setDevices((prev) => [...prev, device]);
          setNewDevice({ name: "", ip: "" });
          setIsAddingDevice(false);
          return result;
        },
        {
          device: "Settings",
          command: "addDevice",
          description: `Add device "${device.name}" (${device.ip})`,
        }
      );
    } catch (error) {
      console.error("Failed to save device:", error);
      alert("Failed to save device");
    }
  };

  const deleteDevice = async (deviceId: string) => {
    const deviceToDelete = devices.find((d) => d.id === deviceId);

    try {
      await makeRequest(
        async () => {
          const response = await fetch("/api/settings/wled", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceId }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          setDevices((prev) => prev.filter((d) => d.id !== deviceId));
          return result;
        },
        {
          device: "Settings",
          command: "deleteDevice",
          description: `Delete device "${deviceToDelete?.name || deviceId}"`,
        }
      );
    } catch (error) {
      console.error("Failed to delete device:", error);
      alert("Failed to delete device");
    }
  };

  const pingDevice = async (device: WledDevice) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === device.id ? { ...d, status: "checking" } : d))
    );

    try {
      await makeRequest(
        async () => {
          const response = await fetch("/api/wled/ping-fast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: device.ip }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          const status = result.success ? "online" : "offline";

          setDevices((prev) =>
            prev.map((d) => (d.id === device.id ? { ...d, status } : d))
          );

          return result;
        },
        {
          device: device.name,
          command: "ping",
          description: `Test connectivity for ${device.name} (${device.ip})`,
        }
      );
    } catch (error) {
      console.error("Ping failed:", error);
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? { ...d, status: "offline" } : d))
      );
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "text-green-600";
      case "offline":
        return "text-red-600";
      case "checking":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      case "checking":
        return "Checking...";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* WLED Devices Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>WLED Devices</CardTitle>
              <Button
                onClick={() => setIsAddingDevice(true)}
                disabled={isAddingDevice}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Device Form */}
            {isAddingDevice && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-3">Add New WLED Device</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="IP address (e.g., 192.168.1.100)"
                    value={newDevice.ip}
                    onChange={(e) =>
                      setNewDevice((prev) => ({ ...prev, ip: e.target.value }))
                    }
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Device name (e.g., Hole 1)"
                    value={newDevice.name}
                    onChange={(e) =>
                      setNewDevice((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveDevice}>Save Device</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingDevice(false);
                      setNewDevice({ name: "", ip: "" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Devices Table */}
            {devices.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No WLED devices configured. Add one to get started!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        IP Address
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Status
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr key={device.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-mono">
                          {device.ip}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {device.name}
                        </td>
                        <td
                          className={`border border-gray-300 px-4 py-2 font-medium ${getStatusColor(
                            device.status
                          )}`}
                        >
                          {getStatusText(device.status)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => pingDevice(device)}
                              disabled={device.status === "checking"}
                            >
                              <Wifi className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteDevice(device.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
