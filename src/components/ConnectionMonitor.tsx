"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { httpClient } from "@/lib/api/HttpClient";
import { deviceConnectionManager } from "@/lib/api/DeviceConnectionManager";
import { wledCache } from "@/lib/cache/WledCache";
import { Activity, Wifi } from "lucide-react";

export default function ConnectionMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [queueStats, setQueueStats] = useState<any>({});
  const [cacheInfo, setCacheInfo] = useState<any>({});

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setStats(httpClient.getStats());
      setQueueStats(deviceConnectionManager.getQueueStats());
      setCacheInfo(wledCache.getCacheInfo());
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          <Activity className="w-4 h-4 mr-2" />
          Monitor
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 w-80">
      <Card className="bg-white bg-opacity-95 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wifi className="w-4 h-4" />
              Connection Monitor
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* HTTP Client Stats */}
          <div>
            <div className="font-semibold text-gray-700 mb-1">HTTP Client</div>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>Active Devices: {stats.activeDevices || 0}</div>
              <div>Environment: {stats.environment || "unknown"}</div>
            </div>
            {stats.lastUsed && stats.lastUsed.length > 0 && (
              <div className="mt-1">
                <div className="text-gray-500 text-xs">Recent Activity:</div>
                {stats.lastUsed.slice(0, 3).map((device: any) => (
                  <div key={device.ip} className="text-xs text-gray-600">
                    {device.ip}: {Math.round(device.timeSince / 1000)}s ago
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Queue Stats */}
          <div>
            <div className="font-semibold text-gray-700 mb-1">
              Request Queues
            </div>
            {Object.keys(queueStats).length === 0 ? (
              <div className="text-gray-500">No active queues</div>
            ) : (
              Object.entries(queueStats).map(([ip, stats]: [string, any]) => (
                <div key={ip} className="text-gray-600 mb-1">
                  <div className="font-medium">{ip}:</div>
                  <div className="ml-2 grid grid-cols-2 gap-1 text-xs">
                    <div>Queue: {stats.queueLength}</div>
                    <div>Processing: {stats.processing ? "Yes" : "No"}</div>
                    <div className="col-span-2">
                      Last: {Math.round(stats.timeSinceLastRequest / 1000)}s ago
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cache Info */}
          <div>
            <div className="font-semibold text-gray-700 mb-1">WLED Cache</div>
            {cacheInfo.cached ? (
              <div className="text-xs text-gray-600">
                <div>Source: {cacheInfo.ip}</div>
                <div>Age: {cacheInfo.ageMinutes}m</div>
                <div>
                  Effects: {cacheInfo.effects}, Palettes: {cacheInfo.palettes}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    wledCache.clearCache();
                    setCacheInfo(wledCache.getCacheInfo());
                  }}
                  className="mt-1 text-xs h-6"
                >
                  Clear Cache
                </Button>
              </div>
            ) : (
              <div className="text-xs text-gray-500">No cached data</div>
            )}
          </div>

          {/* Performance Tips */}
          <div className="border-t pt-2">
            <div className="font-semibold text-gray-700 mb-1">Performance</div>
            <div className="text-xs text-gray-600">
              <div>• Connections are pooled and reused</div>
              <div>• Requests are queued per device (max 3)</div>
              <div>• 10s timeout per request</div>
              <div>• Keep-alive enabled</div>
              <div>• Fast ping endpoint available</div>
              <div>• Effects/palettes cached (30m TTL)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
