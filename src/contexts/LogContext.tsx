"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface LogEntry {
  id: string;
  timestamp: Date;
  device: string;
  command: string;
  description: string;
  status: "dispatched" | "in_progress" | "success" | "error";
  details?: string;
}

interface LogContextType {
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, "id" | "timestamp">) => string;
  updateLogStatus: (
    id: string,
    status: LogEntry["status"],
    details?: string
  ) => void;
  clearLogs: () => void;
  isModalOpen: boolean;
  toggleModal: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "timestamp">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newEntry: LogEntry = {
      ...entry,
      id,
      timestamp: new Date(),
    };

    setLogs((prev) => [newEntry, ...prev].slice(0, 100)); // Keep last 100 entries
    return id;
  }, []);

  const updateLogStatus = useCallback(
    (id: string, status: LogEntry["status"], details?: string) => {
      setLogs((prev) =>
        prev.map((log) => (log.id === id ? { ...log, status, details } : log))
      );
    },
    []
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleModal = useCallback(() => {
    setIsModalOpen((prev) => !prev);
  }, []);

  return (
    <LogContext.Provider
      value={{
        logs,
        addLog,
        updateLogStatus,
        clearLogs,
        isModalOpen,
        toggleModal,
      }}
    >
      {children}
    </LogContext.Provider>
  );
}

export function useLog() {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error("useLog must be used within a LogProvider");
  }
  return context;
}
