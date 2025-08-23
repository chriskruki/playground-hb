import { httpClient } from "./HttpClient";

interface QueuedRequest {
  id: string;
  url: string;
  options: RequestInit;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

interface DeviceQueue {
  requests: QueuedRequest[];
  processing: boolean;
  lastRequest: number;
}

/**
 * Device Connection Manager - Batches and optimizes requests to WLED devices
 */
class DeviceConnectionManager {
  private static instance: DeviceConnectionManager;
  private deviceQueues: Map<string, DeviceQueue> = new Map();
  private readonly BATCH_DELAY = 25; // 25ms delay for batching (reduced for better performance)
  private readonly MAX_CONCURRENT_PER_DEVICE = 3; // Increased to 3 concurrent requests

  private constructor() {}

  static getInstance(): DeviceConnectionManager {
    if (!DeviceConnectionManager.instance) {
      DeviceConnectionManager.instance = new DeviceConnectionManager();
    }
    return DeviceConnectionManager.instance;
  }

  /**
   * Queue a request to a device with intelligent batching
   */
  async queueRequest<T>(
    ip: string,
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const request: QueuedRequest = {
        id: requestId,
        url,
        options,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      // Get or create device queue
      if (!this.deviceQueues.has(ip)) {
        this.deviceQueues.set(ip, {
          requests: [],
          processing: false,
          lastRequest: 0,
        });
      }

      const queue = this.deviceQueues.get(ip)!;
      queue.requests.push(request);

      // Process queue if not already processing
      if (!queue.processing) {
        this.processDeviceQueue(ip);
      }
    });
  }

  private async processDeviceQueue(ip: string) {
    const queue = this.deviceQueues.get(ip);
    if (!queue || queue.processing) return;

    queue.processing = true;

    try {
      while (queue.requests.length > 0) {
        // Take up to MAX_CONCURRENT_PER_DEVICE requests
        const batch = queue.requests.splice(0, this.MAX_CONCURRENT_PER_DEVICE);

        // Process batch concurrently
        const promises = batch.map(async (request) => {
          try {
            const result = await httpClient.request(
              request.url,
              request.options
            );
            request.resolve(result);
          } catch (error) {
            request.reject(
              error instanceof Error ? error : new Error(String(error))
            );
          }
        });

        await Promise.all(promises);

        // Small delay between batches to prevent overwhelming the device
        if (queue.requests.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.BATCH_DELAY));
        }
      }
    } finally {
      queue.processing = false;
      queue.lastRequest = Date.now();
    }
  }

  /**
   * Get queue statistics for monitoring
   */
  getQueueStats() {
    const stats: Record<string, any> = {};

    for (const [ip, queue] of this.deviceQueues.entries()) {
      stats[ip] = {
        queueLength: queue.requests.length,
        processing: queue.processing,
        lastRequest: queue.lastRequest,
        timeSinceLastRequest: Date.now() - queue.lastRequest,
      };
    }

    return stats;
  }

  /**
   * Clear old queues for cleanup
   */
  cleanup() {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [ip, queue] of this.deviceQueues.entries()) {
      if (
        queue.requests.length === 0 &&
        !queue.processing &&
        now - queue.lastRequest > staleThreshold
      ) {
        this.deviceQueues.delete(ip);
      }
    }
  }
}

// Export singleton instance
export const deviceConnectionManager = DeviceConnectionManager.getInstance();

// Cleanup old queues periodically
setInterval(() => {
  deviceConnectionManager.cleanup();
}, 60000); // Every minute
