import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'wled-settings.json');

interface WledDevice {
  id: string;
  name: string;
  ip: string;
  status?: 'online' | 'offline' | 'checking';
}

interface Settings {
  devices: WledDevice[];
}

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(SETTINGS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load settings from JSON file
async function loadSettings(): Promise<Settings> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, return default settings
    return { devices: [] };
  }
}

// Save settings to JSON file
async function saveSettings(settings: Settings): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// GET - Load all WLED devices
export async function GET() {
  try {
    const settings = await loadSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to load settings:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

// POST - Add a new WLED device
export async function POST(request: NextRequest) {
  try {
    const { device } = await request.json();
    
    if (!device || !device.name || !device.ip) {
      return NextResponse.json({ error: 'Invalid device data' }, { status: 400 });
    }

    const settings = await loadSettings();
    
    // Check if device with same IP already exists
    const existingDevice = settings.devices.find(d => d.ip === device.ip);
    if (existingDevice) {
      return NextResponse.json({ error: 'Device with this IP already exists' }, { status: 409 });
    }

    settings.devices.push(device);
    await saveSettings(settings);

    return NextResponse.json({ success: true, device });
  } catch (error) {
    console.error('Failed to add device:', error);
    return NextResponse.json({ error: 'Failed to add device' }, { status: 500 });
  }
}

// DELETE - Remove a WLED device
export async function DELETE(request: NextRequest) {
  try {
    const { deviceId } = await request.json();
    
    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
    }

    const settings = await loadSettings();
    const deviceIndex = settings.devices.findIndex(d => d.id === deviceId);
    
    if (deviceIndex === -1) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    settings.devices.splice(deviceIndex, 1);
    await saveSettings(settings);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete device:', error);
    return NextResponse.json({ error: 'Failed to delete device' }, { status: 500 });
  }
}

// PUT - Update a WLED device
export async function PUT(request: NextRequest) {
  try {
    const { device } = await request.json();
    
    if (!device || !device.id) {
      return NextResponse.json({ error: 'Invalid device data' }, { status: 400 });
    }

    const settings = await loadSettings();
    const deviceIndex = settings.devices.findIndex(d => d.id === device.id);
    
    if (deviceIndex === -1) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    settings.devices[deviceIndex] = { ...settings.devices[deviceIndex], ...device };
    await saveSettings(settings);

    return NextResponse.json({ success: true, device: settings.devices[deviceIndex] });
  } catch (error) {
    console.error('Failed to update device:', error);
    return NextResponse.json({ error: 'Failed to update device' }, { status: 500 });
  }
}
