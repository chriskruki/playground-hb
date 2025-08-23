import { NextRequest, NextResponse } from "next/server";
import { httpClient } from "@/lib/api/HttpClient";

export async function POST(request: NextRequest) {
  try {
    const { ip } = await request.json();

    if (!ip) {
      return NextResponse.json(
        { error: "IP address is required" },
        { status: 400 }
      );
    }

    // Use a lighter endpoint for faster ping - just check if device responds
    try {
      // Try the lightest possible endpoint first - just a basic HTTP request
      const startTime = Date.now();
      await httpClient.get(`http://${ip}/json/info`);
      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        ip: ip,
        responseTime: responseTime,
        message: `WLED device responded in ${responseTime}ms`,
      });
    } catch (error) {
      console.error("Fast ping failed:", error);
      return NextResponse.json({
        success: false,
        ip: ip,
        error: "Device unreachable or timeout",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Ping request failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process ping request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
