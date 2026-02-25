"use client";

import React from "react";
import { Button } from "./ui/button";
import { useLog } from "../contexts/LogContext";
import { Terminal, Dot } from "lucide-react";

export default function LogToggle() {
  const { toggleModal, logs } = useLog();

  // Count active/in-progress requests
  const activeCount = logs.filter((log) => log.status === "dispatched" || log.status === "in_progress").length;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={toggleModal}
        className="relative shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        <Terminal className="w-5 h-5 mr-2" />
        Log
        {activeCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {activeCount}
          </div>
        )}
        {logs.length > 0 && activeCount === 0 && <Dot className="absolute -top-1 -right-1 text-green-500 w-4 h-4" />}
      </Button>
    </div>
  );
}
