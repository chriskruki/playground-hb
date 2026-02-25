import { NextRequest, NextResponse } from "next/server";
import { WledClient } from "../../../../lib/api/WledClient";
import { httpClient } from "../../../../lib/api/HttpClient";

export async function GET(request: NextRequest, { params }: { params: Promise<{ ip: string }> }) {
  try {
    const { ip } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (!ip) {
      return NextResponse.json({ error: "IP address is required" }, { status: 400 });
    }

    const wledClient = new WledClient(`http://${ip}`);

    switch (action) {
      case "info":
        const info = await wledClient.getInfo();
        return NextResponse.json(info);

      case "state":
        const state = await wledClient.getState();
        return NextResponse.json(state);

      case "status":
        const status = await wledClient.getStatus();
        return NextResponse.json(status);

      case "effects":
        const effects = await wledClient.getEffects();
        return NextResponse.json({ effects });

      case "palettes":
        const palettes = await wledClient.getPalettes();
        return NextResponse.json({ palettes });

      // Get presets from WLED device
      case "presets":
        try {
          // WLED doesn't expose preset names/details via API
          // We can only work with preset slots (1-16 typically)
          // Return a basic preset structure for slots 1-16
          const presets: Record<string, { n: string }> = {};
          for (let i = 1; i <= 16; i++) {
            presets[i.toString()] = { n: `Preset ${i}` };
          }
          return NextResponse.json(presets);
        } catch (error) {
          console.error("Failed to get presets:", error);
          return NextResponse.json({ error: "Failed to get presets" }, { status: 500 });
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("WLED API request failed:", error);
    return NextResponse.json(
      {
        error: "Failed to communicate with WLED device",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ ip: string }> }) {
  try {
    const { ip } = await params;
    const body = await request.json();
    const { action, ...data } = body;

    if (!ip) {
      return NextResponse.json({ error: "IP address is required" }, { status: 400 });
    }

    const wledClient = new WledClient(`http://${ip}`);

    switch (action) {
      case "setState":
        const newState = await wledClient.setState(data);
        return NextResponse.json(newState);

      case "setOn":
        const onState = await wledClient.setOn(data.on);
        return NextResponse.json(onState);

      case "setBrightness":
        const brightnessState = await wledClient.setBrightness(data.brightness);
        return NextResponse.json(brightnessState);

      case "setEffect":
        const effectState = await wledClient.setEffect(data.effectId, data.segmentId);
        return NextResponse.json(effectState);

      case "setColor":
        const colorState = await wledClient.setColor(data.r, data.g, data.b, data.segmentId);
        return NextResponse.json(colorState);

      // Set preset by ID
      case "setPreset":
        try {
          const result = await httpClient.post(`http://${ip}/json/state`, {
            ps: data.presetId,
          });
          return NextResponse.json(result);
        } catch (error) {
          console.error("Failed to set preset:", error);
          return NextResponse.json({ error: "Failed to set preset" }, { status: 500 });
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("WLED control request failed:", error);
    return NextResponse.json(
      {
        error: "Failed to control WLED device",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
