"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { createApiClients, testAllConnections } from "../lib/api";

interface ConnectionResult {
  service: string;
  success: boolean;
  error?: any;
}

export function ApiTestDemo() {
  const [connectionResults, setConnectionResults] = useState<ConnectionResult[]>([]);
  const [isTestingConnections, setIsTestingConnections] = useState(false);
  const [wledInfo, setWledInfo] = useState<any>(null);
  const [hassInfo, setHassInfo] = useState<any>(null);
  const [ledfxInfo, setLedfxInfo] = useState<any>(null);

  const clients = createApiClients();

  const handleTestConnections = async () => {
    setIsTestingConnections(true);
    try {
      const results = await testAllConnections();
      setConnectionResults(results);
    } catch (error) {
      console.error("Error testing connections:", error);
    } finally {
      setIsTestingConnections(false);
    }
  };

  const handleGetWledInfo = async () => {
    try {
      const info = await clients.wled.getInfo();
      setWledInfo(info);
    } catch (error) {
      console.error("Error getting WLED info:", error);
      setWledInfo({ error: error.message });
    }
  };

  const handleGetHassInfo = async () => {
    try {
      const config = await clients.homeAssistant.getConfig();
      setHassInfo(config);
    } catch (error) {
      console.error("Error getting Home Assistant info:", error);
      setHassInfo({ error: error.message });
    }
  };

  const handleGetLedfxInfo = async () => {
    try {
      const info = await clients.ledfx.getInfo();
      setLedfxInfo(info);
    } catch (error) {
      console.error("Error getting LEDfx info:", error);
      setLedfxInfo({ error: error.message });
    }
  };

  const handleWledToggle = async () => {
    try {
      const currentState = await clients.wled.getState();
      await clients.wled.setOn(!currentState.on);
      console.log("WLED toggled successfully");
    } catch (error) {
      console.error("Error toggling WLED:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
          <CardDescription>Test connectivity to all configured API endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTestConnections} disabled={isTestingConnections} className="w-full">
            {isTestingConnections ? "Testing Connections..." : "Test All Connections"}
          </Button>

          {connectionResults.length > 0 && (
            <div className="space-y-2">
              {connectionResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border ${
                    result.success
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.service}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {result.success ? "Connected" : "Failed"}
                    </span>
                  </div>
                  {result.error && (
                    <p className="text-sm mt-1 opacity-80">Error: {result.error.message || result.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>WLED</CardTitle>
            <CardDescription>LED strip controller</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={handleGetWledInfo} variant="outline" size="sm">
              Get Info
            </Button>
            <Button onClick={handleWledToggle} variant="outline" size="sm">
              Toggle On/Off
            </Button>
            {wledInfo && (
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(wledInfo, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Home Assistant</CardTitle>
            <CardDescription>Home automation hub</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={handleGetHassInfo} variant="outline" size="sm">
              Get Config
            </Button>
            {hassInfo && (
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(hassInfo, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LEDfx</CardTitle>
            <CardDescription>Real-time LED effects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={handleGetLedfxInfo} variant="outline" size="sm">
              Get Info
            </Button>
            {ledfxInfo && (
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(ledfxInfo, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
