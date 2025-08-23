import { NextRequest, NextResponse } from 'next/server';
import { WledClient } from '@/lib/api/WledClient';

export async function POST(request: NextRequest) {
  try {
    const { ip } = await request.json();
    
    if (!ip) {
      return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
    }

    // Create WLED client with the provided IP
    const wledClient = new WledClient(`http://${ip}`);
    
    // Attempt to ping the device
    const isOnline = await wledClient.ping();
    
    return NextResponse.json({ 
      success: isOnline,
      ip: ip,
      message: isOnline ? 'WLED device is online' : 'WLED device is offline or unreachable'
    });
    
  } catch (error) {
    console.error('Ping request failed:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to ping device',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
