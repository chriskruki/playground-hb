"use client";

import { useCallback } from "react";
import { useLog } from "@/contexts/LogContext";

interface LoggedApiOptions {
  device: string;
  command: string;
  description: string;
}

export function useLoggedApi() {
  const { addLog, updateLogStatus } = useLog();

  const makeRequest = useCallback(
    async <T>(
      requestFn: () => Promise<T>,
      options: LoggedApiOptions
    ): Promise<T> => {
      const logId = addLog({
        device: options.device,
        command: options.command,
        description: options.description,
        status: "dispatched",
      });

      try {
        updateLogStatus(logId, "in_progress");
        const result = await requestFn();
        updateLogStatus(logId, "success");
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        updateLogStatus(logId, "error", errorMessage);
        throw error;
      }
    },
    [addLog, updateLogStatus]
  );

  const makeGlobalRequest = useCallback(
    async <T>(
      requestFn: () => Promise<T>,
      options: Omit<LoggedApiOptions, "device">
    ): Promise<T> => {
      return makeRequest(requestFn, { ...options, device: "Global" });
    },
    [makeRequest]
  );

  return { makeRequest, makeGlobalRequest };
}
