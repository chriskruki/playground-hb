"use client";

import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useLog, LogEntry } from "../contexts/LogContext";
import { X, Trash2, Terminal } from "lucide-react";

function StatusDot({ status }: { status: LogEntry["status"] }) {
  const getStatusStyles = () => {
    switch (status) {
      case "dispatched":
        return "bg-gray-400 animate-pulse";
      case "in_progress":
        return "bg-yellow-500 animate-pulse";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div
      className={`w-3 h-3 rounded-full ${getStatusStyles()}`}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  );
}

function LogEntryComponent({ log }: { log: LogEntry }) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getDeviceColor = (device: string) => {
    if (device === "Global") return "text-blue-700 font-semibold";
    return "text-gray-800";
  };

  return (
    <div className="flex items-center gap-2 py-2 px-3 hover:bg-white hover:bg-opacity-30 border-b border-gray-200 border-opacity-50">
      <StatusDot status={log.status} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-600 font-mono text-xs">{formatTime(log.timestamp)}</span>
          <span className={`font-medium text-xs ${getDeviceColor(log.device)}`}>{log.device}</span>
        </div>
        <div className="text-xs text-gray-700 mt-1 truncate" title={log.description}>
          {log.description}
        </div>
        {log.details && log.status === "error" && (
          <div className="text-xs text-red-700 mt-1 font-mono truncate" title={log.details}>
            {log.details}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LogModal() {
  const { logs, clearLogs, isModalOpen, toggleModal } = useLog();

  if (!isModalOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 w-96 max-h-[70vh]">
      <Card className="bg-white bg-opacity-50 backdrop-blur-md border border-gray-300 shadow-2xl flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Log
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearLogs} disabled={logs.length === 0}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={toggleModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-600">No commands logged yet</div>
          ) : (
            <div className="overflow-y-auto h-full max-h-[50vh]">
              {logs.map((log) => (
                <LogEntryComponent key={log.id} log={log} />
              ))}
            </div>
          )}
        </CardContent>

        <div className="flex-shrink-0 p-3 border-t bg-gray-50 bg-opacity-70">
          <div className="flex items-center gap-4 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <StatusDot status="dispatched" />
              <span>Dispatched</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="in_progress" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="success" />
              <span>Success</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="error" />
              <span>Error</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
