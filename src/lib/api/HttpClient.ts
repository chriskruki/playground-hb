/**
 * Optimized HTTP client with connection pooling and timeout handling
 * Works in both Node.js and browser environments
 */
class OptimizedHttpClient {
  private static instance: OptimizedHttpClient;
  private deviceClients: Map<string, { lastUsed: number }> = new Map();

  // Configuration
  private readonly TIMEOUT = 10000; // 10 second timeout for WLED devices
  private readonly isNode = typeof window === "undefined";

  private constructor() {
    // Clean up old connections periodically
    setInterval(() => {
      this.cleanupConnections();
    }, 60000); // Every minute
  }

  static getInstance(): OptimizedHttpClient {
    if (!OptimizedHttpClient.instance) {
      OptimizedHttpClient.instance = new OptimizedHttpClient();
    }
    return OptimizedHttpClient.instance;
  }

  private cleanupConnections() {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [ip, client] of this.deviceClients.entries()) {
      if (now - client.lastUsed > staleThreshold) {
        this.deviceClients.delete(ip);
      }
    }
  }

  /**
   * Make optimized HTTP request with connection reuse and timeout
   */
  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    // Extract IP from URL for tracking
    const urlObj = new URL(url);
    const ip = urlObj.hostname;

    // Track device usage
    this.deviceClients.set(ip, { lastUsed: Date.now() });

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

    try {
      // Optimize headers for connection reuse
      const optimizedHeaders = {
        Connection: "keep-alive",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        ...options.headers,
      };

      // Add Node.js specific optimizations
      const fetchOptions: RequestInit = {
        ...options,
        signal: controller.signal,
        headers: optimizedHeaders,
      };

      // In Node.js environment, we can add keep-alive agent
      if (this.isNode && typeof require !== "undefined") {
        try {
          const { Agent } = require("http");
          const { Agent: HttpsAgent } = require("https");

          const isHttps = url.startsWith("https:");
          const AgentClass = isHttps ? HttpsAgent : Agent;

          // @ts-ignore - Dynamic import for Node.js
          fetchOptions.agent = new AgentClass({
            keepAlive: true,
            keepAliveMsecs: 30000,
            maxSockets: 5,
            maxFreeSockets: 2,
            timeout: this.TIMEOUT,
          });
        } catch (e) {
          // Fallback if agent setup fails
          console.warn("Failed to setup HTTP agent:", e);
        }
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.TIMEOUT}ms`);
      }

      throw error;
    }
  }

  /**
   * GET request with connection pooling
   */
  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(url, {
      method: "GET",
      headers,
    });
  }

  /**
   * POST request with connection pooling
   */
  async post<T>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Get connection stats for monitoring
   */
  getStats() {
    return {
      activeDevices: this.deviceClients.size,
      environment: this.isNode ? "node" : "browser",
      lastUsed: Array.from(this.deviceClients.entries()).map(([ip, data]) => ({
        ip,
        lastUsed: data.lastUsed,
        timeSince: Date.now() - data.lastUsed,
      })),
    };
  }

  /**
   * Cleanup all connections (for graceful shutdown)
   */
  destroy() {
    this.deviceClients.clear();
  }
}

// Export singleton instance
export const httpClient = OptimizedHttpClient.getInstance();
